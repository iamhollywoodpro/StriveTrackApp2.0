-- Migration to remove demo data and ensure clean user signups
-- Location: supabase/migrations/20250123012500_remove_demo_data_clean_signup.sql

-- 1. Update handle_new_user function to avoid creating demo data for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create basic user profile without any demo data
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'iamhollywoodpro@protonmail.com' THEN 'admin'::public.user_role
      ELSE 'user'::public.user_role
    END
  );
  RETURN NEW;
END;
$$;

-- 2. Remove any existing demo achievements, habits, goals for non-admin users
-- Keep admin user and remove demo content for regular users
DELETE FROM public.habits 
WHERE user_id NOT IN (
    SELECT id FROM public.user_profiles 
    WHERE role = 'admin' OR email = 'iamhollywoodpro@protonmail.com'
);

DELETE FROM public.goals 
WHERE user_id NOT IN (
    SELECT id FROM public.user_profiles 
    WHERE role = 'admin' OR email = 'iamhollywoodpro@protonmail.com'
);

DELETE FROM public.nutrition_entries 
WHERE user_id NOT IN (
    SELECT id FROM public.user_profiles 
    WHERE role = 'admin' OR email = 'iamhollywoodpro@protonmail.com'
);

DELETE FROM public.progress_media 
WHERE user_id NOT IN (
    SELECT id FROM public.user_profiles 
    WHERE role = 'admin' OR email = 'iamhollywoodpro@protonmail.com'
);

-- 3. Clean up media files for demo users (keep admin files)
DELETE FROM public.media_files 
WHERE user_id NOT IN (
    SELECT id FROM public.user_profiles 
    WHERE role = 'admin' OR email = 'iamhollywoodpro@protonmail.com'
);

-- 4. Remove demo social posts and friendships
DELETE FROM public.social_posts 
WHERE user_id NOT IN (
    SELECT id FROM public.user_profiles 
    WHERE role = 'admin' OR email = 'iamhollywoodpro@protonmail.com'
);

DELETE FROM public.friendships 
WHERE user_id NOT IN (
    SELECT id FROM public.user_profiles 
    WHERE role = 'admin' OR email = 'iamhollywoodpro@protonmail.com'
)
AND friend_id NOT IN (
    SELECT id FROM public.user_profiles 
    WHERE role = 'admin' OR email = 'iamhollywoodpro@protonmail.com'
);

-- 5. Clean up achievements for demo users (keep admin achievements)
DELETE FROM public.user_achievements 
WHERE user_id NOT IN (
    SELECT id FROM public.user_profiles 
    WHERE role = 'admin' OR email = 'iamhollywoodpro@protonmail.com'
);