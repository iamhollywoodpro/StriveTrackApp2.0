-- Location: supabase/migrations/20241222233000_fitness_app_complete_setup.sql
-- Complete Fitness App Setup with Authentication, Media Storage, and Admin Features

-- 1. Create Custom Types (PostgreSQL Compatible)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'user');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE public.media_type AS ENUM ('image', 'video');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_status') THEN
        CREATE TYPE public.media_status AS ENUM ('active', 'flagged', 'deleted');
    END IF;
END $$;

-- 2. Create user_profiles table (Critical intermediary table)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    bio TEXT,
    height TEXT,
    weight TEXT,
    goals TEXT,
    profile_picture_url TEXT,
    profile_picture_path TEXT,
    role public.user_role DEFAULT 'user'::public.user_role,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create media_files table for tracking user uploads
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    media_type public.media_type NOT NULL,
    status public.media_status DEFAULT 'active'::public.media_status,
    flagged_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    flagged_reason TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create progress_comparisons table
CREATE TABLE IF NOT EXISTS public.progress_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    before_media_id UUID REFERENCES public.media_files(id) ON DELETE SET NULL,
    after_media_id UUID REFERENCES public.media_files(id) ON DELETE SET NULL,
    comparison_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Essential Indexes (Only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON public.media_files(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_status ON public.media_files(status);
CREATE INDEX IF NOT EXISTS idx_media_files_type ON public.media_files(media_type);
CREATE INDEX IF NOT EXISTS idx_progress_comparisons_user_id ON public.progress_comparisons(user_id);

-- 6. Storage Buckets Setup (Safe with conflict resolution)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('profile-images', 'profile-images', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
    ('user-media', 'user-media', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime', 'video/avi'])
ON CONFLICT (id) DO NOTHING;

-- 7. Enable RLS on all tables (Safe operation)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_comparisons ENABLE ROW LEVEL SECURITY;

-- 8. Functions BEFORE RLS Policies
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND au.email = 'iamhollywoodpro@protonmail.com'
)
$$;

-- Automatic profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
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

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language plpgsql;

-- 9. RLS Policies (Drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_view_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_manage_own_media" ON public.media_files;
DROP POLICY IF EXISTS "admins_manage_all_media" ON public.media_files;
DROP POLICY IF EXISTS "users_manage_own_comparisons" ON public.progress_comparisons;

-- user_profiles policies (Pattern 1 - Core User Tables)
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin can view all profiles
CREATE POLICY "admins_view_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_admin_from_auth());

-- media_files policies (Pattern 2 - Simple User Ownership)
CREATE POLICY "users_manage_own_media"
ON public.media_files
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin can view and manage all media
CREATE POLICY "admins_manage_all_media"
ON public.media_files
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- progress_comparisons policies
CREATE POLICY "users_manage_own_comparisons"
ON public.progress_comparisons
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Storage RLS Policies (Drop and recreate)
DROP POLICY IF EXISTS "users_view_own_profile_images" ON storage.objects;
DROP POLICY IF EXISTS "users_upload_profile_images" ON storage.objects;
DROP POLICY IF EXISTS "users_update_own_profile_images" ON storage.objects;
DROP POLICY IF EXISTS "users_delete_own_profile_images" ON storage.objects;
DROP POLICY IF EXISTS "users_view_own_media_files" ON storage.objects;
DROP POLICY IF EXISTS "admins_view_all_media_files" ON storage.objects;
DROP POLICY IF EXISTS "users_upload_media_files" ON storage.objects;
DROP POLICY IF EXISTS "users_update_own_media_files" ON storage.objects;
DROP POLICY IF EXISTS "users_delete_own_media_files" ON storage.objects;
DROP POLICY IF EXISTS "admins_manage_all_media_files" ON storage.objects;

-- Profile Images - Private bucket
CREATE POLICY "users_view_own_profile_images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'profile-images' AND owner = auth.uid());

CREATE POLICY "users_upload_profile_images" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'profile-images' 
    AND owner = auth.uid()
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "users_update_own_profile_images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'profile-images' AND owner = auth.uid());

CREATE POLICY "users_delete_own_profile_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images' AND owner = auth.uid());

-- User Media - Private bucket with admin access
CREATE POLICY "users_view_own_media_files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'user-media' AND owner = auth.uid());

CREATE POLICY "admins_view_all_media_files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'user-media' AND public.is_admin_from_auth());

CREATE POLICY "users_upload_media_files" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'user-media' 
    AND owner = auth.uid()
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "users_update_own_media_files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'user-media' AND owner = auth.uid())
WITH CHECK (bucket_id = 'user-media' AND owner = auth.uid());

CREATE POLICY "users_delete_own_media_files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'user-media' AND owner = auth.uid());

CREATE POLICY "admins_manage_all_media_files"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'user-media' AND public.is_admin_from_auth())
WITH CHECK (bucket_id = 'user-media' AND public.is_admin_from_auth());

-- 10. Triggers (Drop existing triggers first to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_media_files_updated_at ON public.media_files;

-- Create triggers safely
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_files_updated_at
    BEFORE UPDATE ON public.media_files
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Mock Data for Testing (Safe with conflict resolution)
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user_uuid UUID := gen_random_uuid();
BEGIN
    -- Check if admin user already exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'iamhollywoodpro@protonmail.com') THEN
        -- Create auth users with all required fields
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
            is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
            recovery_token, recovery_sent_at, email_change_token_new, email_change,
            email_change_sent_at, email_change_token_current, email_change_confirm_status,
            reauthentication_token, reauthentication_sent_at, phone, phone_change,
            phone_change_token, phone_change_sent_at
        ) VALUES
            (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
             'iamhollywoodpro@protonmail.com', crypt('iampassword@1981', gen_salt('bf', 10)), now(), now(), now(),
             '{"full_name": "Hollywood Pro Admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
             false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);
    END IF;
    
    -- Check if demo user already exists  
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'john.doe@strivetrack.com') THEN
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
            is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
            recovery_token, recovery_sent_at, email_change_token_new, email_change,
            email_change_sent_at, email_change_token_current, email_change_confirm_status,
            reauthentication_token, reauthentication_sent_at, phone, phone_change,
            phone_change_token, phone_change_sent_at
        ) VALUES
            (user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
             'john.doe@strivetrack.com', crypt('StriveTrack2025!', gen_salt('bf', 10)), now(), now(), now(),
             '{"full_name": "John Doe"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
             false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);
    END IF;

EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Mock users already exist, skipping insertion';
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error during mock data creation: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error during mock data creation: %', SQLERRM;
END $$;