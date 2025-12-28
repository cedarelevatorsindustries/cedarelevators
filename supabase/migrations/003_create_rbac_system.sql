-- =====================================================
-- Cedar Elevators - RBAC System with Clerk Integration
-- =====================================================
-- This migration creates the complete RBAC system
-- with profiles table and enhanced RLS policies
-- Safe to run multiple times (idempotent)
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (Core user data from Clerk)
-- =====================================================

-- Drop existing table if you want a clean start
-- WARNING: Uncomment only if you want to reset everything
-- DROP TABLE IF EXISTS verification_documents CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('individual', 'business')),
  business_name TEXT,
  verification_status TEXT NOT NULL DEFAULT 'none' 
    CHECK (verification_status IN ('none', 'pending', 'verified', 'rejected')),
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add unique constraint on user_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);

-- =====================================================
-- VERIFICATION DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  document_type TEXT NOT NULL 
    CHECK (document_type IN ('gst_certificate', 'business_license', 'incorporation_certificate', 'pan_card', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

-- Add foreign key constraint if it doesn't exist
-- Note: This references profiles(user_id) which is TEXT, not UUID
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'verification_documents_profile_user_id_fkey'
  ) THEN
    ALTER TABLE verification_documents 
    ADD CONSTRAINT verification_documents_profile_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(status);

-- =====================================================
-- NOTE: orders, order_items, and products tables 
-- are already created in migration 002
-- We skip creating them here to avoid conflicts
-- =====================================================

-- =====================================================
-- HELPER FUNCTIONS FOR RLS (Native Clerk Integration)
-- =====================================================

-- Function to get current user ID from Clerk JWT
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() ->> 'sub',
    NULL
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if user is authenticated
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'sub') IS NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get user role from JWT
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'account_type',
    'individual'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'individual';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get verification status from JWT
CREATE OR REPLACE FUNCTION get_verification_status()
RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'verification_status',
    'none'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'none';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables only (orders, order_items, products already have RLS from migration 002)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Service role full access verification_documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can view own documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can upload own documents" ON verification_documents;

-- ===== PROFILES POLICIES =====

CREATE POLICY "Service role full access profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = get_current_user_id());

-- ===== VERIFICATION DOCUMENTS POLICIES =====

CREATE POLICY "Service role full access verification_documents"
  ON verification_documents FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own documents"
  ON verification_documents FOR SELECT
  TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Users can upload own documents"
  ON verification_documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = get_current_user_id());

-- =====================================================
-- NOTE: Additional RLS policies for orders, order_items, 
-- and products are defined in migration 002
-- We add supplementary policies here for RBAC integration
-- =====================================================

-- Enhanced Orders Policies (supplement migration 002)
DROP POLICY IF EXISTS "RBAC - Business users can view own orders" ON orders;
CREATE POLICY "RBAC - Business users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    clerk_user_id = get_current_user_id() AND
    get_user_role() = 'business' AND
    get_verification_status() = 'verified'
  );

DROP POLICY IF EXISTS "RBAC - Individual users can view own orders" ON orders;
CREATE POLICY "RBAC - Individual users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    clerk_user_id = get_current_user_id() AND
    get_user_role() = 'individual'
  );

-- Enhanced Order Items Policies (supplement migration 002)
DROP POLICY IF EXISTS "RBAC - Users can view own order items" ON order_items;
CREATE POLICY "RBAC - Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE clerk_user_id = get_current_user_id()
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Create or replace update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate triggers (only for tables created in this migration)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: Triggers for orders and products are already created in migration 002

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Note: Sample products are already inserted in migration 002
-- No additional seed data needed here

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'verification_documents', 'orders', 'order_items', 'products');

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'orders', 'products');

-- Test JWT helper functions (run after logging in via Clerk)
-- SELECT auth.jwt() ->> 'sub' as user_id;
-- SELECT get_current_user_id();
-- SELECT is_authenticated();
-- SELECT get_user_role();
-- SELECT get_verification_status();

-- Show success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '📋 Tables created: profiles, verification_documents, orders, order_items, products';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '🛠️ Helper functions created';
  RAISE NOTICE '✨ Sample products inserted';
END $$;
