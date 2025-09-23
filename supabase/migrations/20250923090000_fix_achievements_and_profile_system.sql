-- Migration: Fix achievements system and user profile functionality
-- Schema Analysis: Building upon existing achievements, profiles, and user_achievements tables
-- Integration Type: Enhancement of existing schema
-- Dependencies: achievements, profiles, user_achievements tables

-- 1. Add missing profile columns if they don't exist
DO $$
BEGIN
    -- Add full_name column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name text;
    END IF;
    
    -- Add bio column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio text;
    END IF;
    
    -- Add height column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'height') THEN
        ALTER TABLE public.profiles ADD COLUMN height text;
    END IF;
    
    -- Add weight column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'weight') THEN
        ALTER TABLE public.profiles ADD COLUMN weight text;
    END IF;
    
    -- Add goals column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'goals') THEN
        ALTER TABLE public.profiles ADD COLUMN goals text;
    END IF;
    
    -- Add profile picture columns if not exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'profile_picture_url') THEN
        ALTER TABLE public.profiles ADD COLUMN profile_picture_url text;
        ALTER TABLE public.profiles ADD COLUMN profile_picture_path text;
    END IF;
    
    -- Ensure points column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'points') THEN
        ALTER TABLE public.profiles ADD COLUMN points integer DEFAULT 0;
    END IF;
END $$;

-- 2. Create enhanced achievement system functions
CREATE OR REPLACE FUNCTION public.award_achievement_and_points(
    p_user_id uuid,
    p_achievement_name text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_achievement_id uuid;
    v_achievement_points integer;
    v_already_earned boolean;
BEGIN
    -- Get achievement details
    SELECT id, points INTO v_achievement_id, v_achievement_points
    FROM public.achievements
    WHERE name = p_achievement_name;
    
    -- Return false if achievement doesn't exist
    IF v_achievement_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if user already has this achievement
    SELECT EXISTS (
        SELECT 1 FROM public.user_achievements 
        WHERE user_id = p_user_id AND achievement_id = v_achievement_id
    ) INTO v_already_earned;
    
    -- Only award if not already earned
    IF NOT v_already_earned THEN
        -- Award the achievement
        INSERT INTO public.user_achievements (user_id, achievement_id, earned_at)
        VALUES (p_user_id, v_achievement_id, now());
        
        -- Award the points
        UPDATE public.profiles
        SET points = COALESCE(points, 0) + v_achievement_points
        WHERE id = p_user_id;
        
        RETURN true;
    END IF;
    
    RETURN false;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error awarding achievement: %', SQLERRM;
        RETURN false;
END;
$$;

-- 3. Enhanced habit completion function with achievement integration
CREATE OR REPLACE FUNCTION public.enhanced_toggle_habit_completion(p_habit_id uuid, p_date date DEFAULT CURRENT_DATE)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_exists boolean;
    v_habit_count integer;
    v_completion_count integer;
BEGIN
    -- Validate user is authenticated
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Check if habit exists and belongs to user
    IF NOT EXISTS (
        SELECT 1 FROM public.habits h 
        WHERE h.id = p_habit_id AND h.user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'Habit not found or access denied';
    END IF;

    -- Check if completion already exists
    SELECT EXISTS (
        SELECT 1 FROM public.habit_completions
        WHERE habit_id = p_habit_id 
        AND completed_date = p_date 
        AND user_id = v_user_id
    ) INTO v_exists;
    
    IF v_exists THEN
        -- Remove completion and subtract points
        DELETE FROM public.habit_completions
        WHERE habit_id = p_habit_id 
        AND completed_date = p_date 
        AND user_id = v_user_id;
        
        -- Subtract base points for habit completion
        UPDATE public.profiles
        SET points = GREATEST(0, COALESCE(points, 0) - 10)
        WHERE id = v_user_id;
        
        RETURN false;
    ELSE
        -- Add completion
        INSERT INTO public.habit_completions (habit_id, user_id, completed_date)
        VALUES (p_habit_id, v_user_id, p_date);
        
        -- Award base points for habit completion
        UPDATE public.profiles
        SET points = COALESCE(points, 0) + 10
        WHERE id = v_user_id;
        
        -- Check for first habit creation achievement
        SELECT COUNT(*) INTO v_habit_count
        FROM public.habits
        WHERE user_id = v_user_id;
        
        IF v_habit_count >= 1 THEN
            PERFORM public.award_achievement_and_points(v_user_id, 'First Steps');
        END IF;
        
        -- Check for completion streak achievements
        SELECT COUNT(*) INTO v_completion_count
        FROM public.habit_completions
        WHERE user_id = v_user_id;
        
        -- Award achievements based on completion count
        IF v_completion_count >= 7 THEN
            PERFORM public.award_achievement_and_points(v_user_id, 'Week Warrior');
        END IF;
        
        IF v_completion_count >= 30 THEN
            PERFORM public.award_achievement_and_points(v_user_id, 'Month Master');
        END IF;
        
        RETURN true;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error toggling habit completion: %', SQLERRM;
        RETURN false;
END;
$$;

-- 4. Function to check and award media upload achievements
CREATE OR REPLACE FUNCTION public.check_media_achievements(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_media_count integer;
BEGIN
    -- Count user's media files
    SELECT COUNT(*) INTO v_media_count
    FROM public.media_files
    WHERE user_id = p_user_id AND status = 'active';
    
    -- Award "Photo Ready" achievement for first upload
    IF v_media_count >= 1 THEN
        PERFORM public.award_achievement_and_points(p_user_id, 'Photo Ready');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error checking media achievements: %', SQLERRM;
END;
$$;

-- 5. Drop existing restrictive RLS policies and create new permissive ones
-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "users_manage_own_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_comprehensive_access_profiles" ON public.profiles;
DROP POLICY IF EXISTS "public_can_read_basic_profiles" ON public.profiles;

-- Create new comprehensive profiles policy (Pattern 1 - Core User Table)
CREATE POLICY "authenticated_users_full_profile_access"
ON public.profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Create public read policy for basic profile info
CREATE POLICY "public_read_basic_profile_info"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Drop existing policies on achievements table
DROP POLICY IF EXISTS "admin_comprehensive_access_achievements" ON public.achievements;
DROP POLICY IF EXISTS "public_can_read_achievements" ON public.achievements;

-- Create new achievements policies - allow all authenticated users to read
CREATE POLICY "authenticated_users_read_achievements"
ON public.achievements
FOR SELECT
TO authenticated
USING (true);

-- Allow public to read achievements for preview
CREATE POLICY "public_read_achievements"
ON public.achievements
FOR SELECT
TO public
USING (true);

-- Drop existing policies on user_achievements table
DROP POLICY IF EXISTS "users_manage_own_user_achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "admin_comprehensive_access_user_achievements" ON public.user_achievements;

-- Create new user_achievements policies (Pattern 2 - Simple User Ownership)
CREATE POLICY "users_manage_own_achievements"
ON public.user_achievements
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. Create triggers for automatic achievement checking
CREATE OR REPLACE FUNCTION public.trigger_check_media_achievements()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check achievements when new media is uploaded
    PERFORM public.check_media_achievements(NEW.user_id);
    RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_media_achievements ON public.media_files;
CREATE TRIGGER trigger_media_achievements
    AFTER INSERT ON public.media_files
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_check_media_achievements();

-- 7. Update existing profiles with default values for new columns
UPDATE public.profiles 
SET 
    full_name = COALESCE(full_name, name, 'User'),
    bio = COALESCE(bio, 'Fitness enthusiast on a journey!'),
    points = COALESCE(points, 0)
WHERE full_name IS NULL OR bio IS NULL OR points IS NULL;

-- 8. Insert sample achievements if table is empty
INSERT INTO public.achievements (name, description, icon, points)
SELECT * FROM (VALUES
    ('First Steps', 'Create your first habit', '👟', 10),
    ('Photo Ready', 'Upload your first progress photo', '📸', 15),
    ('Week Warrior', 'Complete habits for 7 days straight', '🔥', 50),
    ('Month Master', 'Complete habits for 30 days straight', '🏆', 200),
    ('Dedication Award', 'Complete 50 habits total', '🎯', 100),
    ('Transformation Journey', 'Upload 10 progress photos', '📱', 75)
) AS v(name, description, icon, points)
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = v.name);

-- 9. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON public.user_achievements(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_date ON public.habit_completions(completed_date DESC);

-- 10. Award existing achievements to current users based on their activity
DO $$
DECLARE
    user_record record;
    habit_count integer;
    media_count integer;
    completion_count integer;
BEGIN
    FOR user_record IN SELECT id FROM public.profiles LOOP
        -- Check habits count
        SELECT COUNT(*) INTO habit_count
        FROM public.habits
        WHERE user_id = user_record.id;
        
        -- Check media count
        SELECT COUNT(*) INTO media_count
        FROM public.media_files
        WHERE user_id = user_record.id AND status = 'active';
        
        -- Check completion count
        SELECT COUNT(*) INTO completion_count
        FROM public.habit_completions
        WHERE user_id = user_record.id;
        
        -- Award achievements based on existing activity
        IF habit_count >= 1 THEN
            PERFORM public.award_achievement_and_points(user_record.id, 'First Steps');
        END IF;
        
        IF media_count >= 1 THEN
            PERFORM public.award_achievement_and_points(user_record.id, 'Photo Ready');
        END IF;
        
        IF completion_count >= 7 THEN
            PERFORM public.award_achievement_and_points(user_record.id, 'Week Warrior');
        END IF;
        
        IF completion_count >= 30 THEN
            PERFORM public.award_achievement_and_points(user_record.id, 'Month Master');
        END IF;
        
        IF completion_count >= 50 THEN
            PERFORM public.award_achievement_and_points(user_record.id, 'Dedication Award');
        END IF;
        
        IF media_count >= 10 THEN
            PERFORM public.award_achievement_and_points(user_record.id, 'Transformation Journey');
        END IF;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error awarding existing achievements: %', SQLERRM;
END $$;