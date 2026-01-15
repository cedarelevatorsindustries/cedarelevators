# Cedar Elevators - Admin Panel Complete Overview

**Last Updated**: December 28, 2025  
**Version**: 1.0  
**Tech Stack**: Next.js 16 + React 19 + TypeScript + Supabase Auth + TanStack Query

---

## Table of Contents

1. [Admin Access & Authentication](#admin-access--authentication)
2. [Admin Role Hierarchy](#admin-role-hierarchy)
3. [Dashboard Overview](#dashboard-overview)
4. [Admin Pages & Routes](#admin-pages--routes)
5. [Module Breakdown](#module-breakdown)
6. [Features by Module](#features-by-module)
7. [Page Sections & Components](#page-sections--components)
8. [Permissions Matrix](#permissions-matrix)
9. [Admin Workflows](#admin-workflows)

---

## 1. Admin Access & Authentication

### 1.1 Authentication System

**Auth Provider**: Supabase Auth (Native)  
**Session Management**: JWT tokens with httpOnly cookies  
**Security**: Row Level Security (RLS) enabled on all admin tables

#### Login Process
```
1. Navigate to /admin/login
2. Enter email + password
3. Backend verifies credentials against admin_profiles table
4. Check if admin is_active = true
5. Check if admin is_approved = true
6. Create Supabase Auth session
7. Store role in session metadata
8. Redirect to /admin (dashboard)
```

#### First-Time Setup Process
```
1. Navigate to /admin/setup (one-time only)
2. Enter ADMIN_SETUP_KEY (from environment)
3. Create super admin account:
   - Email
   - Password (min 8 chars)
   - Confirm password
4. System creates:
   - Supabase Auth user
   - admin_profiles entry (role: super_admin)
   - Generates recovery key
5. Download recovery key (shown once)
6. Mark setup as complete in admin_settings
7. Redirect to /admin/login
```

#### Security Features
- ✅ Row Level Security (RLS) on database
- ✅ Role-based access control (RBAC)
- ✅ Approval workflow for new admins
- ✅ Session timeout and refresh
- ✅ Password hashing (Supabase bcrypt)
- ✅ Recovery key system
- ✅ Audit trail (who approved, when)
- ✅ IP logging (optional)
- ✅ Protected routes via middleware

---

## 2. Admin Role Hierarchy

### 2.1 Role Types

```typescript
type AdminRole = 'super_admin' | 'admin' | 'manager' | 'staff'
```

### 2.2 Role Permissions

| Role | Level | Permissions |
|------|-------|-------------|
| **Super Admin** | 4 | Full system access, user management, settings, all CRUD operations |
| **Admin** | 3 | All operations except super admin settings and user management |
| **Manager** | 2 | Manage products, orders, quotes, customers; No settings access |
| **Staff** | 1 | Read-only access to most features; Can update order status |

### 2.3 Detailed Permissions Matrix

#### Super Admin
- ✅ **Users**: Create, approve, suspend, delete admin users
- ✅ **Settings**: Modify all system settings
- ✅ **Products**: Full CRUD + bulk operations
- ✅ **Categories**: Full CRUD + hierarchy management
- ✅ **Orders**: Full CRUD + status changes
- ✅ **Quotes**: Full management + approval
- ✅ **Customers**: View, edit, verify business accounts
- ✅ **Inventory**: Full control
- ✅ **Banners**: Full CRUD
- ✅ **Collections**: Full CRUD
- ✅ **Analytics**: Full access
- ✅ **Recovery**: Can use recovery key

#### Admin
- ❌ **Users**: Cannot manage admin users
- ❌ **Settings**: Cannot modify system settings
- ✅ **Products**: Full CRUD + bulk operations
- ✅ **Categories**: Full CRUD
- ✅ **Orders**: Full management
- ✅ **Quotes**: Full management
- ✅ **Customers**: Full access
- ✅ **Inventory**: Full control
- ✅ **Banners**: Full CRUD
- ✅ **Collections**: Full CRUD
- ✅ **Analytics**: Full access

#### Manager
- ❌ **Users**: No access
- ❌ **Settings**: No access
- ✅ **Products**: Create, edit, delete (no bulk operations)
- ✅ **Categories**: Create, edit (cannot delete if has products)
- ✅ **Orders**: View, update status, cancel
- ✅ **Quotes**: View, respond, approve/reject
- ✅ **Customers**: View, edit (cannot delete)
- ✅ **Inventory**: Update stock levels
- ✅ **Banners**: View, edit (cannot delete)
- ✅ **Collections**: View only
- ⚠️ **Analytics**: Limited (own department only)

#### Staff
- ❌ **Users**: No access
- ❌ **Settings**: No access
- ⚠️ **Products**: View only
- ⚠️ **Categories**: View only
- ✅ **Orders**: View, update status to shipped/delivered
- ✅ **Quotes**: View, add internal notes
- ⚠️ **Customers**: View only
- ⚠️ **Inventory**: View only
- ⚠️ **Banners**: View only
- ⚠️ **Collections**: View only
- ❌ **Analytics**: No access

---

## 3. Dashboard Overview

### 3.1 Dashboard URL
```
/admin
```

### 3.2 Dashboard Sections

#### Quick Stats (Top Row)
Cards displaying real-time counts:
1. **Total Products** - Clickable → `/admin/products`
2. **Total Orders** - Clickable → `/admin/orders`
3. **Quote Requests** - Clickable → `/admin/quotes`
4. **Categories** - Clickable → `/admin/categories`
5. **Customers** - Clickable → `/admin/customers`

Each card shows:
- Icon (colored orange)
- Label
- Count value
- "Click to manage" subtitle

#### Quick Actions Panel
Buttons for common tasks:
1. **Add Product** (Primary orange button) → `/admin/products/create`
2. **View Orders** → `/admin/orders`
3. **View Quotes** → `/admin/quotes`
4. **Settings** → `/admin/settings`

#### Getting Started Notice
Orange info card with setup instructions:
- Lists required database tables
- Mentions analytics setup
- Links to `/admin/settings`

### 3.3 Dashboard Components (When Fully Implemented)

**Additional sections available but not currently displayed**:

1. **Revenue Chart** (Line graph)
   - Last 7 days revenue trend
   - Daily breakdown
   - Total revenue comparison

2. **Orders Chart** (Bar chart)
   - Order count by day
   - Status breakdown
   - Conversion rate

3. **Recent Orders Table**
   - Last 10 orders
   - Order number, customer, total, status
   - Quick actions (view, update status)

4. **Recent Activity Feed**
   - System events log
   - User actions
   - Order updates
   - Quote submissions

5. **Top Products**
   - Best sellers
   - Revenue per product
   - Stock levels

6. **Category Performance**
   - Sales by category
   - Trending categories
   - Underperforming categories

7. **Campaign Performance**
   - Active campaigns
   - Conversion rates
   - ROI metrics

---

## 4. Admin Pages & Routes

### 4.1 Authentication Pages

| Page | Route | Description | Access |
|------|-------|-------------|--------|
| **Login** | `/admin/login` | Admin login page | Public |
| **Setup** | `/admin/setup` | First-time super admin setup | One-time (requires setup key) |
| **Recover** | `/admin/recover` | Account recovery using recovery key | Public |
| **Logout** | `/admin/logout` | Logout and clear session | Authenticated |
| **Pending** | `/admin/pending` | Pending approval page | Authenticated (unapproved) |

### 4.2 Main Admin Pages

| Page | Route | Description | Min Role |
|------|-------|-------------|----------|
| **Dashboard** | `/admin` | Main dashboard | Staff |
| **Orders List** | `/admin/orders` | All orders table | Staff |
| **Order Detail** | `/admin/orders/[id]` | Single order details | Staff |
| **Quotes List** | `/admin/quotes` | All quote requests | Staff |
| **Quote Detail** | `/admin/quotes/[id]` | Single quote details | Staff |
| **Products List** | `/admin/products` | All products table | Staff |
| **Product Detail** | `/admin/products/[id]` | Single product view | Staff |
| **Product Edit** | `/admin/products/[id]/edit` | Edit product | Manager |
| **Product Create** | `/admin/products/create` | Create new product | Manager |
| **Product Import** | `/admin/products/import` | Bulk CSV import | Admin |
| **Variants List** | `/admin/products/[id]/variants` | Product variants | Staff |
| **Variant Detail** | `/admin/products/[id]/variants/[variantId]` | Variant details | Staff |
| **Categories List** | `/admin/categories` | Category tree view | Staff |
| **Category Create** | `/admin/categories/create` | Create category (wizard) | Manager |
| **Category Edit** | `/admin/categories/[id]/edit` | Edit category | Manager |
| **Collections** | `/admin/collections` | Collections management | Staff |
| **Banners List** | `/admin/banners` | Banner management | Staff |
| **Banner Create** | `/admin/banners/create` | Create banner | Manager |
| **Banner Edit** | `/admin/banners/[id]/edit` | Edit banner | Manager |
| **Inventory** | `/admin/inventory` | Stock management | Staff |
| **Customers List** | `/admin/customers` | All customers | Staff |
| **Customer Detail** | `/admin/customers/[id]` | Customer profile & orders | Staff |
| **Coupons** | `/admin/coupons` | Coupon management | Manager |

### 4.3 Settings Pages

| Page | Route | Description | Min Role |
|------|-------|-------------|----------|
| **Settings Home** | `/admin/settings` | Settings dashboard | Admin |
| **Store Settings** | `/admin/settings/store` | Store info, branding | Super Admin |
| **Shipping Settings** | `/admin/settings/shipping` | Shipping zones, rates | Admin |
| **Tax Settings** | `/admin/settings/tax` | Tax rates, GST config | Admin |
| **Payment Settings** | `/admin/settings/payments` | Payment gateways | Super Admin |
| **Locations** | `/admin/settings/locations` | Store locations | Admin |
| **Admin Users** | `/admin/settings/users` | Manage admin accounts | Super Admin |
| **Profile Settings** | `/admin/settings/profile` | Admin's own profile | Staff |
| **System Settings** | `/admin/settings/system` | System configuration | Super Admin |

---

## 5. Module Breakdown

### 5.1 Admin Modules Structure

```
src/
├── app/admin/                 # Admin routes
│   ├── (auth)/               # Auth pages (login, setup, recover)
│   ├── banners/              # Banner management
│   ├── categories/           # Category management
│   ├── collections/          # Collection management
│   ├── coupons/              # Coupon management
│   ├── customers/            # Customer management
│   ├── inventory/            # Inventory management
│   ├── orders/               # Order management
│   ├── products/             # Product management
│   ├── quotes/               # Quote management
│   ├── settings/             # Settings pages
│   ├── layout.tsx            # Admin layout wrapper
│   └── page.tsx              # Dashboard
│
├── modules/admin/            # Admin UI components
│   ├── banner-creation/      # Banner creation wizard
│   ├── common/               # Shared components
│   ├── customers/            # Customer UI components
│   ├── dashboard/            # Dashboard widgets
│   ├── inventory/            # Inventory UI
│   ├── orders/               # Order UI components
│   ├── product-creation/     # Product creation wizard
│   ├── product-detail/       # Product detail views
│   ├── product-edit/         # Product editing
│   ├── products/             # Product list components
│   ├── settings/             # Settings UI
│   └── variants/             # Variant management
│
└── components/common/        # Admin-wide shared components
    ├── sidebar.tsx           # Navigation sidebar
    └── header.tsx            # Top header
```

---

## 6. Features by Module

### 6.1 Dashboard Module

**Features**:
- Quick stats cards
- Revenue chart (line)
- Orders chart (bar)
- Recent orders table
- Recent activity feed
- Top products list
- Category performance
- Campaign metrics
- Quick action buttons

**Components**:
- `DashboardStats` - Quick stat cards
- `RevenueChart` - Revenue trend line chart
- `OrdersChart` - Order count bar chart
- `RecentOrders` - Recent orders table
- `RecentActivity` - Activity feed
- `TopProducts` - Best sellers list
- `CategoryPerformance` - Category stats
- `CampaignPerformance` - Campaign metrics

---

### 6.2 Product Management Module

**Features**:
- Product list table with filters
- Advanced search (title, SKU, category)
- Product creation wizard (multi-step)
- Elevator-specific fields:
  - Voltage (V)
  - Speed (m/s)
  - Load Capacity (kg)
  - Application type
  - Elevator type
- Image management (multiple images)
- Variant management
- Bulk operations:
  - Bulk delete
  - Bulk status change
  - Bulk price update
  - CSV export
  - CSV import
- Stock management per product
- Product duplication
- Product preview

**Product List Page Sections**:
1. **Header**
   - Title
   - "Add Product" button
   - "Import Products" button

2. **Filters & Search**
   - Search by title/SKU
   - Filter by category
   - Filter by status (active/inactive)
   - Filter by stock (in stock/low stock/out of stock)
   - Sort options

3. **Product Table**
   - Columns:
     - Checkbox (for bulk actions)
     - Thumbnail
     - Product Name
     - SKU
     - Category
     - Price
     - Stock
     - Status
     - Actions (Edit, Delete, Duplicate)
   - Pagination
   - Items per page selector

4. **Bulk Actions Bar** (appears when items selected)
   - Delete selected
   - Change status
   - Export selected
   - Update prices

**Product Creation Wizard Steps**:

**Step 1: Basic Information**
- Product title
- Handle (slug)
- Short description
- Full description (rich text)
- Category/subcategory selector
- Application type
- Elevator type

**Step 2: Pricing & Inventory**
- MRP (Maximum Retail Price)
- Selling price
- Bulk price (optional)
- SKU (auto-generated or custom)
- Stock quantity
- Low stock threshold
- Track inventory checkbox

**Step 3: Specifications**
- Elevator-specific:
  - Voltage (V)
  - Speed (m/s)
  - Load Capacity (kg)
  - Number of floors
  - Cabin size
- Generic specifications (key-value pairs)
- Technical details

**Step 4: Images**
- Upload multiple images
- Drag to reorder
- Set primary thumbnail
- Image alt text
- Image optimization preview

**Step 5: Variants** (Optional)
- Create variants (size, color, model, etc.)
- Variant SKU
- Variant price
- Variant stock
- Variant images

**Step 6: SEO & Publishing**
- Meta title
- Meta description
- URL slug confirmation
- Publish status (draft/active)
- Featured product checkbox
- Review & submit

**Components**:
- `ProductList` - Main product table
- `ProductFilters` - Filter sidebar
- `ProductSearch` - Search bar
- `ProductCard` - Product list item
- `ProductCreationWizard` - Multi-step form
- `ProductEditor` - Edit product form
- `ImageUploader` - Image management
- `VariantManager` - Variant CRUD
- `BulkActionsBar` - Bulk operation controls
- `ProductPreview` - Preview product page

---

### 6.3 Category Management Module

**Features**:
- 3-layer hierarchy (Application → Category → Subcategory)
- Category tree view
- Drag-and-drop reordering
- Category creation wizard
- Bulk delete
- Category image upload
- Icon selector
- Sort order management
- Active/inactive toggle

**Category Hierarchy**:
```
Application (Top Level)
└── Category (Level 2)
    └── Subcategory (Level 3)
```

**Category List Page Sections**:
1. **Header**
   - Title
   - "Create Category" button
   - "View Tree" / "View List" toggle

2. **Tree View**
   - Expandable/collapsible tree
   - Drag-and-drop to reorder or reparent
   - Quick actions per node (Edit, Delete, Add Child)
   - Icon/image preview
   - Product count per category

3. **List View** (Alternative)
   - Table with nested indentation
   - Level indicator
   - Parent category
   - Product count
   - Status
   - Actions

**Category Creation Wizard**:

**Step 1: Basic Info**
- Category name
- Slug (auto-generated)
- Description
- Select parent (if subcategory)
- Level validation (max 3 levels)

**Step 2: Media & Icon**
- Upload category image
- Select icon from library
- Image cropping
- Icon color picker

**Step 3: Settings**
- Sort order
- Active/inactive status
- Meta title & description
- Display settings

**Components**:
- `CategoryTree` - Tree view component
- `CategoryNode` - Single category in tree
- `CategoryList` - Table list view
- `CategoryWizard` - Creation wizard
- `CategoryEditor` - Edit form
- `IconPicker` - Icon selection
- `ImageUploader` - Image upload

---

### 6.4 Order Management Module

**Features**:
- Order list table
- Order detail view
- Order status workflow
- Order timeline
- Update order status
- Cancel order (with inventory restore)
- Print packing slip
- Print invoice
- Generate PDF invoice
- Email customer
- Add internal notes
- Refund processing (future)
- Shipment tracking

**Order Statuses**:
```
pending → confirmed → processing → shipped → delivered
                                      ↓
                                  cancelled
```

**Order List Page Sections**:
1. **Header**
   - Title
   - Total orders count
   - Date range picker
   - Export button

2. **Filters**
   - Status filter (all, pending, confirmed, etc.)
   - Date range
   - Customer search
   - Payment status
   - Order value range

3. **Orders Table**
   - Columns:
     - Order number
     - Customer name
     - Order date
     - Items count
     - Total amount
     - Payment status
     - Order status (badge)
     - Actions (View, Update)
   - Pagination
   - Sort options

**Order Detail Page Sections**:
1. **Order Header**
   - Order number
   - Order date
   - Status badge with dropdown to update
   - Quick actions (Print Invoice, Email Customer, Cancel)

2. **Customer Information**
   - Customer name
   - Email
   - Phone
   - User type (individual/business/verified)
   - Order history link

3. **Order Items Table**
   - Product thumbnail
   - Product name
   - SKU
   - Quantity
   - Unit price
   - Subtotal
   - Links to product

4. **Shipping Information**
   - Shipping address
   - Billing address
   - Delivery method
   - Tracking number (if shipped)
   - Estimated delivery

5. **Payment Information**
   - Payment method
   - Payment status
   - Transaction ID
   - Payment date

6. **Order Summary**
   - Items subtotal
   - Bulk discount (if applicable)
   - Shipping cost
   - GST breakdown (CGST/SGST/IGST)
   - Total amount
   - Amount paid

7. **Order Timeline**
   - Status change history
   - Admin notes
   - System events
   - Timestamps

8. **Actions**
   - Update status dropdown
   - Cancel order (with confirmation)
   - Resend confirmation email
   - Download invoice
   - Print packing slip
   - Add internal note

**Components**:
- `OrderList` - Orders table
- `OrderFilters` - Filter controls
- `OrderCard` - Order list item
- `OrderDetail` - Full order view
- `OrderTimeline` - Status history
- `OrderActions` - Action buttons
- `StatusBadge` - Order status display
- `InvoiceGenerator` - PDF generation
- `ShippingInfo` - Shipping details card
- `PaymentInfo` - Payment details card

---

### 6.5 Quote Management Module

**Features**:
- Quote requests list
- Quote detail view
- Quote status management
- Quote approval/rejection
- Respond to quotes
- Add pricing to quote items
- Apply discounts
- Quote timeline
- Message customer
- Attachment management
- Quote-to-order conversion
- Quote PDF generation

**Quote Statuses**:
```
pending → in_review → negotiation → revised → accepted/rejected
                                              ↓
                                          converted (to order)
```

**Quote List Page Sections**:
1. **Header**
   - Title
   - Total quotes count
   - Priority filters (All, High, Medium, Low)

2. **Filters**
   - Status filter
   - User type filter (Guest, Individual, Business, Verified)
   - Date range
   - Priority level
   - Search by quote number or customer

3. **Quotes Table**
   - Columns:
     - Quote number
     - Customer name/email
     - User type badge
     - Submitted date
     - Items count
     - Priority badge
     - Status badge
     - Actions (View, Respond)
   - Sort options
   - Pagination

**Quote Detail Page Sections**:
1. **Quote Header**
   - Quote number
   - Status badge with update dropdown
   - Priority badge
   - Submitted date
   - Valid until date
   - Quick actions (Approve, Reject, Convert to Order)

2. **Customer Information**
   - User type badge
   - Name/Email/Phone
   - Company details (if business)
   - GST/PAN (if provided)
   - Quote history link

3. **Quote Items Table**
   - Product thumbnail
   - Product name
   - SKU
   - Requested quantity
   - **Admin Fields** (editable):
     - Unit price
     - Discount %
     - Total price
   - Bulk pricing requested indicator
   - Item notes

4. **Quote Summary** (Admin controlled)
   - Subtotal
   - Total discount
   - Tax (GST 18%)
   - Estimated total
   - Save quote summary button

5. **Request Details**
   - Customer notes
   - Company details (business users)
   - Attachments (download links)

6. **Quote Timeline**
   - Status changes
   - Messages (customer ↔ admin)
   - Admin notes (internal)
   - Attachments
   - Timestamps

7. **Admin Actions**
   - **Message Customer** - Send response or question
   - **Add Internal Note** - Visible only to admins
   - **Update Pricing** - Set prices, discounts
   - **Approve Quote** - Send final quote to customer
   - **Reject Quote** - With reason
   - **Convert to Order** - Create order from approved quote (verified business only)
   - **Download PDF** - Generate quote PDF
   - **Email Quote** - Send quote via email

8. **Messaging Section**
   - Thread of messages
   - Reply box (visible to customer)
   - Internal notes box (admin only)
   - Attach files
   - Send button

**Components**:
- `QuoteList` - Quotes table
- `QuoteFilters` - Filter controls
- `QuoteCard` - Quote list item
- `QuoteDetail` - Full quote view
- `QuoteTimeline` - Status and message history
- `QuotePricing` - Admin pricing form
- `QuoteActions` - Action buttons
- `MessageThread` - Quote messages
- `QuoteToOrderConverter` - Conversion flow
- `QuotePDFGenerator` - PDF generation

---

### 6.6 Customer Management Module

**Features**:
- Customer list table
- Customer detail view
- Customer order history
- Customer quote history
- Business verification management
- View business documents
- Approve/reject business verification
- Customer notes
- Customer segmentation
- Export customer data

**Customer List Page Sections**:
1. **Header**
   - Title
   - Total customers count
   - Export button

2. **Filters**
   - User type (All, Individual, Business, Verified Business)
   - Registration date range
   - Order count range
   - Total spent range
   - Verification status (for business)

3. **Customers Table**
   - Columns:
     - Name
     - Email
     - User type badge
     - Verification status (for business)
     - Total orders
     - Total spent
     - Registration date
     - Actions (View)
   - Sort options
   - Pagination

**Customer Detail Page Sections**:
1. **Customer Header**
   - Name
   - Email
   - Phone
   - User type badge
   - Verification badge (business)
   - Registration date
   - Last active date

2. **Customer Stats**
   - Total orders
   - Total spent
   - Average order value
   - Pending quotes
   - Successful quotes

3. **Account Information**
   - Email
   - Phone
   - Account type
   - Company name (business)
   - Created date
   - Last login

4. **Business Verification** (Business users only)
   - Verification status badge
   - Uploaded documents:
     - GST Certificate (view/download)
     - PAN Card (view/download)
     - Business License (view/download)
   - Document review status
   - Company details:
     - Company name
     - GST number
     - PAN number
     - Business address
   - **Admin Actions**:
     - Approve verification
     - Reject verification (with reason)
     - Request additional documents

5. **Order History**
   - Table of all orders
   - Order number
   - Date
   - Items count
   - Total
   - Status
   - Actions (View order)

6. **Quote History**
   - Table of all quotes
   - Quote number
   - Date
   - Items count
   - Status
   - Actions (View quote)

7. **Addresses**
   - Saved addresses list
   - Default address indicator

8. **Admin Notes** (Internal)
   - Add notes
   - Note history
   - Note timestamp and author

**Components**:
- `CustomerList` - Customers table
- `CustomerFilters` - Filter controls
- `CustomerCard` - Customer list item
- `CustomerDetail` - Full customer view
- `BusinessVerification` - Verification panel
- `DocumentViewer` - View uploaded documents
- `CustomerOrders` - Order history table
- `CustomerQuotes` - Quote history table
- `CustomerNotes` - Admin notes section

---

### 6.7 Inventory Management Module

**Features**:
- Stock levels overview
- Low stock alerts
- Out of stock alerts
- Stock adjustment
- Inventory log/history
- Bulk stock update
- Stock export

**Inventory Page Sections**:
1. **Header**
   - Title
   - Total products count
   - Low stock alerts badge

2. **Filters**
   - Stock status (All, In Stock, Low Stock, Out of Stock)
   - Category filter
   - Search by product name/SKU

3. **Inventory Table**
   - Columns:
     - Product thumbnail
     - Product name
     - SKU
     - Category
     - Current stock
     - Stock status badge
     - Last updated
     - Actions (Adjust Stock)
   - Sort by stock level
   - Pagination

4. **Low Stock Alerts Panel**
   - Products below threshold
   - Quick adjust button

5. **Stock Adjustment Modal**
   - Product info
   - Current stock
   - Adjustment type (Set, Add, Subtract)
   - Quantity
     - Reason/Note
   - Submit button

**Components**:
- `InventoryTable` - Stock levels table
- `StockAdjuster` - Stock update form
- `LowStockAlerts` - Alert panel
- `InventoryLog` - Stock change history
- `BulkStockUpdate` - Bulk adjustment

---

### 6.8 Banner Management Module

**Features**:
- Banner list
- Banner creation wizard
- Banner types:
  - Hero banners
  - Category banners
  - Promotional banners
- Banner positioning
- Active/inactive toggle
- Banner scheduling (start/end date)
- Banner analytics (clicks, views)

**Banner List Page**:
- Table of all banners
- Banner preview
- Banner type
- Position
- Status
- Schedule dates
- Actions (Edit, Delete, Toggle)

**Banner Creation Wizard Steps**:

**Step 1: Banner Type**
- Select type (Hero, Category, Promo)
- Select position

**Step 2: Content**
- Upload banner image
- Banner title
- Banner subtitle
- CTA text
- CTA link

**Step 3: Targeting**
- Target page (Home, Category, Product)
- Target user type (All, Guest, Individual, Business)

**Step 4: Schedule**
- Start date/time
- End date/time
- Always active checkbox

**Components**:
- `BannerList` - Banners table
- `BannerWizard` - Creation wizard
- `BannerPreview` - Preview component
- `BannerScheduler` - Scheduling form

---

### 6.9 Settings Module

#### 6.9.1 Store Settings
**Features**:
- Store name
- Store logo
- Store description
- Contact information
- Business address
- Social media links
- Operating hours

**Components**:
- `StoreInfoForm` - Store details form
- `LogoUploader` - Logo management
- `SocialLinksForm` - Social media links

#### 6.9.2 Shipping Settings
**Features**:
- Shipping zones
- Shipping rates
- Free shipping threshold
- Delivery timeframes
- Shipping carriers

**Components**:
- `ShippingZones` - Zone management
- `ShippingRates` - Rate configuration
- `CarrierSettings` - Carrier setup

#### 6.9.3 Tax Settings
**Features**:
- GST rate configuration
- Tax-inclusive/exclusive pricing
- CGST/SGST/IGST setup
- Tax exemptions

**Components**:
- `TaxRates` - Tax rate form
- `GSTConfiguration` - GST setup

#### 6.9.4 Payment Settings
**Features**:
- Razorpay configuration
- Credit terms setup (verified business)
- Bank transfer details
- Payment method visibility

**Components**:
- `PaymentGateways` - Gateway config
- `CreditTerms` - Credit setup
- `BankDetails` - Bank info form

#### 6.9.5 Admin Users Management
**Access**: Super Admin only

**Features**:
- List all admin users
- Create admin account
- Assign roles
- Approve/reject admin requests
- Suspend admin
- Delete admin
- View admin activity log

**Admin Users Page Sections**:
1. **Header**
   - Title
   - "Add Admin User" button

2. **Admin Users Table**
   - Columns:
     - Name
     - Email
     - Role badge
     - Status (Active, Pending, Suspended)
     - Approved by
     - Last active
     - Actions (Edit, Suspend, Delete)

3. **Create Admin Modal**
   - Email
   - Role selection
   - Send invitation checkbox
   - Require approval checkbox

**Components**:
- `AdminUsersList` - Admin table
- `AdminUserForm` - Create/edit form
- `RoleSelector` - Role dropdown
- `AdminActivityLog` - Activity history

---

## 7. Page Sections & Components

### 7.1 Admin Layout Components

#### Sidebar
**Location**: Left side (desktop), drawer (mobile)  
**Width**: 256px (expanded), 64px (collapsed)

**Sections**:
1. **Logo Section** (Top)
   - Cedar Admin logo
   - "Elevator Solutions" subtitle
   - Collapsible

2. **Main Navigation** (Middle, scrollable)
   - Dashboard
   - Orders
   - Quotes
   - Products
   - Categories
   - Collections
   - Banners
   - Inventory
   - Customers

3. **Bottom Navigation**
   - Settings
   - Logout

**Features**:
- Collapsible (desktop)
- Active route highlighting (orange bg)
- Icon-only mode when collapsed
- Tooltips when collapsed
- Mobile drawer with overlay

#### Header
**Location**: Top of content area  
**Height**: Auto (responsive)

**Sections**:
1. **Left Side**
   - Menu toggle (mobile)
   - Sidebar collapse toggle (desktop)
   - Breadcrumbs (current page path)

2. **Right Side**
   - Search bar (global)
   - Notifications bell (with badge)
   - Admin profile dropdown:
     - Admin name
     - Role badge
     - "Profile Settings" link
     - "Logout" button

**Features**:
- Sticky positioning
- Search autocomplete
- Notification dropdown
- Profile menu

---

### 7.2 Common Components

#### Data Table
**Usage**: All list pages (products, orders, quotes, customers)

**Features**:
- Sortable columns
- Filterable columns
- Selectable rows (checkbox)
- Pagination
- Items per page selector
- Bulk actions bar (when rows selected)
- Loading states
- Empty state
- Error state

#### Wizard Form
**Usage**: Product creation, category creation, banner creation

**Features**:
- Multi-step navigation
- Progress indicator
- Step validation
- Back/Next buttons
- Save draft (if applicable)
- Final review step

#### Status Badge
**Usage**: Orders, quotes, products, admin users

**Variants**:
- Success (green) - Active, Approved, Delivered
- Warning (yellow) - Pending, In Review, Low Stock
- Error (red) - Rejected, Cancelled, Out of Stock
- Info (blue) - Shipped, In Transit, Processing

#### Modal/Dialog
**Usage**: Confirmations, forms, previews

**Types**:
- Confirmation - "Are you sure?" dialogs
- Form - Create/edit forms
- Preview - Image/document previews
- Alert - Success/error messages

---

## 8. Permissions Matrix

### 8.1 Feature Access by Role

| Feature | Super Admin | Admin | Manager | Staff |
|---------|------------|-------|---------|-------|
| **Dashboard** | ✅ Full | ✅ Full | ✅ Limited | ✅ View |
| **Products** |
| - View | ✅ | ✅ | ✅ | ✅ |
| - Create | ✅ | ✅ | ✅ | ❌ |
| - Edit | ✅ | ✅ | ✅ | ❌ |
| - Delete | ✅ | ✅ | ✅ | ❌ |
| - Bulk Operations | ✅ | ✅ | ❌ | ❌ |
| - Import | ✅ | ✅ | ❌ | ❌ |
| **Categories** |
| - View | ✅ | ✅ | ✅ | ✅ |
| - Create | ✅ | ✅ | ✅ | ❌ |
| - Edit | ✅ | ✅ | ✅ | ❌ |
| - Delete | ✅ | ✅ | ⚠️ | ❌ |
| **Orders** |
| - View | ✅ | ✅ | ✅ | ✅ |
| - Update Status | ✅ | ✅ | ✅ | ⚠️ |
| - Cancel | ✅ | ✅ | ✅ | ❌ |
| - Invoices | ✅ | ✅ | ✅ | ⚠️ |
| **Quotes** |
| - View | ✅ | ✅ | ✅ | ✅ |
| - Respond | ✅ | ✅ | ✅ | ❌ |
| - Price | ✅ | ✅ | ✅ | ❌ |
| - Approve/Reject | ✅ | ✅ | ✅ | ❌ |
| - Convert to Order | ✅ | ✅ | ✅ | ❌ |
| **Customers** |
| - View | ✅ | ✅ | ✅ | ✅ |
| - Edit | ✅ | ✅ | ✅ | ❌ |
| - Verify Business | ✅ | ✅ | ❌ | ❌ |
| - Delete | ✅ | ✅ | ❌ | ❌ |
| **Inventory** |
| - View | ✅ | ✅ | ✅ | ✅ |
| - Adjust Stock | ✅ | ✅ | ✅ | ❌ |
| - Bulk Update | ✅ | ✅ | ❌ | ❌ |
| **Banners** |
| - View | ✅ | ✅ | ✅ | ✅ |
| - Create | ✅ | ✅ | ✅ | ❌ |
| - Edit | ✅ | ✅ | ✅ | ❌ |
| - Delete | ✅ | ✅ | ❌ | ❌ |
| **Collections** |
| - View | ✅ | ✅ | ✅ | ✅ |
| - Manage | ✅ | ✅ | ❌ | ❌ |
| **Settings** |
| - Store Settings | ✅ | ❌ | ❌ | ❌ |
| - Shipping | ✅ | ✅ | ❌ | ❌ |
| - Tax | ✅ | ✅ | ❌ | ❌ |
| - Payment | ✅ | ❌ | ❌ | ❌ |
| - Admin Users | ✅ | ❌ | ❌ | ❌ |
| - Profile | ✅ | ✅ | ✅ | ✅ |
| - System | ✅ | ❌ | ❌ | ❌ |

**Legend**:
- ✅ Full access
- ⚠️ Limited access (specific conditions)
- ❌ No access

---

## 9. Admin Workflows

### 9.1 Business Verification Workflow

**Admin Role**: Admin or Super Admin

```
1. Admin navigates to /admin/customers
2. Filters by "Pending Verification"
3. Selects a business customer
4. Reviews:
   - Company details (name, GST, PAN)
   - Uploaded documents:
     - GST Certificate (download & verify)
     - PAN Card (download & verify)
     - Business License (if uploaded)
5. Decision:
   ├─ APPROVE:
   │  ├─ Click "Approve Verification"
   │  ├─ Confirmation modal
   │  ├─ System updates:
   │  │  - verification_status = 'verified'
   │  │  - verified_by = admin_id
   │  │  - verified_at = timestamp
   │  ├─ Email sent to customer
   │  └─ Customer can now checkout
   │
   └─ REJECT:
      ├─ Click "Reject Verification"
      ├─ Enter rejection reason (required)
      ├─ Confirmation modal
      ├─ System updates:
      │  - verification_status = 'rejected'
      │  - rejection_reason = reason
      ├─ Email sent to customer with reason
      └─ Customer can resubmit documents
```

### 9.2 Quote Response Workflow

**Admin Role**: Manager or higher

```
1. Admin navigates to /admin/quotes
2. Filters by status = 'pending'
3. Selects a quote to review
4. Reviews:
   - Customer info & user type
   - Requested items
   - Customer notes
   - Bulk pricing requests
   - Attachments
5. Admin actions:
   ├─ SET PRICING:
   │  ├─ For each item:
   │  │  - Set unit price
   │  │  - Set discount %
   │  │  - Auto-calculate total
   │  ├─ Review quote summary (subtotal, tax, total)
   │  └─ Save pricing
   │
   ├─ SEND MESSAGE:
   │  ├─ Ask clarifying questions
   │  ├─ Request additional info
   │  └─ Provide timeline estimates
   │
   ├─ UPDATE STATUS:
   │  ├─ 'in_review' - Admin reviewing
   │  ├─ 'negotiation' - Back-and-forth discussion
   │  ├─ 'revised' - Quote updated
   │  └─ Save status
   │
   ├─ APPROVE QUOTE:
   │  ├─ Ensure all items priced
   │  ├─ Click "Approve Quote"
   │  ├─ System generates:
   │  │  - Quote PDF
   │  │  - Quote number
   │  │  - Valid until date (default: 30 days)
   │  ├─ Email sent to customer with PDF
   │  ├─ Status = 'revised'
   │  └─ Awaits customer acceptance
   │
   └─ REJECT QUOTE:
      ├─ Click "Reject Quote"
      ├─ Enter reason (required)
      ├─ Email sent to customer
      └─ Status = 'rejected'
```

### 9.3 Quote to Order Conversion

**Admin Role**: Manager or higher  
**Prerequisite**: Quote status = 'accepted', User type = 'business_verified'

```
1. Admin navigates to accepted quote
2. Click "Convert to Order"
3. Conversion wizard opens:
   
   Step 1: Review Items
   ├─ Displays all quote items with prices
   ├─ Verify pricing still valid
   ├─ Option to adjust if needed
   └─ Click "Continue"
   
   Step 2: Shipping Address
   ├─ Load customer's saved addresses
   ├─ Select shipping address
   ├─ Option to add new if needed
   └─ Click "Continue"
   
   Step 3: Delivery Method
   ├─ Standard delivery
   ├─ Express delivery
   ├─ Custom delivery
   └─ Click "Continue"
   
   Step 4: Payment Method
   ├─ Default: Credit Terms (for verified)
   ├─ Can select other methods
   └─ Click "Continue"
   
   Step 5: Review & Convert
   ├─ Review all details
   ├─ Order summary with totals
   ├─ Click "Create Order"
   
4. System creates order:
   ├─ Generates order number
   ├─ Copies quote items to order
   ├─ Applies quote pricing
   ├─ Sets order status = 'confirmed'
   ├─ Updates quote:
   │  - converted_order_id = new order ID
   │  - status = 'converted'
   ├─ Updates inventory (reduces stock)
   ├─ Generates invoice
   ├─ Sends email to customer
   └─ Redirects to order detail page

5. Admin can now manage as regular order
```

### 9.4 Order Processing Workflow

**Admin Role**: Staff or higher

```
1. New order received (status = 'pending')
2. Admin navigates to /admin/orders
3. Click on order to view details
4. Verify order information
5. Update order status through workflow:

   pending (Payment pending)
   ├─ Verify payment received
   └─ Update to "confirmed"
   
   confirmed (Payment confirmed)
   ├─ Verify stock availability
   ├─ Prepare items for shipment
   └─ Update to "processing"
   
   processing (Being prepared)
   ├─ Pack items
   ├─ Generate packing slip
   ├─ Create shipment
   ├─ Enter tracking number
   └─ Update to "shipped"
   
   shipped (Dispatched)
   ├─ Email sent with tracking
   ├─ Customer can track
   ├─ Await delivery confirmation
   └─ Update to "delivered" (or auto-update)
   
   delivered (Completed)
   └─ Order complete

6. If cancellation needed:
   ├─ Click "Cancel Order"
   ├─ Enter cancellation reason
   ├─ Confirm cancellation
   ├─ System restores inventory
   ├─ Process refund (if paid)
   ├─ Email customer
   └─ Status = 'cancelled'
```

### 9.5 Product Creation Workflow

**Admin Role**: Manager or higher

```
1. Admin navigates to /admin/products
2. Click "Add Product"
3. Product creation wizard opens (6 steps)
4. Complete each step sequentially
5. Review & publish
6. Product appears in store
```

(Detailed in Section 6.2)

---

## Summary

This admin panel overview provides complete documentation including:

✅ **4 Admin Roles**: Super Admin, Admin, Manager, Staff with hierarchical permissions  
✅ **37+ Admin Pages**: Complete route structure and page list  
✅ **12 Admin Modules**: Dashboard, Products, Categories, Orders, Quotes, Customers, Inventory, Banners, Collections, Coupons, Settings  
✅ **Detailed Workflows**: Business verification, quote management, order processing  
✅ **Comprehensive Features**: Full CRUD operations, bulk actions, wizards, analytics  
✅ **Security**: RLS, RBAC, approval workflows, audit trails  
✅ **UI Components**: Sidebar, header, tables, modals, wizards, charts  

**Key Capabilities**: The admin panel provides complete control over the e-commerce platform with role-based access, multi-step wizards for complex operations, real-time analytics, and comprehensive management of products, orders, quotes, and customers.

---

**End of Document**
