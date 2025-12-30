-- Migration: Cleanup Store Settings
-- Description: Drops legacy/unused columns while preserving structured address fields
-- Date: 2025-12-30

-- 1. Drop legacy address column (replaced by address_line1, city, etc.)
ALTER TABLE store_settings 
DROP COLUMN IF EXISTS store_address;

-- 2. Drop unused media/meta columns
ALTER TABLE store_settings 
DROP COLUMN IF EXISTS store_favicon_url,
DROP COLUMN IF EXISTS meta_title,
DROP COLUMN IF EXISTS meta_description;

-- 3. Drop individual social columns (replaced by social_media JSON)
ALTER TABLE store_settings 
DROP COLUMN IF EXISTS social_facebook,
DROP COLUMN IF EXISTS social_instagram,
DROP COLUMN IF EXISTS social_twitter,
DROP COLUMN IF EXISTS social_linkedin,
DROP COLUMN IF EXISTS social_youtube;
