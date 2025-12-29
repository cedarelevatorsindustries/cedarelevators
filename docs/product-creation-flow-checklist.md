# Product Creation Flow Redesign - Implementation Checklist

## 🎯 DESIGN PRINCIPLE
Admin mental flow:
1. "What is this product?" → Basic Information
2. "How does it look?" → Media
3. "What are its details?" → Product Details & Attributes
4. "What are its options?" → Variants (Optional)
5. "Where does it belong?" → Classification
6. "How is it sold?" → Pricing & Inventory
7. "How does it appear in search?" → SEO & Metadata
8. "Is it ready?" → Review & Publish

---

## 📋 8-STEP FLOW STRUCTURE

### ✅ STEP 1: BASIC INFORMATION
**Purpose**: Define product identity

**Fields**:
- [x] Product Title (REQUIRED)
- [x] SKU (auto-generated, editable)
- [x] Short Description (1-2 lines, shown near title)
- [x] Status: Draft / Active / Archived

**PDP Mapping**:
- title
- sku
- short_description (subtitle)

**Component**: `basic-information-tab.tsx`

---

### ✅ STEP 2: MEDIA (IMAGES & THUMBNAILS)
**Purpose**: Visual recognition

**Fields**:
- [x] Product Images (multiple)
- [x] Drag & reorder
- [x] Set Primary Image
- [x] Thumbnail auto-generated (override optional)

**UX Rules**:
- First image = default thumbnail
- Warn (not block) if no image

**PDP Mapping**:
- images
- thumbnails

**Component**: `media-tab.tsx` (already exists)

---

### ✅ STEP 3: PRODUCT DETAILS & ATTRIBUTES
**Purpose**: Technical & descriptive content

**Sections**:

#### A. Brief Description (REQUIRED)
- Rich text / plain text
- Used in PDP "Overview" section

#### B. Attributes (KEY–VALUE)
- Voltage
- Load Capacity
- Speed
- Controller type
- Door type
- Any custom attribute
- Admin can add/remove rows

**PDP Mapping**:
- brief_description (full description)
- attributes (key-value specifications)

**Component**: `product-details-tab.tsx` (NEW)

---

### ✅ STEP 4: VARIANTS (OPTIONAL)
**Purpose**: Only if technical differences exist

**Variant Use Cases**:
- Capacity variants
- Model variants
- Voltage variants

**Variant Fields**:
- Variant name
- Variant SKU
- Variant attributes
- Price override (optional)
- Stock override (optional)

**Guardrail Message**:
⚠️ Use variants only for functional differences.
Cosmetic differences should be attributes.

**PDP Mapping**:
- variants

**Component**: `variants-tab.tsx` (already exists)

---

### ✅ STEP 5: CLASSIFICATION (CATALOG PLACEMENT)
**Purpose**: Define where product appears in storefront

**Fields (REQUIRED)**:
- Application (dropdown)
- Category (filtered)
- Subcategory (filtered)

**Optional**:
- Elevator Types (multi-select)
- Collections (multi-select)

**Rules**:
- If missing → product stays hidden
- No product selection here — only assignment

**Component**: `classification-tab.tsx` (rename from organization-tab.tsx)

---

### ✅ STEP 6: PRICING & INVENTORY
**Purpose**: Internal reference & fulfillment safety

#### Pricing
- Base Price (admin reference)
- Bulk pricing available (toggle)
- Bulk price note (optional)
- Compare at Price (MRP)
- Cost per item

#### Inventory
- Track inventory (toggle)
- Stock quantity
- Low stock threshold
- Allow backorders

**Important Note (shown inline)**:
💡 Pricing here is for internal reference.
Final selling price is set via Quotes.

**Component**: `pricing-inventory-tab.tsx` (NEW - merge pricing-tab + inventory-tab)

---

### ✅ STEP 7: SEO & METADATA
**Purpose**: Search & sharing control

**Fields**:
- Meta Title
- Meta Description
- URL Slug (editable)
- Index / No-index toggle

**Optional (advanced)**:
- OG Title
- OG Description
- OG Image

**Why here?**:
SEO is final polish - admin thinks of SEO after product is ready

**Component**: `seo-tab.tsx` (already exists)

---

### ✅ STEP 8: REVIEW & PUBLISH
**Purpose**: Prevent mistakes

**Summary Sections**:
1. Product identity (title, SKU, short description)
2. Images preview (thumbnail + count)
3. Attributes & variants preview
4. Classification (application, category)
5. Pricing & inventory summary
6. SEO preview (Google snippet style)

**Validation Rules**:
- ✅ Category assigned
- ✅ Required attributes present
- ✅ At least one image
- ✅ Status = Active (for publish)

**Actions**:
- Save as Draft
- Publish
- Publish & Create Another

**Component**: `review-publish-tab.tsx` (NEW)

---

## 🗺️ PDP ↔ ADMIN FIELD MAPPING

| PDP Element | Admin Step | Field Name |
|-------------|-----------|------------|
| Title | Step 1 | Product Title |
| SKU | Step 1 | SKU |
| Short description | Step 1 | Short Description |
| Images | Step 2 | Product Images |
| Thumbnails | Step 2 | Auto-generated |
| Brief description | Step 3 | Brief Description |
| Attributes | Step 3 | Attributes (key-value) |
| Variants | Step 4 | Variants |
| Product placement | Step 5 | Application/Category/Subcategory |
| Price | Step 6 | Base Price |
| Stock | Step 6 | Stock Quantity |
| Meta Title | Step 7 | Meta Title |
| URL Slug | Step 7 | URL Slug |

---

## 🔄 MIGRATION PLAN

### Components to Create:
1. ✅ `basic-information-tab.tsx` (refactor from general-tab.tsx)
2. ✅ `product-details-tab.tsx` (NEW - attributes section)
3. ✅ `classification-tab.tsx` (rename organization-tab.tsx)
4. ✅ `pricing-inventory-tab.tsx` (merge pricing + inventory)
5. ✅ `review-publish-tab.tsx` (NEW - validation summary)

### Components to Modify:
1. ✅ `product-tabs.tsx` - Update tab order and names
2. ✅ `/app/src/app/admin/products/create/page.tsx` - Update flow logic

### Components to Keep As-Is:
1. ✅ `media-tab.tsx`
2. ✅ `variants-tab.tsx`
3. ✅ `seo-tab.tsx`
4. ✅ `product-preview.tsx`

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Component Creation
- [ ] Create `basic-information-tab.tsx`
- [ ] Create `product-details-tab.tsx`
- [ ] Create `classification-tab.tsx`
- [ ] Create `pricing-inventory-tab.tsx`
- [ ] Create `review-publish-tab.tsx`

### Phase 2: Update Main Page
- [ ] Update `product-tabs.tsx` with new tab structure
- [ ] Update `create/page.tsx` with new flow order
- [ ] Update form data state structure
- [ ] Update validation logic

### Phase 3: Integration
- [ ] Test full flow end-to-end
- [ ] Verify data persistence
- [ ] Check PDP mapping accuracy
- [ ] Validate required fields
- [ ] Test error handling

### Phase 4: Polish
- [ ] Add inline help text
- [ ] Add validation messages
- [ ] Add progress indicator
- [ ] Add autosave (optional)

---

## 🔒 LOCKED DESIGN RULES

1. ✅ Product creation is linear (1→2→3→4→5→6→7→8)
2. ✅ Classification is NOT step 1 (comes after product is defined)
3. ✅ SEO is never early (step 7, after all content is ready)
4. ✅ Variants are optional and guarded with warning
5. ✅ Review is mandatory before publish (prevent errors)
6. ✅ No jumping between conceptually different steps

---

## 📝 NOTES

- This flow matches Shopify Plus, Salesforce CPQ, and SAP product onboarding patterns
- Linear flow reduces cognitive load
- Classification after product definition feels natural
- SEO as final polish aligns with content-first approach
- Review step catches errors before publish

---

**Version**: 1.0  
**Created**: Based on Product Creation UX Redesign Requirements  
**Last Updated**: January 2025
