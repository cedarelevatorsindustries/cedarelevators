-- =====================================================
-- Cedar Elevators - Interconnection Logic Schema
-- Implements the Golden Rule: Products own ALL relationships
-- =====================================================

-- =====================================================
-- ELEVATOR TYPES (Standalone Classifier)
-- =====================================================

CREATE TABLE IF NOT EXISTS elevator_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_elevator_types_slug ON elevator_types(slug);
CREATE INDEX IF NOT EXISTS idx_elevator_types_active ON elevator_types(is_active);

-- Seed default elevator types
INSERT INTO elevator_types (name, slug, description, sort_order) VALUES
  ('Residential', 'residential', 'Residential elevator systems and components', 1),
  ('Commercial', 'commercial', 'Commercial building elevator solutions', 2),
  ('Industrial', 'industrial', 'Heavy-duty industrial elevator systems', 3),
  ('Hospital', 'hospital', 'Hospital and medical facility elevators', 4)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- APPLICATIONS (Top-level grouping)
-- =====================================================
-- We'll use existing categories table with parent_id = null
-- and application field to mark as Application type

-- First, add the application column to categories if it doesn't exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS application VARCHAR(50);

-- Seed default applications (if not exists)
INSERT INTO categories (name, slug, description, parent_id, application, is_active, sort_order) VALUES
  ('Erection', 'erection', 'Installation and erection services', NULL, 'erection', true, 1),
  ('Testing', 'testing', 'Testing and commissioning services', NULL, 'testing', true, 2),
  ('Service', 'service', 'Maintenance and service components', NULL, 'service', true, 3),
  ('General', 'general', 'General uncategorized items', NULL, 'general', true, 999)
ON CONFLICT (slug) DO NOTHING;

-- Create system "Uncategorized" category under General application
DO $$
DECLARE
  general_app_id UUID;
BEGIN
  -- Get the General application ID
  SELECT id INTO general_app_id FROM categories WHERE slug = 'general' AND parent_id IS NULL;
  
  -- Insert Uncategorized category if it doesn't exist
  IF general_app_id IS NOT NULL THEN
    INSERT INTO categories (name, slug, description, parent_id, application, is_active, sort_order)
    VALUES ('Uncategorized', 'uncategorized', 'Products without assigned category', general_app_id, 'general', true, 999)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- UPDATE PRODUCTS TABLE
-- =====================================================

-- Add new relationship columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_categorized BOOLEAN DEFAULT false;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_products_application ON products(application_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_is_categorized ON products(is_categorized);

-- Keep old 'category' column for backward compatibility during migration
-- It will be removed in a future migration after data is migrated

-- =====================================================
-- PRODUCT-ELEVATOR TYPE JUNCTION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS product_elevator_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  elevator_type_id UUID REFERENCES elevator_types(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, elevator_type_id)
);

CREATE INDEX IF NOT EXISTS idx_product_elevator_types_product ON product_elevator_types(product_id);
CREATE INDEX IF NOT EXISTS idx_product_elevator_types_elevator_type ON product_elevator_types(elevator_type_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE elevator_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_elevator_types ENABLE ROW LEVEL SECURITY;

-- Public read access for elevator types
CREATE POLICY "Public read elevator_types" ON elevator_types FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Service role full access elevator_types" ON elevator_types FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Service role access for product_elevator_types
CREATE POLICY "Service role full access product_elevator_types" ON product_elevator_types FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public read access through products
CREATE POLICY "Public read product_elevator_types" ON product_elevator_types FOR SELECT TO anon, authenticated 
  USING (product_id IN (SELECT id FROM products WHERE status = 'active'));

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Elevator types images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('elevator-types', 'elevator-types', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for elevator types
DO $$ BEGIN
  CREATE POLICY "Public elevator type images viewable" ON storage.objects FOR SELECT USING (bucket_id = 'elevator-types');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated upload elevator types" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'elevator-types');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated update elevator types" ON storage.objects FOR UPDATE USING (bucket_id = 'elevator-types');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated delete elevator types" ON storage.objects FOR DELETE USING (bucket_id = 'elevator-types');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get product hierarchy
CREATE OR REPLACE FUNCTION get_product_hierarchy(product_id UUID)
RETURNS TABLE (
  application_name TEXT,
  category_name TEXT,
  subcategory_name TEXT,
  elevator_types TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    app.name as application_name,
    cat.name as category_name,
    subcat.name as subcategory_name,
    ARRAY_AGG(et.name) as elevator_types
  FROM products p
  LEFT JOIN categories app ON p.application_id = app.id
  LEFT JOIN categories cat ON p.category_id = cat.id
  LEFT JOIN categories subcat ON p.subcategory_id = subcat.id
  LEFT JOIN product_elevator_types pet ON p.id = pet.product_id
  LEFT JOIN elevator_types et ON pet.elevator_type_id = et.id
  WHERE p.id = product_id
  GROUP BY app.name, cat.name, subcat.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get products by category (for category detail pages)
CREATE OR REPLACE FUNCTION get_category_products(category_id_param UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  thumbnail TEXT,
  price DECIMAL(10,2),
  status TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.thumbnail,
    p.price,
    p.status,
    p.created_at
  FROM products p
  WHERE p.category_id = category_id_param
  OR p.subcategory_id = category_id_param
  OR p.application_id = category_id_param
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get products by elevator type
CREATE OR REPLACE FUNCTION get_elevator_type_products(elevator_type_id_param UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  thumbnail TEXT,
  price DECIMAL(10,2),
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.thumbnail,
    p.price,
    p.status
  FROM products p
  INNER JOIN product_elevator_types pet ON p.id = pet.product_id
  WHERE pet.elevator_type_id = elevator_type_id_param
  AND p.status = 'active'
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_elevator_types_updated_at ON elevator_types;
CREATE TRIGGER update_elevator_types_updated_at
  BEFORE UPDATE ON elevator_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- NOTES
-- =====================================================
-- Architecture Summary:
-- 1. Applications: categories table with parent_id = NULL
-- 2. Categories: categories table with parent_id = application_id
-- 3. Subcategories: categories table with parent_id = category_id
-- 4. Elevator Types: separate elevator_types table (cross-cutting)
-- 5. Collections: existing collections table (curated groups)
--
-- Product Relationships (ALL created in product form):
-- - product.application_id → Application
-- - product.category_id → Category
-- - product.subcategory_id → Subcategory (optional)
-- - product_elevator_types → Elevator Types (many-to-many)
-- - product_collections → Collections (many-to-many, optional)
--
-- Golden Rule: Products assign themselves to categories.
-- Categories/Collections NEVER select products.
-- =====================================================
