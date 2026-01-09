import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabase()
        const searchParams = request.nextUrl.searchParams

        // Get filter context from query params
        const applicationsFilter = searchParams.get('applications')?.split(',').filter(Boolean)
        const categoriesFilter = searchParams.get('categories')?.split(',').filter(Boolean)
        const elevatorTypesFilter = searchParams.get('elevator_types')?.split(',').filter(Boolean)

        // Fetch Catalog Options
        const catalogOptions = await fetchCatalogOptions(supabase, {
            applications: applicationsFilter,
            categories: categoriesFilter,
            elevatorTypes: elevatorTypesFilter
        })

        // Fetch PLP Options (based on catalog context)
        const plpOptions = await fetchPLPOptions(supabase, {
            applications: applicationsFilter,
            categories: categoriesFilter,
            elevatorTypes: elevatorTypesFilter
        })

        return NextResponse.json({
            success: true,
            catalogOptions,
            plpOptions
        })
    } catch (error) {
        console.error('Error fetching filter options:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch filter options' },
            { status: 500 }
        )
    }
}

async function fetchCatalogOptions(supabase: any, context: any) {
    // Fetch Applications (separate applications table)
    const { data: applications } = await supabase
        .from('applications')
        .select('id, title')
        .eq('status', 'active')
        .order('title')

    // Fetch Elevator Types (uses status column, not is_active)
    const { data: elevatorTypes } = await supabase
        .from('elevator_types')
        .select('id, title')
        .eq('status', 'active')
        .order('title')

    // Fetch Categories (uses is_active and title)
    let categoriesQuery = supabase
        .from('categories')
        .select('id, title')
        .eq('is_active', true)
        .order('title')

    const { data: categories } = await categoriesQuery

    // Fetch Subcategories (if category is selected)
    let subcategories = []
    if (context.categories?.length) {
        const { data: subs } = await supabase
            .from('categories')
            .select('id, title')
            .eq('is_active', true)
            .in('parent_id', context.categories)
            .order('title')

        subcategories = subs || []
    }

    // Map title to name for consistency with frontend types
    return {
        applications: (applications || []).map((app: any) => ({ id: app.id, name: app.title })),
        elevatorTypes: (elevatorTypes || []).map((type: any) => ({ id: type.id, name: type.title })),
        categories: (categories || []).map((cat: any) => ({ id: cat.id, name: cat.title })),
        subcategories: subcategories.map((sub: any) => ({ id: sub.id, name: sub.title }))
    }
}

async function fetchPLPOptions(supabase: any, context: any) {
    // Build base query for products based on catalog filters
    let productsQuery = supabase
        .from('products')
        .select('id')
        .eq('status', 'active')

    // Apply catalog filters if present
    if (context.applications?.length) {
        const { data: productIds } = await supabase
            .from('product_applications')
            .select('product_id')
            .in('application_id', context.applications)

        if (productIds) {
            productsQuery = productsQuery.in('id', productIds.map((p: any) => p.product_id))
        }
    }

    if (context.categories?.length) {
        productsQuery = productsQuery.in('category_id', context.categories)
    }

    const { data: filteredProducts } = await productsQuery

    if (!filteredProducts || filteredProducts.length === 0) {
        return {
            priceRange: { min: 0, max: 50000 },
            variantOptions: {},
            ratings: [3, 4, 5]
        }
    }

    const productIds = filteredProducts.map((p: any) => p.id)

    // Get price range from variants
    const { data: priceData } = await supabase
        .from('product_variants')
        .select('price')
        .in('product_id', productIds)
        .eq('status', 'active')
        .order('price', { ascending: true })

    const prices = priceData?.map((v: any) => v.price) || []
    const priceRange = {
        min: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
        max: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 50000
    }

    // Get variant options from JSONB
    const { data: variantData } = await supabase
        .from('product_variants')
        .select('options')
        .in('product_id', productIds)
        .eq('status', 'active')

    // Extract unique option keys and values
    const variantOptions: Record<string, Set<string>> = {}

    variantData?.forEach((variant: any) => {
        if (variant.options && typeof variant.options === 'object') {
            Object.entries(variant.options).forEach(([key, value]) => {
                if (!variantOptions[key]) {
                    variantOptions[key] = new Set()
                }
                variantOptions[key].add(value as string)
            })
        }
    })

    // Convert Sets to Arrays
    const variantOptionsArray: Record<string, string[]> = {}
    Object.entries(variantOptions).forEach(([key, values]) => {
        variantOptionsArray[key] = Array.from(values).sort()
    })

    return {
        priceRange,
        variantOptions: variantOptionsArray,
        ratings: [3, 4, 5]
    }
}
