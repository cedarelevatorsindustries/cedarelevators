-- Create banner_slides table for multiple images per banner
-- This allows carousel banners to have multiple slides instead of just one image

CREATE TABLE IF NOT EXISTS banner_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID NOT NULL REFERENCES banners(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  image_alt TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient querying
CREATE INDEX idx_banner_slides_banner_id ON banner_slides(banner_id);
CREATE INDEX idx_banner_slides_sort_order ON banner_slides(banner_id, sort_order);

-- Add RLS policies
ALTER TABLE banner_slides ENABLE ROW LEVEL SECURITY;

-- Allow public to read banner slides
CREATE POLICY "Allow public read access to banner slides"
  ON banner_slides
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated admins to manage banner slides
CREATE POLICY "Allow admins to manage banner slides"
  ON banner_slides
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

-- Migrate existing banners to banner_slides
-- This will create one slide for each existing banner that has an image
INSERT INTO banner_slides (banner_id, image_url, mobile_image_url, image_alt, sort_order)
SELECT 
  id as banner_id,
  image_url,
  mobile_image_url,
  image_alt,
  0 as sort_order
FROM banners
WHERE image_url IS NOT NULL AND image_url != ''
ON CONFLICT DO NOTHING;

-- Add comment to document the table purpose
COMMENT ON TABLE banner_slides IS 'Stores multiple image slides for carousel banners, allowing each banner to have multiple images displayed in sequence';
