-- Schema Analysis: Existing 'profiles' and 'user_profiles' tables with user data inconsistency
-- Integration Type: Modificative - Fix user account visibility and admin dashboard issues 
-- Dependencies: profiles, user_profiles tables, existing functions

-- Step 1: Create proper email update and user consolidation
-- Fix the email domain issue and consolidate user data

DO $$
DECLARE
    existing_admin_id UUID;
BEGIN
    -- Find the existing admin user with protonmail domain
    SELECT id INTO existing_admin_id 
    FROM public.profiles 
    WHERE email LIKE 'iamhollywoodpro%' AND is_admin = true 
    LIMIT 1;

    -- If the admin exists in profiles but not in user_profiles, create the user_profiles entry
    IF existing_admin_id IS NOT NULL THEN
        -- Insert or update user_profiles with the correct admin data
        INSERT INTO public.user_profiles (
            id, email, full_name, role, is_active, created_at
        )
        SELECT 
            p.id,
            p.email,
            COALESCE(p.name, 'Admin User'),
            CASE WHEN p.is_admin THEN 'admin'::user_role ELSE 'user'::user_role END,
            true,
            COALESCE(p.created_at, CURRENT_TIMESTAMP)
        FROM public.profiles p
        WHERE p.id = existing_admin_id
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active,
            updated_at = CURRENT_TIMESTAMP;

        RAISE NOTICE 'Admin user consolidated: %', existing_admin_id;
    END IF;
END $$;

-- Step 2: Create a comprehensive user management function for admin dashboard
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE(
    id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    source_table TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only allow admin users to call this function
    IF NOT public.is_admin_comprehensive() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    -- Return consolidated user data from both tables
    RETURN QUERY
    SELECT 
        up.id,
        up.email,
        up.full_name,
        up.role::TEXT,
        COALESCE(up.is_active, true) as is_active,
        up.created_at,
        up.updated_at,
        'user_profiles'::TEXT as source_table
    FROM public.user_profiles up
    WHERE up.email IS NOT NULL

    UNION ALL

    SELECT 
        p.id,
        p.email,
        COALESCE(p.name, 'Unknown User') as full_name,
        CASE WHEN p.is_admin THEN 'admin' ELSE 'user' END as role,
        true as is_active,
        p.created_at,
        p.created_at as updated_at,
        'profiles'::TEXT as source_table
    FROM public.profiles p
    WHERE p.email IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM public.user_profiles up2 WHERE up2.id = p.id
    )

    ORDER BY created_at DESC;
END;
$$;

-- Step 3: Create user deletion function for admin
CREATE OR REPLACE FUNCTION public.admin_delete_user(user_id_to_delete UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_email TEXT;
    current_user_id UUID := auth.uid();
BEGIN
    -- Only allow admin users to call this function
    IF NOT public.is_admin_comprehensive() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    -- Prevent admin from deleting themselves
    IF user_id_to_delete = current_user_id THEN
        RAISE EXCEPTION 'Cannot delete your own account';
    END IF;

    -- Get user email for logging
    SELECT email INTO user_email 
    FROM public.user_profiles 
    WHERE id = user_id_to_delete
    UNION ALL
    SELECT email 
    FROM public.profiles 
    WHERE id = user_id_to_delete AND NOT EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id = user_id_to_delete
    )
    LIMIT 1;

    -- Delete user data in dependency order (children first)
    DELETE FROM public.user_achievements WHERE user_id = user_id_to_delete;
    DELETE FROM public.habit_completions WHERE user_id = user_id_to_delete;
    DELETE FROM public.habits WHERE user_id = user_id_to_delete;
    DELETE FROM public.goals WHERE user_id = user_id_to_delete;
    DELETE FROM public.nutrition_entries WHERE user_id = user_id_to_delete;
    DELETE FROM public.progress_media WHERE user_id = user_id_to_delete;
    DELETE FROM public.social_posts WHERE user_id = user_id_to_delete;
    DELETE FROM public.friendships WHERE user_id = user_id_to_delete OR friend_id = user_id_to_delete;
    DELETE FROM public.challenges WHERE creator_id = user_id_to_delete;
    DELETE FROM public.progress_comparisons WHERE user_id = user_id_to_delete;
    DELETE FROM public.media_files WHERE user_id = user_id_to_delete;

    -- Delete from user tables
    DELETE FROM public.user_profiles WHERE id = user_id_to_delete;
    DELETE FROM public.profiles WHERE id = user_id_to_delete;

    -- Delete from auth.users (this will cascade to related auth tables)
    DELETE FROM auth.users WHERE id = user_id_to_delete;

    RAISE NOTICE 'User deleted: % (%)', user_email, user_id_to_delete;
    RETURN TRUE;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error deleting user: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- Step 4: Clean up any remaining demo data comprehensively
DO $$
DECLARE
    demo_user_ids UUID[];
    demo_count INTEGER;
BEGIN
    -- Identify demo users by common demo patterns
    SELECT ARRAY_AGG(DISTINCT u.id) INTO demo_user_ids
    FROM (
        -- From user_profiles
        SELECT id FROM public.user_profiles 
        WHERE email LIKE '%demo%' 
           OR email LIKE '%test%' 
           OR email LIKE '%example%'
           OR full_name LIKE '%Demo%'
           OR full_name LIKE '%Test%'
        
        UNION
        
        -- From profiles  
        SELECT id FROM public.profiles 
        WHERE email LIKE '%demo%' 
           OR email LIKE '%test%' 
           OR email LIKE '%example%'
           OR name LIKE '%Demo%'
           OR name LIKE '%Test%'
    ) u;

    demo_count := array_length(demo_user_ids, 1);

    IF demo_count > 0 THEN
        RAISE NOTICE 'Found % demo users to clean up', demo_count;

        -- Delete demo user data in dependency order
        DELETE FROM public.user_achievements WHERE user_id = ANY(demo_user_ids);
        DELETE FROM public.habit_completions WHERE user_id = ANY(demo_user_ids);  
        DELETE FROM public.habits WHERE user_id = ANY(demo_user_ids);
        DELETE FROM public.goals WHERE user_id = ANY(demo_user_ids);
        DELETE FROM public.nutrition_entries WHERE user_id = ANY(demo_user_ids);
        DELETE FROM public.progress_media WHERE user_id = ANY(demo_user_ids);
        DELETE FROM public.social_posts WHERE user_id = ANY(demo_user_ids);
        DELETE FROM public.friendships WHERE user_id = ANY(demo_user_ids) OR friend_id = ANY(demo_user_ids);
        DELETE FROM public.challenges WHERE creator_id = ANY(demo_user_ids);
        DELETE FROM public.progress_comparisons WHERE user_id = ANY(demo_user_ids);
        DELETE FROM public.media_files WHERE user_id = ANY(demo_user_ids);

        -- Delete demo posts and content
        DELETE FROM public.social_posts WHERE content LIKE '%demo%' OR content LIKE '%test%';

        -- Delete demo achievements that are not user-specific
        DELETE FROM public.achievements WHERE name LIKE '%Demo%' OR description LIKE '%demo%';

        -- Clean up demo user accounts
        DELETE FROM public.user_profiles WHERE id = ANY(demo_user_ids);
        DELETE FROM public.profiles WHERE id = ANY(demo_user_ids);
        DELETE FROM auth.users WHERE id = ANY(demo_user_ids);

        RAISE NOTICE 'Cleaned up % demo users and their data', demo_count;
    ELSE
        RAISE NOTICE 'No demo users found to clean up';
    END IF;
END $$;

-- Step 5: Update existing RLS policies to work with the new functions
DROP POLICY IF EXISTS "admin_comprehensive_access_user_profiles" ON public.user_profiles;

CREATE POLICY "admin_comprehensive_access_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (public.is_admin_comprehensive())
WITH CHECK (public.is_admin_comprehensive());

-- Create RLS policy for profiles table admin access (if not exists)
DROP POLICY IF EXISTS "admin_comprehensive_access_profiles" ON public.profiles;

CREATE POLICY "admin_comprehensive_access_profiles"  
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin_comprehensive())
WITH CHECK (public.is_admin_comprehensive());

-- Step 6: Create a helper function to check if user exists and needs cleanup
CREATE OR REPLACE FUNCTION public.check_user_account_status(user_email_input TEXT)
RETURNS TABLE(
    found_in_profiles BOOLEAN,
    found_in_user_profiles BOOLEAN,
    profiles_email TEXT,
    user_profiles_email TEXT,
    is_admin_in_profiles BOOLEAN,
    role_in_user_profiles TEXT,
    needs_consolidation BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    p_exists BOOLEAN := FALSE;
    up_exists BOOLEAN := FALSE;
    p_email TEXT;
    up_email TEXT;
    p_is_admin BOOLEAN := FALSE;
    up_role TEXT;
BEGIN
    -- Check profiles table
    SELECT email, is_admin INTO p_email, p_is_admin
    FROM public.profiles 
    WHERE email ILIKE user_email_input 
    LIMIT 1;
    
    p_exists := FOUND;

    -- Check user_profiles table  
    SELECT email, role::TEXT INTO up_email, up_role
    FROM public.user_profiles 
    WHERE email ILIKE user_email_input
    LIMIT 1;
    
    up_exists := FOUND;

    RETURN QUERY SELECT 
        p_exists as found_in_profiles,
        up_exists as found_in_user_profiles,
        p_email as profiles_email,
        up_email as user_profiles_email,
        p_is_admin as is_admin_in_profiles,
        up_role as role_in_user_profiles,
        (p_exists AND NOT up_exists) as needs_consolidation;
END;
$$;

-- Step 7: Final cleanup and completion notice
DO $$
BEGIN
    -- Remove any orphaned data without valid user references
    DELETE FROM public.habits WHERE user_id NOT IN (
        SELECT id FROM public.user_profiles 
        UNION 
        SELECT id FROM public.profiles
    );

    DELETE FROM public.goals WHERE user_id NOT IN (
        SELECT id FROM public.user_profiles 
        UNION 
        SELECT id FROM public.profiles  
    );

    DELETE FROM public.nutrition_entries WHERE user_id NOT IN (
        SELECT id FROM public.user_profiles 
        UNION 
        SELECT id FROM public.profiles
    );

    RAISE NOTICE 'User account consolidation and demo data cleanup completed successfully';
END $$;