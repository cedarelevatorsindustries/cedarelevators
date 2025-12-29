# Cedar Elevators - E-commerce Store Complete Overview

**Last Updated**: December 28, 2025  
**Version**: 1.0  
**Tech Stack**: Next.js 16 + React 19 + TypeScript + Supabase + Clerk Authentication

---

## Table of Contents

1. [User Types & Access Levels](#user-types--access-levels)
2. [Pricing Strategy](#pricing-strategy)
3. [Quote Management System](#quote-management-system)
4. [Pages Overview (Mobile & Desktop)](#pages-overview-mobile--desktop)
5. [Module Features](#module-features)
6. [Page Sections & Logics](#page-sections--logics)
7. [Business Verification Workflow](#business-verification-workflow)
8. [Checkout Flow by User Type](#checkout-flow-by-user-type)

---

## 1. User Types & Access Levels

### 1.1 Guest User

**Access Level**: Public browsing only  
**Authentication**: Not logged in  
**User Type Code**: `'guest'`

#### Features Available
- Browse product catalog
- View product details
- Search products
- View categories and collections
- Add items to quote basket (local storage)
- View cart UI (local storage)
- Access public content (homepage, about, contact)

#### Features Restricted
- ❌ Cannot see prices
- ❌ Cannot add to cart
- ❌ Cannot submit quotes
- ❌ Cannot checkout
- ❌ Cannot access profile
- ❌ Cannot view order history
- ❌ Cannot save products to wishlist

#### Conversion Actions
- Sign up prompt on all restricted actions
- Benefits showcase for registration
- Contact sales option

---

### 1.2 Individual User (Authenticated)

**Access Level**: Basic authenticated user  
**Authentication**: Logged in via Clerk  
**User Type Code**: `'individual'`  
**Metadata**: `accountType: 'individual'`

#### Features Available
- ✅ All guest features
- ✅ Browse with prices visible
- ✅ Add to cart
- ✅ View cart and manage items
- ✅ Submit quote requests (basic form - 500 char notes max)
- ✅ View quote history
- ✅ Save products to wishlist
- ✅ Access profile dashboard
- ✅ Manage addresses
- ✅ View order history
- ✅ Request quotes with 1 attachment

#### Features Restricted
- ❌ Cannot checkout (blocked)
- ❌ Cannot see bulk pricing
- ❌ Cannot access business features
- ❌ Cannot upload purchase orders
- ❌ Limited quote capabilities (no templates, 1 attachment max)

#### Quote Capabilities
- **Notes**: Max 500 characters
- **Attachments**: 1 file max
- **Templates**: Not available
- **Bulk Upload**: Not available

#### Checkout Behavior
- Cart allowed, but checkout is **BLOCKED**
- Shows message: "Individual accounts can request quotes but cannot place direct orders. Please contact sales or upgrade to business account."

---

### 1.3 Business User (Unverified)

**Access Level**: Business account pending verification  
**Authentication**: Logged in via Clerk  
**User Type Code**: `'business'` (for auth) / `'business_unverified'` (for checkout)  
**Metadata**: `accountType: 'business'`, `company: 'Company Name'`  
**Verification Status**: Pending/Unverified

#### Features Available
- ✅ All individual features
- ✅ Business profile page
- ✅ Upload verification documents (GST, PAN, License)
- ✅ Enhanced quote form (1000 char notes, 2 attachments)
- ✅ View company details
- ✅ Business dashboard with enhanced stats
- ✅ Track verification status

#### Features Restricted
- ❌ Cannot checkout (blocked)
- ❌ Cannot access payment methods
- ❌ Cannot see final prices
- ❌ Cannot download invoices
- ❌ Cannot access bulk pricing
- ❌ Limited to 2 attachments per quote

#### Quote Capabilities
- **Notes**: Max 1000 characters
- **Attachments**: 2 files max
- **Company Details**: GST, PAN, Contact info
- **Templates**: Not available
- **Bulk Upload**: Not available

#### Checkout Behavior
- Cart allowed, but checkout is **BLOCKED**
- Shows message: "Your business account is pending verification. Please complete verification or contact sales to place orders."

#### Documents Required
1. **GST Certificate** (required)
2. **PAN Card** (required)
3. **Business License** (optional)

---

### 1.4 Business User (Verified)

**Access Level**: Full business account  
**Authentication**: Logged in via Clerk  
**User Type Code**: `'business'` (for auth) / `'business_verified'` (for checkout)  
**Metadata**: `accountType: 'business'`, `company: 'Company Name'`  
**Verification Status**: Verified by admin

#### Features Available
- ✅ **ALL previous features**
- ✅ **FULL CHECKOUT ACCESS** - Can place orders
- ✅ View all prices including bulk discounts
- ✅ Manage payment methods (Credit terms, PO upload)
- ✅ Download invoices
- ✅ Quote templates (save and reuse)
- ✅ Bulk quote capabilities (5 attachments)
- ✅ Enhanced business analytics
- ✅ Priority customer support
- ✅ Account manager access
- ✅ Team member management

#### Quote Capabilities
- **Notes**: Max 1000 characters
- **Attachments**: 5 files max
- **Templates**: Create, save, reuse
- **Bulk Upload**: CSV support
- **Company Details**: Full business profile

#### Checkout Behavior
- **FULL ACCESS** to checkout
- All payment methods available
- Can place direct orders
- Access to bulk pricing tiers
- Invoice generation

#### Payment Methods Available
1. **Credit Terms** (30-day NET)
2. **Purchase Order Upload**
3. **Razorpay** (Card, UPI, Netbanking)
4. **Bank Transfer**

#### Business Benefits
- Volume discounts (5%-20% based on quantity)
- Dedicated account manager
- Priority support
- Invoice management
- Custom payment terms
- Bulk order capabilities

---

## 2. Pricing Strategy

### 2.1 Price Visibility Rules

| User Type | MRP Visible | Sale Price Visible | Bulk Pricing Visible | Discount % Shown |
|-----------|-------------|-------------------|---------------------|------------------|
| Guest | ❌ | ❌ | ❌ | ❌ |
| Individual | ✅ | ✅ | ❌ | ✅ |
| Business Unverified | ✅ | ✅ | ❌ | ✅ |
| Business Verified | ✅ | ✅ | ✅ | ✅ |

### 2.2 Bulk Pricing Tiers (Verified Business Only)

```typescript
DISCOUNT_TIERS = [
  { minQty: 5,  discount: 5%,  label: '5+ units' },
  { minQty: 10, discount: 10%, label: '10+ units' },
  { minQty: 25, discount: 15%, label: '25+ units' },
  { minQty: 50, discount: 20%, label: '50+ units' }
]
```

**Application Logic**:
- Applies to total cart quantity per product
- Automatic tier selection based on quantity
- Displayed in product detail page (verified business only)
- Applied during checkout calculation

### 2.3 Product Pricing Structure

```typescript
interface ProductPricing {
  mrp: number              // Maximum Retail Price
  price: number           // Selling price (shown to authenticated)
  bulk_price?: number     // Bulk pricing (verified business only)
  discount_percentage: number  // Calculated: (mrp - price) / mrp * 100
}
```

### 2.4 Cart & Order Calculations

**For Individual/Unverified Business** (Quote Only):
```
Items Total = Σ(product.price × quantity)
Display: Items only, no checkout
```

**For Verified Business** (Full Checkout):
```
Subtotal = Σ(product.price × quantity)
Bulk Discount = Applied based on quantity tiers per product
Shipping = Based on delivery option selected
GST (18%) = (Subtotal - Bulk Discount + Shipping) × 0.18
  ├─ CGST = 9%
  ├─ SGST = 9% (same state)
  └─ IGST = 18% (different state)
Total = Subtotal - Bulk Discount + Shipping + GST
```

---

## 3. Quote Management System

### 3.1 Quote Types by User

| Feature | Guest | Individual | Business Unverified | Business Verified |
|---------|-------|------------|---------------------|-------------------|
| Request Quote Form | ✅ Basic | ✅ Standard | ✅ Enhanced | ✅ Premium |
| Max Notes Length | 200 chars | 500 chars | 1000 chars | 1000 chars |
| Attachments | ❌ None | 1 file | 2 files | 5 files |
| Company Details | ❌ | ❌ | ✅ | ✅ |
| Quote Templates | ❌ | ❌ | ❌ | ✅ |
| Bulk CSV Upload | ❌ | ❌ | ❌ | ✅ |

### 3.2 Quote Submission Types

#### Guest Quote Submission
```typescript
interface GuestQuoteSubmission {
  guest_name: string
  guest_email: string
  guest_phone: string
  notes: string  // max 200 chars
  items: QuoteBasketItem[]
}
```

#### Individual Quote Submission
```typescript
interface IndividualQuoteSubmission {
  notes: string  // max 500 chars
  items: QuoteBasketItem[]
  attachment?: {
    file_name: string
    file_url: string
    file_size: number
    mime_type: string
  }  // max 1 file
}
```

#### Business Quote Submission
```typescript
interface BusinessQuoteSubmission {
  notes: string  // max 1000 chars
  items: QuoteBasketItem[]
  company_details: {
    company_name: string
    gst_number?: string
    pan_number?: string
    contact_name?: string
    contact_phone?: string
  }
  attachments?: Array<{...}>  // max 2 files (unverified) or 5 files (verified)
  template_id?: string  // verified only
}
```

### 3.3 Quote Status Workflow

```
pending → in_review → negotiation → revised → accepted/rejected
                                              ↓
                                          converted (to order)
```

**Status Types**:
- `pending`: Newly submitted, awaiting admin review
- `in_review`: Admin is reviewing the quote
- `negotiation`: Back-and-forth discussion phase
- `revised`: Quote updated by admin
- `accepted`: Customer accepted the quote
- `rejected`: Customer rejected the quote
- `expired`: Quote validity period passed
- `converted`: Quote converted to actual order

### 3.4 Quote Priority Levels

- **Low**: Standard processing
- **Medium**: Expedited review
- **High**: Priority handling (verified business)

### 3.5 Quote Basket Items

```typescript
interface QuoteBasketItem {
  id: string              // unique basket item id
  product_id: string
  variant_id?: string
  product_name: string
  product_sku?: string
  product_thumbnail?: string
  quantity: number
  unit_price?: number     // shown to verified business only
  bulk_pricing_requested?: boolean
  notes?: string          // item-specific notes
}
```

---

## 4. Pages Overview (Mobile & Desktop)

### 4.1 Public Pages (All Users)

| Page | Route | Mobile | Desktop | Description |
|------|-------|--------|---------|-------------|
| **Homepage** | `/` | ✅ | ✅ | Hero, featured products, categories |
| **Product Catalog** | `/catalog` | ✅ | ✅ | Product listing with filters |
| **Product Detail** | `/products/[handle]` | ✅ | ✅ | Product information, specs, images |
| **Category Browse** | `/categories/[handle]` | ✅ | ✅ | Category-specific products |
| **Search Results** | `/catalog?q=[query]` | ✅ | ✅ | Search results page |
| **Cart** | `/cart` | ✅ | ✅ | Shopping cart (Guest: local only) |
| **Request Quote** | `/request-quote` | ✅ | ✅ | Quote request form |

### 4.2 Authentication Pages

| Page | Route | Mobile | Desktop | Description |
|------|-------|--------|---------|-------------|
| **Sign In** | `/sign-in` | ✅ | ✅ | Login page (Clerk) |
| **Sign Up** | `/sign-up` | ✅ | ✅ | Registration with account type selection |
| **Account Type Selection** | `/auth/account-type` | ✅ | ✅ | Choose Individual or Business |

### 4.3 User Dashboard Pages (Authenticated Only)

| Page | Route | Individual | Business Unverified | Business Verified | Mobile | Desktop |
|------|-------|-----------|---------------------|-------------------|--------|---------|
| **Dashboard Home** | `/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Profile Overview** | `/profile` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Account Settings** | `/profile/account` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Addresses** | `/profile/addresses` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Password Change** | `/profile/password` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Wishlist** | `/profile/wishlist` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Order History** | `/profile/orders` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Quotes** | `/profile/quotes` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Quote Detail** | `/quotes/[id]` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Notifications** | `/profile/notifications` | ✅ | ✅ | ✅ | ✅ | ✅ |

### 4.4 Business-Specific Pages

| Page | Route | Unverified | Verified | Mobile | Desktop |
|------|-------|-----------|----------|--------|---------|
| **Business Verification** | `/profile/verification` | ✅ | ✅ (View Only) | ✅ | ✅ |
| **Business Profile** | `/profile` | ✅ | ✅ | ✅ | ✅ |

### 4.5 Checkout Pages (Verified Business Only)

| Page | Route | Access | Mobile | Desktop |
|------|-------|--------|--------|---------|
| **Checkout** | `/checkout` | Verified Business Only | ✅ | ✅ |
| **Order Confirmation** | `/checkout/success` | Verified Business Only | ✅ | ✅ |

### 4.6 Homepage Variants by User Type

#### Guest Homepage (`/`)
**Sections**:
1. Hero Section (full-width video background)
2. Shop by Application (navigation to categories)
3. Featured Products
4. Shop by Category
5. Collections (Trending, New Arrivals, Top Choices)
6. Why Choose Us
7. Bulk Order Benefits
8. Trust Badges
9. Footer

#### Individual Homepage (Logged In)
**Sections**:
1. Hero Lite (tabbed interface)
   - Products Tab (active by default)
   - Categories Tab (category selector)
2. Welcome Section (personalized greeting)
3. Featured Products
4. Recently Viewed
5. Recommended Products
6. Collections
7. Footer

#### Business Homepage (Logged In)
**All Individual sections PLUS**:
1. Business Hub Tab (in Hero Lite)
   - Verification Status Card
   - Primary Actions (Bulk Quote, Shop Catalog, Quick Reorder)
   - Smart Alerts
   - Performance Stats
   - Unified Timeline
   - Exclusive Products
2. Business-specific promotions
3. Volume discount information

---

## 5. Module Features

### 5.1 Authentication Module (`modules/auth`)

**Features**:
- Social login (Google, GitHub, etc.) via Clerk
- Email/password authentication
- Account type selection (Individual/Business)
- Role-based access control
- User metadata management
- Session management
- Protected route middleware

**Components**:
- Sign in form
- Sign up form
- Account type selector
- Social login buttons
- Password reset flow

---

### 5.2 Product Catalog Module (`modules/catalog`)

**Features**:
- Product listing with pagination
- Advanced filtering:
  - By category/subcategory
  - By application type
  - By price range
  - By stock availability
  - By elevator specifications (voltage, speed, capacity)
- Product search
- Sort options (price, name, newest)
- Product cards (grid/list view)
- Quick view modal
- Related products
- Recently viewed tracking

**Components**:
- Product grid
- Product card
- Filter sidebar
- Search bar
- Category navigation
- Application selector
- Sort dropdown
- Pagination controls

**Sections** (Catalog Page):
- Banner section (category-specific)
- Breadcrumb navigation
- Filter sidebar (desktop)
- Filter bar (mobile, collapsible)
- Product grid
- Load more/pagination

---

### 5.3 Product Detail Module (`modules/products`)

**Features**:
- Image gallery with zoom
- Product information display
- Variant selection (if available)
- Quantity selector
- Add to cart/quote basket
- Specification table
- Elevator-specific fields:
  - Voltage (V)
  - Speed (m/s)
  - Load capacity (kg)
  - Application type
  - Elevator type
- Price display (user-type dependent)
- Bulk pricing table (verified business only)
- Stock availability
- Product reviews/ratings
- Related products
- Recently viewed

**Sections** (Product Detail Page):
1. Breadcrumb navigation
2. Image gallery section
3. Product info section:
   - Title & SKU
   - Price display (user-dependent)
   - Discount badge
   - Stock status
4. Actions section:
   - Quantity selector
   - Add to Cart/Quote button
   - Add to Wishlist
5. Specifications table
6. Description section
7. Bulk pricing table (verified only)
8. Related products
9. Recently viewed

**Components**:
- Image gallery
- Price display
- Bulk pricing table
- Add to cart button
- Add to quote button
- Specification table
- Product description
- Related products carousel

---

### 5.4 Cart Module (`modules/cart`)

**Features**:
- View cart items
- Update quantities
- Remove items
- Calculate totals
- Apply coupons (future)
- Proceed to checkout/quote
- Cart persistence:
  - Guest: Local storage
  - Authenticated: Database sync
- Cart migration (guest → authenticated)
- Stock validation
- Price updates

**Sections** (Cart Page):
1. Cart header (item count)
2. Cart items list
3. Item card:
   - Product thumbnail
   - Title & SKU
   - Price (user-dependent)
   - Quantity selector
   - Remove button
   - Subtotal
4. Cart summary:
   - Items total
   - Shipping estimate
   - Tax estimate (verified business)
   - Total
5. Action buttons:
   - Continue shopping
   - Request Quote (individual/business unverified)
   - Proceed to Checkout (verified business)
6. Recommended products

**Components**:
- Cart item card
- Quantity selector
- Cart summary
- Empty cart state
- Loading states

---

### 5.5 Quote Module (`modules/quote`)

**Features**:
- Quote basket management (separate from cart)
- Multi-tier quote forms:
  - Guest form (basic)
  - Individual form (standard)
  - Business form (enhanced)
- File attachments
- Company details input (business)
- Quote templates (verified business)
- Quote history
- Quote detail view
- Quote timeline
- Quote status tracking
- Messaging with admin
- Quote-to-order conversion (verified business)
- Bulk quote upload (CSV, verified business)

**Sections** (Quote Request Page):
1. Quote basket review
2. Contact information (guest)
3. Notes/requirements input
4. Attachment upload
5. Company details (business)
6. Template selection (verified business)
7. Submit button

**Sections** (Quote Detail Page):
1. Quote header:
   - Quote number
   - Status badge
   - Priority level
   - Created date
   - Valid until date
2. Quote items table:
   - Product details
   - Quantity
   - Unit price (if provided)
   - Discount %
   - Total
3. Quote summary:
   - Subtotal
   - Discount total
   - Tax total
   - Estimated total
4. Timeline section:
   - Status updates
   - Messages
   - Attachments
5. Actions:
   - Accept quote (verified business)
   - Reject quote
   - Message admin
   - Download PDF

**Components**:
- Quote basket
- Quote form (guest/individual/business variants)
- Quote item card
- Quote timeline
- Quote status badge
- Message thread
- Attachment uploader
- Template selector

---

### 5.6 Checkout Module (`modules/checkout`)

**Access**: Verified Business Users ONLY

**Features**:
- Multi-step checkout flow
- Address management
- Delivery option selection
- Payment method selection
- Order review
- Terms acceptance
- Order placement
- Email capture (guest fallback)
- Blocked state (individual/unverified business)

**Checkout Steps**:

**For Guest Users**:
1. Email Capture (collect email for quote)

**For Individual/Unverified Business**:
1. Blocked Screen (message + upgrade options)

**For Verified Business**:
1. **Shipping Information**
   - Select/add shipping address
   - Enter contact details
   - GSTIN input
2. **Delivery Options**
   - Standard shipping
   - Express shipping
   - Custom delivery
3. **Payment Method**
   - Credit Terms (30-day NET)
   - Purchase Order Upload
   - Razorpay (Card/UPI/Netbanking)
   - Bank Transfer
4. **Review & Confirm**
   - Review all details
   - Order summary
   - Terms & conditions checkbox
   - Place order button
5. **Order Confirmation**
   - Order number
   - Payment confirmation
   - Email sent notification

**Sections** (Checkout Page):
1. Progress bar (step indicator)
2. Checkout form (step-dependent)
3. Order summary sidebar:
   - Items list
   - Subtotal
   - Bulk discount (if applicable)
   - Shipping
   - GST breakdown (CGST/SGST/IGST)
   - Total
4. Navigation buttons (Back/Continue)

**Components**:
- Progress bar
- Address selector
- Address form
- Delivery options
- Payment method selector
- PO upload
- Order summary
- Terms checkbox
- Blocked checkout screen
- Email capture form

---

### 5.7 Profile Module (`modules/profile`)

**Features**:
- Personal information management
- Address book (multiple addresses)
- Password change
- Wishlist management
- Order history
- Quote history
- Notification preferences
- Security settings
- Business profile (business users)
- Document uploads (business unverified)
- Verification status (business)

**Pages**:

1. **Profile Overview** (`/profile`)
   - User stats (orders, quotes, wishlist)
   - Quick actions
   - Recent activity
   - Account summary

2. **Account Settings** (`/profile/account`)
   - Personal information
   - Email & phone
   - Company details (business)
   - Account type display

3. **Addresses** (`/profile/addresses`)
   - Address list
   - Add/edit/delete addresses
   - Set default address
   - Address validation

4. **Password** (`/profile/password`)
   - Current password
   - New password
   - Confirm password
   - Password strength indicator

5. **Wishlist** (`/profile/wishlist`)
   - Saved products
   - Add to cart/quote
   - Remove from wishlist
   - Product availability

6. **Orders** (`/profile/orders`)
   - Order history table
   - Order status
   - Reorder option
   - Download invoice (verified business)
   - Track order

7. **Quotes** (`/profile/quotes`)
   - Quote history table
   - Quote status filter
   - View quote details
   - Create new quote

8. **Verification** (`/profile/verification`)
   - Upload documents (GST, PAN, License)
   - Verification status
   - Document review status
   - Resubmit option

9. **Notifications** (`/profile/notifications`)
   - Notification list
   - Mark as read
   - Notification preferences
   - Filter by type

**Components**:
- Profile sidebar (navigation)
- Profile topbar (mobile)
- Stats cards
- Address card
- Order card
- Quote card
- Document uploader
- Verification status badge
- Notification item

---

### 5.8 Home Module (`modules/home`)

**Features**:
- Dynamic homepage based on user type
- Hero section with video background (guest)
- Hero lite with tabs (logged in)
- Featured products
- Collections (trending, new arrivals)
- Category navigation
- Application selector
- Business hub (verified business)
- Search bar
- Call-to-actions

**Desktop Sections**:

**Guest Homepage**:
1. Hero Section (full video)
2. Shop by Application
3. Featured Products
4. Shop by Category
5. Collections
6. Why Choose Us
7. Bulk Order Benefits
8. Trust Badges
9. Newsletter signup

**Logged In (Individual/Business)**:
1. Hero Lite (tabs):
   - Products Tab
   - Categories Tab
   - Business Hub Tab (business only)
2. Welcome Section
3. Featured Products
4. Recently Viewed
5. Recommended Products
6. Collections

**Business Hub Tab** (Verified Business):
- Verification Status Card
- Primary Actions (Bulk Quote, Shop Catalog, Quick Reorder)
- Smart Alerts (expiring quotes, pending approvals)
- Performance Stats (clickable navigation)
- Unified Timeline (orders, quotes, activity)
- Exclusive Products
- Tawk.to chat widget

**Mobile Sections**:
Similar to desktop but with:
- Collapsible sections
- Bottom navigation
- Touch-optimized UI
- Swipeable carousels

**Components**:
- Hero section
- Hero lite
- Application selector
- Category grid
- Featured products section
- Collections section
- Business hub
- Welcome banner
- Stats cards
- Timeline
- Product carousel

---

### 5.9 Layout Module (`modules/layout`)

**Features**:
- Responsive navigation
- Header (desktop/mobile)
- Footer
- Search overlay
- Notification sidebar
- User menu
- Cart drawer
- Bottom navigation (mobile)
- Breadcrumbs

**Components**:

**Desktop**:
- Navbar (sticky):
  - Logo
  - Category mega menu
  - Search bar
  - User menu
  - Wishlist icon
  - Cart icon
  - Notification bell
- Footer:
  - Company info
  - Quick links
  - Categories
  - Contact info
  - Trust badges
  - Newsletter
  - Social links
  - Payment methods

**Mobile**:
- Top navbar (minimal)
- Bottom navigation (5 tabs):
  - Home
  - Categories
  - Cart/Quote (user-dependent label)
  - Wishlist
  - Profile
- Search bar
- Cart drawer
- Menu drawer

**Notification System**:
- Real-time notifications (Pusher)
- Notification bell with badge count
- Notification sidebar (desktop)
- Notification types:
  - Order updates
  - Quote responses
  - Payment confirmations
  - Business verification updates
  - Promotions

---

### 5.10 Orders Module (`modules/orders`)

**Access**: Authenticated users  
**Full Access**: Verified business only

**Features**:
- Order history
- Order detail view
- Order tracking
- Reorder functionality
- Cancel order (if allowed)
- Download invoice (verified business)
- Order status updates
- Shipment tracking

**Order Statuses**:
- `pending`: Payment pending
- `confirmed`: Payment confirmed
- `processing`: Order being prepared
- `shipped`: Dispatched
- `delivered`: Completed
- `cancelled`: Order cancelled

**Sections** (Order Detail Page):
1. Order header:
   - Order number
   - Order date
   - Status badge
2. Order items
3. Shipping address
4. Billing address
5. Payment information
6. Order timeline
7. Action buttons (Cancel, Reorder, Download Invoice)

---

### 5.11 Wishlist Module (`modules/wishlist`)

**Features**:
- Add/remove products
- Wishlist persistence
- Move to cart/quote
- Product availability check
- Price updates
- Share wishlist (future)

**Sections** (Wishlist Page):
1. Wishlist header (item count)
2. Product grid
3. Product card:
   - Thumbnail
   - Title
   - Price (user-dependent)
   - Stock status
   - Add to Cart/Quote
   - Remove from Wishlist
4. Empty state
5. Recommended products

---

### 5.12 Dashboard Module (`modules/dashboard`)

**Features**:
- User-type specific dashboards
- Stats overview (orders, quotes, spending)
- Recent activity
- Quick actions
- Performance metrics (business)
- Analytics charts (business)

**Individual Dashboard**:
- Total Orders
- Active Quotes
- Wishlist Count
- Recent Orders (5 latest)
- Recent Quotes (5 latest)
- Quick Actions (New Quote, Browse Products, View Wishlist)

**Business Dashboard** (Additional):
- Monthly Spending
- Conversion Rate
- Average Order Value
- Quote Success Rate
- Performance Charts
- Team Activity (future)
- Bulk Actions

---

## 6. Page Sections & Logics

### 6.1 Product Catalog Page Logic

**URL Patterns**:
- `/catalog` - All products
- `/catalog?category=[slug]` - Category filter
- `/catalog?application=[slug]` - Application filter
- `/catalog?q=[query]` - Search results
- `/catalog?collection=[slug]` - Collection filter

**Filters Available**:
- Category/Subcategory
- Application Type
- Price Range
- Stock Status
- Elevator Type
- Voltage Range
- Load Capacity Range
- Speed Range

**Logic**:
```
IF user = guest:
  - Show products WITHOUT prices
  - CTA = "Sign in to see prices"
  
IF user = individual OR business_unverified:
  - Show products WITH prices
  - Show discount percentages
  - Add to Cart button (enabled)
  - Add to Quote button
  
IF user = business_verified:
  - Show products WITH prices
  - Show bulk pricing indicators
  - Show special business pricing
  - Add to Cart button (enabled)
  - Quick quote button
```

**Sections**:
1. **Banner Section** (conditional)
   - Show for: Categories, Applications
   - Hide for: Collections, Search, All Products
   - Content: Hero image, title, description
   
2. **Breadcrumb** (always)
   - Home > [Category] > [Subcategory]
   
3. **Filters Sidebar** (conditional)
   - Show for: Collections, All Products, Search
   - Hide for: Categories, Applications
   - Content: Price, Stock, Specifications, Type
   
4. **Product Grid**
   - Responsive (1/2/3/4 columns based on screen)
   - Lazy loading
   - Infinite scroll or pagination
   
5. **Sort Options**
   - Price: Low to High
   - Price: High to Low
   - Name: A-Z
   - Newest First
   - Featured

---

### 6.2 Product Detail Page Logic

**Price Display Logic**:
```javascript
const getPriceDisplay = (userType) => {
  if (userType === 'guest') {
    return {
      showPrice: false,
      message: 'Sign in to see prices'
    }
  }
  
  if (['individual', 'business_unverified'].includes(userType)) {
    return {
      showPrice: true,
      showMRP: true,
      showDiscount: true,
      showBulkPricing: false
    }
  }
  
  if (userType === 'business_verified') {
    return {
      showPrice: true,
      showMRP: true,
      showDiscount: true,
      showBulkPricing: true,
      showSpecialPricing: true
    }
  }
}
```

**Add to Cart/Quote Logic**:
```javascript
const getActionButton = (userType) => {
  if (userType === 'guest') {
    return {
      button: 'Sign In to Add',
      action: 'redirect_to_signin'
    }
  }
  
  if (['individual', 'business_unverified'].includes(userType)) {
    return {
      cartButton: 'Add to Cart',
      cartEnabled: true,
      quoteButton: 'Add to Quote',
      quoteEnabled: true,
      checkoutEnabled: false  // Cart fills but checkout blocked
    }
  }
  
  if (userType === 'business_verified') {
    return {
      cartButton: 'Add to Cart',
      cartEnabled: true,
      quoteButton: 'Quick Quote',
      quoteEnabled: true,
      checkoutEnabled: true
    }
  }
}
```

---

### 6.3 Cart Page Logic

**Cart Access**:
```javascript
// All authenticated users can access cart
// Guest users see local storage cart

const getCartBehavior = (userType) => {
  if (userType === 'guest') {
    return {
      storage: 'localStorage',
      persistence: false,
      showPrices: false,
      checkoutButton: 'Sign In to Continue'
    }
  }
  
  if (['individual', 'business_unverified'].includes(userType)) {
    return {
      storage: 'database',
      persistence: true,
      showPrices: true,
      checkoutButton: 'Request Quote', // Checkout blocked
      checkoutEnabled: false,
      message: 'Direct checkout not available. Please request a quote.'
    }
  }
  
  if (userType === 'business_verified') {
    return {
      storage: 'database',
      persistence: true,
      showPrices: true,
      showBulkDiscounts: true,
      checkoutButton: 'Proceed to Checkout',
      checkoutEnabled: true
    }
  }
}
```

**Bulk Discount Calculation** (Verified Business):
```javascript
const calculateBulkDiscount = (cartItems) => {
  let totalDiscount = 0
  
  cartItems.forEach(item => {
    const quantity = item.quantity
    const tier = DISCOUNT_TIERS.findLast(t => quantity >= t.minQty)
    
    if (tier) {
      const discount = item.price * quantity * (tier.discount / 100)
      totalDiscount += discount
    }
  })
  
  return totalDiscount
}
```

---

### 6.4 Checkout Flow Logic

**Step Determination**:
```javascript
const determineCheckoutStep = (userType) => {
  if (userType === 'guest') {
    return 'email_capture'  // Collect email only
  }
  
  if (['individual', 'business_unverified'].includes(userType)) {
    return 'blocked'  // Show blocked screen with message
  }
  
  if (userType === 'business_verified') {
    return 'shipping'  // Proceed to checkout flow
  }
}
```

**Checkout Steps** (Verified Business):
```
Step 1: Shipping
  - Select/add address
  - Contact info
  - GSTIN (optional)
  ↓
Step 2: Delivery
  - Standard (5-7 days)
  - Express (2-3 days)
  - Custom delivery
  ↓
Step 3: Payment
  - Credit Terms (30-day NET)
  - Purchase Order Upload
  - Razorpay (instant)
  - Bank Transfer
  ↓
Step 4: Review
  - Review all details
  - Order summary with bulk discounts
  - GST breakdown
  - Terms acceptance
  ↓
Step 5: Confirmation
  - Order placed
  - Order number
  - Email confirmation
  - Download invoice option
```

**Order Summary Calculation**:
```javascript
const calculateOrderSummary = (cart, deliveryOption, address, userType) => {
  const subtotal = cart.items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0)
  
  // Bulk discount (verified business only)
  const bulkDiscount = userType === 'business_verified' 
    ? calculateBulkDiscount(cart.items)
    : 0
  
  // Shipping
  const shipping = deliveryOption.price
  
  // GST (18%)
  const taxableAmount = subtotal - bulkDiscount + shipping
  const gstRate = 0.18
  const isSameState = address.state === 'Maharashtra' // Example
  
  const gst = isSameState
    ? { cgst: taxableAmount * 0.09, sgst: taxableAmount * 0.09, igst: 0 }
    : { cgst: 0, sgst: 0, igst: taxableAmount * gstRate }
  
  const totalGst = gst.cgst + gst.sgst + gst.igst
  
  // Total
  const total = taxableAmount + totalGst
  
  return {
    subtotal,
    bulkDiscount,
    shipping,
    gst,
    totalGst,
    total
  }
}
```

---

### 6.5 Quote Request Logic

**Form Type Selection**:
```javascript
const getQuoteFormType = (userType) => {
  if (userType === 'guest') {
    return {
      formType: 'guest',
      requiresContactInfo: true,
      maxNotes: 200,
      maxAttachments: 0,
      requiresCompanyDetails: false,
      hasTemplates: false
    }
  }
  
  if (userType === 'individual') {
    return {
      formType: 'individual',
      requiresContactInfo: false,  // From user profile
      maxNotes: 500,
      maxAttachments: 1,
      requiresCompanyDetails: false,
      hasTemplates: false
    }
  }
  
  if (userType === 'business_unverified') {
    return {
      formType: 'business',
      requiresContactInfo: false,
      maxNotes: 1000,
      maxAttachments: 2,
      requiresCompanyDetails: true,
      hasTemplates: false
    }
  }
  
  if (userType === 'business_verified') {
    return {
      formType: 'business_verified',
      requiresContactInfo: false,
      maxNotes: 1000,
      maxAttachments: 5,
      requiresCompanyDetails: true,
      hasTemplates: true,
      bulkUpload: true
    }
  }
}
```

**Quote Submission Flow**:
```
1. User adds items to quote basket
2. Clicks "Request Quote"
3. Navigates to /request-quote
4. Form displays based on user type
5. User fills required fields
6. Uploads attachments (if allowed)
7. Submits quote
8. Quote saved with status "pending"
9. Admin notified
10. User redirected to quote detail page
```

---

## 7. Business Verification Workflow

### 7.1 Verification Process

```
Step 1: Create Business Account
  ↓
Step 2: Complete Business Profile
  - Company name
  - Business address
  - Contact details
  ↓
Step 3: Upload Documents
  - GST Certificate (required)
  - PAN Card (required)
  - Business License (optional)
  ↓
Step 4: Submit for Verification
  - Status: "pending"
  - Admin notified
  ↓
Step 5: Admin Review
  - Document verification
  - Business validation
  - Decision: Approve/Reject
  ↓
Step 6a: If Approved
  - Status: "verified"
  - Email notification sent
  - Full features unlocked
  - Can now checkout
  ↓
Step 6b: If Rejected
  - Status: "rejected"
  - Email with reason sent
  - Can resubmit documents
  - Remains "unverified"
```

### 7.2 Document Requirements

| Document Type | Status | File Types | Max Size | Validation |
|--------------|--------|-----------|----------|------------|
| GST Certificate | Required | PDF, JPEG, PNG | 5 MB | GST number format |
| PAN Card | Required | PDF, JPEG, PNG | 5 MB | PAN format |
| Business License | Optional | PDF, JPEG, PNG | 5 MB | - |

### 7.3 Verification Statuses

```typescript
type VerificationStatus = 
  | 'unverified'    // Initial state
  | 'pending'       // Documents submitted, awaiting review
  | 'verified'      // Approved by admin
  | 'rejected'      // Documents rejected
```

### 7.4 Status-Based Features

**Unverified Business**:
- ❌ Cannot checkout
- ❌ Cannot see bulk pricing
- ❌ Cannot access payment methods
- ❌ Limited quote attachments (2)
- ❌ Cannot download invoices
- ✅ Can upload verification documents
- ✅ Can add to cart
- ✅ Can request quotes

**Verified Business**:
- ✅ Full checkout access
- ✅ See bulk pricing
- ✅ Manage payment methods
- ✅ Enhanced quote capabilities (5 attachments)
- ✅ Download invoices
- ✅ Quote templates
- ✅ Bulk CSV upload
- ✅ Priority support
- ✅ Dedicated account manager

---

## 8. Checkout Flow by User Type

### 8.1 Guest User Checkout Attempt

```
Guest adds to cart (local storage)
  ↓
Clicks "Checkout" or views cart
  ↓
Redirected to /sign-in
  ↓
After sign-in:
  - Cart migrated to database
  - User type determines next step
```

### 8.2 Individual User Checkout Attempt

```
Individual user has items in cart
  ↓
Clicks "Checkout"
  ↓
Redirected to /checkout
  ↓
Checkout page loads with step = "blocked"
  ↓
Blocked Screen Displayed:
  - Icon: Lock/Restricted
  - Title: "Direct Checkout Not Available"
  - Message: "Individual accounts can request quotes but cannot place direct orders."
  - Options:
    1. "Request Quote Instead" (green button)
    2. "Upgrade to Business Account" (link)
    3. "Contact Sales" (link)
  ↓
User selects option:
  Option 1 → Redirected to /request-quote (cart items copied to quote basket)
  Option 2 → Redirected to upgrade flow
  Option 3 → Opens contact form/chat
```

### 8.3 Business Unverified Checkout Attempt

```
Business unverified user has items in cart
  ↓
Clicks "Checkout"
  ↓
Redirected to /checkout
  ↓
Checkout page loads with step = "blocked"
  ↓
Blocked Screen Displayed:
  - Icon: Clock/Pending
  - Title: "Verification Required"
  - Message: "Your business account is pending verification. Please complete verification to place orders."
  - Verification Status Card:
    - Document upload status
    - Pending review indicator
  - Options:
    1. "Complete Verification" (green button) → /profile/verification
    2. "Request Quote Instead" (secondary button) → /request-quote
    3. "Contact Support" (link)
  ↓
User selects option:
  Option 1 → Redirected to verification page
  Option 2 → Redirected to quote request
  Option 3 → Opens support chat
```

### 8.4 Business Verified Checkout Flow

```
Business verified user has items in cart
  ↓
Clicks "Proceed to Checkout"
  ↓
Redirected to /checkout
  ↓
STEP 1: Shipping Information
  ├─ Select existing address OR add new address
  ├─ Fields:
  │   - Name
  │   - Company
  │   - Address Line 1
  │   - Address Line 2
  │   - City
  │   - State
  │   - Postal Code
  │   - Phone
  │   - GSTIN (optional)
  ├─ "Same as Billing" checkbox
  ├─ Validation on submit
  └─ Click "Continue to Delivery"
  ↓
STEP 2: Delivery Options
  ├─ Radio options:
  │   ○ Standard Shipping (5-7 days) - ₹0
  │   ○ Express Shipping (2-3 days) - ₹500
  │   ○ Custom Delivery - Contact us
  ├─ Estimated delivery date shown
  └─ Click "Continue to Payment"
  ↓
STEP 3: Payment Method
  ├─ Radio options:
  │   ○ Credit Terms (30-day NET) - For verified accounts
  │   ○ Purchase Order Upload - Upload PO document
  │   ○ Razorpay (Card/UPI/Netbanking) - Instant payment
  │   ○ Bank Transfer - NEFT/RTGS details shown
  ├─ If PO Upload selected:
  │   - File upload field
  │   - PO number input
  │   - PO date picker
  ├─ Payment terms display
  └─ Click "Continue to Review"
  ↓
STEP 4: Review Order
  ├─ Review Sections:
  │   1. Shipping Address (with edit link)
  │   2. Billing Address (with edit link)
  │   3. Delivery Method (with edit link)
  │   4. Payment Method (with edit link)
  │   5. Order Items:
  │      - Product list with quantities
  │      - Unit prices
  │      - Line totals
  │   6. Order Summary:
  │      - Subtotal: ₹XX,XXX
  │      - Bulk Discount: -₹X,XXX (if applicable)
  │      - Shipping: ₹XXX
  │      - CGST (9%): ₹X,XXX (or IGST 18%)
  │      - SGST (9%): ₹X,XXX
  │      - Total: ₹XX,XXX
  ├─ Terms and Conditions:
  │   - [x] I accept the terms and conditions
  │   - [x] I authorize the payment
  ├─ Additional requirements (textarea, optional)
  └─ Click "Place Order"
  ↓
Order Processing:
  ├─ If Razorpay:
  │   - Razorpay modal opens
  │   - User completes payment
  │   - Payment verified
  ├─ If other methods:
  │   - Order created with pending payment
  ├─ Order saved to database
  ├─ Cart cleared
  ├─ Email confirmation sent
  ├─ Invoice generated
  └─ Inventory updated
  ↓
STEP 5: Order Confirmation
  ├─ Success message
  ├─ Order number displayed
  ├─ Order summary
  ├─ Estimated delivery date
  ├─ Payment confirmation
  ├─ Actions:
  │   - Download Invoice
  │   - Track Order
  │   - View Order Details
  │   - Continue Shopping
  └─ Email confirmation notification
```

### 8.5 Checkout Order Summary (Sidebar)

**Always Visible During Checkout**:

```
Order Summary
─────────────────────
Items (X):
  Product 1 × 2    ₹5,000
  Product 2 × 1    ₹3,000
─────────────────────
Subtotal         ₹8,000

Bulk Discount    -₹800
(10% off for 10+ units)

Shipping         ₹500
(Express delivery)

Tax (GST 18%):
  CGST (9%)      ₹693
  SGST (9%)      ₹693
─────────────────────
Total           ₹9,086
─────────────────────

Secure Checkout 🔒
```

---

## Summary

This document provides a complete overview of the Cedar Elevators e-commerce store focusing on:

✅ **4 User Types**: Guest, Individual, Business Unverified, Business Verified  
✅ **Pricing Strategy**: User-type based visibility and bulk discount tiers  
✅ **Quote Management**: Multi-tier quote system with different capabilities  
✅ **21+ Pages**: Comprehensive mobile and desktop coverage  
✅ **13 Modules**: Feature-rich modular architecture  
✅ **Detailed Logic**: Step-by-step flows for key user journeys  
✅ **Business Verification**: Complete workflow from unverified to verified  
✅ **Checkout System**: User-type dependent checkout behavior  

**Key Differentiator**: The platform uniquely combines B2C browsing with B2B quote management and verification workflows, providing a seamless experience for individual buyers while offering enhanced capabilities for verified business accounts.

---

**End of Document**
