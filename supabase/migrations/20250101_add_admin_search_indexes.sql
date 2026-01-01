-- =====================================================
-- Admin Search Indexes Migration
-- =====================================================
-- This migration adds database indexes to optimize
-- admin search functionality for products and orders
-- =====================================================

-- Indexes for Products Search
-- Note: idx_products_sku already exists in 002_create_ecommerce_schema.sql
CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);

-- Indexes for Product Variants Search  
-- Note: idx_product_variants_sku already exists in 002_create_ecommerce_schema.sql
-- Adding it again with IF NOT EXISTS for safety
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants (sku);

-- Indexes for Orders Search
-- Note: idx_orders_order_number and idx_orders_guest_email already exist in 002_create_ecommerce_schema.sql
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_guest_name ON orders (guest_name);
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders (guest_email);

-- Verification: Uncomment to check if indexes were created
-- SELECT indexname, tablename 
-- FROM pg_indexes 
-- WHERE tablename IN ('products', 'product_variants', 'orders')
-- ORDER BY tablename, indexname;
