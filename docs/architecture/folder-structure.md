# Cedar Elevators - Complete Folder Structure

A comprehensive tree-like structure of all files and folders with their purposes.

## 📁 Root Directory

```
cedarelevators/
├── 📄 package.json                      # Project dependencies and scripts
├── 📄 pnpm-lock.yaml                    # PNPM lockfile for dependency versions
├── 📄 pnpm-workspace.yaml               # PNPM workspace configuration
├── 📄 next.config.ts                    # Next.js configuration
├── 📄 tsconfig.json                     # TypeScript configuration
├── 📄 tailwind.config.js                # Tailwind CSS configuration
├── 📄 postcss.config.mjs                # PostCSS configuration
├── 📄 eslint.config.mjs                 # ESLint configuration
├── 📄 vercel.json                       # Vercel deployment configuration
├── 📄 .env                              # Environment variables
├── 📄 .gitignore                        # Git ignore rules
├── 📄 .npmrc                            # NPM configuration
├── 📄 LICENSE                           # Project license
│
├── 📂 src/                              # Source code directory
├── 📂 public/                           # Static assets
├── 📂 database/                         # Database migrations and schemas
├── 📂 supabase/                         # Supabase configuration
├── 📂 docs/                             # Documentation files
├── 📂 scripts/                          # Build and utility scripts
├── 📂 .next/                            # Next.js build output (generated)
└── 📂 node_modules/                     # Dependencies (generated)
```

---

## 📂 src/ - Source Code

### 🎯 Top-Level Structure

```
src/
├── 📂 app/                              # Next.js App Router pages
├── 📂 modules/                          # Feature modules (UI components organized by feature)
├── 📂 lib/                              # Core library code (utilities, services, types)
├── 📂 components/                       # Shared React components
├── 📂 hooks/                            # Custom React hooks
├── 📂 domains/                          # Domain-specific logic
├── 📂 contexts/                         # React context providers
├── 📂 types/                            # Global TypeScript types
├── 📂 styles/                           # Global styles
├── 📂 scripts/                          # Source scripts
└── 📄 proxy.ts                          # API proxy configuration
```

---

## 📂 src/app/ - Next.js App Router

### Route Groups & Pages

```
app/
├── 📄 layout.tsx                        # Root layout
├── 📄 error.tsx                         # Global error boundary
├── 📄 loading.tsx                       # Global loading UI
├── 📄 not-found.tsx                     # 404 page
├── 📄 manifest.ts                       # PWA manifest
├── 📄 robots.ts                         # Robots.txt generation
├── 📄 sitemap.ts                        # Sitemap generation
├── 🖼️ favicon.ico                       # Favicon
├── 🖼️ apple-icon.png                    # Apple touch icon
│
├── 📂 (auth)/                           # Authentication route group
│   ├── 📄 layout.tsx                    # Auth pages layout
│   ├── 📂 sign-in/[[...sign-in]]/       # Clerk sign-in (catch-all)
│   │   └── 📄 page.tsx
│   ├── 📂 sign-up/[[...sign-up]]/       # Clerk sign-up (catch-all)
│   │   └── 📄 page.tsx
│   ├── 📂 choose-type/                  # Account type selection
│   │   └── 📄 page.tsx
│   ├── 📂 individual-signup/            # Individual registration
│   │   └── 📄 page.tsx
│   ├── 📂 business-signup/              # Business registration
│   │   └── 📄 page.tsx
│   ├── 📂 forgot-password/              # Password recovery
│   │   └── 📄 page.tsx
│   ├── 📂 reset-password/               # Password reset
│   │   └── 📄 page.tsx
│   ├── 📂 verify-otp/                   # OTP verification
│   │   └── 📄 page.tsx
│   └── 📂 sso-callback/                 # SSO callback handler
│       └── 📄 page.tsx
│
├── 📂 (checkout)/                       # Checkout route group
│   ├── 📄 layout.tsx                    # Checkout layout
│   ├── 📂 checkout/                     # Checkout flow
│   │   └── 📄 page.tsx
│   └── 📂 order-confirmation/[id]/      # Order confirmation
│       └── 📄 page.tsx
│
├── 📂 (main)/                           # Main storefront route group
│   ├── 📄 layout.tsx                    # Main layout
│   ├── 📄 page.tsx                      # Homepage
│   │
│   ├── 📂 about/                        # About page
│   │   └── 📄 page.tsx
│   ├── 📂 contact/                      # Contact page
│   │   ├── 📄 page.tsx
│   │   └── 📄 contact-page-client.tsx  # Client component
│   │
│   ├── 📂 catalog/                      # Product catalog
│   │   └── 📄 page.tsx
│   ├── 📂 categories/[handle]/          # Category pages (dynamic)
│   │   └── 📄 page.tsx
│   ├── 📂 products/                     # Products
│   │   ├── 📄 layout.tsx
│   │   └── 📂 [handle]/                 # Product detail (dynamic)
│   │       ├── 📄 page.tsx
│   │       ├── 📄 product-detail-client.tsx
│   │       └── 📄 not-found.tsx
│   │
│   ├── 📂 cart/                         # Shopping cart
│   │   └── 📄 page.tsx
│   ├── 📂 wishlist/                     # Wishlist
│   │   └── 📄 page.tsx
│   │
│   ├── 📂 dashboard/                    # User dashboard
│   │   └── 📄 page.tsx
│   ├── 📂 notifications/                # Notifications
│   │   ├── 📄 page.tsx
│   │   └── 📂 test/                     # Test notification page
│   │       └── 📄 page.tsx
│   │
│   ├── 📂 profile/                      # User profile section
│   │   ├── 📄 layout.tsx                # Profile layout with sidebar
│   │   ├── 📄 page.tsx                  # Profile overview
│   │   ├── 📄 error.tsx                 # Profile error boundary
│   │   ├── 📄 loading.tsx               # Profile loading state
│   │   ├── 📄 not-found.tsx             # Profile 404
│   │   ├── 📂 account/                  # Account settings
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 addresses/                # Address management
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 orders/                   # Order history
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 wishlist/                 # Wishlist management
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 notifications/            # Notification preferences
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 password/                 # Change password
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 verification/             # Account verification
│   │   │   └── 📄 page.tsx
│   │   └── 📂 business/                 # Business profile
│   │       └── 📂 verification/
│   │           └── 📄 page.tsx
│   │
│   ├── 📂 quotes/                       # Quote management
│   │   ├── 📄 page.tsx                  # Quotes list
│   │   ├── 📄 quotes-page-client.tsx
│   │   └── 📂 [id]/                     # Quote detail (dynamic)
│   │       ├── 📄 page.tsx
│   │       └── 📄 quote-detail-client.tsx
│   ├── 📂 request-quote/                # Request quote form
│   │   └── 📄 page.tsx
│   │
│   ├── 📂 policies/[slug]/              # Dynamic policy pages
│   │   └── 📄 page.tsx
│   ├── 📂 returns/                      # Returns page
│   │   └── 📄 page.tsx
│   ├── 📂 shipping/                     # Shipping info
│   │   └── 📄 page.tsx
│   └── 📂 warranty/                     # Warranty info
│       └── 📄 page.tsx
│
├── 📂 admin/                            # Admin panel
│   ├── 📂 (auth)/                       # Admin authentication
│   │   ├── 📄 layout.tsx
│   │   ├── 📂 login/
│   │   ├── 📂 setup/
│   │   ├── 📂 pending/
│   │   ├── 📂 invite/[token]/
│   │   ├── 📂 recover/
│   │   └── 📂 logout/
│   │
│   └── 📂 (dashboard)/                  # Admin dashboard
│       ├── 📄 layout.tsx                # Dashboard layout
│       ├── 📄 page.tsx                  # Dashboard home
│       ├── 📂 analytics/                # Analytics
│       ├── 📂 activity-log/             # Activity logs
│       ├── 📂 reports/                  # Reports
│       ├── 📂 products/                 # Product management
│       ├── 📂 categories/               # Category management
│       ├── 📂 collections/              # Collection management
│       ├── 📂 applications/             # Application management
│       ├── 📂 elevator-types/           # Elevator type management
│       ├── 📂 orders/                   # Order management
│       ├── 📂 quotes/                   # Quote management
│       ├── 📂 customers/                # Customer management
│       ├── 📂 business-verification/    # Business verification queue
│       ├── 📂 banners/                  # Banner management
│       ├── 📂 coupons/                  # Coupon management
│       ├── 📂 inventory/                # Inventory management
│       ├── 📂 bulk-operations/          # Bulk operations
│       └── 📂 settings/                 # Settings
│           ├── 📄 layout.tsx            # Settings layout
│           ├── 📄 page.tsx              # Settings overview
│           ├── 📂 general/
│           ├── 📂 profile/
│           ├── 📂 store/
│           ├── 📂 shipping/
│           ├── 📂 payments/
│           ├── 📂 policies/
│           └── 📂 system/
│
├── 📂 search/                           # Search page
│   └── 📄 page.tsx
│
└── 📂 api/                              # API routes
    ├── 📂 auth/                         # Authentication APIs
    ├── 📂 admin/                        # Admin APIs (24 endpoints)
    ├── 📂 analytics/                    # Analytics APIs
    ├── 📂 notifications/                # Notification APIs
    ├── 📂 orders/                       # Order APIs
    ├── 📂 payments/                     # Payment APIs
    ├── 📂 profile/                      # Profile APIs
    ├── 📂 store/                        # Store APIs
    ├── 📂 upload/                       # File upload
    ├── 📂 upload-cloudinary/            # Cloudinary upload
    ├── 📂 verification-documents/       # Document upload
    └── 📂 webhooks/                     # Webhook handlers
```

---

## 📂 src/modules/ - Feature Modules

Feature-based UI components organized by application domain.

```
modules/
├── 📂 admin/                            # Admin panel components (70 files)
│   ├── 📂 components/                   # Admin UI components
│   ├── 📂 pages/                        # Admin page components
│   └── 📂 hooks/                        # Admin-specific hooks
│
├── 📂 auth/                             # Authentication (20 files)
│   ├── 📂 components/                   # Auth forms and UI
│   ├── 📂 hooks/                        # Auth hooks
│   └── 📂 utils/                        # Auth utilities
│
├── 📂 cart/                             # Shopping cart (4 files)
│   ├── 📂 components/                   # Cart UI components
│   └── 📄 cart-item.tsx
│
├── 📂 catalog/                          # Product catalog (22 files)
│   ├── 📂 components/                   # Catalog components
│   ├── 📂 filters/                      # Filter components
│   └── 📂 sections/                     # Catalog sections
│
├── 📂 checkout/                         # Checkout flow (25 files)
│   ├── 📂 components/                   # Checkout UI
│   ├── 📂 steps/                        # Multi-step checkout
│   ├── 📂 payment/                      # Payment components
│   └── 📂 confirmation/                 # Order confirmation
│
├── 📂 collections/                      # Product collections (4 files)
│   └── 📂 components/
│
├── 📂 dashboard/                        # User dashboard (4 files)
│   └── 📂 components/
│
├── 📂 home/                             # Homepage (52 files)
│   ├── 📂 components/                   # Home components
│   │   ├── 📂 desktop/                  # Desktop-specific
│   │   │   ├── 📂 tab-content/
│   │   │   │   ├── 📂 categories/       # Category tabs
│   │   │   │   ├── 📂 applications/     # Application tabs
│   │   │   │   └── 📂 elevator-types/   # Elevator type tabs
│   │   │   └── 📂 sections/
│   │   └── 📂 mobile/                   # Mobile-specific
│   ├── 📂 hero/                         # Hero sections
│   ├── 📂 features/                     # Feature sections
│   └── 📂 testimonials/                 # Testimonials
│
├── 📂 layout/                           # Layout components (57 files)
│   ├── 📂 header/                       # Header/Navbar
│   │   ├── 📄 header.tsx
│   │   ├── 📄 navbar.tsx
│   │   ├── 📄 search-bar.tsx
│   │   ├── 📄 cart-button.tsx
│   │   └── 📄 user-menu.tsx
│   ├── 📂 footer/                       # Footer
│   │   ├── 📄 footer.tsx
│   │   └── 📄 footer-links.tsx
│   ├── 📂 sidebar/                      # Sidebars
│   │   ├── 📄 profile-sidebar.tsx
│   │   └── 📄 admin-sidebar.tsx
│   └── 📂 mobile/                       # Mobile navigation
│       ├── 📄 mobile-nav.tsx
│       └── 📄 mobile-menu.tsx
│
├── 📂 orders/                           # Order components (1 file)
│   └── 📄 order-tracking.tsx
│
├── 📂 products/                         # Product components (24 files)
│   ├── 📂 components/                   # Product UI
│   │   ├── 📄 product-card.tsx
│   │   ├── 📄 product-grid.tsx
│   │   ├── 📄 product-list.tsx
│   │   ├── 📄 product-detail.tsx
│   │   ├── 📄 product-images.tsx
│   │   ├── 📄 product-info.tsx
│   │   ├── 📄 product-price.tsx
│   │   ├── 📄 variant-selector.tsx
│   │   └── 📄 add-to-cart-button.tsx
│   ├── 📂 filters/                      # Product filters
│   └── 📂 sections/                     # Product sections
│
├── 📂 profile/                          # Profile management (52 files)
│   ├── 📂 components/                   # Profile components
│   │   ├── 📂 sections/
│   │   │   ├── 📄 account-section.tsx
│   │   │   ├── 📄 addresses-section.tsx
│   │   │   ├── 📄 orders-section.tsx
│   │   │   ├── 📄 quotes-section.tsx
│   │   │   └── 📄 business-section.tsx
│   │   └── 📂 forms/
│   ├── 📂 tabs/                         # Profile tabs
│   └── 📂 business/                     # Business profile
│
├── 📂 quote/                            # Quote system (28 files)
│   ├── 📂 components/                   # Quote components
│   │   ├── 📄 quote-form.tsx
│   │   ├── 📄 quote-list.tsx
│   │   ├── 📄 quote-card.tsx
│   │   ├── 📄 quote-detail.tsx
│   │   └── 📄 quote-status-timeline.tsx
│   ├── 📂 forms/                        # Quote forms
│   └── 📂 steps/                        # Multi-step quote flow
│
└── 📂 wishlist/                         # Wishlist (3 files)
    ├── 📄 wishlist-grid.tsx
    └── 📄 wishlist-item.tsx
```

---

## 📂 src/lib/ - Core Library

Core functionality, utilities, and services.

```
lib/
├── 📂 actions/                          # Server actions (51 files)
│   ├── 📄 products.ts                   # Product actions
│   ├── 📄 cart.ts                       # Cart actions
│   ├── 📄 orders.ts                     # Order actions
│   ├── 📄 quotes.ts                     # Quote actions
│   ├── 📄 auth.ts                       # Auth actions
│   ├── 📄 profile.ts                    # Profile actions
│   ├── 📄 wishlist.ts                   # Wishlist actions
│   └── ...                              # Other actions
│
├── 📂 admin/                            # Admin utilities (4 files)
│   ├── 📄 permissions.ts
│   └── 📄 roles.ts
│
├── 📄 admin-auth-client.ts              # Admin auth (client)
├── 📄 admin-auth-server.ts              # Admin auth (server)
│
├── 📂 analytics/                        # Analytics (1 file)
│   └── 📄 tracking.ts
│
├── 📂 auth/                             # Auth utilities (4 files)
│   ├── 📄 clerk.ts                      # Clerk integration
│   ├── 📄 session.ts                    # Session management
│   └── 📄 permissions.ts
│
├── 📂 catalog/                          # Catalog utilities (3 files)
│   ├── 📄 filters.ts
│   ├── 📄 sorting.ts
│   └── 📄 search.ts
│
├── 📂 cloudinary/                       # Cloudinary integration (2 files)
│   ├── 📄 config.ts
│   └── 📄 upload.ts
│
├── 📂 config/                           # Configuration (6 files)
│   ├── 📄 site.ts                       # Site config
│   ├── 📄 navigation.ts                 # Navigation config
│   ├── 📄 features.ts                   # Feature flags
│   └── 📄 env.ts                        # Environment validation
│
├── 📂 constants/                        # Constants (4 files)
│   ├── 📄 routes.ts                     # Route constants
│   ├── 📄 statuses.ts                   # Status constants
│   └── 📄 messages.ts                   # Message constants
│
├── 📂 context/                          # React contexts (2 files)
│   ├── 📄 cart-context.tsx
│   └── 📄 wishlist-context.tsx
│
├── 📂 data/                             # Data files (8 files)
│   ├── 📄 categories.ts                 # Category data
│   ├── 📄 applications.ts               # Application data
│   └── 📄 elevator-types.ts             # Elevator type data
│
├── 📂 db/                               # Database (1 file)
│   └── 📄 schema.ts                     # Database schema types
├── 📄 db.ts                             # Database client
│
├── 📂 hooks/                            # Custom hooks (10 files)
│   ├── 📄 use-cart.ts
│   ├── 📄 use-wishlist.ts
│   ├── 📄 use-auth.ts
│   ├── 📄 use-products.ts
│   └── ...
│
├── 📂 middleware/                       # Middleware (2 files)
│   ├── 📄 auth.ts
│   └── 📄 admin.ts
│
├── 📂 monitoring/                       # Monitoring (1 file)
│   └── 📄 logger.ts
│
├── 📂 pusher/                           # Real-time (Pusher) (2 files)
│   ├── 📄 client.ts
│   └── 📄 server.ts
│
├── 📄 quote-permissions.ts              # Quote permissions logic
├── 📄 quote-state-machine.ts            # Quote state machine
│
├── 📂 reports/                          # Reporting (1 file)
│   └── 📄 generator.ts
│
├── 📂 seo/                              # SEO utilities (2 files)
│   ├── 📄 metadata.ts                   # Metadata generation
│   └── 📄 schema.ts                     # Schema.org markup
│
├── 📂 services/                         # Business logic services (16 files)
│   ├── 📄 product-service.ts            # Product business logic
│   ├── 📄 order-service.ts              # Order processing
│   ├── 📄 quote-service.ts              # Quote processing
│   ├── 📄 cart-service.ts               # Cart management
│   ├── 📄 payment-service.ts            # Payment processing
│   ├── 📄 email-service.ts              # Email service
│   ├── 📄 notification-service.ts       # Notifications
│   └── ...
│
├── 📂 supabase/                         # Supabase integration (2 files)
│   ├── 📄 client.ts                     # Client-side Supabase
│   └── 📄 server.ts                     # Server-side Supabase
│
├── 📂 types/                            # TypeScript types (20 files)
│   ├── 📄 products.ts                   # Product types
│   ├── 📄 orders.ts                     # Order types
│   ├── 📄 quotes.ts                     # Quote types
│   ├── 📄 users.ts                      # User types
│   ├── 📄 cart.ts                       # Cart types
│   ├── 📄 database.ts                   # Database types
│   └── ...
│
└── 📂 utils/                            # Utility functions (17 files)
    ├── 📄 cn.ts                         # Class name utility
    ├── 📄 format.ts                     # Formatting utilities
    ├── 📄 validation.ts                 # Validation helpers
    ├── 📄 date.ts                       # Date utilities
    ├── 📄 currency.ts                   # Currency formatting
    ├── 📄 string.ts                     # String utilities
    ├── 📄 array.ts                      # Array utilities
    ├── 📄 lucide-icon-map.ts            # Icon mapping
    └── ...
```

---

## 📂 src/components/ - Shared Components

Reusable UI components used across the application.

```
components/
├── 📂 ui/                               # shadcn/ui components (50 files)
│   ├── 📄 button.tsx
│   ├── 📄 input.tsx
│   ├── 📄 card.tsx
│   ├── 📄 dialog.tsx
│   ├── 📄 dropdown-menu.tsx
│   ├── 📄 form.tsx
│   ├── 📄 label.tsx
│   ├── 📄 select.tsx
│   ├── 📄 textarea.tsx
│   ├── 📄 badge.tsx
│   ├── 📄 avatar.tsx
│   ├── 📄 tabs.tsx
│   ├── 📄 toast.tsx
│   ├── 📄 table.tsx
│   ├── 📄 pagination.tsx
│   ├── 📄 skeleton.tsx
│   ├── 📄 separator.tsx
│   ├── 📄 sheet.tsx
│   ├── 📄 popover.tsx
│   ├── 📄 tooltip.tsx
│   └── ...                              # More UI primitives
│
├── 📂 common/                           # Common components (16 files)
│   ├── 📄 loading-spinner.tsx
│   ├── 📄 empty-state.tsx
│   ├── 📄 error-message.tsx
│   ├── 📄 breadcrumbs.tsx
│   ├── 📄 page-header.tsx
│   ├── 📄 section-heading.tsx
│   └── ...
│
├── 📂 admin/                            # Admin-specific components (15 files)
│   ├── 📄 admin-header.tsx
│   ├── 📄 admin-sidebar.tsx
│   ├── 📄 data-table.tsx
│   ├── 📄 stats-card.tsx
│   └── ...
│
├── 📂 guards/                           # Route guards (4 files)
│   ├── 📄 auth-guard.tsx                # Authentication guard
│   ├── 📄 admin-guard.tsx               # Admin role guard
│   ├── 📄 business-guard.tsx            # Business verification guard
│   └── 📄 guest-guard.tsx               # Guest-only guard
│
├── 📂 providers/                        # Context providers (3 files)
│   ├── 📄 query-provider.tsx            # React Query provider
│   ├── 📄 theme-provider.tsx            # Theme provider
│   └── 📄 toast-provider.tsx            # Toast notifications
│
├── 📂 seo/                              # SEO components (1 file)
│   └── 📄 structured-data.tsx           # JSON-LD structured data
│
├── 📂 shared/                           # Shared utility components (10 files)
│   ├── 📄 image-upload.tsx
│   ├── 📄 file-upload.tsx
│   ├── 📄 rich-text-editor.tsx
│   ├── 📄 date-picker.tsx
│   └── ...
│
├── 📂 store/                            # Store-specific components (7 files)
│   ├── 📄 price-display.tsx
│   ├── 📄 stock-badge.tsx
│   ├── 📄 rating-stars.tsx
│   └── ...
│
├── 📂 storefront/                       # Storefront components (2 files)
│   ├── 📄 banner.tsx
│   └── 📄 category-nav.tsx
│
├── 📂 dashboard/                        # Dashboard widgets (2 files)
│   ├── 📄 stats-widget.tsx
│   └── 📄 chart-widget.tsx
│
├── 📄 business-verification-card.tsx    # Business verification card
├── 📄 product-image-carousel.tsx        # Product image carousel
└── 📄 profile-switcher.tsx              # Profile type switcher
```

---

## 📂 src/hooks/ - Custom React Hooks

```
hooks/
├── 📄 use-auth.ts                       # Authentication hook
├── 📄 use-user.ts                       # User data hook
├── 📄 use-cart.ts                       # Shopping cart hook
├── 📄 use-wishlist.ts                   # Wishlist hook
├── 📄 use-products.ts                   # Product fetching hook
├── 📄 use-orders.ts                     # Orders hook
├── 📄 use-quotes.ts                     # Quotes hook
├── 📄 use-profile.ts                    # Profile hook
├── 📄 use-notifications.ts              # Notifications hook
├── 📄 use-debounce.ts                   # Debounce hook
├── 📄 use-media-query.ts                # Media query hook
├── 📄 use-local-storage.ts              # LocalStorage hook
├── 📄 use-toast.ts                      # Toast notifications hook
├── 📄 use-pagination.ts                 # Pagination hook
├── 📄 use-filters.ts                    # Filters hook
├── 📄 use-search.ts                     # Search hook
├── 📄 use-business-verification.ts      # Business verification hook
└── ...                                  # (~20 total files)
```

---

## 📂 src/domains/ - Domain Logic

Business domain-specific logic and components.

```
domains/
├── 📂 admin/                            # Admin domain
│   ├── 📂 quotes/                       # Admin quote management
│   ├── 📂 orders/                       # Admin order management
│   ├── 📂 customers/                    # Admin customer management
│   └── 📂 settings/                     # Admin settings
│
├── 📂 catalog/                          # Catalog domain
├── 📂 checkout/                         # Checkout domain
├── 📂 profile/                          # Profile domain
└── ...                                  # (~16 total subdirectories)
```

---

## 📂 src/contexts/ - React Contexts

```
contexts/
└── 📄 app-context.tsx                   # Global app context
```

---

## 📂 src/types/ - Global Types

```
types/
├── 📄 global.d.ts                       # Global type declarations
├── 📄 api.ts                            # API types
├── 📄 common.ts                         # Common types
└── 📄 env.d.ts                          # Environment types
```

---

## 📂 src/styles/ - Global Styles

```
styles/
└── 📄 globals.css                       # Global CSS (Tailwind imports)
```

---

## 📂 Other Important Directories

### 📂 database/

```
database/
├── 📂 migrations/                       # SQL migrations
└── 📄 schema.sql                        # Database schema
```

### 📂 supabase/

```
supabase/
├── 📂 migrations/                       # Supabase migrations (34 files)
├── 📄 config.toml                       # Supabase configuration
└── 📄 seed.sql                          # Seed data
```

### 📂 docs/

```
docs/                                    # Documentation (51 files)
├── 📄 README.md
├── 📄 ARCHITECTURE.md
├── 📄 API.md
├── 📄 DEPLOYMENT.md
└── ...
```

### 📂 scripts/

```
scripts/
├── 📄 seed.ts                           # Data seeding
├── 📄 migrate.ts                        # Migration runner
└── ...                                  # Build and utility scripts
```

### 📂 public/

```
public/
└── 📂 images/                           # Static images
```

---

## 📊 Summary Statistics

- **Total Source Files**: 850+
- **App Routes**: 97+ pages
- **Feature Modules**: 14 modules
- **UI Components**: 100+ components
- **Custom Hooks**: 20+ hooks
- **Server Actions**: 51 actions
- **API Routes**: 50+ endpoints
- **Type Definitions**: 20+ type files
- **Database Migrations**: 34 migrations

---

## 🎯 Key Architectural Patterns

### 1. **Feature-Based Organization**
- Modules organized by feature (home, products, cart, checkout, etc.)
- Each module contains its own components, hooks, and utilities

### 2. **Separation of Concerns**
- **app/**: Routing and pages (thin layer)
- **modules/**: Feature UI components
- **lib/**: Business logic, services, utilities
- **components/**: Reusable shared components

### 3. **Type Safety**
- Comprehensive TypeScript types in `lib/types/`
- Database types generated from Supabase
- Strict type checking throughout

### 4. **Server-First Approach**
- Server components by default
- Server actions for mutations
- Client components only when needed

### 5. **Layered Architecture**
```
Presentation Layer (app/ + modules/)
    ↓
Business Logic Layer (lib/services/)
    ↓
Data Access Layer (lib/actions/ + lib/supabase/)
    ↓
Database (Supabase)
```

---

*Last Updated: 2026-01-04*  
*Generated from Cedar Elevators codebase analysis*
