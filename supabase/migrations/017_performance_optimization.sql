/**
 * Database Performance Optimization
 * Cedar Elevator Industries
 * 
 * Additional indexes and optimizations for cart queries
 */

-- =====================================================
-- Performance Indexes for Cart Queries
-- =====================================================

-- Index for fast product lookups in cart items
CREATE INDEX IF NOT EXISTS idx_cart_items_product_variant 
  ON cart_items(product_id, variant_id) 
  WHERE variant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cart_items_product_only 
  ON cart_items(product_id) 
  WHERE variant_id IS NULL;

-- Index for cart items ordered by date (for display)
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_date 
  ON cart_items(cart_id, created_at DESC);

-- Index for counting cart items efficiently
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_quantity 
  ON cart_items(cart_id, quantity);

-- Index for product availability checks
CREATE INDEX IF NOT EXISTS idx_products_status_stock 
  ON products(status, stock_quantity) 
  WHERE status = 'active';

-- Index for variant availability checks
CREATE INDEX IF NOT EXISTS idx_variants_status_inventory 
  ON product_variants(status, inventory_quantity) 
  WHERE status = 'active';

-- Composite index for user active carts (most common query)
CREATE INDEX IF NOT EXISTS idx_carts_user_status_updated 
  ON carts(clerk_user_id, status, updated_at DESC) 
  WHERE status = 'active';

-- Index for business profile carts
CREATE INDEX IF NOT EXISTS idx_carts_business_active 
  ON carts(business_id, status) 
  WHERE business_id IS NOT NULL AND status = 'active';

-- =====================================================
-- Optimized View: Cart Items with Product Details
-- =====================================================

CREATE OR REPLACE VIEW cart_items_detailed AS
SELECT 
  ci.id,
  ci.cart_id,
  ci.product_id,
  ci.variant_id,
  ci.title,
  ci.thumbnail,
  ci.quantity,
  ci.created_at,
  ci.updated_at,
  p.name as product_name,
  p.slug as product_slug,
  p.sku as product_sku,
  p.status as product_status,
  p.price as product_price,
  p.compare_at_price as product_compare_price,
  p.stock_quantity as product_stock,
  pv.name as variant_name,
  pv.sku as variant_sku,
  pv.status as variant_status,
  pv.price as variant_price,
  pv.compare_at_price as variant_compare_price,
  pv.inventory_quantity as variant_stock
FROM cart_items ci
LEFT JOIN products p ON ci.product_id = p.id
LEFT JOIN product_variants pv ON ci.variant_id = pv.id;

-- =====================================================
-- Function: Get Cart Summary (Optimized)
-- =====================================================

CREATE OR REPLACE FUNCTION get_cart_summary(p_cart_id UUID)
RETURNS TABLE (
  item_count BIGINT,
  unique_products BIGINT,
  total_quantity INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as item_count,
    COUNT(DISTINCT product_id)::BIGINT as unique_products,
    COALESCE(SUM(quantity), 0)::INTEGER as total_quantity
  FROM cart_items
  WHERE cart_id = p_cart_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- Function: Batch Check Product Availability
-- =====================================================

CREATE OR REPLACE FUNCTION check_products_availability(
  p_product_ids UUID[]
)
RETURNS TABLE (
  product_id UUID,
  is_available BOOLEAN,
  stock_quantity INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    (p.status = 'active') as is_available,
    COALESCE(p.stock_quantity, 0) as stock_quantity
  FROM products p
  WHERE p.id = ANY(p_product_ids);
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- Materialized View for Popular Products (Optional)
-- =====================================================

-- Uncomment if you want to track popular cart items
-- CREATE MATERIALIZED VIEW IF NOT EXISTS popular_cart_products AS
-- SELECT 
--   product_id,
--   COUNT(*) as times_added,
--   SUM(quantity) as total_quantity
-- FROM cart_items
-- WHERE created_at > NOW() - INTERVAL '30 days'
-- GROUP BY product_id
-- ORDER BY times_added DESC
-- LIMIT 100;

-- CREATE UNIQUE INDEX ON popular_cart_products(product_id);

-- =====================================================
-- Vacuum and Analyze
-- =====================================================

-- Run these periodically (set up as cron job)
-- VACUUM ANALYZE carts;
-- VACUUM ANALYZE cart_items;
-- VACUUM ANALYZE products;
-- VACUUM ANALYZE product_variants;

-- =====================================================
-- Success Message
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE 'Performance optimization migration completed successfully';
  RAISE NOTICE 'New indexes created for faster cart queries';
  RAISE NOTICE 'Optimized views and functions added';
END $$;
