-- Location: supabase/migrations/20250923130000_fix_admin_dashboard_user_access_comprehensive.sql
-- Schema Analysis: Existing media_files and profiles tables with admin functions
-- Integration Type: Enhancement - Adding admin function for user profile access
-- Dependencies: profiles table, existing admin functions (is_admin_comprehensive)

-- Create comprehensive admin function for user profile access that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin_dashboard()
RETURNS TABLE(
    id UUID,
    email TEXT,
    full_name TEXT,
    name TEXT,
    is_admin BOOLEAN,
    created_at TIMESTAMPTZ,
    media_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT public.is_admin_comprehensive() THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required to access user data.';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        COALESCE(p.email, 'No email') as email,
        COALESCE(p.full_name, 'No full name') as full_name,
        COALESCE(p.name, 'No name') as name,
        COALESCE(p.is_admin, false) as is_admin,
        p.created_at,
        COALESCE(media_count.count, 0) as media_count
    FROM public.profiles p
    LEFT JOIN (
        SELECT 
            mf.user_id,
            COUNT(*) as count
        FROM public.media_files mf
        WHERE mf.status != 'deleted'
        GROUP BY mf.user_id
    ) media_count ON p.id = media_count.user_id
    ORDER BY p.created_at DESC;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Get all users for admin dashboard error: %', SQLERRM;
        RETURN;
END;
$$;

-- Create function to get specific user profile data for admin
CREATE OR REPLACE FUNCTION public.get_user_profile_for_admin(user_uuid UUID)
RETURNS TABLE(
    id UUID,
    email TEXT,
    full_name TEXT,
    name TEXT,
    is_admin BOOLEAN,
    bio TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ,
    media_count BIGINT,
    total_points INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT public.is_admin_comprehensive() THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required to access user profile data.';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        COALESCE(p.email, 'No email') as email,
        COALESCE(p.full_name, 'No full name') as full_name,
        COALESCE(p.name, 'No name') as name,
        COALESCE(p.is_admin, false) as is_admin,
        p.bio,
        p.phone,
        p.created_at,
        COALESCE(media_count.count, 0) as media_count,
        COALESCE(p.points, 0) as total_points
    FROM public.profiles p
    LEFT JOIN (
        SELECT 
            mf.user_id,
            COUNT(*) as count
        FROM public.media_files mf
        WHERE mf.status != 'deleted'
        GROUP BY mf.user_id
    ) media_count ON p.id = media_count.user_id
    WHERE p.id = user_uuid;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Get user profile for admin error: %', SQLERRM;
        RETURN;
END;
$$;

-- Enhanced admin media function with better user data integration
CREATE OR REPLACE FUNCTION public.get_all_media_with_users_for_admin()
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
    user_email TEXT,
    user_full_name TEXT,
    user_is_admin BOOLEAN,
    description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT public.is_admin_comprehensive() THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required to access media and user data.';
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
        COALESCE(p.name, p.full_name, split_part(p.email, '@', 1), 'Unknown User') as user_name,
        COALESCE(p.email, 'No email') as user_email,
        COALESCE(p.full_name, p.name, 'No full name') as user_full_name,
        COALESCE(p.is_admin, false) as user_is_admin,
        mf.description
    FROM public.media_files mf
    LEFT JOIN public.profiles p ON mf.user_id = p.id
    ORDER BY mf.uploaded_at DESC;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Get all media with users for admin error: %', SQLERRM;
        RETURN;
END;
$$;

-- Create admin summary function for dashboard insights
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_summary()
RETURNS TABLE(
    total_users BIGINT,
    active_users BIGINT,
    admin_users BIGINT,
    total_media BIGINT,
    active_media BIGINT,
    flagged_media BIGINT,
    deleted_media BIGINT,
    media_images BIGINT,
    media_videos BIGINT,
    recent_uploads BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT public.is_admin_comprehensive() THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required to access dashboard summary.';
    END IF;

    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.profiles) as total_users,
        (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '30 days') as active_users,
        (SELECT COUNT(*) FROM public.profiles WHERE is_admin = true) as admin_users,
        (SELECT COUNT(*) FROM public.media_files) as total_media,
        (SELECT COUNT(*) FROM public.media_files WHERE status = 'active') as active_media,
        (SELECT COUNT(*) FROM public.media_files WHERE status = 'flagged') as flagged_media,
        (SELECT COUNT(*) FROM public.media_files WHERE status = 'deleted') as deleted_media,
        (SELECT COUNT(*) FROM public.media_files WHERE media_type = 'image') as media_images,
        (SELECT COUNT(*) FROM public.media_files WHERE media_type = 'video') as media_videos,
        (SELECT COUNT(*) FROM public.media_files WHERE uploaded_at > NOW() - INTERVAL '7 days') as recent_uploads;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Get admin dashboard summary error: %', SQLERRM;
        RETURN;
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION public.get_all_users_for_admin_dashboard() IS 'Admin-only function to retrieve all user profiles with media counts for the admin dashboard, bypassing RLS policies';
COMMENT ON FUNCTION public.get_user_profile_for_admin(UUID) IS 'Admin-only function to retrieve specific user profile data with comprehensive details';
COMMENT ON FUNCTION public.get_all_media_with_users_for_admin() IS 'Admin-only function to retrieve all media files with user information for admin media management';
COMMENT ON FUNCTION public.get_admin_dashboard_summary() IS 'Admin-only function to provide dashboard summary statistics for admin overview';