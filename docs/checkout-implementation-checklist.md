# 🛒 Checkout Module Implementation Checklist
Cedar Elevator Industries - B2B E-commerce Platform

---

## 📊 Implementation Status

**Started:** [Date will be added]  
**Last Updated:** [Will be updated after each phase]  
**Overall Progress:** 0% Complete

---

## 🎯 Core Principles (Locked In)

- ✅ Checkout is a guarded flow, not a free-for-all page
- ✅ Orders created BEFORE payment (with pending_payment status)
- ✅ Prices calculated SERVER-SIDE only (never trust client)
- ✅ Payment success ≠ order success (webhook-first confirmation)
- ✅ Checkout consumes cart and creates order
- ✅ Only VERIFIED BUSINESS users can access checkout

---

## 👥 User Type Access Control

| User Type | Can Access /checkout | Outcome |
|-----------|---------------------|---------|
| Guest | ❌ | → Redirect to `/login` |
| Individual | ❌ | → Redirect to business upgrade / quote |
| Business (unverified) | ❌ | → Redirect to verification |
| Business (verified) | ✅ | Full checkout access |

---

## 🗺️ Canonical Routes

```
/cart                              [Existing - ✅]
/checkout                          [To Build - ⏳]
/checkout/success                  [To Build - ⏳]
/checkout/failure                  [To Build - ⏳]
/request-quote                     [Existing - ✅]
/login                             [Existing - ✅]
/profile/business/verification     [To Build - ⏳]
```

---

## 📋 PHASE 1: Database Foundation

### 1.1 Business Addresses Table
- [ ] Create `business_addresses` table migration
- [ ] Fields: id, business_id, address_type (shipping/billing), address details, is_default
- [ ] RLS policies for user access
- [ ] Indexes for fast lookup

### 1.2 Orders Schema Enhancement
- [ ] Verify orders table has all required fields
- [ ] Add `checkout_snapshot` JSONB field (price lock)
- [ ] Add `payment_snapshot` JSONB field (payment details)
- [ ] Add `gst_amount` and `gst_percentage` fields
- [ ] Add `shipping_cost` field (🟡 ON HOLD - as per user)

### 1.3 Database Functions
- [ ] Function: `create_order_from_cart(cart_id, business_id)`
- [ ] Function: `validate_checkout_eligibility(cart_id, user_id)`
- [ ] Function: `lock_prices_snapshot(cart_id)`
- [ ] Function: `mark_order_as_paid(order_id, payment_details)`

### 1.4 Payment Integration Table
- [ ] Create `payment_transactions` table
- [ ] Fields: order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature
- [ ] Status tracking (initiated, success, failed)
- [ ] Idempotency key support

**Phase 1 Status:** ⏳ Not Started

---

## 📋 PHASE 2: Guards & Redirect Logic

### 2.1 Middleware Guard
- [ ] Create checkout route middleware
- [ ] Verify user authentication
- [ ] Check business verification status
- [ ] Redirect logic implementation

### 2.2 Checkout Eligibility Service
- [ ] Server action: `checkCheckoutEligibility()`
- [ ] Validate: user is business_verified
- [ ] Validate: cart has items
- [ ] Validate: all items in stock
- [ ] Validate: cart not locked by another session

### 2.3 Redirect Components
- [ ] Update `GuestCheckoutBlocked` (add quote CTA)
- [ ] Update `IndividualCheckoutBlocked` (business upgrade + quote)
- [ ] Update `UnverifiedBusinessCheckoutBlocked` (verification + quote)
- [ ] Create `CartIssuesBlocked` (stock/availability issues)

### 2.4 Profile Switching Block
- [ ] Disable profile switching during checkout
- [ ] Show warning if attempted
- [ ] Clear checkout session on profile switch

**Phase 2 Status:** ⏳ Not Started

---

## 📋 PHASE 3: Checkout Page UI & Flow

### 3.1 Checkout Page Structure
- [ ] Create `/checkout/page.tsx`
- [ ] Layout with progress indicator
- [ ] Responsive design (mobile + desktop)
- [ ] Data-testid attributes for all interactive elements

### 3.2 Address Section
- [ ] Fetch saved business addresses
- [ ] Address selection UI
- [ ] "Add New Address" form
- [ ] Mark "Billing same as Shipping" option
- [ ] Form validation (required fields, pin code, state)

### 3.3 Order Summary Section
- [ ] Cart items display (read-only)
- [ ] Pricing breakdown:
  - Subtotal
  - GST (18%)
  - Shipping (🟡 ON HOLD - will be ₹0 for now)
  - Total
- [ ] Lock warning banner (if cart locked)
- [ ] Item availability check

### 3.4 Payment Method Section
- [ ] Razorpay integration
- [ ] Payment method display (Cards, UPI, Netbanking, Wallets)
- [ ] Terms & conditions checkbox
- [ ] "Place Order" button (guarded)

### 3.5 Server-Side Price Lock
- [ ] Before payment: recalculate all prices
- [ ] Validate stock availability
- [ ] Generate checkout snapshot (frozen pricing)
- [ ] Lock cart for 5 minutes

**Phase 3 Status:** ⏳ Not Started

---

## 📋 PHASE 4: Payment Integration (Razorpay)

### 4.1 Razorpay Setup
- [ ] Install razorpay npm package
- [ ] Configure test mode keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
- [ ] Create Razorpay server utility
- [ ] Error handling setup

### 4.2 Order Creation Flow
- [ ] API: `POST /api/orders/create`
- [ ] Create order in DB (status: pending_payment)
- [ ] Create Razorpay order
- [ ] Return: order_id, razorpay_order_id, amount, currency

### 4.3 Payment Initiation
- [ ] Initialize Razorpay checkout modal
- [ ] Pass order details
- [ ] Handle payment success (client-side)
- [ ] Handle payment failure (client-side)

### 4.4 Webhook Handler
- [ ] API: `POST /api/webhooks/razorpay`
- [ ] Verify Razorpay signature (critical!)
- [ ] Handle `payment.captured` event
- [ ] Mark order as `paid`
- [ ] Reduce inventory
- [ ] Convert cart to `converted` status
- [ ] Send confirmation email (optional)

### 4.5 Idempotency & Retry
- [ ] Prevent duplicate order creation
- [ ] Handle webhook retries (same event)
- [ ] Transaction rollback on failure

**Phase 4 Status:** ⏳ Not Started

---

## 📋 PHASE 5: Order Confirmation & Failure

### 5.1 Success Page
- [ ] Route: `/checkout/success`
- [ ] Display: Order ID, Invoice, Delivery ETA
- [ ] Order summary with all details
- [ ] Download invoice button
- [ ] Support contact info
- [ ] "Track Order" CTA

### 5.2 Failure Page
- [ ] Route: `/checkout/failure`
- [ ] Display: Error message
- [ ] Options:
  - Retry payment
  - Contact support
  - Convert to quote (fallback)
- [ ] Cart restoration (if needed)

### 5.3 Order Management
- [ ] Server action: `getOrderById(order_id)`
- [ ] Server action: `getUserOrders(user_id)`
- [ ] Order status tracking
- [ ] Order cancellation (if needed)

**Phase 5 Status:** ⏳ Not Started

---

## 🎯 Edge Cases Handled

- [ ] Business loses verification mid-checkout → Block payment
- [ ] Price changes during checkout → Invalidate snapshot, reload
- [ ] Inventory changes → Block payment, notify user
- [ ] Webhook arrives twice → Idempotency key check
- [ ] User refreshes success page → Don't create duplicate order
- [ ] Profile switching attempted → Block and warn
- [ ] Cart locked by another session → Show error
- [ ] Payment gateway timeout → Graceful failure

---

## 🚫 Blocked Checkout Scenarios & Redirects

### Guest User
- **Redirect:** `/login?redirect=/checkout`
- **Message:** "Sign in required to proceed with checkout"
- **CTA:** Sign In | Create Account

### Individual User
- **Redirect:** `/profile/upgrade-to-business` (or show modal)
- **Message:** "Business account required for checkout"
- **CTAs:** 
  - Upgrade to Business
  - Request Quote Instead ✅

### Business Unverified
- **Redirect:** `/profile/business/verification`
- **Message:** "Checkout requires verified business account"
- **CTAs:**
  - Complete Verification
  - Request Quote Instead ✅

### Cart Issues
- **Redirect:** `/cart`
- **Message:** "Some items are unavailable or out of stock"
- **CTA:** Review Cart

---

## 🔒 Security Checklist

- [ ] Server-side validation for ALL checkout operations
- [ ] RLS policies for orders table
- [ ] Razorpay signature verification (webhook)
- [ ] Price tampering prevention (server-side recalculation)
- [ ] Cart ownership validation
- [ ] User verification status check (server-side)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize inputs)

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Guest tries to checkout → Redirected to login
- [ ] Individual tries to checkout → Redirected to upgrade
- [ ] Unverified business tries → Redirected to verification
- [ ] Verified business can checkout → Success
- [ ] Price changes mid-checkout → Handled
- [ ] Stock runs out mid-checkout → Blocked
- [ ] Payment success → Order created
- [ ] Payment failure → Cart restored
- [ ] Webhook replay → No duplicate order

### Automated Testing (Future)
- [ ] Unit tests for order creation logic
- [ ] Integration tests for payment flow
- [ ] E2E tests for full checkout journey

---

## 📝 Implementation Notes

### Shipping Cost Logic
**Status:** 🟡 ON HOLD (as per user request)  
**Current Implementation:** Shipping cost = ₹0  
**Future:** Dynamic calculation based on weight/location

### GST Calculation
**Rate:** 18% (standard)  
**Formula:** `tax = (subtotal + shipping) * 0.18`

### Payment Provider
**Provider:** Razorpay (Test Mode for now)  
**Key Setup:** Use test keys in `.env`

### Quote Fallback
**Status:** ✅ CONFIRMED  
**Implementation:** Show "Request Quote Instead" button on all blocked checkout screens

---

## 🚀 Deployment Checklist (Future)

- [ ] Replace Razorpay test keys with live keys
- [ ] Configure webhook URL in Razorpay dashboard
- [ ] Test webhook delivery in production
- [ ] Setup email notifications (order confirmation)
- [ ] Setup SMS notifications (optional)
- [ ] Monitor error logs
- [ ] Setup alerts for failed payments

---

## 📊 Progress Tracking

### Phase Completion
- Phase 1 (Database): 0/4 sections complete
- Phase 2 (Guards): 0/4 sections complete
- Phase 3 (UI): 0/5 sections complete
- Phase 4 (Payment): 0/5 sections complete
- Phase 5 (Confirmation): 0/3 sections complete

**Overall:** 0/21 sections complete (0%)

---

## 🎯 One Sentence Mental Model

> **Checkout is a privilege earned through verification, not a default right.**

---

**Last Updated:** [Will be updated after each commit]  
**Next Phase:** Phase 1 - Database Foundation
