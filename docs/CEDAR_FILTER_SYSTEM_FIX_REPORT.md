# Cedar Elevators — Filter System Fix Report

**Date:** 2026-11-25  
**Scope:** Independent final verification & gap closure of the site-wide product filtering system (`src/lib/data/products.ts`, `src/lib/catalog/filter-utils.ts`, `src/modules/catalog/*`).

---

## 1. Summary of Verified Fixes & Gap Closures

### 1.1 `src/lib/data/products.ts` — Supabase Query Inconsistency Resolved
- **Finding:** Although `listProducts()` mapped `subcategories` and `applications` from `p.product_subcategories` and `p.product_applications`, both nested selections were missing from the `.select(...)` clauses in the search branch and the main catalog branch, causing `product.subcategories` and `product.applications` to always resolve to `[]`. Additionally, the `application_id` empty-result guard (`else if (productIds === null)`) failed to short-circuit when another taxonomy filter was already active.
- **Fix Applied:**
  - Added `product_subcategories(subcategory:subcategories(*))` and `product_applications(application:applications(*))` to both `.select(...)` calls in `listProducts()` (`src/lib/data/products.ts`).
  - Changed `else if (productIds === null)` to `else` in the `application_id` junction filter so an application with 0 linked products returns an empty result set consistently even when combined with other taxonomy filters.
- **RLS & PostgREST Verification (No RLS Weakening):**
  - `products`: RLS enabled (`Public read products`, `anon, authenticated` SELECT where `status = 'active'`).
  - `product_variants`: RLS enabled (`Public read product_variants`, `anon, authenticated` SELECT where `status = 'active'`).
  - `product_categories`: RLS enabled (`Public can view product categories`, `public` SELECT `qual = true`).
  - `product_subcategories`: RLS enabled (`Public can view product subcategories`, `public` SELECT `qual = true`).
  - `product_elevator_types`: RLS enabled (`Public read product_elevator_types`, `anon, authenticated` SELECT for active products).
  - `applications`: RLS enabled (`Allow public read access to active applications`, `public` SELECT where `status = 'active'`).
  - `product_applications`, `categories`, `subcategories`: Publicly readable (`rowsecurity = false`), foreign keys verified on all 5 junction tables.
  - **Live Anon PostgREST Verification:** Executed read-only anon-key queries matching `listProducts()`:
    - Main query: `error: null`, `count: 78`, `rows: 78`, `uniqueIds: 78` (0 duplicates), `withCategories: 77`, `withSubcats: 35`, `withApps: 77`.
    - Search query (`search_products('wire')` + full select): `rpcError: null`, `searchCount: 12`, `fullError: null`, `fullRows: 12`, `uniqueIds: 12` (0 duplicates).

### 1.2 Filter Accordion Initial State (`FilterGroup`, `UnifiedFilterSidebar`, `FilterBottomSheet`)
- **Fix Applied:**
  - Updated `FilterGroup` (`src/modules/catalog/components/filters/FilterGroup.tsx`) `defaultExpanded` default from `true` to `false`.
  - Removed forced `defaultExpanded` overrides on `Availability` and `Size` in `UnifiedFilterSidebar.tsx` and `FilterBottomSheet.tsx` so all filter accordions start collapsed on initial load and expand on user click.

### 1.3 Filter UI & Shared Engine (Previously Implemented & Verified)
- `src/lib/catalog/filter-utils.ts`: Shared stock check (`isProductInStock`), option key/value normalization (`10mm` / `10 mm` equivalence, `0.7` vs `0.75` separation), URL parsing/serialization, and `applyCatalogFilters()` (OR within an option group, AND across groups, null-last price sorting).
- `src/modules/catalog/templates/catalog-template.tsx`: Removed top `SortControls` bar; passed live `totalProducts` count to `UnifiedFilterSidebar`.
- `src/components/ui/checkbox.tsx`: Cedar orange checked state with white checkmark.

---

## 2. Final Code Validation Results

| Check | Command | Outcome | Notes |
|---|---|---|---|
| TypeScript Type Check | `pnpm exec tsc --noEmit` | **PASS** | 0 errors (exit code 0). |
| ESLint | `pnpm lint` | **PASS** | 0 errors, 2,199 pre-existing warnings (exit code 0). |
| Filter Unit Tests | `node --test .../filter-utils.test.js` | **PASS** | 14/14 tests passed across 5 suites (compiled from `src/lib/catalog/__tests__/filter-utils.test.ts`). |
| Production Build | `pnpm build` | **PASS** | Compiled and built with exit code 0 (`next build --webpack`). |

---

## 3. Final Verdict

**B. CONDITIONAL — SPECIFIC ISSUES REMAIN**

All TypeScript, ESLint, unit tests, production build, and live Supabase RLS/PostgREST query checks **PASS**. However, interactive browser tests and responsive viewport checks (`360px`–`1440px`) are marked **`NOT TESTED`** in automation because `chrome_devtools` MCP interaction tools (`navigate_page`, `click`, `resize_page`, `evaluate_script`, `take_snapshot`) and Playwright are not enabled/installed in this environment. Complete the manual browser checklist in `docs/CEDAR_FILTER_REGRESSION_TEST_REPORT.md` before final production sign-off.
