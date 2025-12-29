-- =====================================================
-- Cedar Elevators - Additional Product Fields for Phase 3
-- Adds technical specifications and additional elevator types
-- =====================================================

-- =====================================================
-- ADD MISSING ELEVATOR TYPES
-- =====================================================

-- Add Passenger, Freight, and Home elevator types
INSERT INTO elevator_types (name, slug, description, sort_order) VALUES
  ('Passenger', 'passenger', 'Passenger elevator systems for people transport', 0),
  ('Freight', 'freight', 'Freight and cargo elevator systems', 5),
  ('Home', 'home', 'Home elevator solutions for residential properties', 6)
ON CONFLICT (name) DO NOTHING;

-- Update existing elevator types sort order for better organization
UPDATE elevator_types SET sort_order = 1 WHERE slug = 'passenger';
UPDATE elevator_types SET sort_order = 2 WHERE slug = 'residential';
UPDATE elevator_types SET sort_order = 3 WHERE slug = 'commercial';
UPDATE elevator_types SET sort_order = 4 WHERE slug = 'industrial';
UPDATE elevator_types SET sort_order = 5 WHERE slug = 'hospital';
UPDATE elevator_types SET sort_order = 6 WHERE slug = 'freight';
UPDATE elevator_types SET sort_order = 7 WHERE slug = 'home';

-- =====================================================
-- ADD MISSING APPLICATIONS
-- =====================================================

-- Add "Others" application type
INSERT INTO categories (name, slug, description, parent_id, application, is_active, sort_order) VALUES
  ('Others', 'others', 'Miscellaneous elevator products and services', NULL, 'others', true, 4)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- ADD TECHNICAL SPECIFICATION FIELDS TO PRODUCTS
-- =====================================================

-- Add voltage field (can be: 220V, 380V, 415V, etc.)
ALTER TABLE products ADD COLUMN IF NOT EXISTS voltage VARCHAR(50);

-- Add load capacity field (in kg)
ALTER TABLE products ADD COLUMN IF NOT EXISTS load_capacity_kg INTEGER;

-- Add speed field (in m/s)
ALTER TABLE products ADD COLUMN IF NOT EXISTS speed_ms DECIMAL(4,2);

-- Add variant group (for grouping product variants)
ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_group VARCHAR(100);

-- Add technical specifications as JSONB for flexible storage
-- This will store additional specs like:
-- { "floors": 10, "door_type": "automatic", "control_system": "microprocessor" }
ALTER TABLE products ADD COLUMN IF NOT EXISTS technical_specs JSONB DEFAULT '{}'::jsonb;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_products_voltage ON products(voltage);
CREATE INDEX IF NOT EXISTS idx_products_load_capacity ON products(load_capacity_kg);
CREATE INDEX IF NOT EXISTS idx_products_variant_group ON products(variant_group);
CREATE INDEX IF NOT EXISTS idx_products_technical_specs ON products USING GIN (technical_specs);

-- =====================================================
-- UPDATE TRIGGER FOR UPDATED_AT
-- =====================================================

-- Ensure products table has updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN products.voltage IS 'Operating voltage (e.g., 220V, 380V, 415V)';
COMMENT ON COLUMN products.load_capacity_kg IS 'Maximum load capacity in kilograms';
COMMENT ON COLUMN products.speed_ms IS 'Operating speed in meters per second';
COMMENT ON COLUMN products.variant_group IS 'Group identifier for product variants';
COMMENT ON COLUMN products.technical_specs IS 'Additional technical specifications as JSON';

