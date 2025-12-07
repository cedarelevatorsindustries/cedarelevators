"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import Tabs from "../../components/mobile/tabs"
import ProductsTabTemplate from "./products-tab-template"
import CategoriesTabTemplate from "./categories-tab-template"

interface MobileCatalogTemplateProps {
  products: HttpTypes.StoreProduct[]
  categories: HttpTypes.StoreProductCategory[]
}

const tabs = [
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories" }
]

export default function MobileCatalogTemplate({ 
  products, 
  categories
}: MobileCatalogTemplateProps) {
  const [activeTab, setActiveTab] = useState("products")

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      {/* Tabs - Sticky below topbar */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === "products" && (
        <ProductsTabTemplate products={products} />
      )}

      {activeTab === "categories" && (
        <CategoriesTabTemplate 
          categories={categories}
          products={products}
        />
      )}
    </div>
  )
}
