-- Fix recursive RLS policies
-- Created: 2025-12-30

-- 1. Create a secure function to get the current user's admin role
-- This function runs with security definer to bypass RLS when checking the role
CREATE OR REPLACE FUNCTION public.get_my_admin_role()
RETURNS public.admin_role AS $$
DECLARE
  v_role public.admin_role;
BEGIN
  SELECT role INTO v_role
  FROM public.admin_profiles
  WHERE user_id = auth.uid()
  AND is_active = true;
  
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_admin_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_admin_role TO service_role;

-- 2. Update admin_profiles policies to avoid recursion
-- Drop the recursive policy
DROP POLICY IF EXISTS "Super admins can read all profiles" ON admin_profiles;

-- Create the new non-recursive policy
CREATE POLICY "Super admins can read all profiles"
  ON admin_profiles
  FOR SELECT
  TO authenticated
  USING (
    public.get_my_admin_role() = 'super_admin'
  );

-- 3. Update store_settings policies to avoid recursion via admin_profiles lookup
DROP POLICY IF EXISTS "Admins can manage store settings" ON store_settings;

CREATE POLICY "Admins can manage store settings"
    ON store_settings
    FOR ALL
    USING (
        public.get_my_admin_role() IN ('super_admin', 'admin', 'manager', 'staff')
    );
