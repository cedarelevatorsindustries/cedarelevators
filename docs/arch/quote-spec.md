# Quote-Related Pages & Sections - Complete UI Documentation

This document lists all quote-related pages and their sections across **Desktop** and **Mobile** views for all 4 user types: **Guest**, **Individual**, **Business**, and **Dealer/Installer**.

---

## 📱 User Type Overview

| User Type | Description | Quote Access |
|-----------|-------------|--------------|
| **Guest** | Non-logged-in users | Lead capture form only |
| **Individual** | Logged-in personal accounts | Limited quote features, upgrade prompts |
| **Business** | Verified business accounts | Full quote functionality |
| **Dealer/Installer** | Same as Business | Full quote functionality |

---

## 🌐 Quote Pages by Route

### 1. `/quotes` - Quotes List Page

**Route:** `src/app/(main)/quotes/page.tsx`  
**Client Component:** `src/app/(main)/quotes/quotes-page-client.tsx`

#### Desktop View

##### **Guest Users**
**Sections:**
1. **Lead Capture Form**
   - Full Name (input)
   - Email (input)
   - Phone Number (input)
   - Company Name (input, optional)
   - Product Requirements (textarea)
   - Attachments Upload (drag & drop)
   - Submit Button
   - Sign-in Link

##### **Individual Users**
**Sections:**
1. **Page Header**
   - Title: "My Quotes"
   - Description text

2. **Tab Navigation**
   - "My Quotes" tab
   - "New Quote" tab

3. **Stats Cards** (4 cards in grid)
   - Total Quotes (with count)
   - Pending (with count)
   - Accepted (with count)
   - Total Value (hidden for unverified, shows "-")

4. **Filters & Search Bar**
   - Search input (by quote number)
   - Status filter buttons: All, Pending, Reviewing, Approved, Rejected

5. **Quotes List**
   - Quote cards showing:
     - Quote number
     - Status badge
     - Item count
     - Created date
     - Valid until date
     - Estimated total (if verified)
     - Click to view details

6. **Empty State**
   - Icon
   - "No quotes found" message
   - "Request Quote" CTA button

7. **New Quote Tab Content**
   - Placeholder message
   - "Go to Request Quote" button

##### **Business Users (Unverified)**
**Additional Sections:**
1. **Verification Banner** (top of page)
   - Alert icon
   - "Business verification required" heading
   - Description text
   - "Complete Verification" button

All other sections same as Individual users.

##### **Business Users (Verified)**
Same as Individual users, but:
- Total Value shows actual amounts
- Estimated totals visible in quote cards
- No verification banner

#### Mobile View

Same structure as desktop, but:
- Responsive layout (stacked cards)
- Mobile-optimized filters
- Touch-friendly buttons

---

### 2. `/quotes/[id]` - Quote Detail Page

**Route:** `src/app/(main)/quotes/[id]/page.tsx`  
**Client Component:** `src/app/(main)/quotes/[id]/quote-detail-client.tsx`

#### Desktop View

##### **All Logged-in Users** (Individual, Business, Dealer)

**Sections:**

1. **Back Button**
   - "Back to Quotes" link

2. **Quote Header Card**
   - Status icon (large)
   - Quote number
   - Created date
   - Status badge
   - Info grid (4 columns):
     - Items count
     - Priority level
     - Valid until date
     - Estimated total (if verified)

3. **Action Buttons** (conditional)
   - "Convert to Order" button (if approved & verified)
   - Verification prompt (if approved but not verified)

4. **Status Timeline**
   - Visual timeline showing quote progression
   - Timestamps for each status

5. **Company Details Card** (Business users only)
   - Company name
   - GST number
   - Contact name
   - Contact phone

6. **Quote Items Section**
   - Table/list of items with:
     - Product thumbnail
     - Product name
     - SKU
     - Quantity
     - Unit price (if verified)
     - Bulk pricing badge (if requested)

7. **Your Notes Section** (if exists)
   - User's notes in text format

8. **Admin Response Section** (if exists)
   - Blue highlighted card
   - Admin notes
   - Response timestamp

9. **Attachments Section** (if exists)
   - Downloadable file list with:
     - File name
     - File size
     - Download icon

10. **Messages Section**
    - Message thread (chat-style)
    - User messages (right-aligned, blue)
    - Admin messages (left-aligned, gray)
    - Message input field
    - Send button

#### Mobile View

Same sections as desktop with responsive layout:
- Stacked cards
- Full-width elements
- Touch-optimized message input

---

### 3. `/request-quote` - Request Quote Page

**Route:** `src/app/(main)/request-quote/page.tsx`  
**Templates:** `src/modules/quote/templates/`

#### Desktop & Mobile Views

##### **Guest Users**

**Template:** `guest-quote-template.tsx`

**Sections:**

1. **Sticky Top Bar**
   - "Get Quote" title
   - Back button
   - No notifications

2. **Why Choose Us Banner**
   - Gradient background (blue)
   - 4 benefit items with icons:
     - Best prices guaranteed
     - Bulk discounts available
     - Quality assured products
     - 24/7 customer support

3. **Guest Quote Form**
   - Form fields for quote request
   - Product selection
   - Quantity inputs

4. **Best Selling Carousel**
   - Product recommendations
   - Swipeable on mobile

5. **Help Section**
   - "Help & FAQ" link
   - "Call Sales Team" link
   - "WhatsApp Support" link (green)

6. **Bottom CTA**
   - Fixed bottom action bar

##### **Individual Users**

**Template:** `individual-quote-template.tsx`

**Sections:**

1. **Sticky Top Bar**
   - "My Quotes" title
   - Pending count badge
   - Notifications icon

2. **Upgrade to Business Banner**
   - Gradient background (orange)
   - Package icon
   - "Upgrade to Business Account" heading
   - Benefits description
   - "Upgrade Now" button

3. **Performance Snapshot** (2 stat cards)
   - Total Spent (last 30 days)
   - Total Saved (with quotes)

4. **Quick Actions Bar** (3 buttons)
   - New Quote
   - Quick Reorder
   - Browse Catalog

5. **Quote Timeline**
   - Recent quotes list
   - Status indicators
   - Expiry dates

6. **Quick Reorder Section**
   - Previously ordered items
   - One-click reorder

7. **Help Section**
   - "Help & FAQ" link
   - "Contact Sales" link

##### **Business Users (Verified)**

**Template:** `business-quote-template.tsx`

**Sections:**

1. **Business Quote Form**
   - Enhanced form with business fields
   - Company details auto-filled
   - GST number field
   - Bulk pricing options
   - Credit terms selection
   - Multiple product selection
   - Quantity inputs
   - Special requirements textarea
   - File attachments
   - Submit button

2. **Product Recommendations**
   - Based on business category
   - Bulk pricing indicators

##### **Dealer/Installer Users**

Same as Business users (verified).

---

### 4. Profile Page - Quotes Section

**Route:** `/profile?tab=quotes`  
**Component:** `src/modules/profile/components/sections/quotes-section.tsx`

#### Desktop View

##### **Individual Users**

**Sections:**

1. **Upgrade Prompt Card**
   - Gradient background (orange)
   - FileText icon
   - "Upgrade to Business Account" heading
   - Benefits description
   - "Upgrade Now" button

##### **Business Users (Unverified)**

**Sections:**

1. **Verification Required Card**
   - Yellow background
   - Alert icon
   - "Complete Verification to Request Quotes" heading
   - Description text
   - "Complete Verification" button

##### **Business Users (Verified) & Dealers**

**Sections:**

1. **Section Header**
   - "My Quotes" title
   - Description text

2. **Summary Cards** (3 cards in grid)
   - Total Quotes (with count)
   - Active Quotes (with count)
   - Total Value (formatted currency)

3. **Quick Actions**
   - "Request New Quote" button (orange)
   - "Download All Quotes" button (CSV export)

4. **Filters & Search**
   - Search input (by Quote ID / Product)
   - Status dropdown filter
   - Date range dropdown filter

5. **Quotes Table** (Desktop)
   - Columns:
     - Quote ID (clickable)
     - Date
     - Items count
     - Total Amount
     - Status badge
     - Actions (View, Chat, Reorder icons)

6. **Quotes Cards** (Mobile)
   - Card layout with:
     - Quote number
     - Status badge
     - Date, Items, Total
     - "View Details" button
     - Chat button (if reviewing)

7. **Empty State**
   - FileText icon
   - "No quotes found" message
   - Contextual message based on filters
   - "Request New Quote" button

#### Mobile View

Same sections with responsive layout:
- Stacked summary cards
- Full-width search/filters
- Card-based quote list instead of table

---

### 5. Profile Page - Quote Detail Section

**Route:** `/profile?tab=quotes&quote=[number]`  
**Component:** `src/modules/profile/components/sections/quote-detail-section.tsx`

Same sections as `/quotes/[id]` detail page (see section 2 above).

---

### 6. Homepage - Quick Quote Section (Mobile Only)

**Route:** `/` (homepage)  
**Component:** `src/modules/home/components/mobile/sections/QuickQuoteSection.tsx`

#### Mobile View Only

**Sections:**

1. **Quick Quote Card**
   - White card with border
   - "Need a Custom or Bulk Order?" heading
   - "Get a detailed quote within 24 business hours" description
   - "REQUEST QUOTE NOW" button (blue)

---

## 🎨 UI Components Used Across Pages

### Common Components

1. **Status Badges**
   - Pending (orange)
   - Reviewing (blue)
   - Approved (green)
   - Rejected (red)
   - Converted (emerald/purple)
   - Draft (gray)
   - Expired (gray)

2. **Action Buttons**
   - Primary CTA (orange #ff3705)
   - Secondary (white with border)
   - Icon buttons (hover states)

3. **Form Elements**
   - Text inputs
   - Textareas
   - Dropdowns/Selects
   - File upload (drag & drop)
   - Search bars

4. **Cards**
   - Stat cards (with icons)
   - Quote list cards
   - Info cards
   - Alert/Banner cards

5. **Navigation**
   - Tabs
   - Breadcrumbs
   - Back buttons
   - Sticky top bars

---

## 📊 Feature Matrix by User Type

| Feature | Guest | Individual | Business (Unverified) | Business (Verified) | Dealer/Installer |
|---------|-------|------------|----------------------|---------------------|------------------|
| View Quote List | ❌ | ✅ | ✅ | ✅ | ✅ |
| View Quote Details | ❌ | ✅ | ✅ | ✅ | ✅ |
| Request New Quote | ✅ (Lead Form) | ❌ (Upgrade prompt) | ❌ (Verify prompt) | ✅ | ✅ |
| View Pricing | ❌ | ❌ | ❌ | ✅ | ✅ |
| Convert to Order | ❌ | ❌ | ❌ | ✅ | ✅ |
| Message Thread | ❌ | ✅ | ✅ | ✅ | ✅ |
| Download CSV | ❌ | ❌ | ❌ | ✅ | ✅ |
| Bulk Pricing | ❌ | ❌ | ❌ | ✅ | ✅ |
| Credit Terms | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 🔐 Permission-Based UI Elements

### Pricing Visibility
- **Hidden for:** Guest, Individual, Business (Unverified)
- **Visible for:** Business (Verified), Dealer/Installer
- **UI Treatment:** Shows "-" or "Pricing not available" message

### Quote Conversion
- **Available for:** Business (Verified), Dealer/Installer with approved quotes
- **Blocked for:** All others with upgrade/verification prompts

### Verification Banners
- **Individual:** Orange "Upgrade to Business" banner
- **Business (Unverified):** Yellow "Complete Verification" banner
- **Business (Verified):** No banner

---

## 📱 Responsive Breakpoints

- **Mobile:** < 768px
- **Desktop:** ≥ 768px

### Mobile-Specific Adaptations
1. Stacked layouts instead of grids
2. Card-based lists instead of tables
3. Bottom navigation bars
4. Full-width buttons
5. Collapsible filters
6. Touch-optimized spacing

---

## 🎯 Key User Flows

### Guest User Flow
1. Land on `/quotes` → See lead capture form
2. Fill form → Submit → Create account prompt
3. Or click "Request Quote" from homepage → Same form

### Individual User Flow
1. Navigate to `/quotes` → See upgrade prompt
2. View existing quotes (if any from before account type change)
3. Click "Upgrade" → Go to profile verification

### Business User (Unverified) Flow
1. Navigate to `/quotes` → See verification banner
2. Click "Complete Verification" → Profile verification section
3. Cannot request new quotes until verified

### Business User (Verified) Flow
1. Navigate to `/quotes` → See full quote list
2. Click "New Quote" tab or "Request Quote" → Full form
3. Submit quote → View in list
4. Click quote → View details
5. Send messages → Get admin response
6. Quote approved → Convert to order
7. Download CSV for records

---

## 🗂️ File Structure Reference

```
src/
├── app/
│   └── (main)/
│       ├── quotes/
│       │   ├── page.tsx                    # Quotes list page
│       │   ├── quotes-page-client.tsx      # Client component
│       │   └── [id]/
│       │       ├── page.tsx                # Quote detail page
│       │       └── quote-detail-client.tsx # Client component
│       └── request-quote/
│           └── page.tsx                    # Request quote page
│
├── modules/
│   ├── quote/
│   │   ├── templates/
│   │   │   ├── guest-quote-template.tsx
│   │   │   ├── individual-quote-template.tsx
│   │   │   └── business-quote-template.tsx
│   │   └── components/
│   │       ├── guest-quote-form.tsx
│   │       ├── individual-quote-form.tsx
│   │       ├── business-quote-form.tsx
│   │       ├── quote-status-timeline.tsx
│   │       ├── performance-snapshot.tsx
│   │       ├── quick-actions-bar.tsx
│   │       └── quote-timeline.tsx
│   │
│   ├── profile/
│   │   ├── components/
│   │   │   └── sections/
│   │   │       ├── quotes-section.tsx
│   │   │       └── quote-detail-section.tsx
│   │   └── templates/
│   │       └── profile-desktop-template.tsx
│   │
│   └── home/
│       └── components/
│           └── mobile/
│               └── sections/
│                   └── QuickQuoteSection.tsx
│
└── lib/
    ├── actions/
    │   └── quotes.ts                       # Server actions
    ├── types/
    │   └── b2b/
    │       └── quote.ts                    # Type definitions
    └── utils/
        └── quote-formatting.ts             # Utility functions
```

---

## 📝 Summary

This application has **6 main quote-related pages/sections** with distinct UIs for **4 user types**:

1. **Quotes List Page** (`/quotes`)
2. **Quote Detail Page** (`/quotes/[id]`)
3. **Request Quote Page** (`/request-quote`)
4. **Profile Quotes Section** (`/profile?tab=quotes`)
5. **Profile Quote Detail** (`/profile?tab=quotes&quote=[number]`)
6. **Homepage Quick Quote** (Mobile only)

Each page adapts its UI based on:
- User authentication status
- Account type (Guest/Individual/Business/Dealer)
- Verification status
- Device type (Desktop/Mobile)

The system uses **permission-based rendering** to show/hide features like pricing, quote conversion, and bulk ordering based on user capabilities.
