# PDP Demo Data - Testing Guide

## How to Access Demo Product

### URLs that Show Demo Data

1. **Primary Demo URL:**
   ```
   http://localhost:3000/products/demo
   ```

2. **Alternative Demo URLs:**
   ```
   http://localhost:3000/products/demo-control-panel
   http://localhost:3000/products/demo-anything
   http://localhost:3000/products/demo-test
   ```

Any URL that starts with `/products/demo` or `/products/demo-*` will show the demo product data.

## What to Expect

### Demo Product Details

**Product Name:** Premium Elevator Control Panel - Model CP-2000

**Key Features:**
- 4 product images (carousel)
- Price: ₹45,000 (discounted from ₹55,000)
- 18% discount badge
- In Stock badge
- Rating: 4.8 stars (127 reviews)
- 3 variants: Standard, Pro, Enterprise

**Sections Included:**
1. ✅ Hero image carousel (mobile full-screen)
2. ✅ Product title and badges
3. ✅ Short description
4. ✅ Pricing with discount
5. ✅ Variant selector
6. ✅ CTA buttons (Add to Cart, Request Quote)
7. ✅ Detailed description with 8 features
8. ✅ Technical specifications (9 specs)
9. ✅ Downloadable resources (4 PDFs)
10. ✅ Customer testimonials (3 testimonials)
11. ✅ FAQ section (5 questions)
12. ✅ Frequently bought together (3 products)
13. ✅ Related products (4 products)
14. ✅ Customer reviews (5 reviews)

## Visual Checklist

### Mobile View (< 768px)

#### Header
- [ ] Transparent overlay header visible
- [ ] Back button (left) with white icon
- [ ] Share button (right) with white icon
- [ ] Wishlist button (right) with white icon
- [ ] Dark gradient overlay for visibility
- [ ] Buttons have backdrop blur effect

#### Hero Carousel
- [ ] Full-screen images (aspect-square)
- [ ] Images fill entire width
- [ ] Horizontal scroll works
- [ ] Snap to each image
- [ ] Dot indicators at bottom
- [ ] Active dot is longer (w-6)
- [ ] Inactive dots are small (w-1.5)
- [ ] Clicking dot scrolls to image

#### Product Info
- [ ] White background section
- [ ] Badges row (18% OFF, In Stock)
- [ ] Product title (text-xl)
- [ ] Rating stars with count
- [ ] Price in large text (₹45,000)
- [ ] Original price crossed out
- [ ] Savings amount shown
- [ ] Variant selector (3 columns)
- [ ] Feature icons (3 columns)
- [ ] Request quote card

#### Navigation
- [ ] No bottom navigation visible
- [ ] Sidebar accessible via hamburger (if visible)
- [ ] Back button works
- [ ] Share button works

### Desktop View (≥ 768px)

#### Header
- [ ] Solid white back navigation bar
- [ ] "Back to Products" link visible
- [ ] Navbar becomes solid on scroll

#### Layout
- [ ] Two-column layout
- [ ] Left: Image gallery with thumbnails
- [ ] Right: Product info
- [ ] Thumbnails on left side (vertical)
- [ ] Main image with hover zoom
- [ ] All sections below in single column

## Testing Steps

### 1. Basic Navigation
```bash
# Start the development server
cd cedar-storefront
pnpm dev

# Open browser
http://localhost:3000/products/demo
```

### 2. Mobile Testing
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device (iPhone 12 Pro)
4. Refresh page

**Check:**
- [ ] Full-screen hero images
- [ ] Transparent header overlay
- [ ] Swipe carousel works
- [ ] No bottom nav
- [ ] All sections scroll smoothly

### 3. Desktop Testing
1. Resize browser to > 768px width
2. Refresh page

**Check:**
- [ ] Two-column layout
- [ ] Image gallery with thumbnails
- [ ] Hover zoom on main image
- [ ] Back navigation bar
- [ ] All sections visible

### 4. Responsive Testing
1. Slowly resize browser from mobile to desktop
2. Watch layout transitions

**Check:**
- [ ] No layout breaks
- [ ] Smooth transitions
- [ ] Content remains readable
- [ ] Images scale properly

### 5. Interaction Testing

#### Mobile
- [ ] Swipe carousel left/right
- [ ] Tap dot indicators
- [ ] Tap back button
- [ ] Tap share button
- [ ] Tap wishlist button
- [ ] Select variant
- [ ] Tap "Add to Cart"
- [ ] Tap "Request Quote"

#### Desktop
- [ ] Click thumbnail images
- [ ] Hover over main image (zoom)
- [ ] Click back link
- [ ] Select variant
- [ ] Click "Add to Cart"
- [ ] Click "Request Quote"

## Troubleshooting

### Issue: Demo data not showing

**Check:**
1. URL is correct (`/products/demo`)
2. Server is running (`pnpm dev`)
3. No console errors (F12)
4. Demo data file exists: `src/lib/data/demo-pdp-data.ts`

**Solution:**
```bash
# Restart dev server
cd cedar-storefront
pnpm dev
```

### Issue: Images not loading

**Check:**
1. Images exist in `/public/products/` folder
2. Image paths in demo data are correct
3. No 404 errors in Network tab

**Solution:**
Verify image paths in `demo-pdp-data.ts`:
```typescript
thumbnail: "/products/commercial_elevators.webp"
images: [
  { url: "/products/commercial_elevators.webp" },
  // ...
]
```

### Issue: Transparent header not showing

**Check:**
1. Layout file exists: `src/app/(main)/products/layout.tsx`
2. Navbar config is correct
3. CSS is loaded

**Solution:**
Verify layout file passes config:
```typescript
<LayoutWrapper customConfig={navbarConfig['product-detail']}>
```

### Issue: Bottom nav still visible on mobile

**Check:**
1. Navbar config has `showBottomNav: false`
2. Layout wrapper is using custom config
3. CSS classes are correct

**Solution:**
Check `navbar/config.ts`:
```typescript
'product-detail': {
  mobile: {
    showBottomNav: false,
  }
}
```

## Expected Console Output

### No Errors
```
✓ Ready in 2.5s
○ Compiling /products/[handle] ...
✓ Compiled /products/[handle] in 1.2s
```

### Demo Data Loaded
```javascript
// In browser console
console.log("Demo product loaded:", product.title)
// Output: "Premium Elevator Control Panel - Model CP-2000"
```

## Comparison: Demo vs Real Product

| Feature | Demo Product | Real Product |
|---------|--------------|--------------|
| URL | `/products/demo` | `/products/actual-handle` |
| Data Source | `demo-pdp-data.ts` | Medusa API |
| Images | Static files | Medusa CDN |
| Variants | Mock data | Real variants |
| Price | Mock price | Real price |
| Reviews | Mock reviews | Real reviews |

## Quick Verification Commands

### Check if demo data file exists
```bash
ls cedar-storefront/src/lib/data/demo-pdp-data.ts
```

### Check if layout file exists
```bash
ls cedar-storefront/src/app/(main)/products/layout.tsx
```

### Check if page file is correct
```bash
grep -n "getDemoPDPData" cedar-storefront/src/app/(main)/products/[handle]/page.tsx
```

## Success Criteria

✅ Demo product loads at `/products/demo`
✅ All 4 images visible in carousel
✅ Transparent header on mobile
✅ No bottom nav on mobile
✅ Two-column layout on desktop
✅ All sections render correctly
✅ No console errors
✅ Smooth scrolling and interactions

---

**Last Updated:** December 7, 2025
**Version:** 1.0.0
