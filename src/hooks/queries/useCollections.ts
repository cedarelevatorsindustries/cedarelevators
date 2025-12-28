import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    getCollections,
    getCollectionById,
    createCollection,
    updateCollection,
    deleteCollection,
    toggleCollectionStatus,
    uploadCollectionImage,
    addProductsToCollection,
    removeProductFromCollection,
    reorderCollectionProducts
} from '@/lib/actions/collections'
import type { CollectionFilters, CollectionFormData } from '@/lib/types/collections'

// Query keys factory
export const collectionKeys = {
    all: ['collections'] as const,
    lists: () => [...collectionKeys.all, 'list'] as const,
    list: (filters?: CollectionFilters) => [...collectionKeys.lists(), filters] as const,
    details: () => [...collectionKeys.all, 'detail'] as const,
    detail: (id: string) => [...collectionKeys.details(), id] as const,
    stats: () => [...collectionKeys.all, 'stats'] as const,
}

// =============================================
// QUERIES
// =============================================

export function useCollections(filters?: CollectionFilters) {
    return useQuery({
        queryKey: collectionKeys.list(filters),
        queryFn: () => getCollections(filters),
    })
}

export function useCollection(id: string) {
    return useQuery({
        queryKey: collectionKeys.detail(id),
        queryFn: () => getCollectionById(id),
        enabled: !!id,
    })
}

// =============================================
// MUTATIONS
// =============================================

export function useCreateCollection() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CollectionFormData) => createCollection(data),
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
                toast.success('Collection created successfully')
            } else {
                toast.error(result.error || 'Failed to create collection')
            }
        },
        onError: () => {
            toast.error('Failed to create collection')
        },
    })
}

export function useUpdateCollection() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CollectionFormData> }) =>
            updateCollection(id, data),
        onSuccess: (result, variables) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
                queryClient.invalidateQueries({ queryKey: collectionKeys.detail(variables.id) })
                toast.success('Collection updated successfully')
            } else {
                toast.error(result.error || 'Failed to update collection')
            }
        },
        onError: () => {
            toast.error('Failed to update collection')
        },
    })
}

export function useDeleteCollection() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteCollection(id),
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
                toast.success('Collection deleted successfully')
            } else {
                toast.error(result.error || 'Failed to delete collection')
            }
        },
        onError: () => {
            toast.error('Failed to delete collection')
        },
    })
}

export function useToggleCollectionStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => toggleCollectionStatus(id),
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
                toast.success('Collection status updated')
            } else {
                toast.error(result.error || 'Failed to update status')
            }
        },
        onError: () => {
            toast.error('Failed to update status')
        },
    })
}

export function useUploadCollectionImage() {
    return useMutation({
        mutationFn: (file: File) => uploadCollectionImage(file),
        onError: () => {
            toast.error('Failed to upload image')
        },
    })
}

export function useAddProductsToCollection() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ collectionId, productIds }: { collectionId: string; productIds: string[] }) =>
            addProductsToCollection(collectionId, productIds),
        onSuccess: (result, variables) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: collectionKeys.detail(variables.collectionId) })
                queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
                toast.success('Products added to collection')
            } else {
                toast.error(result.error || 'Failed to add products')
            }
        },
        onError: () => {
            toast.error('Failed to add products')
        },
    })
}

export function useRemoveProductFromCollection() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ collectionId, productId }: { collectionId: string; productId: string }) =>
            removeProductFromCollection(collectionId, productId),
        onSuccess: (result, variables) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: collectionKeys.detail(variables.collectionId) })
                queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
                toast.success('Product removed from collection')
            } else {
                toast.error(result.error || 'Failed to remove product')
            }
        },
        onError: () => {
            toast.error('Failed to remove product')
        },
    })
}

export function useReorderCollectionProducts() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ collectionId, orderedProductIds }: { collectionId: string; orderedProductIds: string[] }) =>
            reorderCollectionProducts(collectionId, orderedProductIds),
        onSuccess: (result, variables) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: collectionKeys.detail(variables.collectionId) })
                toast.success('Products reordered')
            } else {
                toast.error(result.error || 'Failed to reorder products')
            }
        },
        onError: () => {
            toast.error('Failed to reorder products')
        },
    })
}
