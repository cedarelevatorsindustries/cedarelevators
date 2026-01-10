import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  getCategoryStats
} from '@/lib/actions/categories'
import {
  getSubcategoriesByParentId,
  getSubcategoryById,
  getAllSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory
} from '@/lib/actions/subcategories'
import { linkSubcategoryToCategory } from '@/lib/actions/category-subcategories'
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

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: [...categoryKeys.all, 'slug', slug] as const,
    queryFn: () => getCategoryBySlug(slug),
    enabled: !!slug,
  })
}

export function useSubcategories(parentId: string) {
  return useQuery({
    queryKey: [...categoryKeys.all, 'subcategories', parentId] as const,
    queryFn: () => getSubcategoriesByParentId(parentId),
    enabled: !!parentId,
  })
}

export function useSubcategory(id: string) {
  return useQuery({
    queryKey: [...categoryKeys.all, 'subcategory', id] as const,
    queryFn: () => getSubcategoryById(id),
    enabled: !!id,
  })
}

export function useAllSubcategories() {
  return useQuery({
    queryKey: [...categoryKeys.all, 'subcategories', 'list'] as const,
    queryFn: () => getAllSubcategories(),
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
        // Invalidate all subcategories queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: [...categoryKeys.all, 'subcategories'] })
        // Check if isSubcategory property exists in the result (it is returned by createCategory)
        const isSub = (result as any).isSubcategory
        toast.success(`${isSub ? 'Subcategory' : 'Category'} created successfully`)
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
        queryClient.invalidateQueries({ queryKey: [...categoryKeys.all, 'subcategories'] })
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

export function useUpdateSubcategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryFormData> }) =>
      updateSubcategory(id, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
        queryClient.invalidateQueries({ queryKey: [...categoryKeys.all, 'subcategory', variables.id] })
        queryClient.invalidateQueries({ queryKey: [...categoryKeys.all, 'subcategories'] })
        queryClient.invalidateQueries({ queryKey: categoryKeys.stats() })
        toast.success('Subcategory updated successfully')
      } else {
        toast.error(result.error || 'Failed to update subcategory')
      }
    },
    onError: () => {
      toast.error('Failed to update subcategory')
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
        queryClient.invalidateQueries({ queryKey: [...categoryKeys.all, 'subcategories'] })
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

export function useLinkSubcategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { category_id: string; subcategory_id: string; sort_order?: number }) =>
      linkSubcategoryToCategory(data),
    onSuccess: (result: any) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
        queryClient.invalidateQueries({ queryKey: categoryKeys.stats() })
        queryClient.invalidateQueries({ queryKey: [...categoryKeys.all, 'subcategories'] })
        toast.success('Subcategory linked successfully')
      } else {
        toast.error(result.error || 'Failed to link subcategory')
      }
    },
    onError: () => {
      toast.error('Failed to link subcategory')
    },
  })
}

