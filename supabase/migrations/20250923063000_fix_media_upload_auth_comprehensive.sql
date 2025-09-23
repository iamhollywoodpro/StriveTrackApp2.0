-- Location: supabase/migrations/20250923063000_fix_media_upload_auth_comprehensive.sql
-- Schema Analysis: profiles, media_files, achievements, user_achievements tables exist
-- Integration Type: RLS policy enhancement for media upload authentication
-- Dependencies: profiles, media_files, achievements, user_achievements

-- Fix RLS policies to ensure media upload functionality works properly
-- The core issue is that users need to be able to read their own profile data
-- and access achievements/media files without circular dependency issues

-- Create helper function for comprehensive admin checks (queries auth.users metadata)
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

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "admin_comprehensive_access_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_manage_own_profiles" ON public.profiles;
DROP POLICY IF EXISTS "public_can_read_profiles" ON public.profiles;

-- Pattern 1: Core User Tables - Simple policies for profiles table
CREATE POLICY "users_manage_own_profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow public read access for basic profile info (needed for media upload validation)
CREATE POLICY "public_can_read_basic_profiles"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Admin comprehensive access using safe function
CREATE POLICY "admin_comprehensive_access_profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin_comprehensive())
WITH CHECK (public.is_admin_comprehensive());

-- Fix achievements policies - remove existing problematic ones
DROP POLICY IF EXISTS "authenticated_users_can_view_achievements" ON public.achievements;
DROP POLICY IF EXISTS "public_can_read_achievements" ON public.achievements;
DROP POLICY IF EXISTS "admin_full_access_achievements" ON public.achievements;

-- Pattern 4: Public read for achievements (needed for points calculation)
CREATE POLICY "public_can_read_achievements"
ON public.achievements
FOR SELECT
TO public
USING (true);

-- Admin can manage achievements
CREATE POLICY "admin_comprehensive_access_achievements"
ON public.achievements
FOR ALL
TO authenticated
USING (public.is_admin_comprehensive())
WITH CHECK (public.is_admin_comprehensive());

-- Fix user_achievements policies
DROP POLICY IF EXISTS "users_manage_own_user_achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "admin_full_access_user_achievements" ON public.user_achievements;

-- Pattern 2: Simple user ownership for user achievements
CREATE POLICY "users_manage_own_user_achievements"
ON public.user_achievements
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin comprehensive access for user achievements
CREATE POLICY "admin_comprehensive_access_user_achievements"
ON public.user_achievements
FOR ALL
TO authenticated
USING (public.is_admin_comprehensive())
WITH CHECK (public.is_admin_comprehensive());

-- Fix media_files policies (these are already correctly set but let's ensure consistency)
DROP POLICY IF EXISTS "admin_comprehensive_access_media_files" ON public.media_files;
DROP POLICY IF EXISTS "users_manage_own_media_files" ON public.media_files;

-- Pattern 2: Simple user ownership for media files
CREATE POLICY "users_manage_own_media_files"
ON public.media_files
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin comprehensive access for media files
CREATE POLICY "admin_comprehensive_access_media_files"
ON public.media_files
FOR ALL
TO authenticated
USING (public.is_admin_comprehensive())
WITH CHECK (public.is_admin_comprehensive());

-- Ensure storage policies are properly set for user-media bucket
-- Users can view their own files
DROP POLICY IF EXISTS "users_view_own_files" ON storage.objects;
CREATE POLICY "users_view_own_files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'user-media' AND owner = auth.uid());

-- Users can upload to their own folder
DROP POLICY IF EXISTS "users_upload_own_files" ON storage.objects;
CREATE POLICY "users_upload_own_files" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'user-media' 
    AND owner = auth.uid()
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own files
DROP POLICY IF EXISTS "users_update_own_files" ON storage.objects;
CREATE POLICY "users_update_own_files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'user-media' AND owner = auth.uid())
WITH CHECK (bucket_id = 'user-media' AND owner = auth.uid());

-- Users can delete their own files  
DROP POLICY IF EXISTS "users_delete_own_files" ON storage.objects;
CREATE POLICY "users_delete_own_files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'user-media' AND owner = auth.uid());

-- Admin comprehensive access for storage
DROP POLICY IF EXISTS "admin_comprehensive_storage_access" ON storage.objects;
CREATE POLICY "admin_comprehensive_storage_access"
ON storage.objects
FOR ALL
TO authenticated
USING (public.is_admin_comprehensive())
WITH CHECK (public.is_admin_comprehensive());