# Authentication Flow Fix Checklist

## Overview
This document tracks the fixes for authentication flow issues in the Cedar Elevators application.

## Issues to Fix

### 1. Sign-up Redirect Loop ❌
**Problem**: Users signing up get redirected to `/choose-type` then immediately back to `/sign-in`

**Root Cause**: 
- Conflicting authentication checks in both server component (`choose-type/page.tsx`) and client component (`ChooseTypeTemplate`)
- Server component redirects before client can properly load

**Files to Modify**:
- [ ] `/app/src/app/(auth)/choose-type/page.tsx` - Remove auth redirect from server component
- [ ] `/app/src/modules/auth/templates/choose-type.tsx` - Keep client-side auth handling

**Testing Checklist**:
- [ ] Sign up with email creates new account
- [ ] User is redirected to `/choose-type` and stays there
- [ ] Account type selector is displayed
- [ ] Selecting "Individual" or "Business" completes signup

---

### 2. Business Account Displays as Individual (Mobile View) ❌
**Problem**: Business accounts showing as "Individual Account" in mobile view despite being converted to business

**Root Cause**: 
- Account type detection depends on successfully loading business data from `business_members` join
- If business data fails to load (404 errors), it defaults to individual
- `hasBusinessProfile` check only looks at `business` object, not `user_profiles` table directly

**Files to Modify**:
- [ ] `/app/src/lib/services/auth-sync.ts` - Improve `getUserWithProfile()` to check profiles separately
- [ ] `/app/src/app/api/auth/profile/route.ts` - Update hasBusinessProfile logic
- [ ] `/app/src/lib/auth/client.ts` - Ensure proper caching of profile data

**Testing Checklist**:
- [ ] Business account shows "Business Account" badge on mobile
- [ ] Business account shows "Business Account" badge on desktop
- [ ] Profile type persists across page refreshes
- [ ] Verification status displays correctly for business accounts

---

### 3. Switch to Business Functionality Verification ❌
**Problem**: Need to verify "Switch to Business" button works properly in all scenarios

**Scenarios to Test**:
- [ ] Individual user with no business profile → Creates new business profile
- [ ] Individual user with existing business profile → Switches to business profile
- [ ] Business user → Can switch back to individual profile
- [ ] Profile switch updates UI immediately
- [ ] Profile switch persists after page refresh

**Files to Verify**:
- [ ] `/app/src/modules/profile/components/mobile/account-card.tsx` - Mobile switch logic
- [ ] `/app/src/modules/profile/components/sections/account-overview-section.tsx` - Desktop switch logic
- [ ] `/app/src/lib/services/auth-sync.ts` - Database operations for switching

---

## Implementation Phases

### Phase 1: Fix Sign-up Redirect ✅
**Status**: COMPLETED

**Changes**:
1. Update `/app/src/app/(auth)/choose-type/page.tsx`
   - ✅ Removed authentication redirect logic from server component
   - ✅ Keep only accountType validation in server-side
   - ✅ Simplified server component logic

2. Update `/app/src/modules/auth/templates/choose-type.tsx`
   - ✅ Keep authentication checks in client component
   - ✅ Added proper loading states (isCheckingAuth state)
   - ✅ Added loading UI while authentication is being verified
   - ✅ Added disabled prop to AccountTypeSelector

**Completion Criteria**:
- [x] Code changes implemented
- [ ] Sign-up flow tested manually
- [ ] No redirect loops observed
- [ ] Account type selection works

---

### Phase 2: Fix Business Account Display ✅
**Status**: COMPLETED

**Changes**:
1. Update `/app/src/lib/services/auth-sync.ts`
   - ✅ Added independent `hasBusinessProfile` check in `getUserWithProfile()`
   - ✅ Separated profile type check from business data loading with try-catch
   - ✅ Added comprehensive error handling for failed business data loads
   - ✅ Modified return type of `UserWithProfile` to include `hasBusinessProfile` field
   - ✅ Business profile existence check now queries `user_profiles` table directly

2. Update `/app/src/app/api/auth/profile/route.ts`
   - ✅ Updated to use new `hasBusinessProfile` field from `getUserWithProfile()`
   - ✅ Profile type now returned even if business data fails to load
   - ✅ Added error logging for business data loading failures
   - ✅ Maintained backward compatibility with existing API response

3. Caching in `/app/src/lib/auth/client.ts`
   - ✅ No changes needed - existing cache invalidation works properly

**Completion Criteria**:
- [x] Code changes implemented
- [x] Business profile detection works independently of business data
- [ ] Profile type displays correctly in mobile view (needs testing)
- [ ] Profile type displays correctly in desktop view (needs testing)
- [ ] 404 errors resolved or handled gracefully (implemented, needs testing)

---

### Phase 3: Verify Switch to Business ⏳
**Status**: Not Started

**Testing Steps**:
1. Test as individual user without business profile
   - [ ] Click "Switch to Business"
   - [ ] Verify business profile is created
   - [ ] Verify UI updates to show business account
   - [ ] Verify profile persists after refresh

2. Test as individual user with existing business profile
   - [ ] Click "Switch to Business"
   - [ ] Verify switch to existing business profile
   - [ ] Verify UI updates immediately
   - [ ] Verify profile persists after refresh

3. Test as business user
   - [ ] Click "Switch to Individual"
   - [ ] Verify switch to individual profile
   - [ ] Verify UI updates immediately
   - [ ] Verify profile persists after refresh

4. Test edge cases
   - [ ] Switch while cart has items
   - [ ] Switch while on profile page
   - [ ] Switch from different pages (home, catalog, etc.)

**Completion Criteria**:
- [ ] All test scenarios pass
- [ ] No console errors during switching
- [ ] UI updates consistently
- [ ] Database queries work correctly

---

## Database Verification Checklist

### Tables to Check:
- [ ] `users` table structure
- [ ] `user_profiles` table structure
- [ ] `businesses` table structure
- [ ] `business_members` table structure

### Queries to Test:
- [ ] Get user's active profile
- [ ] Get user's business profile
- [ ] Get business data for user
- [ ] Switch profile active status

---

## Testing Summary

### Manual Testing:
- [ ] Sign-up flow (email)
- [ ] Sign-up flow (Google OAuth)
- [ ] Choose account type
- [ ] Business account display (mobile)
- [ ] Business account display (desktop)
- [ ] Switch to Business
- [ ] Switch to Individual
- [ ] Profile persistence

### Browser Testing:
- [ ] Chrome Desktop
- [ ] Chrome Mobile (DevTools)
- [ ] Safari Mobile (if available)
- [ ] Firefox Desktop

---

## Completion Status

### Overall Progress: 0/4 Phases Complete

- [ ] Phase 1: Fix Sign-up Redirect
- [ ] Phase 2: Fix Business Account Display
- [ ] Phase 3: Verify Switch to Business
- [ ] Phase 4: All Issues Resolved

---

## Notes & Issues Encountered

### Date: [Current Date]
- Checklist created
- Starting implementation

---

## Final Verification

Before marking as complete:
- [ ] All redirect issues resolved
- [ ] Business accounts display correctly in all views
- [ ] Profile switching works reliably
- [ ] No console errors
- [ ] All test cases pass
- [ ] User experience is smooth and intuitive
