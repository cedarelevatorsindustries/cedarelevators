-- =====================================================
-- Cedar Elevators - Admin Authentication Schema
-- =====================================================
-- This migration creates the admin authentication system
-- including admin_settings and admin_profiles tables
-- with Row Level Security (RLS) policies
-- =====================================================

-- Create admin_settings table (singleton)
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_completed BOOLEAN NOT NULL DEFAULT false,
  recovery_key_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  singleton_guard BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT singleton_admin_settings_check UNIQUE (singleton_guard)
);

-- Insert initial admin settings row
INSERT INTO admin_settings (singleton_guard, setup_completed)
VALUES (true, false)
ON CONFLICT (singleton_guard) DO NOTHING;

-- Create admin role enum type
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'manager', 'staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create admin_profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_admin_profile UNIQUE (user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON admin_profiles(role);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_is_active ON admin_profiles(is_active);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable Row Level Security
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_settings
-- Allow service role full access (used by server-side functions)
CREATE POLICY "Service role has full access to admin_settings"
  ON admin_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read settings (for setup check)
CREATE POLICY "Authenticated users can read admin_settings"
  ON admin_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for admin_profiles
-- Allow service role full access (used by server-side functions)
CREATE POLICY "Service role has full access to admin_profiles"
  ON admin_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own admin profile"
  ON admin_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow super admins to read all profiles
CREATE POLICY "Super admins can read all profiles"
  ON admin_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- =====================================================
-- Triggers for timestamp management
-- =====================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_profiles_updated_at ON admin_profiles;
CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Verification Queries (Run these to verify setup)
-- =====================================================

-- Verify tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('admin_settings', 'admin_profiles');

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('admin_settings', 'admin_profiles');

-- Check admin_settings initial row
-- SELECT * FROM admin_settings;
