# Cart System API Documentation
Cedar Elevator Industries

## Table of Contents

1. [Server Actions](#server-actions)
2. [React Query Hooks](#react-query-hooks)
3. [Client-Side Services](#client-side-services)
4. [Type Definitions](#type-definitions)
5. [Database Functions](#database-functions)

---

## Server Actions

### Cart Management (`/lib/actions/cart-v2.ts`)

#### `getOrCreateCart(profileType?, businessId?)`

Get user's active cart or create new one.

**Parameters:**
- `profileType` (optional): `'individual' | 'business'`
- `businessId` (optional): `string`

**Returns:** `Promise<CartActionResponse<Cart>>`

**Example:**
```typescript
const result = await getOrCreateCart('business', 'biz-123')
if (result.success) {
  console.log('Cart ID:', result.data.id)
}
```

---

#### `getUserActiveCart(profileType?, businessId?)`

Fetch user's active cart for current profile.

**Parameters:**
- `profileType` (optional): `'individual' | 'business'`
- `businessId` (optional): `string`

**Returns:** `Promise<CartActionResponse<Cart>>`

**Example:**
```typescript
const result = await getUserActiveCart()
if (result.success && result.data) {
  console.log('Cart items:', result.data.items)
}
```

---

#### `addItemToCart(payload)`

Add product to cart (or update quantity if exists).

**Parameters:**
```typescript
interface AddToCartPayload {
  productId: string
  variantId?: string
  quantity: number
}
```

**Returns:** `Promise<CartActionResponse<CartItem>>`

**Example:**
```typescript
const result = await addItemToCart({
  productId: 'prod-123',
  quantity: 2
})

if (result.success) {
  toast.success(result.message) // "Item added to cart"
}
```

**Validation:**
- ✓ Product exists and is active
- ✓ Stock availability
- ✓ User is authenticated
- ✓ Cart ownership

---

#### `updateCartItemQuantity(payload)`

Update quantity of existing cart item.

**Parameters:**
```typescript
interface UpdateCartItemPayload {
  cartItemId: string
  quantity: number  // Must be >= 1
}
```

**Returns:** `Promise<CartActionResponse<CartItem>>`

**Example:**
```typescript
const result = await updateCartItemQuantity({
  cartItemId: 'item-456',
  quantity: 5
})
```

---

#### `removeCartItem(cartItemId)`

Remove item from cart.

**Parameters:**
- `cartItemId`: `string`

**Returns:** `Promise<CartActionResponse<void>>`

**Example:**
```typescript
const result = await removeCartItem('item-456')
if (result.success) {
  toast.success('Item removed from cart')
}
```

---

#### `clearCart(cartId?)`

Remove all items from cart.

**Parameters:**
- `cartId` (optional): `string` - Defaults to user's active cart

**Returns:** `Promise<CartActionResponse<void>>`

**Example:**
```typescript
const result = await clearCart()
if (result.success) {
  toast.success('Cart cleared')
}
```

---

#### `switchCartContext(newProfileType, newBusinessId?)`

Switch between individual and business carts.

**Parameters:**
- `newProfileType`: `'individual' | 'business'`
- `newBusinessId` (optional): `string`

**Returns:** `Promise<CartActionResponse<Cart>>`

**Example:**
```typescript
// Switch to business cart
const result = await switchCartContext('business', 'biz-123')

// Switch back to individual
const result = await switchCartContext('individual')
```

**Note:** Previous cart is preserved, not deleted.

---

#### `convertCart(cartId, type)`

Mark cart as converted to order or quote.

**Parameters:**
- `cartId`: `string`
- `type`: `'order' | 'quote'`

**Returns:** `Promise<CartActionResponse<void>>`

**Example:**
```typescript
// After successful order
const result = await convertCart(cartId, 'order')
```

---

#### `getCartItemCount()`

Get total item count in user's active cart.

**Returns:** `Promise<CartActionResponse<number>>`

**Example:**
```typescript
const result = await getCartItemCount()
const count = result.data || 0 // Safe default
```

---

### Cart Locking (`/lib/actions/cart-locking.ts`)

#### `lockCartForCheckout(cartId, durationMinutes?)`

Lock cart during checkout (soft lock).

**Parameters:**
- `cartId`: `string`
- `durationMinutes` (optional): `number` - Default: 5

**Returns:** `Promise<CartActionResponse<CartLockStatus>>`

**Example:**
```typescript
const result = await lockCartForCheckout(cartId, 5)

if (result.success && result.data) {
  console.log('Locked until:', result.data.locked_until)
  console.log('Remaining:', result.data.remaining_seconds, 'seconds')
}
```

---

#### `unlockCart(cartId)`

Manually unlock cart.

**Parameters:**
- `cartId`: `string`

**Returns:** `Promise<CartActionResponse<CartLockStatus>>`

**Example:**
```typescript
const result = await unlockCart(cartId)
if (result.success) {
  toast.success('Cart unlocked')
}
```

---

#### `checkCartLockStatus(cartId)`

Check if cart is currently locked.

**Parameters:**
- `cartId`: `string`

**Returns:** `Promise<CartActionResponse<CartLockStatus>>`

**Example:**
```typescript
const result = await checkCartLockStatus(cartId)

if (result.success && result.data?.is_locked) {
  console.log('Cart is locked')
  console.log('Remaining:', result.data.remaining_seconds, 'seconds')
}
```

**Response:**
```typescript
interface CartLockStatus {
  is_locked: boolean
  locked_at?: string        // ISO timestamp
  locked_until?: string     // ISO timestamp
  locked_by?: string        // Clerk user ID
  lock_reason?: string      // 'checkout' | 'processing'
  remaining_seconds?: number
}
```

---

#### `extendCartLock(cartId, additionalMinutes?)`

Extend lock duration.

**Parameters:**
- `cartId`: `string`
- `additionalMinutes` (optional): `number` - Default: 5

**Returns:** `Promise<CartActionResponse<CartLockStatus>>`

**Example:**
```typescript
// Extend by 5 more minutes
const result = await extendCartLock(cartId, 5)
```

---

### Pricing Service (`/lib/services/cart-pricing.ts`)

#### `deriveItemPrice(productId, variantId?, pricingContext?)`

Get current price for a product/variant.

**Parameters:**
- `productId`: `string`
- `variantId` (optional): `string`
- `pricingContext` (optional): `PricingContext`

**Returns:**
```typescript
Promise<{
  unit_price: number
  compare_at_price?: number
  discount_percentage?: number
}>
```

**Example:**
```typescript
const pricing = await deriveItemPrice('prod-123', 'var-456')
console.log('Price:', pricing.unit_price)
console.log('MRP:', pricing.compare_at_price)
console.log('Discount:', pricing.discount_percentage, '%')
```

---

#### `deriveCartItems(items, pricingContext)`

Derive pricing for all cart items.

**Parameters:**
- `items`: `CartItem[]`
- `pricingContext`: `PricingContext`

**Returns:** `Promise<DerivedCartItem[]>`

**Example:**
```typescript
const derivedItems = await deriveCartItems(cart.items, {
  userType: 'business_verified'
})

deriviedItems.forEach(item => {
  console.log(item.title, '-', item.line_total)
})
```

---

#### `calculateCartSummary(items, pricingContext, deliveryOption?, shippingAddress?)`

Calculate full cart summary with totals.

**Parameters:**
- `items`: `DerivedCartItem[]`
- `pricingContext`: `PricingContext`
- `deliveryOption` (optional): `'standard' | 'express' | 'custom'`
- `shippingAddress` (optional): `{ state: string }`

**Returns:** `Promise<CartSummary>`

**Example:**
```typescript
const summary = await calculateCartSummary(derivedItems, {
  userType: 'business_verified'
}, 'express')

console.log('Subtotal:', summary.subtotal)
console.log('Tax:', summary.tax)
console.log('Shipping:', summary.shipping)
console.log('Total:', summary.total)
console.log('Can checkout:', summary.canCheckout)
```

---

#### `getCartWithPricing(cartId, pricingContext)`

Get full cart with derived pricing and summary.

**Parameters:**
- `cartId`: `string`
- `pricingContext`: `PricingContext`

**Returns:**
```typescript
Promise<{
  items: DerivedCartItem[]
  summary: CartSummary
}>
```

**Example:**
```typescript
const { items, summary } = await getCartWithPricing(cartId, {
  userType: 'individual'
})
```

---

### Cart Merge Service (`/lib/services/cart-merge.ts`)

#### `mergeGuestCartToUser(guestItems, userId, profileType?, businessId?)`

Merge guest cart items into user cart after login.

**Parameters:**
- `guestItems`: `GuestCartItem[]`
- `userId`: `string`
- `profileType` (optional): `ProfileType` - Default: 'individual'
- `businessId` (optional): `string`

**Returns:** `Promise<CartMergeResult>`

**Example:**
```typescript
const guestCart = getGuestCart()
if (guestCart) {
  const result = await mergeGuestCartToUser(
    guestCart.items,
    userId,
    'individual'
  )
  
  console.log('Added:', result.itemsAdded)
  console.log('Updated:', result.itemsUpdated)
  
  if (result.success) {
    clearGuestCart() // Remove from localStorage
    toast.success(`${result.itemsAdded} items added to cart`)
  }
}
```

**Response:**
```typescript
interface CartMergeResult {
  success: boolean
  cartId: string
  itemsAdded: number
  itemsUpdated: number
  errors?: string[]
}
```

---

## React Query Hooks

### `/lib/hooks/use-cart-query.ts`

#### `useCartQuery()`

Fetch active cart with automatic caching.

**Returns:** `UseQueryResult<Cart | null>`

**Example:**
```typescript
function CartPage() {
  const { data: cart, isLoading, error, refetch } = useCartQuery()
  
  if (isLoading) return <Skeleton />
  if (error) return <Error />
  if (!cart) return <EmptyCart />
  
  return <CartItems items={cart.items} />
}
```

**Features:**
- ✓ Auto-refetch on window focus
- ✓ 2-minute cache (staleTime)
- ✓ Retry failed requests
- ✓ Refetch on network reconnect

---

#### `useCartWithPricing(userType)`

Fetch cart with derived pricing.

**Parameters:**
- `userType`: `UserType`

**Returns:**
```typescript
UseQueryResult<{
  items: DerivedCartItem[]
  summary: CartSummary
}>
```

**Example:**
```typescript
const { data, isLoading } = useCartWithPricing('business_verified')

if (data) {
  const { items, summary } = data
  console.log('Total:', summary.total)
}
```

---

#### `useCartItemCount()`

Lightweight cart item count.

**Returns:** `UseQueryResult<number>`

**Example:**
```typescript
function CartBadge() {
  const { data: count = 0 } = useCartItemCount()
  
  return (
    <div className="cart-badge">
      {count > 0 && <span>{count}</span>}
    </div>
  )
}
```

---

#### `useCartLockStatus(cartId)`

Polls lock status every 10 seconds.

**Parameters:**
- `cartId` (optional): `string`

**Returns:** `UseQueryResult<CartLockStatus | null>`

**Example:**
```typescript
const { data: lockStatus } = useCartLockStatus(cart?.id)

if (lockStatus?.is_locked) {
  return <CartLockWarning lockStatus={lockStatus} />
}
```

---

#### `useAddToCart()`

Mutation for adding items with optimistic updates.

**Returns:** `UseMutationResult`

**Example:**
```typescript
function AddToCartButton({ productId }) {
  const addToCart = useAddToCart()
  
  const handleClick = () => {
    addToCart.mutate({
      productId,
      quantity: 1
    })
  }
  
  return (
    <button 
      onClick={handleClick}
      disabled={addToCart.isPending}
    >
      {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}
```

---

#### `useUpdateCartItem()`

Mutation for updating quantity.

**Example:**
```typescript
const updateItem = useUpdateCartItem()

const handleQuantityChange = (itemId: string, newQty: number) => {
  updateItem.mutate({
    cartItemId: itemId,
    quantity: newQty
  })
}
```

---

#### `useRemoveCartItem()`

Mutation for removing items.

**Example:**
```typescript
const removeItem = useRemoveCartItem()

const handleRemove = (itemId: string) => {
  removeItem.mutate(itemId)
}
```

---

#### `useClearCart()`

Mutation for clearing entire cart.

**Example:**
```typescript
const clearCart = useClearCart()

const handleClear = () => {
  if (confirm('Clear cart?')) {
    clearCart.mutate()
  }
}
```

---

#### `useLockCart()`

Mutation for locking cart.

**Example:**
```typescript
const lockCart = useLockCart()

const handleCheckout = async () => {
  const result = await lockCart.mutateAsync({
    cartId: cart.id,
    duration: 5
  })
  
  if (result.is_locked) {
    router.push('/checkout')
  }
}
```

---

#### `useUnlockCart()`

Mutation for unlocking cart.

**Example:**
```typescript
const unlockCart = useUnlockCart()

const handleUnlock = () => {
  unlockCart.mutate(cart.id)
}
```

---

## Client-Side Services

### Guest Cart (`/lib/services/guest-cart.ts`)

#### `getGuestCart()`

Read guest cart from localStorage.

**Returns:** `GuestCart | null`

---

#### `addToGuestCart(productId, title, thumbnail, quantity, variantId?)`

Add item to guest cart.

**Returns:**
```typescript
{
  success: boolean
  error?: string
  itemCount?: number
}
```

---

#### `updateGuestCartItem(productId, quantity, variantId?)`

Update guest cart item quantity.

---

#### `removeFromGuestCart(productId, variantId?)`

Remove item from guest cart.

---

#### `clearGuestCart()`

Clear entire guest cart.

---

#### `getGuestCartCount()`

Get total item count in guest cart.

**Returns:** `number`

---

## Type Definitions

See `/types/cart.types.ts` for full type definitions.

### Key Types:

```typescript
type ProfileType = 'individual' | 'business'

type CartStatus = 'active' | 'converted' | 'abandoned'

type UserType = 'guest' | 'individual' | 'business_unverified' | 'business_verified'

interface Cart {
  id: string
  clerk_user_id: string
  profile_type: ProfileType
  business_id?: string
  status: CartStatus
  locked_at?: string
  locked_until?: string
  items?: CartItem[]
}

interface CartItem {
  id: string
  cart_id: string
  product_id: string
  variant_id?: string
  title: string
  thumbnail?: string
  quantity: number
  // NO PRICE STORED
}

interface DerivedCartItem extends CartItem {
  unit_price: number
  compare_at_price?: number
  discount_percentage?: number
  line_total: number
  stock_available: boolean
  is_available: boolean
}

interface CartSummary {
  itemCount: number
  uniqueProducts: number
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  hasUnavailableItems: boolean
  hasOutOfStockItems: boolean
  canCheckout: boolean
}
```

---

## Database Functions

### `get_or_create_cart(p_clerk_user_id, p_profile_type, p_business_id)`

Get existing active cart or create new one.

**SQL:**
```sql
SELECT get_or_create_cart(
  'user_123',
  'business',
  'biz_456'
);
-- Returns: cart_id (UUID)
```

---

### `switch_cart_context(p_clerk_user_id, p_new_profile_type, p_new_business_id)`

Switch user's active cart profile.

---

### `lock_cart_for_checkout(p_cart_id, p_clerk_user_id, p_duration_minutes)`

Lock cart for checkout.

**Returns:** `JSONB`
```json
{
  "success": true,
  "is_locked": true,
  "locked_until": "2025-02-10T10:35:00Z"
}
```

---

### `unlock_cart(p_cart_id, p_clerk_user_id)`

Unlock cart.

---

### `is_cart_locked(p_cart_id)`

Check cart lock status.

---

### `unlock_expired_carts()`

Auto-unlock expired locks (run via cron).

**Returns:** `INTEGER` - Number of carts unlocked

---

### `mark_abandoned_carts()`

Mark carts older than 30 days as abandoned.

**Returns:** `INTEGER` - Number of carts abandoned

---

## Error Handling

All server actions return:

```typescript
interface CartActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

**Always check `success` before using `data`:**

```typescript
const result = await addItemToCart({ productId, quantity: 1 })

if (result.success) {
  console.log('Item added:', result.data)
  toast.success(result.message)
} else {
  console.error('Error:', result.error)
  toast.error(result.error)
}
```

---

**Version:** 2.0  
**Last Updated:** February 2025
