-- Migration: Implement Junction Table Architecture for Products
-- This migration removes direct foreign keys and implements many-to-many relationships

-- =============================================
-- STEP 1: Create product_categories junction table
-- =============================================

CREATE TABLE IF NOT EXISTS product_categories (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- Marks the primary category
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (product_id, category_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_primary ON product_categories(is_primary) WHERE is_primary = true;

-- =============================================
-- STEP 2: Migrate existing data
-- =============================================

-- Migrate category_id relationships
INSERT INTO product_categories (product_id, category_id, is_primary, position)
SELECT 
  id as product_id,
  category_id,
  true as is_primary, -- Mark as primary category
  0 as position
FROM products
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Migrate subcategory_id relationships (if they exist as categories with type='subcategory')
INSERT INTO product_categories (product_id, category_id, is_primary, position)
SELECT 
  id as product_id,
  subcategory_id as category_id,
  false as is_primary, -- Not primary
  1 as position
FROM products
WHERE subcategory_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

-- =============================================
-- STEP 3: Update product_types junction table
-- =============================================

-- Rename elevator_type_id to type_id for consistency
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_types' 
    AND column_name = 'elevator_type_id'
  ) THEN
    ALTER TABLE product_types RENAME COLUMN elevator_type_id TO type_id;
  END IF;
END $$;

-- Ensure product_types table exists with correct structure
CREATE TABLE IF NOT EXISTS product_types (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type_id UUID NOT NULL REFERENCES types(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (product_id, type_id)
);

CREATE INDEX IF NOT EXISTS idx_product_types_product_id ON product_types(product_id);
CREATE INDEX IF NOT EXISTS idx_product_types_type_id ON product_types(type_id);

-- =============================================
-- STEP 4: Update product_collections junction table
-- =============================================

-- Ensure product_collections table exists with correct structure
CREATE TABLE IF NOT EXISTS product_collections (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (product_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_product_collections_product_id ON product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection_id ON product_collections(collection_id);

-- =============================================
-- STEP 5: Remove old foreign key columns from products
-- =============================================

-- Drop the old direct foreign key columns
-- NOTE: Run this AFTER verifying data migration was successful
-- Uncomment these lines when ready:

-- ALTER TABLE products DROP COLUMN IF EXISTS application_id;
-- ALTER TABLE products DROP COLUMN IF EXISTS category_id;
-- ALTER TABLE products DROP COLUMN IF EXISTS subcategory_id;

-- =============================================
-- STEP 6: Create helper views for backward compatibility
-- =============================================

-- View to get primary category for each product
CREATE OR REPLACE VIEW product_primary_categories AS
SELECT 
  pc.product_id,
  pc.category_id,
  c.title as category_name,
  c.slug as category_slug,
  c.type as category_type
FROM product_categories pc
JOIN categories c ON c.id = pc.category_id
WHERE pc.is_primary = true;

-- View to get all categories for each product
CREATE OR REPLACE VIEW product_all_categories AS
SELECT 
  pc.product_id,
  pc.category_id,
  c.title as category_name,
  c.slug as category_slug,
  c.type as category_type,
  pc.is_primary,
  pc.position
FROM product_categories pc
JOIN categories c ON c.id = pc.category_id
ORDER BY pc.product_id, pc.position;

-- =============================================
-- STEP 7: Add updated_at trigger for product_categories
-- =============================================

CREATE OR REPLACE FUNCTION update_product_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_product_categories_updated_at();

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Count products with categories in old schema
-- SELECT COUNT(*) FROM products WHERE category_id IS NOT NULL;

-- Count products with categories in new schema
-- SELECT COUNT(DISTINCT product_id) FROM product_categories;

-- Products that might have lost category assignments
-- SELECT p.id, p.name 
-- FROM products p
-- LEFT JOIN product_categories pc ON pc.product_id = p.id
-- WHERE p.category_id IS NOT NULL AND pc.product_id IS NULL;
