# Cedar Admin Module Changes Checklist

**Project:** Cedar B2B Admin Refactoring  
**Started:** January 2025  
**Tech Stack:** Next.js 16, Supabase, Clerk Auth, TypeScript

---

## 📊 Overall Progress

- **Phase 1: Quotes Module** - ⏳ In Progress
- **Phase 2: Customers Module** - ⏸️ Not Started
- **Phase 3: Products Module** - ⏸️ Not Started
- **Phase 4: Inventory Module** - ⏸️ Not Started

---

## 🎯 PHASE 1: QUOTES MODULE (REVENUE ENGINE)

**Priority:** HIGHEST | **Status:** ⏳ In Progress

### Database Schema Changes
- [x] Create Supabase migration for quote statuses simplification
- [x] Add `quote_audit_log` table for tracking changes
- [x] Update quotes table indexes for performance
- [x] Add role-based access control columns

### Type Definitions
- [x] Update QuoteStatus type (remove excess statuses)
- [x] Add QuoteAuditLog type
- [x] Add role permission types (Staff, Manager, Admin, Super Admin)
- [x] Update Quote interface with new fields

### Backend (Server Actions)
- [x] Update `getAdminQuotes` with new filter logic
- [x] Update `updateQuoteStatus` with audit logging
- [x] Add `approveQuote` action (Manager+)
- [x] Add `convertQuoteToOrder` action (verified business only)
- [x] Add `getQuoteAuditLog` action
- [x] Update `updateQuotePricing` with validation
- [x] Add quote summary validation before approval
- [x] Add `rejectQuote` action with reason requirement
- [x] Create admin role utilities with permission checks

### Quotes List Page (`/admin/quotes/page.tsx`)
- [x] **Simplify table columns:**
  - [x] Quote ID
  - [x] Customer (name + contact)
  - [x] User Type (with icon)
  - [x] Items Count
  - [x] Priority badge
  - [x] Status badge
  - [x] Submitted Date
  - [x] Actions column
- [x] Remove revenue/totals from list view (already clean)
- [x] Update filters (status, priority, user type, date range)
- [x] Add quick "Start Review" action for pending quotes
- [x] Update stats cards (Total, Pending, Reviewing, Approved, Business)

### Quote Detail Page (`/admin/quotes/[id]/page.tsx`)
- [x] **A. Sticky Quote Header**
  - [x] Quote ID display
  - [x] Status display with workflow validation
  - [x] Priority badge (editable inline)
  - [x] Primary CTA (context-aware: Start Review → Approve → Convert)
- [x] **B. Customer Context Panel**
  - [x] Customer name and type
  - [x] Account type badge
  - [x] Business verified indicator with badge icon
  - [x] Link to customer profile
- [x] **C. Quote Items Table**
  - [x] Product column with thumbnail
  - [x] Requested quantity
  - [x] Unit price (editable for Manager+ in edit mode)
  - [x] Discount % (editable for Manager+ in edit mode)
  - [x] Auto-calculated total
  - [x] Validation before approve
- [x] **D. Quote Summary Panel**
  - [x] Subtotal calculation (auto-updated)
  - [x] Discount total
  - [x] GST calculation (18%)
  - [x] Final total
  - [x] Valid until date
  - [x] Summary auto-calculates from items
- [x] **E. Communication & Timeline (Merged)**
  - [x] Customer messages
  - [x] Admin replies
  - [x] Internal notes (private, color-coded yellow)
  - [x] All in unified timeline
- [x] **F. Actions Panel**
  - [x] Message customer
  - [x] Request clarification (via messages)
  - [x] Approve quote (Manager+)
  - [x] Reject quote (reason required with modal)
  - [x] Convert to order (verified only)

### Quote → Order Conversion
- [x] Create conversion validation checks
- [x] Verify quote is approved
- [x] Verify customer is Business Verified
- [x] Add conversion flow UI:
  - [x] Confirm pricing
  - [x] Confirm address (uses default or fallback)
  - [x] Confirm delivery method
  - [x] Create order with proper order number
- [x] Manual conversion only (admin-initiated)
- [x] Add conversion audit trail
- [x] Create order record in orders table
- [x] Copy quote items to order_items table
- [x] Decrement inventory for order items
- [x] Update quote status to 'converted'

### Role-Based Access Control
- [ ] Implement Clerk-based role checking
- [ ] Staff: View only access
- [ ] Manager: Price quotes & approve
- [ ] Admin: Full access
- [ ] Super Admin: All permissions
- [ ] Add role badges in UI
- [ ] Disable actions based on role

### Testing & Validation
- [ ] Test quote status transitions
- [ ] Test role-based permissions
- [ ] Test quote approval workflow
- [ ] Test quote-to-order conversion
- [ ] Test pricing calculations
- [ ] Test audit log creation

---

## 👥 PHASE 2: CUSTOMERS MODULE (VERIFICATION & TRUST)

**Priority:** HIGH | **Status:** ⏸️ Not Started

### Database Schema Changes
- [ ] Create `verification_documents` table
- [ ] Add verification fields to customers
- [ ] Create `verification_audit_log` table
- [ ] Add business_verified flag

### Type Definitions
- [ ] Add VerificationDocument type
- [ ] Add VerificationStatus type
- [ ] Update Customer type with verification fields
- [ ] Add VerificationAuditLog type

### Backend (Server Actions)
- [ ] Implement `getCustomers` action
- [ ] Implement `getCustomerById` action
- [ ] Add `getVerificationDocuments` action
- [ ] Add `approveVerification` action (Admin only)
- [ ] Add `rejectVerification` action (Admin only)
- [ ] Add `requestMoreDocuments` action
- [ ] Add `getVerificationAuditLog` action
- [ ] Implement `exportCustomersAction`

### Customers List Page (`/admin/customers/page.tsx`)
- [ ] Keep filters: Account type, Verification status, Registration date
- [ ] Remove: Spend analytics, Segmentation, Lifetime value
- [ ] Add verification status badge
- [ ] Update stats cards

### Customer Detail Page (`/admin/customers/[id]/page.tsx`)
- [ ] **Tab Structure:**
  - [ ] Overview Tab
  - [ ] Verification Tab (business only)
  - [ ] Quotes Tab
  - [ ] Orders Tab
  - [ ] Internal Notes Tab
- [ ] **Overview Tab:**
  - [ ] Name, Email, Phone
  - [ ] Account type
  - [ ] Verification badge
  - [ ] Created date
  - [ ] Remove stats cards
- [ ] **Verification Tab (CORE):**
  - [ ] Document preview + download
  - [ ] Company info (GST, PAN)
  - [ ] Verification status
  - [ ] Actions: Approve, Reject, Request more docs
  - [ ] Audit log (who verified, when, reason)
- [ ] **Quotes Tab:** Table with status and links
- [ ] **Orders Tab:** Table with status and links
- [ ] **Internal Notes:** Admin-only, timestamped

### Document Management
- [ ] Upload GST certificate
- [ ] Upload PAN card
- [ ] Upload Business license
- [ ] Preview documents in modal
- [ ] Download documents
- [ ] Request specific documents

### Verification Workflow
- [ ] Submit for verification button
- [ ] Approve verification (Admin only)
- [ ] Reject with reason (mandatory)
- [ ] Request more documents
- [ ] Notification to customer on status change
- [ ] Audit trail for all actions

### Testing & Validation
- [ ] Test document upload
- [ ] Test verification workflow
- [ ] Test role permissions (Admin only)
- [ ] Test audit logging
- [ ] Test notifications

---

## 📦 PHASE 3: PRODUCTS MODULE (CEDAR-SPECIFIC)

**Priority:** MEDIUM | **Status:** ⏸️ Not Started

### Database Schema Changes
- [ ] Add elevator-specific fields to products table:
  - [ ] elevator_type (enum)
  - [ ] application_type (enum)
  - [ ] technical_specs (jsonb)
  - [ ] voltage
  - [ ] load_capacity
  - [ ] speed
  - [ ] variant_group
- [ ] Create migration file
- [ ] Add indexes for new fields

### Type Definitions
- [ ] Add ElevatorType enum
- [ ] Add ApplicationType enum
- [ ] Add TechnicalSpecs interface
- [ ] Update Product type with Cedar fields
- [ ] Add VariantGroup type

### Configuration Files
- [ ] Create `/lib/config/elevator-types.ts`
- [ ] Create `/lib/config/application-types.ts`
- [ ] Create `/lib/config/technical-specs-templates.ts`

### Backend (Server Actions)
- [ ] Update `createProduct` with new fields validation
- [ ] Update `updateProduct` with new fields
- [ ] Add validation for Cedar-specific fields

### Product Create/Edit Form
- [ ] Add Elevator Type selector
- [ ] Add Application Type selector
- [ ] Add Technical Specs section:
  - [ ] Voltage input
  - [ ] Load Capacity input
  - [ ] Speed input
- [ ] Add Variant Group section
- [ ] Remove: Fashion attributes, Trending flags
- [ ] Update form validation

### Product List Page
- [ ] Add Elevator Type filter
- [ ] Add Application Type filter
- [ ] Display elevator type in list
- [ ] Update product card with Cedar info

### Product Detail View
- [ ] Display technical specifications
- [ ] Show elevator type and application
- [ ] Show variant information

### Testing & Validation
- [ ] Test product creation with Cedar fields
- [ ] Test product editing
- [ ] Test filtering by elevator type
- [ ] Test variant management
- [ ] Test validation rules

---

## 📊 PHASE 4: INVENTORY MODULE (SIMPLIFIED)

**Priority:** MEDIUM | **Status:** ⏸️ Not Started

### Database Schema Changes
- [ ] Add `inventory_adjustments` table
- [ ] Add adjustment_reason field
- [ ] Add adjusted_by field (admin user)
- [ ] Remove: auto-reserve, forecasting fields

### Type Definitions
- [ ] Add InventoryAdjustment type
- [ ] Add AdjustmentReason enum
- [ ] Update InventoryItem type

### Backend (Server Actions)
- [ ] Simplify `getInventory` action
- [ ] Add `adjustStock` action (manual)
- [ ] Add `getStockAdjustmentLog` action
- [ ] Remove: auto-reserve logic, forecasting

### Inventory Page (`/admin/inventory/page.tsx`)
- [ ] Simplify list view:
  - [ ] Product name
  - [ ] SKU
  - [ ] Current stock
  - [ ] Status (In Stock / Low / Out)
  - [ ] Last updated
  - [ ] Adjust stock action
- [ ] Keep: Low stock alerts
- [ ] Remove: Forecasting, Auto-reserve UI

### Stock Adjustment
- [ ] Manual adjustment modal
- [ ] Actions: Set stock, Add stock, Reduce stock
- [ ] Reason field (required)
- [ ] Admin confirmation
- [ ] Audit log entry

### Inventory Rules
- [ ] Stock reduces only on order creation (NOT quotes)
- [ ] Low stock warning threshold (configurable)
- [ ] No auto-reserve functionality
- [ ] No forecasting features

### Stock Adjustment Log
- [ ] View adjustment history
- [ ] Show admin who made change
- [ ] Show timestamp
- [ ] Show reason
- [ ] Show before/after quantities

### Testing & Validation
- [ ] Test manual stock adjustment
- [ ] Test audit logging
- [ ] Test low stock alerts
- [ ] Test order creation stock reduction
- [ ] Verify no auto-reserve

---

## 🔐 ROLE-BASED ACCESS CONTROL (RBAC)

**Status:** ⏸️ Not Started

### Clerk Integration
- [ ] Set up admin roles in Clerk metadata
- [ ] Create role checking utilities
- [ ] Add role middleware for admin routes

### Role Permissions Matrix
| Module | Staff | Manager | Admin | Super Admin |
|--------|-------|---------|-------|-------------|
| **Quotes** | View | Price & Approve | Full | Full |
| **Verification** | ❌ | ❌ | Approve | Full |
| **Products** | View | Edit | Full | Full |
| **Inventory** | View | Adjust | Full | Full |

### Implementation
- [ ] Create `/lib/auth/admin-roles.ts`
- [ ] Create `useAdminRole()` hook
- [ ] Create `<RequireRole>` guard component
- [ ] Add role checks to server actions
- [ ] Add role-based UI rendering

---

## 🗄️ DATABASE MIGRATIONS

**Status:** ⏸️ Not Started

### Migration Files to Create
- [ ] `001_simplify_quote_statuses.sql`
- [ ] `002_add_quote_audit_log.sql`
- [ ] `003_add_verification_tables.sql`
- [ ] `004_add_cedar_product_fields.sql`
- [ ] `005_add_inventory_adjustments.sql`
- [ ] `006_add_admin_roles.sql`

### Migration Tasks
- [ ] Create Supabase migration files
- [ ] Test migrations locally
- [ ] Document rollback procedures
- [ ] Add seed data for testing
- [ ] Test with production-like data

---

## 📝 DOCUMENTATION

**Status:** ⏸️ Not Started

- [ ] Update ARCHITECTURE.md with new schema
- [ ] Create ADMIN-WORKFLOWS.md guide
- [ ] Document role permissions
- [ ] Create admin user guide
- [ ] Document quote-to-order flow
- [ ] Document verification workflow

---

## 🧪 TESTING CHECKLIST

**Status:** ⏸️ Not Started

### Unit Tests
- [ ] Quote status transitions
- [ ] Role permission checks
- [ ] Pricing calculations
- [ ] Verification workflow

### Integration Tests
- [ ] Quote approval flow
- [ ] Quote-to-order conversion
- [ ] Document upload and verification
- [ ] Stock adjustments

### E2E Tests
- [ ] Complete quote lifecycle
- [ ] Complete verification flow
- [ ] Product creation with Cedar fields
- [ ] Inventory management flow

---

## 🚀 DEPLOYMENT CHECKLIST

**Status:** ⏸️ Not Started

- [ ] Run all migrations on staging
- [ ] Test on staging environment
- [ ] Create production migration plan
- [ ] Backup production database
- [ ] Run migrations on production
- [ ] Verify all features working
- [ ] Monitor for errors

---

## 📊 COMPLETION SUMMARY

### Phase 1: Quotes Module
- **Started:** [Date]
- **Completed:** [Date]
- **Files Changed:** [Count]
- **Lines Added/Modified:** [Count]

### Phase 2: Customers Module
- **Started:** [Date]
- **Completed:** [Date]
- **Files Changed:** [Count]
- **Lines Added/Modified:** [Count]

### Phase 3: Products Module
- **Started:** [Date]
- **Completed:** [Date]
- **Files Changed:** [Count]
- **Lines Added/Modified:** [Count]

### Phase 4: Inventory Module
- **Started:** [Date]
- **Completed:** [Date]
- **Files Changed:** [Count]
- **Lines Added/Modified:** [Count]

---

**Last Updated:** [Auto-updated on each change]  
**Current Phase:** Phase 1 - Quotes Module  
**Overall Completion:** 0%
