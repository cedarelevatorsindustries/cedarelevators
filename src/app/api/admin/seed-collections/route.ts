import { NextResponse } from "next/server"
import { listProducts } from "@/lib/data"
import {
    createCollection,
    getCollectionBySlug,
    addProductsToCollection
} from "@/lib/actions/collections"

export async function GET() {
    try {
        // 1. Fetch all products (limit 100)
        const { response } = await listProducts({ queryParams: { limit: 100 } })
        const allProducts = response.products

        if (allProducts.length === 0) {
            return NextResponse.json({ error: "No products found to seed." }, { status: 400 })
        }

        const allProductIds = allProducts.map(p => p.id)

        const collectionsToSeed = [
            { slug: "new-arrivals", title: "New Arrivals", type: "manual" },
            { slug: "trending", title: "Trending", type: "manual" },
            { slug: "top-applications", title: "Top Applications", type: "manual" },
            { slug: "best-seller", title: "Best Seller", type: "manual" }
        ]

        const results = []

        for (const colDef of collectionsToSeed) {
            let collectionId

            // Check if exists
            const { collection } = await getCollectionBySlug(colDef.slug)

            if (collection) {
                collectionId = collection.id
                results.push({ slug: colDef.slug, status: "exists", id: collectionId })
            } else {
                // Create
                const { collection: newCol, error } = await createCollection({
                    title: colDef.title,
                    slug: colDef.slug,
                    type: colDef.type,
                    is_active: true,
                    description: `Mock collection for ${colDef.title}`
                })

                if (newCol) {
                    collectionId = newCol.id
                    results.push({ slug: colDef.slug, status: "created", id: collectionId })
                } else {
                    results.push({ slug: colDef.slug, status: "failed_to_create", error })
                    // If it failed, maybe it exists but is inactive (since getCollectionBySlug filters active=true)
                    // In a real script we'd handle this, but for now we skip
                }
            }

            if (collectionId) {
                // Pick random products (5-12 items)
                const count = 5 + Math.floor(Math.random() * 8)
                // Shuffle locally
                const shuffled = [...allProductIds].sort(() => 0.5 - Math.random())
                const selectedIds = shuffled.slice(0, count)

                await addProductsToCollection(collectionId, selectedIds)
                results.push({ slug: colDef.slug, action: "populated", count, products: selectedIds })
            }
        }

        return NextResponse.json({ success: true, results })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
