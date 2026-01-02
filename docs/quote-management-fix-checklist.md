# Quote Management Fix - Implementation Checklist

**Date Created:** January 2025  
**Status:** Planning Phase  
**Target:** Remove demo data and make quote management fully functional

---

## 🎯 Objectives

1. Remove all demo/hardcoded quote data across the application
2. Connect all quote request buttons to functional flow
3. Implement full admin quote management with proper controls
4. Store all quote data in Supabase with audit trails
5. Display real-time quote data to users based on their role

---

## 📋 Phase 1: Database & Backend Foundation ✅ COMPLETED

### 1.1 Database Schema Validation ✅
- [x] Created complete `quotes` table structure in Supabase (000_create_quotes_schema.sql)
- [x] Created `quote_items` table with proper relationships
- [x] Created `quote_attachments` table
- [x] Created `quote_messages` table for admin-customer communication
- [x] Verified `quote_audit_log` table exists (002_add_quote_audit_log.sql)
- [x] Created `quote_baskets` table for temporary storage
- [x] Created `quote_templates` table for verified users
- [x] Added indexes for performance (clerk_user_id, quote_number, status, priority)

### 1.2 Server Actions - Quote Submission ✅
- [x] Guest quote submission (`submitGuestQuote`) - Already exists
- [x] Individual user quote submission (`submitIndividualQuote`) - Already exists
- [x] Business user quote submission (`submitBusinessQuote`) - Already exists
- [x] Verified business quote submission (`submitVerifiedQuote`) - Already exists
- [x] Error handling and validation already implemented
- [ ] Add email notifications after submission (TODO in Phase 7)

### 1.3 Server Actions - Admin Quote Management ✅
- [x] `getAdminQuotes(filters)` - Fetch all quotes with filtering (status, priority, user_type, search, date_range)
- [x] `getAdminQuoteById(quoteId)` - Get single quote with full details including items, messages, attachments
- [x] `updateQuoteStatus(quoteId, status, reason)` - Already exists in quote-status.ts
- [x] `approveQuote(quoteId, options)` - Already exists with validation
- [x] `rejectQuote(quoteId, reason)` - Already exists with audit trail
- [x] `updateQuotePricing(quoteId, pricing)` - Already exists in quote-pricing.ts
- [x] `updateQuoteItemPricing(itemId, pricing)` - Already exists
- [x] `updateQuoteItems(quoteId, items, reason)` - Add/remove items with full audit trail
- [x] `updateQuoteQuantities(quoteId, quantities, reason)` - Change quantities with audit
- [x] `setQuoteExpiry(quoteId, expiryDate)` - Set/extend expiry with validation
- [x] `addAdminNote(quoteId, note, isInternal)` - Add internal or customer-facing notes
- [x] `recalculateQuoteTotals(quoteId)` - Auto-recalculates subtotal, discount, tax, total
- [x] `deleteQuote(quoteId)` - Delete with cascade
- [x] Audit logging via triggers and manual logging already implemented

### 1.4 Server Actions - Customer Quote Viewing ✅
- [x] `getQuotes(filters)` - Customer's own quotes with filtering
- [x] `getQuoteById(quoteId)` - Single quote detail with items, messages, attachments
- [x] `getQuoteStats()` - Customer's quote statistics
- [ ] Verification check for pricing visibility (will be applied in UI components Phase 5)
- [x] Status-based filtering already exists

---

## 📋 Phase 2: Remove Demo Data ✅ COMPLETED

### 2.1 Mobile Quotes Page (`/quotes`) ✅
**Location:** `/app/src/app/(main)/quotes/quotes-page-client.tsx`

Demo data to remove:
- [x] No hardcoded demo data found - already connected to real data
- [x] Fetch real quotes from `getQuotes()` server action
- [x] Calculate real stats from Supabase data
- [x] Show proper quote status badges (pending, reviewing, approved, rejected, converted)
- [x] Show pricing ONLY for verified business users
- [x] Show "Convert to Order" ONLY for approved quotes
- [x] Handle empty state properly

### 2.2 Desktop Business Hub - Quote Sections ✅
**Locations:**
- `/app/src/modules/home/components/desktop/tab-content/business-hub/sections/recent-quotes.tsx`
- `/app/src/modules/home/components/desktop/tab-content/business-hub/sections/quotes-orders-snapshot.tsx`
- `/app/src/modules/home/components/desktop/tab-content/business-hub/sections/quote-status-summary.tsx`

- [x] Removed hardcoded demo quote data from `recent-quotes.tsx`
- [x] Connected to real Supabase data via `getQuotes()` server action
- [x] Applied verification-based pricing visibility rules
- [x] Show real quote counts and statuses in all sections
- [x] `quotes-orders-snapshot.tsx` already connected to real data
- [x] `quote-status-summary.tsx` now fetches real status counts

### 2.3 Desktop Welcome Section ⏭️
**Location:** `/app/src/modules/home/components/desktop/welcome-section.tsx` (if exists)

- [ ] Locate "Request Quote" button in welcome section (will be handled in Phase 3)
- [ ] Remove demo functionality
- [ ] Connect to proper quote request flow

### 2.4 Product Components ⏭️
**Locations:**
- `/app/src/modules/products/components/product/get-quote-button.tsx`
- `/app/src/modules/products/components/product/add-to-quote-button.tsx`
- Product card components (catalog, search results)
- Product detail page

- [ ] Review quote button behavior (will be handled in Phase 3)
- [ ] Ensure proper navigation to `/request-quote` with product context

---

## 📋 Phase 3: Quote Request Flow

### 3.1 Create/Update Quote Request Page
**Route:** `/app/src/app/(main)/request-quote/page.tsx`

Server Component (Page):
- [ ] Accept URL params: `productId`, `variantId`, `quantity`, `source`
- [ ] Fetch product details if productId provided
- [ ] Fetch user type and verification status
- [ ] Fetch existing quote basket
- [ ] Pass data to client component

Client Component:
- [ ] Pre-fill product if URL params exist
- [ ] Show appropriate form based on user type:
  - Guest: Simple form (name, email, phone, notes)
  - Individual: Standard form (basket items, notes, 1 attachment)
  - Business Unverified: Enhanced form (company details, 2 attachments)
  - Business Verified: Premium form (unlimited items, 5 attachments, templates)
- [ ] Allow quantity changes
- [ ] Allow additional notes/requirements
- [ ] Show quote basket summary
- [ ] Submit to appropriate server action based on user type
- [ ] Show success state with quote number
- [ ] Provide navigation to quote tracking

### 3.2 Product Quote Buttons
**All locations where "Request Quote" or "Get Quote" appears:**

Button behavior:
- [ ] On click, add product to quote basket (or navigate directly)
- [ ] Navigate to `/request-quote?productId={id}&quantity={qty}&source={source}`
- [ ] Show loading state during navigation
- [ ] Handle errors gracefully

Locations to update:
- [ ] Product card in catalog
- [ ] Product detail page
- [ ] Search results
- [ ] Related products section
- [ ] Desktop business hub "Start Quote" panel
- [ ] Desktop welcome section

### 3.3 Quote Basket Management
**Hook:** `/app/src/lib/hooks/use-quote-basket.ts`

- [ ] Verify quote basket storage in Supabase
- [ ] Add items to basket without navigating
- [ ] View basket count in header/nav
- [ ] Clear basket after successful submission
- [ ] Persist basket for logged-in users

---

## 📋 Phase 4: Admin Quote Management

### 4.1 Admin Quotes List Page
**Route:** `/app/src/app/admin/(dashboard)/quotes/page.tsx`

Currently shows: "No quotes found"

Implement:
- [ ] Create server component to fetch all quotes
- [ ] Implement filtering:
  - By status (All, Pending, Reviewing, Accepted, Rejected, Converted)
  - By priority (All, Low, Medium, High)
  - By user type (All, Guest, Individual, Business, Verified)
  - By date range
  - By search (quote number, customer email/name)
- [ ] Show stats cards:
  - Total Quotes
  - Pending (needs action)
  - Reviewing (in progress)
  - Accepted
  - Business (high priority)
- [ ] Display quotes table with:
  - Quote number (clickable)
  - Customer name/email
  - User type
  - Priority badge
  - Status badge
  - Items count
  - Estimated total (if priced)
  - Created date
  - Actions (View, Quick Actions)
- [ ] Add "Refresh" button
- [ ] Handle empty state
- [ ] Add pagination or infinite scroll

### 4.2 Admin Quote Detail Page
**Route:** `/app/src/app/admin/(dashboard)/quotes/[id]/page.tsx`

Create new page with sections:

**Quote Header:**
- [ ] Quote number
- [ ] Status badge with dropdown to change status
- [ ] Priority indicator
- [ ] Created date and last updated
- [ ] Customer info (name, email, phone, company)
- [ ] Quick actions (Accept, Reject, Download PDF)

**Quote Items Section:**
- [ ] List all requested items with:
  - Product thumbnail
  - Product name and SKU
  - Requested quantity
  - Unit price (editable by admin)
  - Line total
  - Bulk pricing indicator
- [ ] Add "Edit Pricing" mode:
  - Click to enable editing
  - Input fields for unit price per item
  - Save button to update all
  - Show old vs new prices
- [ ] Add "Edit Quantities" with reason:
  - Adjust quantity with +/- buttons
  - Reason modal required
  - Track in audit log
- [ ] Add/Remove Items section:
  - "Add Related Item" button
  - Shows product picker
  - Requires reason
  - Mark as "Admin Added"
  - Remove button on items with reason required

**Pricing Summary:**
- [ ] Subtotal
- [ ] Bulk discount (if applicable)
- [ ] Tax (if applicable)
- [ ] Total
- [ ] Expiry date with extend button

**Customer Notes:**
- [ ] Display customer's original requirements
- [ ] Show attachments with download links

**Admin Actions:**
- [ ] Internal Notes section (not visible to customer)
- [ ] Customer Messages section (visible to customer)
- [ ] Message input with "Send Email" checkbox
- [ ] Status change dropdown with reason
- [ ] Expiry date picker

**Audit Trail:**
- [ ] Timeline of all changes
- [ ] Show who made changes and when
- [ ] Show what was changed (old → new values)
- [ ] Show reasons for changes
- [ ] Collapsible/expandable

### 4.3 Admin Quote Actions Components
**Location:** `/app/src/domains/admin/quotes/` (create new folder)

Components to create:
- [ ] `quote-filters.tsx` - Filter controls for list page
- [ ] `quote-stats.tsx` - Statistics cards
- [ ] `quote-table.tsx` - Main quotes table with actions
- [ ] `quote-detail-header.tsx` - Header section with status/actions
- [ ] `quote-items-editor.tsx` - Items list with editing capability
- [ ] `quote-pricing-editor.tsx` - Modal for bulk pricing edit
- [ ] `quote-quantity-editor.tsx` - Modal for quantity changes with reason
- [ ] `quote-item-adder.tsx` - Product picker for adding items
- [ ] `quote-messages.tsx` - Customer communication section
- [ ] `quote-internal-notes.tsx` - Admin-only notes section
- [ ] `quote-audit-timeline.tsx` - Change history display
- [ ] `quote-status-changer.tsx` - Status dropdown with validation

### 4.4 Admin Quote Actions Implementation
**Location:** `/app/src/lib/actions/admin-quotes/`

Already exists but needs expansion:
- [x] `quote-audit.ts` - Audit logging (exists)
- [x] `quote-conversion.ts` - Convert to order (exists)
- [x] `quote-management.ts` - Delete quote (exists, needs expansion)
- [x] `quote-messages.ts` - Messages (exists)
- [x] `quote-pricing.ts` - Pricing updates (exists)
- [x] `quote-queries.ts` - Fetch quotes (exists)
- [x] `quote-status.ts` - Status updates (exists)

Expand functionality:
- [ ] Add full CRUD operations in `quote-management.ts`
- [ ] Add item add/remove with reason in `quote-management.ts`
- [ ] Add quantity editing with audit in `quote-pricing.ts`
- [ ] Add admin filters in `quote-queries.ts`
- [ ] Add bulk actions support
- [ ] Add email notification triggers

---

## 📋 Phase 5: User-Facing Quote Display

### 5.1 Customer Quote List
**Routes:**
- `/app/src/app/(main)/quotes/page.tsx` (mobile & desktop)
- `/app/src/modules/profile/components/sections/quotes-section.tsx` (profile page)

Current state: Shows demo data on mobile

Updates needed:
- [ ] Remove all demo data
- [ ] Fetch from `getQuotes()` server action
- [ ] Filter by status (All, Pending, Accepted, etc.)
- [ ] Search by quote number
- [ ] Show different info based on user type:
  - Guest: Cannot access (should never see this)
  - Individual: No pricing, just items and status
  - Business Unverified: No pricing, show verification prompt
  - Business Verified: Show full pricing and totals
- [ ] Show quote actions based on status:
  - Pending: "View Details"
  - Accepted: "Convert to Order", "View Details"
  - Rejected: "View Details", "Request Revision"
- [ ] Show expiry dates and urgent indicators
- [ ] Handle empty state ("No quotes yet")

### 5.2 Customer Quote Detail Page
**Route:** `/app/src/app/(main)/quotes/[id]/page.tsx`

May already exist, needs verification

Implement:
- [ ] Fetch quote by ID with verification check
- [ ] Show quote header with number and status
- [ ] Show items list
- [ ] Show pricing (only for verified business)
- [ ] Show customer notes
- [ ] Show admin messages/responses
- [ ] Show timeline of status changes
- [ ] Action buttons:
  - "Convert to Order" (if accepted and verified)
  - "Download PDF" (if accepted)
  - "Message Admin"
  - "Cancel Quote" (if pending)
- [ ] Show expiry countdown if accepted

### 5.3 Quote Status Badges
**Create reusable component:** `/app/src/components/quotes/quote-status-badge.tsx`

Status colors:
- [ ] Pending - Yellow
- [ ] Reviewing - Blue
- [ ] Approved/Accepted - Green
- [ ] Rejected - Red
- [ ] Converted - Purple
- [ ] Expired - Gray

### 5.4 Pricing Visibility Rules
**Apply throughout the application:**

Rules:
- [ ] Guest users: Never see pricing
- [ ] Individual users: Never see pricing
- [ ] Business Unverified: Never see pricing (show "-" or "Pending verification")
- [ ] Business Verified: See full pricing and totals

Locations to enforce:
- [ ] Quote list cards
- [ ] Quote detail page
- [ ] Quote summary in business hub
- [ ] Quote stats

---

## 📋 Phase 6: Integration & Testing

### 6.1 Quote Request Flow Testing
Test scenarios:
- [ ] Guest user requests quote from product card
- [ ] Guest user requests quote from product detail page
- [ ] Individual user adds product to basket, then submits quote
- [ ] Business user creates bulk quote with multiple products
- [ ] Verified user uses quote template
- [ ] Pre-filling works correctly from URL params
- [ ] Quote basket persists correctly
- [ ] Form validation works for all user types
- [ ] Success state shows correct quote number
- [ ] Email notifications sent after submission

### 6.2 Admin Quote Management Testing
Test scenarios:
- [ ] Admin sees all quotes in list page
- [ ] Filtering works correctly (status, priority, user type, date)
- [ ] Search by quote number works
- [ ] Admin can view quote detail
- [ ] Admin can edit pricing per item
- [ ] Admin can change quantities with reason
- [ ] Admin can add/remove items with reason
- [ ] Admin can accept/reject quote with reason
- [ ] Admin can set expiry date
- [ ] Admin can add internal notes
- [ ] Admin can message customer
- [ ] Audit trail records all changes
- [ ] Customer receives email after admin actions
- [ ] Totals recalculate correctly after changes

### 6.3 Customer Quote Viewing Testing
Test scenarios:
- [ ] Individual user sees quote list without pricing
- [ ] Business unverified user sees verification prompt
- [ ] Business verified user sees full pricing
- [ ] Quote status updates reflect immediately
- [ ] Expiry dates show correctly
- [ ] "Convert to Order" works for accepted quotes
- [ ] PDF download works (if implemented)
- [ ] Customer can message admin on quote
- [ ] Empty state shows when no quotes exist

### 6.4 Multi-User Flow Testing
Test full lifecycle:
- [ ] Customer submits quote → Appears in admin panel
- [ ] Admin reviews and adds pricing → Customer sees status change
- [ ] Admin accepts quote → Customer can convert to order
- [ ] Customer converts → Quote marked as converted
- [ ] Admin rejects quote → Customer sees rejection with reason

---

## 📋 Phase 7: Polish & Optimization

### 7.1 Performance
- [ ] Add database indexes for quote queries
- [ ] Implement pagination for large quote lists
- [ ] Cache user type and verification status
- [ ] Optimize quote basket queries
- [ ] Add loading skeletons for quote lists

### 7.2 Error Handling
- [ ] Graceful error messages for failed submissions
- [ ] Retry logic for failed API calls
- [ ] Toast notifications for all actions
- [ ] Proper error boundaries

### 7.3 Email Notifications
- [ ] Quote submitted → Email to admin
- [ ] Quote accepted → Email to customer
- [ ] Quote rejected → Email to customer with reason
- [ ] Quote expiring soon → Email to customer
- [ ] New message from admin → Email to customer

### 7.4 Real-Time Updates (Optional)
- [ ] Use Pusher for real-time quote status updates
- [ ] Show "Quote updated" notification
- [ ] Auto-refresh quote list when changes occur

### 7.5 Documentation
- [ ] Update API documentation
- [ ] Create admin user guide for quote management
- [ ] Create customer guide for requesting quotes
- [ ] Document pricing visibility rules

---

## 🗂️ Files to Create

### New Admin Files
```
/app/src/app/admin/(dashboard)/quotes/
├── page.tsx (list page)
└── [id]/
    └── page.tsx (detail page)

/app/src/domains/admin/quotes/
├── quote-filters.tsx
├── quote-stats.tsx
├── quote-table.tsx
├── quote-detail-header.tsx
├── quote-items-editor.tsx
├── quote-pricing-editor.tsx
├── quote-quantity-editor.tsx
├── quote-item-adder.tsx
├── quote-messages.tsx
├── quote-internal-notes.tsx
├── quote-audit-timeline.tsx
└── quote-status-changer.tsx
```

### New Quote Request Files
```
/app/src/app/(main)/request-quote/
├── page.tsx (server component)
└── request-quote-client.tsx (client component)
```

### New Component Files
```
/app/src/components/quotes/
├── quote-status-badge.tsx
├── quote-expiry-badge.tsx
└── quote-pricing-display.tsx
```

### Expand Existing Files
```
/app/src/lib/actions/admin-quotes/
├── quote-management.ts (expand CRUD)
├── quote-pricing.ts (expand editing)
├── quote-queries.ts (expand filtering)
└── quote-audit.ts (expand logging)
```

---

## 🗂️ Files to Modify

### Remove Demo Data From:
- `/app/src/app/(main)/quotes/quotes-page-client.tsx`
- `/app/src/modules/home/components/desktop/tab-content/business-hub/sections/recent-quotes.tsx`
- `/app/src/modules/home/components/desktop/tab-content/business-hub/sections/quotes-orders-snapshot.tsx`

### Update Quote Buttons In:
- `/app/src/modules/products/components/product/get-quote-button.tsx`
- `/app/src/modules/products/components/product/add-to-quote-button.tsx`
- Product card components
- Product detail page
- Desktop welcome section

---

## 🎯 Success Criteria

**Demo Data Removal:**
- ✅ No hardcoded quote data visible anywhere
- ✅ All quote displays fetch from Supabase
- ✅ Empty states show properly when no data

**Quote Request Flow:**
- ✅ Users can request quotes from any product location
- ✅ Pre-filling works from URL params
- ✅ Form submissions save to Supabase
- ✅ Success confirmations show correct quote numbers

**Admin Management:**
- ✅ Admin can view all quotes with filtering
- ✅ Admin can edit pricing, quantities, items
- ✅ Admin can accept/reject quotes with reasons
- ✅ All changes tracked in audit log
- ✅ Customers notified of status changes

**User Experience:**
- ✅ Pricing visibility follows verification rules
- ✅ Verified users can convert accepted quotes to orders
- ✅ Quote statuses update in real-time or on refresh
- ✅ UI is responsive and handles errors gracefully

---

## 📅 Estimated Timeline

- **Phase 1 (Database & Backend):** 2-3 hours
- **Phase 2 (Remove Demo Data):** 1-2 hours
- **Phase 3 (Quote Request Flow):** 3-4 hours
- **Phase 4 (Admin Management):** 5-6 hours
- **Phase 5 (User Display):** 2-3 hours
- **Phase 6 (Testing):** 2-3 hours
- **Phase 7 (Polish):** 1-2 hours

**Total Estimated Time:** 16-23 hours

---

## 🚨 Critical Notes

**Do NOT:**
- ❌ Silently modify customer's original quote data without audit trail
- ❌ Show pricing to unverified users
- ❌ Allow quote conversion if not accepted
- ❌ Delete quotes without proper archiving
- ❌ Expose internal admin notes to customers

**DO:**
- ✅ Always track changes in audit log
- ✅ Require reasons for item/quantity changes
- ✅ Send email notifications for status changes
- ✅ Validate user permissions at every step
- ✅ Show clear visual diff for admin modifications

---

## 📝 Implementation Order (Recommended)

1. **Start with Backend** (Phase 1)
   - Get database structure solid
   - Create all server actions
   - Test with Postman/API client

2. **Remove Demo Data** (Phase 2)
   - Quick wins, immediate visible progress
   - Reveals what's actually working vs mocked

3. **Quote Request Flow** (Phase 3)
   - Core customer functionality
   - Most frequently used feature

4. **Admin Management** (Phase 4)
   - Unlocks the entire system
   - Most complex phase

5. **User Display** (Phase 5)
   - Polish customer-facing features
   - Apply verification rules

6. **Test Everything** (Phase 6)
   - Full lifecycle testing
   - Cross-role testing

7. **Final Polish** (Phase 7)
   - Performance optimization
   - Email notifications
   - Documentation

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Next Review:** After Phase 1 completion
