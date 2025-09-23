-- Location: supabase/migrations/20250923135000_fix_admin_authentication_comprehensive.sql
-- Schema Analysis: Existing profiles table with is_admin column, existing admin functions
-- Integration Type: Modification - Fix admin authentication functions
-- Dependencies: profiles table, auth.users table, existing debug_admin_access function

-- Drop and recreate problematic admin functions with better error handling and debugging
DROP FUNCTION IF EXISTS public.debug_admin_access();
DROP FUNCTION IF EXISTS public.is_admin_comprehensive();

-- Create improved admin verification function with comprehensive checks
CREATE OR REPLACE FUNCTION public.is_admin_comprehensive()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $function$
DECLARE
    current_user_id UUID;
    profile_is_admin BOOLEAN := false;
    auth_meta_admin BOOLEAN := false;
    email_is_admin BOOLEAN := false;
    result BOOLEAN := false;
BEGIN
    -- Get current authenticated user ID
    current_user_id := auth.uid();
    
    -- Return false if no authenticated user
    IF current_user_id IS NULL THEN
        RAISE NOTICE 'is_admin_comprehensive: No authenticated user found';
        RETURN false;
    END IF;

    -- Check 1: Profile table admin status
    SELECT COALESCE(is_admin, false) INTO profile_is_admin
    FROM public.profiles 
    WHERE id = current_user_id;

    -- Check 2: Auth metadata admin status  
    SELECT EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = current_user_id 
        AND (au.raw_user_meta_data->>'role' = 'admin' 
             OR au.raw_app_meta_data->>'role' = 'admin')
    ) INTO auth_meta_admin;

    -- Check 3: Specific admin email check
    SELECT EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = current_user_id 
        AND au.email = 'iamhollywoodpro@protonmail.com'
    ) INTO email_is_admin;

    -- User is admin if ANY check passes
    result := profile_is_admin OR auth_meta_admin OR email_is_admin;
    
    RAISE NOTICE 'Admin Check - User ID: %, Profile Admin: %, Meta Admin: %, Email Admin: %, Final Result: %', 
        current_user_id, profile_is_admin, auth_meta_admin, email_is_admin, result;
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'is_admin_comprehensive error: %', SQLERRM;
        RETURN false;
END;
$function$;

-- Create comprehensive debug function with detailed output
CREATE OR REPLACE FUNCTION public.debug_admin_access()
RETURNS TABLE(
    user_id UUID, 
    is_admin_comprehensive BOOLEAN, 
    email TEXT, 
    profile_is_admin BOOLEAN, 
    auth_meta_role TEXT, 
    auth_app_role TEXT,
    profile_exists BOOLEAN,
    auth_user_exists BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    RAISE NOTICE 'debug_admin_access: Starting check for user %', current_user_id;
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE 'debug_admin_access: No authenticated user found';
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        current_user_id as user_id,
        public.is_admin_comprehensive() as is_admin_comprehensive,
        au.email as email,
        COALESCE(p.is_admin, false) as profile_is_admin,
        au.raw_user_meta_data->>'role' as auth_meta_role,
        au.raw_app_meta_data->>'role' as auth_app_role,
        (p.id IS NOT NULL) as profile_exists,
        (au.id IS NOT NULL) as auth_user_exists
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE au.id = current_user_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'debug_admin_access error: %', SQLERRM;
        RETURN;
END;
$function$;

-- Create or update admin access verification function
CREATE OR REPLACE FUNCTION public.verify_admin_access()
RETURNS TABLE(
    status TEXT,
    user_id UUID,
    email TEXT,
    is_admin BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    current_user_id UUID;
    user_email TEXT;
    admin_status BOOLEAN;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN QUERY SELECT 
            'error'::TEXT, 
            NULL::UUID, 
            NULL::TEXT, 
            false::BOOLEAN,
            'No authenticated user session found'::TEXT;
        RETURN;
    END IF;

    -- Get user details
    SELECT au.email INTO user_email 
    FROM auth.users au 
    WHERE au.id = current_user_id;

    -- Check admin status
    admin_status := public.is_admin_comprehensive();
    
    IF admin_status THEN
        RETURN QUERY SELECT 
            'success'::TEXT, 
            current_user_id, 
            user_email, 
            true::BOOLEAN,
            'Admin access verified successfully'::TEXT;
    ELSE
        RETURN QUERY SELECT 
            'denied'::TEXT, 
            current_user_id, 
            user_email, 
            false::BOOLEAN,
            'User does not have admin privileges'::TEXT;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'error'::TEXT, 
            current_user_id, 
            user_email, 
            false::BOOLEAN,
            format('Database error: %s', SQLERRM)::TEXT;
END;
$function$;

-- Update existing RLS policies to use the improved admin function if needed
-- Note: Only update if there are policies that reference the old function

-- Test the functions by creating a simple verification
DO $$
DECLARE
    admin_user_id UUID;
    test_result RECORD;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id 
    FROM public.profiles 
    WHERE email = 'iamhollywoodpro@protonmail.com' 
    AND is_admin = true;
    
    IF admin_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found admin user in profiles: %', admin_user_id;
        
        -- Verify the auth.users entry exists
        IF EXISTS (SELECT 1 FROM auth.users WHERE id = admin_user_id) THEN
            RAISE NOTICE 'Admin user exists in auth.users';
        ELSE
            RAISE NOTICE 'WARNING: Admin user missing from auth.users';
        END IF;
    ELSE
        RAISE NOTICE 'WARNING: No admin user found in profiles table';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test verification error: %', SQLERRM;
END $$;

-- Comment explaining the fix
COMMENT ON FUNCTION public.is_admin_comprehensive() IS 'Comprehensive admin verification with multiple checks: profile is_admin flag, auth metadata roles, and specific admin email. Includes detailed logging for debugging authentication issues.';
COMMENT ON FUNCTION public.debug_admin_access() IS 'Enhanced debug function that provides detailed information about admin authentication status, including profile existence and auth user data.';
COMMENT ON FUNCTION public.verify_admin_access() IS 'User-friendly admin verification function that returns structured status information for admin dashboard authentication.';