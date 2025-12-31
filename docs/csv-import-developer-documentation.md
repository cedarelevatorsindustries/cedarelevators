# Bulk CSV Import - Developer Documentation

**Last Updated:** January 2025  
**Module:** Cedar Elevator Industries - Product Import System  
**Version:** 1.0

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [API Endpoints](#api-endpoints)
3. [Database Schema](#database-schema)
4. [Type Definitions](#type-definitions)
5. [Core Utilities](#core-utilities)
6. [Import Flow](#import-flow)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Extension Points](#extension-points)

---

## System Architecture

### Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5.9
- **Database:** Supabase (PostgreSQL)
- **CSV Parser:** PapaParse 5.5
- **UI:** React 19, Tailwind CSS
- **Testing:** Jest, Vitest, Playwright

### High-Level Architecture

```
┌─────────────────┐
│  Frontend UI      │
│  (React)          │
└───────┬─────────┘
        │
        │ HTTP Requests
        │
┌───────┴─────────┐
│  API Routes       │
│  (Next.js)        │
├─────────────────┤
│  1. Template      │
│  2. Preview       │
│  3. Execute       │
└───────┬─────────┘
        │
┌───────┴─────────┐
│  Utilities        │
├─────────────────┤
│  • SKU Generator  │
│  • SEO Generator  │
│  • Catalog Assign │
│  • Fallbacks      │
└───────┬─────────┘
        │
┌───────┴─────────┐
│  Database         │
│  (Supabase)       │
└─────────────────┘
```

### File Structure

```
/app
├── src/
│   ├── app/
│   │   ├── api/admin/products/import/
│   │   │   ├── template/route.ts       # CSV template generation
│   │   │   ├── preview/route.ts        # CSV validation
│   │   │   └── execute/route.ts        # Import execution
│   │   └── admin/(dashboard)/products/import/
│   │       └── page.tsx                # Import UI
│   ├── lib/
│   │   └── utils/
│   │       ├── sku-generator.ts        # SKU generation logic
│   │       ├── seo-generator.ts        # SEO metadata generation
│   │       ├── catalog-assignment.ts   # Catalog reference resolution
│   │       └── import-fallbacks.ts     # Fallback rules
│   └── types/
│       └── csv-import.types.ts     # TypeScript type definitions
└── docs/
    ├── bulk-csv-import-checklist.md
    ├── csv-import-admin-user-guide.md
    ├── csv-import-developer-documentation.md
    └── csv-template-documentation.md
```

---

## API Endpoints

### 1. GET /api/admin/products/import/template

**Purpose:** Generate and download CSV template with example data.

**Response:**
- **Type:** `text/csv`
- **Headers:**
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="product-import-template.csv"`

**Implementation:**
```typescript
// src/app/api/admin/products/import/template/route.ts
export async function GET() {
  // 1. Define headers array
  // 2. Create example rows
  // 3. Convert to CSV format
  // 4. Return with download headers
}
```

**Example Response:**
```csv
product_title,short_description,application_slug,category_slug,product_price,product_mrp,...
VVVF Elevator Motor,High-efficiency motor,motors,traction-motors,45000,50000,...
```

---

### 2. POST /api/admin/products/import/preview

**Purpose:** Validate CSV and return preview of import.

**Request:**
- **Type:** `multipart/form-data`
- **Body:**
  - `file`: CSV file (required)

**Response:**
```typescript
interface PreviewResult {
  success: boolean
  totalProducts: number
  totalVariants: number
  productGroups: ProductGroup[]
  blockingErrors: ValidationError[]
  warnings: ValidationError[]
}
```

**Validation Rules:**
1. **Structural Validation:**
   - Required columns exist
   - CSV is valid UTF-8
   - No empty rows

2. **Field Validation:**
   - `product_title`: min 3 characters
   - `short_description`: min 10 characters
   - `product_price`: positive number
   - `product_mrp`: positive number
   - `attributes`: valid JSON (if present)

3. **Catalog Validation:**
   - `application_slug` exists in database
   - `category_slug` exists under application
   - `subcategory_slug` exists under category (warning)
   - `elevator_types` slugs exist (warning)
   - `collections` slugs exist (warning)

**Implementation Flow:**
```typescript
// 1. Parse CSV with PapaParse
const parseResult = Papa.parse<CSVRow>(fileContent, {
  header: true,
  skipEmptyLines: true,
})

// 2. Validate structure
const structuralErrors = validateStructure(rows)

// 3. Group by product_title
const productGroups = await groupAndValidateProducts(rows)

// 4. Resolve catalog references
const catalogLookup = await resolveCatalogReferences(...)

// 5. Return preview with errors/warnings
```

---

### 3. POST /api/admin/products/import/execute

**Purpose:** Execute bulk import of validated products.

**Request:**
```typescript
{
  productGroups: ProductGroup[]
}
```

**Response:**
```typescript
interface ImportResult {
  success: boolean
  duration: number // milliseconds
  productsCreated: number
  productsUpdated: number
  variantsCreated: number
  variantsUpdated: number
  failed: number
  errors?: ImportError[]
}
```

**Implementation Flow:**
```typescript
// For each product group:
// 1. Generate product SKU
const productSKU = await generateProductSKU(categoryName)

// 2. Generate SEO metadata
const slug = generateSlug(title)
const metaTitle = generateMetaTitle(title)
const metaDescription = generateMetaDescription(title, app, types)

// 3. Insert product
const { data: product } = await supabase
  .from('products')
  .insert(productData)

// 4. Insert variants
for (const variant of variants) {
  const variantSKU = generateVariantSKU(productSKU, opt1, opt2)
  await supabase.from('product_variants').insert(variantData)
}

// 5. Create relationships (elevator_types, collections)
await supabase.from('product_elevator_types').insert(relations)
```

**Error Handling:**
- Individual product failures don't block entire import
- Errors logged with product title and details
- Transaction not used (allows partial imports)

---

## Database Schema

### Products Table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  status TEXT CHECK (status IN ('draft', 'active', 'archived')),
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2), -- This is MRP
  stock_quantity INTEGER DEFAULT 0,
  track_inventory BOOLEAN DEFAULT true,
  
  -- Catalog relationships
  application_id UUID REFERENCES categories(id),
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES categories(id),
  is_categorized BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Media
  thumbnail TEXT,
  images JSONB DEFAULT '[]',
  
  -- Metadata
  specifications JSONB DEFAULT '[]',
  dimensions JSONB DEFAULT '{}',
  
  -- Stats
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Product Variants Table

```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2), -- Variant-specific MRP
  inventory_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  
  -- Variant options (key-value pairs)
  option1_name TEXT,
  option1_value TEXT,
  option2_name TEXT,
  option2_value TEXT,
  
  -- Media
  image_url TEXT,
  
  -- Metadata
  barcode TEXT,
  weight DECIMAL(10,2),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Junction Tables

```sql
-- Product to Elevator Types (Many-to-Many)
CREATE TABLE product_elevator_types (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  elevator_type_id UUID REFERENCES elevator_types(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, elevator_type_id)
)

-- Product to Collections (Many-to-Many)
CREATE TABLE collection_products (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  PRIMARY KEY (product_id, collection_id)
)
```

---

## Type Definitions

### CSV Row Type

```typescript
export interface CSVRow {
  // Product-level fields
  product_title: string
  short_description: string
  brief_description?: string
  application_slug: string
  category_slug: string
  subcategory_slug?: string
  elevator_types?: string // comma-separated
  collections?: string // comma-separated
  product_price: string
  product_mrp: string
  track_inventory?: string
  product_stock: string
  status?: string
  
  // Variant-level fields
  variant_title?: string
  variant_option_1_name?: string
  variant_option_1_value?: string
  variant_option_2_name?: string
  variant_option_2_value?: string
  variant_price?: string
  variant_mrp?: string
  variant_stock?: string
  
  // Metadata
  attributes?: string // JSON string
}
```

### Product Group Type

```typescript
export interface ProductGroup {
  // Product identification
  title: string
  slug: string
  
  // Product details
  description?: string
  short_description: string
  status: 'draft' | 'active'
  
  // Pricing & Inventory
  price: number
  compare_at_price?: number
  track_inventory: boolean
  stock_quantity: number
  
  // Catalog relationships (from CSV)
  application_slug: string
  category_slug: string
  subcategory_slug?: string
  elevator_type_slugs: string[]
  collection_slugs: string[]
  
  // Resolved IDs (after validation)
  application_id?: string
  category_id?: string
  subcategory_id?: string
  elevator_type_ids?: string[]
  collection_ids?: string[]
  
  // Variants
  variants: ProductVariant[]
  
  // Validation results
  errors: ValidationError[]
  warnings: ValidationError[]
}
```

### Validation Error Type

```typescript
export interface ValidationError {
  row: number
  field: string
  message: string
  details?: string
  severity: 'error' | 'warning'
}
```

---

## Core Utilities

### SKU Generator

**File:** `/src/lib/utils/sku-generator.ts`

#### Product SKU Generation

**Format:** `CED-{CATEGORY_CODE}-{AUTO_INCREMENT}`

**Algorithm:**
```typescript
1. Extract category code from category name
   - Take first 3-4 uppercase letters
   - Remove special characters
   - Example: "VVVF Motors" → "VVVF"

2. Query database for last SKU with this category code
   - Pattern: `CED-{CATEGORY_CODE}-%`
   - Order by SKU descending

3. Extract increment from last SKU
   - Parse numeric suffix
   - Increment by 1

4. Format with leading zeros
   - 6 digits: 000001, 000002, etc.

5. Return: CED-VVVF-000234
```

#### Variant SKU Generation

**Format:** `{PRODUCT_SKU}-{OPTION_VALUES}`

**Algorithm:**
```typescript
1. Start with product SKU: CED-VVVF-000234

2. If option1_value exists:
   - Clean value (uppercase, remove special chars)
   - Append: CED-VVVF-000234-1000KG

3. If option2_value exists:
   - Clean value
   - Append: CED-VVVF-000234-1000KG-415V

4. Return complete variant SKU
```

---

### SEO Generator

**File:** `/src/lib/utils/seo-generator.ts`

#### Slug Generation

```typescript
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')       // Remove leading/trailing hyphens
    .substring(0, 100)             // Limit length
}
```

#### Meta Title Generation

```typescript
function generateMetaTitle(productTitle: string): string {
  const suffix = ' | Cedar Elevator Components'
  const maxLength = 60
  const availableLength = maxLength - suffix.length
  
  let title = productTitle
  if (title.length > availableLength) {
    title = title.substring(0, availableLength - 3) + '...'
  }
  
  return title + suffix
}
```

#### Meta Description Generation

```typescript
function generateMetaDescription(
  productTitle: string,
  applicationName?: string,
  elevatorTypes?: string[]
): string {
  let description = `Buy ${productTitle}`
  
  if (applicationName) {
    description += ` for ${applicationName}`
  }
  
  if (elevatorTypes && elevatorTypes.length > 0) {
    const types = elevatorTypes.slice(0, 3).join(', ')
    description += `. Suitable for ${types}`
  }
  
  description += ' elevators. High-quality elevator components from Cedar Elevator Industries.'
  
  // Truncate if too long
  if (description.length > 160) {
    description = description.substring(0, 157) + '...'
  }
  
  return description
}
```

---

### Catalog Assignment

**File:** `/src/lib/utils/catalog-assignment.ts`

#### Catalog Reference Resolution

**Purpose:** Convert slugs to database IDs

**Algorithm:**
```typescript
1. Lookup Application
   - Query: categories table WHERE slug = {application_slug} AND parent_id IS NULL
   - If not found: Add blocking error

2. Lookup Category (requires application_id)
   - Query: categories table WHERE slug = {category_slug} AND parent_id = {application_id}
   - If not found: Add blocking error

3. Lookup Subcategory (optional, requires category_id)
   - Query: categories table WHERE slug = {subcategory_slug} AND parent_id = {category_id}
   - If not found: Add warning (non-blocking)

4. Lookup Elevator Types (comma-separated slugs)
   - Query: elevator_types table WHERE slug IN ({slugs})
   - If some not found: Add warning with missing slugs

5. Lookup Collections (optional, comma-separated slugs)
   - Query: collections table WHERE slug IN ({slugs})
   - If some not found: Add warning with missing slugs

6. Return CatalogLookupResult with IDs and errors
```

#### Draft Determination

```typescript
function shouldMarkAsDraft(lookupResult: CatalogLookupResult): boolean {
  // Product is marked as draft if:
  return !lookupResult.application_id || !lookupResult.category_id
}
```

---

### Import Fallbacks

**File:** `/src/lib/utils/import-fallbacks.ts`

#### Fallback Rules

1. **Price Fallback:**
   ```typescript
   variant.price = variant_price || product_price
   ```

2. **MRP Fallback:**
   ```typescript
   variant.compare_at_price = variant_mrp || product_mrp
   ```

3. **Stock Fallback:**
   ```typescript
   variant.stock = variant_stock || product_stock
   ```

4. **Image Fallback:**
   ```typescript
   variant.image = variant_image || product_image || '/images/product-placeholder.png'
   ```

5. **SKU Fallback:**
   ```typescript
   // Always auto-generate if missing
   variant.sku = variant_sku || generateVariantSKU(product_sku, options)
   ```

---

## Import Flow

### Complete Flow Diagram

```
┌──────────────────────────┐
│   1. User Uploads CSV      │
└───────────┬─────────────┘
            │
            v
┌───────────┴─────────────┐
│   2. Parse CSV (PapaParse)  │
└───────────┬─────────────┘
            │
            v
┌───────────┴─────────────┐
│   3. Validate Structure     │
│   - Required columns       │
│   - Field formats          │
└───────────┬─────────────┘
            │
            v
┌───────────┴─────────────┐
│   4. Group by product_title │
└───────────┬─────────────┘
            │
            v
┌───────────┴─────────────┐
│   5. Resolve Catalog Refs   │
│   - Applications           │
│   - Categories             │
│   - Elevator Types         │
│   - Collections            │
└───────────┬─────────────┘
            │
            v
┌───────────┴─────────────┐
│   6. Return Preview         │
│   - Product groups         │
│   - Errors & warnings      │
└───────────┬─────────────┘
            │
    [User Reviews & Confirms]
            │
            v
┌───────────┴─────────────┐
│   7. Execute Import         │
│   For each product:        │
│   a. Generate SKUs         │
│   b. Generate SEO          │
│   c. Insert product        │
│   d. Insert variants       │
│   e. Create relationships  │
└───────────┬─────────────┘
            │
            v
┌───────────┴─────────────┐
│   8. Return Results         │
│   - Created counts         │
│   - Errors (if any)        │
└──────────────────────────┘
```

---

## Error Handling

### Error Types

#### 1. Blocking Errors (Severity: 'error')

**Definition:** Errors that prevent import from proceeding.

**Examples:**
- Missing required fields
- Invalid application/category references
- Invalid pricing (non-numeric, zero, negative)
- Malformed JSON in attributes
- Product title too short (< 3 chars)

**User Action:** Must fix and re-upload CSV.

#### 2. Warnings (Severity: 'warning')

**Definition:** Non-critical issues with automatic fallbacks.

**Examples:**
- Missing optional fields (will use defaults)
- Invalid subcategory reference (will be null)
- Missing elevator types (product still imports)
- Invalid variant price (falls back to product price)

**User Action:** Can proceed with import or fix and re-upload.

### Error Response Structure

```typescript
interface ValidationError {
  row: number           // CSV row number (1-indexed)
  field: string         // Field name with error
  message: string       // User-friendly error message
  details?: string      // Technical details (optional)
  severity: 'error' | 'warning'
}
```

### Error Messages

**Guidelines:**
- Be specific about what's wrong
- Include row number for easy location
- Suggest solution when possible
- Use consistent terminology

**Examples:**
```typescript
// Good
{
  row: 5,
  field: 'application_slug',
  message: 'Application "motorz" not found. Did you mean "motors"?',
  severity: 'error'
}

// Bad
{
  row: 5,
  field: 'application_slug',
  message: 'Invalid value',
  severity: 'error'
}
```

---

## Testing

### Test Structure

```
/app
├── src/
│   ├── lib/utils/__tests__/
│   │   ├── sku-generator.test.ts
│   │   ├── seo-generator.test.ts
│   │   ├── catalog-assignment.test.ts
│   │   └── import-fallbacks.test.ts
│   └── app/api/admin/products/import/__tests__/
│       ├── template.test.ts
│       ├── preview.test.ts
│       └── execute.test.ts
└── e2e/
    ├── csv-import-flow.spec.ts
    └── csv-import-edge-cases.spec.ts
```

### Running Tests

```bash
# Unit tests (Jest)
pnpm test

# Unit tests (Vitest)
pnpm test:vitest

# E2E tests (Playwright)
pnpm test:e2e

# All tests
pnpm test:all

# Coverage
pnpm test:coverage
```

### Test Coverage Goals

- **Unit Tests:** 70% coverage
- **Integration Tests:** All API endpoints
- **E2E Tests:** Critical user flows

---

## Extension Points

### Future Enhancements (v2)

#### 1. Image URL Import

**Implementation:**
```typescript
// Add column to CSV
interface CSVRow {
  // ... existing fields
  product_image_url?: string
  variant_image_url?: string
}

// In execute route
if (row.product_image_url) {
  // Download and upload to CDN
  const uploadedUrl = await uploadImageFromUrl(row.product_image_url)
  productData.thumbnail = uploadedUrl
}
```

#### 2. Update Existing Products

**Implementation:**
```typescript
// Check if product exists by SKU or slug
const { data: existing } = await supabase
  .from('products')
  .select('id')
  .eq('slug', productSlug)
  .single()

if (existing) {
  // Update instead of insert
  await supabase
    .from('products')
    .update(productData)
    .eq('id', existing.id)
  
  result.productsUpdated++
} else {
  // Insert new
  result.productsCreated++
}
```

#### 3. Option3 Support

**Implementation:**
```typescript
// Add to CSV columns
variant_option_3_name?: string
variant_option_3_value?: string

// Add to database schema
ALTER TABLE product_variants 
ADD COLUMN option3_name TEXT,
ADD COLUMN option3_value TEXT

// Update SKU generation
function generateVariantSKU(
  productSKU: string,
  opt1?: string,
  opt2?: string,
  opt3?: string
): string {
  // ... existing logic
  if (opt3) {
    parts.push(cleaned(opt3))
  }
  return parts.join('-')
}
```

#### 4. Bulk Price Updates

**Implementation:**
```typescript
// New endpoint: POST /api/admin/products/import/update-prices
// CSV columns: sku, new_price, new_mrp

for (const row of rows) {
  await supabase
    .from('product_variants')
    .update({
      price: row.new_price,
      compare_at_price: row.new_mrp
    })
    .eq('sku', row.sku)
}
```

#### 5. Import Scheduling

**Implementation:**
```typescript
// Use background job queue (BullMQ, Inngest, etc.)
import { Queue } from 'bullmq'

const importQueue = new Queue('csv-import')

// Schedule import
await importQueue.add('import-products', {
  productGroups,
  userId,
  scheduledAt: new Date('2025-02-01 02:00:00')
}, {
  delay: calculateDelay(scheduledAt)
})
```

---

## Performance Considerations

### Optimization Strategies

1. **Batch Inserts:**
   ```typescript
   // Instead of individual inserts
   for (const variant of variants) {
     await supabase.from('product_variants').insert(variant)
   }
   
   // Use batch insert
   await supabase.from('product_variants').insert(variants)
   ```

2. **Parallel Processing:**
   ```typescript
   // Process product groups in parallel
   await Promise.all(
     productGroups.map(group => importProductGroup(supabase, group, result))
   )
   ```

3. **Database Indexing:**
   ```sql
   CREATE INDEX idx_products_slug ON products(slug)
   CREATE INDEX idx_products_sku ON products(sku)
   CREATE INDEX idx_variants_sku ON product_variants(sku)
   CREATE INDEX idx_categories_slug ON categories(slug)
   ```

4. **Caching:**
   ```typescript
   // Cache catalog lookups for duration of import
   const catalogCache = new Map<string, string>()
   
   function getCachedCategory(slug: string) {
     if (catalogCache.has(slug)) {
       return catalogCache.get(slug)
     }
     const id = await lookupCategory(slug)
     catalogCache.set(slug, id)
     return id
   }
   ```

---

## Security Considerations

### 1. Authentication

```typescript
// All API routes should verify admin authentication
import { getAuth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  const { userId } = await getAuth(request)
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Check admin role
  const user = await getUserById(userId)
  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }
  
  // ... rest of handler
}
```

### 2. File Upload Limits

```typescript
// In next.config.js
export default {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

// Validate file size in handler
if (file.size > 10 * 1024 * 1024) {
  return NextResponse.json(
    { error: 'File too large (max 10MB)' },
    { status: 413 }
  )
}
```

### 3. Input Sanitization

```typescript
// Sanitize all user inputs
import DOMPurify from 'isomorphic-dompurify'

const sanitizedTitle = DOMPurify.sanitize(row.product_title)
const sanitizedDescription = DOMPurify.sanitize(row.short_description)
```

### 4. Rate Limiting

```typescript
// Use rate limiting middleware
import { ratelimit } from '@/lib/redis'

const { success } = await ratelimit.limit(
  `import_${userId}`,
  10, // 10 requests
  '1 h' // per hour
)

if (!success) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  )
}
```

---

## Troubleshooting

### Common Issues

#### 1. Import Timeout

**Symptom:** Large CSV files timeout during import.

**Solution:**
- Increase serverless function timeout (Vercel: 60s max on Pro)
- Break CSV into smaller batches
- Implement background job queue

#### 2. Memory Issues

**Symptom:** Server runs out of memory with large files.

**Solution:**
- Stream CSV parsing instead of loading entire file
- Process in chunks
- Use worker threads for CPU-intensive operations

#### 3. Duplicate SKUs

**Symptom:** Unique constraint violation on SKU.

**Solution:**
- Add SKU uniqueness validation in preview
- Retry with incremented suffix on collision
- Check for race conditions in concurrent imports

---

## Support & Contributing

### Reporting Issues

1. Check existing documentation
2. Search GitHub issues
3. Create new issue with:
   - CSV file (sanitized)
   - Error messages
   - Expected vs actual behavior

### Contributing

1. Fork repository
2. Create feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit pull request

---

**Last Updated:** January 2025  
**Maintained By:** Cedar Elevator Industries Development Team
