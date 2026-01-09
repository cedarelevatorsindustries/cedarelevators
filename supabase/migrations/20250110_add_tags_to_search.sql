-- =====================================================
-- Cedar Elevators - Add Product Tags to Search Vector
-- =====================================================
-- Enhances the existing full-text search to include product tags
-- Tags are weighted at level B (same as categories/applications)
-- =====================================================

-- Update the build_product_search_vector function to include tags
CREATE OR REPLACE FUNCTION build_product_search_vector(product_row products)
RETURNS tsvector AS $$
DECLARE
  variant_skus text;
  category_name text;
  application_name text;
  elevator_types_text text;
  attributes_text text;
  tags_text text;
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

  -- Get product tags from tags array
  IF product_row.tags IS NOT NULL AND array_length(product_row.tags, 1) > 0 THEN
    tags_text := array_to_string(product_row.tags, ' ');
  END IF;

  -- Build weighted search vector with tags at weight B (high importance)
  RETURN
    setweight(to_tsvector('english', COALESCE(product_row.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(product_row.sku, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(variant_skus, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(category_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(application_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(tags_text, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(elevator_types_text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(attributes_text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(product_row.short_description, '')), 'D');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Rebuild search vectors for all existing products
UPDATE products SET updated_at = updated_at WHERE id IS NOT NULL;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test with a sample tag search
-- SELECT id, name, tags, 
--        ts_rank(search_vector, plainto_tsquery('english', 'limit switch')) as rank
-- FROM products
-- WHERE search_vector @@ plainto_tsquery('english', 'limit switch')
-- ORDER BY rank DESC
-- LIMIT 10;
