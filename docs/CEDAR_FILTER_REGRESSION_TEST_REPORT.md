# Cedar Elevators — Filter Regression Test Report

**Date:** 2026-11-25  
**Environment:** Next.js 16.1.1, React 19, TypeScript, Supabase PostgreSQL (`hbkdbrxzqaraarivudej`), PNPM.

---

## 1. Automated Unit Tests (`src/lib/catalog/__tests__/filter-utils.test.ts`)

Executed via `tsc` compilation + `node --test` (`14/14` passing, `0` failing):

| Test Case | Category | Result | Evidence |
|---|---|---|---|
| Untracked inventory & backorders treated as in stock | Automated Unit Test | **PASS** | `isProductInStock` suite (2/2) |
| Variant + product-level stock calculation | Automated Unit Test | **PASS** | `isProductInStock` suite (2/2) |
| Option key/unit normalization (`0.7` vs `0.75`, `10mm` = `10 mm`) | Automated Unit Test | **PASS** | `Option normalization & extraction` (2/2) |
| Deduplicated, naturally sorted variant options | Automated Unit Test | **PASS** | `Option normalization & extraction` (2/2) |
| Comma-separated & repeated URL param parsing + safe fallbacks | Automated Unit Test | **PASS** | `URL state parsing & serialization` (4/4) |
| Context preservation, page reset, and Clear All serialization | Automated Unit Test | **PASS** | `URL state parsing & serialization` (4/4) |
| Availability (`all`, `in_stock`, `out_of_stock` controlled fixtures) | Automated Unit Test | **PASS** | `applyCatalogFilters` (6/6) |
| OR within option group + AND across Availability/Size/Category/App/Search | Automated Unit Test | **PASS** | `applyCatalogFilters` (6/6) |
| Subcategory filtering & empty combination handling | Automated Unit Test | **PASS** | `applyCatalogFilters` (6/6) |
| Price asc/desc sorting (nulls last), name & date sorting | Automated Unit Test | **PASS** | `applyCatalogFilters` (6/6) |

---

## 2. Live Supabase Read-Only Query & RLS Verification

Executed via Supabase MCP (`execute_sql`) and live `@supabase/supabase-js` anon-key PostgREST client:

| Check | Method | Expected DB Ground Truth | Actual Anon PostgREST Result | Result |
|---|---|---|---|---|
| Active products & stock counts | Live Supabase SQL + Anon PostgREST | 78 active, 78 in stock, 0 out of stock | `count: 78`, `rows: 78`, `uniqueIds: 78`, `error: null` | **PASS** |
| Nested junction hydration (`categories`, `subcategories`, `applications`) | Anon PostgREST `listProducts` select | 78 `product_categories`, 36 `product_subcategories`, 99 `product_applications` rows | `withCategories: 77`, `withSubcats: 35`, `withApps: 77`, `error: null`, 0 duplicates | **PASS** |
| Search `q=wire` (`search_products` RPC + full select) | Live Supabase SQL + Anon PostgREST | 12 products (`total_count: 12`) | `searchCount: 12`, `fullRows: 12`, `uniqueIds: 12`, `rpcError: null`, `fullError: null` | **PASS** |
| Single & multiple sizes (`Size` in `0.5`, `0.7`) | Live Supabase SQL | 6 active products | Verified in DB (`2 core cable`, `3 core cable`, `4 core cable`, `6 core cable`, `Travelling cable -12 core`, `Wire coil`) | **PASS** |
| Category counts | Live Supabase SQL | Mechanical (33), Electrical (28), Safety (17) | Verified in DB (sum = 78) | **PASS** |
| Subcategory counts | Live Supabase SQL | 13 subcategories (max 11 in `guiding-positioning-components`) | Verified in DB | **PASS** |
| Application counts | Live Supabase SQL | Service (62), Testing (23), Erection (14) | Verified in DB | **PASS** |
| Elevator Type counts | Live Supabase SQL | 25 each for 6 types; 0 for `manual-door-elevator` | Verified in DB | **PASS** |
| Collection counts | Live Supabase SQL | `exclusive-in-cedar` (10), `new-year-sale` (7), `exclusive-to-business` (7), `trending-in-categories` (6) | Verified in DB | **PASS** |
| Combined `q=wire` + `category=electrical-components` | Live Supabase SQL | 9 products | Verified in DB | **PASS** |
| Combined `application=testing` + `category=mechanical-components` | Live Supabase SQL | 1 product (`Guide clip `) | Verified in DB | **PASS** |

---

## 3. Browser Interaction & Responsive Verification

> **Automation Limitation:** Browser automation tools (`chrome_devtools` MCP `navigate_page`, `click`, `resize_page`, `evaluate_script`, `take_snapshot`) and Playwright (`@playwright/test`) are not enabled/installed in this environment. No browser UI tests are claimed as passed below.

| Check | Method | Result | Notes |
|---|---|---|---|
| `/products`, `/products?q=wire`, `/products?availability=in_stock`, `/products?option_Size=0.5,0.7` | Browser Interaction | **NOT TESTED** | Requires manual browser check |
| `/products?availability=in_stock&option_Size=0.5,0.7` & combined taxonomy + search | Browser Interaction | **NOT TESTED** | Requires manual browser check |
| Clear All, individual chip removal, accordion collapsed initial state, sorting | Browser Interaction | **NOT TESTED** | Requires manual browser check |
| Browser refresh, Back/Forward navigation | Browser Interaction | **NOT TESTED** | Requires manual browser check |
| Desktop viewports (`1024px`, `1280px`, `1440px`) | Responsive Check | **NOT TESTED** | Requires manual browser check |
| Mobile viewports (`360px`, `375px`, `390px`, `430px`, `768px`) & bottom sheet | Responsive Check | **NOT TESTED** | Requires manual browser check |
| Live production storefront smoke check after deployment | Production Check | **REQUIRES PRODUCTION VERIFICATION** | Verify after Vercel deploy |

### Manual Browser Verification Instructions
1. Start the app (`pnpm dev`) and open `http://localhost:3000/products` in Chrome DevTools with Console open:
   - Confirm 0 console errors and 0 hydration warnings.
   - Confirm left sidebar displays `Filters` with `78 products`, and all filter accordions (`Availability`, `Size`, etc.) start **collapsed**.
2. Visit and verify counts against the Supabase ground truth above:
   - `/products?q=wire` -> expect **12** products.
   - `/products?availability=in_stock` -> expect **78** products.
   - `/products?option_Size=0.5,0.7` -> expect **6** products.
   - `/products?availability=in_stock&option_Size=0.5,0.7` -> expect **6** products with active filter chips (`In Stock`, `Size: 0.5`, `Size: 0.7`).
   - `/products?q=wire&category=electrical-components` -> expect **9** products.
3. Test interactions on `/products?availability=in_stock&option_Size=0.5,0.7`:
   - Click `×` on one chip -> verify URL and count update immediately.
   - Click **Clear All** -> verify URL returns to `/products` and count returns to `78`.
   - Reload (`F5`) on a filtered URL, then test browser **Back** and **Forward** buttons.
4. Test responsive layouts in DevTools Device Toolbar (`360px`, `375px`, `390px`, `430px`, `768px`, `1024px`, `1280px`, `1440px`):
   - Confirm `document.documentElement.scrollWidth <= window.innerWidth` at every width.
   - On mobile (`< 768px`), open the filter bottom sheet, toggle options, verify active filter count, test Apply and Reset, and close the sheet.

---

## 4. Final Verdict

**B. CONDITIONAL — SPECIFIC ISSUES REMAIN**

Code, TypeScript (`tsc --noEmit`), ESLint (`pnpm lint`), unit tests (`14/14`), production build (`pnpm build`), and live Supabase RLS/PostgREST verification all **PASS**. Manual browser & responsive verification remains required to close the `NOT TESTED` items above.
