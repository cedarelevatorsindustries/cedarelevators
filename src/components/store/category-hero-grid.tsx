'use client'

import { CategoryHeroCard } from "./category-hero-card"

interface CategoryHeroGridProps {
    applicationSlug?: string | null
    categories?: any[]
}

const gradients = [
    { from: "purple-100", to: "pink-100" },
    { from: "blue-100", to: "cyan-100" },
    { from: "green-100", to: "emerald-100" },
    { from: "orange-100", to: "amber-100" }
]

export function CategoryHeroGrid({ applicationSlug, categories = [] }: CategoryHeroGridProps) {
    // Filter categories by application if provided
    const filteredCategories = applicationSlug
        ? categories.filter(cat => cat.application_id === applicationSlug || cat.slug === applicationSlug)
        : categories

    // Get first 4 categories
    const displayCategories = filteredCategories.slice(0, 4)

    if (displayCategories.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No categories found for this application</p>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
                {displayCategories.map((category, index) => (
                    <CategoryHeroCard
                        key={category.id}
                        category={category}
                        gradientFrom={gradients[index % gradients.length].from}
                        gradientTo={gradients[index % gradients.length].to}
                    />
                ))}
            </div>
        </div>
    )
}

