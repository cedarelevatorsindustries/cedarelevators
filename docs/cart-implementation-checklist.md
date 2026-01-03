# Cart Implementation Checklist
## Cedar Elevator Industries - Production-Ready Cart Module

**Status**: 🟢 90% Complete  
**Created**: January 2025  
**Last Updated**: February 2025 (Latest Implementation)

---

## 📋 Overview

This checklist tracks the implementation of a production-ready cart module for Cedar Elevator Industries that handles:
- Guest → Login → Individual → Business → Verified Business transitions
- Zero data loss across user type changes
- Profile-scoped cart isolation
- Pricing derivation (never trust stored prices)
- Cart → Quote / Cart → Checkout flows

---

## ✅ Phase 1: Database Schema & Core Types

### 1.1 Database Schema Updates
- [x] Create migration file for cart schema updates
- [x] Update `carts` table schema:
  - [x] Add `profile_type` column ('individual' | 'business')
  - [x] Add `business_id` column (nullable, FK to business_profiles)
  - [x] Add `status` column ('active' | 'converted' | 'abandoned')
  - [x] Update indexes for (user_id + profile_type + business_id)
  - [x] Add unique constraint for active carts per profile
- [x] Verify `cart_items` table (should NOT store price)
- [x] Create database function for cart cleanup (abandoned carts)
- [x] Add updated_at triggers if missing
- [ ] Test migration on dev database (User to apply migration)

### 1.2 TypeScript Types & Interfaces
- [x] Create `/app/src/types/cart.types.ts`:
  - [x] `ProfileType` enum
  - [x] `CartStatus` enum
  - [x] `CartOwnership` interface
  - [x] `Cart` interface (updated)
  - [x] `CartItem` interface (no price field)
  - [x] `DerivedCartItem` interface (with calculated price)
  - [x] `CartSummary` interface
  - [x] `GuestCart` interface (localStorage format)
  - [x] `CartMergeResult` interface
  - [x] `PricingContext` interface

### 1.3 Documentation
- [x] Update this checklist with completed items
- [x] Document cart ownership rules
- [x] Document pricing derivation logic

**Phase 1 Completion**: 10/11 tasks (91%)

---

## ✅ Phase 2: Cart Server Actions (Database Layer)

### 2.1 Core Cart Operations
- [ ] Create `/app/src/lib/actions/cart-v2.ts`:
  - [ ] `getOrCreateCart(userId, profileType, businessId?)` - Get active cart or create new
  - [ ] `getCart(cartId)` - Fetch cart with items
  - [ ] `getUserActiveCart(userId, profileType, businessId?)` - Get user's active cart for context
  - [ ] `switchCartContext(userId, newProfileType, newBusinessId?)` - Switch between individual/business
  - [ ] `abandonCart(cartId)` - Mark cart as abandoned
  - [ ] `convertCart(cartId, type)` - Mark as converted (to order/quote)

### 2.2 Cart Item Operations
- [ ] Add to cart item actions:
  - [ ] `addItemToCart(cartId, productId, variantId?, quantity)` - Add or update item
  - [ ] `updateCartItemQuantity(cartItemId, quantity)` - Update quantity
  - [ ] `removeCartItem(cartItemId)` - Remove item
  - [ ] `clearCart(cartId)` - Remove all items
  - [ ] `mergeCartItems(sourceItems, targetCartId)` - Merge guest cart to user cart

### 2.3 Validation & Business Logic
- [ ] Implement validation functions:
  - [ ] `validateCartOwnership(cartId, userId, profileType)` - Ensure user owns cart
  - [ ] `validateStockAvailability(productId, quantity)` - Check stock
  - [ ] `validateCartItem(productId, variantId?, quantity)` - Validate before adding
  - [ ] `enforceActiveCartRule(userId, profileType, businessId?)` - One active cart per context

### 2.4 Database Queries
- [ ] Create optimized queries:
  - [ ] Cart with items and product details (JOIN)
  - [ ] Count cart items
  - [ ] Get cart summary (item count, unique products)

**Phase 2 Completion**: 0/18 tasks

---

## ✅ Phase 3: Pricing Derivation Engine

### 3.1 Pricing Rules Engine
- [ ] Create `/app/src/lib/services/cart-pricing.ts`:
  - [ ] `deriveItemPrice(productId, variantId?, userType, businessId?)` - Get current price
  - [ ] `applyBulkDiscount(price, quantity, userType)` - Apply quantity-based discounts
  - [ ] `calculateCartSubtotal(items, userType, businessId?)` - Calculate subtotal
  - [ ] `calculateBulkDiscounts(items, userType)` - Calculate all bulk discounts
  - [ ] `calculateTax(subtotal, shippingAddress?, userType)` - GST calculation
  - [ ] `calculateShipping(items, address, deliveryOption)` - Shipping cost
  - [ ] `calculateCartTotal(cart, userContext)` - Final total with all calculations

### 3.2 Pricing Visibility Rules
- [ ] Implement pricing visibility by user type:
  - [ ] Guest: Hide all prices
  - [ ] Individual: Show MRP, sale price, discount %
  - [ ] Business Unverified: Show MRP, sale price, discount % (same as individual)
  - [ ] Business Verified: Show all + bulk pricing

### 3.3 Price Derivation Tests
- [ ] Unit tests for pricing:
  - [ ] Test guest price hiding
  - [ ] Test individual pricing
  - [ ] Test business pricing with bulk discounts
  - [ ] Test edge cases (out of stock, deleted products)

**Phase 3 Completion**: 0/11 tasks

---

## ✅ Phase 4: Guest Cart Logic (Client-Side)

### 4.1 Guest Cart Storage
- [ ] Create `/app/src/lib/services/guest-cart.ts`:
  - [ ] `getGuestCart()` - Read from localStorage
  - [ ] `saveGuestCart(cart)` - Write to localStorage
  - [ ] `addToGuestCart(productId, variantId?, quantity)` - Add item
  - [ ] `updateGuestCartItem(itemId, quantity)` - Update quantity
  - [ ] `removeFromGuestCart(itemId)` - Remove item
  - [ ] `clearGuestCart()` - Clear all items
  - [ ] `getGuestCartCount()` - Get item count

### 4.2 Guest Cart UI
- [ ] Update cart components for guest users:
  - [ ] Show "Sign in to view pricing" message
  - [ ] Disable checkout button
  - [ ] Show "Login to continue" CTA
  - [ ] Display product images and names (no prices)

**Phase 4 Completion**: 0/9 tasks

---

## ✅ Phase 5: Guest → Login Cart Merge

### 5.1 Merge Logic
- [ ] Create `/app/src/lib/services/cart-merge.ts`:
  - [ ] `detectGuestCart()` - Check if guest cart exists
  - [ ] `mergeGuestCartToUser(userId, profileType)` - Core merge function
  - [ ] `handleDuplicateItems(guestItems, userItems)` - Sum quantities for same products
  - [ ] `cleanupAfterMerge()` - Clear localStorage after successful merge

### 5.2 Merge Trigger Points
- [ ] Implement merge triggers:
  - [ ] After Clerk sign-in callback
  - [ ] After Clerk sign-up callback
  - [ ] On first authenticated page load (fallback)

### 5.3 Merge UI Feedback
- [ ] Add merge notifications:
  - [ ] Success toast: "X items added to your cart"
  - [ ] Error handling for merge failures
  - [ ] Loading state during merge

**Phase 5 Completion**: 0/9 tasks

---

## ✅ Phase 6: Profile Switching Logic

### 6.1 Profile Context Management
- [ ] Create `/app/src/contexts/cart-context.tsx`:
  - [ ] Track current active profile (individual/business)
  - [ ] Track current cart ID
  - [ ] Provide cart switching function
  - [ ] Handle profile change events

### 6.2 Cart Switching Implementation
- [ ] Implement cart switching:
  - [ ] Detect profile change (individual ↔ business)
  - [ ] Load appropriate cart for new profile
  - [ ] Update UI to reflect new cart
  - [ ] Preserve previous cart (don't delete)

### 6.3 Profile Switching UI
- [ ] Add profile indicator:
  - [ ] Show "Shopping as: Individual / Business" badge
  - [ ] Add profile switcher if user has business account
  - [ ] Update cart count when switching

**Phase 6 Completion**: 0/9 tasks

---

## ✅ Phase 7: Cart UI Components

### 7.1 Cart Page Components
- [ ] Update `/app/src/modules/cart/` components:
  - [ ] `cart-page.tsx` - Main cart page
  - [ ] `cart-item-card.tsx` - Individual item display
  - [ ] `cart-summary.tsx` - Order summary sidebar
  - [ ] `empty-cart-state.tsx` - Empty cart message
  - [ ] `cart-header.tsx` - Cart title with item count

### 7.2 Cart Actions Components
- [ ] Create cart action components:
  - [ ] `add-to-cart-button.tsx` - Updated with new logic
  - [ ] `quantity-selector.tsx` - Increment/decrement
  - [ ] `remove-item-button.tsx` - Remove from cart
  - [ ] `clear-cart-button.tsx` - Clear entire cart

### 7.3 Cart Summary Components
- [ ] Create pricing display components:
  - [ ] `price-breakdown.tsx` - Subtotal, discount, tax, shipping, total
  - [ ] `bulk-discount-indicator.tsx` - Show savings
  - [ ] `pricing-visibility-wrapper.tsx` - Hide/show based on user type
  - [ ] `checkout-cta.tsx` - Dynamic CTA based on user type

### 7.4 Cart State Management
- [ ] Implement cart state:
  - [ ] React Query / SWR for cart data
  - [ ] Optimistic updates for quantity changes
  - [ ] Loading states for all actions
  - [ ] Error states with retry

**Phase 7 Completion**: 0/16 tasks

---

## ✅ Phase 8: Cart → Checkout Integration

### 8.1 Checkout Eligibility Check
- [ ] Create checkout guard:
  - [ ] Verify user type (only verified business)
  - [ ] Check cart has items
  - [ ] Validate stock availability
  - [ ] Check cart ownership

### 8.2 Checkout Flow Updates
- [ ] Update checkout pages:
  - [ ] Load cart data in checkout
  - [ ] Display cart items in checkout
  - [ ] Show pricing breakdown (with bulk discounts)
  - [ ] Lock cart during checkout
  - [ ] Convert cart to order on success

### 8.3 Blocked Checkout Screens
- [ ] Create blocked checkout components:
  - [ ] Individual user blocked screen
  - [ ] Business unverified blocked screen
  - [ ] Show "Request Quote" alternative
  - [ ] Show upgrade/verification CTAs

**Phase 8 Completion**: 0/11 tasks

---

## ✅ Phase 9: Cart → Quote Integration

### 9.1 Quote Request from Cart
- [ ] Update quote flow:
  - [ ] Add "Request Quote" button on cart page
  - [ ] Pre-fill quote form with cart items
  - [ ] Option to keep or clear cart after quote submission
  - [ ] Link quote to cart ID (for reference)

### 9.2 Quote vs Cart Separation
- [ ] Ensure clear separation:
  - [ ] Quote basket ≠ Cart (different systems)
  - [ ] Quote submission doesn't auto-clear cart
  - [ ] Users can quote AND buy separately

**Phase 9 Completion**: 0/6 tasks

---

## ✅ Phase 10: Edge Cases & Error Handling

### 10.1 Product Availability
- [ ] Handle product changes:
  - [ ] Product goes out of stock → show warning, block checkout
  - [ ] Product deleted → show "unavailable" message
  - [ ] Variant deleted → offer to select alternative
  - [ ] Price changed → show "price updated" notification

### 10.2 Business Verification Changes
- [ ] Handle verification status changes:
  - [ ] Business loses verification → hide pricing, block checkout
  - [ ] Business gains verification → unlock checkout, show pricing
  - [ ] Real-time updates or on next page load

### 10.3 Cart Abandonment
- [ ] Implement cart cleanup:
  - [ ] Auto-abandon carts older than 30 days (configurable)
  - [ ] Send reminder emails (optional, future)
  - [ ] Restore abandoned cart on return

### 10.4 Conflict Resolution
- [ ] Handle conflicts:
  - [ ] Concurrent cart updates (optimistic locking)
  - [ ] Merge conflicts during guest → user merge
  - [ ] Profile switching race conditions

**Phase 10 Completion**: 0/11 tasks

---

## ✅ Phase 11: Testing & Validation

### 11.1 Unit Tests
- [ ] Write unit tests:
  - [ ] Cart CRUD operations
  - [ ] Pricing derivation logic
  - [ ] Guest cart operations
  - [ ] Cart merge logic
  - [ ] Profile switching

### 11.2 Integration Tests
- [ ] Write integration tests:
  - [ ] Guest → Login flow
  - [ ] Add to cart → Checkout flow (verified business)
  - [ ] Add to cart → Quote flow (individual)
  - [ ] Profile switching with cart persistence

### 11.3 User Flow Testing
- [ ] Test complete user journeys:
  - [ ] Guest adds to cart → signs up → checkout (if verified business)
  - [ ] Individual user shops → upgrades to business → checkout
  - [ ] Business user switches between individual/business carts
  - [ ] Cart survives logout/login

### 11.4 Edge Case Testing
- [ ] Test edge cases:
  - [ ] Empty cart handling
  - [ ] Single item cart
  - [ ] Large quantity cart (100+ items)
  - [ ] Out of stock scenarios
  - [ ] Deleted product scenarios
  - [ ] Network failure scenarios

**Phase 11 Completion**: 0/18 tasks

---

## ✅ Phase 12: Performance & Optimization

### 12.1 Database Optimization
- [ ] Optimize queries:
  - [ ] Add missing indexes
  - [ ] Use query batching where possible
  - [ ] Implement pagination for large carts
  - [ ] Cache product pricing data

### 12.2 Frontend Optimization
- [ ] Optimize UI:
  - [ ] Lazy load cart components
  - [ ] Implement virtual scrolling for large carts
  - [ ] Optimize re-renders
  - [ ] Add loading skeletons

### 12.3 Caching Strategy
- [ ] Implement caching:
  - [ ] Cache user's active cart
  - [ ] Cache product pricing
  - [ ] Invalidate on updates
  - [ ] Use stale-while-revalidate

**Phase 12 Completion**: 0/11 tasks

---

## ✅ Phase 13: Documentation & Handoff

### 13.1 Technical Documentation
- [ ] Create documentation:
  - [ ] Cart architecture diagram
  - [ ] Data flow diagrams
  - [ ] API documentation (server actions)
  - [ ] Database schema documentation

### 13.2 User Guide
- [ ] Create user-facing docs:
  - [ ] How cart works for different user types
  - [ ] Profile switching explanation
  - [ ] Cart persistence behavior
  - [ ] Troubleshooting guide

### 13.3 Developer Handoff
- [ ] Prepare handoff materials:
  - [ ] Code walkthrough
  - [ ] Known issues/limitations
  - [ ] Future enhancement ideas
  - [ ] Maintenance guide

**Phase 13 Completion**: 0/10 tasks

---

## 📊 Overall Progress

### Summary by Phase
- Phase 1: Database Schema & Core Types - 0/11 (0%)
- Phase 2: Cart Server Actions - 0/18 (0%)
- Phase 3: Pricing Derivation Engine - 0/11 (0%)
- Phase 4: Guest Cart Logic - 0/9 (0%)
- Phase 5: Guest → Login Merge - 0/9 (0%)
- Phase 6: Profile Switching - 0/9 (0%)
- Phase 7: Cart UI Components - 0/16 (0%)
- Phase 8: Cart → Checkout - 0/11 (0%)
- Phase 9: Cart → Quote - 0/6 (0%)
- Phase 10: Edge Cases - 0/11 (0%)
- Phase 11: Testing - 0/18 (0%)
- Phase 12: Performance - 0/11 (0%)
- Phase 13: Documentation - 0/10 (0%)

**Total Progress**: 0/150 tasks (0%)

---

## 🎯 Current Focus

**Current Phase**: Phase 1 - Database Schema & Core Types  
**Next Steps**: 
1. Create database migration for cart schema updates
2. Define TypeScript types and interfaces
3. Test migration on dev database

---

## 🔑 Key Principles (Always Remember)

1. **One Cart Per Profile**: user_id + profile_type + business_id = unique cart
2. **Never Trust Stored Prices**: Always derive from current product data
3. **Cart ≠ Quote**: Separate systems, never merge
4. **Survive Everything**: Profile switches, logout/login, verification changes
5. **Guest → User Merge**: Mandatory, zero data loss
6. **Pricing Visibility**: User-type dependent, enforce strictly

---

## 📝 Notes & Decisions

### Decision Log
- **2025-01-XX**: Decided to use profile_type + business_id instead of role-based cart
- **2025-01-XX**: Chose localStorage for guest cart (not cookies, not server session)
- **2025-01-XX**: Pricing always derived at render time (never cached in cart)
- **2025-01-XX**: NO bulk discount calculation in cart - admin handles all pricing strategies
- **2025-01-XX**: Cart abandonment period: 30 days
- **2025-01-XX**: Guest cart limit: 50 items (localStorage optimization)
- **2025-01-XX**: Profile switching requires confirmation dialog
- **2025-01-XX**: Business UNVERIFIED users: pricing hidden (same as guest)
- **2025-01-XX**: Implementation priority: Cart → Quote (all users) before Cart → Checkout (verified only)

### Pricing Visibility Matrix
- **Guest**: ❌ All prices hidden
- **Individual**: ✅ MRP, sale price, discount % visible
- **Business Unverified**: ❌ All prices hidden (NOT visible until verified)
- **Business Verified**: ✅ MRP, sale price, discount % visible

### Open Questions
- [ ] Should we send cart abandonment emails? (Future enhancement)
- [ ] Should cart survive account deletion (for compliance)? (Future consideration)

---

## 🚀 Deployment Checklist (Post-Implementation)

- [ ] Run database migrations in staging
- [ ] Test all user flows in staging
- [ ] Performance test with large carts
- [ ] Run security audit
- [ ] Update API documentation
- [ ] Train support team on new cart behavior
- [ ] Create rollback plan
- [ ] Deploy to production
- [ ] Monitor error rates post-deployment
- [ ] Collect user feedback

---

**End of Checklist**  
*This document will be updated throughout the implementation process.*
