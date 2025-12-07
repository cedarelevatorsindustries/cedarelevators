# Quick Reference - Saved Payment Methods with Razorpay

Quick reference guide for developers working with saved payment methods.

## 🚀 Quick Setup

### 1. Install Package
```bash
cd medusa-backend
pnpm add medusa-payment-razorpay
```

### 2. Add Environment Variables

**Backend (.env):**
```bash
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_ACCOUNT=acc_xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### 3. Configure Provider

**File:** `medusa-backend/medusa-config.ts`
```typescript
modules: [
  {
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "medusa-payment-razorpay",
          id: "razorpay",
          options: {
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
            razorpay_account: process.env.RAZORPAY_ACCOUNT,
            webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
          },
        },
      ],
    },
  },
]
```

### 4. Enable in Admin
1. Go to `localhost:9000/app`
2. Settings > Regions > Edit Region
3. Add "Razorpay" to Payment Providers
4. Save

## 📁 File Structure

```
medusa-backend/
├── src/
│   └── api/
│       ├── middlewares.ts                                    # Auth middleware
│       └── store/
│           └── payment-methods/
│               └── [account_holder_id]/
│                   └── route.ts                              # List payment methods

cedar-storefront/
├── src/
│   ├── lib/
│   │   ├── data/
│   │   │   └── payment.ts                                    # Fetch functions
│   │   └── actions/
│   │       └── cart.ts                                       # Payment actions
│   └── modules/
│       └── checkout/
│           ├── components/
│           │   └── razorpay-payment.tsx                      # Payment UI
│           └── sections/
│               └── 07-payment-method-section.tsx             # Integration
```

## 🔑 Key Code Snippets

### Fetch Saved Payment Methods
```typescript
import { getSavedPaymentMethods } from '@/lib/data/payment'

const { payment_methods } = await getSavedPaymentMethods(accountHolderId)
```

### Initiate Payment Session (Saved Method)
```typescript
import { initiatePaymentSession } from '@/lib/actions/cart'

await initiatePaymentSession(cart, {
  provider_id: "razorpay",
  payment_method_id: "pm_xxxxx",
})
```

### Initiate Payment Session (New Method)
```typescript
await initiatePaymentSession(cart, {
  provider_id: "razorpay",
  save_payment_method: true,
})
```

## 🧪 Test Cards

| Card Number         | Scenario | CVV | Expiry |
|---------------------|----------|-----|--------|
| 4111 1111 1111 1111 | Success  | Any | Future |
| 4000 0000 0000 0002 | Failure  | Any | Future |
| 5104 0600 0000 0008 | 3D Secure| Any | Future |

## 🔍 Common Patterns

### Display Saved Card
```typescript
const cardData = method.data.card
return (
  <div>
    {cardData.brand} •••• {cardData.last4}
    <span>Expires {cardData.exp_month}/{cardData.exp_year}</span>
  </div>
)
```

### Check if Customer Has Saved Methods
```typescript
const hasSavedMethods = savedPaymentMethods.length > 0
```

### Handle Payment Method Selection
```typescript
const handleSelect = async (methodId: string) => {
  await initiatePaymentSession(cart, {
    provider_id: "razorpay",
    payment_method_id: methodId,
  })
  setSelectedMethod(methodId)
}
```

## 🐛 Quick Debugging

### Check if Razorpay is Installed
```bash
cd medusa-backend
pnpm list medusa-payment-razorpay
```

### Check Environment Variables
```bash
# Backend
cat medusa-backend/.env | grep RAZORPAY

# Frontend
cat cedar-storefront/.env.local | grep RAZORPAY
```

### Test API Endpoint
```bash
curl http://localhost:9000/store/payment-methods/{account_holder_id} \
  -H "Authorization: Bearer {token}"
```

### Check Backend Logs
```bash
cd medusa-backend
pnpm dev
# Watch for errors related to payment or Razorpay
```

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Payment methods not showing | Verify customer is authenticated and has account holder |
| "Provider not found" | Check Razorpay is installed and configured |
| Payment not saving | Ensure `save: "1"` is passed in session data |
| 401 Unauthorized | Check authentication middleware is configured |

## 📊 Data Flow

```
Customer selects Razorpay
         ↓
RazorpayPayment component
         ↓
getSavedPaymentMethods(accountHolderId)
         ↓
Backend API: /store/payment-methods/:id
         ↓
Payment Module: listPaymentMethods()
         ↓
Razorpay Provider
         ↓
Return saved methods
         ↓
Display in UI
         ↓
Customer selects method
         ↓
initiatePaymentSession(cart, { payment_method_id })
         ↓
Complete payment
```

## 🔗 Quick Links

- **Full Guide:** [SAVED_PAYMENT_METHODS_RAZORPAY.md](./SAVED_PAYMENT_METHODS_RAZORPAY.md)
- **Checklist:** [RAZORPAY_SETUP_CHECKLIST.md](./RAZORPAY_SETUP_CHECKLIST.md)
- **Migration:** [STRIPE_TO_RAZORPAY_MIGRATION.md](./STRIPE_TO_RAZORPAY_MIGRATION.md)
- **Overview:** [PAYMENT_FEATURES.md](./PAYMENT_FEATURES.md)

## 📝 Type Definitions

```typescript
type SavedPaymentMethod = {
  id: string
  provider_id: string
  data: {
    card?: {
      brand: string
      last4: string
      exp_month: number
      exp_year: number
    }
    bank?: string
    wallet?: string
    type: string
  }
}

type PaymentSessionData = {
  provider_id?: string
  payment_method_id?: string
  save_payment_method?: boolean
}
```

## 🎯 Next Steps

1. ✅ Complete setup using checklist
2. 🧪 Test with test cards
3. 📖 Read full implementation guide
4. 🚀 Deploy to production
5. 📊 Monitor Razorpay dashboard

---

**Quick Help:** For detailed information, see [PAYMENT_FEATURES.md](./PAYMENT_FEATURES.md)
