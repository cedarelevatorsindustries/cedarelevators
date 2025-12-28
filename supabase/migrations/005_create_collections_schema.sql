-- =============================================
-- Categories & Collections Schema for Cedar Elevators
-- 3-Layer Architecture: Application > Categories > Subcategories
-- =============================================

-- =============================================
-- COLLECTIONS
-- =============================================

-- Collections table (Featured product groups)
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  
  -- Media
  image_url TEXT,
  image_alt VARCHAR(255),
  
  -- Collection Type
  type VARCHAR(50) DEFAULT 'manual', -- manual, automatic (for future)
  
  -- Automatic Collection Rules (for future use)
  rule_json JSONB,
  
  -- Display
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_profiles(id)
);

-- Product-Collection junction table
CREATE TABLE IF NOT EXISTS product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, collection_id)
);

-- Indexes for collections
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active);
CREATE INDEX IF NOT EXISTS idx_collections_featured ON collections(is_featured);
CREATE INDEX IF NOT EXISTS idx_collections_sort ON collections(sort_order);
CREATE INDEX IF NOT EXISTS idx_product_collections_product ON product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection ON product_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_position ON product_collections(collection_id, position);

-- =============================================
-- CATEGORIES ENHANCEMENTS
-- =============================================

-- Add missing fields to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_alt VARCHAR(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES admin_profiles(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS application VARCHAR(100); -- residential, commercial, industrial, etc.

-- Update existing data
UPDATE categories SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END WHERE status IS NULL;

-- Additional index for application filtering
CREATE INDEX IF NOT EXISTS idx_categories_application ON categories(application);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

-- Collections policies
CREATE POLICY "Allow all collection operations" ON collections FOR ALL USING (true);
CREATE POLICY "Allow all product_collections operations" ON product_collections FOR ALL USING (true);

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Collections images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('collections', 'collections', true)
ON CONFLICT (id) DO NOTHING;

-- Categories images bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('categories', 'categories', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for collections
DO $$ BEGIN
  CREATE POLICY "Public collection images viewable" ON storage.objects FOR SELECT USING (bucket_id = 'collections');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated upload collections" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'collections');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated update collections" ON storage.objects FOR UPDATE USING (bucket_id = 'collections');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated delete collections" ON storage.objects FOR DELETE USING (bucket_id = 'collections');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Storage policies for categories
DO $$ BEGIN
  CREATE POLICY "Public category images viewable" ON storage.objects FOR SELECT USING (bucket_id = 'categories');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated upload categories" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'categories');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated update categories" ON storage.objects FOR UPDATE USING (bucket_id = 'categories');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated delete categories" ON storage.objects FOR DELETE USING (bucket_id = 'categories');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get category hierarchy
CREATE OR REPLACE FUNCTION get_category_hierarchy(category_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  level INTEGER
) AS $$
WITH RECURSIVE category_tree AS (
  -- Base case: start with the given category
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.parent_id,
    0 as level
  FROM categories c
  WHERE c.id = category_id
  
  UNION ALL
  
  -- Recursive case: get parent categories
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.parent_id,
    ct.level + 1
  FROM categories c
  INNER JOIN category_tree ct ON c.id = ct.parent_id
)
SELECT id, name, slug, level
FROM category_tree
ORDER BY level DESC;
$$ LANGUAGE sql STABLE;

-- =============================================
-- NOTES
-- =============================================
-- 3-Layer Category Architecture:
-- 1. Application (parent_id = NULL, application field set)
--    Examples: Residential, Commercial, Industrial
-- 2. Categories (parent_id = application_id)
--    Examples: Elevator Parts, Control Systems, Safety Equipment
-- 3. Subcategories (parent_id = category_id)
--    Examples: Motors, Cables, Buttons
-- =============================================
