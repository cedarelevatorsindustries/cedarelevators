# CSV Template Documentation

**Last Updated:** January 2025  
**Module:** Cedar Elevator Industries - Bulk Product Import  
**Version:** 1.0

---

## 📋 Overview

This document provides detailed specifications for the CSV template used in bulk product imports. Each column is explained with examples, validation rules, and best practices.

---

## 📊 CSV Structure

### File Requirements

- **Format:** CSV (Comma-Separated Values)
- **Encoding:** UTF-8 (recommended)
- **Separator:** Comma (`,`)
- **Line Endings:** LF (`\n`) or CRLF (`\r\n`)
- **Header Row:** Required (must be first row)
- **Max File Size:** 10MB recommended

### Column Order

Columns can be in any order as long as header names match exactly. However, the recommended order is:

1. Product-level columns
2. Variant-level columns
3. Metadata columns

---

## 📑 Column Specifications

### Product-Level Columns (REQUIRED)

---

#### `product_title`

**Description:** The main name/title of the product.

**Type:** Text  
**Required:** ✅ Yes  
**Min Length:** 3 characters  
**Max Length:** 255 characters

**Examples:**
```
VVVF Elevator Motor
Elevator Door Sensor
Guide Rail T-Type 5m
Emergency Phone System
```

**Validation Rules:**
- Must be at least 3 characters long
- Cannot be empty or whitespace only
- Special characters allowed
- Used for product grouping (all rows with same title = 1 product with multiple variants)

**Best Practices:**
- Use descriptive, searchable names
- Include key features (e.g., "VVVF" for motor type)
- Be consistent across variants
- Avoid generic names like "Motor" or "Sensor"

---

#### `short_description`

**Description:** Brief one-line description of the product.

**Type:** Text  
**Required:** ✅ Yes  
**Min Length:** 10 characters  
**Max Length:** 500 characters

**Examples:**
```
High-efficiency VVVF motor for passenger elevators
Infrared safety sensor for elevator doors
Cold-drawn steel T-type guide rails
Emergency communication system with auto-dialer
```

**Validation Rules:**
- Must be at least 10 characters long
- Should be concise but informative
- No HTML tags

**Best Practices:**
- Highlight key benefit or feature
- Keep under 100 characters for better display
- Use proper grammar and punctuation

---

#### `brief_description`

**Description:** Detailed multi-line description of the product.

**Type:** Text  
**Required:** ❌ Optional  
**Max Length:** 5000 characters

**Examples:**
```
Variable Voltage Variable Frequency (VVVF) motor with advanced control system. Features smooth acceleration and deceleration, energy efficiency up to 95%, and quiet operation. Suitable for passenger and commercial elevators up to 2000kg capacity.
```

**Validation Rules:**
- Can include line breaks
- No HTML tags
- Supports special characters

**Best Practices:**
- Include technical details
- Mention certifications or standards
- Describe use cases
- Keep formatting simple

---

#### `application_slug`

**Description:** Slug of the application this product belongs to.

**Type:** Text (slug format)  
**Required:** ✅ Yes  
**Must Exist:** Yes (in database)

**Examples:**
```
motors
safety-devices
mechanical-components
control-systems
cabin-finishes
```

**Validation Rules:**
- Must exist in `categories` table with `parent_id = NULL`
- Lowercase only
- Hyphens for spaces
- No special characters except hyphens

**How to Find:**
1. Go to **Admin → Applications**
2. Copy the slug from the application list
3. Use exact slug (case-sensitive)

**Error if Invalid:**
```
Blocking Error: Application "motorz" not found
```

---

#### `category_slug`

**Description:** Slug of the category under the application.

**Type:** Text (slug format)  
**Required:** ✅ Yes  
**Must Exist:** Yes (under specified application)

**Examples:**
```
traction-motors
sensors
guide-rails
controllers
handrails
```

**Validation Rules:**
- Must exist in `categories` table
- Must have `parent_id` = application's ID
- Lowercase with hyphens

**How to Find:**
1. Go to **Admin → Categories**
2. Navigate to the application
3. Copy category slug

**Error if Invalid:**
```
Blocking Error: Category "traction-motorz" not found under application "motors"
```

---

#### `subcategory_slug`

**Description:** Slug of the subcategory under the category.

**Type:** Text (slug format)  
**Required:** ❌ Optional  
**Must Exist:** No (warning if not found)

**Examples:**
```
vvvf-motors
geared-motors
door-sensors
weight-sensors
```

**Validation Rules:**
- If provided, should exist under category
- Can be left empty
- Warning (not error) if not found

**Warning if Invalid:**
```
Warning: Subcategory "vvvf-motorz" not found under category "traction-motors"
```

---

#### `elevator_types`

**Description:** Comma-separated list of elevator type slugs.

**Type:** Text (comma-separated slugs)  
**Required:** ❌ Optional  
**Must Exist:** No (warning if not found)

**Examples:**
```
passenger,commercial
freight,industrial
residential
passenger,commercial,residential
```

**Format Rules:**
- Separate multiple values with commas
- No spaces around commas (or they'll be trimmed)
- Lowercase slugs

**How to Find:**
1. Go to **Admin → Elevator Types**
2. Copy slugs for applicable types
3. Join with commas

**Warning if Some Invalid:**
```
Warning: Elevator types not found: comercial (found: passenger, residential)
```

---

#### `collections`

**Description:** Comma-separated list of collection slugs.

**Type:** Text (comma-separated slugs)  
**Required:** ❌ Optional  
**Must Exist:** No (warning if not found)

**Examples:**
```
featured,best-sellers
new-arrivals
top-rated,premium
```

**Format Rules:**
- Same as `elevator_types`
- Collections are marketing/merchandising groups

**How to Find:**
1. Go to **Admin → Collections**
2. Copy slugs
3. Join with commas

---

#### `product_price`

**Description:** Selling price of the product in Indian Rupees.

**Type:** Numeric (decimal)  
**Required:** ✅ Yes  
**Min Value:** > 0

**Examples:**
```
45000
5000.50
199.99
1250000
```

**Format Rules:**
- No currency symbols (₹, $, Rs)
- No commas (use `5000` not `5,000`)
- Decimals allowed (up to 2 places recommended)
- Must be positive number

**Error if Invalid:**
```
Blocking Error: Product price must be a positive number
```

**Best Practices:**
- Don't include taxes (add separately if needed)
- Use consistent precision (e.g., always 2 decimals or always whole numbers)
- Verify pricing before import

---

#### `product_mrp`

**Description:** Maximum Retail Price (compare at price) in Indian Rupees.

**Type:** Numeric (decimal)  
**Required:** ✅ Yes  
**Min Value:** > 0

**Examples:**
```
50000
6000.00
249.99
1500000
```

**Format Rules:**
- Same as `product_price`
- Typically higher than `product_price`
- Maps to `compare_at_price` in database

**Notes:**
- MRP is shown with strikethrough on product pages
- Used to calculate discount percentage
- Required even if same as selling price

---

#### `track_inventory`

**Description:** Whether to track inventory for this product.

**Type:** Boolean (text)  
**Required:** ❌ Optional  
**Default:** `true`

**Valid Values:**
- `true` or `TRUE` or `True`
- `false` or `FALSE` or `False`
- Empty = defaults to `true`

**Examples:**
```
true
false

```

**When to Use:**
- `true`: Physical products with stock limits
- `false`: Services, digital products, or unlimited stock items

---

#### `product_stock`

**Description:** Initial stock quantity for the product.

**Type:** Integer  
**Required:** ❌ Optional  
**Default:** 0  
**Min Value:** 0

**Examples:**
```
100
0
5000
```

**Format Rules:**
- Whole numbers only (no decimals)
- Can be 0 (out of stock)
- Negative not allowed

**Notes:**
- If `track_inventory` is `false`, this value is ignored
- Variants can override this value

---

#### `status`

**Description:** Publication status of the product.

**Type:** Enum  
**Required:** ❌ Optional  
**Default:** `draft`

**Valid Values:**
- `draft`: Not visible to customers
- `active`: Published and visible

**Examples:**
```
draft
active
```

**Notes:**
- Products with invalid catalog references are automatically set to `draft`
- Can be changed later in admin panel

---

### Variant-Level Columns (OPTIONAL)

---

#### `variant_title`

**Description:** Display name for this variant.

**Type:** Text  
**Required:** ❌ Optional  
**Default:** "Default" (if not provided)

**Examples:**
```
1000kg / 415V
Small - Red
Standard Package
5 meters
```

**Best Practices:**
- Include option values for clarity
- Keep concise
- Use consistent format across variants

---

#### `variant_option_1_name`

**Description:** Name of the first variant option (e.g., "Size", "Capacity").

**Type:** Text  
**Required:** ❌ Optional

**Examples:**
```
Capacity
Size
Color
Length
Voltage
```

**Best Practices:**
- Use consistent naming across all variants of same product
- Capitalize properly
- Keep short and clear

---

#### `variant_option_1_value`

**Description:** Value of the first variant option.

**Type:** Text  
**Required:** ❌ Optional (but should match `option_1_name`)

**Examples:**
```
1000kg
Large
Red
5m
415V
```

**Validation:**
- If `variant_option_1_name` is provided, this should also be provided
- Used in variant SKU generation

---

#### `variant_option_2_name`

**Description:** Name of the second variant option.

**Type:** Text  
**Required:** ❌ Optional

**Examples:**
```
Voltage
Color
Material
Finish
```

**Notes:**
- Same rules as `variant_option_1_name`
- Optional even if option1 is provided

---

#### `variant_option_2_value`

**Description:** Value of the second variant option.

**Type:** Text  
**Required:** ❌ Optional

**Examples:**
```
415V
Blue
Stainless Steel
Matte
```

---

#### `variant_price`

**Description:** Variant-specific selling price (overrides product_price).

**Type:** Numeric  
**Required:** ❌ Optional  
**Fallback:** Uses `product_price` if not provided

**Examples:**
```
48000
5200.00

```

**When to Use:**
- When variants have different prices
- Leave empty to use product price

**Warning if Invalid:**
```
Warning: Invalid variant price, using product price
```

---

#### `variant_mrp`

**Description:** Variant-specific MRP (overrides product_mrp).

**Type:** Numeric  
**Required:** ❌ Optional  
**Fallback:** Uses `product_mrp` if not provided

**Examples:**
```
53000
6200.00

```

---

#### `variant_stock`

**Description:** Variant-specific stock quantity (overrides product_stock).

**Type:** Integer  
**Required:** ❌ Optional  
**Fallback:** Uses `product_stock` if not provided

**Examples:**
```
30
0

```

**Use Case:**
```csv
product_title,product_stock,variant_title,variant_stock
Motor,100,1000kg,60
Motor,100,1500kg,40
```
Product has total 100 stock, distributed across variants.

---

### Metadata Columns (OPTIONAL)

---

#### `attributes`

**Description:** JSON object containing technical specifications or custom attributes.

**Type:** JSON (as string)  
**Required:** ❌ Optional  
**Format:** Valid JSON string

**Examples:**

**Simple:**
```json
{"voltage":"415V","speed":"1.5 m/s"}
```

**Complex:**
```json
{
  "controller": "VVVF",
  "speed": "1.5 m/s",
  "efficiency": "95%",
  "noise_level": "<70dB",
  "certification": "CE, ISO 9001"
}
```

**CSV Encoding:**
In CSV files, JSON must be properly escaped:
```csv
attributes
"{""voltage"":""415V"",""speed"":""1.5 m/s""}"
```

Or use Excel's automatic escaping by wrapping in quotes.

**Validation:**
- Must be valid JSON syntax
- No unescaped quotes
- Blocking error if invalid

**Error if Invalid:**
```
Blocking Error: Invalid JSON format in attributes field
```

**Best Practices:**
- Validate JSON before import using online tools (jsonlint.com)
- Keep structure consistent across products
- Use for searchable/filterable attributes
- Store as key-value pairs

---

## 📝 Example CSV Templates

### Example 1: Simple Product (No Variants)

```csv
product_title,short_description,application_slug,category_slug,product_price,product_mrp,track_inventory,product_stock,status
Elevator Door Sensor,Infrared safety sensor,safety-devices,sensors,2500,3000,true,200,active
```

**Result:** 1 product with 1 default variant

---

### Example 2: Product with Multiple Variants

```csv
product_title,short_description,application_slug,category_slug,product_price,product_mrp,variant_title,variant_option_1_name,variant_option_1_value,variant_price,variant_stock
VVVF Motor,High-efficiency motor,motors,traction-motors,45000,50000,1000kg,Capacity,1000kg,45000,60
VVVF Motor,High-efficiency motor,motors,traction-motors,45000,50000,1500kg,Capacity,1500kg,48000,40
```

**Result:** 1 product with 2 variants

---

### Example 3: Product with 2 Options per Variant

```csv
product_title,short_description,application_slug,category_slug,product_price,product_mrp,variant_title,variant_option_1_name,variant_option_1_value,variant_option_2_name,variant_option_2_value,variant_price
Motor,VVVF Motor,motors,traction-motors,45000,50000,1000kg / 415V,Capacity,1000kg,Voltage,415V,45000
Motor,VVVF Motor,motors,traction-motors,45000,50000,1000kg / 380V,Capacity,1000kg,Voltage,380V,45000
Motor,VVVF Motor,motors,traction-motors,45000,50000,1500kg / 415V,Capacity,1500kg,Voltage,415V,48000
Motor,VVVF Motor,motors,traction-motors,45000,50000,1500kg / 380V,Capacity,1500kg,Voltage,380V,48000
```

**Result:** 1 product with 4 variants (2 capacity × 2 voltage options)

---

### Example 4: Product with Attributes

```csv
product_title,short_description,application_slug,category_slug,product_price,product_mrp,attributes
VVVF Motor,High-efficiency motor,motors,traction-motors,45000,50000,"{""controller"":""VVVF"",""speed"":""1.5 m/s"",""efficiency"":""95%""}"
```

**Result:** 1 product with technical specifications stored as JSON

---

### Example 5: Complete Example (All Fields)

```csv
product_title,short_description,brief_description,application_slug,category_slug,subcategory_slug,elevator_types,collections,product_price,product_mrp,track_inventory,product_stock,status,variant_title,variant_option_1_name,variant_option_1_value,variant_option_2_name,variant_option_2_value,variant_price,variant_mrp,variant_stock,attributes
VVVF Elevator Motor,High-efficiency VVVF motor for passenger elevators,Variable Voltage Variable Frequency (VVVF) motor with advanced control system for smooth operation and energy efficiency.,motors,traction-motors,vvvf-motors,"passenger,commercial","featured,best-sellers",45000,50000,true,100,active,1000kg / 415V,Capacity,1000kg,Voltage,415V,45000,50000,60,"{""controller"":""VVVF"",""speed"":""1.5 m/s"",""efficiency"":""95%""}"
VVVF Elevator Motor,High-efficiency VVVF motor for passenger elevators,Variable Voltage Variable Frequency (VVVF) motor with advanced control system for smooth operation and energy efficiency.,motors,traction-motors,vvvf-motors,"passenger,commercial","featured,best-sellers",45000,50000,true,100,active,1500kg / 415V,Capacity,1500kg,Voltage,415V,48000,53000,40,"{""controller"":""VVVF"",""speed"":""1.5 m/s"",""efficiency"":""95%""}"
```

---

## ✅ Validation Checklist

Before uploading your CSV:

- [ ] All required columns present with correct names
- [ ] `product_title` is at least 3 characters for all rows
- [ ] `short_description` is at least 10 characters
- [ ] All `application_slug` values exist in database
- [ ] All `category_slug` values exist under their applications
- [ ] Prices are positive numbers without symbols
- [ ] `attributes` JSON is valid (if used)
- [ ] File is saved as CSV UTF-8
- [ ] No empty rows at end of file
- [ ] Variants with same `product_title` have consistent product-level data

---

## 🔧 Tools & Tips

### Creating CSVs

**Recommended Tools:**
- Microsoft Excel (Save As → CSV UTF-8)
- Google Sheets (File → Download → CSV)
- LibreOffice Calc
- VS Code with Rainbow CSV extension

### Validating JSON

**Online Validators:**
- https://jsonlint.com/
- https://jsonformatter.org/

**Tip:** Validate JSON in a separate tool before pasting into CSV

### Testing

1. **Start Small:** Test with 2-3 products first
2. **Check Preview:** Always review preview before importing
3. **Verify Results:** Check imported products in admin panel
4. **Iterate:** Fix errors and re-upload

---

## ❓ FAQ

**Q: Can I leave optional columns out of my CSV entirely?**  
A: Yes! If you don't need a column, don't include it in your CSV.

**Q: What if I have more than 2 variant options?**  
A: Currently limited to 2 options. Support for option3 is planned for v2.

**Q: Can I use different column order?**  
A: Yes! Columns can be in any order as long as names match exactly.

**Q: How do I handle commas in descriptions?**  
A: Wrap the field in quotes: `"Great motor, perfect for elevators"`

**Q: Can I import thousands of products at once?**  
A: Recommended to batch in groups of 500-1000 products for best performance.

**Q: What encoding should I use?**  
A: UTF-8 is strongly recommended to support all characters.

---

**Need more help?** See:
- [Admin User Guide](/docs/csv-import-admin-user-guide.md)
- [Developer Documentation](/docs/csv-import-developer-documentation.md)

---

**Happy Importing! 🚀**
