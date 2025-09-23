-- Location: supabase/migrations/20250923040000_fix_dashboard_rls_comprehensive.sql
-- Schema Analysis: Existing fitness app with habits, goals, achievements, profiles tables
-- Integration Type: Fix RLS policies and enhance dashboard functionality  
-- Dependencies: profiles, achievements, user_achievements, habits, goals

-- Fix RLS policies for achievements table to allow authenticated users to read achievements
DROP POLICY IF EXISTS "authenticated_users_can_view_achievements" ON public.achievements;

-- Allow all authenticated users to read achievements (public reference data)
CREATE POLICY "authenticated_users_can_view_achievements"
ON public.achievements
FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to read other users' basic profile info (needed for dashboard stats)
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "authenticated_users_can_view_basic_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Keep existing policies for profile management
CREATE POLICY "users_manage_own_profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Enhance user achievements access
DROP POLICY IF EXISTS "users_manage_own_user_achievements" ON public.user_achievements;

CREATE POLICY "users_manage_own_user_achievements"
ON public.user_achievements
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to view achievements joined with user achievements
CREATE POLICY "authenticated_users_can_view_user_achievements"
ON public.user_achievements  
FOR SELECT
TO authenticated
USING (true);

-- Add helpful functions for better habit and goal management
CREATE OR REPLACE FUNCTION public.get_user_habit_stats(target_user_id UUID)
RETURNS TABLE(
    total_habits INTEGER,
    active_habits INTEGER,
    completed_today INTEGER,
    current_longest_streak INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    COUNT(*)::INTEGER as total_habits,
    COUNT(*)::INTEGER as active_habits,
    COALESCE(
        (SELECT COUNT(*)::INTEGER 
         FROM public.habit_completions hc 
         WHERE hc.user_id = target_user_id 
         AND hc.completed_date = CURRENT_DATE), 
        0
    ) as completed_today,
    COALESCE(
        (SELECT MAX(streak_length)::INTEGER 
         FROM (
             SELECT 
                 COUNT(*) as streak_length
             FROM public.habit_completions hc2
             WHERE hc2.user_id = target_user_id
             GROUP BY hc2.habit_id
         ) streaks),
        0
    ) as current_longest_streak
FROM public.habits h 
WHERE h.user_id = target_user_id;
$$;

-- Add function to get user goal progress
CREATE OR REPLACE FUNCTION public.get_user_goal_stats(target_user_id UUID)
RETURNS TABLE(
    total_goals INTEGER,
    completed_goals INTEGER,
    in_progress_goals INTEGER,
    average_progress DECIMAL
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    COUNT(*)::INTEGER as total_goals,
    COUNT(CASE WHEN g.progress >= 100 THEN 1 END)::INTEGER as completed_goals,
    COUNT(CASE WHEN g.progress > 0 AND g.progress < 100 THEN 1 END)::INTEGER as in_progress_goals,
    COALESCE(AVG(g.progress), 0)::DECIMAL as average_progress
FROM public.goals g 
WHERE g.user_id = target_user_id;
$$;

-- Improve habit completion tracking with streak calculation
CREATE OR REPLACE FUNCTION public.calculate_habit_streak(habit_uuid UUID, target_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
WITH RECURSIVE streak_calc AS (
    -- Base case: find the most recent completion
    SELECT 
        completed_date,
        1 as streak_length
    FROM public.habit_completions 
    WHERE habit_id = habit_uuid 
    AND user_id = target_user_id
    AND completed_date <= CURRENT_DATE
    ORDER BY completed_date DESC 
    LIMIT 1
    
    UNION ALL
    
    -- Recursive case: find consecutive days
    SELECT 
        hc.completed_date,
        sc.streak_length + 1
    FROM public.habit_completions hc
    INNER JOIN streak_calc sc ON hc.completed_date = sc.completed_date - INTERVAL '1 day'
    WHERE hc.habit_id = habit_uuid 
    AND hc.user_id = target_user_id
)
SELECT COALESCE(MAX(streak_length), 0)::INTEGER
FROM streak_calc;
$$;

-- Function to award achievements automatically
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    habit_count INTEGER;
    goal_count INTEGER;
    photo_count INTEGER;
BEGIN
    -- Get current user stats
    SELECT COUNT(*) INTO habit_count FROM public.habits WHERE user_id = target_user_id;
    SELECT COUNT(*) INTO goal_count FROM public.goals WHERE user_id = target_user_id;
    SELECT COUNT(*) INTO photo_count FROM public.media_files WHERE user_id = target_user_id AND status = 'active';
    
    -- Award "First Steps" achievement for creating first habit
    IF habit_count >= 1 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id)
        SELECT target_user_id, a.id
        FROM public.achievements a
        WHERE a.name = 'First Steps'
        AND NOT EXISTS (
            SELECT 1 FROM public.user_achievements ua 
            WHERE ua.user_id = target_user_id AND ua.achievement_id = a.id
        );
    END IF;
    
    -- Award "Photo Ready" achievement for uploading first photo  
    IF photo_count >= 1 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id)
        SELECT target_user_id, a.id
        FROM public.achievements a
        WHERE a.name = 'Photo Ready'
        AND NOT EXISTS (
            SELECT 1 FROM public.user_achievements ua 
            WHERE ua.user_id = target_user_id AND ua.achievement_id = a.id
        );
    END IF;
    
    -- Update user points based on achievements
    UPDATE public.profiles 
    SET points = (
        SELECT COALESCE(SUM(a.points), 0)
        FROM public.user_achievements ua
        JOIN public.achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = target_user_id
    )
    WHERE id = target_user_id;
    
END;
$$;

-- Trigger to automatically award achievements when habits/goals/photos are created
CREATE OR REPLACE FUNCTION public.trigger_achievement_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Call achievement check for the user
    PERFORM public.check_and_award_achievements(NEW.user_id);
    RETURN NEW;
END;
$$;

-- Add triggers for automatic achievement awarding
DROP TRIGGER IF EXISTS trigger_habit_achievement ON public.habits;
CREATE TRIGGER trigger_habit_achievement
    AFTER INSERT ON public.habits
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_achievement_check();

DROP TRIGGER IF EXISTS trigger_goal_achievement ON public.goals;  
CREATE TRIGGER trigger_goal_achievement
    AFTER INSERT ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_achievement_check();

DROP TRIGGER IF EXISTS trigger_media_achievement ON public.media_files;
CREATE TRIGGER trigger_media_achievement
    AFTER INSERT ON public.media_files
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_achievement_check();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habit_completions_date_user 
ON public.habit_completions(user_id, completed_date DESC);

CREATE INDEX IF NOT EXISTS idx_goals_progress 
ON public.goals(user_id, progress);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_earned
ON public.user_achievements(user_id, earned_at DESC);

-- Clean up any inconsistent data and recalculate achievements for existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM public.profiles LOOP
        PERFORM public.check_and_award_achievements(user_record.id);
    END LOOP;
END $$;