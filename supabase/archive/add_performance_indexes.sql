-- =============================================
-- Mobile Performance Optimization: Database Indexes
-- =============================================
-- These indexes significantly improve query performance for mobile catalog
-- and product listing pages
-- Run with CONCURRENTLY to avoid locking tables in production
-- =============================================

-- Index for product filtering (mobile catalog)
-- Improves queries that filter by status and sort by created_at
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_status_created 
ON products(status, created_at DESC)
WHERE status = 'active';

-- Index for category slug lookups (catalog navigation)
-- Speeds up category page loads
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_slug_active 
ON categories(slug) 
WHERE is_active = true;

-- Index for category handle lookups (alternative slug)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_handle_active 
ON categories(handle) 
WHERE is_active = true;

-- Index for product_categories join (category filtering)
-- Critical for "products by category" queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_categories_category_product 
ON product_categories(category_id, product_id);

-- Reverse index for product_categories (finding categories for a product)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_categories_product_category 
ON product_categories(product_id, category_id);

-- Index for full-text search on products
-- Dramatically improves search performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search 
ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')))
WHERE status = 'active';

-- Index for product slug lookups (product detail pages)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_slug 
ON products(slug) 
WHERE status = 'active';

-- Index for variants stock check (availability queries)
-- Helps determine if products are in stock
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_variants_stock_active 
ON product_variants(product_id, inventory_quantity) 
WHERE status = 'active';

-- Index for variant SKU lookups (search by SKU)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_variants_sku 
ON product_variants(sku) 
WHERE status = 'active';

-- Index for subcategory lookups via junction table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_category_subcategories_category 
ON category_subcategories(category_id, subcategory_id);

-- Index for application categories (filtering products by application)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_application_categories_category 
ON application_categories(category_id, application_id);

-- Index for application categories reverse lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_application_categories_application 
ON application_categories(application_id, category_id);

-- Index for product applications junction
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_applications_product 
ON product_applications(product_id, application_id);

-- Index for orders by user (user order history)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_created 
ON orders(user_id, created_at DESC)
WHERE status IS NOT NULL;

-- Index for quotes by user (user quote history)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotes_user_created 
ON quotes(user_id, created_at DESC)
WHERE status IS NOT NULL;

-- =============================================
-- VERIFICATION: Check index usage
-- =============================================
-- Run these queries after creating indexes to verify they're being used:
-- 
-- EXPLAIN ANALYZE SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC LIMIT 20;
-- EXPLAIN ANALYZE SELECT * FROM categories WHERE slug = 'passenger-lifts';
-- EXPLAIN ANALYZE SELECT p.* FROM products p 
--   INNER JOIN product_categories pc ON p.id = pc.product_id 
--   WHERE pc.category_id = 'some-category-id';
-- 
-- Look for "Index Scan" or "Bitmap Index Scan" in the query plan
-- =============================================

-- =============================================
-- MAINTENANCE: Analyze tables after creating indexes
-- =============================================
-- Update table statistics for query planner
ANALYZE products;
ANALYZE categories;
ANALYZE product_categories;
ANALYZE product_variants;
ANALYZE category_subcategories;
ANALYZE application_categories;
ANALYZE orders;
ANALYZE quotes;
