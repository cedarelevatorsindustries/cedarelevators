export interface CategoryWithChildren {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string | null
  children?: CategoryWithChildren[]
  _count?: {
    products: number
  }
}

export const CategoryService = {
  getTree: async (): Promise<CategoryWithChildren[]> => [],
  getById: async (id: string): Promise<CategoryWithChildren | null> => null,
  create: async (data: any) => {},
  update: async (id: string, data: any) => {},
  delete: async (id: string) => {},
}
