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
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'verification_documents_user_id_fkey'
  ) THEN
    ALTER TABLE verification_documents 
    ADD CONSTRAINT verification_documents_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(status);

-- =====================================================
-- ORDERS TABLE
-- =====================================================

-- Create sequence if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'order_number_seq') THEN
    CREATE SEQUENCE order_number_seq START WITH 1000;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL DEFAULT ('ORD-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0')),
  user_id TEXT NOT NULL,
  order_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  total_amount DECIMAL(10,2) NOT NULL,
  currency_code TEXT DEFAULT 'INR',
  shipping_address JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'order_items_order_id_fkey'
  ) THEN
    ALTER TABLE order_items 
    ADD CONSTRAINT order_items_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint on slug if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_slug_key'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Service role full access verification_documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can view own documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can upload own documents" ON verification_documents;

DROP POLICY IF EXISTS "Service role full access products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;

DROP POLICY IF EXISTS "Service role full access orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;

DROP POLICY IF EXISTS "Service role full access order_items" ON order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;

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

-- ===== PRODUCTS POLICIES =====

CREATE POLICY "Service role full access products"
  ON products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- ===== ORDERS POLICIES =====

CREATE POLICY "Service role full access orders"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = get_current_user_id());

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = get_current_user_id() AND
    is_authenticated()
  );

-- ===== ORDER ITEMS POLICIES =====

CREATE POLICY "Service role full access order_items"
  ON order_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = get_current_user_id()
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

-- Drop and recreate triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Insert sample products (only if they don't exist)
INSERT INTO products (name, slug, description, price, stock_quantity, status)
VALUES 
  ('Elevator Cable', 'elevator-cable', 'High-quality elevator cable for commercial use', 5000.00, 100, 'active'),
  ('Control Panel', 'control-panel', 'Advanced control panel with LCD display', 15000.00, 50, 'active'),
  ('Door Motor', 'door-motor', 'Heavy-duty door motor for passenger elevators', 8000.00, 75, 'active')
ON CONFLICT (slug) DO NOTHING;

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
