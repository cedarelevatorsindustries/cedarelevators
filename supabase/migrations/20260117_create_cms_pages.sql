-- Create CMS Pages table for managing content pages
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  
  -- SEO Fields
  seo_title VARCHAR(255),
  seo_description TEXT,
  
  -- Hero Section
  hero_subtitle TEXT,
  hero_image_url TEXT,
  
  -- Display Options
  show_toc BOOLEAN DEFAULT true,
  show_last_updated BOOLEAN DEFAULT true,
  
  -- Status & Publishing
  is_published BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  
  -- Timestamps & Attribution
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Create indexes for faster lookups
CREATE INDEX idx_cms_pages_slug ON public.cms_pages(slug);
CREATE INDEX idx_cms_pages_is_published ON public.cms_pages(is_published);

-- Insert initial CMS pages for all 7 key pages
INSERT INTO public.cms_pages (slug, title, hero_subtitle, show_toc, is_published) VALUES
  -- Company Pages
  ('about-us', 'About Cedar Elevator Industries', 'Your trusted partner for quality elevator solutions', true, false),
  ('why-choose-cedar', 'Why Choose Cedar', 'Engineering excellence meets transparent service', true, false),
  ('warranty-information', 'Warranty Information', 'Comprehensive protection for your investment', true, false),
  
  -- Policy Pages
  ('privacy-policy', 'Privacy Policy', 'How we protect and use your information', true, false),
  ('terms-conditions', 'Terms & Conditions', 'Guidelines for using our services', true, false),
  ('return-policy', 'Return Policy', 'Simple and fair return process', true, false),
  ('shipping-policy', 'Shipping Policy', 'Fast, reliable delivery across India', true, false)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

-- Public can read published pages
CREATE POLICY "Anyone can view published CMS pages"
  ON public.cms_pages
  FOR SELECT
  USING (is_published = true);

-- Admins can manage all CMS pages
CREATE POLICY "Admins can manage all CMS pages"
  ON public.cms_pages
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Function to update updated_at timestamp and increment version
CREATE OR REPLACE FUNCTION update_cms_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Increment version if content changed
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    NEW.version = OLD.version + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at and version
CREATE TRIGGER trigger_update_cms_pages_updated_at
  BEFORE UPDATE ON public.cms_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_pages_updated_at();

