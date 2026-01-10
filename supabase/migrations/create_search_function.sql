-- PostgreSQL Full-Text Search Function with Product Tags
-- This function searches products across name, description, SKU, and tags
-- Returns ranked results based on relevance

CREATE OR REPLACE FUNCTION search_products_with_tags(
    search_query TEXT,
    result_limit INTEGER DEFAULT 10,
    result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    thumbnail_url TEXT,
    price NUMERIC,
    sku TEXT,
    short_description TEXT,
    category_name TEXT,
    tags TEXT[],
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.slug,
        p.thumbnail_url,
        p.price,
        p.sku,
        p.short_description,
        c.title as category_name,
        COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), ARRAY[]::TEXT[]) as tags,
        ts_rank(
            to_tsvector('english', 
                COALESCE(p.name, '') || ' ' ||
                COALESCE(p.description, '') || ' ' ||
                COALESCE(p.short_description, '') || ' ' ||
                COALESCE(p.sku, '') || ' ' ||
                COALESCE(string_agg(DISTINCT t.name, ' '), '')
            ),
            to_tsquery('english', search_query)
        )::REAL as rank
    FROM products p
    LEFT JOIN product_categories pc ON p.id = pc.product_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN product_tags pt ON p.id = pt.product_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE 
        p.status = 'active'
        AND to_tsvector('english', 
            COALESCE(p.name, '') || ' ' ||
            COALESCE(p.description, '') || ' ' ||
            COALESCE(p.short_description, '') || ' ' ||
            COALESCE(p.sku, '') || ' ' ||
            COALESCE(string_agg(DISTINCT t.name, ' '), '')
        ) @@ to_tsquery('english', search_query)
    GROUP BY p.id, p.name, p.slug, p.thumbnail_url, p.price, p.sku, p.short_description, c.title
    ORDER BY rank DESC, p.name ASC
    LIMIT result_limit
    OFFSET result_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_search_vector 
ON products USING GIN (to_tsvector('english', 
    COALESCE(name, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(short_description, '') || ' ' ||
    COALESCE(sku, '')
));

-- Create index on tags for better join performance
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag_id ON product_tags(tag_id);
