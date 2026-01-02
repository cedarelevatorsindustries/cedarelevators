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

## 📋 Phase 3: Quote Request Flow ✅ COMPLETED

### 3.1 Quote Request Page ✅
**Route:** `/app/src/app/(main)/request-quote/page.tsx`

Server Component (Page):
- [x] Accept URL params: `productId`, `variantId`, `quantity`, `source`
- [x] Fetch product details if productId provided
- [x] Fetch user type and verification status
- [x] Pass data to appropriate template component
- [x] Templates already exist for guest, individual, and business users

Client Component:
- [x] Quote forms already exist in `/app/src/modules/quote/` directory
- [x] Pre-filling logic added to page component
- [x] Forms show appropriate fields based on user type
- [x] Submit to appropriate server action based on user type
- [x] Forms already have success states and navigation

### 3.2 Product Quote Buttons ✅
**All locations where "Request Quote" or "Get Quote" appears:**

Button behavior:
- [x] `GetQuoteButton` component exists and functional
- [x] `AddToQuoteButton` component exists with basket integration
- [x] Components navigate to `/request-quote` or add to basket
- [x] Loading states implemented
- [x] Error handling in place

Locations confirmed working:
- [x] Product card in catalog (via AddToQuoteButton)
- [x] Product detail page
- [x] Quote basket integration functional
- [x] Desktop business hub already has quote integration

### 3.3 Quote Basket Management ✅
**Hook:** `/app/src/lib/hooks/use-quote-basket.ts`

- [x] Quote basket hook already exists
- [x] Items can be added via AddToQuoteButton
- [x] Basket persists in Supabase for logged-in users
- [x] Basket clears after successful submission (handled in server actions)
- [x] Basket integration already implemented in quote forms

---

## 📋 Phase 4: Admin Quote Management ✅ COMPLETED

### 4.1 Admin Quotes List Page ✅
**Route:** `/app/src/app/admin/(dashboard)/quotes/page.tsx`

- [x] Fully functional admin quotes list page
- [x] Comprehensive filtering implemented:
  - By status (All, Pending, Reviewing, Approved, Rejected, Converted)
  - By priority (All, Low, Medium, High)
  - By user type (All, Guest, Individual, Business, Verified)
  - Search by quote number, customer email/name
- [x] Stats cards displaying:
  - Total Quotes
  - Pending count
  - Reviewing count
  - Accepted count
  - Business count
- [x] Complete quotes table with:
  - Quote number (clickable to detail page)
  - Customer name/email
  - User type with icon
  - Priority badge
  - Status badge
  - Items count
  - Estimated total
  - Created date
  - Quick action buttons (View, Start Review)
- [x] Refresh button with loading state
- [x] Empty state handling
- [x] Responsive design

### 4.2 Admin Quote Detail Page ✅
**Route:** `/app/src/app/admin/(dashboard)/quotes/[id]/page.tsx`

**Quote Header:**
- [x] Quote number with status badge
- [x] Priority indicator (editable)
- [x] Created date and validity period
- [x] Context-aware action buttons based on status
- [x] Quick actions (Start Review, Approve, Reject, Convert)

**Quote Items Section:**
- [x] Complete items table with:
  - Product thumbnail
  - Product name and SKU
  - Quantity
  - Unit price (editable in review mode)
  - Discount percentage (editable)
  - Line total (auto-calculated)
- [x] Edit Pricing mode:
  - Toggle edit mode
  - Input fields for unit price and discount
  - Save/Cancel buttons
  - Real-time total calculation
- [x] Item editing with audit trail

**Pricing Summary:**
- [x] Live calculation of:
  - Subtotal
  - Discount total
  - Tax (18% GST)
  - Final total
- [x] Valid until date display
- [x] Edit mode warning indicator

**Customer Information Panel:**
- [x] Customer name, email, phone
- [x] Account type with verification badge
- [x] Company details (if business)
- [x] GST number (if applicable)
- [x] Link to customer profile

**Customer Notes & Attachments:**
- [x] Display customer requirements
- [x] Downloadable attachments with file info

**Communication Timeline:**
- [x] Unified message thread
- [x] Customer messages display
- [x] Admin messages with timestamp
- [x] Internal notes (yellow highlighted)
- [x] Message input with internal note toggle
- [x] Send message functionality

**Quote Information:**
- [x] Quote ID and creation timestamp
- [x] Last updated timestamp
- [x] Approval timestamp (if approved)

**Actions Panel:**
- [x] Context-aware quick actions
- [x] Approve/Reject workflow
- [x] Convert to order (for verified users)
- [x] Download PDF option
- [x] Rejection modal with reason
- [x] Convert to order modal with confirmation

### 4.3 Admin Quote Actions Components ✅
**Implementation:** All components are integrated within the admin pages

- [x] Filters implemented inline in list page
- [x] Stats cards implemented with real-time data
- [x] Quote table with full functionality
- [x] Detail header with status management
- [x] Items editor with pricing controls
- [x] Message system with internal notes
- [x] Status change workflow
- [x] Priority editing
- [x] All components fully functional

### 4.4 Admin Quote Actions Implementation ✅
**Location:** `/app/src/lib/actions/admin-quotes/`

All server actions exist and are functional:
- [x] `quote-audit.ts` - Audit logging
- [x] `quote-conversion.ts` - Convert to order
- [x] `quote-management.ts` - CRUD operations
- [x] `quote-messages.ts` - Message management
- [x] `quote-pricing.ts` - Pricing updates
- [x] `quote-queries.ts` - Fetch quotes with filters
- [x] `quote-status.ts` - Status updates
- [x] `index.ts` - Unified exports

Functionality:
- [x] Full CRUD operations
- [x] Status management workflow
- [x] Pricing updates with recalculation
- [x] Admin filtering and search
- [x] Message system (customer and internal)
- [x] Priority management
- [x] Audit trail tracking

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
