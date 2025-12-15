"use client"

import { useState, useEffect } from "react"
import { Product, ProductCategory, Order } from "@/lib/types/domain"
import HeroLite from "../../components/common/hero-lite"
import { WelcomeSection } from "../../components/common/welcome-section"
import ProductsTab from "../../components/desktop/tab-content/product"
import CategoriesTab from "../../components/desktop/tab-content/categories"
import BusinessHubTab from "../../components/desktop/tab-content/business-hub"

interface DesktopHomepageLoggedInProps {
  products: Product[]
  testimonials: any[]
  userType: "individual" | "business"
  categories: ProductCategory[]
}

export default function DesktopHomepageLoggedIn({
  products,
  testimonials,
  userType,
  categories
}: DesktopHomepageLoggedInProps) {
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "business-hub">("products")

  // Listen to tab changes from HeroLite
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail.tab)
    }

    window.addEventListener("heroTabChange", handleTabChange as EventListener)
    return () => {
      window.removeEventListener("heroTabChange", handleTabChange as EventListener)
    }
  }, [])

  return (
    <div className="w-full">
      {/* Hero Lite - Compact hero for logged-in users with built-in tabs */}
      <HeroLite userType={userType} categories={categories} />

      {/* Welcome Section with Quick Stats */}
      <WelcomeSection userType={userType} />

      {/* Tab Content - Controlled by HeroLite tabs */}
      <div className="w-full">
        {activeTab === "products" && <ProductsTab products={products} />}
        {activeTab === "categories" && <CategoriesTab categories={categories} />}
        {activeTab === "business-hub" && userType === "business" && <BusinessHubTab />}
      </div>
    </div>
  )
}
