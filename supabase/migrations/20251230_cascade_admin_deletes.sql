-- Migration: Configure cascading deletes for admin_profiles
-- This ensures that when an admin user is deleted, related records are handled properly

-- Add ON DELETE CASCADE to admin_profiles if not already set
-- This will automatically delete the auth.users record when admin_profile is deleted
-- Note: We're deleting admin_profile first, not auth.users, so this is for safety

-- First, let's ensure the admin_profiles table has proper constraints
-- The user_id should cascade delete when the auth user is removed
-- But since we're deleting the profile first, we don't need to modify this

-- Add a trigger to also delete the auth.users record when admin_profile is deleted
CREATE OR REPLACE FUNCTION delete_admin_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the corresponding auth.users record
  DELETE FROM auth.users WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_admin_profile_delete ON admin_profiles;

CREATE TRIGGER on_admin_profile_delete
  AFTER DELETE ON admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION delete_admin_auth_user();
