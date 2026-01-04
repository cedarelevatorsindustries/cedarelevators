/**
 * Centralized route constants for Cedar Elevators application
 * Provides type-safe route builders and constants
 */

// ============================================================================
// Public Store Routes
// ============================================================================

export const ROUTES = {
    // Homepage
    HOME: '/',

    // Catalog
    CATALOG: '/catalog',
    CATALOG_APPLICATIONS: (handle: string) => `/catalog/applications/${handle}`,
    CATALOG_CATEGORIES: (handle: string) => `/catalog/categories/${handle}`,
    CATALOG_TYPES: (handle: string) => `/catalog/types/${handle}`,
    CATALOG_COLLECTIONS: (handle: string) => `/catalog/collections/${handle}`,

    // Products
    PRODUCT: (handle: string) => `/products/${handle}`,

    // Shopping
    CART: '/cart',
    WISHLIST: '/wishlist',
    CHECKOUT: '/checkout',
    ORDER_CONFIRMATION: (id: string) => `/order-confirmation/${id}`,

    // Quotes
    REQUEST_QUOTE: '/quotes/new',
    QUOTES: '/quotes',
    QUOTE_DETAIL: (id: string) => `/quotes/${id}`,

    // Profile
    PROFILE: '/profile',
    PROFILE_ACCOUNT: '/profile/account',
    PROFILE_ADDRESSES: '/profile/addresses',
    PROFILE_ORDERS: '/profile/orders',
    PROFILE_WISHLIST: '/profile/wishlist',
    PROFILE_NOTIFICATIONS: '/profile/notifications',
    PROFILE_PASSWORD: '/profile/password',
    PROFILE_VERIFICATION: '/profile/verification',
    PROFILE_BUSINESS: '/profile/business',

    // Information Pages
    ABOUT: '/about',
    CONTACT: '/contact',
    POLICIES: (slug: string) => `/policies/${slug}`,
    RETURNS: '/returns',
    SHIPPING: '/shipping',
    WARRANTY: '/warranty',

    // Dashboard
    DASHBOARD: '/dashboard',
    NOTIFICATIONS: '/notifications',

    // Authentication
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',
    CHOOSE_TYPE: '/choose-type',
    INDIVIDUAL_SIGNUP: '/individual-signup',
    BUSINESS_SIGNUP: '/business-signup',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_OTP: '/verify-otp',
} as const

// ============================================================================
// Admin Routes
// ============================================================================

export const ADMIN_ROUTES = {
    // Auth
    LOGIN: '/admin/login',
    LOGOUT: '/admin/logout',
    SETUP: '/admin/setup',
    PENDING: '/admin/pending',
    INVITE: (token: string) => `/admin/invite/${token}`,
    RECOVER: '/admin/recover',

    // Dashboard
    DASHBOARD: '/admin',
    ANALYTICS: '/admin/analytics',
    ACTIVITY_LOG: '/admin/activity-log',
    REPORTS: '/admin/reports',

    // Products
    PRODUCTS: '/admin/products',
    PRODUCTS_CREATE: '/admin/products/create',
    PRODUCTS_IMPORT: '/admin/products/import',
    PRODUCT_DETAIL: (id: string) => `/admin/products/${id}`,
    PRODUCT_EDIT: (id: string) => `/admin/products/${id}/edit`,
    PRODUCT_VARIANTS: (id: string) => `/admin/products/${id}/variants`,
    PRODUCT_VARIANT_CREATE: (id: string) => `/admin/products/${id}/variants/create-edit`,
    PRODUCT_VARIANT_DETAIL: (id: string, variantId: string) => `/admin/products/${id}/variants/${variantId}`,

    // Catalog
    CATEGORIES: '/admin/categories',
    CATEGORIES_CREATE: '/admin/categories/create',
    CATEGORY_DETAIL: (id: string) => `/admin/categories/${id}`,
    CATEGORY_EDIT: (id: string) => `/admin/categories/${id}/edit`,

    COLLECTIONS: '/admin/collections',
    COLLECTIONS_CREATE: '/admin/collections/create',
    COLLECTION_DETAIL: (id: string) => `/admin/collections/${id}`,
    COLLECTION_EDIT: (id: string) => `/admin/collections/${id}/edit`,

    APPLICATIONS: '/admin/applications',
    APPLICATIONS_CREATE: '/admin/applications/create',
    APPLICATION_DETAIL: (id: string) => `/admin/applications/${id}`,
    APPLICATION_EDIT: (id: string) => `/admin/applications/${id}/edit`,

    ELEVATOR_TYPES: '/admin/elevator-types',
    ELEVATOR_TYPES_CREATE: '/admin/elevator-types/create',
    ELEVATOR_TYPE_DETAIL: (id: string) => `/admin/elevator-types/${id}`,
    ELEVATOR_TYPE_EDIT: (id: string) => `/admin/elevator-types/${id}/edit`,

    // Orders & Quotes
    ORDERS: '/admin/orders',
    ORDER_DETAIL: (id: string) => `/admin/orders/${id}`,

    QUOTES: '/admin/quotes',
    QUOTE_DETAIL: (id: string) => `/admin/quotes/${id}`,

    // Customers
    CUSTOMERS: '/admin/customers',
    CUSTOMER_DETAIL: (id: string) => `/admin/customers/${id}`,
    BUSINESS_VERIFICATION: '/admin/business-verification',
    BUSINESS_VERIFICATION_DETAIL: (id: string) => `/admin/business-verification/${id}`,

    // Marketing
    BANNERS: '/admin/banners',
    BANNERS_CREATE: '/admin/banners/create',
    BANNER_EDIT: (id: string) => `/admin/banners/${id}/edit`,

    COUPONS: '/admin/coupons',
    INVENTORY: '/admin/inventory',
    BULK_OPERATIONS: '/admin/bulk-operations',

    // Settings
    SETTINGS: '/admin/settings',
    SETTINGS_GENERAL: '/admin/settings/general',
    SETTINGS_PROFILE: '/admin/settings/profile',
    SETTINGS_STORE: '/admin/settings/store',
    SETTINGS_SHIPPING: '/admin/settings/shipping',
    SETTINGS_PAYMENTS: '/admin/settings/payments',
    SETTINGS_POLICIES: '/admin/settings/policies',
    SETTINGS_SYSTEM: '/admin/settings/system',
} as const

// ============================================================================
// API Routes
// ============================================================================

export const API_ROUTES = {
    // Store
    STORE: '/api/store',
    ANALYTICS: '/api/analytics',
    NOTIFICATIONS: '/api/notifications',
    ORDERS: '/api/orders',
    PAYMENTS: '/api/payments',
    PROFILE: '/api/profile',

    // Admin
    ADMIN: '/api/admin',

    // Auth
    AUTH: '/api/auth',

    // Upload
    UPLOAD: '/api/upload',
    UPLOAD_CLOUDINARY: '/api/upload-cloudinary',
    VERIFICATION_DOCUMENTS: '/api/verification-documents',

    // Webhooks
    WEBHOOKS: '/api/webhooks',
} as const

// ============================================================================
// Type Exports
// ============================================================================

export type Route = typeof ROUTES[keyof typeof ROUTES]
export type AdminRoute = typeof ADMIN_ROUTES[keyof typeof ADMIN_ROUTES]
export type ApiRoute = typeof API_ROUTES[keyof typeof API_ROUTES]

