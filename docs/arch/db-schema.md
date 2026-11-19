# Cedar Elevators Database Documentation

**Database URL**: `https://hbkdbrxzqaraarivudej.supabase.co`  
**Analysis Date**: January 5, 2026  
**Total Tables**: 52 tables in `public` schema

---

## Executive Summary

This is a comprehensive e-commerce database for Cedar Elevators, a B2B/B2C platform selling elevator parts and components. The database supports:
- Multi-tenant business accounts with verification workflows
- Product catalog with categories, applications, and collections
- Shopping cart and checkout functionality
- Quote request system for bulk orders
- Admin management with role-based access
- Banner/promotional content management
- User profiles and authentication (via Clerk)

### Current State Assessment

> [!WARNING]
> **Critical Security Issues Found**
> - Multiple tables missing RLS (Row Level Security) policies
> - Several views using SECURITY DEFINER without proper safeguards
> - Leaked password protection is disabled in Auth settings

> [!CAUTION]
> **Performance Issues Detected**
> - 40+ unindexed foreign keys causing suboptimal query performance
> - Multiple duplicate indexes consuming unnecessary storage
> - Some tables lack proper indexing strategies

---

## Database Schema Overview

### Core Modules

1. **Authentication & User Management** (5 tables)
2. **Product Catalog** (12 tables)
3. **E-commerce Operations** (8 tables)
4. **Business & Verification** (7 tables)
5. **Admin Management** (4 tables)
6. **Content Management** (5 tables)
7. **Quote System** (5 tables)
8. **Supporting Tables** (6 tables)

---

## 1. Authentication & User Management

### `users` (auth schema)
**Purpose**: Core authentication table managed by Supabase Auth  
**Rows**: 1  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK) - Unique user identifier
- `email` (varchar) - User email address
- `encrypted_password` (varchar) - Hashed password
- `email_confirmed_at` (timestamptz) - Email verification timestamp
- `last_sign_in_at` (timestamptz) - Last login time
- `raw_app_meta_data` (jsonb) - Application metadata
- `raw_user_meta_data` (jsonb) - User profile data

**Use Case**: Manages user authentication, email verification, password recovery, and session management.

---

### `profiles`
**Purpose**: Extended user profile information linked to Clerk authentication  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `user_id` (text, unique) - Clerk user ID
- `email` (text)
- `full_name` (text)
- `avatar_url` (text)
- `phone_number` (text)
- `is_verified` (boolean, default: false)
- `verification_status` (text, default: 'unverified')
- `created_at`, `updated_at` (timestamptz)

**Foreign Keys**: None (uses Clerk external auth)

**Use Case**: Stores additional user profile data beyond what Clerk provides, including verification status for business accounts.

---

### `user_profiles`
**Purpose**: Legacy user profile table (may be redundant with `profiles`)  
**Rows**: 0  
**RLS Enabled**: ❌ **NO - SECURITY RISK**

**Key Columns**:
- `id` (uuid, PK)
- `user_id` (uuid, FK → users.id)
- `full_name` (text)
- `phone_number` (text)
- `avatar_url` (text)
- `date_of_birth` (date)
- `gender` (text)
- `created_at`, `updated_at` (timestamptz)

**Foreign Keys**:
- `user_profiles_user_id_fkey` → `users.id`

**Use Case**: Appears to be a duplicate/legacy profile system. Consider consolidating with `profiles` table.

> [!WARNING]
> This table has RLS disabled and may expose user data publicly via PostgREST API.

---

### `user_addresses`
**Purpose**: Stores multiple delivery/billing addresses per user  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `clerk_user_id` (text, FK → profiles.user_id)
- `address_type` (text) - 'shipping' or 'billing'
- `is_default` (boolean)
- `full_name`, `phone_number` (text)
- `address_line1`, `address_line2` (text)
- `city`, `state`, `postal_code`, `country` (text)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_user_addresses_customer` on `clerk_user_id`
- `idx_user_addresses_default` on `is_default`
- `idx_user_addresses_type` on `address_type`

**Use Case**: Manages shipping and billing addresses for checkout process.

---

### `user_favourites`
**Purpose**: Wishlist/favorites functionality  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `clerk_user_id` (text, FK → profiles.user_id)
- `product_id` (uuid, FK → products.id)
- `created_at` (timestamptz)

**Indexes**:
- `idx_user_favourites_customer` on `clerk_user_id`
- `idx_user_favourites_product` on `product_id`
- Unique constraint on `(clerk_user_id, product_id)`

**Use Case**: Allows users to save favorite products for later purchase.

---

## 2. Product Catalog

### `products`
**Purpose**: Core product information table  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `name` (text) - Product name
- `slug` (text, unique) - URL-friendly identifier
- `description` (text) - Full product description
- `short_description` (text) - Brief summary
- `sku` (text, unique) - Stock Keeping Unit
- `base_price` (numeric) - Base selling price
- `compare_at_price` (numeric) - Original price for discounts
- `cost_price` (numeric) - Wholesale/cost price
- `is_published` (boolean, default: false)
- `is_featured` (boolean, default: false)
- `brand` (text)
- `manufacturer` (text)
- `warranty_info` (text)
- `shipping_weight` (numeric)
- `shipping_dimensions` (jsonb) - {length, width, height}
- `meta_title`, `meta_description`, `meta_keywords` (text) - SEO fields
- `search_vector` (tsvector) - Full-text search
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_products_brand` on `brand`
- `idx_products_featured` on `is_featured`
- `idx_products_published` on `is_published`
- `idx_products_search_vector` (GIN index for full-text search)
- `idx_products_sku` on `sku`
- `idx_products_slug` on `slug`

**Use Case**: Central product catalog with SEO optimization and full-text search capabilities.

---

### `product_variants`
**Purpose**: Product variations (size, color, capacity, etc.)  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `product_id` (uuid, FK → products.id)
- `variant_name` (text) - e.g., "500kg - Red"
- `sku` (text, unique)
- `price` (numeric) - Variant-specific price
- `compare_at_price` (numeric)
- `cost_price` (numeric)
- `stock_quantity` (integer, default: 0)
- `low_stock_threshold` (integer, default: 10)
- `allow_backorders` (boolean, default: false)
- `weight` (numeric)
- `dimensions` (jsonb)
- `is_active` (boolean, default: true)
- `sort_order` (integer)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_product_variants_active` on `is_active`
- `idx_product_variants_product` on `product_id`
- `idx_product_variants_sku` on `sku`

**Foreign Keys**:
- `product_variants_product_id_fkey` → `products.id` (CASCADE DELETE)

**Use Case**: Manages product variations with independent pricing and inventory tracking.

---

### `product_images`
**Purpose**: Product image gallery  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `product_id` (uuid, FK → products.id)
- `image_url` (text) - Supabase Storage URL
- `alt_text` (text) - Accessibility description
- `is_primary` (boolean, default: false)
- `sort_order` (integer, default: 0)
- `created_at` (timestamptz)

**Indexes**:
- `idx_product_images_primary` on `is_primary`
- `idx_product_images_product` on `product_id`

**Foreign Keys**:
- `product_images_product_id_fkey` → `products.id` (CASCADE DELETE)

**Use Case**: Stores multiple images per product with primary image designation.

---

### `applications`
**Purpose**: Elevator application types (Residential, Commercial, Industrial, etc.)  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `name` (text, unique) - Application name
- `slug` (text, unique)
- `description` (text)
- `icon_url` (text) - Icon for UI display
- `image_url` (text) - Banner image
- `is_active` (boolean, default: true)
- `sort_order` (integer)
- `meta_title`, `meta_description` (text) - SEO
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_applications_active` on `is_active`
- `idx_applications_slug` on `slug`

**Use Case**: Top-level categorization by elevator application type.

---

### `categories_new`
**Purpose**: Product categories (Motors, Controllers, Safety Systems, etc.)  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `name` (text, unique)
- `slug` (text, unique)
- `description` (text)
- `icon_url` (text)
- `image_url` (text)
- `is_active` (boolean, default: true)
- `sort_order` (integer)
- `meta_title`, `meta_description` (text)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_categories_new_active` on `is_active`
- `idx_categories_new_slug` on `slug`

**Use Case**: Main product categorization system.

---

### `subcategories`
**Purpose**: Subcategories under main categories  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `category_id` (uuid, FK → categories_new.id)
- `name` (text)
- `slug` (text)
- `description` (text)
- `icon_url` (text)
- `image_url` (text)
- `is_active` (boolean, default: true)
- `sort_order` (integer)
- `meta_title`, `meta_description` (text)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_subcategories_active` on `is_active`
- `idx_subcategories_category` on `category_id`
- `idx_subcategories_slug` on `slug`

**Foreign Keys**:
- `subcategories_category_id_fkey` → `categories_new.id` (CASCADE DELETE)

**Use Case**: Provides hierarchical categorization (Category → Subcategory).

---

### `elevator_types`
**Purpose**: Specific elevator types (Passenger, Freight, Hospital, etc.)  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `name` (text, unique)
- `slug` (text, unique)
- `description` (text)
- `icon_url` (text)
- `image_url` (text)
- `is_active` (boolean, default: true)
- `sort_order` (integer)
- `meta_title`, `meta_description` (text)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_elevator_types_active` on `is_active`
- `idx_elevator_types_slug` on `slug`

**Use Case**: Categorizes products by elevator type for filtering.

---

### `collections`
**Purpose**: Curated product collections (Featured, New Arrivals, Best Sellers, etc.)  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `name` (text, unique)
- `slug` (text, unique)
- `description` (text)
- `collection_type` (text) - 'manual', 'auto', 'smart'
- `display_type` (text) - 'grid', 'carousel', 'list'
- `is_active` (boolean, default: true)
- `is_featured` (boolean, default: false)
- `sort_order` (integer)
- `image_url` (text)
- `icon_url` (text)
- `auto_include_rules` (jsonb) - Rules for automatic collections
- `context` (text) - 'homepage', 'category', 'application'
- `meta_title`, `meta_description` (text)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_collections_active` on `is_active`
- `idx_collections_context` on `context`
- `idx_collections_featured` on `is_featured`
- `idx_collections_slug` on `slug`
- `idx_collections_type` on `collection_type`

**Use Case**: Creates dynamic and manual product groupings for marketing and navigation.

---

### Junction Tables (Many-to-Many Relationships)

#### `application_categories`
**Purpose**: Links applications to categories  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Columns**:
- `id` (uuid, PK)
- `application_id` (uuid, FK → applications.id)
- `category_id` (uuid, FK → categories_new.id)
- `created_at` (timestamptz)

**Indexes**:
- `idx_application_categories_app` on `application_id`
- `idx_application_categories_category` on `category_id`
- Unique constraint on `(application_id, category_id)`

---

#### `product_types`
**Purpose**: Links products to elevator types  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Columns**:
- `id` (uuid, PK)
- `product_id` (uuid, FK → products.id)
- `elevator_type_id` (uuid, FK → elevator_types.id)
- `created_at` (timestamptz)

**Indexes**:
- `idx_product_types_elevator_type` on `elevator_type_id`
- `idx_product_types_product` on `product_id`
- Unique constraint on `(product_id, elevator_type_id)`

---

#### `product_collections`
**Purpose**: Links products to collections  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Columns**:
- `id` (uuid, PK)
- `product_id` (uuid, FK → products.id)
- `collection_id` (uuid, FK → collections.id)
- `sort_order` (integer, default: 0)
- `created_at` (timestamptz)

**Indexes**:
- `idx_product_collections_collection` on `collection_id`
- `idx_product_collections_collection_id` on `collection_id` ⚠️ **DUPLICATE**
- `idx_product_collections_product` on `product_id`
- `idx_product_collections_product_id` on `product_id` ⚠️ **DUPLICATE**
- Unique constraint on `(product_id, collection_id)`

> [!WARNING]
> Duplicate indexes detected - consider dropping `idx_product_collections_collection_id` and `idx_product_collections_product_id`.

---

### `product_specifications`
**Purpose**: Technical specifications for products  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `product_id` (uuid, FK → products.id)
- `spec_name` (text) - e.g., "Load Capacity"
- `spec_value` (text) - e.g., "1000kg"
- `spec_group` (text) - e.g., "Technical", "Dimensions"
- `sort_order` (integer, default: 0)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_product_specifications_product` on `product_id`

**Foreign Keys**:
- `product_specifications_product_id_fkey` → `products.id` (CASCADE DELETE)

**Use Case**: Stores flexible key-value specifications for products.

---

## 3. E-commerce Operations

### `carts`
**Purpose**: Shopping cart sessions  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `clerk_user_id` (text, nullable, FK → profiles.user_id)
- `session_id` (text, nullable) - For guest carts
- `expires_at` (timestamptz)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_carts_customer` on `clerk_user_id`
- `idx_carts_session` on `session_id`

**Use Case**: Manages shopping carts for both authenticated users and guests.

---

### `cart_items`
**Purpose**: Items in shopping carts  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `cart_id` (uuid, FK → carts.id)
- `product_id` (uuid, FK → products.id)
- `variant_id` (uuid, nullable, FK → product_variants.id)
- `quantity` (integer, CHECK > 0)
- `unit_price` (numeric) - Price at time of adding
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_cart_items_cart` on `cart_id`
- `idx_cart_items_product` on `product_id`
- `idx_cart_items_variant` on `variant_id`

**Foreign Keys**:
- `cart_items_cart_id_fkey` → `carts.id` (CASCADE DELETE)
- `cart_items_product_id_fkey` → `products.id` (CASCADE DELETE)
- `cart_items_variant_id_fkey` → `product_variants.id` (SET NULL)

**Use Case**: Stores individual items in shopping carts with quantity and pricing.

---

### `orders`
**Purpose**: Customer orders  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `order_number` (text, unique) - Human-readable order ID
- `clerk_user_id` (text, FK → profiles.user_id)
- `status` (text, default: 'pending') - Order status
- `payment_status` (text, default: 'pending')
- `fulfillment_status` (text, default: 'unfulfilled')
- `subtotal` (numeric) - Before tax/shipping
- `tax_amount` (numeric)
- `shipping_amount` (numeric)
- `discount_amount` (numeric)
- `total_amount` (numeric)
- `currency` (text, default: 'INR')
- `shipping_address` (jsonb) - Full address object
- `billing_address` (jsonb)
- `notes` (text) - Customer notes
- `admin_notes` (text) - Internal notes
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_orders_customer` on `clerk_user_id`
- `idx_orders_number` on `order_number`
- `idx_orders_status` on `status`

**Use Case**: Manages customer orders with comprehensive status tracking.

---

### `order_items`
**Purpose**: Line items in orders  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `order_id` (uuid, FK → orders.id)
- `product_id` (uuid, FK → products.id)
- `variant_id` (uuid, nullable, FK → product_variants.id)
- `product_name` (text) - Snapshot at purchase time
- `variant_name` (text)
- `sku` (text)
- `quantity` (integer, CHECK > 0)
- `unit_price` (numeric)
- `total_price` (numeric)
- `created_at` (timestamptz)

**Indexes**:
- `idx_order_items_order` on `order_id`
- `idx_order_items_product` on `product_id`

**Foreign Keys**:
- `order_items_order_id_fkey` → `orders.id` (CASCADE DELETE)
- `order_items_product_id_fkey` → `products.id`
- `order_items_variant_id_fkey` → `product_variants.id` (SET NULL)

**Use Case**: Stores order line items with historical product data.

---

### `recently_viewed`
**Purpose**: Track recently viewed products per user  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `clerk_user_id` (text, FK → profiles.user_id)
- `product_id` (uuid, FK → products.id)
- `viewed_at` (timestamptz, default: now())

**Indexes**:
- `idx_recently_viewed_customer` on `clerk_user_id`
- `idx_recently_viewed_product` on `product_id`
- `idx_recently_viewed_time` on `viewed_at`

**Foreign Keys**:
- `recently_viewed_product_id_fkey` → `products.id` (CASCADE DELETE)

**Use Case**: Powers "Recently Viewed" product recommendations.

---

### Database Views

#### `cart_items_detailed`
**Purpose**: Denormalized view of cart items with product details  
**Type**: View (SECURITY DEFINER)  
**RLS Enabled**: N/A (view)

> [!WARNING]
> This view uses SECURITY DEFINER which bypasses RLS. Ensure proper access controls.

---

#### `low_stock_products`
**Purpose**: Products with stock below threshold  
**Type**: View (SECURITY DEFINER)  
**RLS Enabled**: N/A (view)

---

#### `out_of_stock_products`
**Purpose**: Products with zero stock  
**Type**: View (SECURITY DEFINER)  
**RLS Enabled**: N/A (view)

---

## 4. Business & Verification

### `businesses`
**Purpose**: Business account registrations  
**Rows**: 0  
**RLS Enabled**: ❌ **NO - SECURITY RISK**

**Key Columns**:
- `id` (uuid, PK)
- `owner_id` (text) - Clerk user ID of owner
- `business_name` (text)
- `business_type` (text) - 'contractor', 'installer', 'distributor', etc.
- `tax_id` (text) - GST/Tax number
- `registration_number` (text)
- `website` (text)
- `phone` (text)
- `email` (text)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_businesses_owner` on `owner_id`

> [!WARNING]
> RLS is disabled - business data is publicly accessible via API.

---

### `business_profiles`
**Purpose**: Extended business profile information  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `clerk_user_id` (text, FK → profiles.user_id)
- `business_name` (text)
- `business_type` (text)
- `registration_number` (text)
- `tax_id` (text)
- `website` (text)
- `phone` (text)
- `email` (text)
- `verification_status` (text, default: 'pending')
- `is_verified` (boolean, default: false)
- `verified_at` (timestamptz)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_business_profiles_customer` on `clerk_user_id`
- `idx_business_profiles_status` on `verification_status`

**Use Case**: Stores business account details with verification workflow.

---

### `business_members`
**Purpose**: Team members in business accounts  
**Rows**: 0  
**RLS Enabled**: ❌ **NO - SECURITY RISK**

**Key Columns**:
- `id` (uuid, PK)
- `business_id` (uuid, FK → businesses.id)
- `user_id` (uuid, FK → users.id)
- `role` (text) - 'owner', 'admin', 'member'
- `permissions` (jsonb) - Custom permissions
- `invited_at` (timestamptz)
- `joined_at` (timestamptz)
- `created_at`, `updated_at` (timestamptz)

**Foreign Keys**:
- `business_members_business_id_fkey` → `businesses.id` (CASCADE DELETE)
- `business_members_user_id_fkey` → `users.id` (CASCADE DELETE)

---

### `business_addresses`
**Purpose**: Business location addresses  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `business_id` (uuid, FK → business_profiles.id)
- `address_type` (text) - 'headquarters', 'warehouse', 'branch'
- `is_primary` (boolean, default: false)
- `address_line1`, `address_line2` (text)
- `city`, `state`, `postal_code`, `country` (text)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_business_addresses_business` on `business_id`
- `idx_business_addresses_primary` on `is_primary`

**Foreign Keys**:
- `business_addresses_business_id_fkey` → `business_profiles.id` (CASCADE DELETE)

---

### `business_documents`
**Purpose**: Business verification documents  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `business_profile_id` (uuid, FK → business_profiles.id)
- `document_type` (text) - 'registration', 'tax_certificate', 'license'
- `file_url` (text) - Supabase Storage URL
- `file_name` (text)
- `file_size` (integer)
- `mime_type` (text)
- `status` (text, default: 'pending')
- `uploaded_at` (timestamptz)
- `verified_at` (timestamptz)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_business_documents_profile` on `business_profile_id`
- `idx_business_documents_status` on `status`

**Foreign Keys**:
- `business_documents_business_profile_id_fkey` → `business_profiles.id` (CASCADE DELETE)

---

### `verification_documents`
**Purpose**: User verification documents  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `clerk_user_id` (text, FK → profiles.user_id)
- `business_profile_id` (uuid, nullable, FK → business_profiles.id)
- `document_type` (text)
- `file_url` (text)
- `file_name` (text)
- `file_size` (integer)
- `mime_type` (text)
- `status` (text, default: 'pending')
- `rejection_reason` (text)
- `uploaded_at`, `reviewed_at` (timestamptz)
- `reviewed_by` (text)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_verification_documents_customer` on `clerk_user_id`
- `idx_verification_documents_user_id` on `clerk_user_id` ⚠️ **DUPLICATE**
- `idx_verification_documents_profile` on `business_profile_id`
- `idx_verification_documents_status` on `status`

**Foreign Keys**:
- `verification_documents_profile_user_id_fkey` → `profiles.user_id`
- `verification_documents_business_profile_id_fkey` → `business_profiles.id` (CASCADE DELETE)

---

### `verification_audit_log`
**Purpose**: Audit trail for verification actions  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `clerk_user_id` (text)
- `business_profile_id` (uuid, FK → business_profiles.id)
- `action` (text) - 'approved', 'rejected', 'pending'
- `performed_by` (text) - Admin who performed action
- `notes` (text)
- `created_at` (timestamptz)

**Indexes**:
- `idx_verification_audit_customer` on `clerk_user_id`
- `idx_verification_audit_profile` on `business_profile_id`

**Foreign Keys**:
- `verification_audit_log_business_profile_id_fkey` → `business_profiles.id` (CASCADE DELETE)

---

## 5. Admin Management

### `admin_profiles`
**Purpose**: Admin user accounts with role-based access  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `user_id` (text, unique) - Clerk user ID
- `email` (text, unique)
- `role` (text) - 'super_admin', 'admin', 'moderator'
- `permissions` (jsonb) - Granular permissions
- `is_active` (boolean, default: true)
- `approved_by` (uuid, nullable, FK → admin_profiles.id)
- `approved_at` (timestamptz)
- `last_login_at` (timestamptz)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_admin_profiles_user_id` on `user_id`
- `idx_admin_profiles_role` on `role`
- `idx_admin_profiles_is_active` on `is_active`
- `unique_user_admin_profile` unique on `user_id`

**Foreign Keys**:
- `admin_profiles_approved_by_fkey` → `admin_profiles.id` (self-referencing)

**Use Case**: Manages admin users with hierarchical approval system.

> [!CAUTION]
> Missing index on `approved_by` foreign key - may cause performance issues.

---

### `admin_invites`
**Purpose**: Invitation system for new admins  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `email` (text)
- `role` (text)
- `token_hash` (text) - Hashed invitation token
- `invited_by` (uuid, FK → admin_profiles.id)
- `expires_at` (timestamptz)
- `used_at` (timestamptz, nullable)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_admin_invites_email` on `email`
- `idx_admin_invites_token_hash` on `token_hash`

**Foreign Keys**:
- `admin_invites_invited_by_fkey` → `admin_profiles.id` (CASCADE DELETE)

**Use Case**: Secure invitation workflow for onboarding new admins.

---

### `admin_settings`
**Purpose**: Global admin configuration  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `setting_key` (text, unique)
- `setting_value` (jsonb)
- `description` (text)
- `updated_by` (text)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_admin_settings_key` on `setting_key`

**Use Case**: Stores system-wide configuration settings.

---

### `cms_policies`
**Purpose**: Content management policies and permissions  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `policy_name` (text, unique)
- `description` (text)
- `rules` (jsonb) - Policy rules configuration
- `is_active` (boolean, default: true)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_cms_policies_active` on `is_active`
- `idx_cms_policies_name` on `policy_name`

**Use Case**: Defines content management access policies.

---

## 6. Content Management

### `banners`
**Purpose**: Homepage and promotional banners  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `title` (text)
- `description` (text)
- `banner_type` (text) - 'hero', 'promotional', 'announcement'
- `status` (text, default: 'draft') - 'draft', 'scheduled', 'active', 'expired'
- `priority` (integer, default: 0) - Display order
- `start_date`, `end_date` (timestamptz)
- `target_url` (text) - Click destination
- `created_by` (uuid, FK → admin_profiles.id)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_banners_status` on `status`
- `idx_banners_type` on `banner_type`
- `idx_banners_dates` on `(start_date, end_date)`

**Foreign Keys**:
- `banners_created_by_fkey` → `admin_profiles.id` (SET NULL)

**Use Case**: Manages promotional banners with scheduling capabilities.

---

### `banner_slides`
**Purpose**: Individual slides within banners (for carousels)  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `banner_id` (uuid, FK → banners.id)
- `image_url` (text)
- `mobile_image_url` (text) - Responsive image
- `alt_text` (text)
- `heading` (text)
- `subheading` (text)
- `cta_text` (text) - Call-to-action button text
- `cta_url` (text)
- `sort_order` (integer, default: 0)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_banner_slides_banner` on `banner_id`

**Foreign Keys**:
- `banner_slides_banner_id_fkey` → `banners.id` (CASCADE DELETE)

**Use Case**: Stores individual slides for multi-slide banner carousels.

---

### `store_settings`
**Purpose**: Global store configuration  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `setting_key` (text, unique)
- `setting_value` (jsonb)
- `category` (text) - 'general', 'checkout', 'shipping', 'tax'
- `description` (text)
- `is_public` (boolean, default: false)
- `updated_by` (text)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_store_settings_category` on `category`
- `idx_store_settings_key` on `setting_key`
- `idx_store_settings_public` on `is_public`

**Use Case**: Centralized store configuration management.

---

## 7. Quote System

### `quotes`
**Purpose**: Customer quote requests for bulk orders  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `quote_number` (text, unique) - Human-readable quote ID
- `clerk_user_id` (text, FK → profiles.user_id)
- `business_id` (uuid, nullable, FK → businesses.id)
- `status` (text, default: 'pending') - 'pending', 'reviewing', 'quoted', 'accepted', 'rejected'
- `priority` (text, default: 'normal') - 'low', 'normal', 'high', 'urgent'
- `project_name` (text)
- `project_description` (text)
- `delivery_timeline` (text)
- `budget_range` (text)
- `special_requirements` (text)
- `contact_name`, `contact_email`, `contact_phone` (text)
- `shipping_address` (jsonb)
- `total_estimated_value` (numeric)
- `admin_notes` (text)
- `expires_at` (timestamptz)
- `created_at`, `updated_at` (timestamptz)

**Indexes**:
- `idx_quotes_customer` on `clerk_user_id`
- `idx_quotes_number` on `quote_number`
- `idx_quotes_status` on `status`
- `idx_quotes_business` on `business_id`

**Foreign Keys**:
- `quotes_business_id_fkey` → `businesses.id` (SET NULL)

**Use Case**: Manages quote requests for bulk/custom orders.

---

### `quote_items`
**Purpose**: Line items in quote requests  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `quote_id` (uuid, FK → quotes.id)
- `product_id` (uuid, nullable, FK → products.id)
- `product_name` (text) - For custom items
- `description` (text)
- `quantity` (integer, CHECK > 0)
- `unit_price` (numeric, nullable) - Admin-provided quote price
- `created_at` (timestamptz)

**Indexes**:
- `idx_quote_items_quote` on `quote_id`

**Foreign Keys**:
- `quote_items_quote_id_fkey1` → `quotes.id` (CASCADE DELETE)

**Use Case**: Stores individual items in quote requests.

---

### `quote_attachments`
**Purpose**: File attachments for quotes (specs, drawings, etc.)  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `quote_id` (uuid, FK → quotes.id)
- `file_name` (text)
- `file_url` (text) - Supabase Storage URL
- `file_size` (integer)
- `created_at` (timestamptz)

**Indexes**:
- `idx_quote_attachments_quote` on `quote_id`

**Foreign Keys**:
- `quote_attachments_quote_id_fkey1` → `quotes.id` (CASCADE DELETE)

**Use Case**: Allows customers to attach technical documents to quotes.

---

### `quote_admin_responses`
**Purpose**: Admin responses to quote requests  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Key Columns**:
- `id` (uuid, PK)
- `quote_id` (uuid, FK → quotes.id)
- `response_note` (text)
- `responded_by` (text) - Admin user ID
- `responded_at` (timestamptz, default: now())

**Indexes**:
- `idx_quote_admin_responses_quote` on `quote_id`

**Foreign Keys**:
- `quote_admin_responses_quote_id_fkey` → `quotes.id` (CASCADE DELETE)

**Use Case**: Tracks admin communications on quote requests.

---

### `quotes_backup`
**Purpose**: Backup table for quotes (legacy/migration)  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

**Note**: This appears to be a backup table from a migration. Consider archiving or removing if no longer needed.

---

## 8. Supporting Tables

### `categories` (Legacy)
**Purpose**: Old category system (replaced by `categories_new`)  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

> [!NOTE]
> This table appears to be deprecated. Consider dropping after confirming no dependencies.

---

### `product_categories` (Legacy)
**Purpose**: Old product-category junction table  
**Rows**: 0  
**RLS Enabled**: ✅ Yes

> [!NOTE]
> Likely deprecated with the new categorization system.

---

## Database Extensions

The following PostgreSQL extensions are installed:

- **pgcrypto** (v1.3) - Cryptographic functions
- **plpgsql** (v1.0) - PL/pgSQL procedural language
- **uuid-ossp** (implied) - UUID generation

---

## Migration History

**Total Migrations**: 52

Key migrations include:
- **20251228122255** - Initial quotes schema
- **20251228130422** - Banners schema
- **20251228131914** - Collections schema
- **20251229175906** - User profiles
- **20251230090150** - Store settings
- **20251230140234** - Admin invites
- **20251231141725** - Application-category linking
- **20260101043003** - Product columns enhancement
- **20260101102014** - Admin search indexes
- **20260101103434** - Full-text search implementation
- **20260101121656** - Restructured schema tables
- **20260102133631** - Category seeding
- **20260103145705** - Product categorization
- **20260104085518** - Quote module refactor v3

---

## Security Advisories

### Critical Issues (Must Fix)

> [!CAUTION]
> **RLS Disabled on Public Tables**
> 
> The following tables are exposed via PostgREST API without Row Level Security:
> - `user_profiles`
> - `business_members`
> - `businesses`
> 
> **Action Required**: Enable RLS and create appropriate policies immediately.

> [!WARNING]
> **SECURITY DEFINER Views**
> 
> The following views bypass RLS using SECURITY DEFINER:
> - `cart_items_detailed`
> - `low_stock_products`
> - `out_of_stock_products`
> - `product_search_results`
> 
> **Recommendation**: Review view definitions and ensure they don't leak sensitive data.

> [!WARNING]
> **Auth Configuration**
> 
> Leaked password protection is currently **DISABLED** in Supabase Auth.
> 
> **Action Required**: Enable HaveIBeenPwned integration in Auth settings.

---

### Performance Issues

> [!IMPORTANT]
> **Unindexed Foreign Keys (40+ instances)**
> 
> Many foreign key columns lack covering indexes, which can severely impact JOIN performance. Key examples:
> - `admin_invites.invited_by`
> - `admin_profiles.approved_by`
> - `banners.created_by`
> - `cart_items.variant_id`
> - `order_items.variant_id`
> - And 35+ more...
> 
> **Recommendation**: Add indexes on all foreign key columns used in JOINs.

> [!WARNING]
> **Duplicate Indexes**
> 
> The following tables have duplicate indexes wasting storage:
> - `product_collections`: `idx_product_collections_collection` and `idx_product_collections_collection_id`
> - `product_collections`: `idx_product_collections_product` and `idx_product_collections_product_id`
> - `verification_documents`: `idx_verification_documents_customer` and `idx_verification_documents_user_id`
> 
> **Action Required**: Drop redundant indexes to save storage and improve write performance.

---

## Database Statistics

| Metric | Value |
|--------|-------|
| Total Tables | 52 |
| Tables with Data | 1 (auth.users) |
| Empty Tables | 51 |
| Tables with RLS Enabled | 49 |
| Tables Missing RLS | 3 ⚠️ |
| Total Indexes | 150+ |
| Duplicate Indexes | 3 sets |
| Unindexed Foreign Keys | 40+ |
| Total Migrations | 52 |
| Security Advisories | 47 |
| Performance Advisories | 43 |

---

## Recommendations

### Immediate Actions

1. **Enable RLS** on `user_profiles`, `business_members`, and `businesses` tables
2. **Add indexes** on frequently-joined foreign key columns
3. **Remove duplicate indexes** to optimize storage
4. **Enable leaked password protection** in Supabase Auth settings
5. **Review SECURITY DEFINER views** for potential data leaks

### Schema Improvements

1. **Consolidate profile tables**: Merge `user_profiles` and `profiles` to eliminate redundancy
2. **Archive legacy tables**: Remove or archive `categories`, `product_categories`, `quotes_backup`
3. **Add composite indexes** for common query patterns (e.g., `status + created_at`)
4. **Implement soft deletes** for audit trail on critical tables

### Data Integrity

1. **Add CHECK constraints** for enum-like columns (status, role, etc.)
2. **Implement triggers** for automatic timestamp updates
3. **Create database functions** for complex business logic
4. **Add foreign key indexes** for all relationships

---

## Conclusion

The Cedar Elevators database is a well-structured e-commerce platform with comprehensive features for B2B/B2C operations. However, **critical security issues must be addressed immediately**, particularly enabling RLS on public tables. Performance can be significantly improved by adding missing indexes and removing duplicates.

**Current State**: ⚠️ **Functional but requires security hardening and performance optimization**

**Database Health Score**: 6.5/10
- ✅ Good: Comprehensive schema design, proper relationships, migration history
- ⚠️ Needs Attention: Security policies, indexing strategy
- ❌ Critical: RLS disabled on 3 tables, leaked password protection disabled
