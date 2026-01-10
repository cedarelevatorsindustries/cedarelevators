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
  categories_text text;
  elevator_types_text text;
  specs_text text;
  tags_text text;
BEGIN
  -- Get all variant SKUs for this product
  SELECT string_agg(sku, ' ')
  INTO variant_skus
  FROM product_variants
  WHERE product_id = product_row.id;

  -- Get all connected category TITLES
  SELECT string_agg(c.title, ' ')
  INTO categories_text
  FROM product_categories pc
  JOIN categories c ON pc.category_id = c.id
  WHERE pc.product_id = product_row.id;

  -- Get elevator types TITLES
  SELECT string_agg(et.title, ' ')
  INTO elevator_types_text
  FROM product_elevator_types pet
  JOIN elevator_types et ON pet.elevator_type_id = et.id
  WHERE pet.product_id = product_row.id;

  -- Flatten JSONB technical_specs
  SELECT string_agg(value::text, ' ')
  INTO specs_text
  FROM jsonb_each_text(COALESCE(product_row.technical_specs, '{}'::jsonb));

  -- Get product tags from tags array
  IF product_row.tags IS NOT NULL AND array_length(product_row.tags, 1) > 0 THEN
    tags_text := array_to_string(product_row.tags, ' ');
  END IF;

  -- Build weighted search vector with tags at weight B (high importance)
  RETURN
    setweight(to_tsvector('english', COALESCE(product_row.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(product_row.sku, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(variant_skus, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(categories_text, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(tags_text, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(elevator_types_text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(specs_text, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(product_row.short_description, '')), 'D');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Rebuild search vectors for all existing products
UPDATE products SET updated_at = updated_at WHERE id IS NOT NULL;
