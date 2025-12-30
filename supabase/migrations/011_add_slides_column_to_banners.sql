-- Add slides column to banners table
ALTER TABLE banners ADD COLUMN IF NOT EXISTS slides JSONB DEFAULT '[]'::jsonb;

-- Migrate data from banner_slides to banners.slides
-- We aggregate slides for each banner into a JSON array
WITH aggregated_slides AS (
    SELECT 
        banner_id, 
        jsonb_agg(
            jsonb_build_object(
                'id', id,
                'image_url', image_url,
                'mobile_image_url', mobile_image_url,
                'image_alt', image_alt,
                'sort_order', sort_order
            ) ORDER BY sort_order
        ) as slides_data
    FROM banner_slides
    GROUP BY banner_id
)
UPDATE banners
SET slides = aggregated_slides.slides_data
FROM aggregated_slides
WHERE banners.id = aggregated_slides.banner_id;

-- Add comment to document the column purpose
COMMENT ON COLUMN banners.slides IS 'Stores carousel slides as a JSON array containing image URLs and metadata';
