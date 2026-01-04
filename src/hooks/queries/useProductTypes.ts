import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    assignTypeToProduct,
    removeTypeFromProduct,
    getProductTypes,
    getTypeProducts,
    updateProductTypes
} from '@/lib/actions/product-types'

/**
 * Hook to get types assigned to a product
 */
export function useProductTypes(productId: string) {
    return useQuery({
        queryKey: ['product-types', productId],
        queryFn: () => getProductTypes(productId),
        select: (data) => data.types
    })
}

/**
 * Hook to get products with a specific type
 */
export function useTypeProducts(typeId: string) {
    return useQuery({
        queryKey: ['type-products', typeId],
        queryFn: () => getTypeProducts(typeId),
        select: (data) => data.products
    })
}

/**
 * Hook to assign a type to a product
 */
export function useAssignTypeToProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: assignTypeToProduct,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['product-types', variables.product_id]
            })
            queryClient.invalidateQueries({
                queryKey: ['type-products', variables.type_id]
            })
        }
    })
}

/**
 * Hook to remove a type from a product
 */
export function useRemoveTypeFromProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: removeTypeFromProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['product-types']
            })
            queryClient.invalidateQueries({
                queryKey: ['type-products']
            })
        }
    })
}

/**
 * Hook to bulk update product types
 */
export function useUpdateProductTypes() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateProductTypes,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['product-types', variables.product_id]
            })
            // Invalidate all type-products queries since we don't know which types changed
            queryClient.invalidateQueries({
                queryKey: ['type-products']
            })
        }
    })
}

