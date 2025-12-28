# Quote Bottom Navbar (Mobile) - Implementation Checklist

## Overview
Simplifying the Quote tab navigation to follow the principle: **"One tab = One intention"**

**Core Principle:** The Quote tab always takes users to `/quotes` (single entry point), with content adapting based on user type and verification status.

---

## Current State Analysis

### Existing Implementation
- **Bottom Nav Location:** `/app/src/modules/layout/components/mobile/bottom-nav/`
- **Current Href:** `/request-quote`
- **Current Label Logic:** 
  - Guest: "Get Quote"
  - Individual: "My Quotes"
  - Business: "Business" ❌ (Too vague, violates mobile UX principles)
- **Routes:**
  - `/request-quote` - New quote creation (different templates per user type)
  - `/quotes` - Quote history (redirects guests to login)

### Issues Identified
1. ❌ Two separate routes create confusion
2. ❌ "Business" label is vague and misleading
3. ❌ Guests redirected to login instead of lead capture
4. ❌ No visual indicator for verified business users
5. ❌ Bottom nav destination changes based on user type (anti-pattern)

---

## Required Changes

### 1. Bottom Nav Configuration
**File:** `/app/src/modules/layout/components/mobile/bottom-nav/components/nav-items-config.ts`

- [ ] Change `href` from `/request-quote` to `/quotes` for single entry point
- [ ] Update `getQuoteTabLabel()` function:
  - Guest: "Get Quote"
  - Individual: "Quotes"
  - Business (Unverified): "Quotes"
  - Business (Verified): "Quotes"
- [ ] Remove "Business" as label option
- [ ] Remove "My Quotes" label (use "Quotes" for consistency)

**Expected Result:**
```typescript
{
  href: "/quotes",
  icon: FileText,
  label: user ? "Quotes" : "Get Quote"
}
```

---

### 2. Bottom Nav UI Component
**File:** `/app/src/modules/layout/components/mobile/bottom-nav/components/nav-item.tsx`

- [ ] Add optional badge/indicator prop for verification status
- [ ] Add green dot indicator for verified business users
- [ ] Ensure indicator is subtle (small green dot on icon)

---

### 3. Bottom Nav Container
**File:** `/app/src/modules/layout/components/mobile/bottom-nav/index.tsx`

- [ ] Update to fetch business verification status alongside user type
- [ ] Pass verification indicator to NavItem when user is verified business
- [ ] Update quote label reference from `/request-quote` to `/quotes`

---

### 4. Unified Quotes Page Route
**File:** `/app/src/app/(main)/quotes/page.tsx`

- [ ] **REMOVE** guest redirect to login
- [ ] Handle all user types: guest, individual, business (unverified), business (verified)
- [ ] Fetch business verification status for business users
- [ ] Pass verification status to client component

**User Type Routing Logic:**
```
Guest → Lead capture form (no redirect)
Individual → Quote workspace (tabs)
Business (Unverified) → Quote workspace with verification banner
Business (Verified) → Full quote workspace with all features
```

---

### 5. Quotes Page Client Component
**File:** `/app/src/app/(main)/quotes/quotes-page-client.tsx`

#### Guest Mode
- [ ] Show simple lead capture form
- [ ] Product selector (optional)
- [ ] Contact details fields
- [ ] Limited attachments
- [ ] Submit button
- [ ] **Remove:** Quote history, basket complexity, templates, stats

#### Individual Mode
- [ ] Two tabs: `[ New Quote ]` `[ My Quotes ]`
- [ ] New Quote: Quote basket, requirements, attachments (limited), submit
- [ ] My Quotes: List view, status, messages
- [ ] **Hide:** Pricing, convert-to-order, checkout options

#### Business (Unverified) Mode
- [ ] Top banner: `⚠️ Business verification required. Complete verification to unlock pricing & checkout.`
- [ ] Banner CTA: `[ Complete Verification ]` → links to profile verification
- [ ] Two tabs: `[ New Quote ]` `[ My Quotes ]`
- [ ] New Quote: Business quote form, bulk quantities, attachments, **no prices shown**
- [ ] My Quotes: Status tracking, admin messages, approved/pending/revised
- [ ] **Hide:** Pricing, convert-to-order

#### Business (Verified) Mode
- [ ] Two tabs: `[ New Quote ]` `[ My Quotes ]`
- [ ] New Quote: Bulk quote, CSV upload, templates, estimated pricing (optional), submit
- [ ] My Quotes: Pricing visible, convert to order, download PDF, negotiation messages
- [ ] **Remove:** Performance dashboard, unified timeline, analytics (desktop/admin only)

---

### 6. Stats Section Visibility
**Current:** Stats cards shown on all logged-in users

- [ ] **Keep stats** for Individual and Business users (useful context)
- [ ] **Remove stats** for Guest users (no history to show)
- [ ] Ensure stats reflect user-specific data only

---

### 7. Features to REMOVE from Mobile
- [ ] Mobile Business Hub (desktop only)
- [ ] Performance Snapshot (desktop/admin only)
- [ ] Smart Alerts section (desktop only)
- [ ] Recent Activity timeline (desktop only)
- [ ] Verified-only dashboards (desktop only)
- [ ] Analytics and reporting (desktop/admin only)

---

## API & Data Requirements

### 1. User Type & Verification Status API
**File:** `/app/src/app/api/auth/user-type/route.ts` (if exists, else create)

- [ ] Return combined user type + verification status
- [ ] Response format:
```json
{
  "userType": "business",
  "isVerified": true
}
```

### 2. Business Profile Query
- [ ] Query `business_profiles` table for `verification_status`
- [ ] Map status: `unverified`, `pending`, `verified`, `rejected`
- [ ] Expose `isVerified` boolean (status === 'verified')

---

## Testing Checklist

### Guest User
- [ ] Navigate to Quote tab → Goes to `/quotes`
- [ ] See "Get Quote" label
- [ ] See simple lead capture form (no login redirect)
- [ ] Can fill and submit quote request
- [ ] No quote history visible

### Individual User
- [ ] Navigate to Quote tab → Goes to `/quotes`
- [ ] See "Quotes" label
- [ ] See two tabs: New Quote / My Quotes
- [ ] Can create new quote with basket
- [ ] Can view quote history
- [ ] Prices NOT visible
- [ ] No convert-to-order option

### Business (Unverified)
- [ ] Navigate to Quote tab → Goes to `/quotes`
- [ ] See "Quotes" label (NOT "Business")
- [ ] See verification banner at top
- [ ] Banner links to profile verification
- [ ] Can create quotes with bulk quantities
- [ ] Prices NOT visible
- [ ] Can view quote status and admin messages
- [ ] No convert-to-order option

### Business (Verified)
- [ ] Navigate to Quote tab → Goes to `/quotes`
- [ ] See "Quotes" label
- [ ] See optional green dot on tab icon
- [ ] No verification banner
- [ ] Can create quotes with full features (CSV, templates)
- [ ] Prices ARE visible
- [ ] Can convert quotes to orders
- [ ] Can download PDF
- [ ] No performance dashboard on mobile

---

## Routing Simplification

### Before (Complex)
```
/request-quote → New quote creation
/quotes → Quote history (guests redirected)
/business-hub → Business features
```

### After (Simple)
```
/quotes → Single entry point for ALL users
  ↳ Content adapts based on user type + verification
```

---

## Implementation Priority

1. **High Priority** (Critical for mobile UX)
   - [ ] Change bottom nav href to `/quotes`
   - [ ] Update label logic (remove "Business")
   - [ ] Handle guest users in `/quotes` (no redirect)
   - [ ] Add verification banner for unverified business

2. **Medium Priority** (Quality of life)
   - [ ] Add green dot indicator for verified business
   - [ ] Implement tab-based UI for logged-in users
   - [ ] Hide pricing for unverified users

3. **Low Priority** (Polish)
   - [ ] Remove mobile-only features (dashboards, analytics)
   - [ ] Optimize API calls for verification status
   - [ ] Add loading states for tab switches

---

## Design Principles Enforced

✅ **Single Entry Point:** All users go to `/quotes`
✅ **Clear Labels:** "Get Quote" (guest) or "Quotes" (logged-in)
✅ **Role-Safe:** Content changes, route does NOT
✅ **Mobile-First:** Task completion over data display
✅ **No Feature Duplication:** Profile = identity, Quotes = action
✅ **Minimal & Predictable:** Boring, enterprise-friendly UX

---

## Files to Modify

### Navigation Files
1. `/app/src/modules/layout/components/mobile/bottom-nav/components/nav-items-config.ts`
2. `/app/src/modules/layout/components/mobile/bottom-nav/components/nav-item.tsx`
3. `/app/src/modules/layout/components/mobile/bottom-nav/index.tsx`

### Route Files
4. `/app/src/app/(main)/quotes/page.tsx`
5. `/app/src/app/(main)/quotes/quotes-page-client.tsx`

### API Files (if needed)
6. `/app/src/app/api/auth/user-type/route.ts` (enhance or create)

### Utility Files
7. `/app/src/lib/auth/server.ts` (add verification status helper if needed)

---

## Success Metrics

- [ ] Single route `/quotes` handles all user types
- [ ] No guest redirects to login (lead capture instead)
- [ ] Label never says "Business" on mobile
- [ ] Verified business users see visual indicator
- [ ] Unverified business users see banner with clear CTA
- [ ] No dashboards or analytics on mobile Quote tab
- [ ] AI agents can reason about routing (single entry point)

---

## Notes

- **Backward Compatibility:** The `/request-quote` route can remain for desktop or legacy links, but mobile nav MUST use `/quotes`
- **Desktop vs Mobile:** Desktop can keep separate routes if needed, but mobile MUST be simplified
- **Admin Panel:** Admin functionality remains separate (no changes needed)
- **Performance:** Consider caching verification status to reduce API calls

---

## Post-Implementation

- [ ] Update documentation
- [ ] Test on real devices (iOS/Android)
- [ ] Verify accessibility (screen readers)
- [ ] Monitor analytics for user confusion
- [ ] Gather feedback from business users

---

**Last Updated:** 2025-01-XX
**Status:** Ready for Implementation
**Priority:** High (Critical Mobile UX Fix)
