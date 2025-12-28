import { Product } from "@/lib/types/domain"

/**
 * Collection Display Location Types
 * - "home": Display on homepage
 * - "catalog": Display on catalog page
 * - "product": Display on product detail pages
 */
export type CollectionDisplayLocation = "home" | "catalog" | "product"

/**
 * Collection Layout Types
 * - "grid-5": 5 columns grid (default for desktop)
 * - "grid-4": 4 columns grid
 * - "grid-3": 3 columns grid
 * - "horizontal-scroll": Horizontal scrollable (mobile)
 * - "special": Special variant with full image display
 */
export type CollectionLayout = "grid-5" | "grid-4" | "grid-3" | "horizontal-scroll" | "special"

/**
 * Collection Icon Types for visual identification
 */
export type CollectionIcon = "heart" | "trending" | "star" | "new" | "recommended" | "none"

/**
 * Collection Interface
 * Represents a single product collection/section that can be displayed dynamically
 */
export interface Collection {
  id: string
  title: string
  description?: string
  slug: string // For URL routing (e.g., "/catalog?collection=top-selling")
  displayLocation: CollectionDisplayLocation[]
  layout?: CollectionLayout
  icon?: CollectionIcon
  viewAllLink: string
  products: Product[]
  isActive: boolean // Can be toggled by admin
  sortOrder: number // Order in which sections appear
  showViewAll?: boolean // Whether to show "View All" button
  emptyStateMessage?: string // Custom message when no products
  metadata?: Record<string, any> // Additional data for future extensibility
}

/**
 * Mock Product Data
 * These products will be used across different collections
 */
const mockProducts: Product[] = [
  {
    id: "prod_1",
    title: "Smart Control Panel Pro",
    description: "IoT-enabled control system with touchscreen interface and real-time monitoring",
    handle: "smart-control-panel-pro",
    thumbnail: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&h=800&fit=crop",
    variants: [{ 
      id: "var_1",
      title: "Standard",
      sku: "SCP-001",
      price: 45000,
      inventory_quantity: 15,
      options: {},
      calculated_price: { calculated_amount: 45000, currency_code: "INR" } 
    }],
    metadata: { category: "Control Panels", featured: true },
    created_at: "2024-01-15T00:00:00Z"
  },
  {
    id: "prod_2",
    title: "Energy Efficient Motor",
    description: "Variable frequency drive motor for reduced power consumption",
    handle: "energy-efficient-motor",
    thumbnail: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=800&fit=crop",
    variants: [{ 
      id: "var_2",
      title: "Standard",
      sku: "EEM-002",
      price: 32000,
      inventory_quantity: 25,
      options: {},
      calculated_price: { calculated_amount: 32000, currency_code: "INR" } 
    }],
    metadata: { category: "Motors & Drives", trending: true },
    created_at: "2024-02-10T00:00:00Z"
  },
  {
    id: "prod_3",
    title: "Hospital Grade Door System",
    description: "Medical facility certified automatic door operator",
    handle: "hospital-grade-door-system",
    thumbnail: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=800&fit=crop",
    variants: [{ 
      id: "var_3",
      title: "Standard",
      sku: "HGD-003",
      price: 28000,
      inventory_quantity: 10,
      options: {},
      calculated_price: { calculated_amount: 28000, currency_code: "INR" } 
    }],
    metadata: { category: "Door Systems" },
    created_at: "2024-03-05T00:00:00Z"
  },
  {
    id: "prod_4",
    title: "Heavy Duty Cable Set",
    description: "Industrial strength steel cables for freight elevators",
    handle: "heavy-duty-cable-set",
    thumbnail: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop",
    variants: [{ 
      id: "var_4",
      title: "Standard",
      sku: "HDC-004",
      price: 15000,
      inventory_quantity: 50,
      options: {},
      calculated_price: { calculated_amount: 15000, currency_code: "INR" } 
    }],
    metadata: { category: "Cables & Wiring" },
    created_at: "2024-01-20T00:00:00Z"
  },
  {
    id: "prod_5",
    title: "LED Cabin Lighting Kit",
    description: "Energy-saving LED lighting with ambient controls",
    handle: "led-cabin-lighting-kit",
    thumbnail: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&h=800&fit=crop",
    variants: [{ 
      id: "var_5",
      title: "Standard",
      sku: "LED-005",
      price: 12000,
      inventory_quantity: 30,
      options: {},
      calculated_price: { calculated_amount: 12000, currency_code: "INR" } 
    }],
    metadata: { category: "Lighting" },
    created_at: "2024-02-15T00:00:00Z"
  },
  {
    id: "prod_6",
    title: "Safety Sensor System",
    description: "Advanced infrared safety sensors with auto-reverse",
    handle: "safety-sensor-system",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=800&fit=crop",
    variants: [{ 
      id: "var_6",
      title: "Standard",
      sku: "SSS-006",
      price: 18000,
      inventory_quantity: 20,
      options: {},
      calculated_price: { calculated_amount: 18000, currency_code: "INR" } 
    }],
    metadata: { category: "Safety Equipment", featured: true },
    created_at: "2024-03-10T00:00:00Z"
  },
  {
    id: "prod_7",
    title: "Hydraulic Power Unit",
    description: "Compact hydraulic power pack for smooth operation",
    handle: "hydraulic-power-unit",
    thumbnail: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=800&fit=crop",
    variants: [{ 
      id: "var_7",
      title: "Standard",
      sku: "HPU-007",
      price: 55000,
      inventory_quantity: 8,
      options: {},
      calculated_price: { calculated_amount: 55000, currency_code: "INR" } 
    }],
    metadata: { category: "Hydraulic Systems", trending: true },
    created_at: "2024-01-25T00:00:00Z"
  },
  {
    id: "prod_8",
    title: "Emergency Phone System",
    description: "GSM-based emergency communication with auto-dialer",
    handle: "emergency-phone-system",
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=800&fit=crop",
    variants: [{ 
      id: "var_8",
      title: "Standard",
      sku: "EPS-008",
      price: 22000,
      inventory_quantity: 15,
      options: {},
      calculated_price: { calculated_amount: 22000, currency_code: "INR" } 
    }],
    metadata: { category: "Communication" },
    created_at: "2024-02-20T00:00:00Z"
  },
  {
    id: "prod_9",
    title: "Inverter Drive System",
    description: "High-efficiency VFD for smooth acceleration and energy savings",
    handle: "inverter-drive-system",
    thumbnail: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&h=800&fit=crop",
    variants: [{ 
      id: "var_9",
      title: "Standard",
      sku: "IDS-009",
      price: 38000,
      inventory_quantity: 12,
      options: {},
      calculated_price: { calculated_amount: 38000, currency_code: "INR" } 
    }],
    metadata: { category: "Motors & Drives", featured: true },
    created_at: "2024-03-15T00:00:00Z"
  },
  {
    id: "prod_10",
    title: "Stainless Steel Car Panel",
    description: "Premium grade stainless steel cabin interior panels",
    handle: "stainless-steel-car-panel",
    thumbnail: "https://images.unsplash.com/photo-1565537373149-89d084048730?w=800&h=800&fit=crop",
    variants: [{ 
      id: "var_10",
      title: "Standard",
      sku: "SSC-010",
      price: 25000,
      inventory_quantity: 18,
      options: {},
      calculated_price: { calculated_amount: 25000, currency_code: "INR" } 
    }],
    metadata: { category: "Interior Finishes" },
    created_at: "2024-02-25T00:00:00Z"
  }
]

/**
 * Mock Collections Data
 * This data structure will eventually come from the Admin Panel API
 * For now, it serves as the single source of truth for all collection sections
 */
export const mockCollections: Collection[] = [
  {
    id: "col_1",
    title: "Top Selling Components",
    description: "Our best-selling elevator components trusted by professionals",
    slug: "top-selling",
    displayLocation: ["home", "catalog"],
    layout: "grid-5",
    icon: "star",
    viewAllLink: "/catalog?type=top-choice&sort=best-selling",
    products: mockProducts.slice(0, 5),
    isActive: true,
    sortOrder: 1,
    showViewAll: true,
    metadata: { priority: "high" }
  },
  {
    id: "col_2",
    title: "New Arrivals",
    description: "Latest additions to our product catalog",
    slug: "new-arrivals",
    displayLocation: ["home", "catalog"],
    layout: "grid-5",
    icon: "new",
    viewAllLink: "/products?sort=newest&from=new-arrivals",
    products: [mockProducts[4], mockProducts[5], mockProducts[6], mockProducts[7], mockProducts[8]],
    isActive: true,
    sortOrder: 2,
    showViewAll: true,
    metadata: { filterByDate: "last-30-days" }
  },
  {
    id: "col_3",
    title: "Trending Collections",
    description: "Most popular products this month",
    slug: "trending",
    displayLocation: ["home"],
    layout: "grid-4",
    icon: "trending",
    viewAllLink: "/products?sort=trending",
    products: [mockProducts[1], mockProducts[6], mockProducts[0], mockProducts[3]],
    isActive: true,
    sortOrder: 3,
    showViewAll: true,
    metadata: { variant: "special" }
  },
  {
    id: "col_4",
    title: "Recommended for You",
    description: "Personalized product recommendations based on your interests",
    slug: "recommended",
    displayLocation: ["home"],
    layout: "grid-5",
    icon: "recommended",
    viewAllLink: "/catalog?type=recommended",
    products: [mockProducts[0], mockProducts[2], mockProducts[5], mockProducts[7], mockProducts[9]],
    isActive: true,
    sortOrder: 4,
    showViewAll: true,
    metadata: { personalized: true }
  },
  {
    id: "col_5",
    title: "Top Choices This Month",
    description: "Editor's picks and customer favorites",
    slug: "top-choices",
    displayLocation: ["home"],
    layout: "grid-5",
    icon: "star",
    viewAllLink: "/catalog?type=top-choice&sort=popularity",
    products: [mockProducts[0], mockProducts[1], mockProducts[8], mockProducts[3], mockProducts[6]],
    isActive: true,
    sortOrder: 5,
    showViewAll: true,
    metadata: { curatedBy: "editor" }
  },
  {
    id: "col_6",
    title: "Your Favorites",
    description: "Products you've saved to your wishlist",
    slug: "favorites",
    displayLocation: ["home"],
    layout: "grid-5",
    icon: "heart",
    viewAllLink: "/wishlist?from=favorites",
    products: [], // Will be populated with user's wishlist items
    isActive: true,
    sortOrder: 0, // Show first if user has favorites
    showViewAll: true,
    emptyStateMessage: "Start adding products to your wishlist to see them here",
    metadata: { userSpecific: true }
  },
  {
    id: "col_7",
    title: "Recently Viewed",
    description: "Products you've recently looked at",
    slug: "recently-viewed",
    displayLocation: ["home", "product"],
    layout: "grid-5",
    icon: "none",
    viewAllLink: "/catalog?type=recent",
    products: [], // Will be populated from browser history/user activity
    isActive: true,
    sortOrder: 1,
    showViewAll: false,
    emptyStateMessage: "Browse our catalog to see recently viewed products",
    metadata: { userSpecific: true }
  },
  {
    id: "col_8",
    title: "Exclusive Business Products",
    description: "Premium components for business customers",
    slug: "business-exclusive",
    displayLocation: ["home"],
    layout: "grid-4",
    icon: "star",
    viewAllLink: "/catalog?type=business-exclusive",
    products: [mockProducts[6], mockProducts[0], mockProducts[8], mockProducts[9]],
    isActive: true,
    sortOrder: 10,
    showViewAll: true,
    metadata: { requiresVerification: true, userType: "business" }
  }
]

/**
 * Helper Functions
 */

/**
 * Get collections for a specific display location
 */
export function getCollectionsByLocation(location: CollectionDisplayLocation): Collection[] {
  return mockCollections
    .filter(collection => 
      collection.isActive && 
      collection.displayLocation.includes(location)
    )
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Get a single collection by slug
 */
export function getCollectionBySlug(slug: string): Collection | undefined {
  return mockCollections.find(collection => 
    collection.slug === slug && collection.isActive
  )
}

/**
 * Get collections with products (filters out empty collections)
 */
export function getCollectionsWithProducts(location: CollectionDisplayLocation): Collection[] {
  return getCollectionsByLocation(location)
    .filter(collection => collection.products.length > 0)
}

/**
 * Merge user-specific data (favorites, recently viewed) into collections
 */
export function mergeUserCollections(
  collections: Collection[],
  userFavorites: Product[] = [],
  recentlyViewed: Product[] = []
): Collection[] {
  return collections.map(collection => {
    if (collection.slug === "favorites") {
      return { ...collection, products: userFavorites }
    }
    if (collection.slug === "recently-viewed") {
      return { ...collection, products: recentlyViewed }
    }
    return collection
  })
}

/**
 * Filter collections by user type (individual vs business)
 */
export function filterCollectionsByUserType(
  collections: Collection[],
  userType: "individual" | "business" | "guest"
): Collection[] {
  return collections.filter(collection => {
    const requiresVerification = collection.metadata?.requiresVerification
    const collectionUserType = collection.metadata?.userType
    
    if (requiresVerification && userType !== "business") {
      return false
    }
    
    if (collectionUserType && collectionUserType !== userType) {
      return false
    }
    
    return true
  })
}
