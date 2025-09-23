-- Comprehensive cleanup of demo data for StriveTrack app
-- Ensures new user signups have completely clean slates
-- FIXED: Resolves duplicate key constraint issue

-- 1. Safe cleanup of potential duplicate admin accounts
-- First, identify and remove any duplicate records safely
DO $$
DECLARE
    admin_count INTEGER;
    gmail_admin_id UUID;
    protonmail_admin_id UUID;
BEGIN
    -- Check if we have both email variants
    SELECT COUNT(*) INTO admin_count 
    FROM public.user_profiles 
    WHERE email IN ('iamhollywoodpro@gmail.com', 'iamhollywoodpro@protonmail.com');
    
    IF admin_count > 1 THEN
        -- Get IDs for both accounts if they exist
        SELECT id INTO gmail_admin_id FROM public.user_profiles WHERE email = 'iamhollywoodpro@gmail.com' LIMIT 1;
        SELECT id INTO protonmail_admin_id FROM public.user_profiles WHERE email = 'iamhollywoodpro@protonmail.com' LIMIT 1;
        
        -- Keep the gmail version if it exists, otherwise update protonmail to gmail
        IF gmail_admin_id IS NOT NULL AND protonmail_admin_id IS NOT NULL THEN
            -- Remove the protonmail version and its related data
            DELETE FROM public.user_profiles WHERE id = protonmail_admin_id;
            DELETE FROM auth.users WHERE id = protonmail_admin_id;
            RAISE NOTICE 'Removed duplicate protonmail admin account: %', protonmail_admin_id;
        END IF;
    ELSIF admin_count = 1 THEN
        -- Single admin account - update if it's the protonmail version
        UPDATE public.user_profiles 
        SET email = 'iamhollywoodpro@gmail.com',
            role = 'admin'::public.user_role
        WHERE email = 'iamhollywoodpro@protonmail.com';
        
        -- Update corresponding auth.users record
        UPDATE auth.users 
        SET email = 'iamhollywoodpro@gmail.com'
        WHERE email = 'iamhollywoodpro@protonmail.com';
        
        -- Update profiles table if it exists and has the record
        UPDATE public.profiles 
        SET email = 'iamhollywoodpro@gmail.com'
        WHERE email = 'iamhollywoodpro@protonmail.com';
        
        RAISE NOTICE 'Updated admin email from protonmail to gmail';
    END IF;
END $$;

-- 2. Remove ALL demo users except the admin
-- Remove demo user from user_profiles (but preserve admin)
DELETE FROM public.user_profiles 
WHERE email NOT LIKE '%iamhollywoodpro%' 
AND role = 'user'::public.user_role;

-- Remove corresponding auth.users entries (demo users only)
DELETE FROM auth.users 
WHERE email NOT LIKE '%iamhollywoodpro%'
AND (email LIKE '%@strivetrack.com' OR email LIKE '%demo%' OR email LIKE '%test%');

-- Remove demo users from profiles table
DELETE FROM public.profiles 
WHERE email NOT LIKE '%iamhollywoodpro%'
AND is_admin = false;

-- 3. Remove all demo data associated with non-admin users
-- Get admin user ID for exclusion
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get admin user ID from user_profiles (prioritize gmail version)
    SELECT id INTO admin_user_id 
    FROM public.user_profiles 
    WHERE email LIKE '%iamhollywoodpro%' 
    OR role = 'admin'::public.user_role 
    LIMIT 1;

    -- If no admin found, skip cleanup to avoid data loss
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'No admin user found. Skipping demo data cleanup to prevent data loss.';
        RETURN;
    END IF;

    -- Clean up all user-generated content for non-admin users
    DELETE FROM public.habit_completions 
    WHERE user_id != admin_user_id;

    DELETE FROM public.habits 
    WHERE user_id != admin_user_id;

    DELETE FROM public.goals 
    WHERE user_id != admin_user_id;

    DELETE FROM public.nutrition_entries 
    WHERE user_id != admin_user_id;

    DELETE FROM public.progress_media 
    WHERE user_id != admin_user_id;

    DELETE FROM public.social_posts 
    WHERE user_id != admin_user_id;

    DELETE FROM public.friendships 
    WHERE user_id != admin_user_id 
    AND friend_id != admin_user_id;

    DELETE FROM public.user_achievements 
    WHERE user_id != admin_user_id;

    -- Clean up media files for non-admin users
    DELETE FROM public.media_files 
    WHERE user_id != admin_user_id;

    -- Clean up progress comparisons for non-admin users
    DELETE FROM public.progress_comparisons 
    WHERE user_id != admin_user_id;

    -- Clean up challenges created by non-admin users
    DELETE FROM public.challenges 
    WHERE creator_id != admin_user_id;

    RAISE NOTICE 'Demo data cleanup completed. Admin user preserved: %', admin_user_id;
END $$;

-- 4. Ensure handle_new_user function creates clean profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create only basic user profile with no demo data
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email LIKE '%iamhollywoodpro%' 
      THEN 'admin'::public.user_role
      ELSE 'user'::public.user_role
    END
  );
  
  -- DO NOT create any demo habits, goals, or other data
  -- Let the user create their own content from scratch
  
  RETURN NEW;
END;
$$;

-- 5. Clean slate verification function
CREATE OR REPLACE FUNCTION public.verify_clean_user_signup(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid UUID;
    has_habits INTEGER := 0;
    has_goals INTEGER := 0;
    has_posts INTEGER := 0;
    has_friends INTEGER := 0;
BEGIN
    -- Get user ID
    SELECT id INTO user_uuid FROM public.user_profiles WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check for any pre-existing data
    SELECT COUNT(*) INTO has_habits FROM public.habits WHERE user_id = user_uuid;
    SELECT COUNT(*) INTO has_goals FROM public.goals WHERE user_id = user_uuid;
    SELECT COUNT(*) INTO has_posts FROM public.social_posts WHERE user_id = user_uuid;
    SELECT COUNT(*) INTO has_friends FROM public.friendships WHERE user_id = user_uuid;
    
    -- Return TRUE only if user has NO pre-existing data
    RETURN (has_habits = 0 AND has_goals = 0 AND has_posts = 0 AND has_friends = 0);
END;
$$;

-- 6. Final validation and cleanup
DO $$
DECLARE
    final_admin_count INTEGER;
    final_user_count INTEGER;
BEGIN
    -- Verify we have exactly one admin user
    SELECT COUNT(*) INTO final_admin_count 
    FROM public.user_profiles 
    WHERE role = 'admin'::public.user_role;
    
    -- Count remaining demo users
    SELECT COUNT(*) INTO final_user_count 
    FROM public.user_profiles 
    WHERE role = 'user'::public.user_role 
    AND email LIKE '%@strivetrack.com';
    
    RAISE NOTICE 'Cleanup completed: % admin users, % demo users remaining', final_admin_count, final_user_count;
    
    IF final_admin_count = 0 THEN
        RAISE WARNING 'No admin user found after cleanup. Manual admin creation may be required.';
    END IF;
END $$;

-- 7. Comments for future reference
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates clean user profiles with no demo data. Users must create their own habits, goals, and content.';
COMMENT ON FUNCTION public.verify_clean_user_signup(TEXT) IS 'Verifies that new user signups have no pre-existing demo data.';