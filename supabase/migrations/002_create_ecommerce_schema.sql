-- =====================================================
-- Cedar Elevators - Complete E-commerce Schema
-- =====================================================
-- This migration creates all tables for the e-commerce platform
-- Run this after 001_create_admin_authentication.sql
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- =====================================================
-- PRODUCTS
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT, -- Can be UUID foreign key or text
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  thumbnail TEXT,
  images JSONB DEFAULT '[]',
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  cost_per_item DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  barcode TEXT,
  weight DECIMAL(10,2),
  dimensions JSONB,
  specifications JSONB,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- =====================================================
-- PRODUCT VARIANTS
-- =====================================================

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_per_item DECIMAL(10,2),
  inventory_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  barcode TEXT,
  weight DECIMAL(10,2),
  image_url TEXT,
  option1_name TEXT,
  option1_value TEXT,
  option2_name TEXT,
  option2_value TEXT,
  option3_name TEXT,
  option3_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_status ON product_variants(status);

-- =====================================================
-- CARTS
-- =====================================================

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255),
  guest_id VARCHAR(255),
  region_id VARCHAR(50),
  currency_code VARCHAR(3) DEFAULT 'INR',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_carts_guest_id ON carts(guest_id);

-- =====================================================
-- CART ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID,
  variant_id UUID,
  title TEXT NOT NULL,
  thumbnail TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- =====================================================
-- ORDERS
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1000;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  clerk_user_id VARCHAR(255),
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  order_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency_code VARCHAR(3) DEFAULT 'INR',
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  tracking_number TEXT,
  tracking_carrier TEXT,
  tracking_url TEXT,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- =====================================================
-- ORDER ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID,
  variant_id UUID,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  variant_sku TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- BUSINESS PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  company_type TEXT CHECK (company_type IN ('private_limited', 'public_limited', 'partnership', 'sole_proprietor')),
  gst_number VARCHAR(15),
  pan_number VARCHAR(10),
  tan_number VARCHAR(10),
  business_address JSONB,
  billing_address JSONB,
  phone TEXT,
  website TEXT,
  annual_revenue TEXT,
  employee_count TEXT,
  verification_status TEXT DEFAULT 'unverified' 
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_notes TEXT,
  verified_by VARCHAR(255),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_verification_status ON business_profiles(verification_status);

-- =====================================================
-- BUSINESS DOCUMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS business_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL 
    CHECK (document_type IN ('gst_certificate', 'pan_card', 'business_license', 'incorporation_certificate', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_business_documents_profile_id ON business_documents(business_profile_id);

-- =====================================================
-- CUSTOMER META (Enhanced)
-- =====================================================

-- Check if customer_meta table exists before altering
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_meta') THEN
    -- Add columns if they don't exist
    ALTER TABLE customer_meta ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
    ALTER TABLE customer_meta ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]';
    ALTER TABLE customer_meta ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
  ELSE
    -- Create table if it doesn't exist
    CREATE TABLE customer_meta (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
      user_type TEXT CHECK (user_type IN ('individual', 'business')),
      phone VARCHAR(20),
      addresses JSONB DEFAULT '[]',
      preferences JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX idx_customer_meta_user_id ON customer_meta(clerk_user_id);
  END IF;
END $$;

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function to generate next order number
CREATE OR REPLACE FUNCTION nextval(sequence_name text)
RETURNS bigint AS $$
BEGIN
  RETURN nextval(sequence_name::regclass);
END;
$$ LANGUAGE plpgsql;

-- Function to decrement inventory
CREATE OR REPLACE FUNCTION decrement_inventory(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - quantity,
      updated_at = NOW()
  WHERE id = product_id
  AND stock_quantity >= quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient inventory for product %', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to increment inventory (for cancellations/refunds)
CREATE OR REPLACE FUNCTION increment_inventory(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity + quantity,
      updated_at = NOW()
  WHERE id = product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product % not found', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers for updated_at (reusing function from admin migration)
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_profiles_updated_at ON business_profiles;
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_meta_updated_at ON customer_meta;
CREATE TRIGGER update_customer_meta_updated_at
  BEFORE UPDATE ON customer_meta
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_documents ENABLE ROW LEVEL SECURITY;

-- Service role has full access to all tables
CREATE POLICY "Service role full access categories" ON categories FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access products" ON products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access product_variants" ON product_variants FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access carts" ON carts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access cart_items" ON cart_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access orders" ON orders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access order_items" ON order_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access business_profiles" ON business_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access business_documents" ON business_documents FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public read access for categories and products
CREATE POLICY "Public read categories" ON categories FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public read products" ON products FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Public read product_variants" ON product_variants FOR SELECT TO anon, authenticated USING (status = 'active');

-- Users can read their own carts and cart items
CREATE POLICY "Users read own cart" ON carts FOR SELECT TO authenticated USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users manage own cart_items" ON cart_items FOR ALL TO authenticated USING (
  cart_id IN (SELECT id FROM carts WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub')
);

-- Users can read their own orders
CREATE POLICY "Users read own orders" ON orders FOR SELECT TO authenticated USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users read own order_items" ON order_items FOR SELECT TO authenticated USING (
  order_id IN (SELECT id FROM orders WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub')
);

-- Users can manage their own business profiles
CREATE POLICY "Users read own business_profile" ON business_profiles FOR SELECT TO authenticated USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users update own business_profile" ON business_profiles FOR UPDATE TO authenticated USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Uncomment to verify tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('categories', 'products', 'product_variants', 'carts', 'cart_items', 'orders', 'order_items', 'business_profiles', 'business_documents');

-- Uncomment to verify RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('categories', 'products', 'carts', 'orders', 'business_profiles');
