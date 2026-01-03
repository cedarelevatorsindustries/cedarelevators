# Cart System Architecture
Cedar Elevator Industries - Technical Documentation

## 📐 System Overview

The cart system is a production-ready, profile-scoped shopping cart that handles:
- **Guest → Login → Individual → Business → Verified Business** user journeys
- **Zero data loss** across user type changes
- **Profile-scoped cart isolation** (individual vs business)
- **Dynamic pricing derivation** (never trust stored prices)
- **Cart → Quote / Cart → Checkout** flows
- **Cart locking** during checkout (soft lock with 5-minute timeout)

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Guest      │  │  Individual  │  │   Business   │             │
│  │   User       │  │    User      │  │   User       │             │
│  │ (localStorage)│  │ (Authenticated)│ │ (Verified)   │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                  │                  │                       │
│         └──────────────────┼──────────────────┘                       │
│                            │                                          │
│                    ┌───────▼────────┐                                │
│                    │  React Query   │                                │
│                    │  Cart Context  │                                │
│                    └───────┬────────┘                                │
│                            │                                          │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────────────┐
│                      SERVER ACTIONS LAYER                             │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │             cart-v2.ts (Core CRUD)                           │   │
│  │  • getOrCreateCart()    • addItemToCart()                    │   │
│  │  • getUserActiveCart()  • updateCartItemQuantity()           │   │
│  │  • switchCartContext()  • removeCartItem()                   │   │
│  │  • clearCart()          • convertCart()                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │          cart-locking.ts (Checkout Lock)                     │   │
│  │  • lockCartForCheckout()  • unlockCart()                     │   │
│  │  • checkCartLockStatus()  • extendCartLock()                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │        cart-pricing.ts (Pricing Engine)                      │   │
│  │  • deriveItemPrice()      • calculateTax()                   │   │
│  │  • deriveCartItems()      • calculateShipping()              │   │
│  │  • calculateCartSummary() • getCartWithPricing()             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │          cart-merge.ts (Guest Merge)                         │   │
│  │  • mergeGuestCartToUser() • handleDuplicateItems()           │   │
│  │  • detectGuestCart()      • cleanupAfterMerge()              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└────────────────────────────┬──────────────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────────────┐
│                       DATABASE LAYER                                  │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────┐      ┌─────────────────────┐               │
│  │     carts           │      │    cart_items       │               │
│  ├─────────────────────┤      ├─────────────────────┤               │
│  │ id                  │◄─────┤ id                  │               │
│  │ clerk_user_id       │      │ cart_id (FK)        │               │
│  │ profile_type        │      │ product_id          │               │
│  │ business_id         │      │ variant_id          │               │
│  │ status              │      │ title               │               │
│  │ locked_at           │      │ thumbnail           │               │
│  │ locked_until        │      │ quantity            │               │
│  │ locked_by           │      │ (NO PRICE STORED)   │               │
│  │ lock_reason         │      └─────────────────────┘               │
│  │ created_at          │                                            │
│  │ updated_at          │                                            │
│  └─────────────────────┘                                            │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Database Functions                              │    │
│  │  • get_or_create_cart()                                      │    │
│  │  • switch_cart_context()                                     │    │
│  │  • lock_cart_for_checkout()                                  │    │
│  │  • unlock_cart()                                             │    │
│  │  • is_cart_locked()                                          │    │
│  │  • unlock_expired_carts()                                    │    │
│  │  • mark_abandoned_carts()                                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Core Concepts

### 1. Profile-Scoped Carts

Each user can have **multiple carts** based on their active profile:

```typescript
CartOwnership = {
  userId: string,          // Clerk user ID
  profileType: 'individual' | 'business',
  businessId?: string      // For business profile carts
}
```

**One Active Cart Per Profile:**
- `user123` + `individual` = Cart A
- `user123` + `business` + `biz456` = Cart B
- User can switch between carts without losing items

### 2. Pricing Derivation (Zero Trust)

**Never store prices in cart_items table!**

Prices are **always derived at render time**:

```typescript
// Cart Item (Stored) - NO PRICE
interface CartItem {
  id: string
  product_id: string
  variant_id?: string
  quantity: number
  // NO unit_price here!
}

// Derived Cart Item (Runtime) - WITH PRICE
interface DerivedCartItem extends CartItem {
  unit_price: number        // Derived from products table
  compare_at_price?: number // Current MRP
  line_total: number        // unit_price * quantity
}
```

**Why?**
- Admin can update prices anytime
- No stale pricing in cart
- No "price at add time" vs "price now" conflicts

### 3. Pricing Visibility Rules

| User Type            | Can See Prices? | Can Checkout? | Can Quote? |
|----------------------|-----------------|---------------|------------|
| Guest                | ❌ No            | ❌ No          | ❌ No      |
| Individual           | ✅ Yes           | ❌ No          | ✅ Yes     |
| Business Unverified  | ❌ No            | ❌ No          | ✅ Yes     |
| Business Verified    | ✅ Yes           | ✅ Yes         | ✅ Yes     |

### 4. Cart Locking (Soft Lock)

When user enters checkout:

```typescript
lockCartForCheckout(cartId, 5 minutes) → {
  is_locked: true,
  locked_until: "2025-02-10T10:35:00Z",
  remaining_seconds: 300
}
```

**Soft Lock Behavior:**
- Shows warning banner: "Cart is in checkout mode"
- Doesn't block modifications (user can still edit)
- Auto-unlocks after 5 minutes
- Can be manually unlocked

---

## 📊 Data Flow

### Flow 1: Guest Adds to Cart

```
1. Guest clicks "Add to Cart"
   ↓
2. addToGuestCart() → localStorage
   {
     items: [{ product_id, quantity, title, thumbnail }]
   }
   ↓
3. Guest cart badge updates (local count)
```

### Flow 2: Guest Signs In

```
1. User signs in with Clerk
   ↓
2. Cart Context detects: hasGuestCart() = true
   ↓
3. mergeGuestCartToUser(guestItems, userId)
   ├─ Get or create user cart
   ├─ For each guest item:
   │  ├─ Check if product exists in user cart
   │  ├─ If yes: Sum quantities
   │  └─ If no: Add new item
   └─ Validate stock availability
   ↓
4. clearGuestCart() → Remove from localStorage
   ↓
5. Show toast: "X items added to your cart"
```

### Flow 3: User Views Cart

```
1. Navigate to /cart
   ↓
2. useCartQuery() → Fetch active cart
   ↓
3. useCartWithPricing(userType)
   ├─ Get cart items from DB
   ├─ For each item:
   │  ├─ Fetch current product/variant price
   │  ├─ Check stock availability
   │  ├─ Check product status (active/archived)
   │  └─ Calculate line_total
   ├─ Calculate summary:
   │  ├─ subtotal = Σ(line_total)
   │  ├─ tax = (subtotal + shipping) * 0.18
   │  └─ total = subtotal + tax + shipping - discount
   └─ Return { items: DerivedCartItem[], summary }
   ↓
4. Render cart with current prices
```

### Flow 4: Profile Switching

```
1. User clicks "Switch to Business Profile"
   ↓
2. switchCartContext('business', businessId)
   ├─ Mark current cart as active (keep it)
   ├─ Get or create cart for new profile
   └─ Return new cart
   ↓
3. UI updates to show business cart
   ↓
4. Previous cart preserved (can switch back)
```

### Flow 5: Checkout Flow

```
1. User clicks "Proceed to Checkout"
   ↓
2. CheckoutEligibilityGuard checks:
   ├─ Is user business_verified?
   ├─ Cart has items?
   ├─ All items available?
   └─ All items in stock?
   ↓
3. If eligible:
   ├─ lockCartForCheckout(cartId, 5)
   ├─ Navigate to /checkout
   └─ Show lock warning in cart
   ↓
4. User completes order
   ↓
5. convertCart(cartId, 'order')
   ├─ Mark cart as 'converted'
   ├─ Clear cart items (optional)
   └─ Unlock cart
```

---

## 🚀 Performance Optimizations

### 1. React Query Caching

```typescript
// Cart cached for 2 minutes
staleTime: 1000 * 60 * 2

// Pricing cached for 30 seconds (can change frequently)
staleTime: 1000 * 30

// Auto-refetch on window focus
refetchOnWindowFocus: true

// Retry failed requests (good for mobile)
retry: 2
```

### 2. Virtual Scrolling

For carts with **20+ items**, uses `@tanstack/react-virtual`:
- Only renders visible items
- Smooth scrolling
- Handles 100+ items efficiently

### 3. Lazy Loading

```typescript
const CartItemsList = lazy(() => import('./cart-items-list'))
const CartSummary = lazy(() => import('./cart-summary-optimized'))
```

### 4. Database Indexes

```sql
-- Fast cart lookup
CREATE INDEX idx_carts_user_profile 
  ON carts(clerk_user_id, profile_type, business_id) 
  WHERE status = 'active';

-- Fast item queries
CREATE INDEX idx_cart_items_cart_date 
  ON cart_items(cart_id, created_at DESC);

-- Product availability
CREATE INDEX idx_products_status_stock 
  ON products(status, stock_quantity) 
  WHERE status = 'active';
```

### 5. Optimistic Updates

```typescript
// Update UI immediately, revert on error
onMutate: async (payload) => {
  queryClient.setQueryData(cartKeys.count(userId), 
    (old: number = 0) => old + payload.quantity
  )
}
```

---

## 🔒 Security

### Row Level Security (RLS)

```sql
-- Users can only read their own carts
CREATE POLICY "Users read own carts" ON carts 
  FOR SELECT TO authenticated 
  USING (clerk_user_id = current_user_id());

-- Users can only modify active carts
CREATE POLICY "Users update own active carts" ON carts 
  FOR UPDATE TO authenticated 
  USING (clerk_user_id = current_user_id() AND status = 'active');
```

### Validation

```typescript
// Always validate on server
- Check cart ownership
- Validate stock availability
- Verify product status
- Check user permissions
```

---

## 📱 Mobile Optimizations

1. **React Query** - Built-in retry and offline support
2. **Lazy Loading** - Faster initial load
3. **Virtual Scrolling** - Smooth on low-end devices
4. **Optimistic Updates** - Instant feedback
5. **Compact UI** - Mobile-friendly cart components

---

## 🧪 Testing

Key test scenarios:

```typescript
// Unit Tests
- deriveItemPrice()
- calculateCartSummary()
- mergeGuestCartToUser()
- validateCartOwnership()

// Integration Tests
- Guest → Login → Cart Merge
- Add to Cart → Update Quantity → Remove
- Profile Switching
- Cart Locking

// E2E Tests
- Full checkout flow
- Quote from cart flow
- Cart persistence across sessions
```

---

## 📚 API Reference

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API docs.

---

**Last Updated:** February 2025  
**Version:** 2.0  
**Status:** Production Ready ✅
