# Saved Payment Methods with Razorpay - Implementation Guide

This guide documents the implementation of saved payment methods using Razorpay in the Cedar Storefront application, based on the official Medusa tutorial but adapted for Razorpay instead of Stripe.

## Overview

This implementation allows customers to:
- Save their payment methods (cards, UPI, wallets) during checkout
- View and select saved payment methods for future purchases
- Add new payment methods while viewing saved ones
- Securely process payments through Razorpay

## Architecture

### Backend Components

#### 1. Razorpay Payment Provider Configuration
**File:** `medusa-backend/medusa-config.ts`

The Razorpay payment provider is registered in the Payment Module:

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
            automatic_expiry_period: 30,
            manual_expiry_period: 20,
            refund_speed: "normal",
            webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
          },
        },
      ],
    },
  },
]
```

#### 2. API Route for Listing Payment Methods
**File:** `medusa-backend/src/api/store/payment-methods/[account_holder_id]/route.ts`

This API route retrieves saved payment methods for an authenticated customer:

```typescript
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { account_holder_id } = req.params
  const query = req.scope.resolve("query")
  const paymentModuleService = req.scope.resolve("payment")

  // Retrieve account holder
  const { data: [accountHolder] } = await query.graph({
    entity: "account_holder",
    fields: ["data", "provider_id"],
    filters: { id: account_holder_id },
  })

  if (!accountHolder) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Account holder not found")
  }

  // List payment methods from Razorpay
  const paymentMethods = await paymentModuleService.listPaymentMethods({
    provider_id: accountHolder.provider_id,
    context: {
      account_holder: {
        data: { id: accountHolder.data.id },
      },
    },
  })

  res.json({ payment_methods: paymentMethods })
}
```

#### 3. Authentication Middleware
**File:** `medusa-backend/src/api/middlewares.ts`

Protects the payment methods API route to ensure only authenticated customers can access it:

```typescript
export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/payment-methods/:account_holder_id",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
  ],
})
```

### Frontend Components

#### 1. Payment Data Functions
**File:** `cedar-storefront/src/lib/data/payment.ts`

Defines types and functions for fetching saved payment methods:

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
    bank?: string
    wallet?: string
    type: string
  }
}

export async function getSavedPaymentMethods(
  accountHolderId: string
): Promise<SavedPaymentMethodsResponse> {
  return sdk.client.fetch<SavedPaymentMethodsResponse>(
    `/store/payment-methods/${accountHolderId}`,
    {
      method: "GET",
      credentials: "include",
    }
  )
}
```

#### 2. Cart Actions
**File:** `cedar-storefront/src/lib/actions/cart.ts`

Handles payment session initialization with support for saved payment methods:

```typescript
export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data?: {
    provider_id?: string
    payment_method_id?: string
    save_payment_method?: boolean
  }
) {
  const sessionData: Record<string, any> = {}

  // If using a saved payment method
  if (data?.payment_method_id) {
    sessionData.payment_method_id = data.payment_method_id
  }

  // If saving payment method for future use
  if (data?.save_payment_method !== false) {
    sessionData.save = "1"
  }

  return sdk.store.payment.initiatePaymentSession(paymentCollectionId, {
    provider_id: data?.provider_id || "razorpay",
    data: sessionData,
  })
}
```

#### 3. Razorpay Payment Component
**File:** `cedar-storefront/src/modules/checkout/components/razorpay-payment.tsx`

Displays saved payment methods and allows selection or adding new methods:

Key features:
- Fetches saved payment methods on mount
- Displays cards with brand, last 4 digits, and expiry
- Supports UPI and wallet payment methods
- Allows switching between saved and new payment methods
- Shows "Save for future use" checkbox for new methods

#### 4. Payment Method Section
**File:** `cedar-storefront/src/modules/checkout/sections/07-payment-method-section.tsx`

Integrates the Razorpay payment component into the checkout flow:

```typescript
{isSelected && method.type === 'razorpay' && cart && (
  <div className="mt-3 ml-4">
    <RazorpayPayment
      cart={cart}
      paymentSession={paymentSession}
      onPaymentMethodSelect={handlePaymentMethodSelect}
      onNewCardSelect={handleNewCardSelect}
    />
  </div>
)}
```

## Environment Variables

### Backend (.env)
```bash
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_ACCOUNT=your_razorpay_account_id
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Backend
cd medusa-backend
pnpm add medusa-payment-razorpay

# Frontend (if needed)
cd cedar-storefront
pnpm add razorpay
```

### 2. Configure Razorpay

1. Create a Razorpay account at https://razorpay.com
2. Get your API keys from Dashboard > Settings > API Keys
3. Add the keys to your environment variables

### 3. Enable Razorpay in Region

1. Start the Medusa backend: `pnpm dev`
2. Go to `localhost:9000/app` and log in
3. Navigate to Settings > Regions
4. Select your region
5. Edit the region and add "Razorpay" to Payment Providers
6. Save changes

### 4. Test the Implementation

1. Start both backend and frontend
2. Create a customer account
3. Add products to cart and proceed to checkout
4. Select Razorpay as payment method
5. Complete a payment (use Razorpay test cards)
6. On next purchase, you'll see the saved payment method

## Razorpay Test Cards

For testing, use these Razorpay test card numbers:

- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002
- **3D Secure:** 5104 0600 0000 0008

CVV: Any 3 digits
Expiry: Any future date

## Key Differences from Stripe Implementation

1. **Provider Name:** Uses `medusa-payment-razorpay` instead of Stripe provider
2. **Configuration:** Different options structure for Razorpay
3. **Payment Method Data:** Razorpay returns different data structures for cards, UPI, and wallets
4. **Save Parameter:** Uses `save: "1"` instead of `setup_future_usage`
5. **Account Holder:** Razorpay uses customer_id in account holder data

## Security Considerations

1. **Authentication:** Payment methods API is protected with customer authentication
2. **Credentials:** All API calls include credentials for session management
3. **Environment Variables:** Sensitive keys are stored in environment variables
4. **Webhook Secret:** Used to verify webhook authenticity from Razorpay

## Future Enhancements

1. **Delete Payment Methods:** Add API route to delete saved payment methods
2. **Set Default:** Allow customers to set a default payment method
3. **Payment Method Management:** Create a dedicated page for managing payment methods
4. **Auto-select:** Automatically select the default payment method during checkout
5. **Payment Method Icons:** Add brand-specific icons for better UX

## Troubleshooting

### Payment methods not showing
- Verify customer is authenticated
- Check account holder ID is present in payment session
- Ensure Razorpay is enabled in the region

### Payment session not initiating
- Verify Razorpay credentials are correct
- Check payment collection exists in cart
- Review backend logs for errors

### Saved payment method not working
- Ensure `save: "1"` is passed during payment
- Verify Razorpay account has saved payment methods enabled
- Check webhook configuration for payment confirmations

## References

- [Medusa Payment Module Documentation](https://docs.medusajs.com/resources/commerce-modules/payment)
- [Razorpay Payment Gateway Documentation](https://razorpay.com/docs/)
- [Medusa API Routes](https://docs.medusajs.com/learn/fundamentals/api-routes)
- [Original Stripe Tutorial](https://docs.medusajs.com/resources/how-to-tutorials/tutorials/saved-payment-methods)
