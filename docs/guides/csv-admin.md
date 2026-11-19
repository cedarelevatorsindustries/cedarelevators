# Bulk CSV Import - Admin User Guide

**Last Updated:** January 2025  
**Module:** Cedar Elevator Industries - Product Management  
**Version:** 1.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Pre-Import Requirements](#pre-import-requirements)
3. [Step-by-Step Guide](#step-by-step-guide)
4. [Understanding CSV Structure](#understanding-csv-structure)
5. [Common Errors & Solutions](#common-errors--solutions)
6. [Best Practices](#best-practices)
7. [FAQs](#faqs)

---

## Overview

The Bulk CSV Import feature allows you to import multiple products and their variants into the Cedar Elevator Industries catalog using a structured CSV (Comma-Separated Values) file.

### What Can You Import?

✅ **Products** - Basic product information (name, description, pricing)  
✅ **Variants** - Multiple variants per product (with different options like capacity, voltage)  
✅ **Catalog Assignment** - Link products to applications, categories, and subcategories  
✅ **Pricing** - Set selling price and MRP (compare_at_price)  
✅ **Inventory** - Set stock levels and tracking options  
✅ **Attributes** - Add technical specifications as JSON metadata

### What CAN'T You Import?

❌ **Applications** - Must be created manually first  
❌ **Categories & Subcategories** - Must exist before import  
❌ **Elevator Types** - Must be pre-configured  
❌ **Product Images** - Currently not supported via CSV  
❌ **Collections** - Must be created separately (optional assignment via CSV)

---

## Pre-Import Requirements

### ⚠️ CRITICAL: Complete This Checklist Before Importing

**The CSV import DOES NOT create catalog structure.** You must set up these first:

#### 1. ✅ Create Applications
- Go to **Admin → Applications**
- Create all applications you'll reference in CSV
- Note down the **slug** for each application (e.g., `motors`, `safety-devices`)

#### 2. ✅ Create Categories & Subcategories
- Go to **Admin → Categories**
- Create categories under each application
- Optionally create subcategories under categories
- Note down the **slugs** (e.g., `traction-motors`, `vvvf-motors`)

#### 3. ✅ Create Elevator Types
- Go to **Admin → Elevator Types**
- Create types like `passenger`, `commercial`, `freight`, `residential`
- Note down the **slugs**

#### 4. ✅ Create Collections (Optional)
- Go to **Admin → Collections**
- Create collections like `featured`, `best-sellers`, `new-arrivals`
- Note down the **slugs**

#### 5. ✅ Download CSV Template
- Go to **Admin → Products → Import**
- Click **"Download CSV Template"**
- Use this as your starting point

---

## Step-by-Step Guide

### Step 1: Prepare Your CSV File

1. **Download the template** from the import page
2. **Open in Excel, Google Sheets, or any CSV editor**
3. **Fill in your product data** following the template format
4. **Save as CSV** (UTF-8 encoding recommended)

### Step 2: Upload & Preview

1. Navigate to **Admin → Products → Import**
2. Click **"Choose a CSV file"** or drag & drop
3. Select your prepared CSV file
4. Click **"Preview Import"**
5. Wait for validation (may take a few seconds for large files)

### Step 3: Review Validation Results

The preview will show:

- **Product Count** - Total products to be imported
- **Variant Count** - Total variants across all products
- **Blocking Errors** - Must fix before proceeding (shown in red)
- **Warnings** - Non-critical issues (shown in yellow)

#### Handling Errors

**Blocking Errors (Red):**
- Missing required fields
- Invalid application/category references
- Invalid pricing
- Malformed JSON in attributes

**Action:** Download your CSV, fix the errors, and re-upload.

**Warnings (Yellow):**
- Missing optional fields (will use defaults)
- Invalid references that don't block import
- Products that will be saved as "Draft" due to missing catalog assignment

**Action:** Review and decide if you want to fix or proceed.

### Step 4: Confirm & Import

1. If no blocking errors, click **"Continue to Confirm"**
2. Review the products list one final time
3. Click **"Confirm & Import"**
4. Wait for the import to complete (progress will be shown)

### Step 5: View Results

After import completes, you'll see:

- **Products Created** - Successfully imported products
- **Variants Created** - Successfully imported variants
- **Failed** - Products/variants that couldn't be imported
- **Error Report** - Download detailed error log (if any failures)

**Next Actions:**
- Click **"View Products"** to see imported products
- Click **"Import Another File"** to start over

---

## Understanding CSV Structure

### Required Columns

| Column | Description | Example |
|--------|-------------|----------|
| `product_title` | Product name (min 3 chars) | `VVVF Elevator Motor` |
| `short_description` | Brief description (min 10 chars) | `High-efficiency VVVF motor` |
| `application_slug` | Application slug (must exist in DB) | `motors` |
| `category_slug` | Category slug (must exist in DB) | `traction-motors` |
| `product_price` | Selling price in ₹ (positive number) | `45000` |
| `product_mrp` | MRP in ₹ (positive number) | `50000` |

### Optional Columns

| Column | Description | Example |
|--------|-------------|----------|
| `brief_description` | Detailed description | `Variable Voltage Variable Frequency...` |
| `subcategory_slug` | Subcategory slug | `vvvf-motors` |
| `elevator_types` | Comma-separated elevator type slugs | `passenger,commercial` |
| `collections` | Comma-separated collection slugs | `featured,best-sellers` |
| `track_inventory` | Track stock? (`true`/`false`) | `true` |
| `product_stock` | Stock quantity | `50` |
| `status` | Product status (`draft`/`active`) | `active` |

### Variant Columns (Optional)

| Column | Description | Example |
|--------|-------------|----------|
| `variant_title` | Variant display name | `1000kg / 415V` |
| `variant_option_1_name` | First option name | `Capacity` |
| `variant_option_1_value` | First option value | `1000kg` |
| `variant_option_2_name` | Second option name | `Voltage` |
| `variant_option_2_value` | Second option value | `415V` |
| `variant_price` | Variant-specific price | `45000` |
| `variant_mrp` | Variant-specific MRP | `50000` |
| `variant_stock` | Variant-specific stock | `30` |

### Metadata Column

| Column | Description | Example |
|--------|-------------|----------|
| `attributes` | JSON string of technical specs | `{"controller":"VVVF","speed":"1.5 m/s"}` |

---

## Common Errors & Solutions

### Error: "Missing required columns"

**Cause:** Your CSV doesn't have all required column headers.

**Solution:**
1. Download the official template
2. Copy your data into the template
3. Ensure column names match exactly (case-sensitive)

---

### Error: "Application 'xyz' not found"

**Cause:** The `application_slug` doesn't exist in the database.

**Solution:**
1. Go to **Admin → Applications**
2. Check the exact slug of your application
3. Update CSV with correct slug (lowercase, hyphenated)

---

### Error: "Category 'xyz' not found under application 'abc'"

**Cause:** The `category_slug` doesn't exist under the specified application.

**Solution:**
1. Verify category is created under the correct application
2. Check category slug spelling
3. Categories must belong to the application you specified

---

### Error: "Product price must be a positive number"

**Cause:** Price contains non-numeric characters or is zero/negative.

**Solution:**
1. Remove currency symbols (₹, $)
2. Remove commas (use `5000` not `5,000`)
3. Use only numbers (decimals allowed: `4599.99`)
4. Must be greater than zero

---

### Error: "Invalid JSON format in attributes field"

**Cause:** The attributes column contains malformed JSON.

**Solution:**
1. Validate JSON using online tool (jsonlint.com)
2. Escape quotes inside CSV cell:
   ```
   "{""key"":""value""}"
   ```
3. Or use single quotes for property names if your editor allows

---

### Warning: "Product will be created as draft"

**Cause:** Application or category reference is invalid.

**Solution:**
1. Product will still import but as **Draft** status
2. Fix catalog assignment manually after import
3. Or fix CSV and re-import

---

## Best Practices

### 1. Start Small
✅ Test with 5-10 products first  
✅ Verify results before importing thousands  
✅ Understand error messages with small dataset

### 2. Use Consistent Naming
✅ Keep slugs lowercase with hyphens: `vvvf-motors`  
✅ Use clear, descriptive product titles  
✅ Maintain consistent option names across variants

### 3. Organize Variants
✅ Group variants using same `product_title`  
✅ Use descriptive `variant_title`  
✅ Keep option names consistent (e.g., always use "Capacity" not sometimes "Weight")

### 4. Validate Before Upload
✅ Check all slugs exist in database  
✅ Verify prices are numbers without symbols  
✅ Test JSON attributes with validator  
✅ Remove empty rows at end of CSV

### 5. Handle Large Imports
✅ Break into batches of 500-1000 products  
✅ Import during off-peak hours  
✅ Keep backup of CSV file  
✅ Monitor import progress

### 6. Post-Import Tasks
✅ Review imported products in **Admin → Products**  
✅ Add product images manually  
✅ Verify pricing and stock levels  
✅ Check catalog assignments  
✅ Publish draft products when ready

---

## FAQs

### Q: Can I update existing products via CSV?
**A:** Currently, the import only creates new products. Update functionality is planned for v2.

### Q: How do I add images to imported products?
**A:** Images must be added manually after import. Go to **Admin → Products → Edit Product → Images**.

### Q: What happens if I import the same product twice?
**A:** A new product with a different SKU will be created. SKUs are auto-generated and always unique.

### Q: Can I use Excel to create the CSV?
**A:** Yes, but save as "CSV UTF-8" format to preserve special characters.

### Q: Why are my prices showing incorrectly?
**A:** Ensure prices are in **Indian Rupees (₹)** and don't include currency symbols in CSV.

### Q: What's the maximum file size for import?
**A:** Recommended: up to 5MB (~5000 products). Larger files may timeout.

### Q: Can I import products without variants?
**A:** Yes! Just fill product-level fields and leave variant fields empty. A default variant will be created.

### Q: How do I handle products with 3 or more options?
**A:** Currently limited to 2 options. Support for option3 is planned for v2.

### Q: What encoding should I use for CSV?
**A:** UTF-8 encoding is recommended to support international characters.

### Q: Can I schedule imports to run automatically?
**A:** Not currently. Import scheduling is planned for v2.

---

## Need Help?

If you encounter issues not covered in this guide:

1. **Check the error message** - Most errors are self-explanatory
2. **Download error report** - Available after failed imports
3. **Contact support** - Provide CSV file and error report
4. **Check developer docs** - `/docs/csv-import-developer-documentation.md`

---

**Happy Importing! 🚀**
