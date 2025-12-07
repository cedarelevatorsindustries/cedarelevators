# Razorpay Saved Payment Methods - Setup Checklist

Quick checklist to verify your Razorpay saved payment methods implementation.

## ✅ Backend Setup

### 1. Dependencies
- [ ] `medusa-payment-razorpay` installed in `medusa-backend/package.json`

### 2. Configuration Files
- [ ] `medusa-backend/medusa-config.ts` - Razorpay provider registered
- [ ] `medusa-backend/.env` - All Razorpay environment variables set:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `RAZORPAY_ACCOUNT`
  - `RAZORPAY_WEBHOOK_SECRET`

### 3. API Routes
- [ ] `medusa-backend/src/api/store/payment-methods/[account_holder_id]/route.ts` - Created
- [ ] `medusa-backend/src/api/middlewares.ts` - Authentication middleware added

### 4. Admin Configuration
- [ ] Razorpay enabled in at least one region via Medusa Admin

## ✅ Frontend Setup

### 1. Environment Variables
- [ ] `cedar-storefront/.env.local` - `NEXT_PUBLIC_RAZORPAY_KEY_ID` set

### 2. Data Layer
- [ ] `cedar-storefront/src/lib/data/payment.ts` - Created with types and fetch function
- [ ] `cedar-storefront/src/lib/actions/cart.ts` - Created with payment session actions

### 3. Components
- [ ] `cedar-storefront/src/modules/checkout/components/razorpay-payment.tsx` - Created
- [ ] `cedar-storefront/src/modules/checkout/sections/07-payment-method-section.tsx` - Updated with Razorpay integration

## ✅ Testing

### 1. First Purchase (Save Payment Method)
- [ ] Customer can create account
- [ ] Customer can add items to cart
- [ ] Customer can proceed to checkout
- [ ] Razorpay appears as payment option
- [ ] "Save for future use" checkbox is visible
- [ ] Payment completes successfully
- [ ] Payment method saved in Razorpay dashboard

### 2. Subsequent Purchase (Use Saved Method)
- [ ] Saved payment methods appear in checkout
- [ ] Card details display correctly (brand, last 4, expiry)
- [ ] Customer can select saved payment method
- [ ] Customer can choose to add new payment method
- [ ] Payment with saved method completes successfully

### 3. Edge Cases
- [ ] New customer sees only "Add New Payment Method"
- [ ] Unauthenticated user cannot access payment methods API
- [ ] Invalid account holder ID returns 404
- [ ] Multiple saved methods display correctly

## 🔧 Verification Commands

### Check Backend Installation
```bash
cd medusa-backend
pnpm list medusa-payment-razorpay
```

### Check Environment Variables
```bash
# Backend
cd medusa-backend
cat .env | grep RAZORPAY

# Frontend
cd cedar-storefront
cat .env.local | grep RAZORPAY
```

### Test API Route (requires running backend and auth token)
```bash
curl -X GET http://localhost:9000/store/payment-methods/{account_holder_id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

## 📝 Common Issues

### Issue: Payment methods not showing
**Solution:** 
- Verify customer is logged in
- Check account holder ID exists in payment session context
- Ensure Razorpay is enabled in the region

### Issue: "Account holder not found" error
**Solution:**
- Verify customer has made at least one payment
- Check account holder is created in Medusa database
- Ensure correct account holder ID is being passed

### Issue: Payment session not initiating
**Solution:**
- Verify Razorpay credentials in environment variables
- Check payment collection exists in cart
- Review backend logs for detailed errors

### Issue: Saved payment method not persisting
**Solution:**
- Ensure `save: "1"` is passed in payment session data
- Verify Razorpay account has saved payment methods feature enabled
- Check webhook is configured correctly

## 🚀 Next Steps

After completing this checklist:

1. **Test thoroughly** with different payment methods (cards, UPI, wallets)
2. **Monitor Razorpay dashboard** for saved payment methods
3. **Review logs** for any errors or warnings
4. **Consider enhancements** like:
   - Delete payment method functionality
   - Set default payment method
   - Payment method management page
   - Auto-select default method

## 📚 Documentation

- Full implementation guide: `docs/SAVED_PAYMENT_METHODS_RAZORPAY.md`
- Medusa Payment Module: https://docs.medusajs.com/resources/commerce-modules/payment
- Razorpay Docs: https://razorpay.com/docs/

---

**Last Updated:** December 2025
**Version:** 1.0.0
