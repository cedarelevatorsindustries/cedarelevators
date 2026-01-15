# Routing Implementation Checklist

**Project:** Cedar Elevator Industries - B2B E-commerce Platform  
**Objective:** Refactor routing and layout architecture for strict User-Type + Device-Type logic  
**Last Updated:** 2026-01-04

---

## Phase 1: Routing Normalization ⬜

Move applications/categories/types under `/catalog` with proper redirects.

### Route Structure Changes

- [x] **1.1** Create `/catalog/applications/[handle]` route
  - Move application listing logic under catalog
  - Source products by categories (curated for application)
  
- [x] **1.2** Create `/catalog/categories/[handle]` route
  - Move from `/categories/[handle]` to new location
  - Source products by subcategories
  
- [x] **1.3** Create `/catalog/types/[handle]` route
  - Create elevator type listing pages
  - Show type-specific products + all products fallback
  
- [x] **1.4** Create `/catalog/collections/[handle]` route
  - Collection products listing page
  - Include related products section

### Redirects (SEO Safe)

- [x] **1.5** Add redirect: `/categories/[handle]` → `/catalog/categories/[handle]`
- [x] **1.6** Configure redirects in `next.config.ts`

### Clean Up Duplicate Routes

- [ ] **1.7** Remove old `/categories/[handle]` route after redirect verification
- [ ] **1.8** Ensure no duplicate catalog-like routes exist outside `/catalog`

---

## Phase 2: Layout System Split ⬜

Create device-specific layouts using Next.js route groups.

### Route Groups

- [ ] **2.1** Create `(store-desktop)` route group
  - Layout with top navbar + full footer
  - Homepage with desktop-specific logic
  
- [ ] **2.2** Create `(store-mobile)` route group
  - Layout with topbar + bottom nav + footer lite
  - Homepage with mobile-specific logic
  
- [ ] **2.3** Create `(main-shared)` route group
  - Shared routes: catalog, products, cart, wishlist, quotes, profile
  - Common layout with responsive switching

### Middleware for Device Detection

- [ ] **2.4** Create/update middleware for device detection
  - Detect device type (mobile/desktop)
  - Route to appropriate layout group
  - Handle edge cases (tablets, etc.)

### Navigation Configuration

- [ ] **2.5** Move navigation config to `lib/config/navigation.ts`
  - Centralize desktop mega menu config
  - Centralize mobile bottom nav config
  - Centralize mobile sidebar config

---

## Phase 3: Homepage Refactor ⬜

Implement role-aware, device-aware homepage behavior.

### Desktop Homepage

- [ ] **3.1** Guest user sections (in order)
  - Hero Section
  - Categories
  - Applications
  - Types
  - Why Cedar
  - Testimonials
  - About
  
- [ ] **3.2** Logged-in user tabs (Individual - 2 tabs)
  - Tab 1 (Products): Applications, Collections, Contact CTA
  - Tab 2 (Categories): Categories, Elevator Types, Special Collections
  - Personalization: Recently Viewed, Your Favorites

- [ ] **3.3** Logged-in user tabs (Business - 3 tabs)
  - Tab 1-2: Same as Individual
  - Tab 3 (Business Hub): Verification prompt, CTAs, Quote history, Timeline

### Mobile Homepage

- [ ] **3.4** Guest user flow (stacked, same as desktop)

- [ ] **3.5** Logged-in user unified flow (NO TABS)
  - Hero Lite
  - Applications
  - Collections
  - Recently Viewed (login only)
  - Your Favorites (login only)

---

## Phase 4: Catalog Source Logic ⬜

Correct the data sourcing for each catalog variant.

### Source Strategy Implementation

- [ ] **4.1** Application listing → Source by Categories
  - Banner (title + description)
  - Horizontal curated categories for that application
  - Products pulled via those categories
  
- [ ] **4.2** Category listing → Source by Subcategories
  - Banner
  - Horizontal subcategories
  - Products pulled via subcategories
  - NO parent categories shown
  
- [ ] **4.3** Type listing → Direct products
  - Banner (title + description)
  - All products of that type
  - "All products" fallback
  
- [ ] **4.4** Collection listing
  - Homepage shows only 5 products
  - "View All" → full collection page with related products

### Centralize Catalog Service

- [x] **4.5** Create/update `lib/services/catalog-service.ts`
  - Application source strategy
  - Category source strategy
  - Type source strategy
  - Collection source strategy

### Mobile Catalog

- [ ] **4.6** Implement Mobile Catalog with Tabs
  - Products Tab (same as desktop catalog)
  - Categories Tab (same as desktop homepage categories)
  
- [ ] **4.7** Quick-commerce style sidebar for Application/Category navigation
  - Slide-in drawer
  - No page reload until selection

---

## Phase 5: Route Constants & Configuration ⬜

Centralize route definitions and cleanup.

### Route Constants

- [x] **5.1** Create/update `lib/constants/routes.ts`
  - All store routes
  - All catalog routes
  - All profile routes
  - All quote routes

### Navigation Config

- [x] **5.2** Verify `lib/config/navigation.ts` completeness
  - Desktop mega menu config
  - Mobile bottom nav
  - Mobile sidebar menu structure

---

## Phase 6: Cleanup & Optimization ⬜

Remove dead code and consolidate data fetching.

### Component Cleanup

- [ ] **6.1** Remove catalog logic scattered in homepage components
- [ ] **6.2** Remove business hub duplication outside homepage
- [ ] **6.3** Remove application/category logic from multiple modules

### Data Fetching Optimization

- [ ] **6.4** Remove duplicated data fetches
- [ ] **6.5** Consolidate to catalog-service.ts patterns

### Keep Existing Modules

- [ ] **6.6** Verify Profile module unchanged (except linking)
- [ ] **6.7** Verify Quote module unchanged (except linking)
- [ ] **6.8** Verify Cart & Wishlist logic unchanged

---

## Verification Checklist ⬜

### Build & Lint

- [ ] Production build passes without errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings

### Route Testing

- [ ] `/` - Homepage loads correctly for guest/logged-in
- [ ] `/catalog` - Master catalog works
- [ ] `/catalog/applications/[handle]` - Application listing works
- [ ] `/catalog/categories/[handle]` - Category listing works
- [ ] `/catalog/types/[handle]` - Type listing works
- [ ] `/catalog/collections/[handle]` - Collection listing works
- [ ] `/products/[handle]` - PDP works
- [ ] `/cart` - Cart works
- [ ] `/wishlist` - Wishlist works
- [ ] `/request-quote` - Quote request works
- [ ] `/quotes` - Quotes list works
- [ ] `/profile` - Profile works

### Redirect Testing

- [ ] Old `/categories/[handle]` redirects to `/catalog/categories/[handle]`

### Mobile Testing

- [ ] Bottom navigation works
- [ ] Mobile sidebar menu works
- [ ] Mobile catalog tabs work
- [ ] Mobile homepage unified flow works

### Desktop Testing

- [ ] Mega menu navigation works
- [ ] Desktop homepage tabs work (logged-in)
- [ ] Business Hub tab visible for business users only

---

## Progress Summary

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Routing Normalization | ✅ In Progress | 6/8 |
| Phase 2: Layout System Split | ⬜ Not Started | 0/5 |
| Phase 3: Homepage Refactor | ⬜ Not Started | 0/5 |
| Phase 4: Catalog Source Logic | ✅ In Progress | 1/7 |
| Phase 5: Route Constants | ✅ Complete | 2/2 |
| Phase 6: Cleanup | ⬜ Not Started | 0/8 |
| Verification | ⬜ Not Started | 0/17 |

**Overall Progress:** 9/52 items completed (17%)

---

*This checklist will be updated after each phase is completed.*
