# Bulk CSV Import Implementation Checklist

**Project:** Cedar Elevator Industries - Bulk Product Import Module  
**Created:** January 2025  
**Status:** 🟡 Planning Phase

---

## 📋 Overview

This document tracks the implementation of a comprehensive Bulk CSV Import system for products and variants with strict validation, automatic SKU generation, and intelligent catalog assignment.

### Core Philosophy (LOCKED ✅)
- ✅ CSV creates PRODUCTS & VARIANTS only
- ✅ Catalog structure (Applications, Categories, Subcategories, Types, Collections) must pre-exist
- ✅ CSV ASSIGNS products to catalog — never CREATES catalog structure
- ✅ Failed references → Product goes to "Uncategorized" (Draft)
- ✅ Variants use key–value option pairs (option1_name/value, option2_name/value)
- ✅ Attributes stored as metadata (JSON)
- ✅ No image upload via CSV (placeholder logic)
- ✅ Fallback rules apply for missing variant data

---

## 🎯 PHASE 1: Core Bulk Import System

### 1.1 Database Schema Review ✅
- [x] Review existing `products` table structure
- [x] Review existing `product_variants` table structure
- [x] Confirm JSONB fields for images, specifications, technical_specs
- [x] Verify relationships to applications, categories, subcategories
- [x] Confirm elevator_types and collections junction tables exist

### 1.2 TypeScript Types Enhancement
- [ ] Update `/src/types/csv-import.types.ts` with new fields:
  - [ ] Add `application_slug`, `category_slug`, `subcategory_slug`
  - [ ] Add `elevator_types` (comma-separated slugs)
  - [ ] Add `collections` (comma-separated slugs)
  - [ ] Add `attributes` (JSON string)
  - [ ] Add `product_mrp` and `variant_mrp` fields
  - [ ] Add variant option fields (option1_name, option1_value, option2_name, option2_value)
- [ ] Create validation error types with severity levels (blocking vs warnings)

### 1.3 CSV Template Generation
**Endpoint:** `GET /api/admin/products/import/template`

- [ ] Create API route at `/src/app/api/admin/products/import/template/route.ts`
- [ ] Define complete CSV headers:
  
  **Product-Level Columns:**
  - [ ] `product_title` (required)
  - [ ] `short_description` (required)
  - [ ] `brief_description` (optional)
  - [ ] `application_slug` (required)
  - [ ] `category_slug` (required)
  - [ ] `subcategory_slug` (optional)
  - [ ] `elevator_types` (comma-separated slugs)
  - [ ] `collections` (comma-separated slugs, optional)
  - [ ] `product_price` (required)
  - [ ] `product_mrp` (required)
  - [ ] `track_inventory` (true/false)
  - [ ] `product_stock` (number)
  - [ ] `status` (draft/active)
  
  **Variant-Level Columns:**
  - [ ] `variant_title` (optional)
  - [ ] `variant_option_1_name` (optional)
  - [ ] `variant_option_1_value` (optional)
  - [ ] `variant_option_2_name` (optional)
  - [ ] `variant_option_2_value` (optional)
  - [ ] `variant_price` (optional)
  - [ ] `variant_mrp` (optional)
  - [ ] `variant_stock` (optional)
  
  **Metadata Column:**
  - [ ] `attributes` (JSON string, optional)

- [ ] Add example rows with sample data
- [ ] Return CSV file with proper headers and encoding

### 1.4 CSV Preview & Validation
**Endpoint:** `POST /api/admin/products/import/preview`

- [ ] Create API route at `/src/app/api/admin/products/import/preview/route.ts`
- [ ] Implement CSV parsing with `papaparse`
- [ ] Implement structural validation:
  - [ ] Required columns exist
  - [ ] No empty mandatory fields
  - [ ] Valid CSV encoding (UTF-8)
  
- [ ] Implement catalog reference validation:
  - [ ] Validate `application_slug` exists in database
  - [ ] Validate `category_slug` exists and belongs to application
  - [ ] Validate `subcategory_slug` exists and belongs to category (if provided)
  - [ ] Validate `elevator_types` slugs exist (comma-separated)
  - [ ] Validate `collections` slugs exist (if provided)
  
- [ ] Implement variant logic validation:
  - [ ] Group variants by `product_title`
  - [ ] Validate no duplicate variant SKUs
  - [ ] Validate variant attributes are valid JSON
  - [ ] Check option pairs are consistent
  
- [ ] Return preview with:
  - [ ] Product groups with variants
  - [ ] Blocking errors (must fix before import)
  - [ ] Warnings (can proceed with caution)
  - [ ] Total counts (products, variants)

### 1.5 Automatic SKU Generation Logic
- [ ] Create SKU generation utility at `/src/lib/utils/sku-generator.ts`
- [ ] Implement Product SKU logic:
  - [ ] Format: `CED-{CATEGORY_CODE}-{AUTO_INCREMENT}`
  - [ ] Get category code (first 3-4 letters of category name)
  - [ ] Query database for next available increment
  - [ ] Store in centralized sequence table
  
- [ ] Implement Variant SKU logic:
  - [ ] Format: `{PRODUCT_SKU}-{OPTION_VALUES}`
  - [ ] Extract option values (e.g., 1000KG, 415V)
  - [ ] Concatenate with product SKU
  - [ ] Validate uniqueness

### 1.6 Automatic SEO & Metadata Generation
- [ ] Create SEO utility at `/src/lib/utils/seo-generator.ts`
- [ ] Generate Meta Title:
  - [ ] Format: `{product_title} | Cedar Elevator Components`
  - [ ] Max length: 60 characters
  
- [ ] Generate Meta Description:
  - [ ] Format: `Buy {product_title} for {application}. Suitable for {elevator_types}.`
  - [ ] Max length: 160 characters
  
- [ ] Generate URL Slug:
  - [ ] Format: `/products/{slug(product_title)}`
  - [ ] Lowercase, hyphenated
  - [ ] Remove special characters
  
- [ ] OG Image:
  - [ ] Use primary product image if present
  - [ ] Otherwise use placeholder

### 1.7 Catalog Assignment Logic
- [ ] Create catalog assignment utility at `/src/lib/utils/catalog-assignment.ts`
- [ ] Implement assignment rules:
  - [ ] Application → via `application_slug` lookup
  - [ ] Category → via `category_slug` lookup
  - [ ] Subcategory → via `subcategory_slug` lookup
  - [ ] Elevator Types → via comma-separated list lookup
  - [ ] Collections → via comma-separated list lookup
  
- [ ] Implement fallback logic:
  - [ ] If any reference fails → Create as Draft
  - [ ] Add to "Uncategorized" virtual collection
  - [ ] Log assignment failures
  
- [ ] No guessing or AI mapping
- [ ] No automatic catalog creation

### 1.8 Import Execution
**Endpoint:** `POST /api/admin/products/import/execute`

- [ ] Create API route at `/src/app/api/admin/products/import/execute/route.ts`
- [ ] Implement transactional import:
  - [ ] Start database transaction
  - [ ] Process each product group
  - [ ] Create product record
  - [ ] Generate or assign SKU
  - [ ] Create variant records
  - [ ] Generate variant SKUs
  - [ ] Assign catalog relationships (applications, categories, types, collections)
  - [ ] Generate SEO metadata
  - [ ] Commit transaction
  
- [ ] Implement error handling:
  - [ ] Skip failed rows (don't block entire import)
  - [ ] Log detailed error messages
  - [ ] Continue with remaining rows
  - [ ] Return comprehensive error report
  
- [ ] Return import results:
  - [ ] Products created count
  - [ ] Products updated count
  - [ ] Variants created count
  - [ ] Variants updated count
  - [ ] Failed count
  - [ ] Detailed error list

### 1.9 Frontend UI Updates
- [ ] Review existing `/admin/products/import/page.tsx`
- [ ] Update UI to show new validation rules
- [ ] Add pre-upload checklist display:
  - [ ] ☑ Applications created
  - [ ] ☑ Categories & Subcategories created
  - [ ] ☑ Elevator Types created
  - [ ] ☑ Collections created (optional)
  - [ ] ☑ CSV follows template
  
- [ ] Add warning banner:
  - [ ] "⚠ CSV will not create applications, categories, or collections"
  
- [ ] Update validation result display
- [ ] Update error/warning cards with actionable messages

---

## 🎯 PHASE 2: Enhanced Variant & Attribute Handling

### 2.1 Variant Options Enhancement
- [ ] Update database queries to properly handle option pairs
- [ ] Implement option1_name/value, option2_name/value mapping
- [ ] Support for 0, 1, or 2 option pairs per variant
- [ ] Plan for option3 extensibility (future v2)

### 2.2 Attributes as Metadata
- [ ] Parse `attributes` column as JSON
- [ ] Validate JSON structure in preview
- [ ] Store in `technical_specs` JSONB field
- [ ] Example format:
  ```json
  {
    "load_capacity": "1000kg",
    "speed": "1.5 m/s",
    "voltage": "415V",
    "controller": "VVVF"
  }
  ```

### 2.3 Fallback Rules Implementation
- [ ] Create fallback utility at `/src/lib/utils/import-fallbacks.ts`
- [ ] Implement Price Fallback:
  - [ ] `variant_price` present → use `variant_price`
  - [ ] `variant_price` missing → use `product_price`
  
- [ ] Implement MRP Fallback:
  - [ ] `variant_mrp` present → use `variant_mrp`
  - [ ] `variant_mrp` missing → use `product_mrp`
  
- [ ] Implement Stock Fallback:
  - [ ] `variant_stock` present → use `variant_stock`
  - [ ] `variant_stock` missing → use `product_stock`
  
- [ ] Implement Image Fallback:
  - [ ] Variant image missing → use product image
  - [ ] Product image missing → use default placeholder
  
- [ ] Implement SKU Fallback:
  - [ ] Auto-generate if missing
  - [ ] Ensure uniqueness across entire catalog

### 2.4 Image Handling (No Upload)
- [ ] Confirm CSV does NOT handle image uploads
- [ ] Assign global placeholder image:
  - [ ] To all products without images
  - [ ] To all variants without images
  
- [ ] Create placeholder image utility:
  ```typescript
  DEFAULT_PLACEHOLDER = "/images/product-placeholder.png"
  product.image = DEFAULT_PLACEHOLDER
  variant.image = product.image
  ```
  
- [ ] Document image management:
  - [ ] Images added manually post-import
  - [ ] Or via v2 image URL import feature

### 2.5 Product Grouping Logic
- [ ] Group products using: `product_title + category_slug`
- [ ] All rows with same `product_title` belong to same product
- [ ] Variants within same product group share product-level attributes
- [ ] Validate consistent product data across rows of same group

### 2.6 MRP vs Selling Price
- [ ] Add `product_mrp` field to products table (if not exists)
- [ ] Add `variant_mrp` field to product_variants table (if not exists)
- [ ] Ensure MRP is mandatory at product level
- [ ] Ensure selling price (product_price) ≠ MRP
- [ ] Display both on product detail pages

### 2.7 Enhanced Validation Rules
- [ ] Update validation to classify errors:
  - [ ] Hard Errors (Row Rejected):
    - [ ] Missing `product_title`
    - [ ] Missing `application_slug`
    - [ ] Missing `category_slug`
    - [ ] Invalid JSON in `attributes`
    - [ ] Duplicate SKU collision
  
  - [ ] Soft Warnings (Auto-fallback):
    - [ ] Missing `variant_price` (fallback to product price)
    - [ ] Missing `variant_stock` (fallback to product stock)
    - [ ] Missing `variant_mrp` (fallback to product MRP)
    - [ ] Missing `attributes` (empty JSON)

### 2.8 Import Flow Enhancement
- [ ] Update Step 1 - Download Template:
  - [ ] Pre-filled headers with examples
  - [ ] Separate templates: "Products + Variants" vs "Products Only"
  
- [ ] Update Step 2 - Upload CSV:
  - [ ] Validation only (no DB write)
  - [ ] Enhanced error messages
  
- [ ] Update Step 3 - Review Results:
  - [ ] Show: Products count, Variants count, Warnings count
  - [ ] Color-coded status indicators
  
- [ ] Update Step 4 - Import:
  - [ ] Options: "Import as Draft" or "Import & Publish"
  - [ ] Progress indicator for large imports
  - [ ] Downloadable error report

---

## 🧪 Testing & Validation

### Testing Checklist
- [ ] Unit Tests:
  - [ ] SKU generation logic
  - [ ] SEO metadata generation
  - [ ] Fallback rules
  - [ ] CSV parsing and validation
  
- [ ] Integration Tests:
  - [ ] Preview endpoint with valid CSV
  - [ ] Preview endpoint with invalid CSV
  - [ ] Execute endpoint with various scenarios
  - [ ] Transaction rollback on errors
  
- [ ] E2E Tests:
  - [ ] Complete import flow (upload → preview → execute)
  - [ ] Error handling and recovery
  - [ ] Large CSV imports (1000+ rows)
  - [ ] Concurrent imports
  
- [ ] Edge Cases:
  - [ ] Missing categories (fallback to Uncategorized)
  - [ ] Duplicate SKUs (rejection)
  - [ ] Duplicate product titles (allowed, different SKUs)
  - [ ] Invalid JSON in attributes
  - [ ] Empty variant fields (fallback rules)
  - [ ] Special characters in product names
  - [ ] Very long descriptions
  - [ ] Numeric slugs or IDs

---

## 📝 Documentation

### Documentation Checklist
- [ ] Admin User Guide:
  - [ ] How to prepare CSV for import
  - [ ] Required vs optional fields
  - [ ] Catalog structure prerequisites
  - [ ] Common error messages and solutions
  - [ ] Best practices for large imports
  
- [ ] Developer Documentation:
  - [ ] API endpoint specifications
  - [ ] Database schema changes
  - [ ] SKU generation algorithm
  - [ ] Fallback rules logic
  - [ ] Extension points for future enhancements
  
- [ ] CSV Template Documentation:
  - [ ] Field descriptions and examples
  - [ ] Supported formats and encodings
  - [ ] Variant grouping rules
  - [ ] Attributes JSON structure

---

## ✅ Phase Completion Criteria

### Phase 1 Complete When:
- [x] All database schema confirmed
- [ ] CSV template generation working
- [ ] Preview endpoint validates all rules
- [ ] Execute endpoint creates products + variants
- [ ] SKU auto-generation working
- [ ] SEO metadata auto-generation working
- [ ] Catalog assignment with fallbacks working
- [ ] Frontend UI displays all validation messages
- [ ] Error reporting comprehensive

### Phase 2 Complete When:
- [ ] Variant options (key-value pairs) working
- [ ] Attributes stored as JSONB metadata
- [ ] All fallback rules implemented
- [ ] MRP fields separate from selling price
- [ ] Image placeholder logic working
- [ ] Product grouping by title working
- [ ] Enhanced validation with severity levels working
- [ ] Import flow options (draft vs publish) working
- [ ] All tests passing
- [ ] Documentation complete

---

## 🚀 Future Enhancements (v2)

- [ ] Support for option3 (third variant option)
- [ ] Image URL import (bulk image upload via URLs)
- [ ] Update existing products (not just create)
- [ ] Bulk price updates via CSV
- [ ] Bulk stock adjustments via CSV
- [ ] Import scheduling (background jobs)
- [ ] Import templates library (pre-configured for common product types)
- [ ] AI-powered field mapping (optional)
- [ ] Undo/rollback functionality
- [ ] Duplicate detection and merge suggestions

---

## 📊 Progress Tracker

**Overall Progress:** 10% (Database Schema Review Complete)

### Phase 1 Progress: 10%
- Database Schema Review: ✅ 100%
- TypeScript Types: 🔄 0%
- CSV Template Generation: 🔄 0%
- Preview & Validation: 🔄 0%
- SKU Generation: 🔄 0%
- SEO Generation: 🔄 0%
- Catalog Assignment: 🔄 0%
- Import Execution: 🔄 0%
- Frontend UI: 🔄 0%

### Phase 2 Progress: 0%
- Not started

---

## 🔒 Locked Rules (DO NOT MODIFY)

1. ✅ CSV never uploads images
2. ✅ Variants use key–value option pairs (not free-form)
3. ✅ Attributes stored as metadata JSON in `technical_specs`
4. ✅ Variant values fallback to product values when missing
5. ✅ MRP is mandatory at product level
6. ✅ Product price ≠ final selling price (quote-based)
7. ✅ CSV assigns to catalog, never creates catalog structure
8. ✅ Failed references → Draft + Uncategorized
9. ✅ SKU must be unique across entire catalog
10. ✅ Product grouping by: `product_title + category_slug`

---

**Last Updated:** January 2025  
**Next Review:** After Phase 1 Completion
