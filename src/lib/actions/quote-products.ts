'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { currentUser } from '@clerk/nextjs/server';

export interface ProductOption {
    value: string;
    label: string;
    sku: string;
    price?: number;
}

/**
 * Check if user can see prices (only verified business users)
 */
async function canUserSeePrices(): Promise<boolean> {
    try {
        const user = await currentUser();
        if (!user) return false;

        // Only verified business users or admins can see prices
        const isAdmin = user.publicMetadata?.role === 'admin';
        const isVerifiedBusiness =
            user.publicMetadata?.account_type === 'business' &&
            user.publicMetadata?.verification_status === 'verified';

        return isAdmin || isVerifiedBusiness;
    } catch {
        return false;
    }
}

/**
 * Fetch products for quote form dropdown
 * Returns simplified product list optimized for selection
 * Prices are only included for verified business users
 */
export async function getProductsForQuote(searchQuery?: string): Promise<{
    success: boolean;
    products?: ProductOption[];
    error?: string;
}> {
    try {
        const supabase = await createServerSupabase();
        const showPrices = await canUserSeePrices();

        let query = supabase
            .from('products')
            .select('id, name, sku, price')
            .eq('status', 'active')
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

        // Transform to dropdown format - only include prices for verified users
        const products: ProductOption[] = (data || []).map(product => ({
            value: product.id,
            label: `${product.name} ${product.sku ? `(${product.sku})` : ''}`,
            sku: product.sku || '',
            price: showPrices ? product.price : undefined
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
 * Prices are only included for verified business users
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
        const showPrices = await canUserSeePrices();

        const { data, error } = await supabase
            .from('products')
            .select('id, name, sku, price')
            .eq('status', 'active')
            .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
            .order('name')
            .limit(20);

        if (error) {
            console.error('Error searching products for quote:', error);
            return { success: false, error: error.message };
        }

        // Only include prices for verified business users
        const products: ProductOption[] = (data || []).map(product => ({
            value: product.id,
            label: `${product.name} ${product.sku ? `(${product.sku})` : ''}`,
            sku: product.sku || '',
            price: showPrices ? product.price : undefined
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

export interface VariantOption {
    value: string;
    label: string;
    sku: string | null;
    price?: number;
}

/**
 * Get variants for a specific product
 * Used to populate variant dropdown in quote form after product selection
 */
export async function getProductVariants(productId: string): Promise<{
    success: boolean;
    variants?: VariantOption[];
    error?: string;
}> {
    try {
        if (!productId) {
            return { success: true, variants: [] };
        }

        const supabase = await createServerSupabase();
        const showPrices = await canUserSeePrices();

        const { data, error } = await supabase
            .from('product_variants')
            .select('id, name, sku, price')
            .eq('product_id', productId)
            .order('name');

        if (error) {
            console.error('Error fetching product variants:', error);
            return { success: false, error: error.message };
        }

        // Transform to dropdown format
        const variants: VariantOption[] = (data || []).map(variant => ({
            value: variant.id,
            label: variant.name || `Variant ${variant.sku || variant.id.slice(0, 8)}`,
            sku: variant.sku,
            price: showPrices ? variant.price : undefined
        }));

        return {
            success: true,
            variants
        };
    } catch (error: any) {
        console.error('Error fetching product variants:', error);
        return { success: false, error: error.message };
    }
}
