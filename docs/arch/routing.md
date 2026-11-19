# Cedar Elevators - Routing by Platform & User State

This document categorizes all routes in the Cedar Elevators e-commerce application by **platform** (Desktop/Mobile) and **user authentication state**.

## 📋 Table of Contents

1. [Desktop Routes](#desktop-routes)
   - [Guest (Not Logged In)](#desktop-guest)
   - [Logged In - Individual](#desktop-individual)
   - [Logged In - Business (Verified)](#desktop-business-verified)
   - [Logged In - Business (Unverified)](#desktop-business-unverified)
2. [Mobile Routes](#mobile-routes)
   - [Guest (Not Logged In)](#mobile-guest)
   - [Logged In - Individual](#mobile-individual)
   - [Logged In - Business (Verified)](#mobile-business-verified)
   - [Logged In - Business (Unverified)](#mobile-business-unverified)
3. [Admin Routes](#admin-routes)
4. [API Routes Reference](#api-routes-reference)

---

## 🖥️ Desktop Routes

<a name="desktop-guest"></a>
### 👤 Guest (Not Logged In)

Public routes accessible to unauthenticated users on desktop.

#### Public Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | `(main)/page.tsx` | Homepage |
| `/about` | `(main)/about/page.tsx` | About us |
| `/contact` | `(main)/contact/page.tsx` | Contact page |

#### Product Browsing

| Route | Page | Description |
|-------|------|-------------|
| `/catalog` | `(main)/catalog/page.tsx` | Product catalog |
| `/categories/[handle]` | `(main)/categories/[handle]/page.tsx` | Category listing |
| `/products/[handle]` | `(main)/products/[handle]/page.tsx` | Product detail page |
| `/search` | `search/page.tsx` | Search results |

#### Shopping (Guest Session)

| Route | Page | Description |
|-------|------|-------------|
| `/cart` | `(main)/cart/page.tsx` | Shopping cart (guest session) |

#### Policies & Information

| Route | Page | Description |
|-------|------|-------------|
| `/policies/[slug]` | `(main)/policies/[slug]/page.tsx` | Policy pages |
| `/returns` | `(main)/returns/page.tsx` | Returns policy |
| `/shipping` | `(main)/shipping/page.tsx` | Shipping information |
| `/warranty` | `(main)/warranty/page.tsx` | Warranty information |

#### Authentication

| Route | Page | Description |
|-------|------|-------------|
| `/choose-type` | `(auth)/choose-type/page.tsx` | Choose account type |
| `/sign-in/[[...sign-in]]` | `(auth)/sign-in/[[...sign-in]]/page.tsx` | Sign in |
| `/sign-up/[[...sign-up]]` | `(auth)/sign-up/[[...sign-up]]/page.tsx` | Sign up |
| `/individual-signup` | `(auth)/individual-signup/page.tsx` | Individual signup |
| `/business-signup` | `(auth)/business-signup/page.tsx` | Business signup |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` | Password recovery |
| `/reset-password` | `(auth)/reset-password/page.tsx` | Password reset |
| `/verify-otp` | `(auth)/verify-otp/page.tsx` | OTP verification |
| `/sso-callback` | `(auth)/sso-callback/page.tsx` | SSO callback |

---

<a name="desktop-individual"></a>
### 👤 Logged In - Individual User

Routes for authenticated individual users on desktop.

#### All Guest Routes ✅
Individual users have access to all [Guest routes](#desktop-guest) listed above.

#### User Dashboard

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | `(main)/dashboard/page.tsx` | User dashboard |
| `/notifications` | `(main)/notifications/page.tsx` | Notifications |

#### Profile & Account

| Route | Page | Description |
|-------|------|-------------|
| `/profile` | `(main)/profile/page.tsx` | Profile overview |
| `/profile/account` | `(main)/profile/account/page.tsx` | Account settings |
| `/profile/addresses` | `(main)/profile/addresses/page.tsx` | Address management |
| `/profile/orders` | `(main)/profile/orders/page.tsx` | Order history |
| `/profile/wishlist` | `(main)/profile/wishlist/page.tsx` | Saved items |
| `/profile/notifications` | `(main)/profile/notifications/page.tsx` | Notification preferences |
| `/profile/password` | `(main)/profile/password/page.tsx` | Change password |
| `/profile/verification` | `(main)/profile/verification/page.tsx` | Account verification |

#### Shopping (Authenticated)

| Route | Page | Description |
|-------|------|-------------|
| `/wishlist` | `(main)/wishlist/page.tsx` | Wishlist |
| `/checkout` | `(checkout)/checkout/page.tsx` | Checkout |
| `/order-confirmation/[id]` | `(checkout)/order-confirmation/[id]/page.tsx` | Order confirmation |

#### Quote Requests (Individual)

| Route | Page | Description |
|-------|------|-------------|
| `/request-quote` | `(main)/request-quote/page.tsx` | Request quote (limited access) |
| `/quotes` | `(main)/quotes/page.tsx` | My quotes |
| `/quotes/[id]` | `(main)/quotes/[id]/page.tsx` | Quote detail |

---

<a name="desktop-business-verified"></a>
### 🏢 Logged In - Business (Verified)

Routes for verified business accounts on desktop.

#### All Individual Routes ✅
Verified business users have access to all [Individual routes](#desktop-individual) listed above.

#### Business Profile

| Route | Page | Description |
|-------|------|-------------|
| `/profile/business/verification` | `(main)/profile/business/verification/page.tsx` | Business verification status |

#### Enhanced Quote Access

| Route | Page | Description |
|-------|------|-------------|
| `/request-quote` | `(main)/request-quote/page.tsx` | Request quote (full B2B access) |
| `/quotes` | `(main)/quotes/page.tsx` | Business quotes (bulk pricing) |
| `/quotes/[id]` | `(main)/quotes/[id]/page.tsx` | Quote detail (B2B features) |

#### Business-Specific Features

- Access to business-exclusive products
- Bulk pricing visibility
- Extended credit terms
- Dedicated account manager contact
- Business invoice downloads

---

<a name="desktop-business-unverified"></a>
### 🏢 Logged In - Business (Unverified)

Routes for unverified business accounts (pending verification) on desktop.

#### All Individual Routes ✅
Unverified business users have access to all [Individual routes](#desktop-individual) listed above.

#### Business Verification

| Route | Page | Description |
|-------|------|-------------|
| `/profile/business/verification` | `(main)/profile/business/verification/page.tsx` | Submit verification documents |

#### Limited Business Features

| Feature | Access Level |
|---------|-------------|
| Quote Requests | ⚠️ Limited (pending verification notice) |
| Business Products | ❌ Not visible |
| Bulk Pricing | ❌ Not available |
| Business Collections | ❌ Hidden |

---

## 📱 Mobile Routes

<a name="mobile-guest"></a>
### 👤 Guest (Not Logged In)

Public routes accessible to unauthenticated users on mobile.

#### Public Pages

| Route | Page | Description | Mobile Behavior |
|-------|------|-------------|-----------------|
| `/` | `(main)/page.tsx` | Homepage | Mobile-optimized layout |
| `/about` | `(main)/about/page.tsx` | About us | Responsive design |
| `/contact` | `(main)/contact/page.tsx` | Contact page | Mobile form |

#### Product Browsing

| Route | Page | Description | Mobile Behavior |
|-------|------|-------------|-----------------|
| `/catalog` | `(main)/catalog/page.tsx` | Product catalog | Grid/List toggle |
| `/categories/[handle]` | `(main)/categories/[handle]/page.tsx` | Category listing | Infinite scroll |
| `/products/[handle]` | `(main)/products/[handle]/page.tsx` | Product detail | Swipeable images |
| `/search` | `search/page.tsx` | Search results | Bottom sheet filters |

#### Shopping (Guest Session)

| Route | Page | Description | Mobile Behavior |
|-------|------|-------------|-----------------|
| `/cart` | `(main)/cart/page.tsx` | Shopping cart | Slide-up panel |

#### Policies & Information

| Route | Page | Description | Mobile Behavior |
|-------|------|-------------|-----------------|
| `/policies/[slug]` | `(main)/policies/[slug]/page.tsx` | Policy pages | Collapsible sections |
| `/returns` | `(main)/returns/page.tsx` | Returns policy | Mobile-friendly |
| `/shipping` | `(main)/shipping/page.tsx` | Shipping info | Mobile-friendly |
| `/warranty` | `(main)/warranty/page.tsx` | Warranty info | Mobile-friendly |

#### Authentication

| Route | Page | Description | Mobile Behavior |
|-------|------|-------------|-----------------|
| `/choose-type` | `(auth)/choose-type/page.tsx` | Choose account type | Card selection |
| `/sign-in/[[...sign-in]]` | `(auth)/sign-in/[[...sign-in]]/page.tsx` | Sign in | Mobile keyboard optimized |
| `/sign-up/[[...sign-up]]` | `(auth)/sign-up/[[...sign-up]]/page.tsx` | Sign up | Step-by-step flow |
| `/individual-signup` | `(auth)/individual-signup/page.tsx` | Individual signup | Mobile form |
| `/business-signup` | `(auth)/business-signup/page.tsx` | Business signup | Multi-step form |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` | Password recovery | SMS option |
| `/reset-password` | `(auth)/reset-password/page.tsx` | Password reset | Mobile-friendly |
| `/verify-otp` | `(auth)/verify-otp/page.tsx` | OTP verification | Auto-fill OTP |
| `/sso-callback` | `(auth)/sso-callback/page.tsx` | SSO callback | - |

---

<a name="mobile-individual"></a>
### 👤 Logged In - Individual User

Routes for authenticated individual users on mobile.

#### All Mobile Guest Routes ✅
Individual users have access to all [Mobile Guest routes](#mobile-guest) listed above.

#### User Dashboard

| Route | Page | Description | Mobile Behavior |
|-------|------|-------------|-----------------|
| `/dashboard` | `(main)/dashboard/page.tsx` | User dashboard | Card-based layout |
| `/notifications` | `(main)/notifications/page.tsx` | Notifications | Pull to refresh |

#### Profile & Account

| Route | Page | Description | Mobile Behavior |
|-------|------|-------------|-----------------|
| `/profile` | `(main)/profile/page.tsx` | Profile overview | Tab navigation |
| `/profile/account` | `(main)/profile/account/page.tsx` | Account settings | Native inputs |
| `/profile/addresses` | `(main)/profile/addresses/page.tsx` | Address management | Add/edit modals |
| `/profile/orders` | `(main)/profile/orders/page.tsx` | Order history | Swipeable cards |
| `/profile/wishlist` | `(main)/profile/wishlist/page.tsx` | Saved items | Grid layout |
| `/profile/notifications` | `(main)/profile/notifications/page.tsx` | Notification preferences | Toggle switches |
| `/profile/password` | `(main)/profile/password/page.tsx` | Change password | Mobile keyboard |
| `/profile/verification` | `(main)/profile/verification/page.tsx` | Account verification | Camera upload |

#### Shopping (Authenticated)

| Route | Page | Description | Mobile Behavior |
|-------|------|-------------|-----------------|
| `/wishlist` | `(main)/wishlist/page.tsx` | Wishlist | Swipe to remove |
| `/checkout` | `(checkout)/checkout/page.tsx` | Checkout | Step indicator |
| `/order-confirmation/[id]` | `(checkout)/order-confirmation/[id]/page.tsx` | Order confirmation | Share order option |

#### Quote Requests (Individual)

| Route | Page | Description | Mobile Behavior |
|-------|------|-------------|-----------------|
| `/request-quote` | `(main)/request-quote/page.tsx` | Request quote | Mobile form |
| `/quotes` | `(main)/quotes/page.tsx` | My quotes | List view |
| `/quotes/[id]` | `(main)/quotes/[id]/page.tsx` | Quote detail | Expandable sections |

---

<a name="mobile-business-verified"></a>
### 🏢 Logged In - Business (Verified)

Routes for verified business accounts on mobile.

#### All Mobile Individual Routes ✅
Verified business users have access to all [Mobile Individual routes](#mobile-individual) listed above.

#### Business Profile

| Route | Page | Description | Mobile Behavior |
|-------|------|-------------|-----------------|
| `/profile/business/verification` | `(main)/profile/business/verification/page.tsx` | Business verification status | Status badge |

#### Enhanced Quote Access

| Route | Page | Description | Mobile Behavior |
|-------|------|-------------|-----------------|
| `/request-quote` | `(main)/request-quote/page.tsx` | Request quote (B2B) | Bulk quantity picker |
| `/quotes` | `(main)/quotes/page.tsx` | Business quotes | Filter by status |
| `/quotes/[id]` | `(main)/quotes/[id]/page.tsx` | Quote detail (B2B) | Download invoice |

#### Business-Specific Features

- Business product badge visibility
- Bulk pricing tables (mobile-optimized)
- Credit limit display
- Account manager quick dial
- Invoice download/share

---

<a name="mobile-business-unverified"></a>
### 🏢 Logged In - Business (Unverified)

Routes for unverified business accounts (pending verification) on mobile.

#### All Mobile Individual Routes ✅
Unverified business users have access to all [Mobile Individual routes](#mobile-individual) listed above.

#### Business Verification

| Route | Page | Description | Mobile Behavior |
|-------|------|-------------|-----------------|
| `/profile/business/verification` | `(main)/profile/business/verification/page.tsx` | Submit documents | Camera/file upload |

#### Limited Business Features

| Feature | Access Level | Mobile Note |
|---------|--------------|-------------|
| Quote Requests | ⚠️ Limited | Verification banner |
| Business Products | ❌ Not visible | Hidden in catalog |
| Bulk Pricing | ❌ Not available | Regular pricing shown |
| Business Collections | ❌ Hidden | Not in navigation |

---

## 🔧 Admin Routes

Admin panel is primarily desktop-focused but responsive.

### Admin Authentication

| Route | Page | Access |
|-------|------|--------|
| `/admin/login` | `admin/(auth)/login/page.tsx` | Public |
| `/admin/setup` | `admin/(auth)/setup/page.tsx` | First-time setup |
| `/admin/pending` | `admin/(auth)/pending/page.tsx` | Pending approval |
| `/admin/invite/[token]` | `admin/(auth)/invite/[token]/page.tsx` | Token-based |
| `/admin/recover` | `admin/(auth)/recover/page.tsx` | Public |
| `/admin/logout` | `admin/(auth)/logout/page.tsx` | Authenticated |

### Admin Dashboard

**Base:** `/admin` with dedicated layout

#### Dashboard & Analytics

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard home |
| `/admin/analytics` | Analytics & reports |
| `/admin/activity-log` | Activity log |
| `/admin/reports` | Reports section |

#### Product Management

| Route | Description |
|-------|-------------|
| `/admin/products` | Products list |
| `/admin/products/create` | Create product |
| `/admin/products/import` | Import products |
| `/admin/products/[id]` | Product detail |
| `/admin/products/[id]/edit` | Edit product |
| `/admin/products/[id]/variants` | Variants list |
| `/admin/products/[id]/variants/create-edit` | Create/edit variant |
| `/admin/products/[id]/variants/[variantId]` | Variant detail |

#### Catalog Management

| Route | Description |
|-------|-------------|
| `/admin/categories` | Categories list |
| `/admin/categories/create` | Create category |
| `/admin/categories/[id]` | Category detail |
| `/admin/categories/[id]/edit` | Edit category |
| `/admin/collections` | Collections list |
| `/admin/collections/create` | Create collection |
| `/admin/collections/[id]` | Collection detail |
| `/admin/collections/[id]/edit` | Edit collection |
| `/admin/applications` | Applications list |
| `/admin/applications/create` | Create application |
| `/admin/applications/[id]` | Application detail |
| `/admin/applications/[id]/edit` | Edit application |
| `/admin/elevator-types` | Elevator types list |
| `/admin/elevator-types/create` | Create elevator type |
| `/admin/elevator-types/[id]` | Type detail |
| `/admin/elevator-types/[id]/edit` | Edit type |

#### Order & Quote Management

| Route | Description |
|-------|-------------|
| `/admin/orders` | Orders list |
| `/admin/orders/[id]` | Order detail |
| `/admin/quotes` | Quotes list |
| `/admin/quotes/[id]` | Quote detail |

#### Customer Management

| Route | Description |
|-------|-------------|
| `/admin/customers` | Customers list |
| `/admin/customers/[id]` | Customer detail |
| `/admin/business-verification` | Verification queue |
| `/admin/business-verification/[id]` | Verification detail |

#### Marketing & Operations

| Route | Description |
|-------|-------------|
| `/admin/banners` | Banners list |
| `/admin/banners/create` | Create banner |
| `/admin/banners/[id]/edit` | Edit banner |
| `/admin/coupons` | Coupons management |
| `/admin/inventory` | Inventory management |
| `/admin/bulk-operations` | Bulk operations |

#### Settings

| Route | Description |
|-------|-------------|
| `/admin/settings` | Settings overview |
| `/admin/settings/general` | General settings |
| `/admin/settings/profile` | Admin profile |
| `/admin/settings/store` | Store settings |
| `/admin/settings/shipping` | Shipping config |
| `/admin/settings/payments` | Payment settings |
| `/admin/settings/policies` | Policies management |
| `/admin/settings/system` | System configuration |

---

## 🔌 API Routes Reference

All API routes are located under `/api` directory.

### Store API

- `/api/store/*` - Store-related APIs
- `/api/analytics/*` - Analytics APIs
- `/api/notifications/*` - Notification APIs
- `/api/orders/*` - Order processing
- `/api/payments/*` - Payment processing
- `/api/profile/*` - User profile APIs

### Admin API

- `/api/admin/*` - Admin-specific APIs (24 endpoints)

### Authentication API

- `/api/auth/*` - Authentication endpoints (5 endpoints)

### Upload & Media

- `/api/upload/*` - File uploads
- `/api/upload-cloudinary/*` - Cloudinary upload
- `/api/verification-documents/*` - Document verification

### Webhooks

- `/api/webhooks/*` - External webhooks

---

## 🔑 Access Control Matrix

| Route Category | Guest | Individual | Business (Unverified) | Business (Verified) | Admin |
|----------------|-------|------------|----------------------|---------------------|-------|
| Public Pages | ✅ | ✅ | ✅ | ✅ | ✅ |
| Product Browsing | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cart/Checkout | ✅ | ✅ | ✅ | ✅ | ✅ |
| Wishlist | ❌ | ✅ | ✅ | ✅ | ✅ |
| Profile | ❌ | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ❌ | ✅ | ✅ | ✅ | ✅ |
| Basic Quotes | ❌ | ⚠️ Limited | ⚠️ Limited | ✅ Full | ✅ |
| B2B Pricing | ❌ | ❌ | ❌ | ✅ | ✅ |
| Business Products | ❌ | ❌ | ❌ | ✅ | ✅ |
| Admin Panel | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 📊 Statistics

- **Total Pages**: 97+
- **Storefront Pages**: ~38
- **Admin Pages**: ~52
- **Auth Pages**: ~15
- **API Endpoints**: 50+

---

*Last Updated: 2026-01-03*  
*Generated from codebase analysis of Cedar Elevators Next.js application*
