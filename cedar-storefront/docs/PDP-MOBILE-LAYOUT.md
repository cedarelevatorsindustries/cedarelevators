# PDP Mobile Layout - Visual Guide

## Mobile Layout Structure

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │ ← Transparent Overlay Header
│  │  [←]              [↗] [♡]   │   │   (z-index: 20)
│  └─────────────────────────────┘   │
│  ╔═══════════════════════════════╗ │ ← Dark Gradient Overlay
│  ║ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║ │   (z-index: 10)
│  ║ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║ │
│  ╚═══════════════════════════════╝ │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │      Product Image 1          │ │ ← Full-Screen Hero Carousel
│  │      (aspect-square)          │ │   (1:1 ratio)
│  │                               │ │
│  └───────────────────────────────┘ │
│           ● ○ ○ ○                  │ ← Dot Indicators
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐ │
│  │ 18% OFF  In Stock             │ │ ← Badges
│  ├───────────────────────────────┤ │
│  │ Premium Elevator Control      │ │ ← Title
│  │ Panel - Model CP-2000         │ │
│  ├───────────────────────────────┤ │
│  │ ★★★★★ 4.8 (127)              │ │ ← Rating
│  ├───────────────────────────────┤ │
│  │ ₹45,000  ₹55,000             │ │ ← Price
│  │ Save ₹10,000 (18%)            │ │
│  ├───────────────────────────────┤ │
│  │ Select Variant                │ │ ← Variants
│  │ [Standard] [Pro] [Enterprise] │ │
│  ├───────────────────────────────┤ │
│  │ [🚚] [🛡️] [🔄]               │ │ ← Features
│  ├───────────────────────────────┤ │
│  │ Need Bulk Quantity?           │ │ ← Request Quote
│  │ [Request Quote]               │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│  Description                        │
│  Specifications                     │
│  Resources                          │
│  Testimonials                       │
│  FAQ                                │
│  Frequently Bought                  │
│  Related Products                   │
└─────────────────────────────────────┘
```

## Header Overlay Details

### Transparent Header (Top)
```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │
│  │ [←]              [↗] [♡]    │   │ ← Buttons with backdrop-blur
│  │  Back           Share Heart │   │   bg-black/30 backdrop-blur-sm
│  └─────────────────────────────┘   │
│  ╔═══════════════════════════════╗ │
│  ║ Dark Gradient (rgba 0.6→0)   ║ │ ← Ensures text visibility
│  ╚═══════════════════════════════╝ │
│                                     │
│         Product Image               │
│                                     │
└─────────────────────────────────────┘
```

### Button Styles
```css
/* Back Button */
.p-2 .bg-black/30 .backdrop-blur-sm .rounded-lg
.hover:bg-black/40

/* Share & Wishlist Buttons */
.p-2 .bg-black/30 .backdrop-blur-sm .rounded-lg
.hover:bg-black/40

/* Icon Color */
.text-white
```

## Image Carousel

### Full-Screen Layout
```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │                                 │ │
│ │        Image 1 (1:1)            │ │ ← aspect-square
│ │                                 │ │   w-full h-full
│ │                                 │ │   object-cover
│ └─────────────────────────────────┘ │
│            ● ○ ○ ○                  │ ← Indicators
└─────────────────────────────────────┘
  ← Swipe →
```

### Scroll Behavior
- Horizontal scroll with snap points
- `snap-x snap-mandatory`
- `scrollbar-hide`
- Smooth scroll to specific image on indicator click

## Product Info Section

### Compact Mobile Layout
```
┌─────────────────────────────────────┐
│ Badges Row                          │ ← Horizontal flex
│ [18% OFF] [In Stock]                │
├─────────────────────────────────────┤
│ Title (text-xl font-bold)           │ ← Larger on mobile
│ Premium Elevator Control Panel      │
├─────────────────────────────────────┤
│ ★★★★★ 4.8 (127)                    │ ← Rating inline
├─────────────────────────────────────┤
│ ₹45,000  ₹55,000                   │ ← Price prominent
│ Save ₹10,000                        │
├─────────────────────────────────────┤
│ Select Variant                      │
│ ┌─────┐ ┌─────┐ ┌─────┐           │ ← 3-column grid
│ │Std  │ │Pro  │ │Ent  │           │
│ │₹45k │ │₹55k │ │₹75k │           │
│ └─────┘ └─────┘ └─────┘           │
├─────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐           │ ← Features grid
│ │ 🚚  │ │ 🛡️  │ │ 🔄  │           │
│ │Free │ │2 Yr │ │Easy │           │
│ └─────┘ └─────┘ └─────┘           │
├─────────────────────────────────────┤
│ Need Bulk Quantity?                 │ ← Request quote
│ Get special pricing                 │
│ [Request Quote Button]              │
└─────────────────────────────────────┘
```

## No Bottom Navigation

### Mobile Navigation
```
┌─────────────────────────────────────┐
│ [Transparent Header with Back]      │ ← Only header visible
│                                     │
│         Product Content             │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
  (No Bottom Nav)                       ← Clean, focused experience
```

## Responsive Breakpoints

### Mobile (< 768px)
- Full-screen hero carousel
- Transparent overlay header
- No bottom navigation
- Vertical stack layout
- Touch-optimized spacing

### Desktop (≥ 768px)
- Two-column layout
- Solid back navigation bar
- Image gallery with thumbnails
- Hover zoom on images
- Desktop spacing

## Color Scheme

### Overlay Colors
```css
/* Header Buttons */
background: rgba(0, 0, 0, 0.3)
backdrop-filter: blur(4px)
hover: rgba(0, 0, 0, 0.4)

/* Gradient Overlay */
background: linear-gradient(
  to bottom,
  rgba(0, 0, 0, 0.6) 0%,
  rgba(0, 0, 0, 0.4) 50%,
  transparent 100%
)

/* Text on Overlay */
color: white
```

### Product Info
```css
/* Background */
background: white

/* Badges */
orange: bg-orange-100 text-orange-600
green: bg-green-100 text-green-600
blue: bg-blue-100 text-blue-600

/* Price */
current: text-gray-900 (3xl font-bold)
original: text-gray-400 line-through
savings: text-green-600
```

## Spacing

### Mobile
```css
/* Hero Carousel */
padding: 0 (full-width)
margin: 0

/* Product Info */
padding: 1rem (px-4 py-4)
margin: -1rem (to extend to edges)

/* Sections */
padding: 1rem
gap: 1rem
```

### Desktop
```css
/* Container */
max-width: 1400px
padding: 2rem (px-8 py-8)

/* Grid Gap */
gap: 1rem (gap-4)

/* Sections */
gap: 2rem (space-y-8)
```

## Z-Index Layers

```
Layer 3: Header Buttons (z-20)
Layer 2: Dark Gradient (z-10)
Layer 1: Product Images (z-0)
```

## Comparison: Before vs After

### Before (Separate Mobile Components)
```
Mobile:
- Separate mobile header component
- Separate mobile carousel component
- Separate mobile info component
- Separate mobile sticky bottom
- Bottom navigation always visible
- Smaller images

Desktop:
- Desktop sections
- Two-column layout
```

### After (Responsive Sections)
```
Mobile:
- Transparent overlay header (inline)
- Full-screen carousel (inline)
- Responsive product info (reused sections)
- No bottom navigation
- Immersive experience

Desktop:
- Same sections, different layout
- Two-column layout
- All features preserved
```

## Benefits Summary

✅ **Consistency** - Same header as homepage
✅ **Simplicity** - One set of components
✅ **Performance** - Less code to load
✅ **UX** - Immersive mobile experience
✅ **Maintainability** - Single source of truth

---

**Version:** 4.0.0
**Last Updated:** December 7, 2025
