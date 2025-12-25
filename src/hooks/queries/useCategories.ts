import { CategoryWithChildren } from '@/lib/services/categories'

export const useCategories = () => {
  return {
    data: [] as CategoryWithChildren[],
    isLoading: false,
    error: null,
  }
}

export const useCategoryStats = () => {
  return {
    data: null,
    isLoading: false,
  }
}
