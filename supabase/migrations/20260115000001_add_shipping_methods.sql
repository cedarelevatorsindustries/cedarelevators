-- Migration: Add shipping method and pickup locations support
-- Run this migration to support new checkout features

-- Add shipping method and pickup location to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(20) CHECK (shipping_method IN ('doorstep', 'pickup')),
ADD COLUMN IF NOT EXISTS pickup_location_id UUID;

-- Create pickup_locations table
CREATE TABLE IF NOT EXISTS pickup_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  phone VARCHAR(20),
  hours TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial pickup locations
INSERT INTO pickup_locations (name, address, city, state, phone, hours, is_active)
VALUES
  ('Cedar Store – Chennai', 'T. Nagar', 'Chennai', 'Tamil Nadu', '+91-44-1234-5678', 'Mon-Sat: 9 AM - 7 PM', true),
  ('Cedar Store – Bangalore', 'Whitefield', 'Bangalore', 'Karnataka', '+91-80-1234-5678', 'Mon-Sat: 9 AM - 7 PM', true)
ON CONFLICT DO NOTHING;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_shipping_method ON orders(shipping_method);
CREATE INDEX IF NOT EXISTS idx_pickup_locations_active ON pickup_locations(is_active) WHERE is_active = true;

-- Add comment
COMMENT ON COLUMN orders.shipping_method IS 'Delivery method: doorstep or pickup';
COMMENT ON COLUMN orders.pickup_location_id IS 'Reference to pickup location if shipping_method is pickup';
COMMENT ON TABLE pickup_locations IS 'Store locations available for order pickup';
