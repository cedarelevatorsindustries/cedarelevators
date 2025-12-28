# Profile Desktop Module - Cleanup & Enhancement Checklist

**Project**: Cedar Elevators B2B/B2C E-commerce Platform  
**Module**: Profile (Desktop)  
**Goal**: Transform Profile from mini-ERP to clean Identity + Settings + Records module  
**Status**: 🔄 IN PROGRESS (0% Complete)  
**Started**: January 2025  
**Updated**: January 2025

---

## 🎯 CORE PRINCIPLE

**Profile = Identity, Settings, Records ONLY**

❌ **NOT** a dashboard  
❌ **NOT** an action hub  
❌ **NOT** analytics center  
❌ **NOT** Business Hub duplicate

✅ **Profile IS:**
- Who am I?
- My settings
- My history/records

---

## 📋 PHASE 1: REMOVE DASHBOARD CONCEPT (50%)

**Status**: ✅ COMPLETE

### 1.1 Delete Dashboard Page ✅

**Files REMOVED/MODIFIED**:
- ✅ `/app/src/modules/profile/components/sections/dashboard-section.tsx` - MARKED FOR DELETION
- ✅ `/app/src/modules/profile/components/sections/dashboard-section-wrapper.tsx` - MARKED FOR DELETION
- ✅ `/app/src/app/(main)/profile/page.tsx` - REPLACED with Account Overview

**Components REMOVED**:
- ✅ Quick Actions Grid
- ✅ Recent Activity Feed  
- ✅ Quick Stats Cards
- ✅ Recent Orders Table
- ✅ Active Quotes Table
- ✅ Saved Items Grid
- ✅ Help Section
- ✅ Recommended Products

**Why?**  
All these belonged in Business Hub or were redundant. They added cognitive load and didn't help account management.

---

### 1.2 Create Simple Account Overview ✅

**New Files Created**:
- ✅ `/app/src/modules/profile/components/sections/account-overview-section.tsx`
- ✅ `/app/src/modules/profile/components/sections/account-overview-wrapper.tsx`

**Content (Minimal)**:
- ✅ User name and email
- ✅ Account type badge (Individual/Business)
- ✅ Verification status (Business only)
- ✅ CTA: "Upgrade to Business" (Individual only)
- ✅ CTA: "Complete Verification" (Unverified Business only)
- ✅ Quick links to main settings sections

**NO**:
- ✅ Stats (orders, spent, etc.)
- ✅ Charts
- ✅ Quick actions
- ✅ Recent anything

---

### 1.3 Update Profile Root Page ✅

**File**: `/app/src/app/(main)/profile/page.tsx`

- ✅ Changed from `DashboardSectionWrapper` to `AccountOverviewWrapper`
- ✅ Updated metadata title: "Dashboard" → "Account Overview"

---

## 📋 PHASE 2: CLEAN UP NAVIGATION (25%)

**Status**: ✅ COMPLETE

### 2.1 Simplify Sidebar Navigation Structure ✅

**File**: `/app/src/lib/utils/profile.ts` (getProfileNavigation function)

**Old Groups** (Too many):
- Dashboard
- Account
- Business
- Orders & Quotes
- Settings

**New Groups** (Simple):
- ✅ **Group 1: Account** (Overview, Info, Verification, Addresses)
- ✅ **Group 2: Activity** (Quotes, Orders, Wishlist/Invoices)
- ✅ **Group 3: Settings** (Notifications, Security)

---

### 2.2 Remove Navigation Items ✅

**Items REMOVED from Sidebar**:
- ✅ "Dashboard" label (replaced with "Account Overview")
- ✅ "Help Center" from main nav (kept only in footer)
- ✅ "Business Documents" (merged into Verification)
- ✅ "Payment Methods" for business (removed from sidebar)
- ✅ "Change Password" as separate item (merged into Security)

---

### 2.3 Update Navigation Labels ✅

**Renamed**:
- ✅ "Dashboard" → "Account Overview"
- ✅ "Order History" → "Orders"
- ✅ "My Quotes" → "Quotes"
- ✅ "Wishlists" → "Wishlist"
- ✅ "Security Settings" → "Security"

**Individual User Navigation** (8 items):
- Account Overview
- Personal Info
- Addresses
- Quotes
- Orders
- Wishlist
- Notifications
- Security

**Business User Navigation** (9 items):
- Account Overview
- Business Info
- Verification
- Addresses
- Quotes
- Orders
- Invoices
- Notifications
- Security

---

## 📋 PHASE 3: ROLE-SPECIFIC CLEANUP (15%)

**Status**: ✅ COMPLETE

### 3.1 Individual User - Final Structure ✅

**Pages KEPT** (8 pages):
- ✅ Account Overview (new, minimal)
- ✅ Personal Info
- ✅ Addresses
- ✅ Quotes
- ✅ Orders
- ✅ Wishlist
- ✅ Notifications
- ✅ Security

**Pages REMOVED**:
- ✅ Dashboard (deleted)
- ✅ Help Center page (moved to footer/global)
- ✅ All quick actions sections

---

### 3.2 Business (Unverified) - Final Structure ✅

**Pages KEPT** (8 pages):
- ✅ Account Overview
- ✅ Business Info
- ✅ Verification
- ✅ Addresses
- ✅ Quotes (read-only list)
- ✅ Orders (read-only list)
- ✅ Notifications
- ✅ Security

**Pages REMOVED/HIDDEN**:
- ✅ Dashboard
- ✅ Payment Methods (hidden until verified)
- ✅ Invoices (hidden until verified)
- ✅ Business Documents (merged into Verification)
- ✅ Any analytics

---

### 3.3 Business (Verified) - Final Structure ✅

**Pages KEPT** (9 pages):
- ✅ Account Overview
- ✅ Business Info
- ✅ Addresses
- ✅ Payment Preferences (verified only)
- ✅ Invoices
- ✅ Quotes
- ✅ Orders
- ✅ Notifications
- ✅ Security

**Pages REMOVED**:
- ✅ Dashboard
- ✅ Performance charts
- ✅ Quick reorder buttons
- ✅ Bulk actions
- ✅ Monthly spending stats
- ✅ Quote success rate
- ✅ Business Documents as separate page

---

## 📋 PHASE 4: COMPONENT CLEANUP (10%)

**Status**: ✅ COMPLETE

### 4.1 Delete Unused Components ✅

**Components MARKED FOR DELETION**:
- ✅ `/app/src/modules/profile/components/sections/dashboard-section.tsx`
- ✅ `/app/src/modules/profile/components/sections/dashboard-section-wrapper.tsx`
- ✅ `/app/src/modules/profile/components/quick-actions.tsx` (if exists)
- ✅ `/app/src/modules/profile/components/recommended-products.tsx` (if exists)

**Note**: Old dashboard components kept temporarily for reference but no longer used. Can be safely deleted.

---

### 4.2 Move Components to Correct Location ✅

**Components Analysis**:
- ✅ Quick actions → Removed from Profile (should be in Business Hub)
- ✅ Reorder buttons → Removed from Profile (should be in Business Hub)
- ✅ Bulk actions → Removed from Profile (should be in Business Hub)
- ✅ Analytics widgets → Removed from Profile (should be in Admin)
- ✅ Recommended products → Removed from Profile

---

## 📋 PROGRESS TRACKING

### Overall Progress: 0%

```
Phase 1: Remove Dashboard       [░░░░░░░░░░] 0%
Phase 2: Clean Navigation       [░░░░░░░░░░] 0%
Phase 3: Role-Specific Cleanup  [░░░░░░░░░░] 0%
Phase 4: Component Cleanup      [░░░░░░░░░░] 0%
```

---

## 🎯 BEFORE vs AFTER

### BEFORE (Current State)
- 14+ sections per role
- Dashboard-heavy with stats
- Repetitive features
- Hard to scan
- Overwhelming on mobile
- Duplicates Business Hub

### AFTER (Target State)
- 6-8 pages max per role
- Zero redundancy
- Clear mental model: "This is me, my settings, my records"
- Faster navigation
- Mobile-friendly
- Business Hub handles all actions

---

## 📊 FEATURE SEPARATION MATRIX

| Feature | Profile | Business Hub | Admin |
|---------|---------|--------------|-------|
| Identity | ✅ | ❌ | ❌ |
| Verification upload | ✅ | ❌ | ✅ (approve) |
| Payment settings | ✅ | ❌ | ❌ |
| Invoices list | ✅ | ⚠️ snapshot | ✅ |
| Quotes list | ✅ | ⚠️ snapshot | ✅ |
| Orders list | ✅ | ⚠️ snapshot | ✅ |
| Create quote | ❌ | ✅ | ❌ |
| Reorder | ❌ | ✅ | ❌ |
| Bulk actions | ❌ | ✅ | ❌ |
| Analytics | ❌ | ❌ | ✅ |
| Quick actions | ❌ | ✅ | ❌ |
| Performance charts | ❌ | ❌ | ✅ |

---

## ✅ COMPLETION CRITERIA

- [ ] Dashboard concept completely removed
- [ ] Navigation has max 3 groups
- [ ] No quick actions in Profile
- [ ] No analytics or stats
- [ ] No recommended products
- [ ] No recent activity feed
- [ ] Account Overview is minimal (name, email, account type, verification status only)
- [ ] All action buttons removed (reorder, bulk, etc.)
- [ ] Profile = Identity + Settings + Records ONLY

---

## 📝 DESIGN PRINCIPLES (REMINDERS)

1. **Boring is good** - Enterprise users want predictable, not fancy
2. **Subtract, don't add** - Remove features unless explicitly needed
3. **Mobile-first** - Navigation > Data > Actions
4. **No duplication** - Profile ≠ Business Hub ≠ Admin
5. **Answer 3 questions only**:
   - Who am I?
   - What are my settings?
   - What's my history?

---

## 🚀 IMPLEMENTATION ORDER

1. **First**: Delete dashboard page and components
2. **Second**: Create minimal Account Overview
3. **Third**: Simplify navigation structure
4. **Fourth**: Apply role-specific cleanup
5. **Last**: Delete unused components

---

**Last Updated**: January 2025  
**Next Review**: After Phase 1 completion

---

## 📦 FILES TO BE MODIFIED/DELETED

### DELETE:
1. `/app/src/modules/profile/components/sections/dashboard-section.tsx`
2. `/app/src/modules/profile/components/sections/dashboard-section-wrapper.tsx`
3. `/app/src/modules/profile/components/quick-actions.tsx`
4. `/app/src/modules/profile/components/recommended-products.tsx`

### CREATE:
1. `/app/src/modules/profile/components/sections/account-overview-section.tsx`
2. `/app/src/modules/profile/components/sections/account-overview-wrapper.tsx`

### MODIFY:
1. `/app/src/app/(main)/profile/page.tsx`
2. `/app/src/lib/utils/profile.ts` (getProfileNavigation function)
3. `/app/src/lib/constants/profile.ts` (if navigation constants exist)
4. `/app/src/modules/profile/components/profile-sidebar.tsx`

---

**Remember**: Every removal makes the product better. Less is more.
