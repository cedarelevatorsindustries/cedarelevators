"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Product, ProductCategory, Order } from "@/lib/types/domain"
import Tabs from "../../components/mobile/tabs"
import ProductsTabTemplate from "./products-tab-template"
import CategoriesTabTemplate from "./categories-tab-template"
import { CategoryHeroGrid } from "@/components/store/category-hero-grid"
import { BannerWithSlides } from "@/lib/types/banners"
import { FilterSidebar } from "../../components/mobile/filter-sidebar"

interface MobileCatalogTemplateProps {
  products: Product[]
  categories: ProductCategory[]
  applications?: any[]
  activeCategory?: ProductCategory & {
    category_children?: any[]
  }
  activeApplication?: any & {
    categories?: any[]
  }
  activeType?: any
  activeCollection?: any
  banners?: BannerWithSlides[]
  tab?: string
  app?: string
}

const tabs = [
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories" }
  // Applications removed - now shown on homepage
]

export default function MobileCatalogTemplate({
  products,
  categories,
  activeCategory,
  activeApplication,
  banners = [],
  tab,
  app
}: MobileCatalogTemplateProps) {
  const [activeTab, setActiveTab] = useState(tab || "products")
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams?.get('category') || null
  )
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    searchParams?.get('subcategory') || null
  )

  // Update active tab when tab prop changes
  useEffect(() => {
    if (tab) {
      setActiveTab(tab)
    }
  }, [tab])

  // Sync URL params with state
  useEffect(() => {
    setSelectedCategory(searchParams?.get('category') || null)
    setSelectedSubcategory(searchParams?.get('subcategory') || null)
  }, [searchParams])

  // Determine filter configuration based on context
  const filterConfig = useMemo(() => {
    // Application page: show category filters
    if (activeApplication?.categories && activeApplication.categories.length > 0) {
      return {
        title: "Categories",
        filters: activeApplication.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          count: cat.product_count
        })),
        activeFilter: selectedCategory,
        onFilterChange: (id: string | null) => {
          setSelectedCategory(id)
          const url = new URL(window.location.href)
          if (id) {
            url.searchParams.set('category', id)
          } else {
            url.searchParams.delete('category')
          }
          router.push(url.pathname + url.search, { scroll: false })
        }
      }
    }

    // Category page: show subcategory filters
    if (activeCategory?.category_children && activeCategory.category_children.length > 0) {
      return {
        title: "Subcategories",
        filters: activeCategory.category_children.map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          count: sub.product_count
        })),
        activeFilter: selectedSubcategory,
        onFilterChange: (id: string | null) => {
          setSelectedSubcategory(id)
          const url = new URL(window.location.href)
          if (id) {
            url.searchParams.set('subcategory', id)
          } else {
            url.searchParams.delete('subcategory')
          }
          router.push(url.pathname + url.search, { scroll: false })
        }
      }
    }

    return null
  }, [activeApplication, activeCategory, selectedCategory, selectedSubcategory, router])

  // Filter products based on selected category/subcategory
  const filteredProducts = useMemo(() => {
    if (selectedCategory) {
      return products.filter(p =>
        p.categories?.some((cat: any) => cat.id === selectedCategory)
      )
    } else if (selectedSubcategory) {
      return products.filter(p =>
        p.categories?.some((cat: any) => cat.id === selectedSubcategory)
      )
    }
    return products
  }, [products, selectedCategory, selectedSubcategory])

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      {/* Tabs - Sticky below topbar */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === "products" && (
        <>
          <ProductsTabTemplate products={filteredProducts} banners={banners} />

          {/* Filter Sidebar (only show if filters are available) */}
          {filterConfig && (
            <FilterSidebar {...filterConfig} />
          )}
        </>
      )}

      {activeTab === "categories" && (
        <>
          {/* Category Hero Grid - When coming from application */}
          {app ? (
            <CategoryHeroGrid applicationSlug={app} categories={categories} />
          ) : (
            <CategoriesTabTemplate
              categories={categories}
              products={products}
            />
          )}
        </>
      )}
    </div>
  )
}

