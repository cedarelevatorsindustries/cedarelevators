-- Migration: Add Homepage Promotion to Store Settings
-- Description: Adds a JSONB column to store_settings for optional admin-controlled homepage promotional banners
-- Date: 2026-01-20

ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS homepage_promotion JSONB DEFAULT NULL;

COMMENT ON COLUMN store_settings.homepage_promotion IS 'Optional admin-controlled homepage promotion settings (enabled, title, description, image_url, cta_label, cta_url, start_date, end_date)';
