import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    addProductToCollection,
    removeProductFromCollection,
    getCollectionProducts,
    updateCollectionProductPosition,
    reorderCollectionProducts,
    getProductCollections
} from '@/lib/actions/collection-products'

/**
 * Hook to get products in a collection (ordered)
 */
export function useCollectionProducts(collectionId: string) {
    return useQuery({
        queryKey: ['collection-products', collectionId],
        queryFn: () => getCollectionProducts(collectionId),
        select: (data) => data.products
    })
}

/**
 * Hook to get collections containing a product
 */
export function useProductCollections(productId: string) {
    return useQuery({
        queryKey: ['product-collections', productId],
        queryFn: () => getProductCollections(productId),
        select: (data) => data.collections
    })
}

/**
 * Hook to add a product to a collection
 */
export function useAddProductToCollection() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: addProductToCollection,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['collection-products', variables.collection_id]
            })
            queryClient.invalidateQueries({
                queryKey: ['product-collections', variables.product_id]
            })
        }
    })
}

/**
 * Hook to remove a product from a collection
 */
export function useRemoveProductFromCollection() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: removeProductFromCollection,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['collection-products']
            })
            queryClient.invalidateQueries({
                queryKey: ['product-collections']
            })
        }
    })
}

/**
 * Hook to update product position in collection
 */
export function useUpdateCollectionProductPosition() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ collectionProductId, data }: {
            collectionProductId: string
            data: { position?: number }
        }) => updateCollectionProductPosition(collectionProductId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['collection-products']
            })
        }
    })
}

/**
 * Hook to reorder products in collection (drag-and-drop)
 */
export function useReorderCollectionProducts() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: reorderCollectionProducts,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['collection-products', variables.collection_id]
            })
        }
    })
}

