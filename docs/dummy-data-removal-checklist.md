# Dummy Data Removal Checklist

## Overview
This document tracks the removal of all hardcoded/dummy data and Unsplash stock images from the Cedar Elevators codebase, replacing them with real-time database-driven data.

---

## Phase 1: API Endpoints & Data Layer

### ✅ Existing APIs (Verify)
- [ ] `/src/lib/data` - Check listProducts function
- [ ] `/src/lib/data` - Check listCategories function
- [ ] Check if elevator types API exists
- [ ] Check if applications API exists

### 🔧 Create/Modify APIs
- [ ] Ensure categories API returns complete data with images
- [ ] Ensure elevator types API exists and returns data
- [ ] Ensure applications API exists and returns data
- [ ] Add fallback image logic in API responses

---

## Phase 2: Mega Menu - Hardcoded Categories

### Files to Update:
- [x] `/src/modules/layout/components/desktop/navbar/components/mega-menu/categories-data.ts`
  - **Completed**: Removed hardcoded array, kept only types and icon/color mappings
  - **Images**: All placeholder images removed

- [x] `/src/modules/layout/components/desktop/navbar/components/mega-menu/mega-menu-panel.tsx`
  - **Completed**: Now receives categories as props from parent
  - **Images**: Fallback image logic implemented

- [x] `/src/modules/layout/components/desktop/navbar/components/mega-menu/category-content.tsx`
  - **Completed**: Now handles dynamic data from database
  - **Images**: Uses fallback `/images/image.png` when no image available

- [x] `/src/modules/layout/components/desktop/navbar/components/mega-menu/category-sidebar.tsx`
  - **Completed**: Now handles dynamic data correctly

- [x] `/src/modules/layout/components/desktop/navbar/components/mega-menu/index.tsx`
  - **Completed**: Fetches categories from database, conditionally renders
  - **Conditional**: Returns null if no categories exist

### Hardcoded Data to Remove:
```typescript
// categories-data.ts - REMOVE THIS ENTIRE FILE OR CONVERT TO TYPES ONLY
export const elevatorCategories: CategoryData[] = [
  { id: "control-panels", subcategories: [...] },
  { id: "door-operators", subcategories: [...] },
  // ... 10 more categories
]
```

### Images to Replace:
- [x] `/api/placeholder/120/80` → Removed (now uses database images or fallback)
- [x] `https://picsum.photos/200/200?random=*` → Removed (now uses database images or fallback)

---

## Phase 3: Applications Section

### Files to Update:
- [x] `/src/components/store/applications-section.tsx`
  - **Status**: Already using database API with fallback images ✓
  - **Conditional**: Section hidden if no applications in database ✓

- [x] `/src/lib/config/applications.ts`
  - **Completed**: All 4 Unsplash background images replaced with `/images/image.png`
  - **Status**: APPLICATION_CONFIGS updated with fallback images

### Unsplash Images to Remove:
- [x] All 4 Unsplash URLs replaced with `/images/image.png`

---

## Phase 4: Elevator Types Section

### Files to Update:
- [x] `/src/components/store/shop-by-type-section.tsx`
  - **Status**: Already using database API with fallback images ✓
  - **Conditional**: Section hidden if no types or no products ✓

- [x] All other elevator type components
  - **Status**: Already migrated to database-driven approach ✓

### Unsplash Images:
- [x] All components using fallback `/images/image.png` when no database image available

---

## Phase 5: Mock Collections & Product Data

### Files to Update/Remove:
- [x] `/src/lib/data/mockCollections.ts`
  - **Completed**: All 10 Unsplash product thumbnail URLs replaced with `/images/image.png`
  - **Status**: Mock structure kept for compatibility until collections API is ready
  - **Images**: All fallback images implemented

### Mock Product Images to Remove (10 total):
- [x] All Unsplash URLs replaced with `/images/image.png`

---

## Phase 6: Catalog & Category Variants

### Files to Update:
- [x] `/src/lib/config/catalog-variants.ts`
  - **Completed**: All hardcoded Unsplash hero images replaced with `/images/image.png`
  - **Status**: Fallback metadata functions updated with placeholder images

### Hardcoded Hero Images to Remove:
- [x] All 8 Unsplash URLs replaced with `/images/image.png`

---

## Phase 7: Catalog Banner & Related Components

### Files to Check:
- [ ] `/src/modules/catalog/components/catalog-banner.tsx`
- [ ] `/src/modules/catalog/templates/catalog-template.tsx`
- [ ] `/src/modules/catalog/templates/mobile/categories-tab-template.tsx`
- [ ] `/src/modules/catalog/templates/mobile/products-tab-template.tsx`

**Action**: Search for any Unsplash URLs and replace

---

## Phase 8: Homepage Sections

### Files to Check:
- [ ] `/src/modules/home/components/desktop/sections/TestimonialsSection.tsx`
- [ ] `/src/modules/home/components/desktop/sections/HeroSection.tsx` (Already uses local image ✓)
- [ ] `/src/modules/home/components/desktop/tab-content/categories/sections/top-applications.tsx`
- [ ] `/src/modules/home/components/mobile/sections/CustomerReviewsSection.tsx`

**Action**: Check for Unsplash images, ensure data comes from database

---

## Phase 9: Next.js Default Unsplash Images

### Check & Remove:
- [ ] Search for any Next.js placeholder images
- [ ] Check `next.config.ts` for Unsplash domain
- [ ] Remove Unsplash from allowed image domains if present
- [ ] Search entire codebase for "unsplash" string

```bash
# Command to find all Unsplash references
grep -r "unsplash" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js"
```

---

## Phase 10: Conditional Rendering Implementation

### Components to Update:
- [ ] `/src/modules/home/templates/desktop/desktop-homepage-template.tsx`
  - Add: Hide sections when no data available
  - Current: Already has some conditional rendering

- [ ] All section components:
  - [ ] ApplicationsSection - Hide if no applications
  - [ ] ShopByTypeSection - Hide if no types or no products
  - [ ] QuickCategoriesSection - Hide if no categories
  - [ ] FeaturedProductsSection - Already conditional ✓
  - [ ] TestimonialsSection - Already conditional ✓

### Pattern to Follow:
```typescript
// Example conditional rendering
{applications.length > 0 && (
  <ApplicationsSection applications={applications} />
)}

// Or return null in component
if (!data || data.length === 0) return null
```

---

## Phase 11: Fallback Image Implementation

### Strategy:
1. **Backend/API**: Return fallback image path when no image uploaded
2. **Frontend**: Use fallback in img src when thumbnail is null/empty
3. **Cloudinary**: Keep existing Cloudinary images from admin uploads

### Fallback Image Path:
- `/images/image.png` (already exists in public folder)

### Components to Update:
- [ ] ProductCard component
- [ ] CategoryCard component
- [ ] ApplicationCard component
- [ ] ElevatorTypeCard component
- [ ] Any component displaying images

### Implementation Pattern:
```typescript
const imageSrc = item.thumbnail || item.image || '/images/image.png'

// Or in img tag
<img 
  src={product.thumbnail || '/images/image.png'} 
  alt={product.title}
/>
```

---

## Testing Checklist

### After Implementation:
- [ ] Homepage loads without hardcoded data
- [ ] Mega menu shows database categories (or hidden if none)
- [ ] Applications section shows database applications (or hidden if none)
- [ ] Elevator types section shows database types (or hidden if none)
- [ ] No Unsplash images visible anywhere
- [ ] Fallback image appears when no image uploaded
- [ ] No console errors related to missing data
- [ ] No broken image links
- [ ] Mobile view works correctly
- [ ] All sections conditionally render based on data availability

### Search Commands for Verification:
```bash
# Find remaining Unsplash references
grep -r "unsplash" src/

# Find remaining picsum references
grep -r "picsum" src/

# Find placeholder images
grep -r "placeholder" src/

# Find mockCollections imports
grep -r "mockCollections" src/
```

---

## Summary of Changes

### Files to Delete/Deprecate:
1. `/src/lib/data/mockCollections.ts` - Remove mock data
2. `/src/modules/layout/components/desktop/navbar/components/mega-menu/categories-data.ts` - Remove hardcoded categories

### Files to Modify (Major Changes):
1. All mega menu components (5 files)
2. Applications section (2 files)
3. Elevator types section (5 files)
4. Catalog variants config
5. Homepage templates

### Total Unsplash URLs to Remove: ~25+
### Total Components to Update: ~20+

---

## Notes:
- ✅ = Completed
- [ ] = Pending
- 🔧 = In Progress

**Last Updated**: [To be updated during implementation]
