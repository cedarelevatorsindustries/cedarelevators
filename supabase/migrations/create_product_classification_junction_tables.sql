-- Migration: Create Product Classification Junction Tables
-- This migration adds many-to-many relationships between products and applications/categories/subcategories

-- =====================================================
-- STEP 1: Create Junction Tables
-- =====================================================

-- Junction table for product-application relationships
CREATE TABLE IF NOT EXISTS product_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, application_id)
);

-- Junction table for product-category relationships
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);

-- Junction table for product-subcategory relationships
CREATE TABLE IF NOT EXISTS product_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, subcategory_id)
);

-- =====================================================
-- STEP 2: Create Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_product_applications_product ON product_applications(product_id);
CREATE INDEX IF NOT EXISTS idx_product_applications_application ON product_applications(application_id);

CREATE INDEX IF NOT EXISTS idx_product_categories_product ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);

CREATE INDEX IF NOT EXISTS idx_product_subcategories_product ON product_subcategories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_subcategories_subcategory ON product_subcategories(subcategory_id);

-- =====================================================
-- STEP 3: Migrate Existing Data
-- =====================================================

-- Migrate existing application_id to junction table
INSERT INTO product_applications (product_id, application_id)
SELECT id, application_id 
FROM products 
WHERE application_id IS NOT NULL
ON CONFLICT (product_id, application_id) DO NOTHING;

-- Migrate existing category_id to junction table
INSERT INTO product_categories (product_id, category_id)
SELECT id, category_id 
FROM products 
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Migrate existing subcategory_id to junction table
INSERT INTO product_subcategories (product_id, subcategory_id)
SELECT id, subcategory_id 
FROM products 
WHERE subcategory_id IS NOT NULL
ON CONFLICT (product_id, subcategory_id) DO NOTHING;

-- =====================================================
-- STEP 4: Drop Old Columns (Clean Approach)
-- =====================================================

-- Drop the old redundant single ID columns
ALTER TABLE products DROP COLUMN IF EXISTS application_id;
ALTER TABLE products DROP COLUMN IF EXISTS category_id;
ALTER TABLE products DROP COLUMN IF EXISTS subcategory_id;

-- =====================================================
-- STEP 5: Enable RLS (Row Level Security)
-- =====================================================

-- Enable RLS on junction tables
ALTER TABLE product_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies for product_applications
CREATE POLICY "Allow public read access" ON product_applications FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON product_applications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON product_applications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON product_applications FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for product_categories
CREATE POLICY "Allow public read access" ON product_categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON product_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON product_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON product_categories FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for product_subcategories
CREATE POLICY "Allow public read access" ON product_subcategories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON product_subcategories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON product_subcategories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON product_subcategories FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- STEP 6: Add Table Comments
-- =====================================================

COMMENT ON TABLE product_applications IS 'Junction table for many-to-many relationship between products and applications';
COMMENT ON TABLE product_categories IS 'Junction table for many-to-many relationship between products and categories';
COMMENT ON TABLE product_subcategories IS 'Junction table for many-to-many relationship between products and subcategories';
