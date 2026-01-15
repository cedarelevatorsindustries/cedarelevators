# Banner Management Guide

**Cedar Elevators E-commerce Platform**  
**Last Updated:** Current Session

---

## 📌 Philosophy Overview

### What Banners ARE
Banners in Cedar Elevators are **navigation surfaces** and **context providers**, NOT promotional assets. They serve two distinct purposes:

1. **All Products Carousel** (Banner Management)
   - Purpose: Discovery navigation on homepage
   - Behavior: Interactive carousel (3-5 slides)
   - Click Action: ✅ Links to Applications, Categories, Elevator Types, or Collections
   - Managed In: Admin → Banners

2. **Entity Page Headers** (Entity Modules)
   - Purpose: Visual identity and context
   - Behavior: Static banner (non-clickable)
   - Click Action: ❌ No click - provides context only
   - Managed In: Respective entity modules (Categories, Elevator Types, Collections)

### What Banners Are NOT
- ❌ Campaign/promotional banners
- ❌ Discount or offer announcements
- ❌ Product picker interfaces
- ❌ Marketing assets requiring frequent updates

---

## 🎯 The Two Banner Contexts

| Context | Purpose | Clickable | Managed In | Example Use |
|---------|---------|-----------|------------|-------------|
| **All Products Carousel** | Discovery & Navigation | ✅ Yes | Banner Management | "Shop Installation Components" → Application |
| **Category Page** | Visual Identity | ❌ No | Category Module | Category header showing parts for a specific category |
| **Application Page** | Visual Identity | ❌ No | Category Module (application type) | Application header for "Residential" |
| **Elevator Type Page** | Visual Identity | ❌ No | Elevator Type Module | Type header for "Passenger Elevator" |
| **Collection Page** | Visual Identity | ❌ No | Collection Module | Collection header for "Common Spare Parts" |

---

## 🚀 Using Banner Management

### When to Use Banner Management

Use Banner Management **only** for:
- Homepage carousel banners
- Discovery navigation to help users find products
- Cross-context promotional entry points

### Creating a Carousel Banner

1. **Navigate:** Admin → Banners → Create Banner
2. **Fill Required Fields:**
   - **Internal Name:** For admin reference (e.g., "Summer Sale - Homepage Hero")
   - **Title:** Main headline shown to users
   - **Subtitle:** (Optional) Supporting text
   - **Image:** Wide banner image (recommended: 1920x1080px, aspect ratio 16:9)
   - **CTA Text:** Button text (e.g., "Shop Now", "View Products") - **Required**
   - **Link Type:** Choose what the banner links to:
     - Application (e.g., Residential, Commercial)
     - Category (e.g., Motors, Doors)
     - Elevator Type (e.g., Passenger, Freight)
     - Collection (e.g., Best Sellers, New Arrivals)
   - **Link ID:** The UUID of the selected entity
   - **Position:** Sort order (lower numbers appear first)
   - **Start/End Dates:** (Optional) Schedule the banner

3. **Save:** Click "Publish Banner" or "Save as Draft"

### Best Practices

- **Keep 3-5 active banners** in the carousel for optimal user experience
- **Use high-quality images** with clear focal points
- **Write clear CTA text** that indicates the destination
- **Test link destinations** to ensure they work correctly
- **Schedule seasonal banners** using start/end dates
- **Monitor performance** (if analytics enabled) to optimize

### Image Specifications

| Aspect | Specification |
|--------|---------------|
| Recommended Size | 1920x1080px |
| Aspect Ratio | 16:9 |
| Format | JPEG or PNG |
| Max File Size | 2MB (optimized for web) |
| Mobile Image | (Optional) Separate image for mobile devices |

---

## 🎨 Managing Entity Banners

### When to Use Entity Banners

Use entity banners for:
- Visual identity at the top of category/application/type/collection pages
- Providing context about what the page contains
- Creating a consistent visual experience

### Adding Banners to Entities

#### For Categories

1. **Navigate:** Admin → Categories → [Select Category] → Edit
2. **Find "Visual Identity" Section**
3. **Upload Images:**
   - **Thumbnail Image:** Square image for cards and grids (400x400px)
   - **Banner Image:** Wide banner for page header (1920x400px, optional)
4. **Save Changes**

The banner will automatically appear at the top of the category page as a static, non-clickable header.

#### For Elevator Types

1. **Navigate:** Admin → Elevator Types → [Select Type] → Edit
2. **Find "Visual Identity" Section**
3. **Upload Images:**
   - **Icon/Thumbnail:** Icon or thumbnail for type cards
   - **Banner Image:** Wide banner for type page header (optional)
4. **Save Changes**

#### For Collections

1. **Navigate:** Admin → Collections → [Select Collection] → Edit
2. **Find "Visual Identity" Section**
3. **Upload Images:**
   - **Thumbnail Image:** Square image for collection cards (400x400px)
   - **Banner Image:** Wide banner for collection page header (1920x400px, optional)
4. **Save Changes**

### Entity Banner Specifications

| Field | Purpose | Recommended Size | Required |
|-------|---------|------------------|----------|
| Thumbnail | Cards, grids, filters | 400x400px | Recommended |
| Banner | Page header (non-clickable) | 1920x400px | Optional |

---

## 🔍 Decision Tree: Where to Edit Banners

### Question: Where do I want the banner to appear?

```
┌─ Homepage / All Products Page?
│  └─ YES → Use Banner Management
│     • Create carousel banner
│     • Set link destination
│     • Add CTA button
│
└─ Category/Application/Type/Collection Page?
   └─ YES → Use Entity Module
      • Edit the specific entity
      • Go to "Visual Identity"
      • Upload banner image
      • Banner will be non-clickable
```

---

## 💡 Common Scenarios

### Scenario 1: Promote New Product Line
**Goal:** Drive users to view new passenger elevator parts

**Solution:** Create carousel banner in Banner Management
- Title: "New Passenger Elevator Parts"
- Link Type: Elevator Type
- Link ID: [Passenger Elevator Type ID]
- CTA: "View Parts"

### Scenario 2: Improve Category Visual Identity
**Goal:** Make "Motors" category page more visually appealing

**Solution:** Edit category in Category Module
- Upload banner image showing motor products
- Banner appears as page header (non-clickable)
- Users see visual context when browsing motors

### Scenario 3: Highlight Seasonal Collection
**Goal:** Promote "Winter Maintenance Kits" collection

**Solution:** Create carousel banner in Banner Management
- Title: "Winter Maintenance Essentials"
- Link Type: Collection
- Link ID: [Winter Kits Collection ID]
- CTA: "Shop Now"
- Schedule: Start/End dates for winter season

---

## 🚨 Common Mistakes to Avoid

### ❌ Mistake 1: Creating Category Banners in Banner Management
**Why it's wrong:** Creates duplication - the banner would need to be updated in two places when the category changes.

**Correct approach:** Edit the category directly and upload its banner image.

### ❌ Mistake 2: Using Entity Thumbnails as Banners
**Why it's wrong:** Different aspect ratios and use cases - thumbnails are square, banners are wide.

**Correct approach:** Upload both thumbnail (for cards) and banner (for headers) separately.

### ❌ Mistake 3: Making Entity Banners Clickable
**Why it's wrong:** Entity banners provide context, not navigation. Users are already on the page.

**Correct approach:** Use entity banners for visual identity only. Use carousel banners for navigation.

### ❌ Mistake 4: Too Many Carousel Banners
**Why it's wrong:** Carousel becomes slow and confusing with 10+ banners.

**Correct approach:** Keep 3-5 active carousel banners maximum. Archive or schedule old ones.

---

## 📊 Banner Analytics (If Enabled)

### Metrics to Track

- **Click-Through Rate (CTR):** Percentage of users who click carousel banners
- **Conversion Rate:** Percentage of clicks that lead to purchases
- **Position Performance:** Which carousel position performs best
- **Link Destination Performance:** Which entity types get most clicks

### Optimization Tips

- Test different CTA texts
- Try different banner positions
- A/B test image styles
- Analyze peak traffic times for scheduling

---

## 🛠️ Technical Details

### Database Structure

**Banners Table:**
- `placement`: Always `'hero-carousel'` for managed banners
- `link_type`: `'application' | 'category' | 'elevator-type' | 'collection'`
- `link_id`: UUID of the linked entity
- `cta_text`: Required for carousel banners
- `is_active`: Toggle visibility
- `position`: Sort order
- `start_date` / `end_date`: Scheduling

**Entity Tables (categories, elevator_types, collections):**
- `thumbnail_image`: Square image for cards/grids
- `banner_image`: Wide banner for page headers

### Storage Buckets

- `banners/`: Carousel banner images
- `categories/`: Category images
- `elevator-types/`: Elevator type images
- `collections/`: Collection images

---

## 📝 Quick Reference

### Carousel Banner Checklist
- [ ] Internal name set
- [ ] Title and subtitle written
- [ ] Image uploaded (1920x1080px)
- [ ] CTA text provided
- [ ] Link type selected
- [ ] Link ID verified
- [ ] Position set
- [ ] Active status toggled on
- [ ] Preview checked

### Entity Banner Checklist
- [ ] Entity edited (not Banner Management)
- [ ] Thumbnail uploaded (400x400px)
- [ ] Banner uploaded (1920x400px, optional)
- [ ] Images preview correctly
- [ ] Changes saved

---

## 🆘 Troubleshooting

### Banner Not Showing on Homepage
1. Check if banner is active (`is_active = true`)
2. Verify start/end dates (if set)
3. Check browser cache (hard refresh: Ctrl+Shift+R)
4. Confirm at least one active carousel banner exists

### Entity Banner Not Showing
1. Verify image uploaded to correct field (`banner_image`, not `image_url`)
2. Check if entity is active
3. Clear cache and refresh page
4. Verify image URL is accessible

### Link Not Working
1. Confirm `link_id` is a valid UUID
2. Check that linked entity exists and is active
3. Test link manually: `/catalog?type=[link_id]`
4. Verify link_type matches entity type

---

## 📞 Need Help?

- **Admin Panel Issues:** Contact system administrator
- **Image Sizing:** Use online tools like TinyPNG or Squoosh
- **Banner Strategy:** Review analytics and user behavior
- **Technical Questions:** Check `/docs/ARCHITECTURE.md`

---

**Remember:** Banners are navigation and context, not promotions. Keep them simple, clear, and purpose-driven.
