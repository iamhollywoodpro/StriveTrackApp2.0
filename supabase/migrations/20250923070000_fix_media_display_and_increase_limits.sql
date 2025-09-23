-- FIXED Migration: Remove unauthorized storage.objects operations
-- Migration: 20250923070000_fix_media_display_and_increase_limits.sql

-- IMPORTANT: This migration has been corrected to remove operations requiring superuser permissions
-- Storage bucket policies and settings must be configured through Supabase Dashboard

-- =============================================================================
-- MANUAL CONFIGURATION REQUIRED IN SUPABASE DASHBOARD
-- =============================================================================
-- 1. Go to Storage > Settings in your Supabase Dashboard
-- 2. For bucket "user-media":
--    - Set file size limit: 50MB (52428800 bytes) 
--    - Set allowed MIME types: image/*, video/*
-- 3. Storage RLS policies should already exist via Supabase Dashboard
-- 
-- Note: We cannot modify storage.objects table via SQL migrations as it requires
-- superuser permissions. All storage configuration must be done via Dashboard.
-- =============================================================================

-- Verify media_files table structure is ready for 50MB files and video support
-- (This should already be in place from previous migrations)

-- Add helpful comment for developers
COMMENT ON TABLE media_files IS 'Stores metadata for user-uploaded media files (images and videos). Supports files up to 50MB when configured in Supabase Dashboard.';

-- Ensure RLS policies exist for media_files table (should already exist)
-- These policies allow users to manage their own media files
DO $$ 
BEGIN
    -- Check if the policies exist, create if missing
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'media_files' 
        AND policyname = 'users_manage_own_media_files'
    ) THEN
        CREATE POLICY "users_manage_own_media_files"
        ON media_files
        FOR ALL
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'media_files' 
        AND policyname = 'admin_comprehensive_access_media_files'
    ) THEN
        CREATE POLICY "admin_comprehensive_access_media_files"
        ON media_files
        FOR ALL
        TO authenticated
        USING (is_admin_comprehensive())
        WITH CHECK (is_admin_comprehensive());
    END IF;
END $$;

-- Ensure the media_files table has proper indexes for performance (should already exist)
-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_media_files_user_status ON media_files(user_id, status);
CREATE INDEX IF NOT EXISTS idx_media_files_type_status ON media_files(media_type, status);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_at ON media_files(uploaded_at DESC);

-- Add comment about storage bucket configuration
COMMENT ON INDEX idx_media_files_user_status IS 'Optimizes queries for user media files by status';
COMMENT ON INDEX idx_media_files_type_status IS 'Optimizes queries for media files by type and status';
COMMENT ON INDEX idx_media_files_uploaded_at IS 'Optimizes queries for recently uploaded media files';

-- Migration completed successfully
-- Note: Remember to configure storage bucket settings in Supabase Dashboard