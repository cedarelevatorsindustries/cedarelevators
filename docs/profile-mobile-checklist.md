# Profile Mobile Module - Implementation Checklist

**Project**: Cedar Elevators B2B/B2C E-commerce Platform  
**Module**: Profile (Mobile)  
**Goal**: Create mobile-first profile experience answering "Who am I?", "What can I do?", "What happened?"  
**Status**: 📋 READY TO IMPLEMENT (0% Complete)  
**Created**: January 2025  
**Updated**: January 2025

---

## 🎯 CORE PRINCIPLE

**Mobile Profile = Navigation-First, NOT Data-First**

❌ **NOT**:
- A dashboard with stats
- A mini Business Hub
- An analytics center
- A quick actions hub
- Chart or graph heavy

✅ **Mobile Profile IS**:
- "My Account" feeling
- List-based navigation
- Role-aware menu system
- Clear identity indicator
- History viewer (not creator)

---

## 📱 MOBILE DESIGN RULES

### Non-Negotiable Mobile Requirements

1. **Bottom Navigation Entry**
   - Label: "MyCedar"
   - Icon: User/Account icon
   - Accessible to ALL users (Guest, Individual, Business)
   - Always visible on main app screens

2. **Layout Structure**
   - Fixed top bar with "MyCedar" title
   - No horizontal scrolling
   - List-based sections (not card-heavy)
   - Single column layout
   - 16px padding standard
   - Clear section headers

3. **Interaction Patterns**
   - Tap → Navigate (no swipe gestures for now)
   - Full-width tappable rows
   - Chevron (>) indicates navigation
   - Badges for status (Pending, Verified, etc.)

4. **What Mobile Profile MUST NOT Show**
   - ❌ Stats cards or counters
   - ❌ Quick action buttons (Buy, Quote, Reorder)
   - ❌ Charts or graphs
   - ❌ Bulk operations
   - ❌ Performance metrics
   - ❌ Recent activity feeds (small lists OK)

5. **What Mobile Profile MUST Show**
   - ✅ Account identity card
   - ✅ Role-specific menu items
   - ✅ Clear CTAs (Sign In, Verify, Upgrade)
   - ✅ Settings access
   - ✅ Support links

---

## 📋 PHASE 1: ACCOUNT CARD COMPONENT (15%)

**Status**: ✅ COMPLETE

### 1.1 Create AccountCard Component ✅

**File**: `/app/src/modules/profile/components/mobile/account-card.tsx`

**Requirements**:
- ✅ Display user avatar or role icon
- ✅ Show name (or "Guest User" for guests)
- ✅ Show account type badge
- ✅ Show verification status for business users
- ✅ Single primary CTA button max
- ✅ NO stats, NO counts, NO analytics

**Variations by Role**:

1. **Guest User** ✅
2. **Individual User** ✅
3. **Business (Unverified)** ✅
4. **Business (Verified)** ✅

---

## 📋 PHASE 2: MENU SECTIONS STRUCTURE (25%)

**Status**: ✅ COMPLETE

### 2.1 Define Menu Section Groups ✅

**File**: `/app/src/lib/utils/profile-mobile.ts`

**Function**: `getMobileProfileMenu(userRole, isVerified)` - ✅ Implemented

### 2.2 Create MenuSection Component ✅

**File**: `/app/src/modules/profile/components/mobile/menu-section.tsx` - ✅ Already exists

**Additional Components Created**:
- ✅ `/app/src/modules/profile/components/mobile/mobile-menu.tsx` - Menu renderer with icon support and logout handling

---

## 📋 PHASE 3: GUEST USER MENU (10%)

**Status**: ✅ COMPLETE

### 3.1 Guest User Menu Structure ✅

**Total Items**: 5

**Implementation**:
- ✅ Show account card with "Guest User"
- ✅ Two CTA buttons: [Sign In] [Create Account]
- ✅ Simple menu with Browse Products, Contact Sales, Help Center
- ✅ No history or activity section

**File**: `/app/src/modules/profile/components/mobile/guest-menu.tsx`

---

## 📋 PHASE 4: INDIVIDUAL USER MENU (15%)

**Status**: ✅ COMPLETE

### 4.1 Individual User Menu Structure ✅

**Total Items**: 11

**Implementation**:
- ✅ Account section with Profile Overview, Personal Info, Addresses
- ✅ Activity section with Quotes, Orders, Wishlist
- ✅ Settings section with Notifications, Security
- ✅ Support & Auth section with Help Center, Contact Support, Logout
- ✅ "Upgrade to Business" CTA in Account Card
- ✅ Display user name and email
- ✅ Individual Account badge

**File**: `/app/src/modules/profile/components/mobile/individual-menu.tsx`

---

## 📋 PHASE 5: BUSINESS UNVERIFIED MENU (15%)

**Status**: ✅ COMPLETE

### 5.1 Business Unverified Menu Structure ✅

**Total Items**: 10

**Implementation**:
- ✅ Account section: Business Info, Verification (with "Pending" badge), Addresses
- ✅ Activity section: Quotes, Orders
- ✅ Settings section: Notifications, Security
- ✅ Support & Auth section: Help Center, Contact Support, Logout
- ✅ Account card shows "Verification Pending" status
- ✅ [Complete Verification] CTA button prominent
- ✅ Company name displayed
- ✅ Orange/warning badge on Verification menu item

**File**: `/app/src/modules/profile/components/mobile/business-menu.tsx`

---

## 📋 PHASE 6: BUSINESS VERIFIED MENU (15%)

**Status**: ⏳ NOT STARTED

### 6.1 Business Verified Menu Structure ☐

**Total Items**: 11

**Account Section** (3 items):
- ☐ Business Info → navigates to `/profile/business-info`
- ☐ Addresses → navigates to `/profile/addresses`
- ☐ Payment Preferences → navigates to `/profile/payment-methods`

**Activity Section** (3 items):
- ☐ Quotes → navigates to `/profile/quotes`
- ☐ Orders → navigates to `/profile/orders`
- ☐ Invoices → navigates to `/profile/invoices`

**Settings Section** (2 items):
- ☐ Notifications → navigates to `/profile/notifications`
- ☐ Security → navigates to `/profile/security`

**Support & Auth Section** (3 items):
- ☐ Help Center
- ☐ Contact Support
- ☐ Logout

**Special Features**:
- ☐ Account card shows green "✅ Verified" badge
- ☐ No verification CTA
- ☐ Access to Payment Preferences
- ☐ Access to Invoices
- ☐ Company name prominently displayed

---

## 📋 PHASE 7: MOBILE PROFILE PAGE IMPLEMENTATION (15%)

**Status**: ⏳ NOT STARTED

### 7.1 Create Mobile Profile Layout ☐

**File**: `/app/src/app/(main)/profile-mobile/page.tsx`

**or enhance existing**: `/app/src/app/(main)/profile/page.tsx` with responsive detection

**Requirements**:
- ☐ Detect mobile viewport (< 768px)
- ☐ Show mobile-specific layout on mobile devices
- ☐ Top bar: "MyCedar" title, avatar on right
- ☐ Scrollable content area
- ☐ Bottom padding for bottom nav clearance (80px)

### 7.2 Integrate with Bottom Navigation ☐

**File**: `/app/src/components/layout/bottom-nav.tsx` (or similar)

**Requirements**:
- ☐ Add "MyCedar" tab to bottom navigation
- ☐ Icon: User/Account icon
- ☐ Active state styling
- ☐ Navigate to `/profile` or `/profile-mobile`

### 7.3 Implement Role-Based Rendering ☐

**Logic**:
```typescript
// Pseudo-code
if (isGuest) {
  render(<GuestMenu />)
} else if (isIndividual) {
  render(<IndividualMenu />)
} else if (isBusiness && !isVerified) {
  render(<BusinessUnverifiedMenu />)
} else if (isBusiness && isVerified) {
  render(<BusinessVerifiedMenu />)
}
```

**Files**:
- ☐ Create wrapper component that handles role detection
- ☐ Pass user data from Clerk/Supabase
- ☐ Render correct menu structure

---

## 📋 PHASE 8: RESPONSIVE NAVIGATION (5%)

**Status**: ⏳ NOT STARTED

### 8.1 Handle Navigation Events ☐

**Requirements**:
- ☐ Use Next.js router for navigation
- ☐ Show loading state during navigation
- ☐ Maintain bottom nav visibility
- ☐ No nested modals on mobile

### 8.2 Deep Link Support ☐

**Requirements**:
- ☐ Support direct links to profile sections
- ☐ Example: `/profile/quotes` opens quotes on mobile
- ☐ Back button returns to profile menu

---

## 📋 PHASE 9: STYLING & POLISH (5%)

**Status**: ⏳ NOT STARTED

### 9.1 Mobile-Specific Styling ☐

**Requirements**:
- ☐ Tailwind mobile-first classes
- ☐ Touch-friendly tap targets (min 44px)
- ☐ Proper spacing (16px padding)
- ☐ Safe area insets for notched devices
- ☐ Smooth transitions

### 9.2 Icon System ☐

**Requirements**:
- ☐ Use consistent icon library (Lucide React)
- ☐ 20px icon size for menu items
- ☐ 16px chevron size
- ☐ Proper icon alignment

### 9.3 Typography ☐

**Requirements**:
- ☐ Section titles: 12px, uppercase, gray-500
- ☐ Menu items: 16px, medium weight
- ☐ Account name: 18px, bold
- ☐ Account type: 14px, regular, gray-600

---

## 📋 TESTING CHECKLIST

### Functional Testing ☐

- ☐ Guest user sees correct menu (5 items)
- ☐ Individual user sees correct menu (11 items)
- ☐ Business unverified sees correct menu (10 items)
- ☐ Business verified sees correct menu (11 items)
- ☐ Account card displays correct information per role
- ☐ CTAs work correctly (Sign In, Upgrade, Complete Verification)
- ☐ All navigation links work
- ☐ Logout functionality works
- ☐ Back navigation works properly

### Visual Testing ☐

- ☐ Layout looks correct on iPhone SE (375px)
- ☐ Layout looks correct on iPhone 14 Pro (393px)
- ☐ Layout looks correct on Android (360px - 412px)
- ☐ No horizontal scroll
- ☐ Icons aligned properly
- ☐ Badges display correctly
- ☐ Bottom nav doesn't overlap content
- ☐ Safe area respected on notched devices

### Edge Cases ☐

- ☐ Very long company names wrap correctly
- ☐ No avatar image shows default icon
- ☐ Slow network shows loading states
- ☐ Error states handled gracefully
- ☐ Navigation during loading doesn't break

---

## 📊 PROGRESS TRACKING

### Overall Progress: 0% ⏳

```
Phase 1: Account Card          [          ] 0%
Phase 2: Menu Sections         [          ] 0%
Phase 3: Guest Menu            [          ] 0%
Phase 4: Individual Menu       [          ] 0%
Phase 5: Business Unverified   [          ] 0%
Phase 6: Business Verified     [          ] 0%
Phase 7: Page Implementation   [          ] 0%
Phase 8: Navigation            [          ] 0%
Phase 9: Styling & Polish      [          ] 0%
```

---

## 🎯 FEATURE SEPARATION (Mobile)

| Feature | Mobile Profile | Business Hub | Admin |
|---------|---------------|--------------|-------|
| Identity Display | ✅ | ❌ | ❌ |
| Account Settings | ✅ | ❌ | ❌ |
| History Lists | ✅ | ⚠️ Snapshot | ✅ |
| Create Quote | ❌ | ✅ | ❌ |
| Quick Actions | ❌ | ✅ | ❌ |
| Reorder | ❌ | ✅ | ❌ |
| Stats/Analytics | ❌ | ❌ | ✅ |
| Charts | ❌ | ❌ | ✅ |
| Bulk Operations | ❌ | ✅ | ❌ |

---

## ✅ COMPLETION CRITERIA

Before marking this module complete, verify:

- ☐ Bottom nav has "MyCedar" entry
- ☐ Account card implemented for all 4 roles
- ☐ Guest menu has exactly 5 items (no more, no less)
- ☐ Individual menu has exactly 11 items
- ☐ Business unverified menu has exactly 10 items
- ☐ Business verified menu has exactly 11 items
- ☐ NO stats, charts, or analytics visible
- ☐ NO quick action buttons (Buy, Quote, Reorder)
- ☐ Menu is list-based, not card-heavy
- ☐ All navigation links work correctly
- ☐ CTAs appropriate to role (Sign In, Upgrade, Verify)
- ☐ Mobile-first: works on 360px width minimum
- ☐ No horizontal scroll
- ☐ Touch targets are min 44px
- ☐ Safe area respected on notched devices
- ☐ Passes visual testing on 3+ device sizes
- ☐ Role transitions work (guest → individual → business)

---

## 🚫 WHAT MOBILE PROFILE MUST NOT HAVE

This is a **PERMANENT** exclusion list. These features belong elsewhere:

❌ **Dashboard/Analytics**:
- Stats cards (orders count, total spent, etc.)
- Performance charts
- Success rates
- Monthly metrics
- Spending analytics

❌ **Quick Actions**:
- "Quick Reorder" buttons
- "Create Quote" buttons
- "Shop Catalog" shortcuts
- "Buy Now" actions
- Bulk operations

❌ **Business Hub Features**:
- Recent activity feed
- Smart alerts
- Recommended products
- Exclusive products showcase
- Performance dashboard

❌ **Complex Interactions**:
- Swipe gestures
- Drag and drop
- Nested modals
- Horizontal carousels
- Multi-step wizards in-place

---

## 📝 DESIGN PRINCIPLES

1. **Mobile = Navigation Hub, Not Action Hub**
   - Profile is for identity, settings, and history
   - Actions belong in Business Hub or dedicated flows

2. **List Over Cards**
   - Full-width tappable rows
   - Clear hierarchy
   - Easy scanning

3. **One Column, Always**
   - No grid layouts on mobile profile
   - Vertical stack only
   - Generous padding

4. **Boring is Beautiful**
   - Enterprise users want predictable
   - No fancy animations
   - Clear, simple, fast

5. **Role-Aware, Not Role-Heavy**
   - Show only what matters to this role
   - Don't overwhelm with options
   - Progressive disclosure

---

## 📦 FILES TO CREATE/MODIFY

### New Files (Estimated: 8-10 files)

**Components**:
1. ☐ `/app/src/modules/profile/components/mobile/account-card.tsx`
2. ☐ `/app/src/modules/profile/components/mobile/menu-section.tsx`
3. ☐ `/app/src/modules/profile/components/mobile/menu-item.tsx`
4. ☐ `/app/src/modules/profile/components/mobile/guest-menu.tsx`
5. ☐ `/app/src/modules/profile/components/mobile/individual-menu.tsx`
6. ☐ `/app/src/modules/profile/components/mobile/business-menu.tsx`

**Utils**:
7. ☐ `/app/src/lib/utils/profile-mobile.ts` - Menu configuration

**Pages**:
8. ☐ `/app/src/app/(main)/profile-mobile/page.tsx` (or enhance existing)

### Modified Files (Estimated: 3-5 files)

1. ☐ `/app/src/app/(main)/profile/page.tsx` - Add mobile detection
2. ☐ `/app/src/components/layout/bottom-nav.tsx` - Add MyCedar tab
3. ☐ `/app/src/lib/utils/profile.ts` - Potentially add mobile helpers
4. ☐ `/app/middleware.ts` - If mobile-specific routes needed

---

## 🔄 IMPLEMENTATION ORDER

### Recommended Sequence:

1. **Start with Utils** ✅
   - Create menu configuration
   - Define types and interfaces
   - Set up role detection helpers

2. **Build Components Bottom-Up** ✅
   - MenuItem component first (most basic)
   - MenuSection component (uses MenuItem)
   - AccountCard component
   - Role-specific menu components

3. **Integrate into Pages** ✅
   - Add mobile detection to existing profile page
   - OR create separate mobile profile page
   - Add to bottom navigation

4. **Polish & Test** ✅
   - Styling refinements
   - Responsive testing
   - Edge case handling

---

## 💡 IMPLEMENTATION NOTES

### Why Separate Mobile Menu?

Desktop profile can be richer with:
- Sidebar navigation
- Multi-column layouts
- More detailed information display

Mobile must be:
- Single column
- Bottom-nav driven
- List-based navigation
- Minimum information, maximum clarity

### Responsive Strategy

**Option A: Unified Page with Responsive Components**
```typescript
// profile/page.tsx
<div className="hidden md:block">
  <DesktopProfile />
</div>
<div className="block md:hidden">
  <MobileProfile />
</div>
```

**Option B: Separate Mobile Route**
```typescript
// Detect in middleware or layout
if (isMobile) {
  redirect('/profile-mobile')
} else {
  redirect('/profile')
}
```

**Recommendation**: Option A is simpler and maintains single URL structure.

---

## 🎓 KEY LEARNINGS FROM DESKTOP PROFILE

The desktop profile was successfully cleaned up by:
1. Removing dashboard concept entirely
2. Eliminating stats and analytics
3. Removing quick actions
4. Simplifying navigation to 3 groups max
5. Making it boring and predictable

**Apply same principles to mobile, but even more strictly:**
- Mobile has less space → even less content
- Mobile is navigation-first → lists over cards
- Mobile users want speed → no cognitive load

---

## 🚀 SUCCESS METRICS

After implementation, Mobile Profile should:

✅ **Feel Fast**
- No unnecessary data loading
- Instant navigation
- Clear touch feedback

✅ **Feel Simple**
- Max 11 menu items for any role
- Clear section grouping
- One action per row

✅ **Feel Role-Appropriate**
- Guest sees path to sign in
- Individual sees path to upgrade
- Business unverified sees path to verify
- Business verified sees full access

✅ **Feel Separate from Business Hub**
- Zero feature duplication
- Clear mental model
- No confusion about where to go

---

## 📞 TROUBLESHOOTING GUIDE

### Common Issues During Implementation

**Issue**: Menu items not showing for certain roles
- **Check**: Role detection logic in menu configuration
- **Check**: Clerk metadata sync with Supabase
- **Check**: Environment variables

**Issue**: Navigation not working
- **Check**: Next.js router import
- **Check**: URL paths match actual routes
- **Check**: Middleware not blocking routes

**Issue**: Layout breaks on small screens
- **Check**: Min-width constraints
- **Check**: Padding adds up correctly
- **Check**: Bottom nav height clearance

**Issue**: Account card not showing correct data
- **Check**: User data props passed correctly
- **Check**: Clerk user metadata structure
- **Check**: Conditional rendering logic

---

**Last Updated**: January 2025  
**Status**: 📋 READY TO IMPLEMENT (0% Complete)  
**Estimated Time**: 16-20 hours  
**Next Action**: Review with stakeholder, then begin Phase 1

---

**Remember**: 
- Mobile Profile is NOT a dashboard
- Mobile Profile is NOT Business Hub
- Mobile Profile answers: "Who am I?", "My settings?", "My history?"
- Less is more. Boring is good. Navigation over data.

✨ **Keep it simple. Keep it clean. Keep it mobile-first.** ✨
