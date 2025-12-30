-- Migration: Finalize Store Settings
-- Description: Drops unused columns to strictly match GeneralSettingsForm
-- Date: 2025-12-30

ALTER TABLE store_settings 
DROP COLUMN IF EXISTS legal_name,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS gst_number,
DROP COLUMN IF EXISTS logo_url;
