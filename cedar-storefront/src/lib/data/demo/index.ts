/**
 * Demo Data Loader
 * 
 * Provides functions to load and filter demo data from JSON files.
 * Simulates the same interface as the actual Supabase data functions.
 */

import { Product, ProductCategory, Cart, CartItem, Order } from "@/lib/types/domain"
import demoProducts from "./demo-products.json"
import demoCategories from "./demo-categories.json"
import demoBanners from "./demo-banners.json"
import demoCartData from "./demo-cart.json"
import demoOrders from "./demo-orders.json"

// Type the imported JSON
const products = demoProducts as Product[]
const categories = demoCategories as ProductCategory[]
const banners = demoBanners as any[]
const defaultCart = demoCartData as Cart
const orders = demoOrders as Order[]

// In-memory cart state (can be persisted to localStorage in client)
let currentCart: Cart = { ...defaultCart }

/**
 * Get all demo products with optional filtering
 */
export function getDemoProducts(params?: {
    limit?: number
    offset?: number
    category_id?: string[]
    q?: string
}): { products: Product[]; count: number; offset: number; limit: number } {
    const limit = params?.limit || 20
    const offset = params?.offset || 0

    let filteredProducts = [...products]

    // Filter by search query
    if (params?.q) {
        const searchQuery = params.q.toLowerCase()
        filteredProducts = filteredProducts.filter(
            (p) =>
                p.title.toLowerCase().includes(searchQuery) ||
                p.description?.toLowerCase().includes(searchQuery)
        )
    }

    // Filter by category
    if (params?.category_id && params.category_id.length > 0) {
        filteredProducts = filteredProducts.filter((p) =>
            params.category_id!.includes(p.category_id || "")
        )
    }

    const count = filteredProducts.length
    const paginatedProducts = filteredProducts.slice(offset, offset + limit)

    return {
        products: paginatedProducts,
        count,
        offset,
        limit,
    }
}

/**
 * Get a single demo product by handle
 */
export function getDemoProductByHandle(handle: string): Product | null {
    return products.find((p) => p.handle === handle) || null
}

/**
 * Get a single demo product by ID
 */
export function getDemoProductById(id: string): Product | null {
    return products.find((p) => p.id === id) || null
}

/**
 * Get all demo categories with optional filtering
 */
export function getDemoCategories(params?: {
    parent_category_id?: string | null
    include_descendants_tree?: boolean
}): ProductCategory[] {
    let filteredCategories = [...categories]

    if (params?.parent_category_id !== undefined) {
        if (params.parent_category_id === null) {
            // Get root categories only
            filteredCategories = filteredCategories.filter(
                (c) => c.parent_category_id === null || c.parent_category_id === undefined
            )
        } else {
            // Get children of specific parent
            filteredCategories = filteredCategories.filter(
                (c) => c.parent_category_id === params.parent_category_id
            )
        }
    }

    // Build tree structure if needed
    if (params?.include_descendants_tree) {
        const rootCategories = filteredCategories.filter(
            (c) => c.parent_category_id === null || c.parent_category_id === undefined
        )
        return rootCategories.map((root) => ({
            ...root,
            category_children: categories.filter((c) => c.parent_category_id === root.id),
        }))
    }

    return filteredCategories
}

/**
 * Get a single demo category by ID or handle
 */
export function getDemoCategory(idOrHandle: string): ProductCategory | null {
    return (
        categories.find((c) => c.id === idOrHandle || c.handle === idOrHandle) ||
        null
    )
}

/**
 * Get products by category handle
 */
export function getDemoProductsByCategory(categoryHandle: string): Product[] {
    const category = categories.find((c) => c.handle === categoryHandle)
    if (!category) return []

    return products.filter((p) => p.category_id === category.id)
}

/**
 * Get all demo banners
 */
export function getDemoBanners(activeOnly: boolean = true): any[] {
    if (activeOnly) {
        return banners.filter((b) => b.is_active).sort((a, b) => a.display_order - b.display_order)
    }
    return banners
}

/**
 * Get featured/trending products
 */
export function getFeaturedProducts(limit: number = 5): Product[] {
    // Return newest products as "featured"
    return [...products]
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, limit)
}

/**
 * Get products by application type
 */
export function getProductsByApplication(application: string): Product[] {
    const appLower = application.toLowerCase()
    return products.filter((p) =>
        p.metadata?.application?.toLowerCase().includes(appLower)
    )
}

/**
 * Search products with full-text search simulation
 */
export function searchDemoProducts(query: string): Product[] {
    const searchTerms = query.toLowerCase().split(" ")

    return products.filter((p) => {
        const searchText = `${p.title} ${p.description} ${p.metadata?.category || ""} ${p.metadata?.application || ""}`.toLowerCase()
        return searchTerms.some((term) => searchText.includes(term))
    })
}

// ==========================================
// CART FUNCTIONS
// ==========================================

/**
 * Get the current demo cart
 */
export function getDemoCart(): Cart {
    // Try to load from localStorage if available (client-side)
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('demo-cart')
        if (saved) {
            try {
                currentCart = JSON.parse(saved)
            } catch {
                // Use default cart
            }
        }
    }
    return currentCart
}

/**
 * Save cart to localStorage
 */
function saveCart(): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('demo-cart', JSON.stringify(currentCart))
    }
}

/**
 * Add item to demo cart
 */
export function addToCart(productId: string, variantId: string, quantity: number = 1): Cart {
    const product = getDemoProductById(productId)
    if (!product) return currentCart

    const variant = product.variants?.find((v) => v.id === variantId)
    const existingItem = currentCart.items.find(
        (item) => item.product_id === productId && item.variant_id === variantId
    )

    if (existingItem) {
        existingItem.quantity += quantity
        existingItem.subtotal = (existingItem.subtotal || 0) + existingItem.unit_price * quantity
    } else {
        const newItem: CartItem = {
            id: `cart-item-${Date.now()}`,
            product_id: productId,
            variant_id: variantId,
            quantity,
            title: product.title,
            thumbnail: product.thumbnail,
            unit_price: variant?.price || product.price?.amount || 0,
            subtotal: (variant?.price || product.price?.amount || 0) * quantity,
            product,
        }
        currentCart.items.push(newItem)
    }

    recalculateCart()
    saveCart()
    return currentCart
}

/**
 * Remove item from demo cart
 */
export function removeFromCart(itemId: string): Cart {
    currentCart.items = currentCart.items.filter((item) => item.id !== itemId)
    recalculateCart()
    saveCart()
    return currentCart
}

/**
 * Update item quantity
 */
export function updateCartItemQuantity(itemId: string, quantity: number): Cart {
    const item = currentCart.items.find((i) => i.id === itemId)
    if (item) {
        item.quantity = quantity
        item.subtotal = item.unit_price * quantity
    }
    recalculateCart()
    saveCart()
    return currentCart
}

/**
 * Clear the demo cart
 */
export function clearDemoCart(): Cart {
    currentCart = {
        id: `demo-cart-${Date.now()}`,
        items: [],
        subtotal: 0,
        discount_total: 0,
        shipping_total: 0,
        tax_total: 0,
        total: 0,
        currency_code: 'INR',
    }
    saveCart()
    return currentCart
}

/**
 * Recalculate cart totals
 */
function recalculateCart(): void {
    currentCart.subtotal = currentCart.items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    currentCart.tax_total = Math.round(currentCart.subtotal * 0.18) // 18% GST
    currentCart.total = currentCart.subtotal + currentCart.tax_total + currentCart.shipping_total - currentCart.discount_total
}

// ==========================================
// ORDER FUNCTIONS
// ==========================================

/**
 * Get all demo orders
 */
export function getDemoOrders(): Order[] {
    return orders
}

/**
 * Get a single demo order by ID
 */
export function getDemoOrderById(orderId: string): Order | null {
    return orders.find((o) => o.id === orderId) || null
}

/**
 * Get orders by status
 */
export function getDemoOrdersByStatus(status: string): Order[] {
    return orders.filter((o) => o.status === status)
}
