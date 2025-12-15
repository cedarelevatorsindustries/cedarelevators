# Medusa Integration Guide

## Current State
The homepage currently uses demo data from `src/lib/data/demo-data.ts`. This guide explains how to replace it with real Medusa data.

## Step 1: Update Product Fetching

### Current (Demo):
```typescript
import { demoProducts, demoFavorites } from "@/lib/data/demo-data"
```

### Future (Medusa):
```typescript
import { listProducts } from "@/lib/data"

// In your component or page
const { response } = await listProducts({
  queryParams: { 
    limit: 20,
    fields: "+metadata" // Include metadata for favorites, etc.
  }
})
const products = response.products
```

## Step 2: Update Category Fetching

### Current (Demo):
```typescript
import { demoCategories } from "@/lib/data/demo-data"
```

### Future (Medusa):
```typescript
import { listCategories } from "@/lib/data"

const categories = await listCategories()
```

## Step 3: Add User-Specific Data

### Favorites/Wishlist
Create a new data fetcher in `src/lib/data/`:

```typescript
// src/lib/data/favorites.ts
export async function getUserFavorites(userId: string) {
  // Fetch from Medusa customer metadata or custom table
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
    credentials: "include",
  })
  const { customer } = await response.json()
  return customer.metadata?.favorites || []
}
```

### Recently Viewed
Store in browser localStorage or Medusa customer metadata:

```typescript
// src/lib/data/recently-viewed.ts
export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return []
  const viewed = localStorage.getItem("recently_viewed")
  return viewed ? JSON.parse(viewed) : []
}

export function addToRecentlyViewed(productId: string) {
  const viewed = getRecentlyViewed()
  const updated = [productId, ...viewed.filter(id => id !== productId)].slice(0, 10)
  localStorage.setItem("recently_viewed", JSON.stringify(updated))
}
```

## Step 4: Update Components

### ProductsTabContent.tsx
```typescript
// Before
import { demoFavorites, demoRecentlyViewed } from "@/lib/data/demo-data"

// After
import { listProducts } from "@/lib/data"
import { getUserFavorites, getRecentlyViewed } from "@/lib/data/favorites"

export default async function ProductsTabContent() {
  // Fetch all products
  const { response } = await listProducts({ queryParams: { limit: 50 } })
  
  // Get user-specific data
  const favoriteIds = await getUserFavorites(userId)
  const recentlyViewedIds = getRecentlyViewed()
  
  // Filter products
  const favorites = response.products.filter(p => favoriteIds.includes(p.id))
  const recentlyViewed = response.products.filter(p => recentlyViewedIds.includes(p.id))
  const bestSellers = response.products.filter(p => p.metadata?.isBestSeller)
  const newArrivals = response.products.filter(p => p.metadata?.isNew)
  
  // ... rest of component
}
```

### CategoriesTabContent.tsx
```typescript
// Before
import { demoCategories, demoApplications } from "@/lib/data/demo-data"

// After
import { listCategories } from "@/lib/data"

export default async function CategoriesTabContent() {
  const categories = await listCategories()
  
  // Applications can be stored as a special category type
  // or in Medusa metadata
  const applications = categories.filter(c => c.metadata?.type === "application")
  const regularCategories = categories.filter(c => !c.metadata?.type)
  
  // ... rest of component
}
```

### BusinessHubTabContent.tsx
```typescript
// Before
import { demoBusinessAnalytics, demoVerificationStatus } from "@/lib/data/demo-data"

// After
import { getBusinessAnalytics, getVerificationStatus } from "@/lib/data/business"

export default async function BusinessHubTabContent() {
  const analytics = await getBusinessAnalytics(userId)
  const verificationStatus = await getVerificationStatus(userId)
  
  // ... rest of component
}
```

## Step 5: Create Business Data Fetchers

```typescript
// src/lib/data/business.ts
export async function getBusinessAnalytics(userId: string) {
  // Fetch from Medusa orders and analytics
  const orders = await listOrders({ customer_id: userId })
  
  return {
    totalOrders: orders.length,
    pendingQuotes: orders.filter(o => o.status === "pending").length,
    monthlyRevenue: calculateMonthlyRevenue(orders),
    activeProducts: await getActiveProductCount(userId),
  }
}

export async function getVerificationStatus(userId: string) {
  // Fetch from custom verification table or customer metadata
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`)
  const { customer } = await response.json()
  
  return {
    isVerified: customer.metadata?.isVerified || false,
    status: customer.metadata?.verificationStatus || "pending",
    submittedDate: customer.metadata?.verificationDate,
    documentsRequired: customer.metadata?.requiredDocs || [],
  }
}
```

## Step 6: Update Page Component

```typescript
// src/app/(main)/page.tsx
export default async function HomePage() {
  const userType = await getUserType()
  
  // Fetch real data from Medusa
  const { response } = await listProducts({ queryParams: { limit: 20 } })
  const categories = userType !== "guest" ? await listCategories() : []
  
  // Extract testimonials from product metadata
  const testimonials = extractTestimonials(response.products)
  
  // Pass to templates (no changes needed here)
  if (userType !== "guest") {
    return <DesktopHomepageLoggedIn ... />
  }
  
  return <DesktopHomepage ... />
}
```

## Step 7: Add Product Metadata

In your Medusa admin, add these metadata fields to products:

- `isBestSeller`: boolean
- `isNew`: boolean
- `isFeatured`: boolean
- `testimonials`: array of testimonial objects

## Step 8: Testing Checklist

- [ ] Products load from Medusa
- [ ] Categories display correctly
- [ ] Favorites work for logged-in users
- [ ] Recently viewed tracks properly
- [ ] Business analytics calculate correctly
- [ ] Verification status displays
- [ ] Quote form submits to Medusa
- [ ] Images load from Medusa CDN
- [ ] Prices format correctly
- [ ] Links navigate properly

## Notes

- Keep demo data file for development/testing
- Add loading states for async data
- Handle errors gracefully
- Consider caching strategies for performance
- Use React Server Components for data fetching
- Add proper TypeScript types from @medusajs/types
