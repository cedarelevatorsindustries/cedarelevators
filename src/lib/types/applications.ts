// Application Types
// Applications are top-level groupings (stored as categories with parent_id = NULL)

export interface Application {
  id: string
  name: string
  slug: string
  // Database column aliases (from categories table)
  title?: string // Maps to name
  handle?: string // Maps to slug
  thumbnail?: string // Maps to thumbnail_image
  banner_url?: string // Maps to banner_image
  seo_meta_title?: string // Maps to meta_title
  seo_meta_description?: string // Maps to meta_description
  // End aliases
  description?: string
  subtitle?: string
  parent_id: null // Always null for applications
  image_url?: string
  thumbnail_image?: string
  banner_image?: string
  image_alt?: string
  icon?: string
  badge_text?: string
  badge_color?: string
  card_position?: 'image-top' | 'image-left' | 'compact'
  default_sort?: 'newest' | 'popular' | 'manual' | 'price-low' | 'price-high'
  sort_order: number
  is_active: boolean
  status: 'active' | 'draft' | 'archived'
  visibility?: 'public' | 'hidden'
  application?: string
  meta_title?: string
  meta_description?: string
  metadata?: Record<string, any> // JSONB column from database
  created_at: string
  updated_at: string
}

export interface ApplicationWithStats extends Application {
  category_count?: number
  subcategory_count?: number
  product_count?: number
}

export interface ApplicationFormData {
  name: string
  slug: string
  description?: string
  subtitle?: string
  image_url?: string
  thumbnail_image?: string
  banner_image?: string
  image_alt?: string
  icon?: string
  badge_text?: string
  badge_color?: string
  card_position?: 'image-top' | 'image-left' | 'compact'
  default_sort?: 'newest' | 'popular' | 'manual' | 'price-low' | 'price-high'
  sort_order: number
  is_active: boolean
  status: 'active' | 'draft' | 'archived'
  visibility?: 'public' | 'hidden'
  meta_title?: string
  meta_description?: string
}

export interface ApplicationFilters {
  search?: string
  status?: 'active' | 'draft' | 'archived'
  is_active?: boolean
  // Pagination
  page?: number
  limit?: number
}

export interface ApplicationStats {
  total: number
  active: number
  inactive: number
  total_categories: number
  total_subcategories: number
  total_products: number
}

