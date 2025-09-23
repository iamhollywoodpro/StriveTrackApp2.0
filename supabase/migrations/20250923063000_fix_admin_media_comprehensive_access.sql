-- Location: supabase/migrations/20250923063000_fix_admin_media_comprehensive_access.sql
-- Schema Analysis: media_files, profiles, achievements tables exist with admin RLS policies
-- Integration Type: Enhancement - Fix admin RLS policies for comprehensive access
-- Dependencies: existing media_files, profiles, achievements, user_achievements tables

-- Ensure admin functions are robust and comprehensive
CREATE OR REPLACE FUNCTION public.is_admin_comprehensive()
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
         OR au.email = 'iamhollywoodpro@protonmail.com')
)
OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.is_admin = true
)
$$;

-- Ensure comprehensive admin access to all critical tables
-- Drop existing policies that might be restrictive
DROP POLICY IF EXISTS "admin_comprehensive_access_media_files" ON public.media_files;
DROP POLICY IF EXISTS "admin_full_access_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_access_achievements" ON public.achievements;
DROP POLICY IF EXISTS "admin_access_user_achievements" ON public.user_achievements;

-- Create comprehensive admin policies using the safe Pattern 6A (auth.users metadata)
CREATE POLICY "admin_comprehensive_access_media_files"
ON public.media_files
FOR ALL
TO authenticated
USING (public.is_admin_comprehensive())
WITH CHECK (public.is_admin_comprehensive());

CREATE POLICY "admin_comprehensive_access_profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin_comprehensive())
WITH CHECK (public.is_admin_comprehensive());

CREATE POLICY "admin_comprehensive_access_achievements"
ON public.achievements
FOR ALL
TO authenticated
USING (public.is_admin_comprehensive())
WITH CHECK (public.is_admin_comprehensive());

CREATE POLICY "admin_comprehensive_access_user_achievements"
ON public.user_achievements
FOR ALL
TO authenticated
USING (public.is_admin_comprehensive())
WITH CHECK (public.is_admin_comprehensive());

-- Add admin access to other important tables that might be restricted
CREATE POLICY "admin_comprehensive_access_goals"
ON public.goals
FOR ALL
TO authenticated
USING (public.is_admin_comprehensive())
WITH CHECK (public.is_admin_comprehensive());

CREATE POLICY "admin_comprehensive_access_habits"
ON public.habits
FOR ALL
TO authenticated
USING (public.is_admin_comprehensive())
WITH CHECK (public.is_admin_comprehensive());

CREATE POLICY "admin_comprehensive_access_habit_completions"
ON public.habit_completions
FOR ALL
TO authenticated
USING (public.is_admin_comprehensive())
WITH CHECK (public.is_admin_comprehensive());

-- Ensure storage bucket policies allow admin access (if not already configured)
-- Note: Storage bucket policies are configured in Supabase Dashboard, but we can add helper function
CREATE OR REPLACE FUNCTION public.admin_can_access_storage()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT public.is_admin_comprehensive()
$$;

-- Add function to validate admin access for debugging
CREATE OR REPLACE FUNCTION public.debug_admin_access()
RETURNS TABLE(
    user_id UUID,
    is_admin_comprehensive BOOLEAN,
    email TEXT,
    profile_is_admin BOOLEAN,
    auth_meta_role TEXT,
    auth_app_role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.uid() as user_id,
        public.is_admin_comprehensive() as is_admin_comprehensive,
        au.email as email,
        COALESCE(p.is_admin, false) as profile_is_admin,
        au.raw_user_meta_data->>'role' as auth_meta_role,
        au.raw_app_meta_data->>'role' as auth_app_role
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE au.id = auth.uid();
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Debug admin access error: %', SQLERRM;
        RETURN;
END;
$$;

-- Create helper function for media file admin queries
CREATE OR REPLACE FUNCTION public.get_all_media_for_admin()
RETURNS TABLE(
    id UUID,
    user_id UUID,
    filename TEXT,
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT,
    media_type TEXT,
    status TEXT,
    privacy_level TEXT,
    progress_type TEXT,
    uploaded_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    user_name TEXT,
    user_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT public.is_admin_comprehensive() THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        mf.id,
        mf.user_id,
        mf.filename,
        mf.file_path,
        mf.file_size,
        mf.mime_type,
        mf.media_type::TEXT,
        mf.status::TEXT,
        mf.privacy_level::TEXT,
        mf.progress_type::TEXT,
        mf.uploaded_at,
        mf.updated_at,
        COALESCE(p.full_name, p.name, 'Unknown User') as user_name,
        COALESCE(p.email, 'No email') as user_email
    FROM public.media_files mf
    LEFT JOIN public.profiles p ON mf.user_id = p.id
    ORDER BY mf.uploaded_at DESC;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Get all media for admin error: %', SQLERRM;
        RETURN;
END;
$$;

-- Add comment for clarity
COMMENT ON FUNCTION public.is_admin_comprehensive() IS 'Comprehensive admin check function that verifies admin status from multiple sources';
COMMENT ON FUNCTION public.get_all_media_for_admin() IS 'Admin function to retrieve all media files with user information';
COMMENT ON FUNCTION public.debug_admin_access() IS 'Debug function to help troubleshoot admin access issues';