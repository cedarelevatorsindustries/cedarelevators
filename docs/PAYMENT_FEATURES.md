# Payment Features Documentation

## Overview

The Cedar Storefront implements a comprehensive payment system with support for multiple payment methods, including saved payment methods for returning customers using Razorpay.

## Supported Payment Methods

### 1. Razorpay (Online Payment)
- **UPI** - Instant payment via UPI apps
- **Cards** - Credit/Debit cards (Visa, Mastercard, RuPay, Amex)
- **NetBanking** - Direct bank transfers
- **Wallets** - Digital wallets (Paytm, PhonePe, etc.)

### 2. Credit Terms (B2B)
- **30-Day Credit** - Available for verified dealers
- **Purchase Order Upload** - Upload company PO for processing

### 3. Bank Transfer
- **NEFT/RTGS** - Direct bank transfer with manual verification

## Saved Payment Methods

### Feature Overview

Returning customers can save their payment methods during checkout and reuse them for future purchases, providing:
- **Faster checkout** - No need to re-enter payment details
- **Secure storage** - Payment methods stored securely by Razorpay
- **Multiple methods** - Save and manage multiple payment methods
- **Easy selection** - Quick selection during checkout

### How It Works

#### First Purchase
1. Customer proceeds to checkout
2. Selects Razorpay as payment method
3. "Save for future use" checkbox is checked by default
4. Completes payment with card/UPI/wallet
5. Payment method is securely saved by Razorpay

#### Subsequent Purchases
1. Customer proceeds to checkout
2. Selects Razorpay as payment method
3. Sees list of saved payment methods
4. Can either:
   - Select a saved payment method
   - Add a new payment method
5. Completes payment

### Supported Saved Methods

- **Cards** - Displays brand, last 4 digits, expiry date
- **UPI** - Displays UPI ID or linked account
- **Wallets** - Displays wallet name

### Security

- Payment methods are stored by Razorpay, not in our database
- Only authenticated customers can access saved methods
- Account holder system links customers to Razorpay
- All API calls are authenticated and encrypted

## Implementation Details

### Backend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Medusa Backend                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Payment Module                            │  │
│  │  - Manages payment sessions                       │  │
│  │  - Handles account holders                        │  │
│  │  - Interfaces with providers                      │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                                │
│                         ▼                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Razorpay Payment Provider                      │  │
│  │  - Processes payments                             │  │
│  │  - Saves payment methods                          │  │
│  │  - Retrieves saved methods                        │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                                │
└─────────────────────────┼────────────────────────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │   Razorpay    │
                  │   Platform    │
                  └───────────────┘
```

### API Endpoints

#### List Saved Payment Methods
```
GET /store/payment-methods/:account_holder_id
```
- **Authentication:** Required (customer session)
- **Returns:** Array of saved payment methods
- **Response:**
```json
{
  "payment_methods": [
    {
      "id": "pm_xxx",
      "provider_id": "razorpay",
      "data": {
        "card": {
          "brand": "visa",
          "last4": "4242",
          "exp_month": 12,
          "exp_year": 2025
        },
        "type": "card"
      }
    }
  ]
}
```

#### Initiate Payment Session
```
POST /store/payment-collections/:id/payment-sessions
```
- **Body:**
```json
{
  "provider_id": "razorpay",
  "data": {
    "payment_method_id": "pm_xxx",  // For saved method
    "save": "1"                      // To save new method
  }
}
```

### Frontend Components

#### RazorpayPayment Component
**Location:** `src/modules/checkout/components/razorpay-payment.tsx`

Displays saved payment methods and handles selection:
- Fetches saved methods on mount
- Shows card/UPI/wallet details
- Allows switching between saved and new methods
- Handles payment session initialization

#### Payment Method Section
**Location:** `src/modules/checkout/sections/07-payment-method-section.tsx`

Main checkout payment section that:
- Lists all available payment methods
- Integrates Razorpay component
- Handles method selection
- Shows method-specific UI (PO upload, bank details, etc.)

### Data Flow

```
Customer selects Razorpay
         │
         ▼
RazorpayPayment component loads
         │
         ▼
Fetch saved payment methods
         │
         ├─── Has saved methods ──► Display list
         │                           │
         │                           ├─── Select saved ──► Initiate session with method_id
         │                           │
         │                           └─── Add new ──► Initiate session with save=1
         │
         └─── No saved methods ──► Show "Add New" only
                                    │
                                    └─── Initiate session with save=1
```

## Configuration

### Environment Variables

#### Backend (.env)
```bash
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_ACCOUNT=acc_xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### Medusa Configuration

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

## Testing

### Test Cards (Razorpay)

| Card Number         | Scenario        | CVV | Expiry      |
|---------------------|-----------------|-----|-------------|
| 4111 1111 1111 1111 | Success         | Any | Any future  |
| 4000 0000 0000 0002 | Failure         | Any | Any future  |
| 5104 0600 0000 0008 | 3D Secure       | Any | Any future  |

### Test UPI
- Use any UPI ID format: `test@paytm`
- All test UPI payments will succeed in test mode

### Testing Saved Payment Methods

1. **First Purchase:**
   - Create customer account
   - Add items to cart
   - Proceed to checkout
   - Select Razorpay
   - Complete payment with test card
   - Verify "Save for future use" was checked

2. **Verify in Razorpay Dashboard:**
   - Go to Customers section
   - Find the customer
   - Check Payment Methods section
   - Verify method is saved

3. **Second Purchase:**
   - Login with same customer
   - Add items to cart
   - Proceed to checkout
   - Select Razorpay
   - Verify saved payment method appears
   - Select saved method
   - Complete payment

## Troubleshooting

### Common Issues

#### 1. Saved methods not appearing
**Symptoms:** Customer doesn't see saved payment methods

**Solutions:**
- Verify customer is logged in
- Check account holder exists in payment session
- Ensure Razorpay is enabled in region
- Verify customer has completed at least one payment

#### 2. Payment method not saving
**Symptoms:** Payment completes but method not saved

**Solutions:**
- Verify `save: "1"` is passed in payment session data
- Check Razorpay account has saved methods enabled
- Review webhook configuration
- Check backend logs for errors

#### 3. Authentication errors
**Symptoms:** 401 Unauthorized when fetching payment methods

**Solutions:**
- Verify customer session is valid
- Check authentication middleware is configured
- Ensure credentials are included in API calls

## Future Enhancements

### Planned Features

1. **Payment Method Management Page**
   - View all saved payment methods
   - Delete unwanted methods
   - Set default payment method
   - Update billing details

2. **Auto-select Default**
   - Automatically select default payment method
   - Skip selection step for returning customers
   - One-click checkout experience

3. **Payment Method Verification**
   - Verify cards before saving
   - Send verification charges
   - Confirm UPI IDs

4. **Enhanced Security**
   - CVV re-entry for saved cards
   - OTP verification for high-value transactions
   - Fraud detection integration

5. **Analytics**
   - Track saved method usage
   - Monitor payment success rates
   - Analyze preferred payment methods

## Related Documentation

- [Saved Payment Methods Implementation Guide](./SAVED_PAYMENT_METHODS_RAZORPAY.md)
- [Setup Checklist](./RAZORPAY_SETUP_CHECKLIST.md)
- [Medusa Payment Module](https://docs.medusajs.com/resources/commerce-modules/payment)
- [Razorpay Documentation](https://razorpay.com/docs/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs for detailed errors
3. Check Razorpay dashboard for payment status
4. Refer to Medusa and Razorpay documentation

---

**Last Updated:** December 2025
**Version:** 1.0.0
