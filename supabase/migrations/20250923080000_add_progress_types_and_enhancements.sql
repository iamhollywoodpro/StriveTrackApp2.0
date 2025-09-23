-- Schema Analysis: media_files table exists with basic media storage
-- Integration Type: Enhancement to add progress tracking types
-- Dependencies: existing media_files table, profiles table

-- Add progress type enum for better categorization
CREATE TYPE public.progress_type AS ENUM ('before', 'during', 'after', 'progress');

-- Add progress_type column to existing media_files table
ALTER TABLE public.media_files
ADD COLUMN progress_type public.progress_type DEFAULT 'progress'::public.progress_type;

-- Add privacy level enum and column
CREATE TYPE public.privacy_level AS ENUM ('private', 'friends', 'public');

ALTER TABLE public.media_files
ADD COLUMN privacy_level public.privacy_level DEFAULT 'private'::public.privacy_level;

-- Add description/notes column for better context
ALTER TABLE public.media_files
ADD COLUMN description TEXT;

-- Add index for progress_type for better filtering performance
CREATE INDEX idx_media_files_progress_type ON public.media_files(progress_type);
CREATE INDEX idx_media_files_privacy_level ON public.media_files(privacy_level);

-- Add composite index for user queries with progress type filtering
CREATE INDEX idx_media_files_user_progress ON public.media_files(user_id, progress_type, uploaded_at DESC);

-- Update the existing RLS policies remain the same since we're just adding columns
-- No need to recreate as existing policies still apply to the enhanced table