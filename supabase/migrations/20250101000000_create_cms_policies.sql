-- Create CMS Policies table
CREATE TABLE IF NOT EXISTS public.cms_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('privacy', 'terms', 'return', 'shipping')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(type)
);

-- Enable RLS
ALTER TABLE public.cms_policies ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to published policies
CREATE POLICY "Allow public read access to published policies"
    ON public.cms_policies
    FOR SELECT
    USING (status = 'published');

-- Policy: Allow authenticated users to read all policies
CREATE POLICY "Allow authenticated users to read all policies"
    ON public.cms_policies
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to insert/update/delete policies
CREATE POLICY "Allow authenticated users to manage policies"
    ON public.cms_policies
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.cms_policies
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add about_cedar column to store_settings table
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS about_cedar TEXT;

COMMENT ON TABLE public.cms_policies IS 'Stores CMS policies like Privacy Policy, Terms of Service, etc.';
COMMENT ON COLUMN public.cms_policies.type IS 'Type of policy: privacy, terms, return, shipping';
COMMENT ON COLUMN public.cms_policies.status IS 'Publication status: draft or published';
COMMENT ON COLUMN public.store_settings.about_cedar IS 'About Cedar company description';
