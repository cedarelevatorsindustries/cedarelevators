-- Migration: Add account deletion fields
-- Run this migration to support 30-day retention account deletion

-- Add account deletion fields to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS scheduled_deletion_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Add account deletion fields to business_profiles  
ALTER TABLE business_profiles
ADD COLUMN IF NOT EXISTS scheduled_deletion_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Create index for efficient querying of accounts to delete
CREATE INDEX IF NOT EXISTS idx_user_profiles_scheduled_deletion 
ON user_profiles(scheduled_deletion_date) 
WHERE scheduled_deletion_date IS NOT NULL AND is_deleted = FALSE;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.scheduled_deletion_date IS 'Date when account will be permanently deleted (30 days after deletion request)';
COMMENT ON COLUMN user_profiles.deletion_requested_at IS 'When the user requested account deletion';
COMMENT ON COLUMN user_profiles.is_deleted IS 'Whether the account has been permanently deleted';
