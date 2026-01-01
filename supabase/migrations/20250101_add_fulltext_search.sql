-- =====================================================
-- Cedar Elevators - Full-Text Search Implementation
-- =====================================================
-- Adds PostgreSQL full-text search with weighted vectors
-- for storefront product discovery
-- =====================================================

-- Add search columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_text text;

-- =====================================================
-- FUNCTION: Build Product Search Vector
-- =====================================================
-- Builds a weighted tsvector combining all searchable fields
-- Weight A (highest): Product name, SKU, variant SKUs
-- Weight B: Category name, Application name
-- Weight C: Elevator types, Attributes (voltage, capacity, speed, specs)
-- Weight D (lowest): Short description

CREATE OR REPLACE FUNCTION build_product_search_vector(product_row products)
RETURNS tsvector AS $$
DECLARE
  variant_skus text;
  category_name text;
  application_name text;
  elevator_types_text text;
  attributes_text text;
BEGIN
  -- Get all variant SKUs for this product
  SELECT string_agg(sku, ' ')
  INTO variant_skus
  FROM product_variants
  WHERE product_id = product_row.id;

  -- Get category name
  SELECT name INTO category_name
  FROM categories
  WHERE id = product_row.category_id;

  -- Get application name
  SELECT name INTO application_name
  FROM categories
  WHERE id = product_row.application_id;

  -- Get elevator types (joined via junction table)
  SELECT string_agg(et.name, ' ')
  INTO elevator_types_text
  FROM product_elevator_types pet
  JOIN elevator_types et ON pet.elevator_type_id = et.id
  WHERE pet.product_id = product_row.id;

  -- Build attributes text from individual fields + JSONB technical_specs
  attributes_text := CONCAT_WS(' ',
    product_row.voltage,
    CASE WHEN product_row.load_capacity_kg IS NOT NULL 
      THEN product_row.load_capacity_kg::text || 'kg' 
      ELSE NULL END,
    CASE WHEN product_row.speed_ms IS NOT NULL 
      THEN product_row.speed_ms::text || 'm/s' 
      ELSE NULL END,
    -- Flatten JSONB technical_specs into searchable text
    (SELECT string_agg(key || ' ' || value::text, ' ') 
     FROM jsonb_each_text(COALESCE(product_row.technical_specs, '{}'::jsonb)))
  );

  -- Build weighted search vector
  RETURN
    setweight(to_tsvector('english', COALESCE(product_row.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(product_row.sku, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(variant_skus, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(category_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(application_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(elevator_types_text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(attributes_text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(product_row.short_description, '')), 'D');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- FUNCTION: Update Product Search Vector
-- =====================================================
-- Trigger function to automatically update search_vector and search_text

CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
DECLARE
  cat_name text;
  app_name text;
BEGIN
  -- Build search vector
  NEW.search_vector := build_product_search_vector(NEW);
  
  -- Build human-readable search_text for debugging
  SELECT name INTO cat_name FROM categories WHERE id = NEW.category_id;
  SELECT name INTO app_name FROM categories WHERE id = NEW.application_id;
  
  NEW.search_text := CONCAT_WS(' | ',
    'Title: ' || COALESCE(NEW.name, ''),
    'SKU: ' || COALESCE(NEW.sku, ''),
    'Category: ' || COALESCE(cat_name, ''),
    'Application: ' || COALESCE(app_name, ''),
    'Voltage: ' || COALESCE(NEW.voltage, ''),
    'Capacity: ' || COALESCE(NEW.load_capacity_kg::text, '') || 'kg',
    'Speed: ' || COALESCE(NEW.speed_ms::text, '') || 'm/s'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-update search vector on product changes
-- =====================================================

DROP TRIGGER IF EXISTS products_search_vector_update ON products;
CREATE TRIGGER products_search_vector_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_vector();

-- =====================================================
-- TRIGGER: Update product search when variants change
-- =====================================================
-- When a variant is added/updated/deleted, update parent product's search vector

CREATE OR REPLACE FUNCTION update_product_search_on_variant_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Touch the product to trigger search vector rebuild
  UPDATE products
  SET updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS variant_search_update ON product_variants;
CREATE TRIGGER variant_search_update
  AFTER INSERT OR UPDATE OR DELETE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_on_variant_change();

-- =====================================================
-- TRIGGER: Update product search when elevator types change
-- =====================================================

CREATE OR REPLACE FUNCTION update_product_search_on_type_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS elevator_type_search_update ON product_elevator_types;
CREATE TRIGGER elevator_type_search_update
  AFTER INSERT OR UPDATE OR DELETE ON product_elevator_types
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_on_type_change();

-- =====================================================
-- INDEX: GIN index for fast full-text search
-- =====================================================

CREATE INDEX IF NOT EXISTS products_search_vector_idx
  ON products USING GIN (search_vector);

-- =====================================================
-- POPULATE: Build search vectors for existing products
-- =====================================================
-- This will trigger the search vector update for all products

UPDATE products SET updated_at = updated_at WHERE id IS NOT NULL;

-- =====================================================
-- RPC FUNCTION: Search Products with Ranking
-- =====================================================
-- Main search function that returns ranked results with filtering

CREATE OR REPLACE FUNCTION search_products(
  search_query text,
  category_filter uuid DEFAULT NULL,
  application_filter uuid DEFAULT NULL,
  elevator_type_filter uuid DEFAULT NULL,
  page_number int DEFAULT 1,
  page_size int DEFAULT 24
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  sku text,
  description text,
  short_description text,
  thumbnail text,
  images jsonb,
  price decimal,
  compare_at_price decimal,
  stock_quantity int,
  status text,
  category_id uuid,
  application_id uuid,
  voltage varchar,
  load_capacity_kg int,
  speed_ms decimal,
  technical_specs jsonb,
  is_featured boolean,
  is_categorized boolean,
  created_at timestamptz,
  updated_at timestamptz,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.*,
    ts_rank(p.search_vector, plainto_tsquery('english', search_query)) as rank
  FROM products p
  WHERE 
    p.status = 'active'
    AND p.is_categorized = true
    AND p.search_vector @@ plainto_tsquery('english', search_query)
    AND (category_filter IS NULL OR p.category_id = category_filter)
    AND (application_filter IS NULL OR p.application_id = application_filter)
    AND (elevator_type_filter IS NULL OR EXISTS (
      SELECT 1 FROM product_elevator_types pet
      WHERE pet.product_id = p.id AND pet.elevator_type_id = elevator_type_filter
    ))
  ORDER BY rank DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- RPC FUNCTION: Search Product Suggestions (Prefix)
-- =====================================================
-- Fast autocomplete function using prefix search

CREATE OR REPLACE FUNCTION search_product_suggestions(
  search_query text
)
RETURNS TABLE (
  id uuid,
  name text,
  sku text,
  slug text,
  thumbnail text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.slug,
    p.thumbnail
  FROM products p
  WHERE 
    p.status = 'active'
    AND p.is_categorized = true
    AND p.search_vector @@ to_tsquery('english', search_query || ':*')
  ORDER BY 
    ts_rank(p.search_vector, to_tsquery('english', search_query || ':*')) DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- VERIFICATION QUERIES (commented out)
-- =====================================================

-- Check search vectors were created:
-- SELECT id, name, sku, search_text 
-- FROM products 
-- WHERE search_vector IS NOT NULL 
-- LIMIT 10;

-- Test search query:
-- SELECT id, name, sku, 
--        ts_rank(search_vector, plainto_tsquery('english', 'motor')) as rank
-- FROM products
-- WHERE search_vector @@ plainto_tsquery('english', 'motor')
-- ORDER BY rank DESC
-- LIMIT 10;

-- Check index:
-- SELECT indexname, tablename 
-- FROM pg_indexes 
-- WHERE indexname = 'products_search_vector_idx';
