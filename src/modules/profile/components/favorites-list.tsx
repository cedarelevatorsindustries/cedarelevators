"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/lib/auth/client"
import { getFavorites } from "@/lib/actions/user-lists"
import { getProductsByIds } from "@/lib/actions/products"
import { Product as DBProduct } from "@/lib/types/products"
import { Product as DomainProduct } from "@/lib/types/domain"
import ProductCard from "@/components/ui/product-card"
import { Loader2 } from "lucide-react"

export default function FavoritesList() {
    const { user, isLoaded } = useUser()
    const [products, setProducts] = useState<DomainProduct[]>([])
    const [loading, setLoading] = useState(true)

    const mapProduct = (p: DBProduct): DomainProduct => ({
        id: p.id,
        title: p.name,
        handle: p.slug,
        description: p.description || "",
        thumbnail: p.thumbnail_url || "",
        images: [], // TODO: map images if needed
        price: { amount: p.price || 0, currency_code: "INR" },
        // Default values for required fields
        created_at: p.created_at
    })

    useEffect(() => {
        if (!isLoaded) return

        async function load() {
            setLoading(true)
            if (user) {
                // Auth
                const res = await getFavorites()
                if (res.success && res.products) {
                    setProducts((res.products as unknown as DBProduct[]).map(mapProduct))
                }
            } else {
                // Guest
                const localIds = JSON.parse(localStorage.getItem("favorites") || "[]")
                if (localIds.length > 0) {
                    const data = await getProductsByIds(localIds)
                    setProducts(data.map(mapProduct))
                } else {
                    setProducts([])
                }
            }
            setLoading(false)
        }

        load()
    }, [user, isLoaded])

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">You haven't added any favorites yet.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}
