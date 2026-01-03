/**
 * Cart Type Definitions
 * Cedar Elevator Industries
 * 
 * Core types for the cart system supporting:
 * - Profile-scoped carts (individual/business)
 * - Guest cart (localStorage)
 * - Pricing derivation (never trust stored prices)
 * - Cart persistence across user type changes
 */

// =====================================================
// Core Enums
// =====================================================

export type ProfileType = 'individual' | 'business'

export type CartStatus = 'active' | 'converted' | 'abandoned'

export type UserType = 'guest' | 'individual' | 'business_unverified' | 'business_verified'

// =====================================================
// Cart Ownership & Context
// =====================================================

export interface CartOwnership {
  userId: string // Clerk user ID
  profileType: ProfileType
  businessId?: string // For business profile carts
}

export interface CartContext extends CartOwnership {
  userType: UserType // For pricing visibility rules
  isVerified?: boolean // For business users
}

// =====================================================
// Database Cart (Supabase)
// =====================================================

export interface Cart {
  id: string
  clerk_user_id: string | null // Null for guest carts
  guest_id?: string | null
  profile_type: ProfileType
  business_id?: string | null
  status: CartStatus
  region_id?: string | null
  currency_code: string
  completed_at?: string | null
  abandoned_at?: string | null
  created_at: string
  updated_at: string
  items?: CartItem[] // Populated via JOIN
}

// =====================================================
// Cart Items (No Price Stored)
// =====================================================

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  variant_id?: string | null
  title: string
  thumbnail?: string | null
  quantity: number
  created_at: string
  updated_at: string
  // NOTE: NO unit_price here - always derived
}

// =====================================================
// Derived Cart Item (With Calculated Price)
// =====================================================

export interface DerivedCartItem extends CartItem {
  // Derived fields (calculated at render time)
  unit_price: number // Current price from products table
  compare_at_price?: number // MRP
  discount_percentage?: number
  line_total: number // unit_price * quantity
  stock_available: boolean
  is_available: boolean // Product still exists and active
  
  // Product metadata (for display)
  product?: {
    name: string
    slug: string
    sku?: string
    status: string
  }
  
  variant?: {
    name: string
    sku: string
    status: string
  }
}

// =====================================================
// Cart Summary (With Pricing)
// =====================================================

export interface CartSummary {
  itemCount: number
  uniqueProducts: number
  subtotal: number // Sum of all line_totals
  discount: number // Total discount amount (future: from coupons)
  shipping: number // Calculated shipping cost
  tax: number // GST calculation
  total: number // Final amount
  
  // Metadata
  hasUnavailableItems: boolean
  hasOutOfStockItems: boolean
  canCheckout: boolean // Based on user type and cart state
}

// =====================================================
// Guest Cart (localStorage format)
// =====================================================

export interface GuestCartItem {
  product_id: string
  variant_id?: string
  title: string
  thumbnail?: string
  quantity: number
  added_at: string // ISO timestamp
}

export interface GuestCart {
  id: string // Random UUID
  items: GuestCartItem[]
  created_at: string
  updated_at: string
}

export const GUEST_CART_KEY = 'cedar_guest_cart'
export const GUEST_CART_MAX_ITEMS = 50 // Prevent localStorage bloat

// =====================================================
// Cart Merge Result
// =====================================================

export interface CartMergeResult {
  success: boolean
  cartId: string
  itemsAdded: number
  itemsUpdated: number
  errors?: string[]
}

// =====================================================
// Pricing Context (For Derivation)
// =====================================================

export interface PricingContext {
  userType: UserType
  businessId?: string
  isVerified?: boolean
}

// =====================================================
// Cart Validation
// =====================================================

export interface CartValidationResult {
  valid: boolean
  errors: CartValidationError[]
}

export interface CartValidationError {
  itemId?: string
  productId?: string
  code: CartValidationErrorCode
  message: string
}

export type CartValidationErrorCode =
  | 'OUT_OF_STOCK'
  | 'PRODUCT_UNAVAILABLE'
  | 'VARIANT_UNAVAILABLE'
  | 'INVALID_QUANTITY'
  | 'PRICE_CHANGED'
  | 'CART_EMPTY'
  | 'CART_TOO_LARGE'

// =====================================================
// Cart Actions Payload Types
// =====================================================

export interface AddToCartPayload {
  productId: string
  variantId?: string
  quantity: number
}

export interface UpdateCartItemPayload {
  cartItemId: string
  quantity: number
}

export interface RemoveFromCartPayload {
  cartItemId: string
}

// =====================================================
// Cart State (Frontend)
// =====================================================

export interface CartState {
  cart: Cart | null
  derivedItems: DerivedCartItem[]
  summary: CartSummary
  isLoading: boolean
  error: string | null
  context: CartContext | null
}

// =====================================================
// Profile Switch Confirmation
// =====================================================

export interface ProfileSwitchConfirmation {
  currentProfile: ProfileType
  newProfile: ProfileType
  currentCartItemCount: number
  message: string
  requiresConfirmation: boolean
}

// =====================================================
// Type Guards
// =====================================================

export function isGuestUser(userType: UserType): boolean {
  return userType === 'guest'
}

export function canSeePrice(userType: UserType): boolean {
  // Only individual and business_verified can see prices
  return userType === 'individual' || userType === 'business_verified'
}

export function canCheckout(userType: UserType): boolean {
  // Only verified business can checkout
  return userType === 'business_verified'
}

export function canRequestQuote(userType: UserType): boolean {
  // All authenticated users can request quotes
  return userType !== 'guest'
}

// =====================================================
// Helper Types
// =====================================================

export interface CartActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
