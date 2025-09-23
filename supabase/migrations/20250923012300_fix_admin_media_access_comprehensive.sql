-- Fix Admin Media Access and Add Sample Data
-- Migration: 20250923012300_fix_admin_media_access_comprehensive.sql

-- 1. Create comprehensive admin function that works reliably
CREATE OR REPLACE FUNCTION public.is_admin_comprehensive()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    -- Check admin role in user_profiles first
    (SELECT role = 'admin' FROM public.user_profiles WHERE id = auth.uid()),
    -- Fallback to hardcoded admin email check
    (SELECT email = 'iamhollywoodpro@protonmail.com' FROM auth.users WHERE id = auth.uid()),
    FALSE
  );
$$;

-- 2. Update admin role for the admin user if not already set
UPDATE public.user_profiles 
SET role = 'admin'
WHERE email = 'iamhollywoodpro@protonmail.com' 
  AND role != 'admin';

-- 3. Drop existing RLS policies for media_files
DROP POLICY IF EXISTS "admin_full_access_media_files" ON public.media_files;
DROP POLICY IF EXISTS "users_manage_own_media_files" ON public.media_files;

-- 4. Create new comprehensive RLS policies for media_files
CREATE POLICY "admin_comprehensive_access_media_files"
ON public.media_files
FOR ALL
TO authenticated
USING (is_admin_comprehensive())
WITH CHECK (is_admin_comprehensive());

CREATE POLICY "users_own_media_files_access"
ON public.media_files
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5. Ensure RLS is enabled
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- 6. Add sample media files for testing admin dashboard
INSERT INTO public.media_files (
  user_id, 
  filename, 
  file_path, 
  file_size, 
  media_type, 
  mime_type, 
  status
) VALUES 
-- Sample media for admin user (if exists)
(
  COALESCE(
    (SELECT id FROM public.user_profiles WHERE email = 'iamhollywoodpro@protonmail.com' LIMIT 1),
    (SELECT id FROM public.user_profiles LIMIT 1)
  ),
  'admin_sample_photo.jpg',
  'sample/admin_sample_photo.jpg',
  2048000,
  'image',
  'image/jpeg',
  'active'
),
-- Sample media for regular user
(
  COALESCE(
    (SELECT id FROM public.user_profiles WHERE email != 'iamhollywoodpro@protonmail.com' LIMIT 1),
    (SELECT id FROM public.user_profiles LIMIT 1)
  ),
  'user_progress_photo.jpg',
  'sample/user_progress_photo.jpg',
  1536000,
  'image',
  'image/jpeg',
  'active'
),
(
  COALESCE(
    (SELECT id FROM public.user_profiles WHERE email != 'iamhollywoodpro@protonmail.com' LIMIT 1),
    (SELECT id FROM public.user_profiles LIMIT 1)
  ),
  'workout_video.mp4',
  'sample/workout_video.mp4',
  15728640,
  'video',
  'video/mp4',
  'active'
),
-- Sample flagged content
(
  COALESCE(
    (SELECT id FROM public.user_profiles WHERE email != 'iamhollywoodpro@protonmail.com' LIMIT 1),
    (SELECT id FROM public.user_profiles LIMIT 1)
  ),
  'flagged_content.jpg',
  'sample/flagged_content.jpg',
  1024000,
  'image',
  'image/jpeg',
  'flagged'
)
ON CONFLICT DO NOTHING;

-- 7. Update flagged_by for flagged sample content
UPDATE public.media_files 
SET flagged_by = (SELECT id FROM public.user_profiles WHERE role = 'admin' LIMIT 1),
    flagged_reason = 'Inappropriate content - Admin review'
WHERE status = 'flagged' 
  AND flagged_by IS NULL;

-- 8. Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_files TO authenticated;
GRANT SELECT ON public.user_profiles TO authenticated;

-- 9. Create index for better performance on admin queries
CREATE INDEX IF NOT EXISTS idx_media_files_admin_queries 
ON public.media_files (status, uploaded_at DESC, user_id);

-- 10. Add comments for documentation
COMMENT ON FUNCTION public.is_admin_comprehensive() IS 'Comprehensive admin check that tries multiple methods for reliability';
COMMENT ON POLICY "admin_comprehensive_access_media_files" ON public.media_files IS 'Allows admin users comprehensive access to all media files';
COMMENT ON POLICY "users_own_media_files_access" ON public.media_files IS 'Allows users to manage their own media files';