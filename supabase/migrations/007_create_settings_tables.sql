-- Migration: Add Settings Tables (Payment, Tax, Shipping, System)
-- Description: Creates settings tables for Cedar B2B platform admin configuration
-- Date: 2025

-- =====================================================
-- PAYMENT SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Payment Method Toggles (Simplified - keys in env vars)
    razorpay_enabled BOOLEAN NOT NULL DEFAULT false,
    bank_transfer_enabled BOOLEAN NOT NULL DEFAULT false,
    credit_terms_enabled BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Singleton guard (only one row allowed)
    singleton_guard BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT singleton_payment_settings UNIQUE (singleton_guard)
);

-- Create index
CREATE INDEX idx_payment_settings_singleton ON payment_settings(singleton_guard);

-- Enable RLS
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Super admins can manage payment settings"
    ON payment_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles
            WHERE admin_profiles.user_id = auth.uid()
            AND admin_profiles.role = 'super_admin'
            AND admin_profiles.is_active = true
        )
    );

-- All authenticated users can read
CREATE POLICY "Authenticated users can read payment settings"
    ON payment_settings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- =====================================================
-- TAX SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS tax_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic GST Settings (India-focused)
    gst_enabled BOOLEAN NOT NULL DEFAULT true,
    default_gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    
    -- Tax Calculation Method
    prices_include_tax BOOLEAN NOT NULL DEFAULT false,
    
    -- GST Components
    use_cgst_sgst_igst BOOLEAN NOT NULL DEFAULT true,
    
    -- Store Location (for tax calculation)
    store_state TEXT DEFAULT 'Tamil Nadu',
    store_gstin TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Singleton guard
    singleton_guard BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT singleton_tax_settings UNIQUE (singleton_guard)
);

-- Create index
CREATE INDEX idx_tax_settings_singleton ON tax_settings(singleton_guard);

-- Enable RLS
ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Super admins can manage tax settings"
    ON tax_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles
            WHERE admin_profiles.user_id = auth.uid()
            AND admin_profiles.role = 'super_admin'
            AND admin_profiles.is_active = true
        )
    );

-- All authenticated users can read
CREATE POLICY "Authenticated users can read tax settings"
    ON tax_settings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- =====================================================
-- SHIPPING SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS shipping_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Free Shipping
    free_shipping_enabled BOOLEAN NOT NULL DEFAULT false,
    free_shipping_threshold DECIMAL(10,2) DEFAULT 2000.00,
    
    -- Flat Rate Shipping
    flat_rate_enabled BOOLEAN NOT NULL DEFAULT true,
    
    -- Delivery SLA
    delivery_sla_text TEXT DEFAULT '7-10 business days',
    
    -- Shipping Zones (JSONB for flexibility)
    shipping_zones JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Singleton guard
    singleton_guard BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT singleton_shipping_settings UNIQUE (singleton_guard)
);

-- Create index
CREATE INDEX idx_shipping_settings_singleton ON shipping_settings(singleton_guard);

-- Enable RLS
ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage shipping settings"
    ON shipping_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles
            WHERE admin_profiles.user_id = auth.uid()
            AND admin_profiles.role IN ('super_admin', 'admin', 'manager', 'staff')
            AND admin_profiles.is_active = true
        )
    );

-- All authenticated users can read
CREATE POLICY "Authenticated users can read shipping settings"
    ON shipping_settings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- =====================================================
-- SYSTEM SETTINGS (Feature Flags & Maintenance)
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Feature Flags
    bulk_operations_enabled BOOLEAN NOT NULL DEFAULT true,
    advanced_analytics_enabled BOOLEAN NOT NULL DEFAULT false,
    experimental_features_enabled BOOLEAN NOT NULL DEFAULT false,
    
    -- Maintenance Mode
    maintenance_mode_enabled BOOLEAN NOT NULL DEFAULT false,
    maintenance_message TEXT DEFAULT 'We''re currently performing system maintenance. We''ll be back shortly!',
    
    -- Debug Settings
    debug_logging_enabled BOOLEAN NOT NULL DEFAULT false,
    show_detailed_errors BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Singleton guard
    singleton_guard BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT singleton_system_settings UNIQUE (singleton_guard)
);

-- Create index
CREATE INDEX idx_system_settings_singleton ON system_settings(singleton_guard);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Super admins can manage system settings"
    ON system_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles
            WHERE admin_profiles.user_id = auth.uid()
            AND admin_profiles.role = 'super_admin'
            AND admin_profiles.is_active = true
        )
    );

-- All authenticated users can read
CREATE POLICY "Authenticated users can read system settings"
    ON system_settings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamps
CREATE TRIGGER set_payment_settings_updated_at
    BEFORE UPDATE ON payment_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_tax_settings_updated_at
    BEFORE UPDATE ON tax_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_shipping_settings_updated_at
    BEFORE UPDATE ON shipping_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT VALUES
-- =====================================================

-- Payment Settings Defaults
INSERT INTO payment_settings (
    razorpay_enabled,
    bank_transfer_enabled,
    credit_terms_enabled
) VALUES (
    false,  -- Razorpay disabled by default
    true,   -- Bank transfer enabled
    false   -- Credit terms disabled by default
) ON CONFLICT (singleton_guard) DO NOTHING;

-- Tax Settings Defaults
INSERT INTO tax_settings (
    gst_enabled,
    default_gst_percentage,
    prices_include_tax,
    use_cgst_sgst_igst,
    store_state
) VALUES (
    true,           -- GST enabled
    18.00,          -- 18% default GST
    false,          -- Prices exclude tax
    true,           -- Use CGST/SGST/IGST split
    'Tamil Nadu'    -- Default state
) ON CONFLICT (singleton_guard) DO NOTHING;

-- Shipping Settings Defaults
INSERT INTO shipping_settings (
    free_shipping_enabled,
    free_shipping_threshold,
    flat_rate_enabled,
    delivery_sla_text,
    shipping_zones
) VALUES (
    false,                      -- Free shipping disabled
    2000.00,                    -- ₹2000 threshold
    true,                       -- Flat rate enabled
    '7-10 business days',       -- Default SLA
    '[
        {"zone": "Tamil Nadu", "condition": "≤4 items", "rate": 60, "enabled": true},
        {"zone": "Tamil Nadu", "condition": "≥5 items", "rate": 120, "enabled": true},
        {"zone": "Outside Tamil Nadu", "condition": "≤4 items", "rate": 100, "enabled": true},
        {"zone": "Outside Tamil Nadu", "condition": "≥5 items", "rate": 150, "enabled": true}
    ]'::jsonb
) ON CONFLICT (singleton_guard) DO NOTHING;

-- System Settings Defaults
INSERT INTO system_settings (
    bulk_operations_enabled,
    advanced_analytics_enabled,
    experimental_features_enabled,
    maintenance_mode_enabled,
    maintenance_message,
    debug_logging_enabled,
    show_detailed_errors
) VALUES (
    true,   -- Bulk operations enabled
    false,  -- Advanced analytics disabled
    false,  -- Experimental features disabled
    false,  -- Maintenance mode off
    'We''re currently performing system maintenance. We''ll be back shortly!',
    false,  -- Debug logging off
    false   -- Detailed errors off (production safe)
) ON CONFLICT (singleton_guard) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE payment_settings IS 'Payment method configuration - API keys stored in environment variables';
COMMENT ON TABLE tax_settings IS 'GST/Tax configuration for India-focused B2B platform';
COMMENT ON TABLE shipping_settings IS 'Shipping zones, rates, and fulfillment settings';
COMMENT ON TABLE system_settings IS 'Feature flags, maintenance mode, and debug settings - Super Admin only';
