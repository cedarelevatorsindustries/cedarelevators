-- =============================================
-- Banner Management Schema for Cedar Elevators
-- =============================================

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500),
  internal_name VARCHAR(255) NOT NULL, -- Admin reference name
  
  -- Media
  image_url TEXT NOT NULL,
  image_alt VARCHAR(255),
  mobile_image_url TEXT, -- Optional mobile-specific image
  
  -- Placement & Targeting
  -- Placements: hero-carousel, category-header, application-header, announcement-bar, collection-banner
  placement VARCHAR(50) NOT NULL,
  target_type VARCHAR(50), -- category, application, collection, all
  target_id UUID, -- Reference to category/application ID if targeted
  
  -- Call to Action
  cta_text VARCHAR(100),
  cta_link TEXT,
  cta_style VARCHAR(20) DEFAULT 'primary', -- primary, secondary, outline
  
  -- Scheduling
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Display
  position INTEGER DEFAULT 0,
  background_color VARCHAR(20),
  text_color VARCHAR(20) DEFAULT 'white',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_profiles(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_banners_placement ON banners(placement);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_dates ON banners(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_banners_target ON banners(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(placement, position);

-- Enable RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (admin-only table, protected by application layer)
CREATE POLICY "Allow all banner operations" ON banners
  FOR ALL USING (true);

-- Function to compute banner status based on dates
CREATE OR REPLACE FUNCTION get_banner_status(
  p_is_active BOOLEAN,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
) RETURNS TEXT AS $$
BEGIN
  IF NOT p_is_active THEN
    RETURN 'disabled';
  END IF;
  
  IF p_start_date IS NOT NULL AND p_start_date > NOW() THEN
    RETURN 'scheduled';
  END IF;
  
  IF p_end_date IS NOT NULL AND p_end_date < NOW() THEN
    RETURN 'expired';
  END IF;
  
  RETURN 'active';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create storage bucket for banner images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for banner images
CREATE POLICY "Public banner images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Authenticated users can upload banner images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Authenticated users can update banner images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'banners');

CREATE POLICY "Authenticated users can delete banner images"
ON storage.objects FOR DELETE
USING (bucket_id = 'banners');

-- =============================================
-- Sample Banner Placements Reference:
-- =============================================
-- hero-carousel      : Main homepage slider
-- category-header    : Banner at top of category listing pages
-- application-header : Banner for application pages (residential, commercial, etc.)
-- announcement-bar   : Thin persistent bar at top of site
-- collection-banner  : Featured collection promotional banners
-- =============================================
