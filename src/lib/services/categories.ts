export interface CategoryWithChildren {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string | null
  application_id?: string | null  // NEW: Quick reference to top-level application
  level: 1 | 2 | 3                // NEW: 1=Application, 2=Category, 3=Subcategory
  product_count?: number
  status?: 'active' | 'inactive'
  children?: CategoryWithChildren[]
  _count?: {
    products: number
  }
}

export interface Application {
  id: string
  name: string
  slug: string
  icon?: string
  description?: string
  image_url?: string
  categoryCount: number
  productCount?: number
}

export const CategoryService = {
  getTree: async (): Promise<CategoryWithChildren[]> => [],
  getById: async (id: string): Promise<CategoryWithChildren | null> => null,
  create: async (data: any) => ({ success: false, error: 'Not implemented' }),
  update: async (id: string, data: any) => ({ success: false, error: 'Not implemented' }),
  delete: async (id: string) => ({ success: false, error: 'Not implemented' }),
  deleteCategory: async (id: string) => ({ success: false, error: 'Not implemented' }),
  getCategory: async (id: string) => ({ success: false, error: 'Not implemented' }),
  uploadImage: async (file: File, type: string) => ({ success: false, error: 'Not implemented' }),
  updateCategory: async (id: string, data: any) => ({ success: false, error: 'Not implemented' }),
  generateSlug: (name: string) => name.toLowerCase().replace(/\s+/g, '-'),
  createCategory: async (data: any) => ({ success: false, error: 'Not implemented' }),

  // NEW: 3-level structure methods
  getApplications: async (): Promise<Application[]> => {
    // TODO: Fetch level 1 categories with counts
    return []
  },

  getCategoriesByApplication: async (appId: string): Promise<CategoryWithChildren[]> => {
    // TODO: Fetch level 2 categories for an application
    return []
  },

  getSubcategoriesByCategory: async (categoryId: string): Promise<CategoryWithChildren[]> => {
    // TODO: Fetch level 3 subcategories
    return []
  },
}
