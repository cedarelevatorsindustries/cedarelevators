import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    uploadBannerImage
} from '@/lib/actions/banners'
import type { BannerFilters, BannerFormData } from '@/lib/types/banners'
import { toast } from 'sonner'

/**
 * Query key factory for banners
 */
export const bannerKeys = {
    all: ['banners'] as const,
    lists: () => [...bannerKeys.all, 'list'] as const,
    list: (filters?: BannerFilters) => [...bannerKeys.lists(), filters] as const,
    details: () => [...bannerKeys.all, 'detail'] as const,
    detail: (id: string) => [...bannerKeys.details(), id] as const,
}

/**
 * Hook to fetch banners with filters
 */
export function useBanners(filters?: BannerFilters) {
    return useQuery({
        queryKey: bannerKeys.list(filters),
        queryFn: async () => {
            const result = await getBanners(filters)
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch banners')
            }
            return result
        },
    })
}

/**
 * Hook to fetch a single banner
 */
export function useBanner(id: string) {
    return useQuery({
        queryKey: bannerKeys.detail(id),
        queryFn: async () => {
            const result = await getBannerById(id)
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch banner')
            }
            return result.banner
        },
        enabled: !!id,
    })
}

/**
 * Hook to create a banner
 */
export function useCreateBanner() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: BannerFormData) => {
            const result = await createBanner(data)
            if (!result.success) {
                throw new Error(result.error || 'Failed to create banner')
            }
            return result.banner
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bannerKeys.lists() })
            toast.success('Banner created successfully')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}

/**
 * Hook to update a banner
 */
export function useUpdateBanner() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<BannerFormData> }) => {
            const result = await updateBanner(id, data)
            if (!result.success) {
                throw new Error(result.error || 'Failed to update banner')
            }
            return result.banner
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: bannerKeys.lists() })
            queryClient.invalidateQueries({ queryKey: bannerKeys.detail(variables.id) })
            toast.success('Banner updated successfully')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}

/**
 * Hook to delete a banner
 */
export function useDeleteBanner() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await deleteBanner(id)
            if (!result.success) {
                throw new Error(result.error || 'Failed to delete banner')
            }
            return result
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bannerKeys.lists() })
            toast.success('Banner deleted successfully')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}

/**
 * Hook to toggle banner status
 */
export function useToggleBannerStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await toggleBannerStatus(id)
            if (!result.success) {
                throw new Error(result.error || 'Failed to toggle banner status')
            }
            return result.banner
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bannerKeys.lists() })
            toast.success('Banner status updated')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}

/**
 * Hook to upload banner image
 */
export function useUploadBannerImage() {
    return useMutation({
        mutationFn: async (file: File) => {
            const result = await uploadBannerImage(file)
            if (!result.success) {
                throw new Error(result.error || 'Failed to upload image')
            }
            return result.url!
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}
