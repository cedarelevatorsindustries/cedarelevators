'use server'

import { createClerkSupabaseClient } from "@/lib/supabase/server"
import { Cart, CartItem } from "@/lib/types/domain"
import { randomUUID } from "crypto"
import { cookies } from "next/headers"
import { logger } from "@/lib/services/logger"

// Helper to get or create cart ID
async function getCartId(): Promise<string> {
  const cookieStore = await cookies()
  let cartId = cookieStore.get("cart_id")?.value

  if (!cartId) {
    cartId = randomUUID()
    cookieStore.set("cart_id", cartId)
  }
  return cartId
}

export async function createCart(regionId?: string): Promise<Cart> {
  const supabase = await createClerkSupabaseClient()
  const cartId = await getCartId()

  const { data, error } = await supabase
    .from('carts')
    .insert({ id: cartId, region_id: regionId, currency_code: 'usd' }) // Default currency
    .select()
    .single()

  if (error) {
    // If already exists, just return it
    if (error.code === '23505') { // Unique violation
      return getCart() as Promise<Cart>
    }
    logger.error("Error creating cart", error)
    throw new Error("Failed to create cart")
  }

  return { ...data, items: [], total: 0 } as Cart
}

export async function getCart(cartId?: string): Promise<Cart | null> {
  const supabase = await createClerkSupabaseClient()
  const id = cartId || (await cookies()).get("cart_id")?.value

  if (!id) return null

  const { data: cart, error } = await supabase
    .from('carts')
    .select('*, items:cart_items(*)')
    .eq('id', id)
    .single()

  if (error || !cart) return null

  // Calculate totals
  const items = (cart.items || []) as CartItem[]
  const total = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)

  return {
    ...cart,
    items,
    total,
    subtotal: total
  } as Cart
}

export async function addToCart(variantId: string, quantity: number) {
  const supabase = await createClerkSupabaseClient()
  let cartId = (await cookies()).get("cart_id")?.value

  if (!cartId) {
    const newCart = await createCart()
    cartId = newCart.id
  }

  // Fetch product details
  // First try product_variants, then fall back to products table
  let productTitle = "Product"
  let unitPrice = 0
  let thumbnail = ""
  let productId = variantId

  // Try fetching from product_variants table
  const { data: variant, error: varError } = await supabase
    .from('product_variants')
    .select('*, product:products(id, name, thumbnail)')
    .eq('id', variantId)
    .single()

  if (variant && !varError) {
    // Variant found
    productTitle = variant.name || variant.product?.name || "Product"
    unitPrice = variant.price || 0
    thumbnail = variant.product?.thumbnail || variant.image_url || ""
    productId = variant.product_id || variant.product?.id

    // Check inventory
    if (variant.inventory_quantity < quantity) {
      throw new Error(`Insufficient stock. Available: ${variant.inventory_quantity}`)
    }
  } else {
    // Fallback to products table (simple schema without variants)
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('id, name, thumbnail, price, stock_quantity')
      .eq('id', variantId)
      .single()

    if (prodError || !product) {
      throw new Error(`Product not found: ${variantId}`)
    }

    // Check inventory
    if (product.stock_quantity < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock_quantity}`)
    }

    productTitle = product.name
    unitPrice = product.price || 0
    thumbnail = product.thumbnail || ""
    productId = product.id
  }

  // 2. Insert or Update Cart Item
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId)
    .eq('variant_id', variantId)
    .single()

  if (existingItem) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cartId,
        variant_id: variantId,
        product_id: productId,
        title: productTitle,
        thumbnail: thumbnail,
        quantity: quantity,
        unit_price: unitPrice
      })

    if (error) throw error
  }

  return getCart(cartId)
}

export async function updateLineItem(lineId: string, quantity: number) {
  const supabase = await createClerkSupabaseClient()

  if (quantity <= 0) {
    return removeLineItem(lineId)
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', lineId)

  if (error) throw error
  return getCart()
}

export async function removeLineItem(lineId: string) {
  const supabase = await createClerkSupabaseClient()

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', lineId)

  if (error) throw error
  return getCart()
}

/**
 * Clear all items from cart
 */
export async function clearCart(cartId?: string) {
  const supabase = await createClerkSupabaseClient()
  const id = cartId || (await cookies()).get("cart_id")?.value

  if (!id) return null

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', id)

  if (error) throw error
  return getCart(id)
}


