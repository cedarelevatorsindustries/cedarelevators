# Admin Quote Module - Complete Documentation

> **Last Updated:** January 11, 2026  
> **Version:** 2.0 (Modular Architecture)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Admin Pages & UI](#admin-pages--ui)
4. [Server Actions (API)](#server-actions-api)
5. [Type Definitions](#type-definitions)
6. [Workflows & State Machine](#workflows--state-machine)
7. [Permissions & Security](#permissions--security)
8. [Integration Points](#integration-points)

---

## Overview

The Admin Quote Module is a comprehensive B2B quote management system that allows administrators to review, price, approve, reject, and convert customer quote requests into orders. The module follows a **modular architecture** with 8 specialized action files for better maintainability.

### Key Features

- ✅ **Quote List Management** - View, filter, and search all quotes
- ✅ **Detailed Quote Review** - Full quote details with customer context
- ✅ **Dynamic Pricing** - Edit item pricing and discounts
- ✅ **Status Management** - Pending → Reviewing → Approved/Rejected → Converted
- ✅ **Priority System** - Low, Medium, High priority levels
- ✅ **Communication** - Internal notes and customer messages
- ✅ **Quote Conversion** - Convert approved quotes to orders (verified business only)
- ✅ **Audit Trail** - Complete action logging
- ✅ **Customer Integration** - View quotes from customer profile

---

## Database Schema

### 1. `quotes` Table

**Primary table storing all quote requests**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `quote_number` | VARCHAR(50) | Auto-generated (Q-2025001, Q-2025002, etc.) |
| `clerk_user_id` | VARCHAR(255) | Clerk user ID (NULL for guest quotes) |
| `guest_name` | VARCHAR(255) | Guest customer name |
| `guest_email` | VARCHAR(255) | Guest customer email |
| `guest_phone` | VARCHAR(50) | Guest customer phone |
| `account_type` | TEXT | `guest`, `individual`, `business`, `verified` |
| `status` | TEXT | `pending`, `reviewing`, `approved`, `rejected`, `converted` |
| `priority` | TEXT | `low`, `medium`, `high` |
| `company_details` | JSONB | Business info (company name, GST, PAN, contacts) |
| `notes` | TEXT | Customer notes/requirements |
| `bulk_pricing_requested` | BOOLEAN | Whether bulk pricing was requested |
| `template_id` | UUID | Reference to quote template (if used) |
| `subtotal` | DECIMAL(10,2) | Sum of all items before discount |
| `discount_total` | DECIMAL(10,2) | Total discount amount |
| `tax_total` | DECIMAL(10,2) | Total tax (18% GST) |
| `estimated_total` | DECIMAL(10,2) | Final total amount |
| `admin_notes` | TEXT | Admin internal notes |
| `admin_response_at` | TIMESTAMPTZ | When admin responded |
| `responded_by` | VARCHAR(255) | Clerk ID of responding admin |
| `valid_until` | TIMESTAMPTZ | Quote expiry date |
| `converted_order_id` | UUID | Reference to created order |
| `converted_at` | TIMESTAMPTZ | When converted to order |
| `approved_by` | VARCHAR(255) | Clerk ID of approving admin |
| `approved_at` | TIMESTAMPTZ | When approved |
| `rejected_by` | VARCHAR(255) | Clerk ID of rejecting admin |
| `rejected_at` | TIMESTAMPTZ | When rejected |
| `rejected_reason` | TEXT | Reason for rejection |
| `reviewing_started_at` | TIMESTAMPTZ | When review started |
| `reviewing_by` | VARCHAR(255) | Admin who started review |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `idx_quotes_clerk_user_id` - User lookup
- `idx_quotes_guest_email` - Guest lookup
- `idx_quotes_quote_number` - Quote number search
- `idx_quotes_status` - Status filtering
- `idx_quotes_priority` - Priority filtering
- `idx_quotes_user_type` - User type filtering
- `idx_quotes_created_at` - Date sorting

---

### 2. `quote_items` Table

**Individual products/items in each quote**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `quote_id` | UUID | Foreign key to quotes |
| `product_id` | UUID | Product reference (can be NULL) |
| `variant_id` | UUID | Variant reference |
| `product_name` | TEXT | Product name snapshot |
| `product_sku` | VARCHAR(100) | SKU snapshot |
| `product_thumbnail` | TEXT | Image URL snapshot |
| `quantity` | INTEGER | Requested quantity |
| `unit_price` | DECIMAL(10,2) | Price per unit (set by admin) |
| `discount_percentage` | DECIMAL(5,2) | Discount % (0-100) |
| `total_price` | DECIMAL(10,2) | Calculated total after discount |
| `bulk_pricing_requested` | BOOLEAN | Item-level bulk pricing flag |
| `notes` | TEXT | Item-specific notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- `idx_quote_items_quote_id` - Quote lookup
- `idx_quote_items_product_id` - Product lookup

---

### 3. `quote_messages` Table

**Communication between admin and customer**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `quote_id` | UUID | Foreign key to quotes |
| `sender_type` | TEXT | `user` or `admin` |
| `sender_id` | VARCHAR(255) | Clerk user ID |
| `sender_name` | VARCHAR(255) | Display name |
| `message` | TEXT | Message content |
| `is_internal` | BOOLEAN | Admin-only internal note |
| `read_at` | TIMESTAMPTZ | When message was read |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- `idx_quote_messages_quote_id` - Quote lookup
- `idx_quote_messages_created_at` - Chronological sorting

---

### 4. `quote_attachments` Table

**File attachments (specs, drawings, etc.)**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `quote_id` | UUID | Foreign key to quotes |
| `file_name` | TEXT | Original filename |
| `file_url` | TEXT | Storage URL |
| `file_size` | INTEGER | Size in bytes |
| `mime_type` | VARCHAR(100) | File MIME type |
| `uploaded_at` | TIMESTAMPTZ | Upload timestamp |

**Index:** `idx_quote_attachments_quote_id`

---

### 5. `quote_baskets` Table

**Temporary storage for quote items before submission**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `clerk_user_id` | VARCHAR(255) | User ID (unique) |
| `items` | JSONB | Array of basket items |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Index:** `idx_quote_baskets_clerk_user_id`

---

### 6. `quote_templates` Table

**Reusable quote templates (verified business only)**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `clerk_user_id` | VARCHAR(255) | Owner user ID |
| `name` | TEXT | Template name |
| `description` | TEXT | Template description |
| `items` | JSONB | Array of template items |
| `default_notes` | TEXT | Pre-filled notes |
| `use_count` | INTEGER | Usage counter |
| `last_used_at` | TIMESTAMPTZ | Last usage timestamp |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Index:** `idx_quote_templates_clerk_user_id`

---

### 7. `quote_audit_log` Table

**Complete audit trail of all quote actions**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `quote_id` | UUID | Foreign key to quotes |
| `action_type` | TEXT | Action performed (see QuoteActionType) |
| `old_status` | TEXT | Previous status |
| `new_status` | TEXT | New status |
| `old_priority` | TEXT | Previous priority |
| `new_priority` | TEXT | New priority |
| `pricing_changed` | BOOLEAN | Whether pricing was modified |
| `old_total` | DECIMAL(10,2) | Previous total |
| `new_total` | DECIMAL(10,2) | New total |
| `admin_clerk_id` | VARCHAR(255) | Admin who performed action |
| `admin_name` | VARCHAR(255) | Admin display name |
| `admin_role` | TEXT | Admin role (staff, manager, admin, super_admin) |
| `notes` | TEXT | Action notes |
| `metadata` | JSONB | Additional context |
| `created_at` | TIMESTAMPTZ | Action timestamp |

**Action Types:**
- `created` - Quote created
- `status_changed` - Status updated
- `priority_changed` - Priority updated
- `pricing_updated` - Overall pricing changed
- `item_pricing_updated` - Item pricing changed
- `approved` - Quote approved
- `rejected` - Quote rejected
- `converted` - Converted to order
- `message_sent` - Message sent
- `clarification_requested` - Clarification requested

---

## Admin Pages & UI

### Page 1: `/admin/quotes` - Quotes List Page

**Route:** `src/app/admin/(dashboard)/quotes/page.tsx`

#### UI Sections

##### A. Page Header
- **Title:** "Quote Requests"
- **Description:** "Manage customer quote requests and pricing"
- **Actions:**
  - Refresh button (with loading spinner)

##### B. Stats Cards (5 cards in grid)

| Card | Icon | Color | Metric |
|------|------|-------|--------|
| **Total Quotes** | FileText | Orange | Total count |
| **Pending** | Clock | Yellow | Pending count |
| **Reviewing** | Eye | Blue | In-review count |
| **Accepted** | CircleCheck | Green | Approved count |
| **Business** | Building2 | Purple | Business user count |

##### C. Filters Bar

**Search Input:**
- Placeholder: "Search by quote number, email, or name..."
- Icon: Search (left-aligned)
- Real-time filtering

**Filter Dropdowns:**
1. **Status Filter**
   - All Status (default)
   - Pending
   - Reviewing
   - Approved
   - Rejected
   - Converted

2. **Priority Filter**
   - All Priority (default)
   - High
   - Medium
   - Low

3. **User Type Filter**
   - All Users (default)
   - Guest
   - Individual
   - Business
   - Verified Business

##### D. Quotes Table

**Columns:**

| Column | Content | Sortable |
|--------|---------|----------|
| **Quote** | Quote number (clickable link) | ❌ |
| **Customer** | Name + Email/Phone | ❌ |
| **Type** | User type badge with icon | ❌ |
| **Items** | Item count | ❌ |
| **Status** | Status badge | ❌ |
| **Priority** | Priority badge | ❌ |
| **Value** | Estimated total (₹) | ❌ |
| **Date** | Relative time (e.g., "2 hours ago") | ❌ |
| **Actions** | View button + Quick actions | ❌ |

**Status Badges:**
- **Pending** - Orange background, Clock icon
- **Reviewing** - Blue background, Eye icon
- **Approved** - Green background, CheckCircle icon
- **Rejected** - Red background, XCircle icon
- **Converted** - Emerald background, ShoppingCart icon

**Priority Badges:**
- **High** - Red background
- **Medium** - Orange background
- **Low** - Gray background

**User Type Icons:**
- **Guest** - User icon (gray)
- **Individual** - User icon (blue)
- **Business** - Building2 icon (purple)
- **Verified** - Star icon (green)

**Quick Actions:**
- **View** - Eye icon (always visible)
- **Start Review** - Button (only for pending quotes)

##### E. Empty State
- FileText icon (large, gray)
- "No quotes found" heading
- Contextual message based on filters

---

### Page 2: `/admin/quotes/[id]` - Quote Detail Page

**Route:** `src/app/admin/(dashboard)/quotes/[id]/page.tsx`  
**File Size:** 1,097 lines (comprehensive detail view)

#### UI Sections

##### A. Sticky Quote Header (Top Bar)

**Left Side:**
- Quote number (large heading): "Quote #Q-2025001"
- Status badge with icon
- Created date (relative time)
- Valid until date (if applicable)

**Right Side:**
- **Priority Badge** (editable)
  - Click to edit → Dropdown (Low/Medium/High)
  - Save/Cancel buttons
- **Context-Aware Primary CTA:**
  - **Pending:** "Start Review" (Blue)
  - **Reviewing:** "Approve Quote" (Green) + "Reject" (Red outline)
  - **Approved:** "Convert to Order" (Emerald, verified only)

##### B. Customer Context Panel (Card)

**Header:** "Customer Information" with icon

**Grid Layout (2 columns):**
- Customer Name
- Account Type (badge with verification icon)
- Email (with Mail icon)
- Phone (with Phone icon)
- Company Name (if business)
- GST Number (if available)

**Footer:**
- "View Customer Profile →" link (if registered user)

##### C. Quote Progress Timeline (Card)

**Header:** "Quote Progress" with Clock icon

**Timeline Component:** `QuoteStatusTimeline`
- Visual timeline showing quote progression
- Timestamps for each status transition:
  - Created
  - Reviewing Started
  - Approved/Rejected
  - Converted (if applicable)
  - Expired (if applicable)

**Allowed Transitions Section:**
- Shows next possible states based on current status
- State machine validation
- Visual badges for each allowed state

##### D. Quote Items Table (Card)

**Header:** "Quote Items (X)" with Package icon  
**Action:** "Edit Pricing" button (reviewing status only)

**Table Columns:**

| Column | Content | Editable |
|--------|---------|----------|
| **Product** | Thumbnail + Name + SKU | ❌ |
| **Qty** | Quantity | ❌ |
| **Unit Price** | Price input (₹) | ✅ (when editing) |
| **Discount %** | Percentage input (0-100) | ✅ (when editing) |
| **Total** | Calculated total | ❌ (auto-calculated) |

**Edit Mode:**
- Number inputs for unit price and discount
- Real-time total calculation
- "Save Pricing" and "Cancel" buttons

**Pricing Summary (Bottom):**
- Subtotal
- Discount Total
- Tax Total (18% GST)
- **Estimated Total** (bold)

##### E. Customer Notes (Card)

**Displayed if:** `quote.notes` exists  
**Content:** Customer's notes/requirements (whitespace preserved)

##### F. Attachments (Card)

**Displayed if:** `quote.attachments.length > 0`  
**Header:** "Attachments (X)"

**Attachment List:**
- Download icon
- File name (truncated)
- File size (MB)
- Click to download

##### G. Communication Timeline (Card)

**Header:** "Communication & Timeline" with MessageSquare icon

**Message Thread:**
- Chat-style layout
- **User messages:** Left-aligned, gray background
- **Admin messages:** Right-aligned, orange background
- **Internal notes:** Yellow background with "📌 Internal Note" label

**Message Input:**
- Textarea for message
- Checkbox: "Internal Note (admin only)"
- "Send Message" button

##### H. Modals

**1. Reject Quote Modal**
- Textarea for rejection reason (required)
- "Reject Quote" button (red)
- "Cancel" button

**2. Convert to Order Modal**
- Order details form
- Shipping address selection
- Payment method selection
- "Convert to Order" button (emerald)
- "Cancel" button

---

### Page 3: Customer Profile - Quotes Tab

**Route:** `/admin/customers/[id]` (tab view)  
**Component:** `src/domains/admin/customers/customer-quotes-tab.tsx`

#### UI Sections

##### A. Card Header
- **Title:** "Quote History"

##### B. Quotes Table

**Columns:**
- Quote # (clickable)
- Date (formatted)
- Items count
- Priority badge
- Status badge
- Total (₹)

**Interactions:**
- Click row → Navigate to `/admin/quotes/[id]`
- Hover effect on rows

##### C. Empty State
- "No quotes yet" message

---

## Server Actions (API)

### Modular Architecture

**Location:** `src/lib/actions/admin-quotes/`

The admin quote actions are organized into **8 specialized modules** for better maintainability:

---

### 1. `quote-queries.ts` - Read Operations

#### `getAdminQuotes(filters)`

**Purpose:** Fetch all quotes with filtering

**Parameters:**
```typescript
interface AdminQuoteFilters {
  status: QuoteStatus | 'all'
  priority: QuotePriority | 'all'
  user_type: 'all' | 'guest' | 'individual' | 'business' | 'verified'
  date_range: 'today' | 'last_7_days' | 'last_30_days' | 'all'
  search: string
}
```

**Returns:**
```typescript
{ success: true; quotes: Quote[] } | { success: false; error: string }
```

**Features:**
- Joins with `quote_items`, `quote_admin_responses`, `quote_attachments`
- Filters by status, priority, user type, date range
- Search by quote number, email, name
- Ordered by `created_at DESC`

---

#### `getAdminQuoteById(quoteId)`

**Purpose:** Get single quote with full details

**Returns:**
```typescript
{ success: true; quote: Quote | null } | { success: false; error: string }
```

**Features:**
- Includes all related items, messages, attachments
- Maps nested product data to flat fields
- Returns `null` if not found (no error)

---

#### `getAdminQuoteStats()`

**Purpose:** Get quote statistics for dashboard

**Returns:**
```typescript
{
  success: true;
  stats: {
    total_quotes: number
    active_quotes: number
    total_value: number
    pending_count: number
    accepted_count: number
    reviewing_count: number
    business_count: number
  }
} | { success: false; error: string }
```

---

#### `getQuoteAuditLog(quoteId)`

**Purpose:** Get audit trail for a quote

**Returns:**
```typescript
{ success: true; logs: QuoteAuditLog[] } | { success: false; error: string }
```

---

### 2. `quote-status.ts` - Status & Priority Management

#### `updateQuoteStatus(quoteId, status, adminNotes?)`

**Purpose:** Update quote status

**Permissions:** Admin

**Features:**
- Updates status with timestamp
- Records admin who made change
- Logs action to audit trail
- Revalidates paths

---

#### `approveQuote(quoteId, options)`

**Purpose:** Approve a quote

**Permissions:** Manager+

**Parameters:**
```typescript
{
  validUntilDays?: number  // Default: 30
  adminNotes?: string
}
```

**Validation:**
- All items must have pricing
- Quote must have valid total
- Status must allow approval

**Actions:**
- Sets status to `approved`
- Calculates `valid_until` date
- Records approving admin
- Logs approval action

---

#### `rejectQuote(quoteId, reason)`

**Purpose:** Reject a quote

**Permissions:** Manager+

**Validation:**
- Reason is required

**Actions:**
- Sets status to `rejected`
- Records rejection reason
- Records rejecting admin
- Logs rejection action

---

#### `updateQuotePriority(quoteId, priority)`

**Purpose:** Update quote priority

**Permissions:** Admin

**Actions:**
- Updates priority level
- Logs priority change

---

### 3. `quote-pricing.ts` - Pricing Operations

#### `updateQuotePricing(quoteId, pricing)`

**Purpose:** Update overall quote pricing

**Parameters:**
```typescript
{
  subtotal: number
  discount_total: number
  tax_total: number
  estimated_total: number
}
```

**Actions:**
- Updates all pricing fields
- Sets status to `revised`
- Revalidates paths

---

#### `updateQuoteItemPricing(itemId, pricing)`

**Purpose:** Update individual item pricing

**Parameters:**
```typescript
{
  unit_price: number
  discount_percentage: number
  total_price: number
}
```

**Actions:**
- Updates item pricing
- Revalidates paths

---

### 4. `quote-conversion.ts` - Quote to Order Conversion

#### `convertQuoteToOrder(quoteId, orderDetails)`

**Purpose:** Convert approved quote to order

**Permissions:** Manager+ (can approve quotes)

**Parameters:**
```typescript
{
  shipping_address_id?: string
  delivery_method: string
  payment_method?: string
}
```

**Strict Validation:**
- ✅ Quote status must be `approved`
- ✅ User type must be `verified` (business)
- ✅ Must have `clerk_user_id` (registered user)
- ✅ Quote must not be expired
- ✅ All items must have pricing
- ✅ Must have at least one item

**Process:**
1. Generate order number (`ORD-XXXXXX`)
2. Get/create shipping address
3. Create order record
4. Create order items from quote items
5. Decrement inventory for each item
6. Update quote status to `converted`
7. Log conversion action

**Returns:**
```typescript
{ success: true; orderId: string } | { success: false; error: string }
```

**Rollback:** If order items creation fails, deletes the order

---

### 5. `quote-messages.ts` - Messaging

#### `addAdminQuoteMessage(quoteId, message, isInternal)`

**Purpose:** Add admin message to quote

**Parameters:**
- `quoteId`: Quote ID
- `message`: Message content
- `isInternal`: Whether message is admin-only

**Actions:**
- Creates message record
- Sets sender type to `admin`
- Revalidates paths

---

### 6. `quote-management.ts` - Management Operations

#### `updateQuoteItems(quoteId, items, reason, adminId, adminName)`

**Purpose:** Add/remove quote items with audit trail

**Actions:**
- Updates quote items
- Logs item changes
- Recalculates totals

---

#### `updateQuoteQuantities(quoteId, quantities, reason, adminId, adminName)`

**Purpose:** Update item quantities

**Actions:**
- Updates quantities
- Recalculates totals
- Logs changes

---

#### `setQuoteExpiry(quoteId, expiryDate, adminId, adminName)`

**Purpose:** Set quote expiry date

**Actions:**
- Updates `valid_until`
- Logs expiry change

---

#### `addAdminNote(quoteId, note, isInternal, adminId, adminName)`

**Purpose:** Add admin internal note

**Actions:**
- Creates message with `is_internal` flag
- Logs note addition

---

#### `recalculateQuoteTotals(quoteId)`

**Purpose:** Recalculate quote totals (internal helper)

**Actions:**
- Fetches all items
- Calculates subtotal, discount, tax
- Updates quote totals

---

#### `deleteQuote(quoteId)`

**Purpose:** Delete a quote

**Permissions:** Admin

**Actions:**
- Deletes quote (cascades to items, messages, attachments)
- Revalidates paths

---

### 7. `quote-audit.ts` - Audit Logging

#### `logQuoteAction(quoteId, actionType, details)`

**Purpose:** Log all quote-related actions

**Parameters:**
```typescript
{
  oldStatus?: QuoteStatus
  newStatus?: QuoteStatus
  oldPriority?: QuotePriority
  newPriority?: QuotePriority
  pricingChanged?: boolean
  oldTotal?: number
  newTotal?: number
  metadata?: Record<string, any>
}
```

**Actions:**
- Creates audit log entry
- Records admin info (from Clerk)
- Timestamps action

---

### 8. `index.ts` - Central Export

**Purpose:** Re-exports all functions from modules

**Usage:**
```typescript
import { getAdminQuotes, approveQuote } from '@/lib/actions/admin-quotes'
```

---

## Type Definitions

**Location:** `src/types/b2b/quote.ts` (290 lines)

### Core Types

#### `UserType`
```typescript
type UserType = 'guest' | 'individual' | 'business' | 'verified'
```

#### `QuoteStatus`
```typescript
type QuoteStatus =
  | 'draft'       // Initial state before submission
  | 'pending'     // Submitted, awaiting review
  | 'reviewing'   // Admin is reviewing and pricing
  | 'approved'    // Quote approved and sent to customer
  | 'rejected'    // Quote rejected (reason required)
  | 'converted'   // Quote converted to order
  | 'expired'     // Quote expired
```

#### `QuotePriority`
```typescript
type QuotePriority = 'low' | 'medium' | 'high'
```

#### `QuoteActionType`
```typescript
type QuoteActionType =
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'pricing_updated'
  | 'item_pricing_updated'
  | 'approved'
  | 'rejected'
  | 'converted'
  | 'message_sent'
  | 'clarification_requested'
```

#### `AdminRole`
```typescript
type AdminRole = 'staff' | 'manager' | 'admin' | 'super_admin'
```

### Main Interfaces

#### `Quote`
```typescript
interface Quote {
  id: string
  quote_number: string
  clerk_user_id?: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  account_type: UserType
  status: QuoteStatus
  priority: QuotePriority
  company_details?: {
    company_name?: string
    gst_number?: string
    pan_number?: string
    contact_name?: string
    contact_phone?: string
  }
  notes?: string
  bulk_pricing_requested: boolean
  template_id?: string
  subtotal: number
  discount_total: number
  tax_total: number
  estimated_total: number
  pricing_visible: boolean
  admin_notes?: string
  admin_response_at?: string
  responded_by?: string
  valid_until: string
  converted_order_id?: string
  converted_at?: string
  approved_by?: string
  approved_at?: string
  rejected_by?: string
  rejected_at?: string
  rejected_reason?: string
  reviewing_started_at?: string
  reviewing_by?: string
  expired_at?: string
  created_at: string
  updated_at: string
  // Relations
  items?: QuoteItem[]
  messages?: QuoteMessage[]
  attachments?: QuoteAttachment[]
}
```

#### `QuoteItem`
```typescript
interface QuoteItem {
  id: string
  quote_id: string
  product_id?: string
  variant_id?: string
  product_name: string
  product_sku?: string
  product_thumbnail?: string
  quantity: number
  unit_price: number
  discount_percentage: number
  total_price: number
  bulk_pricing_requested: boolean
  notes?: string
  created_at: string
}
```

#### `QuoteMessage`
```typescript
interface QuoteMessage {
  id: string
  quote_id: string
  sender_type: 'user' | 'admin'
  sender_id?: string
  sender_name?: string
  message: string
  is_internal: boolean
  read_at?: string
  created_at: string
}
```

#### `QuoteAuditLog`
```typescript
interface QuoteAuditLog {
  id: string
  quote_id: string
  action_type: QuoteActionType
  old_status?: QuoteStatus
  new_status?: QuoteStatus
  old_priority?: QuotePriority
  new_priority?: QuotePriority
  pricing_changed: boolean
  old_total?: number
  new_total?: number
  admin_clerk_id?: string
  admin_name?: string
  admin_role?: AdminRole
  notes?: string
  metadata?: Record<string, any>
  created_at: string
}
```

---

## Workflows & State Machine

### Quote Status Flow

```
┌─────────┐
│  DRAFT  │ (Initial, before submission)
└────┬────┘
     │
     ▼
┌──────────┐
│ PENDING  │ (Submitted, awaiting review)
└────┬─────┘
     │
     ▼
┌───────────┐
│ REVIEWING │ (Admin is pricing and reviewing)
└─────┬─────┘
      │
      ├─────────────┐
      │             │
      ▼             ▼
┌──────────┐   ┌──────────┐
│ APPROVED │   │ REJECTED │
└────┬─────┘   └──────────┘
     │
     ▼
┌───────────┐
│ CONVERTED │ (Converted to order)
└───────────┘
```

### State Machine Rules

**Location:** `src/lib/quote-state-machine.ts`

#### Allowed Transitions

| From | To | Conditions |
|------|-----|-----------|
| `draft` | `pending` | User submits quote |
| `pending` | `reviewing` | Admin starts review |
| `pending` | `rejected` | Admin rejects without review |
| `reviewing` | `approved` | Admin approves (pricing complete) |
| `reviewing` | `rejected` | Admin rejects after review |
| `approved` | `converted` | Verified business converts to order |
| `approved` | `expired` | Quote expiry date passes |

#### Validation Rules

**Approval Requirements:**
- ✅ All items must have `unit_price > 0`
- ✅ Quote must have `estimated_total > 0`
- ✅ Status must be `reviewing`

**Conversion Requirements:**
- ✅ Status must be `approved`
- ✅ User type must be `verified`
- ✅ Must have `clerk_user_id`
- ✅ Quote must not be expired
- ✅ All items must have pricing

---

## Permissions & Security

### Admin Roles

| Role | Permissions |
|------|-------------|
| **Staff** | View quotes, add messages |
| **Manager** | All Staff + Approve, Reject, Convert quotes |
| **Admin** | All Manager + Update pricing, priority |
| **Super Admin** | All Admin + Delete quotes |

### Permission Checks

**Location:** `src/lib/auth/admin-roles.ts`

#### `canApproveQuotes()`
- Returns `true` for Manager, Admin, Super Admin
- Returns `false` for Staff

**Usage in Actions:**
```typescript
const canConvert = await canApproveQuotes()
if (!canConvert) {
  return { success: false, error: 'Insufficient permissions' }
}
```

### Row Level Security (RLS)

**Enabled on all tables:**
- `quotes`
- `quote_items`
- `quote_messages`
- `quote_attachments`
- `quote_baskets`
- `quote_templates`

**Policies:**
- Service role: Full access
- Authenticated users: Read own quotes only
- Admin operations: Via service role in server actions

---

## Integration Points

### 1. Customer Profile Integration

**Component:** `src/domains/admin/customers/customer-quotes-tab.tsx`

**Features:**
- View all quotes for a specific customer
- Click to view quote details
- Displayed as tab in customer profile

**Usage:**
```typescript
<CustomerQuotesTab 
  customerClerkId={clerkUserId} 
  quotes={customerQuotes} 
/>
```

---

### 2. Order Conversion Integration

**When quote is converted:**
1. Creates order in `orders` table
2. Creates order items in `order_items` table
3. Decrements inventory via `decrement_inventory` RPC
4. Links order to quote via `converted_order_id`
5. Updates quote status to `converted`

**Order Data Mapping:**
```typescript
{
  order_number: 'ORD-XXXXXX',
  clerk_user_id: quote.clerk_user_id,
  order_status: 'pending',
  payment_status: 'pending',
  subtotal: quote.subtotal,
  tax: quote.tax_total,
  discount: quote.discount_total,
  total_amount: quote.estimated_total,
  notes: `Converted from Quote #${quote.quote_number}`,
  quote_id: quote.id
}
```

---

### 3. Notification Integration

**Potential Integration Points:**
- Quote status changes → Email to customer
- Quote approved → SMS notification
- Quote rejected → Email with reason
- Quote converted → Order confirmation email

**Implementation:** Via `src/lib/services/notifications.ts` (if exists)

---

### 4. Analytics Integration

**Metrics to Track:**
- Quote conversion rate (approved → converted)
- Average quote value
- Average time to approval
- Rejection reasons (for improvement)
- Top products in quotes

---

## File Structure

```
src/
├── app/
│   └── admin/
│       └── (dashboard)/
│           └── quotes/
│               ├── page.tsx                    # Quotes list page (437 lines)
│               └── [id]/
│                   └── page.tsx                # Quote detail page (1,097 lines)
│
├── domains/
│   └── admin/
│       └── customers/
│           └── customer-quotes-tab.tsx         # Customer quotes tab (112 lines)
│
├── lib/
│   ├── actions/
│   │   └── admin-quotes/
│   │       ├── README.md                       # Module documentation
│   │       ├── index.ts                        # Central exports
│   │       ├── quote-audit.ts                  # Audit logging (1,702 bytes)
│   │       ├── quote-conversion.ts             # Quote to order (8,076 bytes)
│   │       ├── quote-management.ts             # Management ops (13,882 bytes)
│   │       ├── quote-messages.ts               # Messaging (1,270 bytes)
│   │       ├── quote-pricing.ts                # Pricing ops (2,403 bytes)
│   │       ├── quote-queries.ts                # Read operations (7,629 bytes)
│   │       └── quote-status.ts                 # Status management (9,314 bytes)
│   │
│   ├── quote-state-machine.ts                  # State machine logic
│   └── quote-permissions.ts                    # Permission helpers
│
├── types/
│   └── b2b/
│       └── quote.ts                            # Type definitions (290 lines)
│
└── modules/
    └── quote/
        └── components/
            └── quote-status-timeline.tsx       # Timeline component
```

---

## Summary

The Admin Quote Module is a **comprehensive, production-ready B2B quote management system** with:

- ✅ **6 database tables** with complete schema
- ✅ **2 admin pages** (list + detail) with rich UI
- ✅ **8 modular server action files** (44,476 bytes total)
- ✅ **Complete type system** (290 lines)
- ✅ **State machine validation**
- ✅ **Role-based permissions**
- ✅ **Full audit trail**
- ✅ **Customer integration**
- ✅ **Order conversion workflow**

**Total Lines of Code:** ~2,000+ lines across all files  
**Architecture:** Modular, maintainable, scalable
