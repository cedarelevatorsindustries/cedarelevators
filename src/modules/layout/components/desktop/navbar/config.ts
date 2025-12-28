/**
 * Navbar Configuration System
 * 
 * Centralized configuration for all navbar variants across the application.
 * Each page type has its own configuration defining behavior and appearance.
 */

export type NavbarVariant =
  | 'homepage'
  | 'category-hero'
  | 'category-standard'
  | 'browse-products'
  | 'product-detail'
  | 'search-results'
  | 'checkout'
  | 'account'
  | 'content-pages'

export interface NavbarConfig {
  // Layout
  position: 'fixed' | 'absolute'
  transparent: boolean
  scrollBehavior: 'hero-fade' | 'sticky' | 'sticky-with-product-bar' | 'static'
  height: {
    initial: number
    scrolled: number
  }

  // Desktop Elements
  showMegaMenu: boolean
  showBrowseProducts: boolean
  showBreadcrumb: boolean
  showSecondaryFilterBar: boolean
  showStickyProductBar: boolean
  showCategoryHero: boolean

  // Mobile Elements
  mobile: {
    showLogo: boolean
    showPageTitle: boolean
    transparentTopBar: boolean
    showBottomNav: boolean
    showSidebar: boolean
  }

  // Search variant
  searchVariant: 'full' | 'compact' | 'hidden'

  // Scroll threshold (px)
  scrollThreshold: number

  // Z-index
  zIndex: {
    initial: number
    scrolled: number
  }

  // Simplified mode (for checkout)
  simplified?: boolean
  showOnlyEssentials?: Array<'logo' | 'search' | 'cart' | 'help' | 'profile'>
}

export const navbarConfig: Record<NavbarVariant, NavbarConfig> = {
  // 1. Homepage - Hero with transparent navbar
  homepage: {
    position: 'absolute',
    transparent: true,
    scrollBehavior: 'hero-fade',
    showMegaMenu: true,
    showBrowseProducts: false,
    showBreadcrumb: false,
    showSecondaryFilterBar: false,
    showStickyProductBar: false,
    showCategoryHero: false,
    searchVariant: 'full',
    scrollThreshold: 175,
    height: {
      initial: 80,
      scrolled: 70,
    },
    zIndex: {
      initial: 50,
      scrolled: 1000,
    },
    mobile: {
      showLogo: true,
      showPageTitle: false,
      transparentTopBar: true,
      showBottomNav: true,
      showSidebar: true,
    },
  },

  // 2. Category Hero - Alibaba-style with mini category banner
  'category-hero': {
    position: 'fixed',
    transparent: false,
    scrollBehavior: 'sticky',
    showMegaMenu: false,
    showBrowseProducts: true,
    showBreadcrumb: false,
    showSecondaryFilterBar: false,
    showStickyProductBar: false,
    showCategoryHero: false,
    searchVariant: 'full',
    scrollThreshold: 150,
    height: {
      initial: 70,
      scrolled: 70,
    },
    zIndex: {
      initial: 50,
      scrolled: 1000,
    },
    mobile: {
      showLogo: false,
      showPageTitle: true,
      transparentTopBar: true,
      showBottomNav: true,
      showSidebar: true,
    },
  },

  // 3. Category Standard - Fixed navbar, no hero
  'category-standard': {
    position: 'fixed',
    transparent: false,
    scrollBehavior: 'sticky',
    showMegaMenu: false,
    showBrowseProducts: true,
    showBreadcrumb: true,
    showSecondaryFilterBar: true,
    showStickyProductBar: false,
    showCategoryHero: false,
    searchVariant: 'full',
    scrollThreshold: 0,
    height: {
      initial: 70,
      scrolled: 70,
    },
    zIndex: {
      initial: 1000,
      scrolled: 1000,
    },
    mobile: {
      showLogo: false,
      showPageTitle: true,
      transparentTopBar: false,
      showBottomNav: true,
      showSidebar: true,
    },
  },

  // 4. Browse Products - All products catalog
  'browse-products': {
    position: 'fixed',
    transparent: false,
    scrollBehavior: 'sticky',
    showMegaMenu: false,
    showBrowseProducts: true,
    showBreadcrumb: false,
    showSecondaryFilterBar: false,
    showStickyProductBar: false,
    showCategoryHero: false,
    searchVariant: 'full',
    scrollThreshold: 0,
    height: {
      initial: 70,
      scrolled: 70,
    },
    zIndex: {
      initial: 1000,
      scrolled: 1000,
    },
    mobile: {
      showLogo: false,
      showPageTitle: true,
      transparentTopBar: false,
      showBottomNav: true,
      showSidebar: true,
    },
  },

  // 5. Product Detail - Individual product page with hero image
  'product-detail': {
    position: 'fixed',
    transparent: false,
    scrollBehavior: 'sticky',
    showMegaMenu: false,
    showBrowseProducts: false,
    showBreadcrumb: false,
    showSecondaryFilterBar: false,
    showStickyProductBar: false,
    showCategoryHero: false,
    searchVariant: 'compact',
    scrollThreshold: 0,
    height: {
      initial: 70,
      scrolled: 70,
    },
    zIndex: {
      initial: 1000,
      scrolled: 1000,
    },
    mobile: {
      showLogo: false,
      showPageTitle: false,
      transparentTopBar: true,
      showBottomNav: false,
      showSidebar: true,
    },
  },

  // 6. Search Results - Search query results
  'search-results': {
    position: 'fixed',
    transparent: false,
    scrollBehavior: 'sticky',
    showMegaMenu: false,
    showBrowseProducts: true,
    showBreadcrumb: false,
    showSecondaryFilterBar: true,
    showStickyProductBar: false,
    showCategoryHero: false,
    searchVariant: 'full',
    scrollThreshold: 0,
    height: {
      initial: 70,
      scrolled: 70,
    },
    zIndex: {
      initial: 1000,
      scrolled: 1000,
    },
    mobile: {
      showLogo: false,
      showPageTitle: true,
      transparentTopBar: false,
      showBottomNav: true,
      showSidebar: true,
    },
  },

  // 7. Checkout - Simplified navbar
  checkout: {
    position: 'fixed',
    transparent: false,
    scrollBehavior: 'static',
    showMegaMenu: false,
    showBrowseProducts: false,
    showBreadcrumb: false,
    showSecondaryFilterBar: false,
    showStickyProductBar: false,
    showCategoryHero: false,
    searchVariant: 'hidden',
    scrollThreshold: 0,
    height: {
      initial: 60,
      scrolled: 60,
    },
    zIndex: {
      initial: 1000,
      scrolled: 1000,
    },
    simplified: true,
    showOnlyEssentials: ['logo', 'cart', 'help'],
    mobile: {
      showLogo: true,
      showPageTitle: false,
      transparentTopBar: false,
      showBottomNav: false,
      showSidebar: false,
    },
  },

  // 8. Account/Dashboard - User pages
  account: {
    position: 'fixed',
    transparent: false,
    scrollBehavior: 'sticky',
    showMegaMenu: false,
    showBrowseProducts: true,
    showBreadcrumb: false,
    showSecondaryFilterBar: false,
    showStickyProductBar: false,
    showCategoryHero: false,
    searchVariant: 'full',
    scrollThreshold: 0,
    height: {
      initial: 70,
      scrolled: 70,
    },
    zIndex: {
      initial: 1000,
      scrolled: 1000,
    },
    mobile: {
      showLogo: false,
      showPageTitle: true,
      transparentTopBar: false,
      showBottomNav: true,
      showSidebar: true,
    },
  },

  // 9. Content Pages - About, Help, Blog
  'content-pages': {
    position: 'fixed',
    transparent: false,
    scrollBehavior: 'sticky',
    showMegaMenu: true,
    showBrowseProducts: false,
    showBreadcrumb: false,
    showSecondaryFilterBar: false,
    showStickyProductBar: false,
    showCategoryHero: false,
    searchVariant: 'full',
    scrollThreshold: 0,
    height: {
      initial: 70,
      scrolled: 70,
    },
    zIndex: {
      initial: 1000,
      scrolled: 1000,
    },
    mobile: {
      showLogo: true,
      showPageTitle: false,
      transparentTopBar: false,
      showBottomNav: true,
      showSidebar: true,
    },
  },
}

/**
 * Get navbar variant based on pathname
 */
export function getNavbarVariant(pathname: string): NavbarVariant {
  // Homepage
  if (pathname === '/') return 'homepage'

  // Checkout
  if (pathname.startsWith('/checkout')) return 'checkout'

  // Catalog - Show page title with solid topbar
  if (pathname === '/catalog' || pathname.startsWith('/catalog/')) return 'browse-products'

  // Quote - Show page title
  if (pathname === '/request-quote' || pathname.startsWith('/request-quote')) return 'account'

  // Cart - Show page title
  if (pathname === '/cart') return 'account'

  // Profile/My Cedar - Show page title
  if (pathname === '/profile' || pathname.startsWith('/profile/')) return 'account'

  // Account/Dashboard
  if (pathname.startsWith('/account')) return 'account'

  // Product Detail
  if (pathname.match(/^\/products\/[^/]+$/)) return 'product-detail'

  // Browse All Products
  if (pathname === '/products' || pathname === '/store') return 'browse-products'

  // Search Results
  if (pathname.startsWith('/search')) return 'search-results'

  // Categories - Use category-hero for featured categories, category-standard for others
  if (pathname.startsWith('/categories/')) {
    // You can add logic here to determine if a category should have a hero
    // For now, default to category-hero
    return 'category-hero'
  }

  // Collections - Similar to categories
  if (pathname.startsWith('/collections/')) {
    return 'category-hero'
  }

  // Content Pages
  if (
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/help') ||
    pathname.startsWith('/resources') ||
    pathname.startsWith('/track') ||
    pathname.startsWith('/blog')
  ) {
    return 'content-pages'
  }

  // Default to content-pages for unknown routes
  return 'content-pages'
}

/**
 * Merge custom config with variant config
 */
export function mergeNavbarConfig(
  variant: NavbarVariant,
  customConfig?: Partial<NavbarConfig>
): NavbarConfig {
  return {
    ...navbarConfig[variant],
    ...customConfig,
  }
}
