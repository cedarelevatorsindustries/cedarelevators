import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  getCategoryStats
} from '@/lib/actions/categories'
import type { CategoryFilters, CategoryFormData } from '@/lib/types/categories'

// Query keys factory
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters?: CategoryFilters) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  stats: () => [...categoryKeys.all, 'stats'] as const,
}

// =============================================
// QUERIES
// =============================================

export function useCategories(filters?: CategoryFilters) {
  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: () => getCategories(filters),
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  })
}

export function useCategoryStats() {
  return useQuery({
    queryKey: categoryKeys.stats(),
    queryFn: () => getCategoryStats(),
  })
}

// =============================================
// MUTATIONS
// =============================================

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CategoryFormData) => createCategory(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
        queryClient.invalidateQueries({ queryKey: categoryKeys.stats() })
        toast.success('Category created successfully')
      } else {
        toast.error(result.error || 'Failed to create category')
      }
    },
    onError: () => {
      toast.error('Failed to create category')
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryFormData> }) =>
      updateCategory(id, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
        queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) })
        queryClient.invalidateQueries({ queryKey: categoryKeys.stats() })
        toast.success('Category updated successfully')
      } else {
        toast.error(result.error || 'Failed to update category')
      }
    },
    onError: () => {
      toast.error('Failed to update category')
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
        queryClient.invalidateQueries({ queryKey: categoryKeys.stats() })
        toast.success('Category deleted successfully')
      } else {
        toast.error(result.error || 'Failed to delete category')
      }
    },
    onError: () => {
      toast.error('Failed to delete category')
    },
  })
}

export function useUploadCategoryImage() {
  return useMutation({
    mutationFn: (file: File) => uploadCategoryImage(file),
    onError: () => {
      toast.error('Failed to upload image')
    },
  })
}

