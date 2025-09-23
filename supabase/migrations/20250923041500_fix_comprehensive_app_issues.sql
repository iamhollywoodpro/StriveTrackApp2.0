-- Schema Analysis: Existing fitness app with habits, goals, achievements, nutrition, media storage
-- Integration Type: Fix comprehensive app issues
-- Dependencies: profiles, habits, goals, achievements, user_achievements, nutrition_entries, media_files

-- Fix the SQL syntax error in the previous migration by creating a clean streak calculation function
CREATE OR REPLACE FUNCTION public.calculate_habit_streak_fixed(habit_uuid UUID, target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    current_streak INTEGER := 0;
    check_date DATE := CURRENT_DATE;
    has_completion BOOLEAN;
BEGIN
    -- Start from today and go backwards to count consecutive completions
    LOOP
        -- Check if habit was completed on this date
        SELECT EXISTS(
            SELECT 1 FROM public.habit_completions 
            WHERE habit_id = habit_uuid 
            AND user_id = target_user_id 
            AND completed_date = check_date
        ) INTO has_completion;
        
        -- If no completion found, break the streak
        IF NOT has_completion THEN
            EXIT;
        END IF;
        
        -- Increment streak and check previous day
        current_streak := current_streak + 1;
        check_date := check_date - INTERVAL '1 day';
    END LOOP;
    
    RETURN current_streak;
END;
$$;

-- Create improved function to get user habit stats
CREATE OR REPLACE FUNCTION public.get_user_habit_stats_improved(target_user_id UUID)
RETURNS TABLE(
    total_habits INTEGER,
    active_habits INTEGER,
    completed_today INTEGER,
    current_longest_streak INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    habit_record RECORD;
    max_streak INTEGER := 0;
    habit_streak INTEGER;
BEGIN
    -- Get basic habit counts
    SELECT 
        COUNT(*)::INTEGER,
        COUNT(*)::INTEGER,
        COALESCE((
            SELECT COUNT(*)::INTEGER 
            FROM public.habit_completions hc 
            WHERE hc.user_id = target_user_id 
            AND hc.completed_date = CURRENT_DATE
        ), 0)
    INTO total_habits, active_habits, completed_today
    FROM public.habits h 
    WHERE h.user_id = target_user_id;
    
    -- Calculate longest streak across all habits
    FOR habit_record IN 
        SELECT id FROM public.habits WHERE user_id = target_user_id
    LOOP
        SELECT public.calculate_habit_streak_fixed(habit_record.id, target_user_id) 
        INTO habit_streak;
        
        IF habit_streak > max_streak THEN
            max_streak := habit_streak;
        END IF;
    END LOOP;
    
    current_longest_streak := max_streak;
    
    RETURN QUERY 
    SELECT total_habits, active_habits, completed_today, current_longest_streak;
END;
$$;

-- Create improved function to get user goal stats
CREATE OR REPLACE FUNCTION public.get_user_goal_stats_improved(target_user_id UUID)
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

-- Enhanced achievement awarding function
CREATE OR REPLACE FUNCTION public.check_and_award_achievements_enhanced(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    habit_count INTEGER;
    goal_count INTEGER;
    photo_count INTEGER;
    completion_count INTEGER;
BEGIN
    -- Get current user stats
    SELECT COUNT(*) INTO habit_count FROM public.habits WHERE user_id = target_user_id;
    SELECT COUNT(*) INTO goal_count FROM public.goals WHERE user_id = target_user_id;
    SELECT COUNT(*) INTO photo_count FROM public.media_files WHERE user_id = target_user_id AND status = 'active';
    SELECT COUNT(*) INTO completion_count FROM public.habit_completions WHERE user_id = target_user_id;
    
    -- Award "First Steps" achievement for creating first habit
    IF habit_count >= 1 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id)
        SELECT target_user_id, a.id
        FROM public.achievements a
        WHERE a.name ILIKE '%first%' OR a.name ILIKE '%step%' OR a.name ILIKE '%habit%'
        AND NOT EXISTS (
            SELECT 1 FROM public.user_achievements ua 
            WHERE ua.user_id = target_user_id AND ua.achievement_id = a.id
        )
        LIMIT 1;
    END IF;
    
    -- Award photo achievement for uploading first photo  
    IF photo_count >= 1 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id)
        SELECT target_user_id, a.id
        FROM public.achievements a
        WHERE a.name ILIKE '%photo%' OR a.name ILIKE '%picture%'
        AND NOT EXISTS (
            SELECT 1 FROM public.user_achievements ua 
            WHERE ua.user_id = target_user_id AND ua.achievement_id = a.id
        )
        LIMIT 1;
    END IF;
    
    -- Award completion achievement for first habit completion
    IF completion_count >= 1 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id)
        SELECT target_user_id, a.id
        FROM public.achievements a
        WHERE a.name ILIKE '%complete%' OR a.name ILIKE '%done%'
        AND NOT EXISTS (
            SELECT 1 FROM public.user_achievements ua 
            WHERE ua.user_id = target_user_id AND ua.achievement_id = a.id
        )
        LIMIT 1;
    END IF;
    
    -- Update user points based on achievements (if profiles table has points column)
    UPDATE public.profiles 
    SET points = COALESCE((
        SELECT SUM(COALESCE(a.points, 10))
        FROM public.user_achievements ua
        JOIN public.achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = target_user_id
    ), 0)
    WHERE id = target_user_id
    AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'points'
        AND table_schema = 'public'
    );
    
END;
$$;

-- Create trigger function for automatic achievement awarding
CREATE OR REPLACE FUNCTION public.trigger_achievement_check_enhanced()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Call enhanced achievement check for the user
    PERFORM public.check_and_award_achievements_enhanced(NEW.user_id);
    RETURN NEW;
END;
$$;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS trigger_habit_achievement ON public.habits;
DROP TRIGGER IF EXISTS trigger_goal_achievement ON public.goals;  
DROP TRIGGER IF EXISTS trigger_media_achievement ON public.media_files;
DROP TRIGGER IF EXISTS trigger_habit_completion_achievement ON public.habit_completions;

-- Add enhanced triggers for automatic achievement awarding
CREATE TRIGGER trigger_habit_achievement_enhanced
    AFTER INSERT ON public.habits
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_achievement_check_enhanced();

CREATE TRIGGER trigger_goal_achievement_enhanced
    AFTER INSERT ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_achievement_check_enhanced();

CREATE TRIGGER trigger_media_achievement_enhanced
    AFTER INSERT ON public.media_files
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_achievement_check_enhanced();

CREATE TRIGGER trigger_habit_completion_achievement_enhanced
    AFTER INSERT ON public.habit_completions
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_achievement_check_enhanced();

-- Create function to update goal progress
CREATE OR REPLACE FUNCTION public.update_goal_progress(goal_uuid UUID, new_progress INTEGER, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate progress value
    IF new_progress < 0 OR new_progress > 100 THEN
        RETURN FALSE;
    END IF;
    
    -- Update the goal progress
    UPDATE public.goals 
    SET 
        progress = new_progress,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = goal_uuid 
    AND user_id = target_user_id;
    
    -- Check if update was successful
    IF FOUND THEN
        -- Award achievements if goal completed
        IF new_progress >= 100 THEN
            PERFORM public.check_and_award_achievements_enhanced(target_user_id);
        END IF;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habit_completions_date_user_optimized
ON public.habit_completions(user_id, completed_date DESC, habit_id);

CREATE INDEX IF NOT EXISTS idx_goals_progress_optimized
ON public.goals(user_id, progress DESC, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_earned_optimized
ON public.user_achievements(user_id, earned_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_files_user_status_optimized
ON public.media_files(user_id, status, uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_nutrition_entries_user_date_optimized
ON public.nutrition_entries(user_id, logged_date DESC, meal_type);

-- Clean up any inconsistent data and award achievements for existing users
DO $$
DECLARE
    user_record RECORD;
    error_count INTEGER := 0;
BEGIN
    -- Process users in batches to avoid timeouts
    FOR user_record IN 
        SELECT id FROM public.profiles 
        WHERE EXISTS (
            SELECT 1 FROM public.habits h WHERE h.user_id = profiles.id
            UNION
            SELECT 1 FROM public.goals g WHERE g.user_id = profiles.id
            UNION
            SELECT 1 FROM public.media_files m WHERE m.user_id = profiles.id
        )
        LIMIT 100
    LOOP
        BEGIN
            PERFORM public.check_and_award_achievements_enhanced(user_record.id);
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            -- Log error but continue processing
            RAISE NOTICE 'Error processing user %: %', user_record.id, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Processed users with % errors', error_count;
END $$;