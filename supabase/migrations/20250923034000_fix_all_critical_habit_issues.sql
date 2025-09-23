-- 🎯 Fix All Critical Habit Creation Issues
-- ===================================
-- This migration addresses:
-- 1. SQL function parameter name conflict 
-- 2. Missing completed_at column in habit_completions
-- 3. Missing RLS policies for achievements table
-- 4. Profile creation issues for authenticated users
-- 5. Enhanced error handling and data integrity

-- 1. Drop and recreate function with different parameter name to avoid conflict
DROP FUNCTION IF EXISTS public.toggle_habit_completion(uuid, date);

CREATE OR REPLACE FUNCTION public.toggle_habit_completion(
  p_habit_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_exists BOOLEAN;
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
    -- Remove completion
    DELETE FROM public.habit_completions
    WHERE habit_id = p_habit_id 
    AND completed_date = p_date 
    AND user_id = v_user_id;
    RETURN false;
  ELSE
    -- Add completion
    INSERT INTO public.habit_completions (habit_id, user_id, completed_date)
    VALUES (p_habit_id, v_user_id, p_date)
    ON CONFLICT (habit_id, completed_date) DO NOTHING;
    RETURN true;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error toggling habit completion: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- 2. Add completed_at column to habit_completions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'habit_completions' 
    AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE public.habit_completions 
    ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    -- Update existing records to set completed_at from created_at
    UPDATE public.habit_completions 
    SET completed_at = COALESCE(created_at, NOW())
    WHERE completed_at IS NULL;
  END IF;
END $$;

-- 3. Enable RLS and create policies for achievements table
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "authenticated_users_can_view_achievements" ON public.achievements;
DROP POLICY IF EXISTS "admin_full_access_achievements" ON public.achievements;

-- Create comprehensive policies for achievements
CREATE POLICY "authenticated_users_can_view_achievements"
ON public.achievements
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admin_full_access_achievements"
ON public.achievements
FOR ALL
TO authenticated
USING (is_admin_from_auth())
WITH CHECK (is_admin_from_auth());

-- 4. Ensure comprehensive profile creation system
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile for new user with comprehensive error handling
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    name = COALESCE(EXCLUDED.name, profiles.name),
    created_at = COALESCE(profiles.created_at, NOW());
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists and is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Create all missing profiles for existing users
INSERT INTO public.profiles (id, email, name, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'name',
    au.raw_user_meta_data->>'full_name', 
    au.raw_user_meta_data->>'display_name',
    split_part(au.email, '@', 1)
  ),
  COALESCE(au.created_at, NOW())
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 6. Create comprehensive helper functions for habit management
CREATE OR REPLACE FUNCTION public.get_habit_completion_status(
  p_user_id UUID,
  p_habit_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM public.habit_completions hc
  WHERE hc.user_id = p_user_id 
  AND hc.habit_id = p_habit_id 
  AND hc.completed_date = p_date
);
$$;

CREATE OR REPLACE FUNCTION public.get_weekly_habit_stats(
  p_user_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '6 days'
)
RETURNS TABLE(
  total_days INTEGER,
  completed_days INTEGER,
  completion_rate NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
  7 as total_days,
  COALESCE(COUNT(hc.id)::INTEGER, 0) as completed_days,
  ROUND(
    CASE 
      WHEN COUNT(hc.id) > 0 THEN (COUNT(hc.id)::NUMERIC / 7) * 100 
      ELSE 0 
    END, 2
  ) as completion_rate
FROM public.habit_completions hc
WHERE hc.user_id = p_user_id
AND hc.completed_date >= p_start_date
AND hc.completed_date <= p_start_date + INTERVAL '6 days';
$$;

-- 7. Add database constraints for data integrity
ALTER TABLE public.habits 
DROP CONSTRAINT IF EXISTS habits_name_not_empty;

ALTER TABLE public.habits 
ADD CONSTRAINT habits_name_not_empty 
CHECK (length(trim(name)) > 0);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date 
ON public.habit_completions(user_id, completed_date);

CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_date 
ON public.habit_completions(habit_id, completed_date);

CREATE INDEX IF NOT EXISTS idx_habits_user_created 
ON public.habits(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON public.profiles(email) WHERE email IS NOT NULL;

-- 9. Enable RLS on all related tables
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 10. Create comprehensive admin management function
CREATE OR REPLACE FUNCTION public.admin_create_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_name TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only admins can call this function
  IF NOT is_admin_from_auth() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  INSERT INTO public.profiles (id, email, name, created_at)
  VALUES (
    p_user_id,
    p_email,
    COALESCE(p_name, split_part(p_email, '@', 1)),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating admin profile: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- 11. Create function to verify user can create habits
CREATE OR REPLACE FUNCTION public.can_user_create_habit(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = p_user_id
) AND p_user_id IS NOT NULL;
$$;

-- 12. Add helpful comments for future maintenance
COMMENT ON FUNCTION public.toggle_habit_completion(UUID, DATE) IS 'Safely toggle habit completion status for authenticated users';
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatic profile creation trigger for new auth users';
COMMENT ON FUNCTION public.can_user_create_habit(UUID) IS 'Verify user profile exists before habit creation';

-- End of migration - All critical issues should now be resolved