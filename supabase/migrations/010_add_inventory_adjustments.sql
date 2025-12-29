-- =====================================================
-- Cedar Elevators - Inventory Adjustments (Phase 4)
-- Adds manual stock adjustment capability with audit trail
-- =====================================================

-- =====================================================
-- INVENTORY ADJUSTMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  adjustment_type VARCHAR(20) NOT NULL CHECK (adjustment_type IN ('set', 'add', 'reduce', 'recount')),
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  quantity_changed INTEGER NOT NULL,
  reason VARCHAR(255) NOT NULL,
  notes TEXT,
  adjusted_by VARCHAR(255) NOT NULL, -- Admin clerk_user_id
  adjusted_by_name VARCHAR(255), -- Admin name for display
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product ON inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_adjusted_by ON inventory_adjustments(adjusted_by);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created_at ON inventory_adjustments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_type ON inventory_adjustments(adjustment_type);

-- =====================================================
-- LOW STOCK THRESHOLD CONFIGURATION
-- =====================================================

-- Add low_stock_threshold column to products (default: 10 units)
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;

-- Add index for low stock queries
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(stock_quantity) 
  WHERE stock_quantity > 0 AND stock_quantity < 10;

-- =====================================================
-- HELPER VIEWS
-- =====================================================

-- View for products with low stock
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
  p.id,
  p.name,
  p.sku,
  p.stock_quantity,
  p.low_stock_threshold,
  p.price,
  p.status
FROM products p
WHERE p.stock_quantity > 0 
  AND p.stock_quantity <= COALESCE(p.low_stock_threshold, 10)
  AND p.status = 'active'
ORDER BY p.stock_quantity ASC;

-- View for out of stock products
CREATE OR REPLACE VIEW out_of_stock_products AS
SELECT 
  p.id,
  p.name,
  p.sku,
  p.stock_quantity,
  p.price,
  p.status
FROM products p
WHERE p.stock_quantity = 0 
  AND p.status = 'active'
ORDER BY p.updated_at DESC;

-- =====================================================
-- RLS POLICIES (if Row Level Security is enabled)
-- =====================================================

-- Enable RLS on inventory_adjustments
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;

-- Allow admin users to view all adjustments
CREATE POLICY "Admin can view all inventory adjustments"
  ON inventory_adjustments
  FOR SELECT
  USING (true);

-- Allow admin users to insert adjustments
CREATE POLICY "Admin can insert inventory adjustments"
  ON inventory_adjustments
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE inventory_adjustments IS 'Manual inventory adjustments with full audit trail';
COMMENT ON COLUMN inventory_adjustments.adjustment_type IS 'Type of adjustment: set (set to value), add (increase), reduce (decrease), recount (physical recount)';
COMMENT ON COLUMN inventory_adjustments.quantity_before IS 'Stock quantity before adjustment';
COMMENT ON COLUMN inventory_adjustments.quantity_after IS 'Stock quantity after adjustment';
COMMENT ON COLUMN inventory_adjustments.quantity_changed IS 'Net change in quantity (can be negative)';
COMMENT ON COLUMN inventory_adjustments.reason IS 'Required reason for adjustment';
COMMENT ON COLUMN inventory_adjustments.notes IS 'Optional additional notes';
COMMENT ON COLUMN products.low_stock_threshold IS 'Alert threshold for low stock warnings (default: 10 units)';

