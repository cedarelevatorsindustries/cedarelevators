# Cedar Elevators - Issues Analysis

**Prepared for:** Teammate Review  
**Date:** January 3, 2026

---

## Reference Image from Issue #6

![Quote Page Mobile Demo Data](file:///C:/Users/OC/.gemini/antigravity/brain/93d15503-e256-4e1f-ba00-0dd4c715aea6/uploaded_image_1767435176463.png)

---

## Summary of Issues

I've analyzed the codebase, database schema, and documentation. Here's my understanding of each issue:

---

## Issue #1: Mobile Guest "Find the parts you need" Section

> **Issue:** Fix the mobile guest "Find the parts you need" section same as "Shop by Category" in category tab in desktop

### Current State
- **Mobile Guest:** Uses [categories-mobile.tsx](file:///e:/My%20Programming%20Projects/cedarelevators/src/modules/home/components/mobile/sections/categories-mobile.tsx) which displays "**Find the parts you need**" heading
- **Desktop:** Has a "Shop by Category" tab inside the hero section

### Analysis
The naming is inconsistent between mobile and desktop. In the mobile guest homepage, the categories section is labeled "Find the parts you need" while desktop uses "Shop by Category". The components are:
- Mobile: `CategoriesMobile` → renders categories from database ✅
- Desktop: Uses a tabbed interface in Hero Lite with a "Categories Tab"

### What Needs to Change
Rename the heading in `categories-mobile.tsx` from "Find the parts you need" to "Shop by Category" to match desktop, OR make the visual/layout of mobile match the desktop category tab style.

---

## Issue #2: Mobile Guest - Shop by Elevator Type

> **Issue:** In guest mobile it needs to show "Shop by Elevator Type" - it contains elevator types

### Current State
- **Component Exists:** [elevator-types-mobile.tsx](file:///e:/My%20Programming%20Projects/cedarelevators/src/modules/home/components/mobile/sections/elevator-types-mobile.tsx)
- **Problem:** Uses **HARDCODED MOCK DATA** instead of fetching from database

```typescript
// Currently hardcoded in the file:
const elevatorTypes = [
    { id: "passenger-lift", name: "Passenger Lift", ... },
    { id: "hospital-lift", name: "Hospital Lift", ... },
    ...
]
```

### Database Schema
The `elevator_types` table exists with real data:
- Residential, Commercial, Industrial, Hospital (seeded in migration 008)
- Junction table `product_elevator_types` links products to elevator types

### What Needs to Change
- Modify `elevator-types-mobile.tsx` to fetch data from `elevator_types` table instead of using mock data
- The shared component `ElevatorTypesSection` is already used in the guest template but may also need database connection

---

## Issue #3: Mobile Guest - Shop by Application

> **Issue:** In guest it needs to show "Shop by Application"

### Current State
- **Desktop has it:** [applications-section.tsx](file:///e:/My%20Programming%20Projects/cedarelevators/src/components/store/applications-section.tsx) exists and is used on desktop homepage
- **Mobile guest MISSING:** [mobile-homepage-guest-template.tsx](file:///e:/My%20Programming%20Projects/cedarelevators/src/modules/home/templates/mobile/mobile-homepage-guest-template.tsx) does **NOT** include the Applications section

### Database Schema
Applications are stored in the `categories` table where `parent_id = NULL` and `application` field is set:
- Erection, Testing, Service, General (seeded in migration 008)

### What Needs to Change
Add `ApplicationsSection` component to the mobile guest homepage template

---

## Issue #4: Guest - Remove Collections

> **Issue:** In guest no needs to show collection in both mobile and desktop

### Current State
Looking at the guest templates:
- **Mobile Guest:** [mobile-homepage-guest-template.tsx](file:///e:/My%20Programming%20Projects/cedarelevators/src/modules/home/templates/mobile/mobile-homepage-guest-template.tsx) - No explicit collections section visible
- **Desktop Guest:** Need to verify if collections are shown

### Database Schema
`collections` table exists for curated product groupings (like "Trending", "New Arrivals")

### What Needs to Change
- Remove or hide any collections sections from guest views (both mobile and desktop)
- Collections should only be visible to logged-in users per the ECOMMERCE-STORE-OVERVIEW.md documentation

---

## Issue #5: PDP and Product Display Issues

> **Issue:** PDP won't work and in applications collection and category types won't show any products

### Current State
PDP (Product Detail Page) files exist:
- [desktop-pdp-page.tsx](file:///e:/My%20Programming%20Projects/cedarelevators/src/modules/products/templates/desktop-pdp-page.tsx)
- [mobile-pdp-page.tsx](file:///e:/My%20Programming%20Projects/cedarelevators/src/modules/products/templates/mobile-pdp-page.tsx)

### Possible Causes
1. **Products not linked:** The `products` table has `application_id`, `category_id`, `subcategory_id` columns but products may not have these relationships set
2. **Query issues:** The functions `get_category_products()` and `get_elevator_type_products()` in the database may not be called correctly
3. **Product status:** Products may not be in `active` status

### Investigation Needed
- Check if products have `category_id`, `application_id` set
- Check if `product_elevator_types` junction table has entries
- Verify product `status = 'active'`

---

## Issue #6: Quote Page Shows Demo Data in Mobile

> **Issue:** Still in quote show demo data in mobile (refer to the image attached)

### Current State
The image shows [individual-quote-template.tsx](file:///e:/My%20Programming%20Projects/cedarelevators/src/modules/quote/templates/individual-quote-template.tsx) which has **COMPLETELY HARDCODED DATA**:

```typescript
// Lines 21-40: Hardcoded stats
const individualStats = [
    { label: "Total Spent", value: "₹45k", ... },  // DEMO DATA
    { label: "Total Saved", value: "₹5.2k", ... }   // DEMO DATA
]

// Lines 50-70: Hardcoded quote items
const individualQuotes: QuoteItem[] = [
    { id: "Q-2024-001", title: "House Lift Kit", amount: "₹4.5 L", ... },  // DEMO DATA
    { id: "Q-2024-002", title: "Spare Parts", amount: "₹12,000", ... },    // DEMO DATA
    { id: "Q-2023-089", title: "Maintenance Kit", amount: "₹8,500", ... }  // DEMO DATA
]
```

### What Needs to Change
- Replace hardcoded stats with data from database (calculate from actual orders/quotes)
- Replace hardcoded quote list with actual user quotes from `quotes` table
- The component should receive `quotes` and `stats` as props from the server-side page

---

## Database Tables Overview

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `categories` | Stores Applications → Categories → Subcategories | `parent_id`, `application`, `slug` |
| `elevator_types` | Standalone elevator type classifier | `name`, `slug`, `is_active` |
| `collections` | Curated product groups | `title`, `slug`, `is_featured` |
| `products` | Product catalog | `application_id`, `category_id`, `subcategory_id`, `status` |
| `product_elevator_types` | Many-to-many link | `product_id`, `elevator_type_id` |
| `product_collections` | Many-to-many link | `product_id`, `collection_id` |
| `quotes` | User quote requests | `quote_number`, `status`, `items` |

---

## Key Documentation Files

For implementation details, refer to:

1. [ECOMMERCE-STORE-OVERVIEW.md](file:///e:/My%20Programming%20Projects/cedarelevators/docs/ECOMMERCE-STORE-OVERVIEW.md) - Complete feature documentation including:
   - User types and access levels
   - Homepage variants by user type (Guest vs Logged In)
   - Section requirements for each page

2. [CEDAR-INTERCONNECTION-LOGIC-STATUS.md](file:///e:/My%20Programming%20Projects/cedarelevators/docs/CEDAR-INTERCONNECTION-LOGIC-STATUS.md) - How products connect to categories/elevator types

3. [dummy-data-removal-checklist.md](file:///e:/My%20Programming%20Projects/cedarelevators/docs/dummy-data-removal-checklist.md) - Existing checklist for removing demo data

---

## Next Steps

Before implementing any fixes, I recommend:

1. **Verify database has data:** Check if products, categories, elevator types have actual entries
2. **Check product relationships:** Ensure products are linked to categories and elevator types
3. **Prioritize issues:** Which issues should be fixed first?

Would you like me to:
- A) Check the database for actual data?
- B) Create a detailed implementation plan for specific issues?
- C) Start fixing a specific issue?
