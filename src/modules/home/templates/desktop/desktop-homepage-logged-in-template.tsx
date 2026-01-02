"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Product, ProductCategory, Order } from "@/lib/types/domain"
import type { Application } from "@/lib/data/applications"
import type { ElevatorType } from "@/lib/data/elevator-types"
import HeroLite from "../../components/common/hero-lite"
import { WelcomeSection } from "../../components/common/welcome-section"
import ProductsTab from "../../components/desktop/tab-content/product"
import CategoriesTab from "../../components/desktop/tab-content/categories"
import BusinessHubTab from "../../components/desktop/tab-content/business-hub"
import { ApplicationsSection } from "@/components/store/applications-section"

interface DesktopHomepageLoggedInProps {
  products: Product[]
  testimonials: any[]
  userType: "individual" | "business" | "verified"
  categories: ProductCategory[]
  applications?: Application[]
  elevatorTypes?: ElevatorType[]
  collections: any[]
  categoriesCollections: any[]
  businessHubCollections: any[]
  businessHubData?: any
  popularSearchTerms?: string[]
}

export default function DesktopHomepageLoggedIn({
  products,
  testimonials,
  userType,
  categories,
  applications = [],
  elevatorTypes = [],
  collections = [],
  categoriesCollections = [],
  businessHubCollections = [],
  businessHubData = null,
  popularSearchTerms = []
}: DesktopHomepageLoggedInProps) {
  const searchParams = useSearchParams()
  const app = searchParams.get('app')
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "business-hub">("products")

  // Auto-switch to categories tab when app parameter is present
  useEffect(() => {
    if (app) {
      setActiveTab("categories")
      // Scroll to tab content to ensure user sees the change
      const tabContent = document.getElementById('tab-content-container')
      if (tabContent) {
        tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [app])

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
      <HeroLite userType={userType} categories={categories} popularSearchTerms={popularSearchTerms} />

      {/* Welcome Section with Quick Stats */}
      <WelcomeSection userType={userType} />

      {/* Tab Content - Controlled by HeroLite tabs */}
      <div id="tab-content-container" className="w-full">
        {activeTab === "products" && (
          <>
            {/* Shop by Application - Only show on Products tab */}
            {applications.length > 0 && (
              <ApplicationsSection applications={applications} />
            )}
            <ProductsTab products={products} collections={collections} />
          </>
        )}
        {activeTab === "categories" && <CategoriesTab categories={categories} elevatorTypes={elevatorTypes} collections={categoriesCollections} />}
        {activeTab === "business-hub" && userType === "business" && businessHubData && <BusinessHubTab data={businessHubData} collections={businessHubCollections} />}
      </div>
    </div>
  )
}
