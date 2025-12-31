import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    linkCategoryToApplication,
    unlinkCategoryFromApplication,
    getApplicationCategories,
    getCategoryApplications,
    updateApplicationCategoryOrder,
    reorderApplicationCategories
} from '@/lib/actions/application-categories'

/**
 * Hook to get categories linked to an application
 */
export function useApplicationCategories(applicationId: string) {
    return useQuery({
        queryKey: ['application-categories', applicationId],
        queryFn: () => getApplicationCategories(applicationId),
        select: (data) => data.links
    })
}

/**
 * Hook to get applications that link to a category
 */
export function useCategoryApplications(categoryId: string) {
    return useQuery({
        queryKey: ['category-applications', categoryId],
        queryFn: () => getCategoryApplications(categoryId),
        select: (data) => data.applications
    })
}

/**
 * Hook to link a category to an application
 */
export function useLinkCategoryToApplication() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: linkCategoryToApplication,
        onSuccess: (_, variables) => {
            // Invalidate application categories
            queryClient.invalidateQueries({
                queryKey: ['application-categories', variables.application_id]
            })
            // Invalidate category applications
            queryClient.invalidateQueries({
                queryKey: ['category-applications', variables.category_id]
            })
        }
    })
}

/**
 * Hook to unlink a category from an application
 */
export function useUnlinkCategoryFromApplication() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: unlinkCategoryFromApplication,
        onSuccess: () => {
            // Invalidate all application-category queries
            queryClient.invalidateQueries({
                queryKey: ['application-categories']
            })
            queryClient.invalidateQueries({
                queryKey: ['category-applications']
            })
        }
    })
}

/**
 * Hook to update category order in application
 */
export function useUpdateApplicationCategoryOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ linkId, data }: { linkId: string; data: { sort_order?: number } }) =>
            updateApplicationCategoryOrder(linkId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['application-categories']
            })
        }
    })
}

/**
 * Hook to reorder categories in application (drag-and-drop)
 */
export function useReorderApplicationCategories() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ applicationId, categoryOrders }: {
            applicationId: string
            categoryOrders: Array<{ category_id: string; sort_order: number }>
        }) => reorderApplicationCategories(applicationId, categoryOrders),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['application-categories', variables.applicationId]
            })
        }
    })
}
