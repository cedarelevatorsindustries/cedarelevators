import { createAdminClient } from '@/lib/supabase/server'

export interface CategoryWithChildren {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string | null
  application_id?: string | null
  level: 1 | 2 | 3
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
  /**
   * Get full category tree
   */
  getTree: async (): Promise<CategoryWithChildren[]> => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching category tree:', error)
      return []
    }
  },

  /**
   * Get category by ID
   */
  getById: async (id: string): Promise<CategoryWithChildren | null> => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching category:', error)
      return null
    }
  },

  create: async (data: any) => ({ success: false, error: 'Not implemented' }),
  update: async (id: string, data: any) => ({ success: false, error: 'Not implemented' }),
  delete: async (id: string) => ({ success: false, error: 'Not implemented' }),
  deleteCategory: async (id: string) => ({ success: false, error: 'Not implemented' }),
  getCategory: async (id: string) => ({ success: false, error: 'Not implemented' }),
  uploadImage: async (file: File, type: string) => ({ success: false, error: 'Not implemented' }),
  updateCategory: async (id: string, data: any) => ({ success: false, error: 'Not implemented' }),
  generateSlug: (name: string) => name.toLowerCase().replace(/\s+/g, '-'),
  createCategory: async (data: any) => ({ success: false, error: 'Not implemented' }),

  /**
   * Get all applications (level 1 categories)
   */
  getApplications: async (): Promise<Application[]> => {
    try {
      const supabase = createAdminClient()

      // Fetch applications with category counts
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          name,
          slug,
          icon,
          description,
          image_url,
          application_categories (count)
        `)
        .order('name')

      if (error) throw error

      return (data || []).map(app => ({
        id: app.id,
        name: app.name,
        slug: app.slug,
        icon: app.icon,
        description: app.description,
        image_url: app.image_url,
        categoryCount: (app.application_categories as any)?.[0]?.count || 0
      }))
    } catch (error) {
      console.error('Error fetching applications:', error)
      return []
    }
  },

  /**
   * Get categories for an application
   */
  getCategoriesByApplication: async (appId: string): Promise<CategoryWithChildren[]> => {
    try {
      const supabase = createAdminClient()

      const { data, error } = await supabase
        .from('application_categories')
        .select(`
          category:categories (
            id,
            name,
            slug,
            description,
            thumbnail_image,
            status
          )
        `)
        .eq('application_id', appId)

      if (error) throw error

      return (data || [])
        .map(item => item.category)
        .filter(Boolean)
        .map(cat => ({
          ...(cat as any),
          level: 2 as const,
          image_url: (cat as any).thumbnail_image
        }))
    } catch (error) {
      console.error('Error fetching categories by application:', error)
      return []
    }
  },

  /**
   * Get subcategories for a category
   */
  getSubcategoriesByCategory: async (categoryId: string): Promise<CategoryWithChildren[]> => {
    try {
      const supabase = createAdminClient()

      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .order('name')

      if (error) throw error

      return (data || []).map(sub => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        image_url: sub.image_url,
        parent_id: categoryId,
        level: 3 as const
      }))
    } catch (error) {
      console.error('Error fetching subcategories:', error)
      return []
    }
  },
}


