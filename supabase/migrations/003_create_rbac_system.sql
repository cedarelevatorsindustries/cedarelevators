-- =====================================================
-- Cedar Elevators - RBAC System with Clerk Integration
-- =====================================================
-- This migration creates the complete RBAC system
-- with profiles table and enhanced RLS policies
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (Core user data from Clerk)
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,  -- Clerk user ID
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('individual', 'business')),
  business_name TEXT,
  verification_status TEXT NOT NULL DEFAULT 'none' 
    CHECK (verification_status IN ('none', 'pending', 'verified', 'rejected')),
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);

-- =====================================================
-- VERIFICATION DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(status);

-- =====================================================
-- ORDERS TABLE (Simplified for RBAC demo)
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1000;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL DEFAULT ('ORD-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0')),
  user_id TEXT NOT NULL,  -- Clerk user ID
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
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- =====================================================
-- PRODUCTS TABLE (Minimal for demo)
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to extract JWT claim
CREATE OR REPLACE FUNCTION get_jwt_claim(claim text)
RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>claim,
    NULL
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get current user ID from JWT
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS text AS $$
BEGIN
  RETURN get_jwt_claim('sub');
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if user is authenticated
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS boolean AS $$
BEGIN
  RETURN get_current_user_id() IS NOT NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ===== PROFILES POLICIES =====

-- Service role has full access
CREATE POLICY "Service role full access profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_id = get_current_user_id());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

-- Users can insert their own profile (auto-creation)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = get_current_user_id());

-- ===== VERIFICATION DOCUMENTS POLICIES =====

-- Service role has full access
CREATE POLICY "Service role full access verification_documents"
  ON verification_documents FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON verification_documents FOR SELECT
  TO authenticated
  USING (user_id = get_current_user_id());

-- Users can upload their own documents
CREATE POLICY "Users can upload own documents"
  ON verification_documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = get_current_user_id());

-- ===== PRODUCTS POLICIES =====

-- Service role has full access
CREATE POLICY "Service role full access products"
  ON products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Everyone (including guests) can view active products
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- ===== ORDERS POLICIES =====

-- Service role has full access
CREATE POLICY "Service role full access orders"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = get_current_user_id());

-- Only authenticated users (Individual OR Business) can create orders
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = get_current_user_id() AND
    is_authenticated()
  );

-- ===== ORDER ITEMS POLICIES =====

-- Service role has full access
CREATE POLICY "Service role full access order_items"
  ON order_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view items from their own orders
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

-- Apply triggers
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

-- Insert sample products
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
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('profiles', 'verification_documents', 'orders', 'order_items', 'products');

-- Check if RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('profiles', 'orders', 'products');

-- Test JWT helper functions
-- SELECT get_jwt_claim('sub');
-- SELECT get_current_user_id();
-- SELECT is_authenticated();
