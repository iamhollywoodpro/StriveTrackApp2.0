-- Location: supabase/migrations/20250123022000_comprehensive_demo_data_removal.sql
-- Purpose: Complete removal of all demo data and reset all users to clean state
-- This ensures NO user (including admin) has any pre-populated demo content

-- Step 1: Clean up all demo data from user-specific tables
DELETE FROM public.user_achievements;
DELETE FROM public.habit_completions; 
DELETE FROM public.habits;
DELETE FROM public.goals;
DELETE FROM public.nutrition_entries;
DELETE FROM public.progress_media;
DELETE FROM public.social_posts;
DELETE FROM public.friendships;
DELETE FROM public.challenges;
DELETE FROM public.progress_comparisons;
DELETE FROM public.media_files;

-- Step 2: Reset user profile points to 0 (remove demo points)
UPDATE public.profiles SET points = 0 WHERE points > 0;
UPDATE public.user_profiles SET 
    bio = NULL,
    goals = NULL,
    height = NULL,
    weight = NULL,
    profile_picture_url = NULL,
    profile_picture_path = NULL
WHERE id IS NOT NULL;

-- Step 3: Remove demo achievements (keep achievement definitions but remove earned ones)
-- Keep the achievement templates but ensure no users have earned them
DELETE FROM public.user_achievements;

-- Step 4: Create enhanced cleanup function for future use
CREATE OR REPLACE FUNCTION public.ensure_clean_user_state(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    -- Remove all user-generated content for specific user
    DELETE FROM public.user_achievements WHERE user_id = user_uuid;
    DELETE FROM public.habit_completions WHERE user_id = user_uuid;
    DELETE FROM public.habits WHERE user_id = user_uuid;
    DELETE FROM public.goals WHERE user_id = user_uuid;
    DELETE FROM public.nutrition_entries WHERE user_id = user_uuid;
    DELETE FROM public.progress_media WHERE user_id = user_uuid;
    DELETE FROM public.social_posts WHERE user_id = user_uuid;
    DELETE FROM public.friendships WHERE user_id = user_uuid OR friend_id = user_uuid;
    DELETE FROM public.challenges WHERE creator_id = user_uuid;
    DELETE FROM public.progress_comparisons WHERE user_id = user_uuid;
    DELETE FROM public.media_files WHERE user_id = user_uuid;
    
    -- Reset profile data
    UPDATE public.profiles SET points = 0 WHERE id = user_uuid;
    UPDATE public.user_profiles SET 
        bio = NULL,
        goals = NULL,
        height = NULL,
        weight = NULL,
        profile_picture_url = NULL,
        profile_picture_path = NULL
    WHERE id = user_uuid;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error cleaning user state: %', SQLERRM;
        RETURN FALSE;
END;
$func$;

-- Step 5: Enhanced handle_new_user function to prevent ANY demo data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    -- Create ONLY basic user profile with absolutely NO demo data
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        CASE 
            WHEN NEW.email ILIKE '%iamhollywoodpro%' 
            THEN 'admin'::public.user_role
            ELSE 'user'::public.user_role
        END
    );
    
    -- Create basic profile entry with zero points
    INSERT INTO public.profiles (id, email, name, points, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        0, -- Always start with 0 points
        CASE 
            WHEN NEW.email ILIKE '%iamhollywoodpro%' 
            THEN true
            ELSE false
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        points = 0, -- Always reset to 0
        is_admin = EXCLUDED.is_admin;
    
    -- DO NOT create any habits, goals, achievements, or demo content
    -- User must create everything themselves from scratch
    
    RETURN NEW;
END;
$func$;

-- Step 6: Create admin function to verify clean state
CREATE OR REPLACE FUNCTION public.admin_verify_clean_database()
RETURNS TABLE(
    table_name TEXT,
    record_count BIGINT,
    is_clean BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    -- Only allow admin users to call this function
    IF NOT public.is_admin_comprehensive() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    RETURN QUERY
    SELECT 'user_achievements'::TEXT, COUNT(*)::BIGINT, (COUNT(*) = 0)::BOOLEAN FROM public.user_achievements
    UNION ALL
    SELECT 'habits'::TEXT, COUNT(*)::BIGINT, (COUNT(*) = 0)::BOOLEAN FROM public.habits
    UNION ALL
    SELECT 'goals'::TEXT, COUNT(*)::BIGINT, (COUNT(*) = 0)::BOOLEAN FROM public.goals
    UNION ALL
    SELECT 'social_posts'::TEXT, COUNT(*)::BIGINT, (COUNT(*) = 0)::BOOLEAN FROM public.social_posts
    UNION ALL
    SELECT 'friendships'::TEXT, COUNT(*)::BIGINT, (COUNT(*) = 0)::BOOLEAN FROM public.friendships
    UNION ALL
    SELECT 'progress_media'::TEXT, COUNT(*)::BIGINT, (COUNT(*) = 0)::BOOLEAN FROM public.progress_media
    UNION ALL
    SELECT 'nutrition_entries'::TEXT, COUNT(*)::BIGINT, (COUNT(*) = 0)::BOOLEAN FROM public.nutrition_entries
    UNION ALL
    SELECT 'media_files'::TEXT, COUNT(*)::BIGINT, (COUNT(*) = 0)::BOOLEAN FROM public.media_files;
END;
$func$;

-- Step 7: Clean up any existing admin demo data specifically
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id 
    FROM public.user_profiles 
    WHERE email ILIKE '%iamhollywoodpro%' 
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Ensure admin also starts clean
        PERFORM public.ensure_clean_user_state(admin_user_id);
        RAISE NOTICE 'Admin account cleaned: %', admin_user_id;
    END IF;
    
    -- Clean any other existing users
    PERFORM public.ensure_clean_user_state(up.id)
    FROM public.user_profiles up
    WHERE up.id != admin_user_id;
    
    RAISE NOTICE 'All user accounts have been reset to clean state with no demo data';
END $$;

-- Step 8: Verification message
DO $$
BEGIN
    RAISE NOTICE '=== DEMO DATA CLEANUP COMPLETE ===';
    RAISE NOTICE 'All users now have:';
    RAISE NOTICE '- 0 points';
    RAISE NOTICE '- No habits or goals';
    RAISE NOTICE '- No achievements earned';
    RAISE NOTICE '- No social posts or friends';
    RAISE NOTICE '- No progress photos or nutrition entries';
    RAISE NOTICE '- Clean profile data';
    RAISE NOTICE 'Users must create all content themselves from scratch';
END $$;