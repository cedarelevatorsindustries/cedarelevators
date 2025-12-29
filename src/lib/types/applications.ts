// Application Types
// Applications are top-level groupings (stored as categories with parent_id = NULL)

export interface Application {
  id: string
  name: string
  slug: string
  description?: string
  parent_id: null // Always null for applications
  image_url?: string
  thumbnail_image?: string
  banner_image?: string
  image_alt?: string
  icon?: string
  sort_order: number
  is_active: boolean
  status: 'active' | 'inactive'
  application?: string
  meta_title?: string
  meta_description?: string
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
  image_url?: string
  thumbnail_image?: string
  banner_image?: string
  image_alt?: string
  icon?: string
  sort_order: number
  is_active: boolean
  status: 'active' | 'inactive'
  meta_title?: string
  meta_description?: string
}

export interface ApplicationFilters {
  search?: string
  status?: 'active' | 'inactive'
  is_active?: boolean
}

export interface ApplicationStats {
  total: number
  active: number
  inactive: number
  total_categories: number
  total_subcategories: number
  total_products: number
}
