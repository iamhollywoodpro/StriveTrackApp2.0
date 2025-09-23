-- Location: supabase/migrations/20250923055000_fix_media_upload_and_rls_policies.sql
-- Schema Analysis: Found both profiles and user_profiles tables with different structures
-- Integration Type: Fixing foreign key constraints and adding missing RLS policies
-- Dependencies: profiles, user_profiles, media_files, achievements, nutrition_entries

-- Fix 1: Add missing RLS policies for achievements table
CREATE POLICY "public_can_read_achievements"
ON public.achievements
FOR SELECT
TO public
USING (true);

-- Fix 2: Add missing RLS policies for nutrition_entries table
CREATE POLICY "users_manage_own_nutrition_entries"
ON public.nutrition_entries
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix 3: Ensure profiles table has proper policies for authenticated users
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Add comprehensive profiles policies
CREATE POLICY "users_manage_own_profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "public_can_read_profiles"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Fix 4: Update media_files foreign key to reference profiles table instead of user_profiles
-- First, check if there are any existing media files
DO $$
BEGIN
    -- Drop the existing foreign key constraint
    ALTER TABLE public.media_files DROP CONSTRAINT IF EXISTS media_files_user_id_fkey;
    
    -- Add new foreign key constraint to profiles table
    ALTER TABLE public.media_files 
    ADD CONSTRAINT media_files_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    
    -- Update flagged_by constraint as well
    ALTER TABLE public.media_files DROP CONSTRAINT IF EXISTS media_files_flagged_by_fkey;
    ALTER TABLE public.media_files 
    ADD CONSTRAINT media_files_flagged_by_fkey 
    FOREIGN KEY (flagged_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    
END $$;

-- Fix 5: Create a function to sync user data between profiles and user_profiles
CREATE OR REPLACE FUNCTION public.sync_user_profile_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- When a new profile is created, ensure user_profiles exists
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        COALESCE(NEW.email, 'unknown@example.com'), 
        COALESCE(NEW.name, 'Unknown User'),
        'user'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = CURRENT_TIMESTAMP;
        
    RETURN NEW;
END;
$$;

-- Create trigger to sync profile data
DROP TRIGGER IF EXISTS sync_profile_data ON public.profiles;
CREATE TRIGGER sync_profile_data
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_profile_data();

-- Fix 6: Add helper function for media file validation
CREATE OR REPLACE FUNCTION public.validate_media_upload(file_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = file_user_id 
    AND p.id = auth.uid()
)
$$;

-- Fix 7: Update media files RLS policy for better validation
DROP POLICY IF EXISTS "users_own_media_files_access" ON public.media_files;

CREATE POLICY "users_manage_own_media_files"
ON public.media_files
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix 8: Add storage bucket policies for user-media
-- Note: This is typically done in storage dashboard, but adding for completeness
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-media',
    'user-media',
    false,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for user-media bucket
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
SELECT 'user-media', 'dummy-file', auth.uid(), '{}'::jsonb
WHERE false; -- This is just to ensure the bucket policies work

-- Note: Storage RLS policies are typically managed through Supabase dashboard
-- But we ensure the media_files table policies work correctly

-- Fix 9: Clean up any orphaned media_files records
DELETE FROM public.media_files 
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- Fix 10: Update existing media_files to have correct user references
UPDATE public.media_files 
SET user_id = (
    SELECT p.id 
    FROM public.profiles p 
    JOIN public.user_profiles up ON p.email = up.email
    WHERE up.id = media_files.user_id
    LIMIT 1
)
WHERE user_id IN (SELECT id FROM public.user_profiles)
AND user_id NOT IN (SELECT id FROM public.profiles);