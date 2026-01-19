-- Migration: Create Why Choose Cedar CMS Tables
-- Created: 2026-01-19
-- Description: Creates tables for managing "Why Choose Cedar" page content through CMS

-- ============================================================================
-- 1. Hero Section Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.why_choose_hero (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Why Choose Cedar',
    description TEXT NOT NULL DEFAULT 'Reliable components for safer elevators, delivered with transparency.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default hero data
INSERT INTO public.why_choose_hero (title, description)
VALUES (
    'Why Choose Cedar',
    'Reliable components for safer elevators, delivered with transparency.'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. Excellence Items Table (Why Cedar Items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.why_choose_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_title TEXT,
    icon TEXT NOT NULL DEFAULT 'Star',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_why_choose_items_sort ON public.why_choose_items(sort_order, status);

-- Insert default excellence items
INSERT INTO public.why_choose_items (icon, title, description, sort_order, status)
VALUES
    (
        'ShieldCheck',
        'Quality Assurance',
        'Every component undergoes rigorous ISO-certified manufacturing and multi-stage quality checks to ensure maximum safety in vertical transportation.',
        1,
        'active'
    ),
    (
        'Globe',
        'Global Reach',
        'With strategic hubs worldwide, we reliably ship critical elevator components to over 50 countries, supporting global maintenance teams 24/7.',
        2,
        'active'
    ),
    (
        'Wrench',
        'Technical Support',
        'Our team of expert engineers provides round-the-clock technical assistance for installation, troubleshooting, and component optimization.',
        3,
        'active'
    ),
    (
        'Truck',
        'Rapid Logistics',
        'Minimize downtime with our expedited supply chain. We offer 48-hour dispatch on all in-stock elevator components across all continents.',
        4,
        'active'
    )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. Stats Section Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.why_choose_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    sort_order INTEGER NOT NULL CHECK (sort_order >= 1 AND sort_order <= 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(sort_order)
);

-- Insert default stats
INSERT INTO public.why_choose_stats (number, title, subtitle, sort_order)
VALUES
    ('15+', 'Years of Excellence', 'Proven track record in engineering', 1),
    ('500k+', 'Parts Installed', 'Active components in global buildings', 2),
    ('99.9%', 'Safety Rating', 'Uncompromising commitment to life safety', 3)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. CTA Section Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.why_choose_cta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Ready to upgrade your infrastructure?',
    description TEXT NOT NULL DEFAULT 'Join hundreds of facility managers and OEMs who trust Cedar for precision-engineered components. Get a custom quote tailored to your project requirements today.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default CTA data
INSERT INTO public.why_choose_cta (title, description)
VALUES (
    'Ready to upgrade your infrastructure?',
    'Join hundreds of facility managers and OEMs who trust Cedar for precision-engineered components. Get a custom quote tailored to your project requirements today.'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.why_choose_hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.why_choose_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.why_choose_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.why_choose_cta ENABLE ROW LEVEL SECURITY;

-- Hero table policies
CREATE POLICY "Hero is viewable by everyone"
    ON public.why_choose_hero FOR SELECT
    USING (true);

CREATE POLICY "Hero is editable by authenticated users"
    ON public.why_choose_hero FOR ALL
    USING (auth.role() = 'authenticated');

-- Items table policies
CREATE POLICY "Items are viewable by everyone"
    ON public.why_choose_items FOR SELECT
    USING (true);

CREATE POLICY "Items are editable by authenticated users"
    ON public.why_choose_items FOR ALL
    USING (auth.role() = 'authenticated');

-- Stats table policies
CREATE POLICY "Stats are viewable by everyone"
    ON public.why_choose_stats FOR SELECT
    USING (true);

CREATE POLICY "Stats are editable by authenticated users"
    ON public.why_choose_stats FOR ALL
    USING (auth.role() = 'authenticated');

-- CTA table policies
CREATE POLICY "CTA is viewable by everyone"
    ON public.why_choose_cta FOR SELECT
    USING (true);

CREATE POLICY "CTA is editable by authenticated users"
    ON public.why_choose_cta FOR ALL
    USING (auth.role() = 'authenticated');

-- ============================================================================
-- Triggers for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_why_choose_hero_updated_at
    BEFORE UPDATE ON public.why_choose_hero
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_why_choose_items_updated_at
    BEFORE UPDATE ON public.why_choose_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_why_choose_stats_updated_at
    BEFORE UPDATE ON public.why_choose_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_why_choose_cta_updated_at
    BEFORE UPDATE ON public.why_choose_cta
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
