-- =============================================
-- Add Collection Display Configuration Fields
-- =============================================

-- Add new fields to collections table for display configuration
ALTER TABLE collections ADD COLUMN IF NOT EXISTS display_location JSONB DEFAULT '[]'::jsonb;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS layout VARCHAR(50) DEFAULT 'grid-5';
ALTER TABLE collections ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'none';
ALTER TABLE collections ADD COLUMN IF NOT EXISTS show_view_all BOOLEAN DEFAULT true;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS view_all_link VARCHAR(255);
ALTER TABLE collections ADD COLUMN IF NOT EXISTS empty_state_message TEXT;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_collections_display_location ON collections USING GIN (display_location);
CREATE INDEX IF NOT EXISTS idx_collections_layout ON collections(layout);

-- Add comments for documentation
COMMENT ON COLUMN collections.display_location IS 'Array of locations where this collection should be displayed: ["House", "catalog", "product"]';
COMMENT ON COLUMN collections.layout IS 'Layout type: grid-5, grid-4, grid-3, horizontal-scroll, special';
COMMENT ON COLUMN collections.icon IS 'Icon type: heart, trending, star, new, recommended, none';
COMMENT ON COLUMN collections.show_view_all IS 'Whether to show View All button';
COMMENT ON COLUMN collections.view_all_link IS 'Custom link for View All button';
COMMENT ON COLUMN collections.empty_state_message IS 'Message to show when collection has no products';
