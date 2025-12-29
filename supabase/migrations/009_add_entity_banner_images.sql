-- =====================================================
-- Banner Management Refactor - Add Entity Banner Images
-- Phase 1: Database Schema Updates
-- =====================================================
-- This migration adds banner_image columns to entity tables
-- to support the new banner philosophy:
-- - All Products Carousel → managed in banners table
-- - Entity Banners → managed in entity tables (categories, elevator_types, collections)
-- =====================================================

-- =====================================================
-- CATEGORIES - Add Visual Identity Fields
-- =====================================================

-- Add banner_image field (if not exists)
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS banner_image TEXT;

-- Add thumbnail_image field (rename from image_url for clarity)
-- Note: image_url already exists, we'll keep both for backward compatibility
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS thumbnail_image TEXT;

-- Update thumbnail_image from existing image_url (one-time data migration)
UPDATE categories 
SET thumbnail_image = image_url 
WHERE thumbnail_image IS NULL AND image_url IS NOT NULL;

-- Add comments for clarity
COMMENT ON COLUMN categories.thumbnail_image IS 'Square/card image for category cards, grids, and filters';
COMMENT ON COLUMN categories.banner_image IS 'Wide banner image for category PLP header (optional, non-clickable)';
COMMENT ON COLUMN categories.image_url IS 'Legacy field, use thumbnail_image instead';

-- =====================================================
-- ELEVATOR TYPES - Add Visual Identity Fields
-- =====================================================

-- Add banner_image field
ALTER TABLE elevator_types 
ADD COLUMN IF NOT EXISTS banner_image TEXT;

-- Add thumbnail_image field (icon already exists, but add for consistency)
ALTER TABLE elevator_types 
ADD COLUMN IF NOT EXISTS thumbnail_image TEXT;

-- Migrate icon to thumbnail_image (one-time data migration)
UPDATE elevator_types 
SET thumbnail_image = icon 
WHERE thumbnail_image IS NULL AND icon IS NOT NULL;

-- Add comments for clarity
COMMENT ON COLUMN elevator_types.thumbnail_image IS 'Square/card image or icon for elevator type cards and filters';
COMMENT ON COLUMN elevator_types.banner_image IS 'Wide banner image for elevator type PLP header (optional, non-clickable)';
COMMENT ON COLUMN elevator_types.icon IS 'Legacy field (emoji/icon), use thumbnail_image for images';

-- =====================================================
-- COLLECTIONS - Add Visual Identity Fields
-- =====================================================

-- Add banner_image field
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS banner_image TEXT;

-- Add thumbnail_image field (rename from image_url for clarity)
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS thumbnail_image TEXT;

-- Update thumbnail_image from existing image_url (one-time data migration)
UPDATE collections 
SET thumbnail_image = image_url 
WHERE thumbnail_image IS NULL AND image_url IS NOT NULL;

-- Add comments for clarity
COMMENT ON COLUMN collections.thumbnail_image IS 'Square/card image for collection cards and grids';
COMMENT ON COLUMN collections.banner_image IS 'Wide banner image for collection PLP header (optional, non-clickable)';
COMMENT ON COLUMN collections.image_url IS 'Legacy field, use thumbnail_image instead';

-- =====================================================
-- BANNERS TABLE - Add Comments for New Philosophy
-- =====================================================

-- Add comments to clarify the new banner philosophy
COMMENT ON TABLE banners IS 'All Products Carousel banners ONLY - for homepage discovery navigation';
COMMENT ON COLUMN banners.placement IS 'DEPRECATED: Use only "hero-carousel" or "all-products-carousel". Other placements moved to entity tables.';
COMMENT ON COLUMN banners.target_type IS 'Link destination type: application, category, elevator-type, collection';
COMMENT ON COLUMN banners.target_id IS 'Link destination ID (UUID of the entity)';
COMMENT ON COLUMN banners.cta_text IS 'Required for carousel banners - button text';
COMMENT ON COLUMN banners.cta_link IS 'Optional manual link override (use target_type + target_id instead)';

-- =====================================================
-- INDEXES
-- =====================================================

-- No new indexes needed - banner_image and thumbnail_image don't need indexing
-- They are text fields for storing URLs, not used in WHERE clauses

-- =====================================================
-- STORAGE POLICIES (Already Exist from Previous Migrations)
-- =====================================================

-- Storage bucket 'banners' already exists and has proper policies
-- Entity images can use the same bucket or their own buckets
-- This migration doesn't change storage policies

-- =====================================================
-- DATA VALIDATION
-- =====================================================

-- Verify migration results
DO $$
DECLARE
  categories_count INTEGER;
  elevator_types_count INTEGER;
  collections_count INTEGER;
BEGIN
  -- Check categories
  SELECT COUNT(*) INTO categories_count 
  FROM information_schema.columns 
  WHERE table_name = 'categories' 
  AND column_name IN ('banner_image', 'thumbnail_image');
  
  -- Check elevator_types
  SELECT COUNT(*) INTO elevator_types_count 
  FROM information_schema.columns 
  WHERE table_name = 'elevator_types' 
  AND column_name IN ('banner_image', 'thumbnail_image');
  
  -- Check collections
  SELECT COUNT(*) INTO collections_count 
  FROM information_schema.columns 
  WHERE table_name = 'collections' 
  AND column_name IN ('banner_image', 'thumbnail_image');
  
  -- Log results
  RAISE NOTICE 'Migration completed successfully:';
  RAISE NOTICE '  - categories: % columns added', categories_count;
  RAISE NOTICE '  - elevator_types: % columns added', elevator_types_count;
  RAISE NOTICE '  - collections: % columns added', collections_count;
  RAISE NOTICE 'Expected: 2 columns per table (banner_image, thumbnail_image)';
END $$;

-- =====================================================
-- ROLLBACK SCRIPT (For Reference)
-- =====================================================

-- IF ROLLBACK NEEDED, RUN THIS MANUALLY:
/*
ALTER TABLE categories DROP COLUMN IF EXISTS banner_image;
ALTER TABLE categories DROP COLUMN IF EXISTS thumbnail_image;
ALTER TABLE elevator_types DROP COLUMN IF EXISTS banner_image;
ALTER TABLE elevator_types DROP COLUMN IF EXISTS thumbnail_image;
ALTER TABLE collections DROP COLUMN IF EXISTS banner_image;
ALTER TABLE collections DROP COLUMN IF EXISTS thumbnail_image;
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================
