# Admin Settings Page Refactor - Implementation Checklist

## 🎯 GOAL
Transform Admin Settings from a feature-rich dashboard into a **minimal, boring, safe** platform configuration module following Cedar's B2B-first principles.

---

## 📋 REFACTOR PRINCIPLES

### ✅ KEEP IN SETTINGS
- Platform configuration (affects whole system)
- Things that change rarely
- Features requiring higher trust

### ❌ REMOVE FROM SETTINGS
- Daily operations (orders, quotes, customers)
- Dashboards and analytics
- Marketing features
- Anything that duplicates Profile/Business Hub

---

## 🏗️ ACCESS CONTROL TIERS

### 🔴 Tier-1: Critical (Super Admin ONLY)
Settings that can break payments, affect taxes, or impact business trust:
- Pricing Rules
- Payment Settings
- Tax Settings (GST)
- Admin Users Management
- System Settings

### 🟡 Tier-2: Operational (Admin + Manager + Staff)
Settings that can be adjusted safely during early operations:
- Store & Branding
- Shipping Settings

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1: Planning & Setup ✅
- [x] Analyze current settings structure
- [x] Create this checklist document
- [ ] Review existing admin role permissions in codebase
- [ ] Create role-check utility for Tier-1 vs Tier-2 access

---

### Phase 2: Remove Unnecessary Modules

#### 2.1 Remove Profile Page
- [ ] Delete `/app/src/app/admin/settings/profile/page.tsx`
- [ ] Remove "Profile" from settings sidebar navigation
- [ ] Update imports/references

**Reason:** Profile = identity/settings, not platform configuration

#### 2.2 Remove Store Locations
- [ ] Delete `/app/src/app/admin/settings/locations/` directory
- [ ] Remove "Store Locations" from settings sidebar navigation
- [ ] Update imports/references

**Reason:** Not needed for B2B elevator components platform

---

### Phase 3: Create New Settings Landing Page

#### 3.1 Design Simple Section List
- [ ] Create new `/app/src/app/admin/settings/page.tsx` (replace redirect)
- [ ] Design card-based section list (NO dashboard)
- [ ] Add tier badges (🔴 Restricted / 🟡 Operational)
- [ ] Add short descriptions for each section
- [ ] Mobile-responsive layout

**Design Specs:**
```
Settings
────────
🏪 Store & Branding
   Identity & contact information
   [🟡 Operational]

💰 Pricing Rules
   Control global pricing behavior
   [🔴 Restricted - Super Admin Only]

💳 Payments
   Payment method configuration
   [🔴 Restricted - Super Admin Only]

📄 Tax (GST)
   GST rates and tax rules
   [🔴 Restricted - Super Admin Only]

🚚 Shipping
   Fulfillment and delivery settings
   [🟡 Operational]

👥 Admin Users
   Manage admin access
   [🔴 Restricted - Super Admin Only]

⚙️ System (Hidden)
   Feature flags and maintenance
   [Super Admin Only - Hidden Route]
```

#### 3.2 Implement Role-Based Visibility
- [ ] Show/hide sections based on user role
- [ ] Display "Restricted Access" message for unauthorized users
- [ ] Implement proper permission checks

---

### Phase 4: Simplify Store & Branding (Tier-2)

#### 4.1 Refactor Store Settings Form
File: `/app/src/modules/admin/settings/store-settings-form.tsx`

**KEEP:**
- [ ] Store name
- [ ] Legal name
- [ ] Store logo upload
- [ ] Support email
- [ ] Support phone
- [ ] Business address
- [ ] GST number
- [ ] Invoice prefix
- [ ] Currency
- [ ] Timezone

**REMOVE:**
- [ ] Store description field
- [ ] Social media links
- [ ] SEO defaults
- [ ] Operating hours
- [ ] Taglines/slogans

#### 4.2 Update Page
- [ ] Update `/app/src/app/admin/settings/store/page.tsx`
- [ ] Change title to "Store & Branding"
- [ ] Update description: "Identity & contact — not marketing"

---

### Phase 5: Create Pricing Rules Module (Tier-1) 🆕

#### 5.1 Database Schema
- [ ] Create `pricing_settings` table in Supabase
- [ ] Fields:
  - `id` (uuid, primary key)
  - `guest_price_visible` (boolean) - default: false
  - `individual_price_visible` (boolean) - default: false
  - `business_unverified_price_visible` (boolean) - default: true
  - `business_verified_price_visible` (boolean) - default: true
  - `business_verified_can_buy` (boolean) - default: true
  - `bulk_pricing_enabled` (boolean) - default: true
  - `minimum_order_quantity` (integer) - default: 1
  - `discount_cap_percentage` (decimal) - default: 15.0
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

#### 5.2 Create API Service
- [ ] Create `/app/src/lib/services/pricing-settings.ts`
- [ ] Implement `getPricingSettings()`
- [ ] Implement `updatePricingSettings()`
- [ ] Add proper error handling

#### 5.3 Create UI Components
- [ ] Create `/app/src/modules/admin/settings/pricing-rules-form.tsx`
- [ ] Price visibility controls (per user type)
- [ ] Bulk pricing toggle
- [ ] MOQ input field
- [ ] Discount cap input
- [ ] Super Admin only access check

#### 5.4 Create Page Route
- [ ] Create `/app/src/app/admin/settings/pricing-rules/page.tsx`
- [ ] Add role guard (Super Admin only)
- [ ] Add "Restricted Access" message for non-super-admins

---

### Phase 6: Simplify Payment Settings (Tier-1)

#### 6.1 Refactor Payment Form
File: `/app/src/modules/admin/settings/payment-settings-form.tsx`

**KEEP (Minimal):**
- [ ] Razorpay enabled toggle
- [ ] Bank transfer enabled toggle
- [ ] Credit terms enabled toggle (verified business only)

**REMOVE:**
- [ ] Razorpay Key ID/Secret fields (move to env vars)
- [ ] Test mode toggle
- [ ] COD settings (not needed for B2B)
- [ ] COD max amount

**NEW APPROACH:**
- [ ] All sensitive keys go to environment variables
- [ ] Settings page only has enable/disable toggles
- [ ] Add instructions to set env vars in UI

#### 6.2 Update Database Schema
- [ ] Update `payment_settings` table
- [ ] Remove `razorpay_key_id`, `razorpay_key_secret`
- [ ] Remove `cod_enabled`, `cod_max_amount`
- [ ] Add `bank_transfer_enabled` (boolean)
- [ ] Add `credit_terms_enabled` (boolean)

---

### Phase 7: Simplify Tax Settings (Tier-1)

#### 7.1 Refactor Tax Form
File: `/app/src/modules/admin/settings/tax-settings-form.tsx`

**KEEP:**
- [ ] GST enabled toggle
- [ ] Default GST percentage
- [ ] CGST/SGST/IGST rules toggle
- [ ] Tax-inclusive vs exclusive pricing

**REMOVE:**
- [ ] Multi-country tax logic
- [ ] Tax exemptions UI (handle manually if needed)
- [ ] Complex state-wise calculations (if any)

#### 7.2 Simplify UI
- [ ] Make it a single card with 4-5 fields max
- [ ] Add clear explanation for each field
- [ ] Super Admin only access check

---

### Phase 8: Simplify Shipping Settings (Tier-2)

#### 8.1 Refactor Shipping Form
File: `/app/src/modules/admin/settings/shipping-settings-form.tsx`

**KEEP:**
- [ ] Shipping zones (India only)
- [ ] Flat rate shipping toggle
- [ ] Free shipping threshold (optional)
- [ ] Delivery SLA text field

**REMOVE:**
- [ ] Carrier integrations
- [ ] Rate calculators
- [ ] Shipping analytics
- [ ] Complex zone logic

#### 8.2 Update UI
- [ ] Simplify to operational fulfillment only
- [ ] Remove any dashboard elements
- [ ] Keep it boring and predictable

---

### Phase 9: Tighten Admin Users Module (Tier-1)

#### 9.1 Review Current Implementation
File: `/app/src/modules/admin/settings/admin-users-settings.tsx`

**VERIFY:**
- [ ] Default role is "Staff"
- [ ] Explicit approval required
- [ ] Role change confirmation dialog
- [ ] Activity log mandatory

**REMOVE:**
- [ ] Bulk admin creation (if exists)
- [ ] Auto-approve features (if exists)

**ADD:**
- [ ] Confirmation dialog for role changes
- [ ] Warning for Super Admin role assignment
- [ ] Audit trail display

---

### Phase 10: Refactor System Settings (Hidden Route)

#### 10.1 Complete Rewrite
File: `/app/src/app/admin/settings/system/page.tsx`

**CURRENT ISSUE:** Has email/password change (wrong!)

**NEW IMPLEMENTATION:**
- [ ] Remove all account management features
- [ ] Add feature flags section
  - [ ] Toggle experimental features
  - [ ] Enable/disable modules
- [ ] Add maintenance mode
  - [ ] Toggle maintenance mode
  - [ ] Custom maintenance message
- [ ] Add debug toggles
  - [ ] Enable debug logging
  - [ ] Show detailed errors
- [ ] Super Admin only + hidden from sidebar

#### 10.2 Hide from Navigation
- [ ] Remove from main settings sidebar
- [ ] Access via direct URL only: `/admin/settings/system`
- [ ] Add breadcrumb for discoverability

---

### Phase 11: Update Settings Sidebar

#### 11.1 Refactor Navigation
File: `/app/src/modules/admin/settings/settings-sidebar.tsx`

**NEW STRUCTURE:**
```typescript
const settingsNavItems = [
  {
    title: "Store & Branding",
    href: "/admin/settings/store",
    icon: Store,
    tier: "operational",
    roles: ["super_admin", "admin", "manager", "staff"]
  },
  {
    title: "Pricing Rules",
    href: "/admin/settings/pricing-rules",
    icon: DollarSign,
    tier: "critical",
    roles: ["super_admin"]
  },
  {
    title: "Payments",
    href: "/admin/settings/payments",
    icon: CreditCard,
    tier: "critical",
    roles: ["super_admin"]
  },
  {
    title: "Tax (GST)",
    href: "/admin/settings/tax",
    icon: Receipt,
    tier: "critical",
    roles: ["super_admin"]
  },
  {
    title: "Shipping",
    href: "/admin/settings/shipping",
    icon: Truck,
    tier: "operational",
    roles: ["super_admin", "admin", "manager", "staff"]
  },
  {
    title: "Admin Users",
    href: "/admin/settings/users",
    icon: UserCog,
    tier: "critical",
    roles: ["super_admin"]
  },
  // System Settings NOT in sidebar (hidden route)
]
```

#### 11.2 Implement Role-Based Rendering
- [ ] Filter nav items based on current user role
- [ ] Add tier badges to each item
- [ ] Show disabled state for restricted items

---

### Phase 12: Create Role Utilities

#### 12.1 Create Access Control Helper
File: `/app/src/lib/admin/settings-access.ts`

```typescript
// Check if user can access Tier-1 settings
export function canAccessTier1(role: string): boolean

// Check if user can access Tier-2 settings
export function canAccessTier2(role: string): boolean

// Get user's accessible settings modules
export function getAccessibleSettings(role: string): SettingsModule[]
```

#### 12.2 Create Role Guard Components
- [ ] `<Tier1Guard>` component
- [ ] `<Tier2Guard>` component
- [ ] `<RestrictedAccess>` fallback component

---

### Phase 13: Database Migrations

#### 13.1 Create Migration Files
- [ ] `add_pricing_settings_table.sql`
- [ ] `update_payment_settings_schema.sql`
- [ ] `simplify_tax_settings_schema.sql`
- [ ] `add_system_settings_table.sql`

#### 13.2 Run Migrations
- [ ] Execute migrations in Supabase SQL Editor
- [ ] Verify all tables created correctly
- [ ] Test RLS policies

---

### Phase 14: Testing & Validation

#### 14.1 Access Control Testing
- [ ] Test Super Admin access (should see all Tier-1 + Tier-2)
- [ ] Test Admin access (should see only Tier-2)
- [ ] Test Manager access (should see only Tier-2)
- [ ] Test Staff access (should see only Tier-2, read-only?)

#### 14.2 Functionality Testing
- [ ] Test Store & Branding form save
- [ ] Test Pricing Rules form save
- [ ] Test Payments toggles
- [ ] Test Tax settings save
- [ ] Test Shipping settings save
- [ ] Test Admin Users management
- [ ] Test System Settings (hidden route)

#### 14.3 UI/UX Testing
- [ ] Verify settings landing page renders correctly
- [ ] Check tier badges display properly
- [ ] Test mobile responsiveness
- [ ] Verify restricted access messages
- [ ] Test navigation flow

#### 14.4 Edge Cases
- [ ] Non-super-admin trying to access Tier-1 URL directly
- [ ] Form submission with missing required fields
- [ ] Role change confirmation dialogs
- [ ] Settings update failures

---

### Phase 15: Documentation & Cleanup

#### 15.1 Update Documentation
- [ ] Update `/app/docs/admin-setup-guide.md`
- [ ] Add settings access control documentation
- [ ] Document tier system
- [ ] Add environment variables guide

#### 15.2 Code Cleanup
- [ ] Remove unused components
- [ ] Remove unused imports
- [ ] Clean up commented code
- [ ] Update TypeScript types

#### 15.3 Final Review
- [ ] Code review checklist
- [ ] Security review (RLS policies)
- [ ] Performance check
- [ ] Accessibility check

---

## 🎨 DESIGN SPECIFICATIONS

### Settings Landing Page
- **Layout:** Simple card grid (2 columns on desktop, 1 on mobile)
- **Card Style:** Minimal, clean, with icon + title + description
- **Tier Badge:** Small colored badge (🔴 red = critical, 🟡 yellow = operational)
- **Hover State:** Subtle shadow lift
- **Click:** Navigate to settings page

### Tier Badges
- **Tier-1:** `<Badge variant="destructive">🔴 Restricted - Super Admin Only</Badge>`
- **Tier-2:** `<Badge variant="warning">🟡 Operational</Badge>`

### Restricted Access Message
```tsx
<Card>
  <CardHeader>
    <CardTitle>Access Restricted</CardTitle>
  </CardHeader>
  <CardContent>
    <p>This settings module requires Super Admin permissions.</p>
    <p>Contact your administrator if you need access.</p>
  </CardContent>
</Card>
```

---

## 🚨 CRITICAL REMINDERS

1. **Settings ≠ Operations:** No orders, quotes, or customers here
2. **Boring is Good:** No dashboards, no analytics, no creativity
3. **Tier System is Strict:** Super Admin only for Tier-1, no exceptions
4. **Remove > Add:** If in doubt, remove it
5. **Mobile First:** Every page must work on mobile
6. **Test Roles:** Always test with different admin roles

---

## 📊 SUCCESS CRITERIA

- [ ] Settings landing page is a simple list (not a dashboard)
- [ ] All Tier-1 modules restricted to Super Admin
- [ ] Profile and Locations pages removed
- [ ] Store settings simplified (no social media, SEO, etc.)
- [ ] Payment settings are toggles only
- [ ] Pricing Rules module created and working
- [ ] All settings can be accessed on mobile
- [ ] No feature duplication with Profile/Business Hub
- [ ] System Settings hidden from navigation

---

## 🎯 FINAL SETTINGS MODULE STRUCTURE

```
/admin/settings (landing page - simple section list)
├── /store (Tier-2: Store & Branding)
├── /pricing-rules (Tier-1: NEW - Pricing Rules)
├── /payments (Tier-1: Payment toggles only)
├── /tax (Tier-1: GST only)
├── /shipping (Tier-2: Operational fulfillment)
├── /users (Tier-1: Admin Users)
└── /system (Tier-1: Hidden - Feature flags)
```

---

## 📝 NOTES

- This refactor prioritizes **safety and simplicity** over features
- Every removal has been justified per Cedar's B2B principles
- Tier system ensures critical settings are protected
- Mobile responsiveness is non-negotiable
- Settings module should feel "boring" and predictable

---

**Document Version:** 1.0  
**Last Updated:** [Auto-generated]  
**Status:** Ready for Implementation
