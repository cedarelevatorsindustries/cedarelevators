
ALTER TABLE banners 
ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_banners_collection_id ON banners(collection_id);
