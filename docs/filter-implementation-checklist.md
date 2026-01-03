# Store Filter Module - Implementation Checklist

**Project:** Cedar Elevator Industries - B2B E-commerce Platform  
**Created:** January 2025  
**Status:** In Progress

---

## Overview

Production-ready store filter module with:
- PostgreSQL/Supabase backend integration
- JSONB support for flexible variant attributes
- Faceted filtering with accurate counts
- URL state management
- Desktop + Mobile responsive UI
- Performance optimized with GIN indexes

---

## Phase 1: Database Schema & Indexes ⏳

### 1.1 Review Current Schema
- [x] Audit existing `products` table structure
- [x] Audit existing `product_variants` table
- [x] Audit existing `categories` table
- [x] Identify filterable fields (voltage, load_capacity, speed, etc.)
- [x] Document JSONB fields usage

**Findings:**
- Existing filter UI exists but not connected to backend
- Products table has: voltage, load_capacity_kg, speed_ms, technical_specs (JSONB)
- Need to add: rating, review_count fields
- Categories already hierarchical
- Application field needs clarification (currently in metadata)

### 1.2 Create Filter Attributes Table
- [x] Create `product_attributes` table for master attributes
  - [ ] `id` (UUID primary key)
  - [ ] `attribute_key` (text, unique) - e.g., 'capacity', 'voltage', 'color'
  - [ ] `attribute_type` (enum: 'range', 'enum', 'boolean', 'multi-select')
  - [ ] `display_name` (text) - User-facing label
  - [ ] `unit` (text, optional) - e.g., 'V', 'kg', 'm/s'
  - [ ] `is_filterable` (boolean)
  - [ ] `filter_priority` (integer) - Display order
  - [ ] `created_at`, `updated_at`
- [ ] Seed common attributes (voltage, capacity, speed, application, type)

### 1.3 Enhance Product Variants Structure
- [ ] Review existing variant attributes storage
- [ ] Ensure `product_variants.attributes` uses JSONB
- [ ] Add sample variant data for testing

### 1.4 Create Performance Indexes
- [ ] Create GIN index on `products.specifications` (JSONB)
- [ ] Create GIN index on `products.tags` (array)
- [ ] Create GIN index on `product_variants.attributes` (JSONB)
- [ ] Create B-tree index on `products.price`
- [ ] Create B-tree index on `products.stock_quantity`
- [ ] Create B-tree index on `products.category`
- [ ] Create composite index on `(status, is_active, stock_quantity)`
- [ ] Test query performance with EXPLAIN ANALYZE

### 1.5 Database Migration
- [ ] Create migration file: `015_create_filter_infrastructure.sql`
- [ ] Test migration on local Supabase instance
- [ ] Document rollback procedures

**Phase 1 Completion Criteria:**
- ✅ All indexes created
- ✅ Query performance < 200ms for 10k products
- ✅ JSONB queries working correctly
- ✅ Migration tested and documented

---

## Phase 2: Backend API - Filter Query Builder ⏳

### 2.1 Create Filter Service
- [ ] Create `/app/src/lib/services/filterService.ts`
- [ ] Implement base query builder class
- [ ] Add filter parameter parser
- [ ] Add validation for filter inputs

### 2.2 Implement Core Filter Functions
- [ ] `buildFilterQuery()` - Main query composer
- [ ] `parseFilterParams()` - URL params to filter object
- [ ] `applyPriceFilter()` - Price range filtering
- [ ] `applyCategoryFilter()` - Category/subcategory filtering
- [ ] `applyStockFilter()` - Availability filtering
- [ ] `applyVariantFilters()` - JSONB-based variant filtering
- [ ] `applyTechnicalSpecs()` - Technical specifications filtering
- [ ] `composableFilters()` - Combine multiple filters

### 2.3 Implement Faceted Filtering
- [ ] Create `getFacetCounts()` function
- [ ] Calculate counts for each filter dimension
- [ ] Use CTEs for efficient facet queries
- [ ] Cache facet results (Redis/Upstash)
- [ ] Handle zero-result scenarios

### 2.4 Implement Price Range Calculator
- [ ] `getPriceRange()` - Get min/max for current scope
- [ ] Handle user-type based pricing visibility
- [ ] Implement price clamping (security)
- [ ] Add debouncing support

### 2.5 Create Filter API Routes
- [ ] `GET /api/store/products` - Main product listing with filters
- [ ] `GET /api/store/filters/facets` - Get available filter counts
- [ ] `GET /api/store/filters/price-range` - Get current price range
- [ ] `GET /api/store/filters/attributes` - Get filterable attributes
- [ ] Add request validation (Zod schemas)
- [ ] Add rate limiting
- [ ] Add error handling

### 2.6 Testing
- [ ] Unit tests for query builder
- [ ] Integration tests for filter API
- [ ] Test with 10k+ products
- [ ] Test edge cases (no results, all filters applied)
- [ ] Load testing (100 concurrent requests)

**Phase 2 Completion Criteria:**
- ✅ All API routes functional
- ✅ Faceted counts accurate
- ✅ Query performance < 300ms
- ✅ All tests passing
- ✅ Error handling robust

---

## Phase 3: Frontend - Filter UI Components ⏳

### 3.1 Create Base Filter Components
- [ ] `FilterSidebar.tsx` - Desktop left sidebar
- [ ] `FilterModal.tsx` - Mobile bottom sheet
- [ ] `FilterChip.tsx` - Active filter display
- [ ] `FilterGroup.tsx` - Collapsible filter section
- [ ] `PriceRangeSlider.tsx` - Price range input
- [ ] `CheckboxFilter.tsx` - Multi-select filter
- [ ] `RadioFilter.tsx` - Single-select filter
- [ ] `SearchFilter.tsx` - Searchable filter (for long lists)

### 3.2 Desktop Filter Sidebar
- [ ] Position: Fixed left sidebar (280px width)
- [ ] Sticky behavior on scroll
- [ ] Collapsible filter groups with icons
- [ ] Active filter chips at top
- [ ] "Clear All" button
- [ ] Apply button (optional, can be auto-apply)
- [ ] Product count indicator
- [ ] Smooth animations (framer-motion)

### 3.3 Mobile Filter Modal
- [ ] Trigger: Bottom "Filter" button with badge
- [ ] Full-screen or bottom-sheet modal
- [ ] Scrollable filter content
- [ ] Fixed header with close button
- [ ] Fixed footer with Apply/Clear buttons
- [ ] Filter count badge on trigger button
- [ ] Swipe-to-close gesture

### 3.4 Individual Filter Types

#### Category Filter
- [ ] Hierarchical category display
- [ ] Expandable subcategories
- [ ] Radio button selection
- [ ] Active category highlight
- [ ] Breadcrumb navigation

#### Price Range Filter
- [ ] Dual-handle range slider
- [ ] Min/Max input fields (manual entry)
- [ ] Dynamic min/max based on current filters
- [ ] Debounced updates (500ms)
- [ ] Currency formatting (₹)
- [ ] Validation (min < max)

#### Stock Availability Filter
- [ ] Radio buttons:
  - All Products
  - In Stock Only
  - Out of Stock
- [ ] Product count per option

#### Variant Filters (Dynamic)
- [ ] Voltage selector (checkboxes)
- [ ] Capacity selector (checkboxes)
- [ ] Speed selector (checkboxes or range)
- [ ] Color selector (color swatches if applicable)
- [ ] Generate from `product_attributes` table
- [ ] Show available options only (no zero-count options)

#### Application Filter
- [ ] Checkbox list:
  - Passenger
  - Hospital
  - Industrial
  - Freight
  - Home
  - Others
- [ ] Multi-select support
- [ ] Count badges

#### Rating Filter (Future)
- [ ] Star rating selector
- [ ] 4+ stars, 3+ stars, etc.
- [ ] Only if reviews implemented

### 3.5 Active Filter Chips
- [ ] Display above product grid
- [ ] One chip per active filter
- [ ] Close icon to remove filter
- [ ] "Clear All" link
- [ ] Responsive layout (wrap on mobile)
- [ ] Smooth remove animations

### 3.6 Sort Options
- [ ] Dropdown component
- [ ] Options:
  - Featured (default)
  - Price: Low to High
  - Price: High to Low
  - Name: A-Z
  - Name: Z-A
  - Newest First
- [ ] URL sync for sort parameter

**Phase 3 Completion Criteria:**
- ✅ All components built and styled
- ✅ Desktop sidebar functional
- ✅ Mobile modal functional
- ✅ Filters apply correctly
- ✅ Accessible (keyboard navigation, screen readers)
- ✅ Responsive on all breakpoints

---

## Phase 4: State Management & URL Sync ⏳

### 4.1 URL State Management
- [ ] Use Next.js `useSearchParams` and `useRouter`
- [ ] Create `useFilterState()` custom hook
- [ ] Parse filters from URL on page load
- [ ] Update URL on filter change (replace, not push)
- [ ] Preserve other query params (search, page, etc.)
- [ ] Handle browser back/forward buttons
- [ ] Shareable filter URLs

### 4.2 Filter State Schema
- [ ] Define TypeScript interfaces:
  ```typescript
  interface FilterState {
    category?: string
    price_min?: number
    price_max?: number
    in_stock?: boolean
    application?: string[]
    voltage?: string[]
    capacity?: string[]
    speed_min?: number
    speed_max?: number
    sort?: string
    page?: number
  }
  ```
- [ ] URL encoding/decoding functions
- [ ] Default filter values

### 4.3 Client State Management
- [ ] Create filter context or use URL as single source of truth
- [ ] Debounce filter updates (price range)
- [ ] Optimistic UI updates
- [ ] Loading states during filter application
- [ ] Error states

### 4.4 SEO Considerations
- [ ] Add canonical tags for filtered pages
- [ ] Control indexing with robots meta tags
- [ ] Generate structured data for product listings
- [ ] Handle duplicate content issues

**Phase 4 Completion Criteria:**
- ✅ URL always reflects current filter state
- ✅ URLs are shareable and restoreable
- ✅ Browser navigation works correctly
- ✅ SEO best practices implemented

---

## Phase 5: Integration with Product Catalog ⏳

### 5.1 Update Product Listing Page
- [ ] Integrate FilterSidebar on desktop
- [ ] Integrate FilterModal on mobile
- [ ] Connect filters to product query
- [ ] Show loading skeleton during filtering
- [ ] Handle empty results state
- [ ] Add filter count in page header

### 5.2 Product Grid Updates
- [ ] Preserve grid layout during filter updates
- [ ] Smooth transitions for product changes
- [ ] Pagination or infinite scroll
- [ ] Total results count display
- [ ] "No results" message with suggestions

### 5.3 Breadcrumb Integration
- [ ] Update breadcrumbs with active filters
- [ ] Clickable breadcrumb trail
- [ ] Max breadcrumb length handling

### 5.4 Related Components
- [ ] Update search results page to use filters
- [ ] Update category pages to use filters
- [ ] Update collection pages to use filters

**Phase 5 Completion Criteria:**
- ✅ Filters fully integrated
- ✅ All catalog pages use filter system
- ✅ Smooth user experience
- ✅ No performance degradation

---

## Phase 6: Performance Optimization ⏳

### 6.1 Backend Optimization
- [ ] Implement Redis caching for facet counts
- [ ] Cache duration: 5 minutes for facets
- [ ] Cache invalidation on product updates
- [ ] Use database query pooling
- [ ] Optimize SQL queries (EXPLAIN ANALYZE)
- [ ] Add database query logging
- [ ] Monitor slow queries

### 6.2 Frontend Optimization
- [ ] Lazy load filter components
- [ ] Memoize expensive computations
- [ ] Debounce API calls
- [ ] Virtual scrolling for long filter lists
- [ ] Code splitting for filter modal
- [ ] Optimize re-renders (React.memo, useMemo)

### 6.3 API Response Optimization
- [ ] Paginate product results (24 per page)
- [ ] Only return required fields
- [ ] Compress API responses (gzip)
- [ ] Add ETag support for caching
- [ ] Implement cursor-based pagination

### 6.4 Image Optimization
- [ ] Use Next.js Image component
- [ ] Implement lazy loading
- [ ] Use appropriate image sizes
- [ ] WebP format with fallbacks

### 6.5 Performance Monitoring
- [ ] Add performance metrics logging
- [ ] Track filter query times
- [ ] Monitor API response times
- [ ] Set up alerts for slow queries (>500ms)
- [ ] Core Web Vitals monitoring

**Phase 6 Completion Criteria:**
- ✅ Filter queries < 300ms (p95)
- ✅ Page load time < 2s
- ✅ Facet counts cached effectively
- ✅ No unnecessary re-renders
- ✅ Core Web Vitals in green

---

## Phase 7: Admin Panel Integration ⏳

### 7.1 Filterable Attributes Management
- [ ] Create admin UI: `/admin/catalog/filter-attributes`
- [ ] List all filterable attributes
- [ ] Add new attribute form
- [ ] Edit attribute properties
- [ ] Set attribute type (range/enum/boolean)
- [ ] Set filter priority (display order)
- [ ] Toggle attribute visibility
- [ ] Delete unused attributes

### 7.2 Product Attribute Assignment
- [ ] Add attributes section in product edit form
- [ ] Dynamic attribute fields based on `product_attributes`
- [ ] Validation per attribute type
- [ ] Bulk attribute update (via CSV import)

### 7.3 Filter Preview
- [ ] Admin preview of storefront filters
- [ ] Test filter behavior
- [ ] View product count per filter

### 7.4 Documentation
- [ ] Admin guide for managing filter attributes
- [ ] How to add new filter dimensions
- [ ] Best practices for attribute naming

**Phase 7 Completion Criteria:**
- ✅ Admin can manage all filterable attributes
- ✅ No developer intervention needed for new filters
- ✅ Admin documentation complete

---

## Phase 8: Testing & Quality Assurance ⏳

### 8.1 Unit Testing
- [ ] Filter service functions (100% coverage)
- [ ] Query builder logic
- [ ] URL state management
- [ ] Filter component interactions

### 8.2 Integration Testing
- [ ] API endpoints with various filter combinations
- [ ] Database queries with real data
- [ ] Frontend + Backend integration
- [ ] URL navigation flows

### 8.3 End-to-End Testing
- [ ] User journey: Landing → Filter → View Product
- [ ] Mobile filter flow (open modal → apply → see results)
- [ ] Desktop filter flow (sidebar → instant results)
- [ ] URL sharing and restoration
- [ ] Browser back/forward navigation

### 8.4 Performance Testing
- [ ] Load test with 10k products
- [ ] Concurrent user testing (100 users)
- [ ] Filter query performance benchmarks
- [ ] Memory leak testing (long sessions)

### 8.5 Accessibility Testing
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader compatibility (NVDA, VoiceOver)
- [ ] Focus management in modal
- [ ] ARIA labels and roles
- [ ] Color contrast ratios (WCAG AA)

### 8.6 Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### 8.7 Edge Case Testing
- [ ] No products match filters
- [ ] All filters applied simultaneously
- [ ] Malformed URL parameters
- [ ] Very large price ranges
- [ ] Special characters in filter values
- [ ] Network failures

**Phase 8 Completion Criteria:**
- ✅ All tests passing
- ✅ > 90% code coverage
- ✅ Zero critical accessibility issues
- ✅ Cross-browser compatible
- ✅ All edge cases handled

---

## Phase 9: Documentation & Handoff ⏳

### 9.1 Developer Documentation
- [ ] Architecture overview diagram
- [ ] Database schema documentation
- [ ] API endpoint documentation (OpenAPI/Swagger)
- [ ] Component usage examples
- [ ] Code comments for complex logic
- [ ] How to add new filter types

### 9.2 User Guide
- [ ] How to use filters (customer-facing)
- [ ] Filter capabilities per user type
- [ ] Mobile vs desktop differences

### 9.3 Performance Documentation
- [ ] Caching strategy explained
- [ ] Query optimization notes
- [ ] Monitoring and alerting setup

### 9.4 Maintenance Guide
- [ ] How to troubleshoot common issues
- [ ] How to update indexes
- [ ] Cache invalidation procedures
- [ ] Performance tuning checklist

**Phase 9 Completion Criteria:**
- ✅ All documentation complete
- ✅ Code well-commented
- ✅ Handoff meeting completed

---

## Phase 10: Production Deployment ⏳

### 10.1 Pre-Deployment Checklist
- [ ] Run all tests in CI/CD
- [ ] Database migration tested on staging
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Load testing passed

### 10.2 Deployment
- [ ] Run database migrations
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Clear CDN cache
- [ ] Verify API endpoints
- [ ] Monitor error rates

### 10.3 Post-Deployment
- [ ] Smoke tests in production
- [ ] Monitor performance metrics
- [ ] Monitor error logs
- [ ] Check filter functionality
- [ ] Verify facet counts accuracy

### 10.4 Rollback Plan
- [ ] Database migration rollback script ready
- [ ] Previous version deployment ready
- [ ] Cache flush procedure documented

**Phase 10 Completion Criteria:**
- ✅ Deployed to production
- ✅ All systems operational
- ✅ No critical errors
- ✅ Performance metrics normal

---

## Summary & Progress Tracking

### Overall Progress: 0% Complete

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Database Schema | ⏳ Pending | 0% |
| Phase 2: Backend API | ⏳ Pending | 0% |
| Phase 3: Frontend UI | ⏳ Pending | 0% |
| Phase 4: State Management | ⏳ Pending | 0% |
| Phase 5: Integration | ⏳ Pending | 0% |
| Phase 6: Performance | ⏳ Pending | 0% |
| Phase 7: Admin Panel | ⏳ Pending | 0% |
| Phase 8: Testing | ⏳ Pending | 0% |
| Phase 9: Documentation | ⏳ Pending | 0% |
| Phase 10: Deployment | ⏳ Pending | 0% |

### Key Metrics Targets
- ✅ Filter query response time: < 300ms (p95)
- ✅ Page load time: < 2s
- ✅ Facet count accuracy: 100%
- ✅ Mobile performance score: > 90
- ✅ Desktop performance score: > 95
- ✅ Accessibility score: 100 (WCAG AA)
- ✅ Test coverage: > 90%

### Legend
- ✅ Complete
- 🚧 In Progress
- ⏳ Pending
- ❌ Blocked
- ⚠️ Needs Attention

---

**Last Updated:** January 2025  
**Next Review:** After Phase 1 Completion
