import { CategoryWithChildren } from '@/lib/services/categories'

export interface CategoryStats {
  total: number
  total_products: number
  active: number
}

export const useCategories = () => {
  return {
    data: [] as CategoryWithChildren[],
    isLoading: false,
    error: null,
    refetch: async () => { },
  }
}

export const useCategoryStats = () => {
  return {
    data: null as CategoryStats | null,
    isLoading: false,
    refetch: async () => { },
  }
}
