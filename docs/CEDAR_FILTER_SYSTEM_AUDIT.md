# Cedar Elevators — Filter System Audit

## 1. Discovery Summary

A full repository and Supabase PostgreSQL inspection was performed across storefront pages, desktop/mobile catalogue templates, filter UI components, hooks, server data fetchers, and database tables.

### Filter Inventory

| Filter Area | Component(s) | Data Source | URL Parameter | Original Behaviour | Status |
|---|---|---|---|---|---|
| Availability | `StockFilter.tsx`, `UnifiedFilterSidebar.tsx`, `FilterBottomSheet.tsx` | `products.stock_quantity`, `track_inventory`, `allow_backorders`, `product_variants.inventory_quantity` | `availability` (`in_stock` / `out_of_stock`) | Updated URL, **completely ignored by `CatalogTemplate` and `ProductsTabTemplate`**; `FilterBottomSheet` failed to reset `availability` when removed from URL; `SubcategoryTemplate` checked only `variants.inventory_quantity > 0` | **Fail -> Repaired** |
| Size / Variant Options | `UnifiedFilterSidebar.tsx`, `FilterBottomSheet.tsx`, `CheckboxFilter.tsx` | `product_variants.options` (JSONB) | `option_<Name>` (e.g., `option_Size=0.5,0.7,0.75,10+mm`) | Updated URL, **completely ignored by `CatalogTemplate` and `ProductsTabTemplate`**; duplicate keys (`size` vs `Size`) and unnormalized spacing (`10 mm` vs `10mm`) | **Fail -> Repaired** |
| Category / Subcategory | `UnifiedFilterSidebar.tsx`, `FilterBottomSheet.tsx`, `HorizontalFilterBar.tsx`, `MobileCatalogTemplate.tsx` | `categories`, `subcategories`, `product_categories`, `product_subcategories` | `category`, `subcategory`, `categories`, `subcategories` | `categories`/`subcategories` sidebar params ignored in `CatalogTemplate` & `ProductsTabTemplate`; `listProducts` did not select `product_subcategories` | **Fail -> Repaired** |
| Application | `UnifiedFilterSidebar.tsx`, `FilterBottomSheet.tsx`, `products/page.tsx` | `applications`, `application_categories`, `product_applications` | `application`, `app`, `applications` | `applications` sidebar param ignored; `listProducts` ignored `application_id` and did not select `product_applications` | **Fail -> Repaired** |
| Elevator Type | `products/page.tsx`, `listProducts()` | `elevator_types`, `product_elevator_types` | `type` | `products/page.tsx` passed `queryParams.type`, **`listProducts` ignored it**, returning all 78 products | **Fail -> Repaired** |
| Collection | `products/page.tsx`, `CatalogTemplate`, `ProductsTabTemplate` | `collections`, `product_collections` | `collection` | Handled via `activeCollection.products`; stale `/catalog` links in empty states | **Partial -> Repaired** |
| Search | `SearchBar`, `StoreSearchBar`, `products/page.tsx`, `listProducts()` | `search_products` RPC + client filter | `q`, `search` | `listProducts` search branch ignored active `category_id` / `application_id` / `elevator_type_id` `productIds` intersection | **Fail -> Repaired** |
| Sorting | `SortControls.tsx`, `CatalogTemplate`, `ProductsTabTemplate` | Product `price`, `title`, `created_at` | `sort` | **`SortControls` was not rendered in `CatalogTemplate`**, and `sort` URL param was ignored on desktop and mobile | **Fail -> Repaired** |
| Checkbox UI | `src/components/ui/checkbox.tsx`, `CheckboxFilter.tsx` | Radix Checkbox | N/A | `--primary-foreground` was undefined, causing `text-current` to render a **black tick** inside an orange box | **Fail -> Repaired** |

## 2. Supabase Database Investigation (Read-Only)

- **Products (`products`)**: 78 rows, all `status = 'active'`, `track_inventory = true`, `allow_backorders = false`, `stock_quantity > 0`.
- **Variants (`product_variants`)**: 67 products have variants (all 67 have at least one variant with `inventory_quantity > 0`); 11 products have no variants and carry stock on `products.stock_quantity > 0`.
- **Variant Options (`product_variants.options`)**: Discovered inconsistent casing (`size` vs `Size`) and unit spacing (`10 mm` vs `10mm`, `16 mm` vs `16mm`, `5 mm` vs `5mm`, `9 mm` vs `9mm`), alongside distinct fractional sizes (`0.5`, `0.7`, `0.75`).
- **Relationships**: Verified `product_categories` (78), `product_subcategories` (36), `product_applications` (99), `product_elevator_types` (150), `product_collections` (30).
- **RLS Policies**: Verified public read policies restrict `products` and `product_variants` to `status = 'active'`; no destructive database changes were made.

## 3. Root Causes

1. **Disconnected URL State & Filtering Engine**: Sidebar (`UnifiedFilterSidebar`) and mobile sheet (`FilterBottomSheet`) wrote URL params (`availability`, `option_*`, `applications`, `categories`, `subcategories`), while `CatalogTemplate` and `MobileCatalogTemplate`/`ProductsTabTemplate` never parsed or applied them.
2. **Incomplete Server Junction Filtering**: `listProducts()` lacked `application_id` and `elevator_type_id` filtering and did not intersect `productIds` with `search_products` RPC results when `q` was combined with taxonomy filters.
3. **Missing Shared Normalizer**: Size values like `10 mm` and `10mm` appeared as separate options, and checkbox tick color fell back to black due to undefined `--primary-foreground`.
