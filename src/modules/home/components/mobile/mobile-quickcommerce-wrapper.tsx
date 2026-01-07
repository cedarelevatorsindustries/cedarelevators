"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProductCategory, Product } from "@/lib/types/domain"
import type { Application } from "@/lib/data/applications"
import QuickCommerceSubcategoryTemplate from "@/modules/catalog/templates/mobile/subcategory-template"

interface MobileQuickCommerceWrapperProps {
    categories: ProductCategory[]
    applications: Application[]
    products: Product[]
    children: (handlers: {
        onCategoryClick: (category: ProductCategory) => void
        onApplicationClick: (application: Application) => void
    }) => React.ReactNode
}

export default function MobileQuickCommerceWrapper({
    categories,
    applications,
    products,
    children
}: MobileQuickCommerceWrapperProps) {
    const router = useRouter()
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

    const handleCategoryClick = (category: ProductCategory) => {
        setSelectedCategory(category)
        // Update URL to match desktop behavior
        router.push(`/catalog?category=${category.handle || category.slug}`, { scroll: false })
    }

    const handleApplicationClick = (application: Application) => {
        setSelectedApplication(application)
        // Update URL to match desktop behavior
        router.push(`/catalog?application=${application.slug}`, { scroll: false })
    }

    const handleBack = () => {
        setSelectedCategory(null)
        setSelectedApplication(null)
        // Return to homepage
        router.push('/', { scroll: false })
    }

    // Show QuickCommerce category view
    if (selectedCategory) {
        return (
            <QuickCommerceSubcategoryTemplate
                category={selectedCategory}
                products={products}
                allCategories={categories}
                onBack={handleBack}
            />
        )
    }

    // Show QuickCommerce application view (convert application to category format)
    if (selectedApplication) {
        const appAsCategory: ProductCategory = {
            id: selectedApplication.id,
            name: selectedApplication.name,
            handle: selectedApplication.slug,
            slug: selectedApplication.slug,
            description: selectedApplication.description,
            category_children: (selectedApplication as any).categories || [],
            thumbnail: selectedApplication.thumbnail_image || selectedApplication.image_url
        }

        return (
            <QuickCommerceSubcategoryTemplate
                category={appAsCategory}
                products={products}
                allCategories={categories}
                onBack={handleBack}
            />
        )
    }

    // Render children with handlers
    return <>{children({ onCategoryClick: handleCategoryClick, onApplicationClick: handleApplicationClick })}</>
}
