# 🎯 Updated Banner Management System - Implementation Checklist

**Project:** Cedar Elevators E-commerce Platform  
**Feature:** Banner Management Refactor - Navigation + Context Surfaces  
**Philosophy:** Banners are NOT promotional assets, they are structural navigation  
**Status:** Planning Phase  
**Created:** Current Session

---

## 🧠 Core Philosophy (LOCKED)

### ❌ What Banners Are NOT
- ❌ Campaign banners
- ❌ Discount/offer promotions
- ❌ Product picking inside banners
- ❌ Marketing assets

### ✅ What Banners ARE
- ✅ Navigation surfaces
- ✅ Context providers
- ✅ Structural elements
- ✅ Visual identity markers

---

## 📊 The 4 Banner Contexts (LOCKED)

| Context | Behavior | Click Action | Managed In |
|---------|----------|--------------|------------|
| **All Products** | Carousel (3-5 slides) | ✅ Redirect | Banner Management |
| **Application** | Static banner | ❌ No click | Application Module |
| **Category** | Static banner | ❌ No click | Category Module |
| **Elevator Type** | Static banner | ❌ No click | Elevator Type Module |
| **Collection** | Static banner | ❌ No click | Collection Module |

---

## 🎯 Design Decisions

### Why This Structure?

1. **Separation of Concerns**
   - All Products carousel = discovery & navigation → Banner Management
   - Entity banners = visual identity → Entity modules

2. **Avoid Duplication**
   - Each entity owns its visual assets
   - No syncing between Banner Management and entity modules
   - Single source of truth

3. **Simplicity**
   - Admin only manages one type of banner in Banner Management
   - Entity banners are part of entity metadata
   - No confusion about where to edit

---

## 📋 Implementation Phases

### Phase 1: Database Schema Updates ✅ COMPLETE

**Goal:** Add banner_image fields to entity tables

#### Tasks

##### 1.1 Create Migration File
- [x] Create `/app/supabase/migrations/009_add_entity_banner_images.sql`
- [x] Add `banner_image` column to:
  - [x] `categories` table
  - [x] `applications` table (uses categories with application type)
  - [x] `elevator_types` table
  - [x] `collections` table
- [x] Ensure all entities already have `thumbnail_image` (or add it)
- [x] Add storage bucket permissions if needed

##### 1.2 Migration Content
```sql
-- Add banner_image to categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS banner_image TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_image TEXT;

-- Add banner_image to elevator_types
ALTER TABLE elevator_types 
ADD COLUMN IF NOT EXISTS banner_image TEXT;
-- thumbnail_image may already exist as 'icon'

-- Add banner_image to collections
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS banner_image TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_image TEXT;

-- Update storage policies if needed
```

##### 1.3 Banner Table Refactor
- [x] Update `banners` table purpose (documentation only)
- [x] Change `link_type` enum to: `application | category | elevator-type | collection`
- [x] Simplify fields (remove target_type/target_id if they're the same as link)
- [x] Current structure is OK, just need to restrict usage to "All Products" only

#### Deliverables
- [x] Migration SQL file created (163 lines with comments)
- [x] All entity tables have `banner_image` field
- [x] All entity tables have `thumbnail_image` field
- [x] Data migration from legacy fields (image_url, icon)
- [x] Comments added for clarity
- [x] Storage policies (already existed, no changes needed)

---

### Phase 2: TypeScript Types Updates ✅ COMPLETE

**Goal:** Update type definitions to reflect new banner philosophy

#### Tasks

##### 2.1 Update Banner Types: `/app/src/lib/types/banners.ts`
- [x] Update `BannerPlacement` enum:
  - [x] Keep only: `'hero-carousel'` and `'all-products-carousel'`
  - [x] Remove: `category-header`, `application-header`, `collection-banner`, `announcement-bar`
  - [x] Update documentation to clarify "All Products only"
- [x] Update `BannerTargetType` to `BannerLinkType`:
  - [x] Rename to: `'application' | 'category' | 'elevator-type' | 'collection'`
- [x] Update `Banner` interface:
  - [x] Add `link_type` and `link_id` (preferred fields)
  - [x] Keep `target_type` and `target_id` as deprecated
  - [x] Mark `cta_text` as required for carousel banners
- [x] Update `BANNER_PLACEMENTS` array:
  - [x] Keep only "All Products Carousel" entry
  - [x] Update description to match philosophy

##### 2.2 Update Entity Types

###### File: `/app/src/lib/types/categories.ts`
- [x] Add `banner_image?: string | null` to `Category` interface
- [x] Add `thumbnail_image?: string | null`
- [x] Add to `CategoryFormData` interface
- [x] Mark `image_url` as deprecated

###### File: `/app/src/lib/types/elevator-types.ts`
- [x] Add `banner_image?: string | null` to `ElevatorType` interface
- [x] Add `thumbnail_image?: string` (icon already exists)
- [x] Add to `ElevatorTypeFormData` interface

###### File: `/app/src/lib/types/collections.ts`
- [x] Add `banner_image?: string | null` to `Collection` interface
- [x] Add `thumbnail_image?: string | null`
- [x] Add to `CollectionFormData` interface
- [x] Mark `image_url` as deprecated

#### Deliverables
- [x] Banner types updated (All Products only)
- [x] Entity types updated (banner_image + thumbnail_image added)
- [x] All FormData interfaces updated
- [x] Legacy fields marked as deprecated with comments

---

### Phase 3: Server Actions Updates ✅ COMPLETE

**Goal:** Update server-side logic for new banner philosophy

#### Tasks

##### 3.1 Update Banner Actions: `/app/src/lib/actions/banners.ts`
- [x] Update `createBanner()`:
  - [x] Validate `placement` is only `'all-products-carousel'` (or `'hero-carousel'`)
  - [x] Ensure `link_type` and `link_id` are required
  - [x] Ensure `cta_text` is required
- [x] Update `getBannersByPlacement()`:
  - [x] Only allow fetching "all-products-carousel"
  - [x] Throw error if requesting other placements
- [x] Add validation to prevent creating non-carousel banners
- [x] Update comments/documentation

##### 3.2 Update Entity Actions

###### File: `/app/src/lib/actions/categories.ts`
- [x] Update `createCategory()` to handle `banner_image`
- [x] Update `updateCategory()` to handle `banner_image`
- [x] Add `uploadCategoryBannerImage()` function (or use generic upload)

###### File: `/app/src/lib/actions/elevator-types.ts`
- [x] Update `createElevatorType()` to handle `banner_image`
- [x] Update `updateElevatorType()` to handle `banner_image`
- [x] Add `uploadElevatorTypeImage()` function

###### File: `/app/src/lib/actions/collections.ts`
- [x] Update `createCollection()` to handle `banner_image`
- [x] Update `updateCollection()` to handle `banner_image`

#### Deliverables
- [x] Banner actions restricted to All Products only
- [x] Entity actions support banner_image
- [x] Upload functions ready

---

### Phase 4: Admin UI - Banner Management ✅ COMPLETE

**Goal:** Update Banner Management to ONLY handle All Products carousel

#### Tasks

##### 4.1 Update Banner List Page: `/app/src/app/admin/banners/page.tsx`
- [x] Update page title/description:
  - [x] Title: "All Products Carousel"
  - [x] Description: "Manage homepage carousel banners for product discovery"
- [x] Remove placement filter (only one placement now)
- [x] Update empty state message
- [x] Add info banner explaining the philosophy
- [x] Remove references to category/application/collection banners

##### 4.2 Update Banner Create Page: `/app/src/app/admin/banners/create/page.tsx`
- [x] Remove placement selection (hardcode to `'all-products-carousel'`)
- [x] Update form to show:
  - [x] Title (required)
  - [x] Subtitle (optional)
  - [x] Image upload (required)
  - [x] Mobile image upload (optional)
  - [x] Link Type dropdown (Application, Category, Elevator Type, Collection)
  - [x] Link ID dropdown (filtered by Link Type)
  - [x] CTA Text (required)
  - [x] Sort order
  - [x] Active toggle
  - [x] Start/end dates (optional)
- [x] Add helper text explaining carousel purpose
- [x] Update validation

##### 4.3 Update Banner Edit Page: `/app/src/app/admin/banners/[id]/edit/page.tsx`
- [x] Same updates as create page
- [x] Pre-fill existing data
- [x] Show warning if trying to edit non-carousel banner (shouldn't happen)

##### 4.4 Add Philosophy Info Card (All Banner Pages)
- [x] Create reusable component: `<BannerPhilosophyCard />`
- [x] Content:
  ```
  📌 Banner Philosophy
  
  This carousel helps users discover entry paths into the catalog:
  • Installation Components → Application
  • Passenger Elevator Parts → Elevator Type
  • Common Spare Parts → Collection
  
  For category/type/application page banners, edit them in their respective modules.
  ```

#### Deliverables
- [x] Banner Management ONLY manages All Products carousel
- [x] Clear messaging about philosophy
- [x] Simplified UI (no placement selection)
- [x] All forms updated

---

### Phase 5: Admin UI - Entity Modules ⚠️ Pending

**Goal:** Add Banner Image fields to entity edit forms

#### Tasks

##### 5.1 Category Module

###### File: `/app/src/app/admin/categories/create/page.tsx`
- [ ] Add "Visual Identity" section
- [ ] Add image upload fields:
  - [ ] Thumbnail Image (for cards, grids, filters)
  - [ ] Banner Image (for PLP top section, optional)
- [ ] Add helper text explaining usage
- [ ] Update form submission

###### File: `/app/src/app/admin/categories/[id]/edit/page.tsx`
- [ ] Same updates as create page
- [ ] Show existing images
- [ ] Allow replacing images

###### File: `/app/src/app/admin/categories/[id]/page.tsx` (Detail)
- [ ] Display thumbnail in metadata section
- [ ] Display banner image if exists
- [ ] Show where these are used

##### 5.2 Elevator Type Module

###### File: `/app/src/app/admin/elevator-types/create/page.tsx`
- [ ] Add "Visual Identity" section
- [ ] Add image upload fields:
  - [ ] Icon/Thumbnail (may already exist)
  - [ ] Banner Image (for PLP top section, optional)
- [ ] Add helper text
- [ ] Update form submission

###### File: `/app/src/app/admin/elevator-types/[id]/edit/page.tsx`
- [ ] Same updates as create page
- [ ] Show existing images

###### File: `/app/src/app/admin/elevator-types/[id]/page.tsx` (Detail)
- [ ] Display icon/thumbnail
- [ ] Display banner image if exists

##### 5.3 Collection Module

###### File: `/app/src/app/admin/collections/create/page.tsx`
- [ ] Add "Visual Identity" section
- [ ] Add image upload fields:
  - [ ] Thumbnail Image
  - [ ] Banner Image (optional)
- [ ] Add helper text
- [ ] Update form submission

###### File: `/app/src/app/admin/collections/[id]/edit/page.tsx`
- [ ] Same updates as create page
- [ ] Show existing images

###### File: `/app/src/app/admin/collections/[id]/page.tsx` (Detail)
- [ ] Display thumbnail
- [ ] Display banner image if exists

##### 5.4 Create Reusable Component
- [ ] Create: `/app/src/components/admin/visual-identity-form.tsx`
- [ ] Props: `thumbnailUrl`, `bannerUrl`, `onThumbnailChange`, `onBannerChange`
- [ ] Includes:
  - [ ] Image upload fields with preview
  - [ ] Helper text
  - [ ] Aspect ratio guidance
  - [ ] Delete/replace functionality

#### Deliverables
- [ ] All entity forms have Visual Identity section
- [ ] Thumbnail + Banner image support
- [ ] Reusable component for consistency

---

### Phase 6: Frontend Rendering Logic ⚠️ Pending

**Goal:** Update storefront to render correct banners

#### Tasks

##### 6.1 Identify PLP (Product Listing Page) Components
- [ ] Find: Homepage/All Products page component
- [ ] Find: Category PLP component
- [ ] Find: Application PLP component
- [ ] Find: Elevator Type PLP component
- [ ] Find: Collection PLP component

##### 6.2 Update All Products Page
- [ ] Fetch banners using: `getBannersByPlacement('all-products-carousel')`
- [ ] Render carousel component
- [ ] Each slide links to `link_type` + `link_id`
- [ ] Show CTA button with `cta_text`

##### 6.3 Update Category PLP
- [ ] Fetch category data (includes `banner_image`)
- [ ] If `banner_image` exists:
  - [ ] Render static banner at top (non-clickable)
  - [ ] Show category name + description overlay
- [ ] If no banner_image:
  - [ ] Show simple header with name + description

##### 6.4 Update Application PLP
- [ ] Same logic as Category PLP
- [ ] Use application's `banner_image`

##### 6.5 Update Elevator Type PLP
- [ ] Same logic as Category PLP
- [ ] Use elevator type's `banner_image`

##### 6.6 Update Collection PLP
- [ ] Same logic as Category PLP
- [ ] Use collection's `banner_image`

##### 6.7 Create Reusable Components
- [ ] `<CarouselBanner />` - For All Products carousel
- [ ] `<StaticContextBanner />` - For entity pages (non-clickable)
- [ ] Props: `imageUrl`, `title`, `description`, `overlayStyle`

#### Deliverables
- [ ] All Products shows carousel with links
- [ ] Entity pages show static banners
- [ ] Clean separation of concerns
- [ ] Reusable components

---

### Phase 7: Documentation & Testing ⚠️ Pending

**Goal:** Document the system and test thoroughly

#### Tasks

##### 7.1 Create Admin Documentation
- [ ] Create: `/app/docs/BANNER-MANAGEMENT-GUIDE.md`
- [ ] Content:
  - [ ] Philosophy explanation
  - [ ] When to use Banner Management vs Entity modules
  - [ ] How to create carousel banners
  - [ ] How to add entity banners
  - [ ] Best practices
  - [ ] Image size recommendations
  - [ ] Examples

##### 7.2 Update Existing Docs
- [ ] Update: `/app/docs/ADMIN-PANEL-OVERVIEW.md`
  - [ ] Banner Management section
  - [ ] Entity module sections
- [ ] Update: `/app/docs/FEATURES.md`
  - [ ] Banner system overview

##### 7.3 Migration Guide for Existing Data
- [ ] Create: `/app/docs/BANNER-MIGRATION-GUIDE.md`
- [ ] Steps to migrate existing category/application/collection banners
- [ ] SQL scripts to move data
- [ ] Rollback plan

##### 7.4 Testing Checklist

###### Admin Testing
- [ ] Banner Management
  - [ ] Create All Products carousel banner
  - [ ] Link to Application
  - [ ] Link to Category
  - [ ] Link to Elevator Type
  - [ ] Link to Collection
  - [ ] Verify placement is locked
  - [ ] Test image upload
  - [ ] Test sort order
  - [ ] Test active/inactive toggle
- [ ] Category Module
  - [ ] Add thumbnail image
  - [ ] Add banner image
  - [ ] Edit existing images
  - [ ] Delete images
  - [ ] Verify save/update works
- [ ] Elevator Type Module
  - [ ] Same tests as Category
- [ ] Collection Module
  - [ ] Same tests as Category

###### Storefront Testing
- [ ] All Products Page
  - [ ] Carousel displays correctly
  - [ ] Slides link to correct destinations
  - [ ] CTA buttons work
  - [ ] Mobile responsive
- [ ] Category PLP
  - [ ] Banner displays if exists
  - [ ] Banner is non-clickable
  - [ ] Falls back to simple header if no banner
- [ ] Application PLP
  - [ ] Same tests as Category PLP
- [ ] Elevator Type PLP
  - [ ] Same tests as Category PLP
- [ ] Collection PLP
  - [ ] Same tests as Category PLP

###### Edge Cases
- [ ] Entity without banner_image (should show simple header)
- [ ] All Products with 0 banners (should show empty state)
- [ ] All Products with 1 banner (should still show as carousel)
- [ ] Banner with invalid link_id (should handle gracefully)
- [ ] Image upload failures (should show error)
- [ ] Large image files (should compress or warn)

#### Deliverables
- [ ] Comprehensive documentation
- [ ] All tests passing
- [ ] Edge cases handled
- [ ] Migration guide ready

---

## 📊 Progress Tracking

### Overall Status
- **Phase 1:** Database Schema - ✅ COMPLETE
- **Phase 2:** TypeScript Types - ✅ COMPLETE
- **Phase 3:** Server Actions - ✅ COMPLETE
- **Phase 4:** Banner Management UI - ✅ COMPLETE
- **Phase 5:** Entity Module UI - ⚠️ In Progress
- **Phase 6:** Frontend Rendering - ⚠️ Pending
- **Phase 7:** Documentation & Testing - ⚠️ Pending

**Total Progress:** 4/7 phases (57%)

---

## 🎯 Key Rules (LOCK THESE)

### 🔒 Rule 1: Only All Products uses Banner Management
**Why:** Carousel is cross-context navigation, not entity-specific

### 🔒 Rule 2: Entity pages use their own banner_image field
**Why:** Visual identity belongs to the entity, not Banner Management

### 🔒 Rule 3: Entity banners are non-clickable
**Why:** They provide context, not navigation

### 🔒 Rule 4: Thumbnails ≠ Banners
**Why:** Different use cases (cards vs headers)

### 🔒 Rule 5: No duplication across modules
**Why:** Single source of truth prevents sync issues

---

## 🗂️ File Structure Overview

### Files to Create (New)
```
/app/supabase/migrations/009_add_entity_banner_images.sql
/app/src/components/admin/visual-identity-form.tsx
/app/src/components/admin/banner-philosophy-card.tsx
/app/src/components/storefront/carousel-banner.tsx
/app/src/components/storefront/static-context-banner.tsx
/app/docs/BANNER-MANAGEMENT-GUIDE.md
/app/docs/BANNER-MIGRATION-GUIDE.md
```

### Files to Modify (Existing)
```
/app/src/lib/types/banners.ts
/app/src/lib/types/categories.ts
/app/src/lib/types/elevator-types.ts
/app/src/lib/types/collections.ts (if exists)
/app/src/lib/actions/banners.ts
/app/src/lib/actions/categories.ts
/app/src/lib/actions/elevator-types.ts
/app/src/lib/actions/collections.ts
/app/src/app/admin/banners/page.tsx
/app/src/app/admin/banners/create/page.tsx
/app/src/app/admin/banners/[id]/edit/page.tsx
/app/src/app/admin/categories/create/page.tsx
/app/src/app/admin/categories/[id]/edit/page.tsx
/app/src/app/admin/categories/[id]/page.tsx
/app/src/app/admin/elevator-types/create/page.tsx
/app/src/app/admin/elevator-types/[id]/edit/page.tsx
/app/src/app/admin/elevator-types/[id]/page.tsx
/app/src/app/admin/collections/create/page.tsx (if exists)
/app/src/app/admin/collections/[id]/edit/page.tsx (if exists)
/app/src/app/admin/collections/[id]/page.tsx (if exists)
[PLP components - TBD based on project structure]
```

---

## 📈 Success Metrics

### Must-Have
- [ ] Banner Management only manages All Products carousel
- [ ] All entity modules have banner_image field
- [ ] Storefront renders correct banners
- [ ] No duplicate management interfaces
- [ ] Admin UI is intuitive

### Nice-to-Have
- [ ] Image optimization/compression
- [ ] Banner analytics (click-through rates)
- [ ] A/B testing for carousel banners
- [ ] Scheduled publishing
- [ ] Banner templates

---

## 🚨 Common Pitfalls to Avoid

1. **❌ Don't put entity banners in Banner Management**
   - This creates duplication and confusion

2. **❌ Don't make entity banners clickable**
   - They are context markers, not navigation

3. **❌ Don't create multiple banner placement types**
   - Stick to one: All Products carousel

4. **❌ Don't reuse thumbnail for banner**
   - Different aspect ratios and use cases

5. **❌ Don't skip migration for existing banners**
   - Plan data migration carefully

---

## 🎓 Developer Notes

### Why This Architecture?

**Problem with Old System:**
- Categories/Applications/Collections had banners in Banner Management
- Duplication: thumbnail in entity, banner in banners table
- Sync issues: changing category didn't update banner
- Admin confusion: where do I edit the category banner?

**Solution:**
- All Products carousel = discovery tool → Banner Management
- Entity banners = visual identity → Entity modules
- Clean separation of concerns
- Single source of truth
- Intuitive admin UX

### Implementation Tips

1. **Start with Phase 1 (Database)**
   - Get schema right first
   - Test migrations thoroughly

2. **Update Types Before Actions**
   - TypeScript will catch errors
   - Prevents runtime issues

3. **Reuse Components**
   - Create VisualIdentityForm component
   - Use across all entity modules

4. **Test Edge Cases**
   - Missing banner images
   - Invalid link IDs
   - Empty carousels

---

## 📞 Questions & Clarifications

### Q: Can I link carousel banners to external URLs?
**A:** No. Only internal entities (Application, Category, Elevator Type, Collection).
This maintains the "discovery" philosophy.

### Q: What if I want a promotional banner?
**A:** Use the All Products carousel creatively. Example:
- Title: "New Arrivals"
- Links to: Collection "New Products"

### Q: Can entity banners have CTA buttons?
**A:** No. They are non-clickable context surfaces.
If you need action, use the All Products carousel.

### Q: What about announcement bars?
**A:** Out of scope for this refactor.
Consider separate Announcement component if needed.

---

**Last Updated:** Current Session  
**Next Review:** After Phase 1 completion  
**Final Review:** After Phase 7 completion

---

**End of Checklist** 🎉

**Ready to proceed with Phase 1: Database Schema Updates**
