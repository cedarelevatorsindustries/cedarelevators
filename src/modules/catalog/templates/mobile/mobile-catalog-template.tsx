"use client"

import { useState, useEffect } from "react"
import { Product, ProductCategory, Order } from "@/lib/types/domain"
import Tabs from "../../components/mobile/tabs"
import ProductsTabTemplate from "./products-tab-template"
import CategoriesTabTemplate from "./categories-tab-template"
import { CategoryHeroGrid } from "@/components/store/category-hero-grid"
import { BannerWithSlides } from "@/lib/types/banners"

interface MobileCatalogTemplateProps {
  products: Product[]
  categories: ProductCategory[]
  banners?: BannerWithSlides[]
  tab?: string
  app?: string
}

const tabs = [
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories" }
]

export default function MobileCatalogTemplate({
  products,
  categories,
  banners = [],
  tab,
  app
}: MobileCatalogTemplateProps) {
  const [activeTab, setActiveTab] = useState(tab || "products")

  // Update active tab when tab prop changes
  useEffect(() => {
    if (tab) {
      setActiveTab(tab)
    }
  }, [tab])

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      {/* Tabs - Sticky below topbar */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === "products" && (
        <ProductsTabTemplate products={products} banners={banners} />
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
