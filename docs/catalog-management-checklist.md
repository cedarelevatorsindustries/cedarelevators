# Cedar Elevator Industries - Catalog Management Refactoring Checklist

## Overview
This document outlines the refactoring plan to restructure the admin panel's taxonomy management for Cedar Elevator Industries B2B e-commerce platform.

---

## 🎯 Project Goal
Transform the current nested taxonomy structure into a clean, separate module architecture where:
- Each taxonomy type has its own lifecycle and management
- Relationships are enforced in forms, not in navigation
- Products are the single source of truth for all relationships

---

## 📊 Current State (BEFORE)

### Current Sidebar Structure
```
Dashboard
Orders
Quotes
Products
Categories (contains everything nested)
  ├── Applications
  ├── Types
  ├── Categories
  └── Subcategories
Collections (separate)
Banners
Inventory
Customers
Settings
```

### Problems with Current Structure
- [ ] Mental model is mixed and confusing
- [ ] Applications ≠ Categories (different taxonomy types)
- [ ] Elevator Types ≠ Categories (cross-cutting filters)
- [ ] Subcategories are treated as standalone module instead of parent relationship
- [ ] Low sidebar clarity
- [ ] High form complexity
- [ ] Confusing product assignment flow

---

## ✅ Target State (AFTER)

### Proposed Sidebar Structure
```
Dashboard
Orders
Quotes
Customers
Products
Catalog
  ├── Applications
  ├── Categories
  ├── Elevator Types
  └── Collections
Inventory
Banners
Settings
```

### Benefits
- Clear mental model
- High sidebar clarity
- Controlled form complexity
- Single-source product assignment
- Safe scalability
- Easy AI agent logic

---

## 📋 Implementation Checklist

### Phase 1: Backend Preparation
- [ ] Review existing database schema for categories
- [ ] Verify parent-child relationships are properly stored
- [ ] Check API endpoints for all taxonomy types
- [ ] Ensure proper data separation between Applications, Categories, Elevator Types
- [ ] Test cascading queries for hierarchical data

### Phase 2: Sidebar Restructuring
- [ ] Update `/app/src/components/common/sidebar.tsx`
- [ ] Remove "Categories" as single item containing everything
- [ ] Add "Catalog" section with 4 separate items:
  - [ ] Applications
  - [ ] Categories
  - [ ] Elevator Types
  - [ ] Collections
- [ ] Add proper icons for each item
- [ ] Test sidebar navigation
- [ ] Test active states for each route

### Phase 3: Module 1 - Applications
**Purpose:** Top-level grouping for why a part is used (e.g., Installation, Maintenance, Testing)

#### Routes
- [ ] `/admin/applications` - List page
- [ ] `/admin/applications/create` - Create page
- [ ] `/admin/applications/[id]` - Detail page
- [ ] `/admin/applications/[id]/edit` - Edit page

#### Features
- [ ] Simple form with fields:
  - Application Name (required)
  - Description (optional, short)
  - Thumbnail Image
  - Banner Image
  - Status (active/inactive)
- [ ] No product selection
- [ ] No category selection
- [ ] No hierarchy inside application
- [ ] List view showing all applications
- [ ] Detail view showing subcategories and products (read-only)

### Phase 4: Module 2 - Categories (With Subcategories)
**Purpose:** Structural grouping of products

#### Routes
- [ ] `/admin/categories` - List page (hierarchical view)
- [ ] `/admin/categories/create` - Create page
- [ ] `/admin/categories/[id]` - Detail page
- [ ] `/admin/categories/[id]/edit` - Edit page

#### Features
- [ ] Category Creation Form with fields:
  - Category Name (required)
  - Application (dropdown, filtered from Applications module)
  - Parent Category (optional - if selected, creates subcategory)
  - Thumbnail Image
  - Banner Image
  - Sort Order
  - Status
- [ ] Subcategory = Category with parent_id
- [ ] Application selection filters category tree
- [ ] No product selection in form (products assign themselves)
- [ ] Detail page shows:
  - Category info
  - Subcategories list
  - Read-only list of products (auto-derived)

### Phase 5: Module 3 - Elevator Types
**Purpose:** Cross-cutting filter (Passenger, Freight, Hospital, etc.)

#### Routes
- [ ] `/admin/elevator-types` - List page
- [ ] `/admin/elevator-types/create` - Create page
- [ ] `/admin/elevator-types/[id]` - Detail page
- [ ] `/admin/elevator-types/[id]/edit` - Edit page

#### Features
- [ ] Simple form with fields:
  - Type Name (required)
  - Description
  - Thumbnail Image
  - Banner Image
  - Status
- [ ] Flat list (no hierarchy)
- [ ] No product selection
- [ ] Multi-assignable in Product form
- [ ] Distinct UI treatment (NOT a category)

### Phase 6: Module 4 - Collections
**Purpose:** Curated or logical grouping (non-structural)

#### Current State
- [ ] Review existing `/admin/collections` implementation
- [ ] Verify it follows the target architecture

#### Target Features
- [ ] Collection form with fields:
  - Collection Name
  - Description
  - Thumbnail Image
  - Banner Image
  - Visibility (public/internal)
  - Sort Order
  - Status
- [ ] No product selection in collection form
- [ ] Products assign themselves to collections
- [ ] Used for merchandising & discovery

### Phase 7: Module 5 - Products (Relationship Hub)
**Purpose:** Single source of truth for all relationships

#### Updates Needed
- [ ] Review `/admin/products/create` form
- [ ] Ensure "Organization" or "Catalog" tab contains:
  - Application (dropdown, required)
  - Category (dropdown, filtered by application, required)
  - Subcategory (dropdown, filtered by category, optional)
  - Elevator Types (multi-select, optional)
  - Collections (multi-select, optional)
- [ ] Implement cascading filters:
  - Category filtered by selected Application
  - Subcategory filtered by selected Category
- [ ] This is the ONLY place relationships are created
- [ ] Remove any product selection from taxonomy forms

### Phase 8: UI/UX Improvements
- [ ] Update breadcrumbs to reflect new structure
- [ ] Update page titles and descriptions
- [ ] Add helpful hints/tooltips explaining the taxonomy
- [ ] Create "Golden Rule" info boxes:
  - "Products assign themselves to categories"
  - "This is the only place to manage [module]"
- [ ] Consistent color coding across modules:
  - Applications: Blue
  - Categories: Indigo
  - Subcategories: Purple
  - Elevator Types: Teal
  - Collections: Orange

### Phase 9: Testing
- [ ] Test Application CRUD operations
- [ ] Test Category creation (with Application parent)
- [ ] Test Subcategory creation (with Category parent)
- [ ] Test Elevator Types CRUD operations
- [ ] Test Collections CRUD operations
- [ ] Test Product form with all relationships
- [ ] Test cascading filters in Product form
- [ ] Test navigation between all modules
- [ ] Test data integrity (deleting categories with products)
- [ ] Test search and filters in each module

### Phase 10: Documentation & Training
- [ ] Update admin documentation
- [ ] Create visual taxonomy diagram
- [ ] Document the relationship logic
- [ ] Create quick reference guide for admins
- [ ] Update API documentation if needed

---

## 🔑 Key Architectural Decisions

### Separation of Concerns
| Module | Purpose | Parent? | Products? | UI Color |
|--------|---------|---------|-----------|----------|
| Applications | Top-level grouping by use case | No | Products assign | Blue |
| Categories | Structural product grouping | Yes (Application) | Products assign | Indigo |
| Subcategories | Fine-grained categorization | Yes (Category) | Products assign | Purple |
| Elevator Types | Cross-cutting technical filter | No | Products assign | Teal |
| Collections | Curated merchandising groups | No | Products assign | Orange |

### Relationship Management
- **Old Way:** Taxonomy modules try to select products
- **New Way:** Products select their taxonomy during creation/edit
- **Benefit:** Single source of truth, no sync issues, clearer mental model

### Navigation Philosophy
- **Old Way:** Nested sidebar items reflect data hierarchy
- **New Way:** Flat sidebar items for easy access, hierarchy managed in forms
- **Benefit:** Faster navigation, clearer module boundaries

---

## 🚨 Critical Implementation Notes

1. **Do NOT nest sidebar items** - Keep Applications, Categories, Elevator Types, and Collections as separate, clickable items under "Catalog" section

2. **Subcategories are NOT a separate module** - They are created via the Category form using the parent_id selection

3. **Products are the hub** - All taxonomy relationships are created/managed in the Product form, never in the taxonomy forms themselves

4. **Data integrity** - Ensure cascading filters work properly (Application → Category → Subcategory)

5. **Backward compatibility** - Existing products and taxonomy data must work seamlessly after refactor

---

## 📐 Data Model Reference

```
products
├── application_id → applications.id (required)
├── category_id → categories.id (required)
├── subcategory_id → categories.id (optional, where parent_id IS NOT NULL)
├── elevator_type_ids → JSON array of elevator_types.id (optional)
└── collection_ids → JSON array of collections.id (optional)

categories
├── id (primary key)
├── parent_id (NULL = Application or Category, NOT NULL = Subcategory)
├── application (for types: 'elevator-type' vs normal categories)
├── name
└── ...other fields

elevator_types
├── id (primary key)
├── name
├── application = 'elevator-type' (fixed)
└── ...other fields

collections
├── id (primary key)
├── type (manual/automatic)
└── ...other fields
```

---

## 🎯 Success Criteria

- [ ] Admin sidebar shows 4 separate items under "Catalog" section
- [ ] Each module has its own dedicated pages and routes
- [ ] Product form is the only place to assign taxonomy relationships
- [ ] Cascading filters work correctly (App → Cat → Subcat)
- [ ] No confusion between different taxonomy types
- [ ] All existing data migrates cleanly
- [ ] Performance is maintained or improved
- [ ] Admin users can easily understand the new structure
- [ ] Documentation is complete and clear

---

## 📅 Timeline Estimate

- Phase 1: Backend Preparation - 1 hour
- Phase 2: Sidebar Restructuring - 1 hour
- Phase 3: Applications Module - 2 hours
- Phase 4: Categories Module - 3 hours
- Phase 5: Elevator Types Module - 2 hours
- Phase 6: Collections Review - 1 hour
- Phase 7: Products Update - 2 hours
- Phase 8: UI/UX Improvements - 2 hours
- Phase 9: Testing - 2 hours
- Phase 10: Documentation - 1 hour

**Total Estimated Time: ~17 hours**

---

## 📞 Support & Questions

For any questions or clarifications during implementation:
- Refer to the detailed problem statement
- Check the module-by-module UX design section
- Verify against the "Cedar Golden Rule": Products assign themselves

---

*Last Updated: [Current Date]*
*Status: Planning Phase - Implementation Pending User Approval*
