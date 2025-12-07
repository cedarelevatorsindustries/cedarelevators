# Migrating from Stripe to Razorpay - Saved Payment Methods

This guide helps you migrate from Stripe's saved payment methods implementation to Razorpay, following the official Medusa tutorial structure.

## Overview

Both Stripe and Razorpay support saved payment methods through Medusa's Payment Module, but they have different configurations and data structures. This guide covers the key differences and migration steps.

## Key Differences

### 1. Provider Package

| Aspect | Stripe | Razorpay |
|--------|--------|----------|
| Package | `@medusajs/medusa/payment-stripe` | `medusa-payment-razorpay` |
| Installation | Built-in | Requires `pnpm add` |
| Provider ID | `stripe` | `razorpay` |

### 2. Configuration Options

#### Stripe Configuration
```typescript
{
  resolve: "@medusajs/medusa/payment-stripe",
  id: "stripe",
  options: {
    apiKey: process.env.STRIPE_API_KEY,
  },
}
```

#### Razorpay Configuration
```typescript
{
  resolve: "medusa-payment-razorpay",
  id: "razorpay",
  options: {
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
    razorpay_account: process.env.RAZORPAY_ACCOUNT,
    automatic_expiry_period: 30,
    manual_expiry_period: 20,
    refund_speed: "normal",
    webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
}
```

### 3. Environment Variables

#### Stripe
```bash
# Backend
STRIPE_API_KEY=sk_test_xxxxx

# Frontend
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxxxx
```

#### Razorpay
```bash
# Backend
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_ACCOUNT=acc_xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# Frontend
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### 4. Saving Payment Methods

#### Stripe
Uses `setup_future_usage` parameter:
```typescript
{
  provider_id: "stripe",
  data: {
    setup_future_usage: "off_session"  // or "on_session"
  }
}
```

#### Razorpay
Uses `save` parameter:
```typescript
{
  provider_id: "razorpay",
  data: {
    save: "1"  // String "1" to enable saving
  }
}
```

### 5. Payment Method Data Structure

#### Stripe Response
```json
{
  "id": "pm_xxxxx",
  "provider_id": "stripe",
  "data": {
    "card": {
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2025,
      "network": "visa"
    },
    "type": "card"
  }
}
```

#### Razorpay Response
```json
{
  "id": "pm_xxxxx",
  "provider_id": "razorpay",
  "data": {
    "card": {
      "brand": "Visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2025
    },
    "type": "card"
  }
}
```

**Note:** Razorpay also supports:
- `wallet` - For digital wallets (Paytm, PhonePe, etc.)
- `bank` - For UPI and NetBanking

### 6. Frontend Components

#### Stripe Elements
```typescript
import { Elements, CardElement } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)
```

#### Razorpay Checkout
```typescript
// Razorpay uses a different integration approach
// Typically loaded via script tag or SDK
const razorpay = new Razorpay({
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!
})
```

## Migration Steps

### Step 1: Install Razorpay Provider

```bash
cd medusa-backend
pnpm add medusa-payment-razorpay
```

### Step 2: Update Backend Configuration

**File:** `medusa-backend/medusa-config.ts`

Replace:
```typescript
{
  resolve: "@medusajs/medusa/payment-stripe",
  id: "stripe",
  options: {
    apiKey: process.env.STRIPE_API_KEY,
  },
}
```

With:
```typescript
{
  resolve: "medusa-payment-razorpay",
  id: "razorpay",
  options: {
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
    razorpay_account: process.env.RAZORPAY_ACCOUNT,
    automatic_expiry_period: 30,
    manual_expiry_period: 20,
    refund_speed: "normal",
    webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
}
```

### Step 3: Update Environment Variables

**Backend (.env):**
```bash
# Remove Stripe variables
# STRIPE_API_KEY=sk_test_xxxxx

# Add Razorpay variables
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_ACCOUNT=acc_xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

**Frontend (.env.local):**
```bash
# Remove Stripe variables
# NEXT_PUBLIC_STRIPE_KEY=pk_test_xxxxx

# Add Razorpay variables
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### Step 4: Update API Route (No Changes Needed!)

The API route for listing payment methods remains the same:
```typescript
// medusa-backend/src/api/store/payment-methods/[account_holder_id]/route.ts
// No changes needed - works with both providers!
```

### Step 5: Update Frontend Data Functions

**File:** `src/lib/data/payment.ts`

Update the type to handle Razorpay's additional payment methods:
```typescript
export type SavedPaymentMethod = {
  id: string
  provider_id: string
  data: {
    card?: {
      brand: string
      last4: string
      exp_month: number
      exp_year: number
      network?: string
    }
    bank?: string      // Razorpay specific
    wallet?: string    // Razorpay specific
    type: string
  }
}
```

### Step 6: Update Payment Session Initialization

**File:** `src/lib/actions/cart.ts`

Replace:
```typescript
const sessionData: Record<string, any> = {}

if (data?.payment_method_id) {
  sessionData.payment_method_id = data.payment_method_id
}

if (data?.save_payment_method !== false) {
  sessionData.setup_future_usage = "off_session"  // Stripe
}
```

With:
```typescript
const sessionData: Record<string, any> = {}

if (data?.payment_method_id) {
  sessionData.payment_method_id = data.payment_method_id
}

if (data?.save_payment_method !== false) {
  sessionData.save = "1"  // Razorpay
}
```

### Step 7: Update Payment Component

Replace Stripe-specific components with Razorpay components:

**Remove:**
- `@stripe/react-stripe-js` imports
- `Elements` wrapper
- `CardElement` component

**Add:**
- Razorpay payment component (see `razorpay-payment.tsx`)
- Razorpay SDK integration

### Step 8: Update Admin Configuration

1. Go to Medusa Admin (`localhost:9000/app`)
2. Navigate to Settings > Regions
3. Edit your region
4. Remove Stripe from Payment Providers
5. Add Razorpay to Payment Providers
6. Save changes

### Step 9: Test Migration

1. **Create test account** - New customer account
2. **First purchase** - Complete payment with Razorpay
3. **Verify save** - Check Razorpay dashboard for saved method
4. **Second purchase** - Verify saved method appears
5. **Complete payment** - Use saved method successfully

## Data Migration Considerations

### Existing Saved Payment Methods

**Important:** Saved payment methods from Stripe cannot be automatically migrated to Razorpay because:

1. Payment methods are stored by the payment provider (Stripe/Razorpay)
2. Each provider has its own customer and payment method IDs
3. Security tokens are provider-specific

### Migration Strategy

**Option 1: Fresh Start (Recommended)**
- Disable Stripe, enable Razorpay
- Customers save new payment methods on next purchase
- Old Stripe methods remain in Stripe (can be deleted)

**Option 2: Parallel Operation**
- Keep both Stripe and Razorpay enabled
- Let customers choose their preferred provider
- Gradually phase out Stripe

**Option 3: Notify Customers**
- Send email notification about payment provider change
- Explain that saved methods need to be re-added
- Offer incentive for first purchase with new provider

## Rollback Plan

If you need to rollback to Stripe:

1. **Keep Stripe configuration** in a separate file
2. **Don't delete Stripe environment variables** immediately
3. **Test Razorpay thoroughly** before removing Stripe
4. **Have backup** of configuration files

Quick rollback:
```bash
# Restore Stripe configuration
# Update medusa-config.ts
# Update environment variables
# Restart backend
# Re-enable Stripe in Admin
```

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Razorpay appears in Admin payment providers
- [ ] Razorpay can be enabled in region
- [ ] Payment session initiates successfully
- [ ] First payment completes and saves method
- [ ] Saved method appears in Razorpay dashboard
- [ ] Saved method appears in checkout
- [ ] Payment with saved method completes
- [ ] Multiple saved methods work correctly
- [ ] New payment method can be added

## Common Migration Issues

### Issue: "Provider not found"
**Cause:** Razorpay provider not properly registered
**Solution:** 
- Verify `medusa-payment-razorpay` is installed
- Check configuration in `medusa-config.ts`
- Restart backend

### Issue: Payment methods not saving
**Cause:** Using Stripe's `setup_future_usage` instead of Razorpay's `save`
**Solution:** Update payment session data to use `save: "1"`

### Issue: Saved methods not appearing
**Cause:** Account holder still linked to Stripe
**Solution:** 
- Complete a new payment with Razorpay
- New account holder will be created for Razorpay

### Issue: Frontend errors
**Cause:** Stripe-specific code still present
**Solution:** 
- Remove all Stripe imports
- Update to Razorpay components
- Clear browser cache

## Performance Comparison

| Aspect | Stripe | Razorpay |
|--------|--------|----------|
| Setup Time | ~15 min | ~20 min |
| Integration Complexity | Medium | Medium |
| Payment Methods | Cards, Wallets | Cards, UPI, Wallets, NetBanking |
| India Support | Good | Excellent |
| Fees (India) | ~3% | ~2% |
| Settlement Time | T+7 | T+1 to T+3 |

## Regional Considerations

### Why Choose Razorpay for India?

1. **Local Payment Methods** - UPI, NetBanking, Wallets
2. **Lower Fees** - Typically 2% vs 3% for international providers
3. **Faster Settlement** - 1-3 days vs 7 days
4. **Better Support** - Local support team
5. **Compliance** - Built for Indian regulations
6. **Customer Preference** - Familiar to Indian customers

### When to Keep Stripe?

1. **International Customers** - Better global coverage
2. **Multi-currency** - Better currency support
3. **Existing Integration** - Already working well
4. **Subscription Billing** - More mature subscription features

## Support Resources

### Razorpay
- [Documentation](https://razorpay.com/docs/)
- [API Reference](https://razorpay.com/docs/api/)
- [Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Support](https://razorpay.com/support/)

### Medusa
- [Payment Module](https://docs.medusajs.com/resources/commerce-modules/payment)
- [Payment Providers](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider)
- [Discord Community](https://discord.gg/medusajs)

## Conclusion

Migrating from Stripe to Razorpay for saved payment methods is straightforward with Medusa's Payment Module abstraction. The main changes are:

1. Provider configuration
2. Environment variables
3. Payment session data structure
4. Frontend components

The core logic for managing saved payment methods remains the same, making the migration smooth and maintainable.

---

**Last Updated:** December 2025
**Version:** 1.0.0
