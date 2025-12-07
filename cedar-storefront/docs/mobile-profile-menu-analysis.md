# Mobile Profile Menu Analysis & Recommendations

## Current Navigation Context

### Bottom Navigation (Always Visible)
1. **Home** - `/`
2. **Catalog** - `/catalog`
3. **Quote/Business** - `/request-quote` (label changes based on user type)
4. **Cart** - `/cart`
5. **My Cedar** - `/profile` (current page)

### Top Bar (Always Visible)
- Notifications icon (with badge count)
- Search (on scroll)
- Back button (context-aware)

### Available Profile Routes
- `/profile` - Dashboard (overview)
- `/profile/account` - Personal Info & Account Settings
- `/profile/addresses` - Manage Addresses
- `/profile/notifications` - Notification Settings
- `/profile/orders` - Order History
- `/profile/password` - Change Password
- `/profile/quotes` - My Quotes (business only)
- `/profile/verification` - Business Verification (business only)
- `/profile/wishlist` - Saved Items

### External Pages (Guest Profile)
- `/track-order` - Track Order
- `/resources` - Resources & Downloads
- `/help` - Help Center & FAQ
- `/warranty` - Warranty Information
- `/shipping` - Shipping & Delivery
- `/returns` - Return & Refund Policy
- `/privacy` - Privacy Policy
- `/terms` - Terms of Service
- `/payment-terms` - Payment Terms

---

## Issues with Current Implementation

### ❌ Problems Identified

1. **"My Profile"** - Redundant (we're already in My Cedar/Profile)
2. **"My Notifications"** - Already in top bar with badge
3. **"Account Settings"** - Too vague, overlaps with "My Profile"
4. **Missing Key Features:**
   - No quick access to addresses
   - No password change option
   - No order history quick link
   - Business users can't see quotes easily

---

## ✅ RECOMMENDED MENU STRUCTURE

### **INDIVIDUAL ACCOUNT MENU**

#### **Account Management**
1. **Edit Profile** → `/profile/account`
   - Icon: User (blue)
   - Edit name, email, phone, avatar

2. **My Addresses** → `/profile/addresses`
   - Icon: MapPin (purple)
   - Manage shipping/billing addresses

3. **Change Password** → `/profile/password`
   - Icon: Lock (gray)
   - Security settings

---

#### **Order Tools**
4. **My Orders** → `/profile/orders`
   - Icon: Package (blue)
   - View order history

5. **Track Order** → `/track-order`
   - Icon: Truck (cyan)
   - Track any order by number

6. **Saved Items** → `/profile/wishlist`
   - Icon: Heart (pink)
   - Wishlist/favorites

7. **Quick Reorder** → `/profile/orders`
   - Icon: RotateCcw (green)
   - Reorder from past orders

---

#### **Resources**
8. **Download Center** → `/resources`
   - Icon: Download (purple)
   - Catalogs, manuals, certificates

---

#### **Support & Help**
9. **Help & FAQ** → `/help`
   - Icon: HelpCircle (orange)
   - Self-service help

10. **Contact Sales** → `tel:+911234567890`
    - Icon: Phone (green)
    - Call sales team

11. **WhatsApp Support** → `https://wa.me/911234567890`
    - Icon: MessageCircle (green)
    - Chat on WhatsApp

---

#### **Policies & Information**
12. **Warranty Info** → `/warranty`
    - Icon: Shield (indigo)

13. **Shipping & Delivery** → `/shipping`
    - Icon: Truck (cyan)

14. **Returns & Refunds** → `/returns`
    - Icon: RotateCcw (amber)

---

#### **Legal**
15. **Privacy Policy** → `/privacy`
    - Icon: FileText (gray)

16. **Terms of Service** → `/terms`
    - Icon: FileText (gray)

17. **Payment Terms** → `/payment-terms`
    - Icon: FileText (gray)

---

### **BUSINESS ACCOUNT MENU**

#### **Account Management**
1. **Edit Profile** → `/profile/account`
   - Icon: User (blue)
   - Personal & business info

2. **Business Profile** → `/profile/account`
   - Icon: Building2 (purple)
   - Company details, GST, etc.

3. **Verification Status** → `/profile/verification`
   - Icon: ShieldCheck (green/red based on status)
   - Badge: "Required" if not verified
   - Upload documents, check status

4. **My Addresses** → `/profile/addresses`
   - Icon: MapPin (purple)
   - Shipping & billing addresses

5. **Change Password** → `/profile/password`
   - Icon: Lock (gray)
   - Security settings

---

#### **Business Tools**
6. **My Quotations** → `/profile/quotes`
   - Icon: FileText (orange)
   - Badge: Active quote count
   - View, manage, convert quotes

7. **Request New Quote** → `/request-quote`
   - Icon: FilePlus (orange)
   - Create new quote request

8. **Bulk Orders** → `/bulk-order` (if exists)
   - Icon: Package (indigo)
   - Upload CSV, bulk ordering

---

#### **Order Management**
9. **My Orders** → `/profile/orders`
   - Icon: Package (blue)
   - Order history & tracking

10. **Track Order** → `/track-order`
    - Icon: Truck (cyan)
    - Track by order number

11. **Saved Items** → `/profile/wishlist`
    - Icon: Heart (pink)
    - Wishlist for future quotes

12. **Quick Reorder** → `/profile/orders`
    - Icon: RotateCcw (green)
    - Reorder from history

---

#### **Resources**
13. **Download Center** → `/resources`
    - Icon: Download (purple)
    - Catalogs, price lists, certificates

---

#### **Support & Help**
14. **Help & FAQ** → `/help`
    - Icon: HelpCircle (orange)

15. **Contact Sales** → `tel:+911234567890`
    - Icon: Phone (green)

16. **WhatsApp Support** → `https://wa.me/911234567890`
    - Icon: MessageCircle (green)

---

#### **Policies & Information**
17. **Warranty Info** → `/warranty`
    - Icon: Shield (indigo)

18. **Shipping & Delivery** → `/shipping`
    - Icon: Truck (cyan)

19. **Returns & Refunds** → `/returns`
    - Icon: RotateCcw (amber)

---

#### **Legal**
20. **Privacy Policy** → `/privacy`
    - Icon: FileText (gray)

21. **Terms of Service** → `/terms`
    - Icon: FileText (gray)

22. **Payment Terms** → `/payment-terms`
    - Icon: FileText (gray)

---

## Key Differences: Individual vs Business

### Individual Account (17 items)
- ✅ Basic profile management
- ✅ Order tracking & history
- ✅ Wishlist
- ✅ Support & policies
- ❌ No quotes
- ❌ No business verification
- ❌ No bulk ordering

### Business Account (22 items)
- ✅ Everything from Individual
- ✅ **Business Profile** section
- ✅ **Verification Status** (with badge)
- ✅ **My Quotations** (with active count badge)
- ✅ **Request New Quote**
- ✅ **Bulk Orders**

---

## Visual Grouping Recommendations

### Use Section Headers (like guest profile)
```
[Profile Header with Stats]

Account Management
├─ Edit Profile
├─ Business Profile (business only)
├─ Verification Status (business only)
├─ My Addresses
└─ Change Password

Business Tools (business only)
├─ My Quotations
├─ Request New Quote
└─ Bulk Orders

Order Management
├─ My Orders
├─ Track Order
├─ Saved Items
└─ Quick Reorder

[Download Center - standalone]

Support & Help
├─ Help & FAQ
├─ Contact Sales
└─ WhatsApp Support

Policies & Information
├─ Warranty Info
├─ Shipping & Delivery
└─ Returns & Refunds

Legal
├─ Privacy Policy
├─ Terms of Service
└─ Payment Terms

[Logout Button - Red]
```

---

## Implementation Priority

### Phase 1: Core Features (Must Have)
1. Edit Profile
2. My Addresses
3. Change Password
4. My Orders
5. Track Order
6. Saved Items
7. My Quotations (business)
8. Verification Status (business)
9. Logout

### Phase 2: Support & Resources
10. Download Center
11. Help & FAQ
12. Contact Sales
13. WhatsApp Support

### Phase 3: Policies
14. Warranty Info
15. Shipping & Delivery
16. Returns & Refunds
17. Privacy Policy
18. Terms of Service
19. Payment Terms

### Phase 4: Advanced Features
20. Quick Reorder
21. Request New Quote (business)
22. Bulk Orders (business)

---

## Notes

1. **Notifications** - Already in top bar, no need in menu
2. **Dashboard** - This IS the dashboard (profile page), no need for link
3. **Account Settings** - Merged into "Edit Profile"
4. **My Profile** - Renamed to "Edit Profile" for clarity
5. **Business Profile** - Separate from personal profile for business accounts
6. **Verification** - Prominent with badge for business accounts
7. **Quotes** - Central feature for business accounts with badge count
