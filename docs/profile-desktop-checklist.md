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

**Status**: ⏳ NOT STARTED

### 1.1 Delete Dashboard Page ❌

**Files to REMOVE/MODIFY**:
- [x] `/app/src/modules/profile/components/sections/dashboard-section.tsx` - DELETE
- [ ] `/app/src/modules/profile/components/sections/dashboard-section-wrapper.tsx` - DELETE
- [ ] `/app/src/app/(main)/profile/page.tsx` - REPLACE with Account Overview

**Components to DELETE**:
- [ ] Quick Actions Grid (lines 217-255 in dashboard-section.tsx)
- [ ] Recent Activity Feed (lines 257-280)
- [ ] Quick Stats Cards
- [ ] Recent Orders Table (lines 282-343)
- [ ] Active Quotes Table (lines 346-410)
- [ ] Saved Items Grid (lines 413-440)
- [ ] Help Section (lines 443-461)
- [ ] Recommended Products (line 465)

**Why?**  
All these belong in Business Hub or are redundant. They add cognitive load and don't help account management.

---

### 1.2 Create Simple Account Overview ✅

**New File**: `/app/src/modules/profile/components/sections/account-overview-section.tsx`

**Content (Minimal)**:
- [ ] User name and email
- [ ] Account type badge (Individual/Business)
- [ ] Verification status (Business only)
- [ ] CTA: "Upgrade to Business" (Individual only)
- [ ] CTA: "Complete Verification" (Unverified Business only)

**NO**:
- ❌ Stats (orders, spent, etc.)
- ❌ Charts
- ❌ Quick actions
- ❌ Recent anything

---

### 1.3 Update Profile Root Page ✅

**File**: `/app/src/app/(main)/profile/page.tsx`

- [ ] Change from `DashboardSectionWrapper` to `AccountOverviewSectionWrapper`
- [ ] Update metadata title: "Dashboard" → "Account Overview"

---

## 📋 PHASE 2: CLEAN UP NAVIGATION (25%)

**Status**: ⏳ NOT STARTED

### 2.1 Simplify Sidebar Navigation Structure

**File**: `/app/src/lib/utils/profile.ts` (getProfileNavigation function)

**Current Groups** (Too many):
- Dashboard
- Account
- Business
- Activity
- Settings

**New Groups** (Simple):
- [ ] **Group 1: Account** (first_name, email, addresses)
- [ ] **Group 2: Activity** (quotes, orders, wishlist/invoices)
- [ ] **Group 3: Settings** (notifications, security)

---

### 2.2 Remove Navigation Items

**Items to REMOVE from Sidebar**:
- [ ] "Dashboard" item (replace with "Account Overview")
- [ ] "Help Center" from main nav (keep only in footer)
- [ ] Any "Business Documents" (merge into Verification)
- [ ] Any "Payment Methods" for unverified business

---

### 2.3 Update Navigation Labels

**Rename**:
- [ ] "Dashboard" → "Account Overview"
- [ ] "Personal Info" / "Business Info" → keep as is
- [ ] "Order History" → "Orders"
- [ ] "Wishlists" → "Wishlist"

---

## 📋 PHASE 3: ROLE-SPECIFIC CLEANUP (15%)

**Status**: ⏳ NOT STARTED

### 3.1 Individual User - Final Structure

**Pages to KEEP**:
- [ ] Account Overview (new, minimal)
- [ ] Personal Info
- [ ] Addresses
- [ ] Quotes
- [ ] Orders
- [ ] Wishlist
- [ ] Notifications
- [ ] Security

**Pages to REMOVE**:
- [ ] Dashboard (delete)
- [ ] Help Center page (move to footer/global)
- [ ] Any quick actions sections

---

### 3.2 Business (Unverified) - Final Structure

**Pages to KEEP**:
- [ ] Account Overview
- [ ] Business Info
- [ ] Verification (merged with documents)
- [ ] Addresses
- [ ] Quotes (read-only list)
- [ ] Orders (read-only list)
- [ ] Notifications
- [ ] Security

**Pages to REMOVE/HIDE**:
- [ ] Dashboard
- [ ] Payment Methods (hide entirely until verified)
- [ ] Invoices (hide until verified)
- [ ] Any analytics

**Merge**:
- [ ] "Business Documents" → into "Verification" page

---

### 3.3 Business (Verified) - Final Structure

**Pages to KEEP**:
- [ ] Account Overview
- [ ] Business Info
- [ ] Addresses
- [ ] Payment Preferences
- [ ] Invoices
- [ ] Quotes
- [ ] Orders
- [ ] Notifications
- [ ] Security

**Pages to REMOVE**:
- [ ] Dashboard
- [ ] Performance charts
- [ ] Quick reorder buttons
- [ ] Bulk actions
- [ ] Monthly spending stats
- [ ] Quote success rate

---

## 📋 PHASE 4: COMPONENT CLEANUP (10%)

**Status**: ⏳ NOT STARTED

### 4.1 Delete Unused Components

**Components to DELETE**:
- [ ] `/app/src/modules/profile/components/quick-actions.tsx`
- [ ] `/app/src/modules/profile/components/recommended-products.tsx`
- [ ] Any StatsCard components
- [ ] Any Performance chart components
- [ ] Recent activity feed components

---

### 4.2 Move Components to Correct Location

**Components to MOVE (if they exist)**:
- [ ] Quick actions → Move to Business Hub module
- [ ] Reorder buttons → Move to Business Hub
- [ ] Bulk actions → Move to Business Hub
- [ ] Analytics widgets → Move to Admin or delete

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
