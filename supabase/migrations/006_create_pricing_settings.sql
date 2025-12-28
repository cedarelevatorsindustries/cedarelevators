-- Migration: Add Pricing Settings Table
-- Description: Creates pricing_settings table for global pricing rules in Cedar B2B platform
-- Date: 2025

-- Create pricing_settings table
CREATE TABLE IF NOT EXISTS pricing_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Price Visibility Rules (per user type)
    guest_price_visible BOOLEAN NOT NULL DEFAULT false,
    individual_price_visible BOOLEAN NOT NULL DEFAULT false,
    business_unverified_price_visible BOOLEAN NOT NULL DEFAULT true,
    business_verified_price_visible BOOLEAN NOT NULL DEFAULT true,
    
    -- Purchase Rules
    business_verified_can_buy BOOLEAN NOT NULL DEFAULT true,
    
    -- Bulk Pricing & Limits
    bulk_pricing_enabled BOOLEAN NOT NULL DEFAULT true,
    minimum_order_quantity INTEGER NOT NULL DEFAULT 1,
    discount_cap_percentage DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Singleton guard (only one row allowed)
    singleton_guard BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT singleton_pricing_settings UNIQUE (singleton_guard)
);

-- Create index
CREATE INDEX idx_pricing_settings_singleton ON pricing_settings(singleton_guard);

-- Enable RLS
ALTER TABLE pricing_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Super admins can read and write
CREATE POLICY "Super admins can manage pricing settings"
    ON pricing_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles
            WHERE admin_profiles.user_id = auth.uid()
            AND admin_profiles.role = 'super_admin'
            AND admin_profiles.is_active = true
        )
    );

-- All authenticated users can read (needed for app logic)
CREATE POLICY "Authenticated users can read pricing settings"
    ON pricing_settings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pricing_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_pricing_settings_updated_at
    BEFORE UPDATE ON pricing_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_pricing_settings_updated_at();

-- Insert default pricing settings
INSERT INTO pricing_settings (
    guest_price_visible,
    individual_price_visible,
    business_unverified_price_visible,
    business_verified_price_visible,
    business_verified_can_buy,
    bulk_pricing_enabled,
    minimum_order_quantity,
    discount_cap_percentage
) VALUES (
    false,  -- Guest: no price visibility
    false,  -- Individual: no price visibility
    true,   -- Business Unverified: can see prices
    true,   -- Business Verified: can see prices
    true,   -- Business Verified: can buy
    true,   -- Bulk pricing enabled
    1,      -- MOQ: 1
    15.00   -- Discount cap: 15%
) ON CONFLICT (singleton_guard) DO NOTHING;

-- Add comment
COMMENT ON TABLE pricing_settings IS 'Global pricing rules for Cedar B2B platform - controls price visibility and purchase permissions per user type';
