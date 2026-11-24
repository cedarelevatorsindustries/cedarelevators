# CEDAR ELEVATORS — PHASE 1 FEATURE INVENTORY
**Discovery Date:** November 2026  
**Status:** Read-Only Discovery Complete  
**Scope:** Customer Website, Admin Portal, Backend APIs, Database, and Integrations  

---

## 1. Executive Summary

This document provides a comprehensive, granular inventory of all features, capabilities, endpoints, and architectural components discovered within the Cedar Elevators codebase and connected infrastructure.

The application was originally architected as a full-scale B2B/B2C multi-tenant e-commerce platform with business verification, GST calculations, Razorpay payments, tiered wholesale pricing, inventory reservation, and automated order fulfillment. The current business objective is to streamline the platform into a focused, highly responsive **Phase 1 Product Catalogue & Quotation Platform** while safeguarding working systems and maintaining a clean reactivation path for Phase 2 e-commerce functionality.

### Global Inventory Counts
- **Total Discovered Distinct Features / Sub-systems:** 64
- **Total Next.js App Routes (Pages):** 69
- **Total Backend API Route Handlers:** 45
- **Total Server Action Modules:** 48
- **Total Supabase Database Tables:** 73
- **External Third-Party Integrations:** 9

---

## 2. Customer-Facing Website Inventory

### 2.1 Active Phase 1 Core Experiences
| Feature / Area | Route / Component Path | Current State | Description & Capabilities |
|---|---|---|---|
| **Homepage & Hero** | `src/app/(main)/page.tsx`<br>`src/modules/home/components/*` | Functional | Responsive hero section with desktop hero WebP banner, elevator industry value propositions, carousel banners, and direct CTAs to catalogue and quote form. |
| **Product Catalogue** | `src/app/(main)/catalog/page.tsx`<br>`src/modules/catalog/*` | Functional | Grid display of products with thumbnail previews, technical specs summary, and quote enquiry CTAs. |
| **Taxonomy Navigation** | `src/app/(main)/catalog/categories/[handle]/page.tsx`<br>`src/app/(main)/catalog/applications/[handle]/page.tsx`<br>`src/app/(main)/catalog/types/[handle]/page.tsx`<br>`src/app/(main)/catalog/collections/[handle]/page.tsx` | Functional | Hierarchical navigation across Categories, Applications (e.g. Passenger, Freight), Elevator Types (Traction, Hydraulic), and Curated Collections. |
| **Product Detail Pages (PDP)** | `src/app/(main)/products/[handle]/page.tsx`<br>`src/modules/products/*` | Functional | Deep technical view with image gallery, mechanical & electrical specifications, dimension tables, and "Add to Quote" action. |
| **Search & Faceted Filters** | `src/app/search/page.tsx`<br>`src/components/search/*`<br>`src/modules/layout/components/desktop/navbar/components/navbar-search.tsx` | Functional | Real-time search suggestions and attribute-based facet filtering (brand, category, specifications). |
| **Guest Quotation Engine** | `src/app/(main)/quotes/new/page.tsx`<br>`src/app/(main)/quotes/success/page.tsx`<br>`src/modules/quote/*` | Functional | Phase 1 guest quotation journey: accepts customer name, phone, email, company, multi-item basket, and custom notes; saves to `quotes` and `quote_items`. |
| **Contact & Project Enquiry** | `src/app/(main)/contact/page.tsx`<br>`src/modules/contact/*` | Functional | Direct commercial contact form, office address, phone, email, and WhatsApp quick CTA. |
| **Static & CMS Content** | `src/app/(main)/why-choose/page.tsx`<br>`src/app/(main)/warranty/page.tsx`<br>`src/app/(main)/policies/[slug]/page.tsx`<br>`src/app/(main)/terms/page.tsx`<br>`src/app/(main)/privacy/page.tsx` | Functional | Dynamic and static brand trust pages powered by Supabase CMS tables (`why_choose_*`, `warranty_*`, `policies`). |
| **Responsive Navigation** | `src/modules/layout/components/desktop/*`<br>`src/modules/layout/components/mobile/*` | Functional | Sticky desktop navbar with search and MegaMenu; mobile bottom bar (`Home`, `Catalog`, `Get Quote`, `Contact`). |

### 2.2 E-Commerce & Customer Account Features (Deferred Candidates)
| Feature / Area | Route / Component Path | Current State | Phase 1 Relevance |
|---|---|---|---|
| **Shopping Cart** | `src/app/(main)/cart/page.tsx`<br>`src/contexts/cart-context.tsx`<br>`src/modules/cart/*` | Dormant (Redirected in proxy) | **Deferred**: Phase 1 uses quotation baskets; direct online purchasing is not required. |
| **Checkout Flow** | `src/app/(main)/checkout/page.tsx`<br>`src/modules/checkout/*` | Dormant (Redirected in proxy) | **Deferred**: Online checkout and payment processing deferred to Phase 2. |
| **Online Payments** | `src/app/api/payments/create-order`<br>`src/app/api/payments/verify`<br>`src/app/api/webhooks/razorpay` | Built | **Deferred**: Razorpay online gateway not required for quotation requests. |
| **Customer Auth (Clerk)** | `src/app/(auth)/*`<br>`src/app/(main)/profile/*` | Functional | **Deferred**: Visitors request quotes as guests; customer account registration is optional/dormant. |
| **Business Verification** | `src/app/(main)/profile/business/verification`<br>`src/app/api/business-verification` | Built | **Deferred**: B2B GSTIN verification and document upload not required for initial catalogue. |
| **Wishlist & Favourites** | `src/app/(main)/wishlist/page.tsx`<br>`src/app/api/wishlist/*` | Built | **Deferred**: User wishlist requires authentication; replaced by quote basket. |
| **Order Tracking** | `src/app/(main)/track/page.tsx`<br>`src/app/(main)/order-confirmation/*` | Built | **Deferred**: Orders are not created online in Phase 1. |
| **Product Reviews** | `src/components/products/product-reviews.tsx`<br>`src/lib/actions/reviews.ts` | Partial | **Deferred**: Unverified customer review submissions deferred. |

---

## 3. Admin Portal Inventory

### 3.1 Active Phase 1 Administrative Features
| Feature / Area | Admin Route Path | Current State | Description & Capabilities |
|---|---|---|---|
| **Supabase Admin Auth** | `src/app/admin/(dashboard)/layout.tsx`<br>`src/components/admin/admin-login-view.tsx`<br>`src/lib/actions/admin-auth.ts` | Functional | Secure single-entry authentication on `/admin` powered exclusively by Supabase Auth and `admin_profiles`. |
| **Admin Dashboard** | `src/app/admin/(dashboard)/page.tsx` | Functional | Core operational overview: quick stats on products, categories, quote requests, and recent activity feed. |
| **Product Management** | `src/app/admin/(dashboard)/products/*` | Functional | Full CRUD for elevator components: title, slug, description, images (Cloudinary), specs, dimensions, base pricing. |
| **Category Management** | `src/app/admin/(dashboard)/categories/*` | Functional | Management of component categories, parent-child subcategories, and category banners. |
| **Application Management** | `src/app/admin/(dashboard)/applications/*` | Functional | Management of elevator application categories (e.g., Passenger, Freight, Home lifts). |
| **Elevator Types Management** | `src/app/admin/(dashboard)/elevator-types/*` | Functional | Management of drive and mechanical classifications (Traction, Hydraulic, MRL). |
| **Collection Merchandising** | `src/app/admin/(dashboard)/collections/*` | Functional | Merchandising collections for homepage discovery and promotional showcase. |
| **Quotation Management** | `src/app/admin/(dashboard)/quotes/*` | Functional | Reception, inspection, pricing adjustment, status update (`submitted`, `reviewing`, `approved`, `rejected`), and response generation. |
| **Banner Management** | `src/app/admin/(dashboard)/banners/*` | Functional | Management of promotional slides and hero carousel banners. |
| **Store & Brand Settings** | `src/app/admin/(dashboard)/settings/general/*`<br>`src/app/admin/(dashboard)/settings/store/*` | Functional | Configuration of company name, contact numbers, notification email, and office address. |
| **CMS Content Management** | `src/app/admin/(dashboard)/settings/cms/*` | Functional | Rich-text editors for Why Choose Us, Warranty Information, and Legal Policies. |
| **Admin User Roles** | `src/app/admin/(dashboard)/settings/users/*` | Functional | Role management (`super_admin`, `admin`, `manager`, `staff`) with invite and deactivation capabilities. |

### 3.2 Administrative Features (Deferred Candidates)
| Feature / Area | Admin Route Path | Current State | Phase 1 Relevance |
|---|---|---|---|
| **Order Management** | `src/app/admin/(dashboard)/orders/*` | Built | **Deferred**: No online orders generated in Phase 1. |
| **Customer Management** | `src/app/admin/(dashboard)/customers/*` | Built | **Deferred**: Customer profiles tied to Clerk e-commerce accounts deferred. |
| **Business Verification** | `src/app/admin/(dashboard)/business-verification/*` | Built | **Deferred**: Review of B2B business license/GST docs not needed for guest quotes. |
| **Warehouse Inventory** | `src/app/admin/(dashboard)/inventory/*`<br>`src/lib/actions/inventory-adjustments.ts` | Built | **Deferred**: Complex inventory bin tracking, safety stock alerts, and manual adjustments. |
| **Payment Gateway Config** | `src/app/admin/(dashboard)/settings/payments/*` | Built | **Deferred**: Razorpay API credentials and toggle settings not needed. |
| **Tax / GST Rules Engine** | `src/app/admin/(dashboard)/settings/tax/*` | Built | **Deferred**: Dynamic checkout GST configuration deferred. |
| **Shipping Rules Engine** | `src/app/admin/(dashboard)/settings/shipping/*` | Built | **Deferred**: Shipping zone rates and pickup locations deferred. |
| **Bulk Operations** | `src/app/admin/(dashboard)/bulk-operations/*` | Built | **Deferred**: Batch price adjustments and automated bulk inventory updates. |

---

## 4. Backend API & Server Actions Inventory

### 4.1 API Route Handlers (`src/app/api/*`)
| Route Path | Method(s) | Classification | Purpose |
|---|---|---|---|
| `/api/quotes` | `POST`, `GET` | **P1_ACTIVE** | Phase 1 guest quotation submission & pricing calculation. |
| `/api/store/products` | `GET` | **P1_ACTIVE** | Public catalogue product listing with pagination and filters. |
| `/api/store/search` | `GET` | **P1_ACTIVE** | Catalogue full-text search. |
| `/api/store/search/suggestions` | `GET` | **P1_ACTIVE** | Instant autocomplete search suggestions in navbar. |
| `/api/store/filters/*` | `GET` | **P1_ACTIVE** | Aggregated facet counts (categories, elevator types, brands). |
| `/api/upload-cloudinary` | `POST` | **P1_ACTIVE** | Secure image uploads for products, banners, and categories. |
| `/api/upload/cloudinary` | `POST` | **P1_ACTIVE** | Alternate upload handler for Cloudinary media assets. |
| `/api/admin/auth/callback` | `GET` | **P1_ACTIVE** | PKCE code exchange for admin password resets. |
| `/api/admin/products` | `GET`, `POST` | **P1_ACTIVE** | Admin product CRUD backend handler. |
| `/api/admin/categories` | `GET`, `POST` | **P1_ACTIVE** | Admin category CRUD handler. |
| `/api/admin/stats` | `GET` | **P1_ACTIVE** | Quick stats aggregation for admin dashboard overview. |
| `/api/admin/reports/generate` | `POST` | **P1_ACTIVE** | Basic export and operational reporting. |
| `/api/payments/create-order` | `POST` | **P2_DEFERRED** | Razorpay order initialization. |
| `/api/payments/verify` | `POST` | **P2_DEFERRED** | Razorpay payment signature verification. |
| `/api/webhooks/razorpay` | `POST` | **P2_DEFERRED** | Razorpay payment webhook listener. |
| `/api/orders` | `GET`, `POST` | **P2_DEFERRED** | Customer order creation and lookup. |
| `/api/orders/[id]/invoice` | `GET` | **P2_DEFERRED** | PDF invoice generation for placed orders. |
| `/api/wishlist/*` | All | **P2_DEFERRED** | Wishlist item manipulation and merging. |
| `/api/addresses/*` | All | **P2_DEFERRED** | Customer saved shipping/billing addresses. |
| `/api/business-verification/*`| All | **P2_DEFERRED** | B2B verification documents upload and state. |
| `/api/auth/*` | All | **P2_DEFERRED** | Customer profile synchronization with Clerk. |
| `/api/account/delete` | `POST` | **P2_DEFERRED** | Customer account deletion. |
| `/api/cron/quotes/expiry` | `GET` | **INTERNAL_DEPENDENCY** | Routine cleanup marking expired quotes. |

### 4.2 Server Actions (`src/lib/actions/*`)
- **Phase 1 Active Modules**: `admin-auth.ts`, `admin-dashboard.ts`, `products/*`, `categories.ts`, `applications.ts`, `elevator-types.ts`, `collections.ts`, `banners.ts`, `banner-slides.ts`, `admin-quotes/*`, `quotes.ts`, `quote-products.ts`, `search.ts`, `store-search.ts`, `cms.ts`, `admin-cms.ts`, `policies-cms.ts`, `warranty-cms.ts`, `why-choose-cms.ts`.
- **Phase 2 Deferred Modules**: `checkout/*`, `cart.ts`, `cart-extended.ts`, `cart-locking.ts`, `cart-conversion.ts`, `orders.ts`, `order-creation.ts`, `customers/*`, `business.ts`, `business-hub.ts`, `business-verification.ts`, `inventory-adjustments.ts`, `pricing.ts` (B2B wholesale discounting logic), `reviews.ts`, `user-lists.ts`.

---

## 5. Database Schema & Infrastructure Inventory (Supabase `public`)

The PostgreSQL database contains **73 tables**. They are categorized below:

### 5.1 Core Catalogue & Taxonomy (P1_ACTIVE — 17 Tables)
1. `products` — Base product master (name, slug, description, specs, base price, status).
2. `product_variants` — Specific models/sizes linked to products.
3. `categories` — Product categories (e.g., Motors, Controllers, Doors).
4. `subcategories` — Nested subcategories.
5. `category_subcategories` — Relationship junction table.
6. `product_categories` — Product to category mappings.
7. `product_subcategories` — Product to subcategory mappings.
8. `applications` — Elevator application groupings (Passenger, Freight, Hospital).
9. `application_categories` — Mapping categories to applications.
10. `product_applications` — Direct product to application mapping.
11. `elevator_types` — Elevator drive types (Hydraulic, Traction, MRL).
12. `product_elevator_types` — Product to elevator type mappings.
13. `product_types` — Secondary product categorization.
14. `collections` — Merchandised collections.
15. `product_collections` — Product to collection linkages with display sorting.
16. `banners` — Promotional and discovery banners.
17. `banner_slides` — Multi-image slides for carousel banners.

### 5.2 Quotations & Enquiries (P1_ACTIVE — 7 Tables)
18. `quotes` — Core quotation master supporting both guest and account submissions.
19. `quote_items` — Snapshot line items (name, sku, thumbnail, qty, requested price).
20. `quote_attachments` — Technical drawings or RFP files attached to enquiries.
21. `quote_admin_responses` — Admin communication and quote pricing proposals.
22. `quote_audit_log` — Timestamped audit trail of quote status changes.
23. `quote_baskets` — Temporary guest/session quote baskets.
24. `quote_counters` — Sequence counters for generating quote reference IDs.

### 5.3 Administration, Roles & Site Settings (P1_ACTIVE — 7 Tables)
25. `admin_profiles` — Authenticated administrator profiles linked to Supabase Auth UUIDs.
26. `admin_settings` — Global administrative settings and emergency recovery keys.
27. `admin_invites` — Staff onboarding tokens.
28. `admin_users` — Legacy administrative roles (retained for backward compatibility).
29. `store_settings` — Store identity, contact numbers, email, operational info.
30. `system_settings` — Feature flags and maintenance mode switches.
31. `pricing_settings` — Price visibility flags (e.g. "hide prices for guests").

### 5.4 CMS & Brand Trust Content (P1_ACTIVE — 9 Tables)
32. `policies` — Legal and commercial policy markdown pages.
33. `why_choose_hero` — Hero content for "Why Choose Us" page.
34. `why_choose_items` — Value proposition feature items.
35. `why_choose_stats` — Statistical callouts (e.g. installations, clients).
36. `why_choose_cta` — Bottom conversion call-to-action block.
37. `warranty_hero` — Warranty page hero content.
38. `warranty_period` — Warranty duration breakdown by product class.
39. `warranty_coverage` — Covered vs non-covered terms.
40. `warranty_claim_steps` — Step-by-step warranty claim instructions.

### 5.5 E-Commerce, Customer Accounts & Deferred Features (P2_DEFERRED — 33 Tables)
41. `carts`, 42. `cart_items`, 43. `orders`, 44. `order_items`, 45. `order_audit_log`, 46. `checkout_sessions`, 47. `payment_transactions`, 48. `payment_settings`, 49. `tax_settings`, 50. `shipping_settings`, 51. `pickup_locations`, 52. `wishlists`, 53. `wishlist_items`, 54. `user_favourites`, 55. `recently_viewed`, 56. `product_reviews`, 57. `customer_notes`, 58. `customer_meta`, 59. `user_profiles`, 60. `profiles`, 61. `users`, 62. `user_addresses`, 63. `businesses`, 64. `business_members`, 65. `business_addresses`, 66. `business_documents`, 67. `business_verifications`, 68. `business_verification_documents`, 69. `verification_documents`, 70. `verification_audit_log`, 71. `documents`, 72. `inventory_items`, 73. `inventory_adjustments`.

---

## 6. External Integrations Inventory

| Service | Category | Usage in Application | Phase 1 Status |
|---|---|---|---|
| **Supabase (PostgreSQL + Auth)** | Infrastructure | Primary database and exclusive admin authentication. | **P1_ACTIVE** |
| **Cloudinary** | Media CDN | Product imagery, catalog attachments, hero banners. | **P1_ACTIVE** |
| **Resend** | Transactional Email | Quote submission notifications, admin recovery emails. | **P1_ACTIVE** |
| **Clerk** | Customer Auth | Storefront user session management (dormant in P1). | **INTERNAL_DEPENDENCY** |
| **Razorpay** | Payment Gateway | Online credit card/UPI transactions for orders. | **P2_DEFERRED** |
| **Upstash Redis** | Cache / Rate Limit | API route throttling and catalogue caching. | **INTERNAL_DEPENDENCY** |
| **jsPDF / React-PDF** | Document Generation| Quotation PDF generation. | **P1_ACTIVE** |
| **Pusher** | Realtime WebSockets | Live order/quote notifications (optional). | **P2_DEFERRED** |
| **PapaParse / XLSX** | Data Processing | CSV product export and template import. | **P1_ACTIVE** |
