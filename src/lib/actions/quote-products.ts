'use server';

import { createServerSupabase } from '@/lib/supabase/server';

export interface ProductOption {
    value: string;
    label: string;
    sku: string;
    price?: number;
}

/**
 * Fetch products for quote form dropdown
 * Returns simplified product list optimized for selection
 */
export async function getProductsForQuote(searchQuery?: string): Promise<{
    success: boolean;
    products?: ProductOption[];
    error?: string;
}> {
    try {
        const supabase = await createServerSupabase();

        let query = supabase
            .from('products')
            .select('id, name, sku, price')
            .eq('status', 'active')
            .eq('is_categorized', true)
            .order('name');

        // If search query provided, filter by name or SKU
        if (searchQuery && searchQuery.trim()) {
            query = query.or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`);
        }

        // Limit to 50 products for dropdown performance
        query = query.limit(50);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching products for quote:', error);
            return { success: false, error: error.message };
        }

        // Transform to dropdown format
        const products: ProductOption[] = (data || []).map(product => ({
            value: product.id,
            label: `${product.name} ${product.sku ? `(${product.sku})` : ''}`,
            sku: product.sku || '',
            price: product.price
        }));

        return {
            success: true,
            products
        };
    } catch (error: any) {
        console.error('Error fetching products for quote:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Search products with autocomplete for quote form
 * Optimized for fast typeahead search
 */
export async function searchProductsForQuote(query: string): Promise<{
    success: boolean;
    products?: ProductOption[];
    error?: string;
}> {
    try {
        if (!query || query.length < 2) {
            return { success: true, products: [] };
        }

        const supabase = await createServerSupabase();

        const { data, error } = await supabase
            .from('products')
            .select('id, name, sku, price')
            .eq('status', 'active')
            .eq('is_categorized', true)
            .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
            .order('name')
            .limit(20);

        if (error) {
            console.error('Error searching products for quote:', error);
            return { success: false, error: error.message };
        }

        const products: ProductOption[] = (data || []).map(product => ({
            value: product.id,
            label: `${product.name} ${product.sku ? `(${product.sku})` : ''}`,
            sku: product.sku || '',
            price: product.price
        }));

        return {
            success: true,
            products
        };
    } catch (error: any) {
        console.error('Error searching products for quote:', error);
        return { success: false, error: error.message };
    }
}
