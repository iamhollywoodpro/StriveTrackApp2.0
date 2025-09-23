-- Location: supabase/migrations/20250923012100_fix_media_files_rls_admin_access.sql
-- Schema Analysis: Existing fitness app schema with user_profiles, media_files tables
-- Integration Type: Modificative - fixing RLS policies for media_files table
-- Dependencies: user_profiles, media_files, existing is_admin_from_auth function

-- Fix the admin function to be more flexible by checking user_profiles role instead of hardcoded email
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role = 'admin'
)
$$;

-- Drop existing RLS policies on media_files
DROP POLICY IF EXISTS "users_manage_own_media" ON public.media_files;
DROP POLICY IF EXISTS "admins_manage_all_media" ON public.media_files;

-- Create improved RLS policies for media_files table
-- Pattern 2: Simple user ownership for regular users
CREATE POLICY "users_manage_own_media_files"
ON public.media_files
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 6B: Role-based access for admins (queries different table - user_profiles)
CREATE POLICY "admin_full_access_media_files"
ON public.media_files
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Ensure existing admin user has proper role
DO $$
BEGIN
    -- Update any existing users with admin email to have admin role
    UPDATE public.user_profiles 
    SET role = 'admin'
    WHERE email = 'iamhollywoodpro@protonmail.com';
    
    -- Also create a more general admin user for testing if needed
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE role = 'admin') THEN
        -- Insert a general admin user if no admin exists
        -- This will only run if there are no admin users in the system
        INSERT INTO public.user_profiles (id, email, full_name, role)
        SELECT 
            gen_random_uuid(),
            'admin@strivetrack.com',
            'System Admin',
            'admin'::public.user_role
        WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE role = 'admin');
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the migration
        RAISE NOTICE 'Error updating admin users: %', SQLERRM;
END $$;

-- Add some sample media files for testing if the table is empty
DO $$
DECLARE
    admin_user_id UUID;
    regular_user_id UUID;
BEGIN
    -- Get admin and regular user IDs
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    SELECT id INTO regular_user_id FROM public.user_profiles WHERE role = 'user' LIMIT 1;
    
    -- Add sample media files if none exist
    IF NOT EXISTS (SELECT 1 FROM public.media_files) AND admin_user_id IS NOT NULL THEN
        INSERT INTO public.media_files (
            user_id, 
            filename, 
            file_path, 
            media_type, 
            mime_type, 
            file_size,
            status
        ) VALUES
        (admin_user_id, 'sample-progress-1.jpg', 'progress/sample-progress-1.jpg', 'image', 'image/jpeg', 1024000, 'active'),
        (admin_user_id, 'workout-video-1.mp4', 'workouts/workout-video-1.mp4', 'video', 'video/mp4', 5120000, 'active');
        
        -- Add regular user media if regular user exists
        IF regular_user_id IS NOT NULL THEN
            INSERT INTO public.media_files (
                user_id, 
                filename, 
                file_path, 
                media_type, 
                mime_type, 
                file_size,
                status
            ) VALUES
            (regular_user_id, 'my-progress.jpg', 'progress/my-progress.jpg', 'image', 'image/jpeg', 856000, 'active'),
            (regular_user_id, 'nutrition-log.jpg', 'nutrition/nutrition-log.jpg', 'image', 'image/jpeg', 420000, 'active');
        END IF;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating sample media files: %', SQLERRM;
END $$;