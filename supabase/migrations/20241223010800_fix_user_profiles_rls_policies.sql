-- Fix RLS policies for user_profiles table to allow admin access

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_view_all_profiles" ON public.user_profiles;

-- Recreate the admin function to ensure it works correctly
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

-- Create comprehensive admin policy that allows all operations
CREATE POLICY "admin_full_access_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Create user self-management policy
CREATE POLICY "users_manage_own_user_profiles" 
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;

-- Ensure RLS is enabled on the table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Test the admin function (this should return true when run as admin)
-- SELECT public.is_admin_from_auth();

-- Verify policies are created correctly
-- SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'user_profiles';