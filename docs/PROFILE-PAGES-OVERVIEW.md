# Cedar Elevators - Profile Pages Complete Overview

**Last Updated**: December 28, 2025  
**Version**: 1.0  
**Coverage**: Individual, Business Unverified, Business Verified  
**Platforms**: Mobile & Desktop

---

## Table of Contents

1. [Profile Page Structure](#profile-page-structure)
2. [Individual User Profile](#individual-user-profile)
3. [Business User Profile (Unverified)](#business-user-profile-unverified)
4. [Business User Profile (Verified)](#business-user-profile-verified)
5. [Mobile vs Desktop Layout](#mobile-vs-desktop-layout)
6. [Profile Sections Detailed](#profile-sections-detailed)
7. [Navigation Structure](#navigation-structure)
8. [Components Breakdown](#components-breakdown)

---

## 1. Profile Page Structure

### 1.1 URL & Route
```
/profile
```

### 1.2 Layout Components

**Desktop Layout**:
```
┌─────────────────────────────────────────────────┐
│  [Navbar - Persistent]                          │
├───────────┬─────────────────────────────────────┤
│           │                                     │
│ Sidebar   │  Main Content Area                  │
│ (Fixed)   │  (Scrollable)                       │
│  256px    │                                     │
│           │  - Active Section Content           │
│  - User   │  - Dashboard/Personal Info/etc.     │
│    Card   │                                     │
│  - Nav    │                                     │
│    Menu   │                                     │
│  - Logout │                                     │
│           │                                     │
└───────────┴─────────────────────────────────────┘
```

**Mobile Layout**:
```
┌─────────────────────────────────┐
│  [Top Bar]                      │
│  ≡  Profile  [Avatar]           │
├─────────────────────────────────┤
│                                 │
│  Main Content (Full Width)      │
│  - Active Section               │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│  [Bottom Navigation - Fixed]    │
│  Home | Cat | Quote | ♡ | You  │
└─────────────────────────────────┘
```

### 1.3 Core Features by User Type

| Feature | Individual | Business Unverified | Business Verified |
|---------|-----------|---------------------|-------------------|
| **Dashboard** | ✅ | ✅ | ✅ |
| **Personal Info** | ✅ | ✅ | ✅ |
| **Addresses** | ✅ | ✅ | ✅ |
| **Password** | ✅ | ✅ | ✅ |
| **Order History** | ✅ | ✅ | ✅ |
| **Quotes** | ✅ | ✅ | ✅ |
| **Wishlist** | ✅ | ✅ | ✅ |
| **Security Settings** | ✅ | ✅ | ✅ |
| **Notifications** | ✅ | ✅ | ✅ |
| **Business Info** | ❌ | ✅ | ✅ |
| **Verification** | ❌ | ✅ (Required) | ✅ (View Only) |
| **Business Documents** | ❌ | ✅ | ✅ |
| **Payment Methods** | ❌ | ❌ | ✅ |
| **Invoices** | ❌ | ❌ | ✅ |

---

## 2. Individual User Profile

### 2.1 Navigation Menu (Sidebar/Mobile)

#### **Account Group**
1. **Dashboard** 🏠
   - Stats overview
   - Recent activity
   - Quick actions
2. **Personal Info** 👤
   - Edit personal details
3. **Addresses** 📍
   - Manage delivery addresses
4. **Change Password** 🔒
   - Update password

#### **Orders & Quotes Group**
5. **Order History** 📦
   - View all orders
   - Reorder
   - Track status
6. **My Quotes** 📄
   - View quote requests
   - Quote timeline
7. **Wishlist** ❤️
   - Saved products

#### **Settings Group**
8. **Security Settings** 🛡️
   - Two-factor auth (future)
   - Login history
9. **Notifications** 🔔
   - Email preferences
   - Push notifications

#### **Bottom Actions**
- **Help Center** ❓
- **Logout** 🚪

---

### 2.2 Dashboard Section (Individual)

#### **Desktop View**

**User Header Card**:
```
┌──────────────────────────────────────────────┐
│  [Avatar]  John Doe                          │
│  80x80     john.doe@email.com                │
│            [Individual Account]              │
└──────────────────────────────────────────────┘
```

**Quick Stats** (4 cards, 2×2 grid on desktop):
```
┌──────────┬──────────┬──────────┬──────────┐
│   📦     │    📄    │    ❤️    │    💰    │
│  Total   │  Total   │  Saved   │  Total   │
│  Orders  │  Quotes  │  Items   │  Spent   │
│    5     │    2     │    12    │  ₹45,000 │
└──────────┴──────────┴──────────┴──────────┘
```

**Quick Actions** (4 buttons, grid layout):
1. **Request Quote** (Disabled for individual)
   - Gray background
   - "Upgrade to business" tooltip
2. **Browse Products** (Enabled)
   - Link to catalog
3. **Track Orders** (Enabled)
   - Opens order history
4. **View Wishlist** (Enabled)
   - Opens wishlist section

**Recent Orders Table**:
- Shows last 5 orders
- Columns: Order ID, Date, Total, Status, Actions
- Actions: View Details, Reorder, Download Invoice

**Recent Activity Feed**:
- Timeline of recent events
- Product views, cart additions, quote requests
- Timestamps (Today, Yesterday, X days ago)

**Saved Items Preview**:
- Grid of 6 saved products
- "View Full Wishlist" link

**Help Section**:
- Contact Support button
- Help Center link

**Recommended Products** (Bottom):
- Carousel of suggested products

#### **Mobile View**

Same sections but stacked vertically:
- User Header (full width)
- Stats (2×2 grid, smaller cards)
- Quick Actions (2×2 grid)
- Recent Orders (swipeable cards instead of table)
- Recent Activity (collapsed, show 3 latest)
- Saved Items (horizontal scroll, 3 items)
- Help (2 buttons stacked)
- Recommended (carousel)

---

### 2.3 Other Sections (Individual)

#### **Personal Info Section**

**Desktop**:
```
┌─────────────────────────────────────────────┐
│  Personal Information                 [Edit]│
├─────────────────────────────────────────────┤
│  First Name:     John                       │
│  Last Name:      Doe                        │
│  Email:          john.doe@email.com         │
│  Phone:          +91 98765 43210            │
│  Date of Birth:  Jan 15, 1990              │
│                                             │
│  [Save Changes]  [Cancel]                   │
└─────────────────────────────────────────────┘
```

**Mobile**: Same fields but stacked, full width inputs.

#### **Addresses Section**

**Desktop**:
```
┌─────────────┬─────────────┬─────────────┐
│  [+ Add]    │  Address 1  │  Address 2  │
│   Address   │  (Default)  │             │
│             │  John Doe   │  John Doe   │
│             │  123 Street │  456 Avenue │
│             │  Mumbai     │  Pune       │
│             │  [Edit]     │  [Edit]     │
│             │  [Delete]   │  [Delete]   │
│             │             │  [Set Default]
└─────────────┴─────────────┴─────────────┘
```

**Mobile**: Stacked cards, one per row.

#### **Order History Section**

**Desktop Table**:
- Filters: Status (All, Pending, Delivered, Cancelled), Date Range
- Columns: Order #, Date, Items, Total, Status, Actions
- Pagination
- Sort options

**Mobile Cards**:
- Each order as a swipeable card
- Tap to expand details
- Quick actions at bottom

#### **Quotes Section**

**Desktop Table**:
- Columns: Quote #, Date, Items, Status, Actions
- Status badges: Pending, In Review, Accepted, Rejected
- Actions: View Details, Message Admin

**Mobile Cards**:
- Quote cards with summary
- Status badge
- Tap to view full quote

#### **Wishlist Section**

**Desktop Grid**: 4 columns
**Mobile Grid**: 2 columns

Each item:
- Product image
- Title
- Price (if available)
- Stock status
- Add to Quote button
- Remove button

---

## 3. Business User Profile (Unverified)

### 3.1 Differences from Individual

#### **Additional Navigation Items**:

**Business Group** (inserted between Account and Orders):
1. **Business Info** 🏢
   - Company details
2. **Verification** ✅ (Badge: "Required" in red)
   - Upload documents
   - Check status
3. **Business Documents** 📤
   - View uploaded docs
4. **Payment Methods** 💳 (Locked/Grayed out)
   - Message: "Available after verification"
5. **Invoices** 📄 (Locked/Grayed out)
   - Message: "Available after verification"

### 3.2 Dashboard Section (Business Unverified)

**User Header**:
```
┌──────────────────────────────────────────────┐
│  [Avatar]  Tech Solutions Pvt Ltd            │
│  80x80     admin@techsolutions.com           │
│            [Business Account]                │
│            [Action Required] ⚠️              │
└──────────────────────────────────────────────┘
```

**Verification Banner** (Prominent, orange background):
```
┌────────────────────────────────────────────────────┐
│  [Illustration]                                    │
│  Verification                                      │
│                                                    │
│  ⚠️ Action Required                               │
│  Complete Business Verification                    │
│                                                    │
│  Complete business verification to unlock quotes   │
│  & bulk ordering features.                         │
│                                                    │
│  [Complete Verification →]                         │
└────────────────────────────────────────────────────┘
```

**Quick Stats** (Same as individual but with business metrics):
```
┌──────────┬──────────┬──────────┬──────────┐
│   📦     │    📄    │    ⏳    │    💰    │
│  Total   │  Total   │  Active  │  Quote   │
│  Orders  │  Quotes  │  Quotes  │  Value   │
│   0      │    1     │    1     │  ₹0      │
└──────────┴──────────┴──────────┴──────────┘
```

**Quick Actions** (Business-focused):
1. **Request Quote** (Disabled - requires verification)
2. **Bulk Order** (Disabled - requires verification)
3. **Active Quotes** (Shows count)
4. **Track Orders** (Enabled)

**Active Quotes Table**:
- Shows pending/in-review quotes
- Quote #, Date, Items, Status, Actions
- Actions: View Details, Message Admin

Rest same as individual.

### 3.3 Verification Section (Business Unverified)

#### **Desktop View**:

**Status Card** (Top):
```
┌─────────────────────────────────────────────┐
│  ⚠️ Verification Status: Incomplete          │
│                                             │
│  Complete these steps to get verified:      │
│  ☐ Upload GST Certificate                  │
│  ☐ Upload PAN Card                         │
│  ☐ Upload Business License (Optional)      │
│  ☐ Submit for Review                       │
└─────────────────────────────────────────────┘
```

**Document Upload Section**:
```
┌──────────────────────────────────────────────┐
│  Required Documents                          │
├──────────────────────────────────────────────┤
│                                              │
│  1. GST Certificate *                        │
│     [Upload File] or Drag & Drop             │
│     Accepted: PDF, JPG, PNG (Max 5MB)        │
│     ☐ gst_certificate.pdf  [Remove]          │
│                                              │
│  2. PAN Card *                               │
│     [Upload File] or Drag & Drop             │
│     Accepted: PDF, JPG, PNG (Max 5MB)        │
│     ☐ pan_card.pdf  [Remove]                 │
│                                              │
│  3. Business License (Optional)              │
│     [Upload File] or Drag & Drop             │
│     Accepted: PDF, JPG, PNG (Max 5MB)        │
│     ☐ Not uploaded                           │
│                                              │
│  [Submit for Verification]                   │
└──────────────────────────────────────────────┘
```

**Company Details Form**:
```
Company Name:     [Tech Solutions Pvt Ltd]
GST Number:       [27AABCT1234D1Z5]
PAN Number:       [AABCT1234D]
Contact Person:   [John Doe]
Contact Phone:    [+91 98765 43210]
Business Address: [123, Tech Park, Mumbai]

[Save Details]
```

#### **Mobile View**:
- Same sections stacked vertically
- File upload shows mobile native picker
- Smaller cards, full width

### 3.4 Business Info Section (Unverified)

**Desktop**:
```
┌─────────────────────────────────────────────┐
│  Business Information              [Edit]   │
├─────────────────────────────────────────────┤
│  Company Name:    Tech Solutions Pvt Ltd    │
│  Company Type:    Private Limited           │
│  Industry:        Elevator Manufacturing    │
│  GST Number:      27AABCT1234D1Z5          │
│  PAN Number:      AABCT1234D                │
│                                             │
│  Business Address:                          │
│  123, Tech Park, Andheri East              │
│  Mumbai, Maharashtra - 400069               │
│  India                                      │
│                                             │
│  Contact Person:  John Doe                  │
│  Contact Phone:   +91 98765 43210          │
│  Contact Email:   admin@techsolutions.com   │
│                                             │
│  [Save Changes]  [Cancel]                   │
└─────────────────────────────────────────────┘
```

**Mobile**: Same fields, stacked inputs.

---

## 4. Business User Profile (Verified)

### 4.1 Differences from Unverified

#### **Navigation** (Unlocked Items):
- **Payment Methods** 💳 - Now accessible
- **Invoices** 📄 - Now accessible
- **Verification** ✅ - Badge: "Verified" in green

### 4.2 Dashboard Section (Business Verified)

**User Header**:
```
┌──────────────────────────────────────────────┐
│  [Avatar]  Tech Solutions Pvt Ltd            │
│  80x80     admin@techsolutions.com           │
│            [Business Account]                │
│            [✓ Verified] ✅                   │
└──────────────────────────────────────────────┘
```

**Verified Success Banner** (Green background):
```
┌────────────────────────────────────────────────────┐
│  ✅ Verified Business Account                      │
│                                                    │
│  You have full access to all B2B features         │
│  including custom quotes and bulk ordering.        │
└────────────────────────────────────────────────────┘
```

**Quick Stats** (Enhanced with business metrics):
```
┌──────────┬──────────┬──────────┬──────────┐
│   📦     │    📄    │    ⏳    │    💰    │
│  Total   │  Total   │  Active  │  Total   │
│  Orders  │  Quotes  │  Quotes  │  Spent   │
│   12     │    8     │    2     │  ₹12.5L  │
└──────────┴──────────┴──────────┴──────────┘
```

**Quick Actions** (All enabled):
1. **Request Quote** ✅ (Green - Active)
2. **Bulk Order** ✅ (Blue - Active)
3. **Active Quotes (2)** ✅
4. **Track Orders** ✅

**Additional Stats** (Verified only):
```
Monthly Spending:     ₹2.5L
Average Order Value:  ₹1.04L
Quote Success Rate:   75%
```

**Performance Charts** (Verified only):
- Revenue trend (last 6 months)
- Order frequency chart
- Quote conversion rate

**Recent Orders Table**: Enhanced with business features
- Bulk action buttons
- Download invoices
- Reorder with custom quantities

**Active Quotes Table**:
- Enhanced actions
- Convert to order button (for accepted quotes)
- Negotiation chat link

### 4.3 Payment Methods Section (Verified Only)

#### **Desktop View**:

```
┌─────────────────────────────────────────────┐
│  Payment Methods                    [+ Add] │
├─────────────────────────────────────────────┤
│                                             │
│  1. Credit Terms (30-day NET)               │
│     Default payment method                  │
│     Status: Active                          │
│     Credit Limit: ₹10,00,000                │
│     Available: ₹8,45,000                    │
│     [View Terms]                            │
│                                             │
│  2. Bank Transfer                           │
│     Cedar Elevators Pvt Ltd                 │
│     HDFC Bank, Mumbai                       │
│     A/C: 1234567890123                      │
│     IFSC: HDFC0001234                       │
│     [Copy Details]                          │
│                                             │
│  3. Razorpay (Card/UPI/Netbanking)          │
│     Instant payment option                  │
│     Status: Active                          │
│     [Manage]                                │
│                                             │
│  4. Purchase Order Upload                   │
│     Upload PO for processing                │
│     Status: Active                          │
│     [Upload PO]                             │
└─────────────────────────────────────────────┘
```

**Mobile**: Stacked cards, one per row.

### 4.4 Invoices Section (Verified Only)

#### **Desktop View**:

**Filters**:
- Date Range picker
- Status: All, Paid, Pending, Overdue
- Search by invoice number

**Invoices Table**:
```
┌──────┬──────┬──────┬──────┬──────┬────────┐
│Invoice│ Date │Order │Amount│Status│Actions │
│  #   │      │  #   │      │      │        │
├──────┼──────┼──────┼──────┼──────┼────────┤
│INV001│12 Dec│ORD12 │₹1.2L │ Paid │Download│
│INV002│10 Dec│ORD11 │₹85K  │Pending│Download│
│INV003│ 5 Dec│ORD10 │₹1.5L │ Paid │Download│
└──────┴──────┴──────┴──────┴──────┴────────┘
```

**Actions**:
- Download PDF
- Download Excel
- Email invoice
- Print

**Summary Card**:
```
Total Invoices:     45
Total Amount:       ₹45.6L
Paid:              ₹42.3L
Pending:           ₹3.3L
```

**Mobile**: Invoice cards with download buttons.

### 4.5 Verification Section (Verified - View Only)

```
┌─────────────────────────────────────────────┐
│  ✅ Verification Status: Verified            │
│                                             │
│  Your business account was verified on:     │
│  December 15, 2024                          │
│                                             │
│  Approved by: Admin Team                    │
│                                             │
│  Uploaded Documents:                        │
│  ✅ GST Certificate  [View]                 │
│  ✅ PAN Card  [View]                        │
│  ✅ Business License  [View]                │
│                                             │
│  If you need to update documents:           │
│  [Contact Support]                          │
└─────────────────────────────────────────────┘
```

---

## 5. Mobile vs Desktop Layout

### 5.1 Desktop Layout Details

**Sidebar** (256px, fixed left):
```css
- Background: Transparent
- User Card: White card with border
- Navigation: Grouped sections
- Active indicator: Orange background
- Bottom actions: Help, Logout
```

**Main Content Area**:
```css
- Max width: 1200px
- Padding: 32px
- Background: White
- Border radius: 8px
- Shadow: subtle
```

**Components**:
- Multi-column grids (2-4 columns)
- Tables for data (Orders, Quotes, Invoices)
- Side-by-side layouts
- Fixed header + scrollable content

### 5.2 Mobile Layout Details

**Top Bar**:
```
≡  Profile  [Avatar Icon]
```
- Hamburger menu (opens sidebar drawer)
- Title
- Avatar (opens user menu)

**Drawer Sidebar** (280px):
- Slides in from left
- Overlay dimming
- Same navigation as desktop
- Swipe to close

**Main Content**:
```css
- Full width
- Padding: 16px
- Stacked sections
- No multi-column layouts
```

**Components**:
- Single column
- Cards instead of tables
- Horizontal scroll for long lists
- Bottom sheets for forms
- Collapsible sections

**Bottom Navigation** (Fixed):
```
Home | Categories | Quote | Wishlist | Profile(Active)
```

### 5.3 Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 768px | Single column, drawer sidebar, bottom nav |
| Tablet | 768px - 1024px | Desktop sidebar, 2-column grids |
| Desktop | > 1024px | Full desktop layout, 3-4 column grids |

---

## 6. Profile Sections Detailed

### 6.1 Dashboard Section

**Purpose**: Overview of user account, stats, and recent activity

**Components**:
1. User Header Card
2. Verification Banner (if applicable)
3. Quick Stats Grid
4. Quick Actions Grid
5. Recent Orders Table/Cards
6. Active Quotes Table (Business)
7. Recent Activity Feed
8. Saved Items Preview
9. Help Section
10. Recommended Products

**Data Displayed**:
- Total Orders count
- Total Quotes count
- Active Quotes count
- Total Spent (verified business)
- Saved Items count
- Last 5 orders
- Last 5 quotes
- Last 10 activities
- 6 wishlist items

### 6.2 Personal Info Section

**Fields**:
- First Name (required)
- Last Name (required)
- Email (read-only, verified)
- Phone (required, format validation)
- Date of Birth (optional)
- Profile Picture (upload)

**Actions**:
- Edit mode toggle
- Save changes
- Cancel
- Upload avatar
- Remove avatar

**Validation**:
- Email format
- Phone number format (+91 XXXXX XXXXX)
- Name: alphabets only
- DOB: must be 18+ years

### 6.3 Addresses Section

**Address Card Contains**:
- Full Name
- Address Line 1
- Address Line 2 (optional)
- City
- State
- Postal Code
- Phone
- Default badge (if default)

**Actions**:
- Add new address
- Edit address
- Delete address
- Set as default
- Validate with PIN code API (future)

**Limits**:
- Max 10 addresses per user

### 6.4 Change Password Section

**Form Fields**:
- Current Password (required)
- New Password (required, min 8 chars)
- Confirm New Password (required, must match)

**Password Strength Indicator**:
- Weak (red) - < 2 criteria
- Fair (orange) - 2 criteria
- Good (yellow) - 3 criteria
- Strong (green) - 4 criteria
- Very Strong (emerald) - 5+ criteria

**Criteria**:
1. Minimum 8 characters
2. Lowercase letters
3. Uppercase letters
4. Numbers
5. Special characters

**Actions**:
- Update password
- Show/hide password toggle
- Password strength feedback

### 6.5 Order History Section

**Filters**:
- Status dropdown (All, Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
- Date range picker
- Search by order number

**Table Columns** (Desktop):
1. Order Number (clickable)
2. Order Date
3. Items Count
4. Total Amount
5. Status Badge
6. Actions (View, Reorder, Invoice)

**Card Layout** (Mobile):
- Order #, Date at top
- Items count, Total
- Status badge
- Quick actions at bottom

**Order Detail Modal/Page**:
- Full order information
- Items list with thumbnails
- Shipping address
- Payment method
- Order timeline
- Download invoice
- Cancel order (if allowed)
- Reorder button

### 6.6 Quotes Section

**Filters**:
- Status: All, Pending, In Review, Negotiation, Revised, Accepted, Rejected
- Date range
- Search by quote number

**Table Columns** (Desktop):
1. Quote Number
2. Submitted Date
3. Items Count
4. Total Value (if priced)
5. Status Badge
6. Actions (View, Message)

**Quote Detail View**:
- Quote information
- Items requested
- Customer notes
- Admin responses
- Quote timeline
- Message thread
- Accept/Reject (if revised)
- Convert to order (verified business, if accepted)

### 6.7 Wishlist Section

**Grid Layout**:
- Desktop: 4 columns
- Tablet: 3 columns
- Mobile: 2 columns

**Product Card**:
- Thumbnail image
- Product title
- Price (if visible to user type)
- Stock status
- Discount percentage (if any)
- Add to Quote button
- Remove from wishlist button

**Actions**:
- Add to quote basket
- Remove from wishlist
- View product details
- Share wishlist (future)

### 6.8 Business Info Section (Business Only)

**Fields**:
- Company Name (required)
- Company Type (dropdown)
- Industry (dropdown)
- GST Number (format: 27AABCT1234D1Z5)
- PAN Number (format: AABCT1234D)
- Business Address (full address)
- Contact Person Name
- Contact Phone
- Contact Email

**Actions**:
- Edit details
- Save changes
- Upload company logo

**Validation**:
- GST format (15 chars, alphanumeric)
- PAN format (10 chars, AAAAA9999A)
- Required fields check

### 6.9 Verification Section (Business Only)

**Unverified State**:
- Status: Incomplete/Rejected/Pending
- Checklist of required documents
- Document upload interface
- Company details form
- Submit for verification button

**Pending State**:
- Status: Pending Review
- "In Progress" message
- Timeline: Usually within 24 hours
- Uploaded documents (viewable)
- Cannot edit/resubmit

**Verified State**:
- Status: Verified badge
- Verification date
- Approved by info
- View uploaded documents
- Contact support to update

**Rejected State**:
- Status: Rejected badge
- Rejection reason (from admin)
- Resubmit option
- Edit documents
- Contact support

### 6.10 Business Documents Section (Business Only)

**Document List**:
1. **GST Certificate**
   - Status: Uploaded/Pending/Approved/Rejected
   - File name, size, upload date
   - Actions: View, Download, Replace

2. **PAN Card**
   - Same as above

3. **Business License**
   - Same as above (optional)

**Upload Interface**:
- Drag & drop zone
- File type validation (PDF, JPG, PNG)
- Size limit: 5MB per file
- Preview before upload
- Progress indicator

### 6.11 Payment Methods Section (Verified Business Only)

**Available Methods**:
1. **Credit Terms (30-day NET)**
   - Default for verified
   - Credit limit displayed
   - Available credit
   - Payment terms link

2. **Bank Transfer**
   - Bank details displayed
   - Copy to clipboard
   - QR code (future)

3. **Razorpay**
   - Instant payment
   - Card, UPI, Netbanking
   - Manage saved cards

4. **Purchase Order Upload**
   - Upload PO document
   - PO number entry
   - Approval workflow

**Actions**:
- Set default payment method
- Add new method
- Remove method
- View transaction history

### 6.12 Invoices Section (Verified Business Only)

**Filters**:
- Date range
- Status: All, Paid, Pending, Overdue
- Search by invoice/order number

**Invoice List**:
- Invoice number
- Invoice date
- Order number (linked)
- Total amount
- Status badge
- Due date (if pending)
- Download PDF button

**Actions**:
- Download invoice (PDF)
- Download all (Excel export)
- Email invoice
- Print invoice
- Filter by date/status
- Search

**Summary Stats**:
- Total invoices
- Total amount
- Paid amount
- Pending amount
- Overdue count

### 6.13 Security Settings Section

**Two-Factor Authentication** (Future):
- Enable/Disable 2FA
- SMS or Authenticator app
- Backup codes

**Login History**:
- Recent login attempts
- Device info
- Location
- IP address
- Date & time

**Active Sessions**:
- Current session indicator
- Other active sessions
- Logout from all devices

**Account Privacy**:
- Profile visibility
- Data sharing preferences
- Marketing preferences

### 6.14 Notifications Section

**Email Notifications**:
- Order updates (On/Off)
- Quote responses (On/Off)
- Promotional emails (On/Off)
- Newsletter (On/Off)
- Business verification (On/Off)

**Push Notifications** (Future):
- Order status changes
- Quote updates
- New messages
- Special offers

**Notification Frequency**:
- Immediate
- Daily digest
- Weekly digest

---

## 7. Navigation Structure

### 7.1 Individual User Navigation

```yaml
Account:
  - Dashboard
  - Personal Info
  - Addresses
  - Change Password

Orders & Quotes:
  - Order History
  - My Quotes
  - Wishlist

Settings:
  - Security Settings
  - Notifications

Bottom:
  - Help Center
  - Logout
```

### 7.2 Business User (Unverified) Navigation

```yaml
Account:
  - Dashboard
  - Personal Info
  - Addresses
  - Change Password

Business:
  - Business Info
  - Verification [Badge: Required]
  - Business Documents
  - Payment Methods [Locked]
  - Invoices [Locked]

Orders & Quotes:
  - Order History
  - My Quotes
  - Wishlist

Settings:
  - Security Settings
  - Notifications

Bottom:
  - Help Center
  - Logout
```

### 7.3 Business User (Verified) Navigation

```yaml
Account:
  - Dashboard
  - Personal Info
  - Addresses
  - Change Password

Business:
  - Business Info
  - Verification [Badge: Verified]
  - Business Documents
  - Payment Methods ✅
  - Invoices ✅

Orders & Quotes:
  - Order History
  - My Quotes
  - Wishlist

Settings:
  - Security Settings
  - Notifications

Bottom:
  - Help Center
  - Logout
```

---

## 8. Components Breakdown

### 8.1 Sidebar Component

**Desktop (256px fixed)**:
```tsx
<aside>
  <UserCard>
    - Avatar (40x40)
    - Name
    - Email
  </UserCard>
  
  <Navigation>
    {navigationGroups.map(group => (
      <NavGroup>
        <GroupTitle>{group.title}</GroupTitle>
        <NavItems>
          {group.items.map(item => (
            <NavItem 
              active={isActive}
              icon={item.icon}
              badge={item.badge}
            >
              {item.label}
            </NavItem>
          ))}
        </NavItems>
      </NavGroup>
    ))}
  </Navigation>
  
  <BottomActions>
    <HelpButton />
    <LogoutButton />
  </BottomActions>
</aside>
```

**Features**:
- Sticky positioning
- Scroll within nav area
- Active route highlighting (orange background)
- Icon + label
- Badges (verification status, notification count)
- Hover effects

### 8.2 Top Bar Component (Mobile)

```tsx
<header>
  <MenuButton onClick={openDrawer}>≡</MenuButton>
  <Title>Profile</Title>
  <Avatar onClick={openUserMenu} />
</header>
```

**Features**:
- Fixed positioning
- Opens drawer on menu click
- User menu on avatar click
- Breadcrumb (on sub-pages)

### 8.3 User Header Card

```tsx
<UserHeaderCard>
  <Avatar size={80} />
  <UserInfo>
    <Name>{user.company_name || fullName}</Name>
    <Email>{user.email}</Email>
    <Badges>
      <AccountTypeBadge type={accountType} />
      {isBusiness && (
        <VerificationBadge status={verificationStatus} />
      )}
    </Badges>
  </UserInfo>
</UserHeaderCard>
```

**Variants**:
- Individual: Show name, email, "Individual Account" badge
- Business Unverified: Show company, email, "Business Account" + "Action Required" badges
-Business Verified: Show company, email, "Business Account" + "✓ Verified" badges

### 8.4 Verification Banner

**Unverified/Rejected**:
```tsx
<VerificationBanner variant="warning">
  <Illustration src="/verification.png" />
  <Content>
    <Badge>⚠️ Action Required</Badge>
    <Title>Complete Business Verification</Title>
    <Message>
      Complete business verification to unlock quotes & bulk ordering.
    </Message>
    <Button onClick={goToVerification}>
      Complete Verification →
    </Button>
  </Content>
</VerificationBanner>
```

**Pending**:
```tsx
<VerificationBanner variant="info">
  <Icon>⏳</Icon>
  <Content>
    <Title>Verification in Progress</Title>
    <Message>
      Our team is reviewing your documents. 
      You'll receive an email once approved (usually within 24 hours).
    </Message>
  </Content>
</VerificationBanner>
```

**Verified**:
```tsx
<VerificationBanner variant="success">
  <Icon>✅</Icon>
  <Content>
    <Title>Verified Business Account</Title>
    <Message>
      You have full access to all B2B features including 
      custom quotes and bulk ordering.
    </Message>
  </Content>
</VerificationBanner>
```

### 8.5 Stats Card

```tsx
<StatsCard>
  <Icon>{icon}</Icon>
  <Value>{value}</Value>
  <Label>{label}</Label>
</StatsCard>
```

**Variants**:
- Total Orders
- Total Quotes
- Active Quotes
- Saved Items
- Total Spent (verified business)
- Quote Value

### 8.6 Quick Action Button

```tsx
<QuickActionButton
  icon={icon}
  label={label}
  color={color}
  disabled={!enabled}
  onClick={onClick}
/>
```

**States**:
- Enabled: Colored background, hover effect
- Disabled: Gray background, cursor not-allowed

### 8.7 Data Table

**Desktop**:
```tsx
<DataTable>
  <TableHeader>
    <TableRow>
      {columns.map(col => (
        <TableHead sortable={col.sortable}>
          {col.label}
        </TableHead>
      ))}
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(row => (
      <TableRow>
        {columns.map(col => (
          <TableCell>{row[col.key]}</TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</DataTable>
```

**Mobile (Card View)**:
```tsx
<CardList>
  {data.map(item => (
    <Card>
      <CardHeader>
        <Title>{item.title}</Title>
        <StatusBadge status={item.status} />
      </CardHeader>
      <CardBody>
        {/* Item details */}
      </CardBody>
      <CardActions>
        {/* Action buttons */}
      </CardActions>
    </Card>
  ))}
</CardList>
```

### 8.8 Form Components

**Input Field**:
```tsx
<FormField>
  <Label>{label}</Label>
  <Input
    type={type}
    value={value}
    onChange={onChange}
    error={error}
    disabled={disabled}
  />
  {error && <ErrorMessage>{error}</ErrorMessage>}
  {helper && <HelperText>{helper}</HelperText>}
</FormField>
```

**File Upload**:
```tsx
<FileUpload
  accept=".pdf,.jpg,.png"
  maxSize={5 * 1024 * 1024}
  onUpload={handleUpload}
>
  <DropZone>
    <Icon>📤</Icon>
    <Text>Drag & drop or click to upload</Text>
    <Hint>PDF, JPG, PNG (Max 5MB)</Hint>
  </DropZone>
  {file && (
    <FilePreview>
      <FileName>{file.name}</FileName>
      <FileSize>{formatSize(file.size)}</FileSize>
      <RemoveButton />
    </FilePreview>
  )}
</FileUpload>
```

---

## Summary

This comprehensive profile page overview covers:

✅ **3 User Types**: Individual, Business Unverified, Business Verified with distinct features  
✅ **14+ Profile Sections**: Dashboard, Personal Info, Addresses, Orders, Quotes, Wishlist, Business Info, Verification, Documents, Payment Methods, Invoices, Security, Notifications  
✅ **2 Platforms**: Complete Mobile and Desktop layouts with responsive design  
✅ **Detailed Components**: Sidebar, headers, cards, tables, forms, banners, badges  
✅ **Complete Navigation**: User-type specific menu structures  
✅ **Business Workflows**: Verification process, document upload, payment methods, invoices  
✅ **UI/UX Details**: Layouts, grids, colors, states, interactions  

**Key Features**:
- Dynamic navigation based on user type and verification status
- Prominent verification CTAs for unverified business users
- Enhanced features for verified business (payment methods, invoices)
- Responsive design with mobile-first approach
- Consistent UI patterns across all sections

---

**End of Document**
