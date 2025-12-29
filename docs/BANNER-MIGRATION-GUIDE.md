# Banner Migration Guide

**Cedar Elevators E-commerce Platform**  
**Migration:** Legacy Banner System → New Banner Philosophy  
**Created:** Current Session

---

## 🎯 Migration Overview

This guide helps migrate from the old banner system (where categories/applications/collections had banners in Banner Management) to the new philosophy (where entity banners are managed in their respective modules).

---

## 📋 Pre-Migration Checklist

Before starting migration:

- [ ] **Backup database** (CRITICAL)
- [ ] **Document existing banners** and their placements
- [ ] **SQL migrations executed** (`009_add_entity_banner_images.sql`)
- [ ] **Code updated** to latest version with new banner philosophy
- [ ] **Test environment verified** to work correctly
- [ ] **Stakeholders informed** about banner management changes

---

## 🗂️ Understanding What Changed

### Old System

```
Banner Management
├── Homepage Carousel
├── Category Headers (❌ Problem: Duplication)
├── Application Headers (❌ Problem: Duplication)
├── Collection Headers (❌ Problem: Duplication)
└── Announcement Bars (❌ Problem: Out of scope)
```

### New System

```
Banner Management
└── Homepage Carousel ONLY (✅ Single source of truth)

Categories Module
└── Visual Identity → banner_image (✅ Entity owns its visual assets)

Elevator Types Module
└── Visual Identity → banner_image (✅ Entity owns its visual assets)

Collections Module
└── Visual Identity → banner_image (✅ Entity owns its visual assets)
```

---

## 🔄 Migration Steps

### Step 1: Audit Existing Banners

Run this SQL query to identify all banners:

```sql
SELECT 
  id,
  title,
  internal_name,
  placement,
  target_type,
  target_id,
  image_url,
  is_active
FROM banners
ORDER BY placement, position;
```

**Export results to CSV for reference.**

### Step 2: Categorize Banners

Separate banners into two groups:

**Group A: Keep in Banner Management (Homepage Carousel)**
- `placement = 'hero-carousel'` or `'all-products-carousel'`
- Cross-context navigation banners
- Discovery-focused banners

**Group B: Migrate to Entity Modules**
- `placement = 'category-header'` → Move to categories
- `placement = 'application-header'` → Move to categories (application type)
- `placement = 'collection-banner'` → Move to collections
- `placement = 'announcement-bar'` → Decision needed (archive or repurpose)

### Step 3: Migrate Category/Application Banners

For each banner in Group B with `placement = 'category-header'` or `'application-header'`:

```sql
-- Example: Migrate category banner
UPDATE categories
SET banner_image = (
  SELECT image_url 
  FROM banners 
  WHERE target_type = 'category' 
    AND target_id = categories.id
    AND placement IN ('category-header', 'application-header')
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 
  FROM banners 
  WHERE target_type = 'category' 
    AND target_id = categories.id
    AND placement IN ('category-header', 'application-header')
);
```

**Verify:**
```sql
SELECT id, name, banner_image
FROM categories
WHERE banner_image IS NOT NULL;
```

### Step 4: Migrate Collection Banners

```sql
-- Migrate collection banners
UPDATE collections
SET banner_image = (
  SELECT image_url 
  FROM banners 
  WHERE target_type = 'collection' 
    AND target_id = collections.id
    AND placement = 'collection-banner'
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 
  FROM banners 
  WHERE target_type = 'collection' 
    AND target_id = collections.id
    AND placement = 'collection-banner'
);
```

**Verify:**
```sql
SELECT id, title, banner_image
FROM collections
WHERE banner_image IS NOT NULL;
```

### Step 5: Migrate Elevator Type Banners (if applicable)

If elevator types had banners in the old system:

```sql
-- Migrate elevator type banners
UPDATE elevator_types
SET banner_image = (
  SELECT image_url 
  FROM banners 
  WHERE target_type = 'elevator-type' 
    AND target_id = elevator_types.id
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 
  FROM banners 
  WHERE target_type = 'elevator-type' 
    AND target_id = elevator_types.id
);
```

### Step 6: Clean Up Old Banners

**⚠️ IMPORTANT: Only run after verifying migrations were successful!**

```sql
-- Archive non-carousel banners (soft delete approach)
UPDATE banners
SET 
  is_active = false,
  internal_name = 'MIGRATED: ' || internal_name
WHERE placement NOT IN ('hero-carousel', 'all-products-carousel');
```

**Or, if you prefer hard delete (after backup!):**

```sql
-- Delete migrated banners
DELETE FROM banners
WHERE placement NOT IN ('hero-carousel', 'all-products-carousel');
```

### Step 7: Update Carousel Banners

Ensure all remaining carousel banners have correct fields:

```sql
-- Update carousel banners to use new fields
UPDATE banners
SET 
  link_type = target_type,
  link_id = target_id,
  placement = 'hero-carousel'
WHERE placement = 'all-products-carousel'
   OR placement IS NULL;

-- Verify all carousel banners have CTA text
SELECT id, title, cta_text
FROM banners
WHERE placement = 'hero-carousel'
  AND (cta_text IS NULL OR cta_text = '');
```

**Fix missing CTA text manually in the admin panel.**

---

## ✅ Post-Migration Validation

### 1. Verify Homepage Carousel

- [ ] Homepage loads without errors
- [ ] Carousel displays active banners
- [ ] Each banner links to correct destination
- [ ] CTA buttons work correctly
- [ ] Auto-rotation works (if enabled)

### 2. Verify Category Pages

Test a sample of categories:

- [ ] Category page loads
- [ ] Banner image displays at top (if uploaded)
- [ ] Banner is non-clickable
- [ ] Falls back to simple header if no banner
- [ ] Products display correctly below banner

```sql
-- Get categories with banners for testing
SELECT id, name, slug, banner_image
FROM categories
WHERE banner_image IS NOT NULL
LIMIT 5;
```

### 3. Verify Elevator Type Pages

- [ ] Type page loads
- [ ] Banner displays (if exists)
- [ ] Type information correct
- [ ] Products filtered correctly

### 4. Verify Collection Pages

- [ ] Collection page loads
- [ ] Banner displays (if exists)
- [ ] Products in collection correct
- [ ] Collection metadata displays

### 5. Verify Admin Panel

- [ ] Banner Management only shows carousel banners
- [ ] No legacy placement options visible
- [ ] Entity edit forms have "Visual Identity" section
- [ ] Image upload works for entities
- [ ] Philosophy card displays correctly

---

## 🐛 Troubleshooting

### Issue: Banners not showing on entity pages

**Diagnosis:**
```sql
SELECT id, name, banner_image, thumbnail_image
FROM categories
WHERE id = '[CATEGORY_ID]';
```

**Solutions:**
1. Verify `banner_image` field populated
2. Check image URL is accessible
3. Clear application cache
4. Check frontend component rendering logic

### Issue: Duplicate banners appearing

**Diagnosis:**
```sql
SELECT COUNT(*), target_id, target_type
FROM banners
WHERE is_active = true
GROUP BY target_id, target_type
HAVING COUNT(*) > 1;
```

**Solution:** Manually review and deactivate duplicates

### Issue: Migration script failed

**Solution:**
1. Restore from backup
2. Review SQL error messages
3. Check for:
   - Missing foreign key constraints
   - Null values in required fields
   - Data type mismatches
4. Run migration in smaller batches

---

## 🔙 Rollback Plan

If migration fails or causes issues:

### Step 1: Restore Database Backup

```bash
# Example with PostgreSQL
pg_restore -d your_database /path/to/backup.sql
```

### Step 2: Revert Code Changes

```bash
git revert [commit-hash]
# Or restore from previous deployment
```

### Step 3: Clear Application Cache

```bash
# Clear Next.js cache
rm -rf .next/cache
# Restart application
```

### Step 4: Verify Old System Working

- Check Banner Management displays old banners
- Test old banner placements
- Verify entity pages work

---

## 📊 Migration Metrics

Track these metrics during migration:

| Metric | Pre-Migration | Post-Migration | Notes |
|--------|---------------|----------------|-------|
| Total Banners | | | |
| Carousel Banners | | | |
| Category Banners | | | Moved to categories table |
| Collection Banners | | | Moved to collections table |
| Archived Banners | | | |
| Categories with Banner | | | |
| Collections with Banner | | | |

---

## 🎓 Training Team Members

After migration:

### For Admins

1. **Show new Banner Management:**
   - Only carousel banners here
   - How to create/edit carousel banners
   - Link destination selection

2. **Show Entity Modules:**
   - Where to find Visual Identity section
   - How to upload thumbnail vs banner
   - Preview before saving

3. **Explain Philosophy:**
   - Why separation is better
   - No more duplication
   - Single source of truth per entity

### For Developers

1. **Review new types:**
   - `BannerLinkType` vs deprecated `BannerTargetType`
   - Entity type fields: `banner_image`, `thumbnail_image`

2. **Review new components:**
   - `<CarouselBanner />` for homepage
   - `<StaticContextBanner />` for entity pages
   - `<VisualIdentityForm />` for admin forms

3. **Review documentation:**
   - `/docs/BANNER-MANAGEMENT-GUIDE.md`
   - Updated type definitions
   - Server action changes

---

## 📅 Recommended Migration Timeline

### Phase 1: Preparation (1-2 days)
- Backup database
- Audit existing banners
- Create migration plan
- Set up test environment

### Phase 2: Test Environment Migration (2-3 days)
- Run SQL migrations
- Deploy code changes
- Test thoroughly
- Document issues

### Phase 3: Production Migration (Half day, during low traffic)
- Announce maintenance window
- Run migrations
- Deploy code
- Smoke test critical paths
- Monitor for issues

### Phase 4: Post-Migration (1 week)
- Train team members
- Monitor error logs
- Gather feedback
- Fix edge cases
- Document lessons learned

---

## 📝 Migration Checklist

### Pre-Migration
- [ ] Database backup created
- [ ] Existing banners documented
- [ ] Migration scripts prepared
- [ ] Test environment set up
- [ ] Rollback plan documented

### During Migration
- [ ] SQL migrations executed successfully
- [ ] Code deployed
- [ ] Cache cleared
- [ ] Initial smoke tests passed

### Post-Migration
- [ ] Homepage carousel works
- [ ] Entity pages display banners
- [ ] Admin panel updated
- [ ] No errors in logs
- [ ] Team members trained
- [ ] Documentation updated
- [ ] Metrics collected

---

## 🆘 Support Contacts

- **Database Issues:** DBA Team
- **Code Issues:** Development Team
- **Admin Training:** Product Team
- **Emergency Rollback:** DevOps Team

---

## 📌 Key Takeaways

1. **Backup First:** Always backup before migration
2. **Test Thoroughly:** Use test environment first
3. **Migrate in Batches:** Don't migrate everything at once
4. **Verify Each Step:** Check data after each migration step
5. **Have Rollback Ready:** Be prepared to revert if needed
6. **Train Team:** Ensure everyone understands new system
7. **Monitor Closely:** Watch for issues post-migration

---

**Migration completed? Mark this task:**
```sql
INSERT INTO system_migrations (name, executed_at)
VALUES ('banner_philosophy_migration', NOW());
```

Good luck with your migration! 🚀
