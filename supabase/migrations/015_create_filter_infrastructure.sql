-- =====================================================
-- Cedar Elevators - Filter Infrastructure Migration
-- =====================================================
-- This migration creates the infrastructure for production-ready filtering
-- Includes: filter attributes table, indexes, and rating fields
-- =====================================================

-- =====================================================
-- ADD RATING AND REVIEW FIELDS TO PRODUCTS
-- =====================================================

-- Add rating fields if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5);
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0 CHECK (review_count >= 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating_distribution JSONB DEFAULT '{"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}'::jsonb;

COMMENT ON COLUMN products.average_rating IS 'Average product rating (0-5 stars)';
COMMENT ON COLUMN products.review_count IS 'Total number of reviews';
COMMENT ON COLUMN products.rating_distribution IS 'Count of reviews per star rating';

-- =====================================================
-- CREATE PRODUCT_ATTRIBUTES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_key VARCHAR(100) UNIQUE NOT NULL,
  attribute_type VARCHAR(50) NOT NULL CHECK (attribute_type IN ('range', 'enum', 'boolean', 'multi-select')),
  display_name VARCHAR(255) NOT NULL,
  unit VARCHAR(20),
  is_filterable BOOLEAN DEFAULT true,
  filter_priority INTEGER DEFAULT 0,
  options JSONB DEFAULT '[]'::jsonb,
  min_value DECIMAL(10,2),
  max_value DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE product_attributes IS 'Master table for filterable product attributes';
COMMENT ON COLUMN product_attributes.attribute_key IS 'Unique key for the attribute (e.g., voltage, capacity)';
COMMENT ON COLUMN product_attributes.attribute_type IS 'Type of attribute: range, enum, boolean, multi-select';
COMMENT ON COLUMN product_attributes.display_name IS 'User-facing display name';
COMMENT ON COLUMN product_attributes.unit IS 'Unit of measurement (e.g., V, kg, m/s)';
COMMENT ON COLUMN product_attributes.filter_priority IS 'Display order in filter UI (lower = higher priority)';
COMMENT ON COLUMN product_attributes.options IS 'Available options for enum/multi-select types';

-- Create indexes on product_attributes
CREATE INDEX IF NOT EXISTS idx_product_attributes_key ON product_attributes(attribute_key);
CREATE INDEX IF NOT EXISTS idx_product_attributes_filterable ON product_attributes(is_filterable) WHERE is_filterable = true;
CREATE INDEX IF NOT EXISTS idx_product_attributes_priority ON product_attributes(filter_priority);

-- =====================================================
-- SEED COMMON FILTERABLE ATTRIBUTES
-- =====================================================

INSERT INTO product_attributes (attribute_key, attribute_type, display_name, unit, is_filterable, filter_priority, min_value, max_value) VALUES
  ('voltage', 'multi-select', 'Voltage', 'V', true, 10, NULL, NULL),
  ('load_capacity', 'range', 'Load Capacity', 'kg', true, 20, 0, 5000),
  ('speed', 'range', 'Speed', 'm/s', true, 30, 0, 10),
  ('rating', 'enum', 'Customer Rating', NULL, true, 5, NULL, NULL)
ON CONFLICT (attribute_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  unit = EXCLUDED.unit,
  filter_priority = EXCLUDED.filter_priority;

-- Update voltage options
UPDATE product_attributes SET options = '["220V", "380V", "415V", "440V"]'::jsonb WHERE attribute_key = 'voltage';

-- Update rating options
UPDATE product_attributes SET options = '["5", "4", "3", "2", "1"]'::jsonb WHERE attribute_key = 'rating';

-- =====================================================
-- CREATE PERFORMANCE INDEXES
-- =====================================================

-- GIN indexes for JSONB fields (if not already exist)
CREATE INDEX IF NOT EXISTS idx_products_specifications_gin ON products USING GIN (specifications);
CREATE INDEX IF NOT EXISTS idx_products_technical_specs_gin ON products USING GIN (technical_specs);
CREATE INDEX IF NOT EXISTS idx_products_tags_gin ON products USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_product_variants_attributes_gin ON product_variants USING GIN (option1_value, option2_value, option3_value);

-- B-tree indexes for common filter fields
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_voltage ON products(voltage) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_load_capacity ON products(load_capacity_kg) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_speed ON products(speed_ms) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(average_rating) WHERE status = 'active';

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_products_status_stock ON products(status, stock_quantity) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(price, status) WHERE status = 'active' AND price IS NOT NULL;

-- Index for recently updated products
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC) WHERE status = 'active';

-- =====================================================
-- CREATE FILTER CACHE TABLE (Optional, for facet counts)
-- =====================================================

CREATE TABLE IF NOT EXISTS filter_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  cache_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE filter_cache IS 'Cache table for expensive filter facet count queries';
CREATE INDEX IF NOT EXISTS idx_filter_cache_key ON filter_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_filter_cache_expires ON filter_cache(expires_at);

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_filter_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM filter_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================

-- Trigger for product_attributes updated_at
DROP TRIGGER IF EXISTS update_product_attributes_updated_at ON product_attributes;
CREATE TRIGGER update_product_attributes_updated_at
  BEFORE UPDATE ON product_attributes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE filter_cache ENABLE ROW LEVEL SECURITY;

-- Public read access for product_attributes
CREATE POLICY "Public read product_attributes" ON product_attributes FOR SELECT TO anon, authenticated USING (is_filterable = true);

-- Service role full access
CREATE POLICY "Service role full access product_attributes" ON product_attributes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access filter_cache" ON filter_cache FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get dynamic price range for current filter scope
CREATE OR REPLACE FUNCTION get_price_range(
  p_category TEXT DEFAULT NULL,
  p_application TEXT DEFAULT NULL,
  p_min_stock INTEGER DEFAULT 0
)
RETURNS TABLE(min_price DECIMAL, max_price DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    MIN(price)::DECIMAL as min_price,
    MAX(price)::DECIMAL as max_price
  FROM products
  WHERE status = 'active'
    AND price IS NOT NULL
    AND (p_category IS NULL OR category = p_category)
    AND (p_min_stock = 0 OR stock_quantity >= p_min_stock);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get facet counts for a filter dimension
CREATE OR REPLACE FUNCTION get_facet_counts(
  p_filter_field TEXT,
  p_category TEXT DEFAULT NULL,
  p_min_price DECIMAL DEFAULT NULL,
  p_max_price DECIMAL DEFAULT NULL
)
RETURNS TABLE(facet_value TEXT, count BIGINT) AS $$
BEGIN
  -- This is a simplified version. Actual implementation will be in application code
  -- for more complex scenarios with multiple filter combinations
  
  IF p_filter_field = 'voltage' THEN
    RETURN QUERY
    SELECT 
      voltage::TEXT as facet_value,
      COUNT(*)::BIGINT as count
    FROM products
    WHERE status = 'active'
      AND voltage IS NOT NULL
      AND (p_category IS NULL OR category = p_category)
      AND (p_min_price IS NULL OR price >= p_min_price)
      AND (p_max_price IS NULL OR price <= p_max_price)
    GROUP BY voltage
    ORDER BY count DESC;
  ELSE
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
DO $$ 
BEGIN
  RAISE NOTICE 'Verifying filter infrastructure...';
  
  -- Check if product_attributes table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_attributes') THEN
    RAISE NOTICE '✓ product_attributes table created';
  END IF;
  
  -- Check if filter_cache table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'filter_cache') THEN
    RAISE NOTICE '✓ filter_cache table created';
  END IF;
  
  -- Check if indexes exist
  IF EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_products_specifications_gin') THEN
    RAISE NOTICE '✓ GIN indexes created';
  END IF;
  
  -- Check if rating columns added
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'average_rating') THEN
    RAISE NOTICE '✓ Rating columns added to products';
  END IF;
END $$;

-- =====================================================
-- ROLLBACK SCRIPT (Keep commented, for emergency use)
-- =====================================================

/*
-- To rollback this migration:

-- Drop functions
DROP FUNCTION IF EXISTS get_price_range(TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_facet_counts(TEXT, TEXT, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS clean_expired_filter_cache();

-- Drop tables
DROP TABLE IF EXISTS filter_cache CASCADE;
DROP TABLE IF EXISTS product_attributes CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS idx_products_specifications_gin;
DROP INDEX IF EXISTS idx_products_technical_specs_gin;
DROP INDEX IF EXISTS idx_products_tags_gin;
DROP INDEX IF EXISTS idx_product_variants_attributes_gin;
DROP INDEX IF EXISTS idx_products_price;
DROP INDEX IF EXISTS idx_products_stock_quantity;
DROP INDEX IF EXISTS idx_products_voltage;
DROP INDEX IF EXISTS idx_products_load_capacity;
DROP INDEX IF EXISTS idx_products_speed;
DROP INDEX IF EXISTS idx_products_rating;
DROP INDEX IF EXISTS idx_products_status_stock;
DROP INDEX IF EXISTS idx_products_category_status;
DROP INDEX IF EXISTS idx_products_price_range;
DROP INDEX IF EXISTS idx_products_updated_at;

-- Remove rating columns
ALTER TABLE products DROP COLUMN IF EXISTS average_rating;
ALTER TABLE products DROP COLUMN IF EXISTS review_count;
ALTER TABLE products DROP COLUMN IF EXISTS rating_distribution;
*/
