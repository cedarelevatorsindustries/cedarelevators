"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/lib/auth/client"
import { getRecentlyViewed } from "@/lib/actions/user-lists"
import { getProductsByIds } from "@/lib/actions/products"
import { Product as DBProduct } from "@/lib/types/products"
import { Product as DomainProduct } from "@/lib/types/domain"
import ProductCard from "@/components/ui/product-card"
import { Loader2, History } from "lucide-react"

export default function RecentlyViewedList() {
    const { user, isLoaded } = useUser()
    const [products, setProducts] = useState<DomainProduct[]>([])
    const [loading, setLoading] = useState(true)

    const mapProduct = (p: DBProduct): DomainProduct => ({
        id: p.id,
        title: p.name,
        handle: p.slug,
        description: p.description || "",
        thumbnail: p.thumbnail_url || "",
        images: [],
        price: { amount: p.price || 0, currency_code: "INR" },
        created_at: p.created_at
    })

    useEffect(() => {
        if (!isLoaded) return

        async function load() {
            setLoading(true)
            if (user) {
                // Auth
                const res = await getRecentlyViewed()
                if (res.success && res.products) {
                    setProducts((res.products as unknown as DBProduct[]).map(mapProduct))
                }
            } else {
                // Guest
                const localIds = JSON.parse(localStorage.getItem("recently_viewed") || "[]")
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

    if (loading) return null // Hide while loading to avoid jump? Or show spinner?
    if (products.length < 3) return null // Hide if less than 3 items per requirements

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-4 md:px-0">
                <History className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Recently Viewed</h2>
            </div>

            <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
                <div className="flex gap-4 w-max">
                    {products.map(product => (
                        <div key={product.id} className="w-[160px] md:w-[200px]">
                            <ProductCard product={product} variant="mobile" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

