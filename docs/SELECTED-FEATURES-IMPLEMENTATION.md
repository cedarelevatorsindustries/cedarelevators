# 🎯 Selected Features Implementation Plan

## Features to Implement

### ✅ COMPLETED

1. **Payment Methods** (Business Verified Only)
   - ✅ Created: `payment-methods-section.tsx`
   - Features: Save cards, bank accounts, UPI, set default

2. **Invoice Management** (Business Verified Only)
   - ✅ Created: `invoices-section.tsx`
   - Features: View invoices, download PDF, payment status, GST details

3. **Notification Preferences**
   - ✅ Already exists: `notifications-section.tsx`
   - Features: Email/SMS/Push toggles, granular control

---

### 🔄 IN PROGRESS

4. **Move to Cart (All Items)** from Wishlist
   - Location: Wishlist section
   - Feature: Bulk add all wishlist items to cart

5. **Enhanced Address Book**
   - Implement: Address labels, default addresses
   - Skip: Address validation, Google Maps, Delivery instructions

6. **Security Settings**
   - Implement: Two-factor authentication, Privacy settings
   - Skip: Login history, Active sessions, Trusted devices, Security alerts

7. **Business Documents** (Business Only)
   - Implement: GST certificate, PAN card, Business license, Re-upload
   - Skip: Trade license, Bank statements, Document expiry alerts

---

## Implementation Status

| Feature | Status | File | Notes |
|---------|--------|------|-------|
| Payment Methods | ✅ Done | payment-methods-section.tsx | Business verified only |
| Invoice Management | ✅ Done | invoices-section.tsx | Business verified only |
| Notification Preferences | ✅ Exists | notifications-section.tsx | Already comprehensive |
| Move to Cart | 🔄 Next | wishlist-section.tsx | Add bulk action |
| Enhanced Address Book | 🔄 Next | addresses-section.tsx | Add labels & defaults |
| Security Settings | 🔄 Next | security-section.tsx | New file needed |
| Business Documents | 🔄 Next | business-documents-section.tsx | New file needed |

---

## Next Steps

1. Update wishlist section with "Move All to Cart" button
2. Enhance addresses section with labels and default selection
3. Create security settings section with 2FA
4. Create business documents section
5. Update mobile menu to include new sections
6. Add routes for new pages
7. Test all features

---

## Menu Updates Needed

### My Cedar Mobile Menu

Add to Account Management:
- Security Settings

Add to Business Section (Business Only):
- Payment Methods (Verified only)
- Invoices (Verified only)
- Business Documents

Keep existing:
- Edit Profile
- Business Profile
- Verification Status
- My Addresses
- Change Password
- Notification Preferences (already in menu via /profile/notifications)

---

## Routes to Add

```
/profile/payment-methods  → Payment Methods Section
/profile/invoices         → Invoice Management Section
/profile/security         → Security Settings Section
/profile/documents        → Business Documents Section
```

Existing routes:
```
/profile/notifications    → Notification Preferences (already exists)
/profile/wishlist         → Wishlist (needs enhancement)
/profile/addresses        → Addresses (needs enhancement)
```
