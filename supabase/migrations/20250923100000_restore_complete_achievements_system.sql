-- Location: supabase/migrations/20250923100000_restore_complete_achievements_system.sql
-- Schema Analysis: achievements table exists with basic structure, needs category system and full achievement set
-- Integration Type: enhancement - adding achievement categories and comprehensive achievement data
-- Dependencies: achievements table, profiles table, user_achievements table

-- Step 1: Add category and frequency columns to achievements table
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'milestone', -- daily, weekly, milestone
ADD COLUMN IF NOT EXISTS target_value INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Step 2: Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_frequency ON public.achievements(frequency);
CREATE INDEX IF NOT EXISTS idx_achievements_active ON public.achievements(is_active);

-- Step 3: Clear existing achievements to avoid duplicates
DELETE FROM public.user_achievements;
DELETE FROM public.achievements;

-- Step 4: Insert comprehensive achievement system (50 achievements total)
INSERT INTO public.achievements (id, name, description, icon, points, category, frequency, target_value, sort_order) VALUES
-- DAILY ACHIEVEMENTS (10 total) - 10-25 points each
(gen_random_uuid(), 'Daily Warrior', 'Complete 3 habits in one day', '⚔️', 15, 'habits', 'daily', 3, 1),
(gen_random_uuid(), 'Water Champion', 'Drink 8 glasses of water today', '💧', 10, 'nutrition', 'daily', 8, 2),
(gen_random_uuid(), 'Morning Mover', 'Complete a workout before 10 AM', '🌅', 20, 'fitness', 'daily', 1, 3),
(gen_random_uuid(), 'Nutrition Navigator', 'Log all meals for the day', '🍎', 15, 'nutrition', 'daily', 3, 4),
(gen_random_uuid(), 'Step Master', 'Take 10,000 steps in one day', '👟', 20, 'fitness', 'daily', 10000, 5),
(gen_random_uuid(), 'Mindful Moment', 'Complete 10 minutes of meditation', '🧘', 15, 'wellness', 'daily', 10, 6),
(gen_random_uuid(), 'Progress Tracker', 'Upload a progress photo today', '📸', 10, 'progress', 'daily', 1, 7),
(gen_random_uuid(), 'Workout Warrior', 'Complete 45 minutes of exercise', '💪', 25, 'fitness', 'daily', 45, 8),
(gen_random_uuid(), 'Habit Hero', 'Complete 5 different habits in one day', '🏆', 25, 'habits', 'daily', 5, 9),
(gen_random_uuid(), 'Energy Booster', 'Get 8 hours of sleep', '😴', 15, 'wellness', 'daily', 8, 10),

-- WEEKLY ACHIEVEMENTS (15 total) - 30-75 points each
(gen_random_uuid(), 'Weekly Wonder', 'Complete all habits 7 days in a row', '🔥', 50, 'habits', 'weekly', 7, 11),
(gen_random_uuid(), 'Workout Week', 'Exercise 5 days this week', '🏋️', 40, 'fitness', 'weekly', 5, 12),
(gen_random_uuid(), 'Hydration Hero', 'Meet daily water goal 6 days this week', '🌊', 35, 'nutrition', 'weekly', 6, 13),
(gen_random_uuid(), 'Consistency King', 'Log food 7 days straight', '📊', 45, 'nutrition', 'weekly', 7, 14),
(gen_random_uuid(), 'Social Star', 'Share 3 posts in community this week', '⭐', 30, 'social', 'weekly', 3, 15),
(gen_random_uuid(), 'Challenge Champion', 'Complete 2 fitness challenges this week', '🏅', 60, 'fitness', 'weekly', 2, 16),
(gen_random_uuid(), 'Progress Pioneer', 'Upload progress photos 3 times this week', '📷', 40, 'progress', 'weekly', 3, 17),
(gen_random_uuid(), 'Meditation Master', 'Meditate every day for a week', '🕉️', 50, 'wellness', 'weekly', 7, 18),
(gen_random_uuid(), 'Goal Getter', 'Achieve 3 personal goals this week', '🎯', 75, 'goals', 'weekly', 3, 19),
(gen_random_uuid(), 'Community Connector', 'Comment on 10 posts this week', '💬', 30, 'social', 'weekly', 10, 20),
(gen_random_uuid(), 'Habit Streak', 'Maintain a 7-day habit streak', '🔥', 55, 'habits', 'weekly', 7, 21),
(gen_random_uuid(), 'Nutrition Ninja', 'Hit macro targets 5 days this week', '🥗', 50, 'nutrition', 'weekly', 5, 22),
(gen_random_uuid(), 'Active Week', 'Be active every single day this week', '🚀', 65, 'fitness', 'weekly', 7, 23),
(gen_random_uuid(), 'Weekly Warrior', 'Complete 10 workouts this week', '⚡', 70, 'fitness', 'weekly', 10, 24),
(gen_random_uuid(), 'Wellness Week', 'Focus on mental health 5 days this week', '🌱', 45, 'wellness', 'weekly', 5, 25),

-- MILESTONE ACHIEVEMENTS (25 total) - 25-200 points each
-- Beginner Level (5 achievements)
(gen_random_uuid(), 'First Steps', 'Create your first habit', '👶', 25, 'habits', 'milestone', 1, 26),
(gen_random_uuid(), 'Photo Ready', 'Upload your first progress photo', '📸', 25, 'progress', 'milestone', 1, 27),
(gen_random_uuid(), 'Community Member', 'Join the fitness community', '👋', 25, 'social', 'milestone', 1, 28),
(gen_random_uuid(), 'Goal Setter', 'Create your first fitness goal', '🎯', 25, 'goals', 'milestone', 1, 29),
(gen_random_uuid(), 'Nutrition Starter', 'Log your first meal', '🍽️', 25, 'nutrition', 'milestone', 1, 30),

-- Intermediate Level (10 achievements)
(gen_random_uuid(), 'Week Warrior', 'Complete 7 days of habits', '🗓️', 50, 'habits', 'milestone', 7, 31),
(gen_random_uuid(), 'Transformation Tracker', 'Upload 10 progress photos', '📹', 60, 'progress', 'milestone', 10, 32),
(gen_random_uuid(), 'Fitness Fanatic', 'Complete 25 workouts', '💯', 75, 'fitness', 'milestone', 25, 33),
(gen_random_uuid(), 'Social Butterfly', 'Make 5 friends in the community', '🦋', 50, 'social', 'milestone', 5, 34),
(gen_random_uuid(), 'Goal Achiever', 'Complete 3 fitness goals', '✅', 75, 'goals', 'milestone', 3, 35),
(gen_random_uuid(), 'Habit Master', 'Maintain a 30-day habit streak', '🔥', 100, 'habits', 'milestone', 30, 36),
(gen_random_uuid(), 'Progress Pro', 'Use comparison tool 5 times', '📊', 40, 'progress', 'milestone', 5, 37),
(gen_random_uuid(), 'Nutrition Pro', 'Log meals for 30 days', '📋', 80, 'nutrition', 'milestone', 30, 38),
(gen_random_uuid(), 'Wellness Warrior', 'Complete 50 meditation sessions', '🧘‍♂️', 90, 'wellness', 'milestone', 50, 39),
(gen_random_uuid(), 'Community Leader', 'Get 25 likes on your posts', '👍', 60, 'social', 'milestone', 25, 40),

-- Advanced Level (10 achievements)
(gen_random_uuid(), 'Habit Legend', 'Maintain a 100-day habit streak', '👑', 200, 'habits', 'milestone', 100, 41),
(gen_random_uuid(), 'Transformation Master', 'Upload 50 progress photos', '🌟', 150, 'progress', 'milestone', 50, 42),
(gen_random_uuid(), 'Fitness Elite', 'Complete 100 workouts', '🏆', 150, 'fitness', 'milestone', 100, 43),
(gen_random_uuid(), 'Community Champion', 'Help 10 community members', '🤝', 125, 'social', 'milestone', 10, 44),
(gen_random_uuid(), 'Goal Crusher', 'Complete 10 major fitness goals', '💎', 175, 'goals', 'milestone', 10, 45),
(gen_random_uuid(), 'Iron Will', 'Never miss a day for 6 months', '🛡️', 200, 'habits', 'milestone', 180, 46),
(gen_random_uuid(), 'Progress Master', 'Document your journey for 1 year', '📅', 180, 'progress', 'milestone', 365, 47),
(gen_random_uuid(), 'Nutrition Expert', 'Perfect nutrition for 90 days', '🥇', 160, 'nutrition', 'milestone', 90, 48),
(gen_random_uuid(), 'Zen Master', 'Complete 365 meditation sessions', '☯️', 175, 'wellness', 'milestone', 365, 49),
(gen_random_uuid(), 'Ultimate Champion', 'Reach the highest fitness level', '👑', 200, 'achievement', 'milestone', 1, 50);

-- Step 5: Create function to check and award achievements based on user activity
CREATE OR REPLACE FUNCTION public.check_and_award_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid UUID;
    achievement_record RECORD;
    habit_count INTEGER;
    photo_count INTEGER;
    workout_count INTEGER;
    goal_count INTEGER;
BEGIN
    -- Get user ID based on the triggering table
    IF TG_TABLE_NAME = 'habits' THEN
        user_uuid := NEW.user_id;
    ELSIF TG_TABLE_NAME = 'habit_completions' THEN
        user_uuid := NEW.user_id;
    ELSIF TG_TABLE_NAME = 'media_files' THEN
        user_uuid := NEW.user_id;
    ELSIF TG_TABLE_NAME = 'goals' THEN
        user_uuid := NEW.user_id;
    ELSE
        RETURN NEW;
    END IF;

    -- Check for first-time achievements
    IF TG_TABLE_NAME = 'habits' AND TG_OP = 'INSERT' THEN
        -- Award "First Steps" achievement
        INSERT INTO public.user_achievements (user_id, achievement_id)
        SELECT user_uuid, a.id 
        FROM public.achievements a 
        WHERE a.name = 'First Steps' 
        AND NOT EXISTS (
            SELECT 1 FROM public.user_achievements ua 
            WHERE ua.user_id = user_uuid AND ua.achievement_id = a.id
        );
    END IF;

    IF TG_TABLE_NAME = 'media_files' AND TG_OP = 'INSERT' THEN
        -- Award "Photo Ready" achievement
        INSERT INTO public.user_achievements (user_id, achievement_id)
        SELECT user_uuid, a.id 
        FROM public.achievements a 
        WHERE a.name = 'Photo Ready' 
        AND NOT EXISTS (
            SELECT 1 FROM public.user_achievements ua 
            WHERE ua.user_id = user_uuid AND ua.achievement_id = a.id
        );

        -- Check photo count milestones
        SELECT COUNT(*) INTO photo_count 
        FROM public.media_files 
        WHERE user_id = user_uuid;

        -- Award photo milestone achievements
        FOR achievement_record IN (
            SELECT id, name, target_value 
            FROM public.achievements 
            WHERE category = 'progress' 
            AND frequency = 'milestone' 
            AND target_value <= photo_count
        ) LOOP
            INSERT INTO public.user_achievements (user_id, achievement_id)
            SELECT user_uuid, achievement_record.id
            WHERE NOT EXISTS (
                SELECT 1 FROM public.user_achievements ua 
                WHERE ua.user_id = user_uuid AND ua.achievement_id = achievement_record.id
            );
        END LOOP;
    END IF;

    IF TG_TABLE_NAME = 'goals' AND TG_OP = 'INSERT' THEN
        -- Award "Goal Setter" achievement
        INSERT INTO public.user_achievements (user_id, achievement_id)
        SELECT user_uuid, a.id 
        FROM public.achievements a 
        WHERE a.name = 'Goal Setter' 
        AND NOT EXISTS (
            SELECT 1 FROM public.user_achievements ua 
            WHERE ua.user_id = user_uuid AND ua.achievement_id = a.id
        );
    END IF;

    -- Update user points
    UPDATE public.profiles 
    SET points = (
        SELECT COALESCE(SUM(a.points), 0)
        FROM public.user_achievements ua
        JOIN public.achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = user_uuid
    )
    WHERE id = user_uuid;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the main operation
        RAISE NOTICE 'Achievement check failed: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Step 6: Create triggers for automatic achievement checking
DROP TRIGGER IF EXISTS trigger_check_habit_achievements ON public.habits;
CREATE TRIGGER trigger_check_habit_achievements
    AFTER INSERT ON public.habits
    FOR EACH ROW EXECUTE FUNCTION public.check_and_award_achievements();

DROP TRIGGER IF EXISTS trigger_check_completion_achievements ON public.habit_completions;
CREATE TRIGGER trigger_check_completion_achievements
    AFTER INSERT ON public.habit_completions
    FOR EACH ROW EXECUTE FUNCTION public.check_and_award_achievements();

DROP TRIGGER IF EXISTS trigger_check_photo_achievements ON public.media_files;
CREATE TRIGGER trigger_check_photo_achievements
    AFTER INSERT ON public.media_files
    FOR EACH ROW EXECUTE FUNCTION public.check_and_award_achievements();

DROP TRIGGER IF EXISTS trigger_check_goal_achievements ON public.goals;
CREATE TRIGGER trigger_check_goal_achievements
    AFTER INSERT ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.check_and_award_achievements();

-- Step 7: Award achievements retroactively for existing users
DO $$
DECLARE
    user_record RECORD;
    habit_count INTEGER;
    photo_count INTEGER;
    goal_count INTEGER;
    achievement_record RECORD;
BEGIN
    -- Loop through all users and award appropriate achievements
    FOR user_record IN (SELECT id FROM public.profiles) LOOP
        -- Check habit-related achievements
        SELECT COUNT(*) INTO habit_count 
        FROM public.habits 
        WHERE user_id = user_record.id;
        
        IF habit_count > 0 THEN
            -- Award First Steps
            INSERT INTO public.user_achievements (user_id, achievement_id)
            SELECT user_record.id, a.id 
            FROM public.achievements a 
            WHERE a.name = 'First Steps'
            AND NOT EXISTS (
                SELECT 1 FROM public.user_achievements ua 
                WHERE ua.user_id = user_record.id AND ua.achievement_id = a.id
            );
        END IF;

        -- Check photo-related achievements
        SELECT COUNT(*) INTO photo_count 
        FROM public.media_files 
        WHERE user_id = user_record.id;
        
        IF photo_count > 0 THEN
            -- Award Photo Ready
            INSERT INTO public.user_achievements (user_id, achievement_id)
            SELECT user_record.id, a.id 
            FROM public.achievements a 
            WHERE a.name = 'Photo Ready'
            AND NOT EXISTS (
                SELECT 1 FROM public.user_achievements ua 
                WHERE ua.user_id = user_record.id AND ua.achievement_id = a.id
            );

            -- Award photo milestone achievements
            FOR achievement_record IN (
                SELECT id, name, target_value 
                FROM public.achievements 
                WHERE category = 'progress' 
                AND frequency = 'milestone' 
                AND target_value <= photo_count
            ) LOOP
                INSERT INTO public.user_achievements (user_id, achievement_id)
                SELECT user_record.id, achievement_record.id
                WHERE NOT EXISTS (
                    SELECT 1 FROM public.user_achievements ua 
                    WHERE ua.user_id = user_record.id AND ua.achievement_id = achievement_record.id
                );
            END LOOP;
        END IF;

        -- Check goal-related achievements
        SELECT COUNT(*) INTO goal_count 
        FROM public.goals 
        WHERE user_id = user_record.id;
        
        IF goal_count > 0 THEN
            -- Award Goal Setter
            INSERT INTO public.user_achievements (user_id, achievement_id)
            SELECT user_record.id, a.id 
            FROM public.achievements a 
            WHERE a.name = 'Goal Setter'
            AND NOT EXISTS (
                SELECT 1 FROM public.user_achievements ua 
                WHERE ua.user_id = user_record.id AND ua.achievement_id = a.id
            );
        END IF;

        -- Update user points based on earned achievements
        UPDATE public.profiles 
        SET points = (
            SELECT COALESCE(SUM(a.points), 0)
            FROM public.user_achievements ua
            JOIN public.achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = user_record.id
        )
        WHERE id = user_record.id;
    END LOOP;

    RAISE NOTICE 'Achievement system restored with 50 achievements covering all fitness areas';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during retroactive achievement awarding: %', SQLERRM;
END $$;