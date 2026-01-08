import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getProductStats } from "@/lib/actions/products"
import type { Product, ProductFormData, ProductFilters } from "@/lib/types/products"
import { toast } from "sonner"

export function useProducts(filters: ProductFilters = {}) {
    return useQuery({
        queryKey: ['products', filters],
        queryFn: () => getProducts(filters, filters.page || 1),
    })
}

export function useProduct(id: string) {
    return useQuery({
        queryKey: ['product', id],
        queryFn: () => getProduct(id),
        enabled: !!id,
    })
}

export function useProductStats() {
    return useQuery({
        queryKey: ['products-stats'],
        queryFn: () => getProductStats(),
    })
}

export function useCreateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: ProductFormData) => createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['products-stats'] })
            toast.success("Product created successfully")
        },
        onError: (error) => {
            toast.error(`Failed to create product: ${error.message}`)
        },
    })
}

export function useUpdateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) => updateProduct(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['product', data.data?.id] })
            queryClient.invalidateQueries({ queryKey: ['products-stats'] })
            toast.success("Product updated successfully")
        },
        onError: (error) => {
            toast.error(`Failed to update product: ${error.message}`)
        },
    })
}

export function useDeleteProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['products-stats'] })
            toast.success("Product deleted successfully")
        },
        onError: (error) => {
            toast.error(`Failed to delete product: ${error.message}`)
        },
    })
}

