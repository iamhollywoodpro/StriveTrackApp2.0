-- Location: supabase/migrations/20250923032500_fix_habits_goals_rls_policies.sql
-- Schema Analysis: Fitness app with existing habits, goals, habit_completions, user_achievements tables
-- Integration Type: Modification - Fix RLS policies and permissions
-- Dependencies: habits, goals, habit_completions, user_achievements, profiles tables

-- Fix 1: Complete RLS policies for user_achievements table
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "System can insert achievements" ON public.user_achievements;

-- Create comprehensive RLS policy for user_achievements using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_user_achievements"
ON public.user_achievements
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix 2: Ensure habits table RLS is working correctly
-- Drop and recreate habits policy to ensure it's correct
DROP POLICY IF EXISTS "Users can manage own habits" ON public.habits;

CREATE POLICY "users_manage_own_habits"
ON public.habits
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix 3: Ensure goals table RLS is working correctly  
-- Drop and recreate goals policy to ensure it's correct
DROP POLICY IF EXISTS "Users can manage own goals" ON public.goals;

CREATE POLICY "users_manage_own_goals"
ON public.goals
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix 4: Ensure habit_completions table RLS is working correctly
-- Drop and recreate habit_completions policy to ensure it's correct
DROP POLICY IF EXISTS "Users can manage own completions" ON public.habit_completions;

CREATE POLICY "users_manage_own_habit_completions"
ON public.habit_completions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix 5: Create admin access function for comprehensive management (Pattern 6A)
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

-- Fix 6: Add admin policies for all tables (safe for any table including user tables)
CREATE POLICY "admin_full_access_habits"
ON public.habits
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_goals"
ON public.goals
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_habit_completions"
ON public.habit_completions
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_user_achievements"
ON public.user_achievements
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Fix 7: Add indexes to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON public.habit_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

-- Fix 8: Grant necessary permissions to authenticated role
GRANT ALL ON public.habits TO authenticated;
GRANT ALL ON public.goals TO authenticated;
GRANT ALL ON public.habit_completions TO authenticated;
GRANT ALL ON public.user_achievements TO authenticated;

-- Fix 9: Add helpful function to check habit completion status with correct column name
CREATE OR REPLACE FUNCTION public.get_habit_completion_status(habit_uuid UUID, check_date DATE DEFAULT CURRENT_DATE)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.habit_completions hc
    WHERE hc.habit_id = habit_uuid 
    AND hc.completed_date = check_date  -- Using correct column name: completed_date (not completed_at)
    AND hc.user_id = auth.uid()
)
$$;

-- Fix 10: Create helper function to get weekly habit completion stats
CREATE OR REPLACE FUNCTION public.get_weekly_habit_stats(habit_uuid UUID)
RETURNS TABLE(
    total_days INTEGER,
    completed_days INTEGER,
    completion_rate DECIMAL
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    7::INTEGER as total_days,
    COUNT(hc.id)::INTEGER as completed_days,
    ROUND((COUNT(hc.id) * 100.0) / 7, 2) as completion_rate
FROM public.habit_completions hc
WHERE hc.habit_id = habit_uuid
AND hc.user_id = auth.uid()
AND hc.completed_date >= CURRENT_DATE - INTERVAL '7 days'
$$;

-- Fix 11: Add function to safely complete habits
CREATE OR REPLACE FUNCTION public.toggle_habit_completion(habit_uuid UUID, completion_date DATE DEFAULT CURRENT_DATE)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    existing_completion_id UUID;
    habit_exists BOOLEAN;
BEGIN
    -- Check if habit exists and belongs to user
    SELECT EXISTS(
        SELECT 1 FROM public.habits h 
        WHERE h.id = habit_uuid AND h.user_id = auth.uid()
    ) INTO habit_exists;
    
    IF NOT habit_exists THEN
        RETURN FALSE;
    END IF;

    -- Check if completion already exists
    SELECT id INTO existing_completion_id
    FROM public.habit_completions hc
    WHERE hc.habit_id = habit_uuid 
    AND hc.completed_date = completion_date
    AND hc.user_id = auth.uid();

    IF existing_completion_id IS NOT NULL THEN
        -- Remove completion
        DELETE FROM public.habit_completions 
        WHERE id = existing_completion_id;
        RETURN FALSE;
    ELSE
        -- Add completion
        INSERT INTO public.habit_completions (habit_id, user_id, completed_date)
        VALUES (habit_uuid, auth.uid(), completion_date);
        RETURN TRUE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error toggling habit completion: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- Add comments for maintenance
COMMENT ON POLICY "users_manage_own_habits" ON public.habits IS 'Allows users to manage their own habits with full CRUD access';
COMMENT ON POLICY "users_manage_own_goals" ON public.goals IS 'Allows users to manage their own goals with full CRUD access';
COMMENT ON POLICY "users_manage_own_habit_completions" ON public.habit_completions IS 'Allows users to manage their own habit completions with full CRUD access';
COMMENT ON POLICY "users_manage_own_user_achievements" ON public.user_achievements IS 'Allows users to manage their own achievements with full CRUD access';

COMMENT ON FUNCTION public.is_admin_from_auth() IS 'Safely checks admin role from auth.users metadata to avoid circular dependencies';
COMMENT ON FUNCTION public.get_habit_completion_status(UUID, DATE) IS 'Checks if a habit is completed on a specific date using correct column name completed_date';
COMMENT ON FUNCTION public.toggle_habit_completion(UUID, DATE) IS 'Safely toggles habit completion status with proper validation';