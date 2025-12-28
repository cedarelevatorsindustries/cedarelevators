# Admin Settings Module Documentation

## Overview

The Admin Settings module provides a centralized configuration interface for Cedar Elevators platform. It follows a **minimal, boring, safe** design philosophy with a strict 2-tier access control system.

## Design Principles

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

## 2-Tier Access Control System

### 🔴 Tier-1: Critical (Super Admin ONLY)

Settings that can break payments, affect taxes, or impact business trust.

**Modules:**
1. **Pricing Rules** (`/admin/settings/pricing-rules`)
2. **Payment Settings** (`/admin/settings/payments`)
3. **Tax (GST) Settings** (`/admin/settings/tax`)
4. **Admin Users** (`/admin/settings/users`)
5. **System Settings** (`/admin/settings/system`) - Hidden route

**Access Control:**
- File: `src/lib/admin/settings-access.ts`
- Guard Component: `<Tier1Guard>` in `src/components/admin/settings-guards.tsx`
- Only users with `super_admin` role can access

### 🟡 Tier-2: Operational (Admin + Manager + Staff)

Settings that can be adjusted safely during early operations.

**Modules:**
1. **Store & Branding** (`/admin/settings/store`)
2. **Shipping Settings** (`/admin/settings/shipping`)

**Access Control:**
- File: `src/lib/admin/settings-access.ts`
- Guard Component: `<Tier2Guard>` in `src/components/admin/settings-guards.tsx`
- Accessible to: `super_admin`, `admin`, `manager`, `staff`

---

## Settings Modules

### 1. Settings Landing Page

**Route:** `/admin/settings`  
**Component:** `src/app/admin/settings/page.tsx`

**Features:**
- Card-based section list (NO dashboard)
- Tier badges (🔴 Restricted / 🟡 Operational)
- Short descriptions for each section
- Mobile-responsive layout
- Role-based filtering (shows only accessible modules)

**Access:** All authenticated admin users

---

### 2. Store & Branding (Tier-2)

**Route:** `/admin/settings/store`  
**Component:** `src/app/admin/settings/store/page.tsx`  
**Form:** `src/modules/admin/settings/store-settings-form.tsx`

**Fields:**
- Store name
- Legal name
- Store logo upload
- Support email
- Support phone
- Business address (via GST number)
- GST number
- Invoice prefix
- Currency
- Timezone

**Database:** `store_settings` table  
**Access:** All roles (Tier-2)

---

### 3. Pricing Rules (Tier-1)

**Route:** `/admin/settings/pricing-rules`  
**Component:** `src/app/admin/settings/pricing-rules/page.tsx`  
**Form:** `src/modules/admin/settings/pricing-rules-form.tsx`

**Fields:**
- Guest price visibility toggle
- Individual price visibility toggle
- Business (unverified) price visibility toggle
- Business (verified) price visibility toggle
- Business verified can buy toggle
- Bulk pricing enabled toggle
- Minimum order quantity
- Discount cap percentage

**Database:** `pricing_settings` table  
**Migration:** `supabase/migrations/006_create_pricing_settings.sql`  
**Access:** Super Admin only (Tier-1)

---

### 4. Payment Settings (Tier-1)

**Route:** `/admin/settings/payments`  
**Component:** `src/app/admin/settings/payments/page.tsx`  
**Form:** `src/modules/admin/settings/payment-settings-form.tsx`

**Fields:**
- Razorpay enabled toggle
- Bank transfer enabled toggle
- Credit terms enabled toggle (verified business only)

**Important Notes:**
- Sensitive keys (Razorpay API keys) are stored in environment variables
- Settings page only has enable/disable toggles
- No API keys exposed in the UI

**Database:** `payment_settings` table  
**Migration:** `supabase/migrations/007_create_settings_tables.sql`  
**Access:** Super Admin only (Tier-1)

---

### 5. Tax (GST) Settings (Tier-1)

**Route:** `/admin/settings/tax`  
**Component:** `src/app/admin/settings/tax/page.tsx`  
**Form:** `src/modules/admin/settings/tax-settings-form-simplified.tsx`

**Fields:**
- GST enabled toggle
- Default GST percentage
- CGST/SGST/IGST rules toggle
- Tax-inclusive vs exclusive pricing

**Simplified for:**
- India-only (no multi-country tax logic)
- B2B platform (simple GST rules)
- No complex state-wise calculations

**Database:** `tax_settings` table  
**Migration:** `supabase/migrations/007_create_settings_tables.sql`  
**Access:** Super Admin only (Tier-1)

---

### 6. Shipping Settings (Tier-2)

**Route:** `/admin/settings/shipping`  
**Component:** `src/app/admin/settings/shipping/page.tsx`  
**Form:** `src/modules/admin/settings/shipping-settings-form.tsx`

**Fields:**
- Shipping zones (India only)
- Flat rate shipping toggle
- Free shipping threshold
- Delivery SLA text field

**Simplified for:**
- Operational fulfillment only
- No carrier integrations
- No complex rate calculators
- No analytics

**Database:** `shipping_settings` table  
**Migration:** `supabase/migrations/007_create_settings_tables.sql`  
**Access:** All roles (Tier-2)

---

### 7. Admin Users (Tier-1)

**Route:** `/admin/settings/users`  
**Component:** `src/app/admin/settings/users/page.tsx`  
**Module:** `src/modules/admin/settings/admin-users-settings.tsx`

**Features:**
- View all admin users
- Add new admin users
- Approve/revoke admin access
- Change admin roles (with confirmation)
- Activity log for audit trail
- Confirmation dialogs for critical actions

**Security:**
- Default role is "Staff"
- Explicit approval required
- Role change confirmation dialog
- Warning for Super Admin role assignment
- Activity log mandatory

**Database:** `admin_profiles` table  
**Access:** Super Admin only (Tier-1)

---

### 8. System Settings (Tier-1, Hidden)

**Route:** `/admin/settings/system` (direct URL only)  
**Component:** `src/app/admin/settings/system/page.tsx`

**Features:**

#### Feature Flags
- Bulk operations toggle
- Advanced analytics toggle
- Experimental features toggle

#### Maintenance Mode
- Enable/disable maintenance mode
- Custom maintenance message
- Admins can still access during maintenance

#### Debug Settings
- Debug logging toggle
- Show detailed errors toggle
- Security warnings for production

**Important Notes:**
- Hidden from sidebar navigation
- Access via direct URL only
- Super Admin only
- Connected to database for persistence

**Database:** `system_settings` table  
**Migration:** `supabase/migrations/007_create_settings_tables.sql`  
**Access:** Super Admin only (Tier-1, Hidden)

---

## Technical Implementation

### Access Control Utilities

**File:** `src/lib/admin/settings-access.ts`

**Functions:**
```typescript
// Check Tier-1 access
canAccessTier1(role: AdminRole): boolean

// Check Tier-2 access
canAccessTier2(role: AdminRole): boolean

// Check module access
canAccessModule(role: AdminRole, moduleId: string): boolean

// Get accessible settings
getAccessibleSettings(role: AdminRole): SettingsModule[]

// Get sidebar items
getSettingsSidebarItems(role: AdminRole): SettingsModule[]

// Check if module is restricted
isModuleRestricted(role: AdminRole, moduleId: string): boolean

// Get tier badge variant
getTierBadgeVariant(tier: SettingsTier): 'destructive' | 'warning'

// Get tier badge text
getTierBadgeText(tier: SettingsTier): string
```

**Constants:**
- `SETTINGS_MODULES`: Array of all settings modules with metadata
- `TIER_1_ROLES`: `['super_admin']`
- `TIER_2_ROLES`: `['super_admin', 'admin', 'manager', 'staff']`

---

### Guard Components

**File:** `src/components/admin/settings-guards.tsx`

**Components:**

#### `<SettingsGuard>`
Generic guard component for settings pages
```tsx
<SettingsGuard 
  userRole={profile.role} 
  requiredTier="tier1"
  fallback={<CustomMessage />}
>
  {children}
</SettingsGuard>
```

#### `<Tier1Guard>`
Guard for Tier-1 (Critical) settings
```tsx
<Tier1Guard userRole={profile.role}>
  {children}
</Tier1Guard>
```

#### `<Tier2Guard>`
Guard for Tier-2 (Operational) settings
```tsx
<Tier2Guard userRole={profile.role}>
  {children}
</Tier2Guard>
```

#### `<RestrictedAccessMessage>`
Default fallback component for unauthorized access
- Shows orange alert card
- Explains why access is restricted
- Provides instructions to contact Super Admin

---

### Settings Sidebar

**File:** `src/modules/admin/settings/settings-sidebar.tsx`

**Features:**
- Shows all modules (including restricted ones)
- Restricted modules show 🔒 lock icon and are grayed out
- Active module highlighted with orange border
- Tier badges displayed (🔴 for Tier-1, 🟡 for Tier-2)
- Collapsible sidebar (desktop)
- Mobile sheet navigation
- Back to admin dashboard button

---

### Settings Layout

**File:** `src/app/admin/settings/layout.tsx`

**Features:**
- Dedicated settings layout (replaces admin layout)
- Settings sidebar (desktop + mobile)
- Settings header with collapse toggle
- Gradient background (orange theme)
- QueryProvider for React Query
- Responsive design

---

## Database Schema

### Tables Created

1. **`store_settings`** (Tier-2)
2. **`pricing_settings`** (Tier-1)
3. **`payment_settings`** (Tier-1)
4. **`tax_settings`** (Tier-1)
5. **`shipping_settings`** (Tier-2)
6. **`system_settings`** (Tier-1, Hidden)

### Migrations

- `supabase/migrations/006_create_pricing_settings.sql`
- `supabase/migrations/007_create_settings_tables.sql`

**Features:**
- Row Level Security (RLS) enabled on all tables
- Only authenticated admins can read
- Only Super Admin can update critical settings
- Default seed data for initial setup

---

## Environment Variables

### Required for Settings

```env
# Supabase Configuration (general)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Payment Gateway Keys (Tier-1 Payment Settings)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Important:**
- Payment gateway keys are NOT stored in the database
- Only enable/disable toggles are stored
- Keys must be set via environment variables

---

## Security Considerations

### ✅ Implemented

1. **Role-Based Access Control**
   - Strict 2-tier system
   - Component-level guards
   - Database-level RLS policies

2. **Sensitive Data Protection**
   - Payment keys in environment variables
   - No API keys exposed in UI
   - Service role key for admin operations

3. **Audit Trail**
   - Admin user management logged
   - Activity tracking
   - Approval workflow

4. **UI Security**
   - Restricted modules grayed out
   - Clear access messages
   - Confirmation dialogs for critical actions

### ⚠️ Best Practices

1. **Never expose sensitive keys in the UI**
2. **Always use guards on settings pages**
3. **Test role access after changes**
4. **Keep environment variables secure**
5. **Run migrations in staging first**

---

## Testing Checklist

### Access Control Testing
- [ ] Super Admin can access all Tier-1 + Tier-2 modules
- [ ] Admin can access only Tier-2 modules
- [ ] Manager can access only Tier-2 modules
- [ ] Staff can access only Tier-2 modules (read-only?)
- [ ] Direct URL access to restricted modules shows access denied

### Functionality Testing
- [ ] Store & Branding form saves correctly
- [ ] Pricing Rules form saves correctly
- [ ] Payment toggles work correctly
- [ ] Tax settings save correctly
- [ ] Shipping settings save correctly
- [ ] Admin user management works correctly
- [ ] System settings save correctly

### UI/UX Testing
- [ ] Settings landing page renders correctly
- [ ] Tier badges display properly (🔴 and 🟡)
- [ ] Mobile responsiveness works
- [ ] Restricted access messages show properly
- [ ] Navigation flow is smooth
- [ ] Sidebar shows correct modules based on role

---

## Troubleshooting

### Settings not loading
- Check database connection
- Verify migrations ran successfully
- Check RLS policies are enabled

### Access denied for Super Admin
- Verify user role in `admin_profiles` table
- Check that role is exactly `'super_admin'`
- Clear browser cache and cookies

### Form save fails
- Check console for errors
- Verify environment variables are set
- Check database table exists
- Verify RLS policies allow updates

### System Settings not visible
- This is intentional - it's a hidden route
- Access directly at `/admin/settings/system`
- Only Super Admin can access

---

## Future Enhancements

Potential improvements (not currently planned):

- [ ] Settings version history
- [ ] Settings backup and restore
- [ ] Settings import/export
- [ ] Settings change notifications
- [ ] Multi-language support for settings
- [ ] Settings documentation inline help
- [ ] Settings validation rules
- [ ] Settings change approval workflow (for non-super-admins)

---

## Support & Maintenance

### Key Files to Monitor

1. **Access Control:** `src/lib/admin/settings-access.ts`
2. **Guards:** `src/components/admin/settings-guards.tsx`
3. **Sidebar:** `src/modules/admin/settings/settings-sidebar.tsx`
4. **Landing Page:** `src/app/admin/settings/page.tsx`

### Adding a New Settings Module

1. Add module config to `SETTINGS_MODULES` in `settings-access.ts`
2. Create page at `src/app/admin/settings/{module-name}/page.tsx`
3. Add guard component (`<Tier1Guard>` or `<Tier2Guard>`)
4. Create form component in `src/modules/admin/settings/`
5. Add database table if needed
6. Create migration file
7. Add icon to `ICON_MAP` in sidebar and landing page
8. Test access control with different roles

### Modifying Tier Access

1. Update `allowedRoles` in module config (`settings-access.ts`)
2. Verify guard component on page (`Tier1Guard` vs `Tier2Guard`)
3. Update database RLS policies if needed
4. Test with affected roles

---

## Changelog

**Version 1.0** (Current)
- Initial implementation
- 2-tier access control system
- 7 settings modules (6 visible + 1 hidden)
- Mobile responsive design
- Database integration with Supabase
- Full RLS policies

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Production Ready
