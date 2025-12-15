
export interface ProductImage {
    id: string
    url: string
}

export interface ProductVariant {
    id: string
    title: string
    sku: string
    price: number
    inventory_quantity: number
    options: Record<string, string>
    calculated_price?: {
        calculated_amount: number
        currency_code?: string
    }
}

export interface Product {
    id: string
    title: string
    handle: string
    description: string
    thumbnail: string
    images?: ProductImage[]
    variants?: ProductVariant[]
    collection_id?: string
    category_id?: string
    categories?: ProductCategory[]
    metadata?: Record<string, any>
    // Price from the first variant or a calculated range
    price?: {
        amount: number
        currency_code: string
    }
    created_at?: string
}

export interface ProductCategory {
    id: string
    name: string
    handle: string
    parent_category_id?: string | null
    description?: string
    category_children?: ProductCategory[]
    products?: Product[]
    metadata?: Record<string, any>
}

export interface Order {
    id: string
    order_number: string
    display_id: number // Alias for order_number usually
    created_at: string
    status: string
    total: number
    currency_code: string
    items: any[]
    customer_id?: string
    email?: string
}

export interface CartItem {
    id: string
    product_id: string
    variant_id: string
    quantity: number
    title: string
    thumbnail: string
    unit_price: number
    subtotal?: number
    product?: Product
}

export interface Cart {
    id: string
    items: CartItem[]
    subtotal: number
    discount_total: number
    shipping_total: number
    tax_total: number
    total: number
    currency_code: string
}
