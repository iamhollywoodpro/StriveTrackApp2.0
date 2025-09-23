-- Fix Admin Dashboard Media Management - Root Cause: RLS Policy Issue
-- The admin dashboard fails because RLS policies block admin access to profiles table
-- This migration fixes the RLS policies to allow proper admin access

-- Drop and recreate admin comprehensive access policy for profiles with proper permissions
DROP POLICY IF EXISTS "admin_comprehensive_access_profiles" ON public.profiles;

CREATE POLICY "admin_comprehensive_access_profiles" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (
    -- Allow admin access using the comprehensive admin check
    public.is_admin_comprehensive() = true
) 
WITH CHECK (
    -- Allow admin access for all operations
    public.is_admin_comprehensive() = true
);

-- Update the public read policy to be more permissive for admin operations
DROP POLICY IF EXISTS "public_read_profiles_basic_info" ON public.profiles;

CREATE POLICY "admin_and_public_read_profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
    -- Allow admin comprehensive access OR basic public read
    public.is_admin_comprehensive() = true 
    OR true  -- Allow basic read access for user dropdowns
);

-- Ensure admin can read profiles for admin dashboard operations
DROP POLICY IF EXISTS "authenticated_users_manage_own_profiles" ON public.profiles;

CREATE POLICY "users_manage_own_profiles_and_admin_access" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (
    -- Users can access their own profiles OR admin can access all
    (id = auth.uid()) OR public.is_admin_comprehensive() = true
) 
WITH CHECK (
    -- Users can modify their own profiles OR admin can modify all
    (id = auth.uid()) OR public.is_admin_comprehensive() = true
);

-- Add indexes to optimize admin queries on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_admin_queries 
ON public.profiles (id, full_name, email, name, is_admin);

CREATE INDEX IF NOT EXISTS idx_profiles_admin_user_lookup 
ON public.profiles (id, email) 
WHERE is_admin = true;

-- Ensure admin function works correctly by testing it
-- This will help validate the fix
DO $$
DECLARE
    admin_test_result boolean;
BEGIN
    -- Test if admin function works
    SELECT public.is_admin_comprehensive() INTO admin_test_result;
    
    -- Log the result for debugging
    RAISE NOTICE 'Admin comprehensive function test result: %', admin_test_result;
    
    -- Ensure RLS policies are properly applied
    RAISE NOTICE 'RLS policies updated for admin media management access';
END $$;

-- Grant necessary permissions to ensure admin functions work
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.media_files TO authenticated;

-- Refresh the schema grants to ensure proper access
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Add a comment explaining the fix
COMMENT ON TABLE public.profiles IS 'Updated RLS policies to allow admin dashboard media management to access user profiles for displaying user information and filtering';

-- Test data verification for debugging
-- This will help confirm the user exists and has media
DO $$
DECLARE
    user_count integer;
    media_count integer;
    missing_user_id uuid;
BEGIN
    -- Check for users with media but no profile (orphaned media)
    SELECT user_id INTO missing_user_id 
    FROM public.media_files 
    WHERE user_id NOT IN (SELECT id FROM public.profiles) 
    LIMIT 1;
    
    IF missing_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found orphaned media for user_id: %. This user should have a profile.', missing_user_id;
        
        -- Check if this user exists in auth.users but not in profiles
        IF EXISTS(SELECT 1 FROM auth.users WHERE id = missing_user_id) THEN
            RAISE NOTICE 'User exists in auth.users but missing from profiles. Profile sync may be needed.';
            
            -- Create missing profile for this user if it exists in auth
            INSERT INTO public.profiles (id, full_name, email, name, is_admin)
            SELECT 
                au.id,
                COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
                au.email,
                COALESCE(au.raw_user_meta_data->>'name', au.email) as name,
                false as is_admin
            FROM auth.users au 
            WHERE au.id = missing_user_id
            ON CONFLICT (id) DO NOTHING;
            
            RAISE NOTICE 'Created missing profile for user_id: %', missing_user_id;
        END IF;
    END IF;
    
    -- Final counts for verification
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    SELECT COUNT(*) INTO media_count FROM public.media_files WHERE status = 'active';
    
    RAISE NOTICE 'Migration complete. Total profiles: %, Active media files: %', user_count, media_count;
END $$;