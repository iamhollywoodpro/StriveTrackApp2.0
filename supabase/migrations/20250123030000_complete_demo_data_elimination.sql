-- Location: supabase/migrations/20250123030000_complete_demo_data_elimination.sql
-- Schema Analysis: Complete fitness app with 14 tables, demo data persisting in achievements, profiles, and user-related tables
-- Integration Type: Data cleanup and reset - DESTRUCTIVE operation to eliminate all demo data
-- Dependencies: All existing tables, user authentication system

-- STEP 1: Comprehensive Demo Data Cleanup Function
CREATE OR REPLACE FUNCTION public.eliminate_all_demo_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    demo_user_ids UUID[];
    all_user_ids UUID[];
BEGIN
    RAISE NOTICE 'Starting comprehensive demo data elimination...';
    
    -- Get all user IDs for comprehensive reset
    SELECT ARRAY_AGG(id) INTO all_user_ids FROM public.user_profiles;
    
    -- PHASE 1: Delete ALL demo achievements and reset user achievements
    RAISE NOTICE 'Phase 1: Cleaning achievements and user achievements...';
    DELETE FROM public.user_achievements WHERE TRUE;  -- Remove all user achievement records
    DELETE FROM public.achievements WHERE TRUE;       -- Remove all demo achievements
    
    -- PHASE 2: Reset all user data to zero state
    RAISE NOTICE 'Phase 2: Resetting all user data to zero state...';
    
    -- Reset profiles points to 0 for ALL users (including admin)
    UPDATE public.profiles SET points = 0 WHERE TRUE;
    
    -- Reset user_profiles to clean state (preserve core info but remove demo data)
    UPDATE public.user_profiles 
    SET 
        bio = NULL,
        goals = NULL,
        height = NULL,
        weight = NULL,
        profile_picture_url = NULL,
        profile_picture_path = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE TRUE;
    
    -- PHASE 3: Delete ALL user-generated content
    RAISE NOTICE 'Phase 3: Removing all user content...';
    
    -- Delete all habits and habit completions
    DELETE FROM public.habit_completions WHERE TRUE;
    DELETE FROM public.habits WHERE TRUE;
    
    -- Delete all goals
    DELETE FROM public.goals WHERE TRUE;
    
    -- Delete all social posts
    DELETE FROM public.social_posts WHERE TRUE;
    
    -- Delete all nutrition entries
    DELETE FROM public.nutrition_entries WHERE TRUE;
    
    -- Delete all progress media
    DELETE FROM public.progress_media WHERE TRUE;
    
    -- Delete all media files
    DELETE FROM public.media_files WHERE TRUE;
    
    -- Delete all progress comparisons
    DELETE FROM public.progress_comparisons WHERE TRUE;
    
    -- Delete all friendships
    DELETE FROM public.friendships WHERE TRUE;
    
    -- Delete all challenges
    DELETE FROM public.challenges WHERE TRUE;
    
    RAISE NOTICE 'Demo data elimination completed successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during demo data elimination: %', SQLERRM;
        RAISE;
END;
$$;

-- STEP 2: Enhanced Clean Signup Function
CREATE OR REPLACE FUNCTION public.verify_completely_clean_user_signup(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid UUID;
    total_data_count INTEGER := 0;
BEGIN
    -- Get user ID
    SELECT id INTO user_uuid FROM public.user_profiles WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check for ANY user data across ALL tables
    SELECT 
        COALESCE((SELECT COUNT(*) FROM public.habits WHERE user_id = user_uuid), 0) +
        COALESCE((SELECT COUNT(*) FROM public.goals WHERE user_id = user_uuid), 0) +
        COALESCE((SELECT COUNT(*) FROM public.social_posts WHERE user_id = user_uuid), 0) +
        COALESCE((SELECT COUNT(*) FROM public.nutrition_entries WHERE user_id = user_uuid), 0) +
        COALESCE((SELECT COUNT(*) FROM public.progress_media WHERE user_id = user_uuid), 0) +
        COALESCE((SELECT COUNT(*) FROM public.media_files WHERE user_id = user_uuid), 0) +
        COALESCE((SELECT COUNT(*) FROM public.user_achievements WHERE user_id = user_uuid), 0) +
        COALESCE((SELECT COUNT(*) FROM public.friendships WHERE user_id = user_uuid OR friend_id = user_uuid), 0) +
        COALESCE((SELECT COUNT(*) FROM public.challenges WHERE creator_id = user_uuid), 0) +
        COALESCE((SELECT COUNT(*) FROM public.habit_completions WHERE user_id = user_uuid), 0) +
        COALESCE((SELECT COUNT(*) FROM public.progress_comparisons WHERE user_id = user_uuid), 0)
    INTO total_data_count;
    
    -- Also check if user has any demo profile data
    IF EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = user_uuid 
        AND (
            bio IS NOT NULL OR 
            goals IS NOT NULL OR 
            height IS NOT NULL OR 
            weight IS NOT NULL OR
            profile_picture_url IS NOT NULL OR
            profile_picture_path IS NOT NULL
        )
    ) THEN
        total_data_count := total_data_count + 1;
    END IF;
    
    -- Check if user has any points in profiles table
    IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_uuid AND points > 0
    ) THEN
        total_data_count := total_data_count + 1;
    END IF;
    
    RETURN (total_data_count = 0);
END;
$$;

-- STEP 3: Update handle_new_user function to ensure completely clean signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create basic user profile with absolutely NO demo data
  INSERT INTO public.user_profiles (id, email, full_name, role, bio, goals, height, weight, profile_picture_url, profile_picture_path)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email LIKE '%iamhollywoodpro%' 
      THEN 'admin'::public.user_role
      ELSE 'user'::public.user_role
    END,
    NULL,  -- No demo bio
    NULL,  -- No demo goals
    NULL,  -- No demo height
    NULL,  -- No demo weight
    NULL,  -- No demo profile picture URL
    NULL   -- No demo profile picture path
  );
  
  -- Create profiles entry with 0 points
  INSERT INTO public.profiles (id, email, name, points, is_admin, username, phone, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    0,  -- Always start with 0 points
    CASE 
      WHEN NEW.email LIKE '%iamhollywoodpro%' 
      THEN true
      ELSE false
    END,
    NULL,  -- No username by default
    NULL,  -- No phone by default
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    points = 0,  -- Reset points to 0 if profile already exists
    email = EXCLUDED.email,
    name = EXCLUDED.name;
  
  -- DO NOT create ANY demo content:
  -- - No demo habits
  -- - No demo goals
  -- - No demo achievements
  -- - No demo posts
  -- - No demo media
  -- - No demo points
  -- Let users create everything themselves from scratch
  
  RETURN NEW;
END;
$$;

-- STEP 4: Admin User Clean Reset Function
CREATE OR REPLACE FUNCTION public.reset_admin_account_clean()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Find admin user
    SELECT id INTO admin_user_id 
    FROM public.user_profiles 
    WHERE email LIKE '%iamhollywoodpro%' 
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        RAISE NOTICE 'Resetting admin account to clean state...';
        
        -- Reset admin profile data
        UPDATE public.user_profiles 
        SET 
            bio = NULL,
            goals = NULL,
            height = NULL,
            weight = NULL,
            profile_picture_url = NULL,
            profile_picture_path = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = admin_user_id;
        
        -- Reset admin points to 0
        UPDATE public.profiles 
        SET points = 0 
        WHERE id = admin_user_id;
        
        -- Delete all admin content
        DELETE FROM public.habits WHERE user_id = admin_user_id;
        DELETE FROM public.goals WHERE user_id = admin_user_id;
        DELETE FROM public.social_posts WHERE user_id = admin_user_id;
        DELETE FROM public.nutrition_entries WHERE user_id = admin_user_id;
        DELETE FROM public.media_files WHERE user_id = admin_user_id;
        DELETE FROM public.user_achievements WHERE user_id = admin_user_id;
        
        RAISE NOTICE 'Admin account reset completed!';
    END IF;
END;
$$;

-- STEP 5: Execute the comprehensive cleanup
SELECT public.eliminate_all_demo_data();

-- STEP 6: Reset admin account specifically
SELECT public.reset_admin_account_clean();

-- STEP 7: Verification queries to confirm clean state
DO $$
DECLARE
    achievements_count INTEGER;
    user_achievements_count INTEGER;
    admin_points INTEGER;
    total_habits INTEGER;
    total_goals INTEGER;
    total_posts INTEGER;
    total_media INTEGER;
BEGIN
    -- Count remaining data
    SELECT COUNT(*) INTO achievements_count FROM public.achievements;
    SELECT COUNT(*) INTO user_achievements_count FROM public.user_achievements;
    SELECT COALESCE(SUM(points), 0) INTO admin_points FROM public.profiles;
    SELECT COUNT(*) INTO total_habits FROM public.habits;
    SELECT COUNT(*) INTO total_goals FROM public.goals;
    SELECT COUNT(*) INTO total_posts FROM public.social_posts;
    SELECT COUNT(*) INTO total_media FROM public.media_files;
    
    RAISE NOTICE '=== CLEANUP VERIFICATION RESULTS ===';
    RAISE NOTICE 'Demo achievements remaining: %', achievements_count;
    RAISE NOTICE 'User achievements remaining: %', user_achievements_count;
    RAISE NOTICE 'Total points across all users: %', admin_points;
    RAISE NOTICE 'Total habits remaining: %', total_habits;
    RAISE NOTICE 'Total goals remaining: %', total_goals;
    RAISE NOTICE 'Total posts remaining: %', total_posts;
    RAISE NOTICE 'Total media files remaining: %', total_media;
    RAISE NOTICE '====================================';
    
    IF achievements_count = 0 AND user_achievements_count = 0 AND admin_points = 0 
       AND total_habits = 0 AND total_goals = 0 AND total_posts = 0 AND total_media = 0 THEN
        RAISE NOTICE '✅ SUCCESS: All demo data has been completely eliminated!';
    ELSE
        RAISE NOTICE '⚠️  WARNING: Some data may still remain. Check individual tables.';
    END IF;
END $$;

-- STEP 8: Add monitoring function to track new user cleanliness
CREATE OR REPLACE FUNCTION public.monitor_user_signup_cleanliness()
RETURNS TABLE(
    user_email TEXT,
    is_completely_clean BOOLEAN,
    points_count INTEGER,
    total_content_count BIGINT,
    profile_data_present BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.email::TEXT,
        public.verify_completely_clean_user_signup(up.email),
        COALESCE(p.points, 0)::INTEGER,
        (
            COALESCE((SELECT COUNT(*) FROM public.habits WHERE user_id = up.id), 0) +
            COALESCE((SELECT COUNT(*) FROM public.goals WHERE user_id = up.id), 0) +
            COALESCE((SELECT COUNT(*) FROM public.social_posts WHERE user_id = up.id), 0) +
            COALESCE((SELECT COUNT(*) FROM public.user_achievements WHERE user_id = up.id), 0) +
            COALESCE((SELECT COUNT(*) FROM public.media_files WHERE user_id = up.id), 0)
        )::BIGINT,
        (up.bio IS NOT NULL OR up.goals IS NOT NULL OR up.height IS NOT NULL 
         OR up.weight IS NOT NULL OR up.profile_picture_url IS NOT NULL)::BOOLEAN
    FROM public.user_profiles up
    LEFT JOIN public.profiles p ON up.id = p.id
    ORDER BY up.created_at DESC;
END;
$$;

-- Final status message
DO $$
BEGIN
    RAISE NOTICE '🚀 COMPLETE DEMO DATA ELIMINATION MIGRATION COMPLETED!';
    RAISE NOTICE 'All demo achievements, user content, and points have been reset to 0.';
    RAISE NOTICE 'New users will now signup with completely clean accounts.';
    RAISE NOTICE 'Admin account has been reset to clean state.';
    RAISE NOTICE 'Run "SELECT * FROM public.monitor_user_signup_cleanliness();" to verify user states.';
END $$;