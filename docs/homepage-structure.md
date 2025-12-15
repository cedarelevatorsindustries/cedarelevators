# Homepage Structure Documentation

## Overview
The homepage has been restructured to support different views for guest users and logged-in users (individual and business).

## Guest Homepage (Desktop)
**Location:** `src/modules/home/templates/desktop-homepage-template.tsx`

**Sections (in order):**
1. Hero Section - Full hero banner
2. Categories - Quick category navigation
3. Featured Products - Highlighted products
4. Shop by Application - Application-based browsing
5. Why Cedar - Value propositions
6. Quote/Bulk Order - CTA section
7. Testimonials - Customer reviews

## Logged-In Homepage (Desktop)
**Location:** `src/modules/home/templates/desktop-homepage-logged-in-template.tsx`

**Common Sections (all tabs):**
- Hero Lite - Compact hero banner
- Welcome Section - Personalized greeting with quick stats

**Tab-Based Content:**

### For Individual Users (2 tabs):
1. **Products Tab**
   - Your Favorites
   - Recently Viewed Products
   - Recommended Products
   - Best Sellers
   - New Arrivals

2. **Categories Tab**
   - List of Categories
   - Shop by Application (Elevator Types)
   - Trending Products

### For Business Users (3 tabs):
1. **Products Tab** (same as individual)
2. **Categories Tab** (same as individual)
3. **Business Hub Tab**
   - Verification Status Card
   - Business Analytics Dashboard
   - Order History
   - Quote Request Form
   - Exclusive Business Products

## Component Structure

### New Components Created:
- `src/modules/home/components/tab-navigation.tsx` - Reusable tab navigation component
- `src/modules/home/sections/desktop/ProductsTabContent.tsx` - Products tab content
- `src/modules/home/sections/desktop/CategoriesTabContent.tsx` - Categories tab content
- `src/modules/home/sections/desktop/BusinessHubTabContent.tsx` - Business hub tab content

### Demo Data:
- `src/lib/data/demo-data.ts` - Contains all demo data for products, categories, applications, analytics, etc.
- Uses images from `/public/products/` directory

## Data Flow
Currently using demo data from `src/lib/data/demo-data.ts`. To connect with Medusa:
1. Replace demo data imports with Medusa API calls
2. Update product/category interfaces to match Medusa types
3. Add proper data fetching in the page component

## Styling
- Uses Tailwind CSS for all styling
- Responsive design with mobile-first approach
- Consistent color scheme (blue primary, gray neutrals)
- Hover effects and transitions for better UX

## Future Enhancements
- Connect to Medusa backend for real data
- Add loading states and error handling
- Implement favorites/wishlist functionality
- Add product filtering and sorting
- Implement real quote submission
- Add analytics tracking
