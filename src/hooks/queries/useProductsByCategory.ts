import { useQuery } from '@tanstack/react-query'
import { getProductsByCategory } from '@/lib/actions/get-products-by-category'

export function useProductsByCategory(categoryId: string) {
    return useQuery({
        queryKey: ['products', 'by-category', categoryId] as const,
        queryFn: () => getProductsByCategory(categoryId),
        enabled: !!categoryId,
    })
}
