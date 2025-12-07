# Troubleshooting Guide - Saved Payment Methods

Common issues and solutions for the Razorpay saved payment methods implementation.

## 🔍 Quick Diagnostics

Run these checks first:

```bash
# 1. Check if Razorpay provider is installed
cd medusa-backend
pnpm list medusa-payment-razorpay

# 2. Verify environment variables
cat .env | grep RAZORPAY

# 3. Check if backend is running
curl http://localhost:9000/health

# 4. Check if frontend is running
curl http://localhost:3000
```

## ❌ Common Issues

### 1. Payment Methods Not Showing

**Symptoms:**
- Customer sees only "Add New Payment Method"
- Saved methods don't appear in checkout
- Empty list returned from API

**Possible Causes & Solutions:**

#### A. Customer Not Authenticated
```bash
# Check if customer session exists
# In browser console:
document.cookie
# Should see session cookie
```

**Solution:**
- Ensure customer is logged in
- Check authentication middleware is configured
- Verify session cookie is being sent

#### B. No Account Holder
```bash
# Check if account holder exists
# In Medusa Admin or database:
SELECT * FROM account_holder WHERE customer_id = 'cus_xxx';
```

**Solution:**
- Customer needs to complete at least one payment
- Account holder is created automatically on first payment
- Verify payment was successful

#### C. No Saved Methods in Razorpay
**Solution:**
- Check Razorpay dashboard > Customers
- Verify customer has saved payment methods
- Ensure `save: "1"` was passed during payment

#### D. Wrong Account Holder ID
```typescript
// Check payment session context
console.log(paymentSession?.context?.account_holder)
// Should have an 'id' property
```

**Solution:**
- Verify account holder ID is in payment session
- Check payment session is properly initialized
- Ensure cart has payment collection

---

### 2. "Provider Not Found" Error

**Symptoms:**
- Error: "Payment provider 'razorpay' not found"
- Backend fails to start
- Payment session initialization fails

**Possible Causes & Solutions:**

#### A. Package Not Installed
```bash
cd medusa-backend
pnpm list medusa-payment-razorpay
# Should show version number
```

**Solution:**
```bash
pnpm add medusa-payment-razorpay
```

#### B. Configuration Error
Check `medusa-backend/medusa-config.ts`:
```typescript
// Should have:
{
  resolve: "medusa-payment-razorpay",  // Not "@medusajs/medusa/payment-razorpay"
  id: "razorpay",
  options: { /* ... */ }
}
```

**Solution:**
- Fix configuration syntax
- Restart backend: `pnpm dev`

#### C. Not Enabled in Region
**Solution:**
1. Go to Medusa Admin: `localhost:9000/app`
2. Settings > Regions > Edit Region
3. Add "Razorpay" to Payment Providers
4. Save changes

---

### 3. Payment Method Not Saving

**Symptoms:**
- Payment completes successfully
- But method doesn't appear in next checkout
- Razorpay dashboard shows no saved methods

**Possible Causes & Solutions:**

#### A. Missing Save Parameter
Check payment session data:
```typescript
// Should have:
{
  provider_id: "razorpay",
  data: {
    save: "1"  // This is required!
  }
}
```

**Solution:**
Update `initiatePaymentSession` call:
```typescript
await initiatePaymentSession(cart, {
  provider_id: "razorpay",
  save_payment_method: true,  // This adds save: "1"
})
```

#### B. Razorpay Account Settings
**Solution:**
- Check Razorpay dashboard settings
- Ensure "Save Card Details" is enabled
- Verify account has this feature enabled

#### C. Test Mode Limitations
**Solution:**
- Some test cards may not support saving
- Try different test card numbers
- Check Razorpay test mode documentation

---

### 4. 401 Unauthorized Error

**Symptoms:**
- Error when fetching payment methods
- "Unauthorized" or "Authentication required"
- API returns 401 status code

**Possible Causes & Solutions:**

#### A. Missing Authentication Middleware
Check `medusa-backend/src/api/middlewares.ts`:
```typescript
{
  matcher: "/store/payment-methods/:account_holder_id",
  middlewares: [authenticate("customer", ["session", "bearer"])],
}
```

**Solution:**
- Add authentication middleware
- Restart backend

#### B. Invalid Session
```bash
# Check session in browser console
document.cookie
# Should see valid session cookie
```

**Solution:**
- Customer needs to log in again
- Clear cookies and re-authenticate
- Check session expiry settings

#### C. CORS Issues
Check `medusa-backend/.env`:
```bash
STORE_CORS=http://localhost:3000,http://localhost:8000
```

**Solution:**
- Add frontend URL to STORE_CORS
- Restart backend
- Clear browser cache

---

### 5. 404 Not Found Error

**Symptoms:**
- Error: "Account holder not found"
- API returns 404 status code
- Valid customer but no account holder

**Possible Causes & Solutions:**

#### A. Account Holder Not Created
**Solution:**
- Customer needs to complete a payment first
- Account holder is created automatically
- Verify payment was successful

#### B. Wrong Account Holder ID
```typescript
// Check what ID is being passed
console.log(accountHolderId)
// Should be a valid UUID
```

**Solution:**
- Verify account holder ID from payment session
- Check payment session context structure
- Ensure cart has payment collection

---

### 6. Payment Session Not Initiating

**Symptoms:**
- Error when calling `initiatePaymentSession`
- Payment session undefined
- Cannot proceed with payment

**Possible Causes & Solutions:**

#### A. No Payment Collection
```typescript
// Check cart
console.log(cart.payment_collection)
// Should not be null/undefined
```

**Solution:**
- Ensure cart has payment collection
- Payment collection created automatically
- Check cart is properly loaded

#### B. Invalid Provider ID
```typescript
// Should be:
provider_id: "razorpay"  // Not "stripe" or other
```

**Solution:**
- Use correct provider ID
- Match ID in medusa-config.ts

#### C. Missing Environment Variables
```bash
# Check backend .env
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET
```

**Solution:**
- Add all required environment variables
- Restart backend after adding

---

### 7. Frontend Component Not Rendering

**Symptoms:**
- RazorpayPayment component doesn't show
- Blank space where component should be
- No errors in console

**Possible Causes & Solutions:**

#### A. Missing Props
```typescript
// Check all required props are passed:
<RazorpayPayment
  cart={cart}                    // Required
  paymentSession={paymentSession} // Required
  onPaymentMethodSelect={handler} // Required
  onNewCardSelect={handler}       // Required
/>
```

**Solution:**
- Pass all required props
- Check props are not undefined

#### B. Cart or Payment Session Undefined
```typescript
// Add conditional rendering:
{cart && paymentSession && (
  <RazorpayPayment ... />
)}
```

**Solution:**
- Ensure cart is loaded before rendering
- Check payment session exists

#### C. Import Error
```typescript
// Check import path
import RazorpayPayment from '../components/razorpay-payment'
// Should match actual file location
```

**Solution:**
- Verify import path is correct
- Check file exists at that location

---

### 8. Saved Method Selection Not Working

**Symptoms:**
- Can see saved methods
- But clicking doesn't select them
- No payment session initiated

**Possible Causes & Solutions:**

#### A. Handler Not Connected
```typescript
// Check handler is passed and called:
const handlePaymentMethodSelect = async (methodId: string | null) => {
  // Should call initiatePaymentSession
  await initiatePaymentSession(cart, {
    provider_id: "razorpay",
    payment_method_id: methodId,
  })
}
```

**Solution:**
- Ensure handler is properly defined
- Check handler is passed to component
- Verify handler is called on click

#### B. Cart Not Available
```typescript
// Check cart is available in handler
if (!cart) {
  console.error("Cart not available")
  return
}
```

**Solution:**
- Ensure cart is passed to component
- Check cart is loaded before interaction

---

### 9. Multiple Payment Methods Not Displaying

**Symptoms:**
- Only one payment method shows
- Customer has multiple saved methods
- Razorpay dashboard shows all methods

**Possible Causes & Solutions:**

#### A. API Returning Limited Results
```typescript
// Check API response
const { payment_methods } = await getSavedPaymentMethods(accountHolderId)
console.log(payment_methods.length)
```

**Solution:**
- Check API route returns all methods
- Verify no filtering is applied
- Check Razorpay API limits

#### B. Component State Issue
```typescript
// Check state is updated correctly
useEffect(() => {
  getSavedPaymentMethods(accountHolderId)
    .then(({ payment_methods }) => {
      console.log("Setting methods:", payment_methods)
      setSavedPaymentMethods(payment_methods)
    })
}, [accountHolderId])
```

**Solution:**
- Verify state is updated
- Check useEffect dependencies
- Ensure no race conditions

---

### 10. Payment Completion Fails

**Symptoms:**
- Payment initiated successfully
- But completion fails
- Order not created

**Possible Causes & Solutions:**

#### A. Invalid Payment Method ID
```typescript
// Check payment method ID is valid
console.log(selectedPaymentMethod)
// Should be a valid Razorpay payment method ID
```

**Solution:**
- Verify payment method ID is correct
- Check method still exists in Razorpay
- Try with a different saved method

#### B. Expired Payment Method
**Solution:**
- Check card expiry date
- Remove expired methods
- Use valid payment method

#### C. Insufficient Funds (Test Mode)
**Solution:**
- Use different test card
- Check Razorpay test card documentation
- Verify test mode is enabled

---

## 🔧 Debugging Tools

### Backend Logging
Add logging to API route:
```typescript
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  console.log("Fetching payment methods for:", req.params.account_holder_id)
  
  // ... existing code ...
  
  console.log("Found account holder:", accountHolder)
  console.log("Payment methods:", paymentMethods)
  
  res.json({ payment_methods: paymentMethods })
}
```

### Frontend Logging
Add logging to component:
```typescript
useEffect(() => {
  console.log("Account holder ID:", accountHolderId)
  
  getSavedPaymentMethods(accountHolderId)
    .then(({ payment_methods }) => {
      console.log("Received methods:", payment_methods)
      setSavedPaymentMethods(payment_methods)
    })
    .catch((error) => {
      console.error("Error fetching methods:", error)
    })
}, [accountHolderId])
```

### Network Inspection
Use browser DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "payment-methods"
4. Check request/response
5. Verify status code and data

### Database Inspection
Check account holders:
```sql
-- List all account holders
SELECT * FROM account_holder;

-- Find account holder for customer
SELECT * FROM account_holder WHERE customer_id = 'cus_xxx';

-- Check account holder data
SELECT id, customer_id, provider_id, data FROM account_holder;
```

---

## 📞 Getting Help

### 1. Check Documentation
- [Payment Features](./PAYMENT_FEATURES.md)
- [Implementation Guide](./SAVED_PAYMENT_METHODS_RAZORPAY.md)
- [Setup Checklist](./RAZORPAY_SETUP_CHECKLIST.md)

### 2. Check Logs
- Backend: Terminal running `pnpm dev`
- Frontend: Browser console (F12)
- Razorpay: Dashboard > Logs

### 3. Verify Setup
- Run through [Setup Checklist](./RAZORPAY_SETUP_CHECKLIST.md)
- Check all environment variables
- Verify all files are created

### 4. Test with Curl
```bash
# Test API endpoint
curl -X GET http://localhost:9000/store/payment-methods/{account_holder_id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### 5. Check Razorpay Dashboard
- Go to https://dashboard.razorpay.com
- Check Customers section
- Verify payment methods are saved
- Review payment logs

---

## ✅ Prevention Checklist

Before deploying:
- [ ] All environment variables set
- [ ] Razorpay provider installed
- [ ] Configuration correct
- [ ] Razorpay enabled in region
- [ ] Authentication middleware configured
- [ ] All files created
- [ ] No TypeScript errors
- [ ] Tested with test cards
- [ ] Verified in Razorpay dashboard
- [ ] Checked browser console for errors
- [ ] Reviewed backend logs
- [ ] Tested multiple scenarios

---

**Last Updated:** December 2025
**Version:** 1.0.0
