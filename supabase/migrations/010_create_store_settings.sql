-- Migration: Add Store Settings Table
-- Description: Creates store_settings table for Cedar B2B platform admin configuration
-- Date: 2025

-- =====================================================
-- STORE SETTINGS (Store & Branding)
-- =====================================================

CREATE TABLE IF NOT EXISTS store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Store Identity
    store_name TEXT NOT NULL DEFAULT 'Cedar Elevators',
    legal_name TEXT,
    
    -- Contact Information
    support_email TEXT,
    support_phone TEXT,
    
    -- Business Information
    gst_number TEXT,
    invoice_prefix TEXT NOT NULL DEFAULT 'CE',
    currency TEXT NOT NULL DEFAULT 'INR',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    
    -- Store Logo (URL to uploaded image)
    logo_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Singleton guard (only one row allowed)
    singleton_guard BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT singleton_store_settings UNIQUE (singleton_guard)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_store_settings_singleton ON store_settings(singleton_guard);

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Super admins, admins, managers, and staff can manage store settings (Tier-2)
CREATE POLICY "Admins can manage store settings"
    ON store_settings
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
CREATE POLICY "Authenticated users can read store settings"
    ON store_settings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Service role has full access
CREATE POLICY "Service role has full access to store_settings"
    ON store_settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- TRIGGER
-- =====================================================

-- Update updated_at timestamp
CREATE TRIGGER set_store_settings_updated_at
    BEFORE UPDATE ON store_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT VALUES
-- =====================================================

-- Store Settings Defaults
INSERT INTO store_settings (
    store_name,
    legal_name,
    support_email,
    support_phone,
    gst_number,
    invoice_prefix,
    currency,
    timezone
) VALUES (
    'Cedar Elevators',
    'Cedar Elevators Industries',
    'support@cedarelevators.com',
    '+91 98765 43210',
    '',
    'CE',
    'INR',
    'Asia/Kolkata'
) ON CONFLICT (singleton_guard) DO NOTHING;

-- =====================================================
-- COMMENT
-- =====================================================

COMMENT ON TABLE store_settings IS 'Store identity, branding, and contact information - Tier-2 (all admin roles can modify)';
