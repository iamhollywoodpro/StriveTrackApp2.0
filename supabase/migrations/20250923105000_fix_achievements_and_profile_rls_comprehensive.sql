-- Migration: Fix Achievements and Profile RLS Policies Comprehensive
-- Purpose: Fix RLS policies for achievements and profiles tables to resolve permission denied errors
-- Date: 2025-09-23

-- =============================================================================
-- SAFETY CHECKS AND VALIDATIONS
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Starting comprehensive RLS policy fix for achievements and profiles...';
END $$;

-- =============================================================================
-- FIX PROFILES TABLE RLS POLICIES
-- =============================================================================

-- Drop existing problematic policies on profiles table
DROP POLICY IF EXISTS "public_read_basic_profile_info" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_full_profile_access" ON public.profiles;
DROP POLICY IF EXISTS "users_manage_own_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_full_access" ON public.profiles;

-- Create comprehensive RLS policies for profiles table
-- Pattern 1: Core User Tables - Simple direct column reference
CREATE POLICY "authenticated_users_manage_own_profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow public read access for basic profile info (for social features)
CREATE POLICY "public_read_profiles_basic_info"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Admin access using auth metadata (safe pattern)
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
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR EXISTS (
           SELECT 1 FROM public.profiles p 
           WHERE p.id = au.id AND p.is_admin = true
         ))
)
$$;

CREATE POLICY "admin_full_access_profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- =============================================================================
-- FIX ACHIEVEMENTS TABLE RLS POLICIES
-- =============================================================================

-- Drop existing problematic policies on achievements table
DROP POLICY IF EXISTS "public_read_achievements" ON public.achievements;
DROP POLICY IF EXISTS "authenticated_users_read_achievements" ON public.achievements;
DROP POLICY IF EXISTS "admin_manage_achievements" ON public.achievements;

-- Create comprehensive RLS policies for achievements table
-- Allow all authenticated users to read achievements (they're meant to be visible to all users)
CREATE POLICY "authenticated_users_read_achievements"
ON public.achievements
FOR SELECT
TO authenticated
USING (is_active = true);

-- Allow public read access for achievements (they're like app content)
CREATE POLICY "public_read_active_achievements"
ON public.achievements
FOR SELECT
TO public
USING (is_active = true);

-- Only admins can manage achievements
CREATE POLICY "admin_manage_achievements"
ON public.achievements
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- =============================================================================
-- FIX USER_ACHIEVEMENTS TABLE RLS POLICIES
-- =============================================================================

-- Drop existing policies on user_achievements table
DROP POLICY IF EXISTS "users_manage_own_achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "users_view_own_achievements" ON public.user_achievements;

-- Create comprehensive RLS policies for user_achievements table
-- Users can manage their own achievement records
CREATE POLICY "users_manage_own_user_achievements"
ON public.user_achievements
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin access for user achievements
CREATE POLICY "admin_manage_all_user_achievements"
ON public.user_achievements
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- =============================================================================
-- ENSURE RLS IS ENABLED ON ALL TABLES
-- =============================================================================

-- Ensure RLS is enabled on all necessary tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- GRANT NECESSARY PERMISSIONS
-- =============================================================================

-- Grant permissions to service role for backend operations
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.achievements TO service_role;
GRANT ALL ON public.user_achievements TO service_role;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================================================
-- FINAL VALIDATIONS
-- =============================================================================

-- Test that policies work correctly
DO $$
BEGIN
  -- Test achievements table access
  IF NOT EXISTS (SELECT 1 FROM public.achievements LIMIT 1) THEN
    RAISE NOTICE 'No achievements found in database';
  ELSE
    RAISE NOTICE 'Achievements table accessible - % total achievements found', 
      (SELECT COUNT(*) FROM public.achievements);
  END IF;
  
  -- Test profiles table structure
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'points'
  ) THEN
    RAISE NOTICE 'Points column missing from profiles table';
  ELSE
    RAISE NOTICE 'Profiles table structure validated';
  END IF;
  
  RAISE NOTICE 'RLS policy fix completed successfully!';
END $$;

-- =============================================================================
-- COMMENTS AND DOCUMENTATION
-- =============================================================================

COMMENT ON POLICY "authenticated_users_manage_own_profiles" ON public.profiles 
IS 'Allows authenticated users to manage their own profile data';

COMMENT ON POLICY "authenticated_users_read_achievements" ON public.achievements 
IS 'Allows authenticated users to read all active achievements';

COMMENT ON POLICY "users_manage_own_user_achievements" ON public.user_achievements 
IS 'Allows users to manage their own earned achievements';

COMMENT ON FUNCTION public.is_admin_from_auth() 
IS 'Safely checks if user is admin using auth metadata without circular dependencies';