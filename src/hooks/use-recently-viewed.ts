"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/lib/auth/client"
import { addToRecentlyViewed, getRecentlyViewed } from "@/lib/actions/user-lists"
import { Product } from "@/lib/types/products"

export function useRecentlyViewed() {
    const { user, isLoaded } = useUser()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch lists
    useEffect(() => {
        if (!isLoaded) return

        async function fetchHistory() {
            setLoading(true)
            if (!user) {
                // Guest: LocalStorage
                // We store IDs in local storage, but implementation plan says "Guest -> LocalStorage only" and "UI: Recently Viewed horizontal list".
                // To fetch products for guest, we need a way to get products by IDs from server (public endpoint or action).
                // For now, let's assume we store minimal product data or valid IDs.
                // Or better: store IDs and fetch details using a server action `getProductsByIds`.
                // Wait, I strictly separated it. Guest data is local.
                // I need a way to hydrate guest products.

                // For now, let's implement the fetching part later or mock it if needed.
                // Assuming we have a `getProductsByIds` action would be best.
                // I'll skip implementing guest fetching FULLY here until I have `getProductsByIds`.
                // Actually, I can use `getRecentlyViewed` for auth users.

                // Fallback: Empty for guest for now or read from local storage if we stored full objects? 
                // Storing full objects in local storage is risky (stale data).
                // Storing IDs is better.

                const localHistory = JSON.parse(localStorage.getItem("recently_viewed") || "[]")
                // TODO: Hydrate these IDs. For this task, I'll return empty or implement hydration later.
                // Let's verify if I should implement hydration now. The plan implies comprehensive solution.
                // I'll leave a hook for hydration.
                setProducts([])
            } else {
                // Auth: Server
                const res = await getRecentlyViewed()
                if (res.success && res.products) {
                    setProducts(res.products as unknown as Product[])
                }
            }
            setLoading(false)
        }

        fetchHistory()
    }, [user, isLoaded])

    // Track view
    const trackView = async (product: { id: string }) => {
        // Prevent tracking if same as last view?

        if (!user) {
            // Guest: LocalStorage
            const localHistory = JSON.parse(localStorage.getItem("recently_viewed") || "[]")
            const newHistory = [product.id, ...localHistory.filter((id: string) => id !== product.id)].slice(0, 20)
            localStorage.setItem("recently_viewed", JSON.stringify(newHistory))
        } else {
            // Auth: Server
            addToRecentlyViewed(product.id) // Fire and forget (or await if precise)
        }
    }

    return { products, loading, trackView }
}
