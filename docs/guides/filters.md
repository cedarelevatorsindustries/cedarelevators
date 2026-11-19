# Cedar Elevators - Filter Module Implementation Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Components](#components)
5. [API Reference](#api-reference)
6. [Admin Guide](#admin-guide)
7. [SEO Implementation](#seo-implementation)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Cedar Elevators filter module is a production-ready filtering system with:
- **Backend:** PostgreSQL/Supabase with GIN indexes
- **Frontend:** React components with URL state management
- **Features:** Faceted filtering, price range, dynamic attributes, SEO-friendly
- **Admin:** No-code filter attribute management

**Status:** 75% Complete (Core implementation done, testing pending)

---

## Architecture

### Tech Stack
```
Frontend:
├── Next.js 16+ (App Router)
├── React 19+
├── TypeScript
├── Tailwind CSS
├── Radix UI (Accessible components)
└── Zustand (Optional state management)

Backend:
├── Supabase (PostgreSQL)
├── Next.js API Routes
└── Edge Functions Ready

Database:
├── PostgreSQL 15+
├── GIN Indexes (JSONB)
├── B-tree Indexes
└── Faceted Search Optimized
```

### Data Flow
```
User Action (Select Filter)
    ↓
useFilterState Hook (State Management)
    ↓
Update URL (?category=abc&price_min=1000)
    ↓
API Call: /api/store/products?...
    ↓
FilterService (Query Builder)
    ↓
Supabase Query (With Indexes)
    ↓
Return Products + Facets
    ↓
Update UI (ProductFilterSidebar/Modal)
```

---

## Getting Started

### 1. Database Setup

Run the migration file:
```bash
# Using Supabase CLI
supabase migration up 015_create_filter_infrastructure

# Or directly in SQL editor
psql -d your_database -f supabase/migrations/015_create_filter_infrastructure.sql
```

This creates:
- `product_attributes` table
- `filter_cache` table (for future use)
- GIN indexes on JSONB fields
- B-tree indexes on common filters
- Helper functions (get_price_range, get_facet_counts)

### 2. Install Dependencies

Already included in package.json:
```json
{
  "@radix-ui/react-dialog": "latest",
  "@radix-ui/react-checkbox": "latest",
  "@radix-ui/react-slider": "latest",
  "lucide-react": "latest"
}
```

### 3. Use the Catalog Template

```tsx
// app/store/page.tsx
import CatalogTemplateV2 from '@/modules/catalog/templates/catalog-template-v2'

export default function StorePage() {
  return (
    <CatalogTemplateV2
      categories={categories}
      searchParams={searchParams}
    />
  )
}
```

That's it! Filtering is now active.

---

## Components

### Core Components

#### 1. ProductFilterSidebar (Desktop)
```tsx
import { ProductFilterSidebar } from '@/modules/catalog/components/filters/ProductFilterSidebar'

<ProductFilterSidebar 
  onFilterChange={(filters) => console.log(filters)}
/>
```

**Features:**
- Sticky positioning (top-24)
- Auto-fetches facets from API
- URL state sync
- Collapsible filter groups

#### 2. ProductFilterModal (Mobile)
```tsx
import { ProductFilterModal } from '@/modules/catalog/components/filters/ProductFilterModal'

<ProductFilterModal 
  onFilterChange={(filters) => console.log(filters)}
/>
```

**Features:**
- Full-screen dialog
- Apply/Cancel buttons
- Filter count badge
- Temporary state (apply on click)

#### 3. Individual Filter Components

**CheckboxFilter:**
```tsx
<CheckboxFilter
  options={[
    { value: '220V', label: '220V', count: 45 },
    { value: '380V', label: '380V', count: 32 }
  ]}
  selectedValues={['220V']}
  onChange={(values) => console.log(values)}
  maxVisible={10}
  showCount={true}
/>
```

**PriceRangeSlider:**
```tsx
<PriceRangeSlider
  min={0}
  max={50000}
  currentMin={1000}
  currentMax={25000}
  onChange={(min, max) => console.log(min, max)}
  currency="₹"
/>
```

**RatingFilter:**
```tsx
<RatingFilter
  selectedRating={4}
  onChange={(rating) => console.log(rating)}
  counts={{ 5: 120, 4: 340, 3: 210 }}
/>
```

**StockFilter:**
```tsx
<StockFilter
  selectedValue="in_stock"
  onChange={(value) => console.log(value)}
  counts={{ in_stock: 450, out_of_stock: 23 }}
/>
```

### Custom Hook

#### useFilterState
```tsx
import { useFilterState } from '@/hooks/use-filter-state'

function MyComponent() {
  const {
    filters,
    updateFilters,
    clearFilters,
    removeFilter,
    hasActiveFilters,
    getActiveFilterCount
  } = useFilterState()

  return (
    <div>
      <p>Active filters: {getActiveFilterCount()}</p>
      <button onClick={clearFilters}>Clear All</button>
    </div>
  )
}
```

---

## API Reference

### 1. Get Filtered Products
```
GET /api/store/products
```

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `category` | string | Category filter (comma-separated) | `?category=abc,def` |
| `application` | string | Application filter | `?application=passenger` |
| `price_min` | number | Minimum price | `?price_min=1000` |
| `price_max` | number | Maximum price | `?price_max=50000` |
| `in_stock` | boolean | Stock availability | `?in_stock=true` |
| `voltage` | string | Voltage filter (comma-separated) | `?voltage=220V,380V` |
| `load_capacity_min` | number | Min load capacity (kg) | `?load_capacity_min=500` |
| `load_capacity_max` | number | Max load capacity (kg) | `?load_capacity_max=2000` |
| `speed_min` | number | Min speed (m/s) | `?speed_min=1.0` |
| `speed_max` | number | Max speed (m/s) | `?speed_max=4.0` |
| `rating_min` | number | Minimum rating (1-5) | `?rating_min=4` |
| `sort` | string | Sort order | `?sort=price_asc` |
| `page` | number | Page number | `?page=1` |
| `limit` | number | Items per page | `?limit=24` |
| `q` | string | Search query | `?q=cable` |
| `include_facets` | boolean | Include facet counts | `?include_facets=true` |

**Sort Options:**
- `featured` - Featured products first (default)
- `newest` - Newest products first
- `price_asc` - Price: Low to High
- `price_desc` - Price: High to Low
- `name_asc` - Name: A to Z
- `name_desc` - Name: Z to A
- `rating` - Top rated first

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "total": 245,
    "page": 1,
    "limit": 24,
    "totalPages": 11,
    "facets": {
      "categories": [...],
      "voltage": [...],
      "stock": { "in_stock": 220, "out_of_stock": 25 },
      "rating": [...],
      "priceRange": { "min": 500, "max": 75000 }
    }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### 2. Get Facet Counts
```
GET /api/store/filters/facets?category=abc
```

Returns available filter options with product counts based on current filters.

### 3. Get Price Range
```
GET /api/store/filters/price-range?category=abc
```

Returns dynamic min/max prices for current filter scope.

### 4. Get Filter Attributes
```
GET /api/store/filters/attributes
```

Returns all filterable attributes from `product_attributes` table.

### 5. Admin: Manage Attributes
```
GET    /api/admin/filter-attributes
POST   /api/admin/filter-attributes
PUT    /api/admin/filter-attributes/[id]
DELETE /api/admin/filter-attributes/[id]
```

CRUD operations for filter attributes (admin only).

---

## Admin Guide

### Access Filter Management
Navigate to: `/admin/catalog/filter-attributes`

Or integrate the component:
```tsx
import { FilterAttributesManager } from '@/components/admin/FilterAttributesManager'

<FilterAttributesManager />
```

### Add New Filter Attribute

1. Click **"Add Attribute"**
2. Fill in the form:
   - **Attribute Key:** Unique identifier (e.g., `motor_type`) - no spaces, lowercase
   - **Display Name:** User-facing label (e.g., "Motor Type")
   - **Attribute Type:** Choose from:
     - **Range:** Min-max slider (e.g., price, capacity)
     - **Enum:** Single select (e.g., status)
     - **Multi-Select:** Checkboxes (e.g., voltage, applications)
     - **Boolean:** Yes/No (e.g., in_stock)
   - **Unit:** Optional (e.g., "V", "kg", "m/s")
   - **Options:** For enum/multi-select (comma-separated)
   - **Min/Max Values:** For range type
3. Toggle **"Enable as filter"**
4. Click **"Save Attribute"**

### Reorder Filters
Use the ↑ ↓ arrows in the "Order" column to change display priority.

### Edit/Delete Attributes
- Click **Edit** icon to modify
- Click **Delete** (trash icon) to remove (confirmation required)
- Toggle the switch to enable/disable temporarily

### Best Practices
- Use descriptive display names
- Keep attribute keys short and meaningful
- Set logical filter priorities (most used filters at top)
- Test filters on storefront after changes
- Don't delete attributes with active product data

---

## SEO Implementation

### Automatic SEO Handling

The filter system includes SEO utilities that:
1. **Prevent duplicate content** - Noindex complex filter combinations
2. **Set canonical URLs** - Point filtered pages to base URLs
3. **Generate structured data** - JSON-LD for products and breadcrumbs
4. **Control indexing** - Smart robots meta tags

### Usage in Pages

```tsx
import { generateCatalogSEO, generateProductListStructuredData } from '@/lib/seo/catalog-seo'

export async function generateMetadata({ searchParams }) {
  const filters = parseFiltersFromURL(searchParams)
  const seoConfig = generateCatalogSEO(
    'https://yoursite.com/store',
    filters,
    totalProducts,
    categoryName
  )
  
  return {
    title: seoConfig.title,
    description: seoConfig.description,
    alternates: {
      canonical: seoConfig.canonicalUrl
    },
    robots: {
      index: !seoConfig.noindex,
      follow: !seoConfig.nofollow
    }
  }
}
```

### SEO Rules
| Filter Combination | Action | Reason |
|-------------------|--------|--------|
| No filters | Index | Base catalog page |
| Single category/app | Canonical to base | Avoid duplication |
| Multiple filters | Noindex, nofollow | Too specific |
| Price/stock only | Noindex, canonical | Dynamic filters |
| Sort/pagination | Canonical to page 1 | Standard practice |

---

## Performance Optimization

### Current Optimizations

**Database:**
- ✅ GIN indexes on JSONB fields (specifications, tags)
- ✅ B-tree indexes on common filters (price, stock, voltage)
- ✅ Composite indexes for filter combinations
- ✅ Query optimization with Supabase connection pooling

**Frontend:**
- ✅ Debounced filter updates (500ms for sliders)
- ✅ React.memo for filter components
- ✅ Next.js Image optimization
- ✅ Code splitting via dynamic imports
- ✅ Lazy facet loading (fetched separately)

**API:**
- ✅ Pagination (24 products per page)
- ✅ Selective field fetching
- ✅ Parallel facet queries (Promise.all)

### Future Optimizations

**Caching (Phase 6):**
```typescript
// Redis/Upstash caching for facets
const cacheKey = `facets:${JSON.stringify(filters)}`
const cached = await redis.get(cacheKey)

if (cached) return JSON.parse(cached)

const facets = await getFacetCounts(filters)
await redis.setex(cacheKey, 300, JSON.stringify(facets)) // 5 min TTL
```

**Query Performance Tips:**
```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM products
WHERE status = 'active'
  AND voltage = '220V'
  AND price BETWEEN 1000 AND 50000;

-- Should use index scans, not sequential scans
```

---

## Troubleshooting

### Common Issues

#### 1. Filters not showing up
**Symptom:** Filter sidebar is empty or shows "No options available"

**Solutions:**
- Check if `product_attributes` table has data
- Verify products have the filter fields populated
- Check API response in Network tab
- Ensure `is_filterable` is true for attributes

```sql
-- Check product attributes
SELECT * FROM product_attributes WHERE is_filterable = true;

-- Check products have filter data
SELECT voltage, load_capacity_kg, COUNT(*)
FROM products
WHERE status = 'active'
GROUP BY voltage, load_capacity_kg;
```

#### 2. Facet counts are zero
**Symptom:** All filter options show (0) products

**Solutions:**
- Filters are too restrictive, no products match
- Check if products are marked as `status = 'active'`
- Verify JSONB field structure matches expected format

#### 3. Filters not updating URL
**Symptom:** Selecting filters doesn't change URL parameters

**Solutions:**
- Ensure `useFilterState` hook is properly integrated
- Check Next.js router is available (client component)
- Verify no JavaScript errors in console

```tsx
// Correct usage
'use client'
import { useFilterState } from '@/hooks/use-filter-state'
```

#### 4. Performance issues
**Symptom:** Filter queries take >1 second

**Solutions:**
- Run `ANALYZE` on products table
```sql
ANALYZE products;
```
- Check if indexes exist:
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'products';
```
- Reduce limit if returning too many products
- Consider implementing facet caching (Phase 6)

#### 5. Mobile modal not working
**Symptom:** Filter button doesn't open modal on mobile

**Solutions:**
- Verify Radix Dialog is installed
- Check for z-index conflicts with other modals
- Ensure no JavaScript errors blocking execution
- Test on actual mobile device (not just browser DevTools)

### Debug Mode

Enable detailed logging:
```tsx
// In filterService.ts
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('Filter params:', filters)
  console.log('SQL query:', query)
  console.log('Results:', data)
}
```

### Getting Help

1. Check browser console for errors
2. Review Network tab for API responses
3. Check Supabase logs for database errors
4. Verify migration was run successfully
5. Review this guide and checklist document

---

## Next Steps

### For Development:
1. ✅ Core implementation complete
2. ⏳ Write integration tests
3. ⏳ Deploy to production catalog pages
4. ⏳ Monitor performance metrics

### For Production:
1. Run database migration
2. Replace old catalog template with CatalogTemplateV2
3. Test on staging environment
4. Deploy to production
5. Monitor error rates and performance
6. Collect user feedback

---

## Related Documentation

- [Filter Implementation Checklist](./filter-implementation-checklist.md) - Detailed phase-by-phase tracking
- [Architecture Overview](./ARCHITECTURE.md) - System design
- [API Documentation](./api/README.md) - Complete API reference
- Database schema in migration file: `supabase/migrations/015_create_filter_infrastructure.sql`

---

**Maintained by:** Cedar Elevators Development Team  
**Last Updated:** January 2025  
**Version:** 1.0.0
