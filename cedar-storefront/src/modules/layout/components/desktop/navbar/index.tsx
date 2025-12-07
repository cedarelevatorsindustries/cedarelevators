"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { getNavbarVariant, mergeNavbarConfig, navbarConfig, type NavbarConfig } from "./config"
import {
  NavbarLogo,
  NavbarActions,
  NavbarSearch,
  NavbarBrowse,
  Breadcrumb,
  StickyProductBar,
  SecondaryFilterBar,
  CategoryHeroBanner
} from "./components"

interface DesktopNavbarProps {
  regions: HttpTypes.StoreRegion[]
  categories: HttpTypes.StoreProductCategory[]
  customConfig?: Partial<NavbarConfig>
  isLoggedIn?: boolean
}

export default function DesktopNavbar({ regions, categories, customConfig, isLoggedIn = false }: DesktopNavbarProps) {
  const pathname = usePathname()
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Get variant-based configuration
  const variant = getNavbarVariant(pathname)

  // Determine search bar visibility
  // In guest mode: always show search bar (even in transparent hero state)
  // In logged-in mode: hide search bar in transparent hero state, show after scroll
  const shouldShowSearch = !isLoggedIn || isScrolled || variant !== 'homepage'
  const finalConfig = mergeNavbarConfig(variant, {
    ...customConfig,
    searchVariant: shouldShowSearch ? 'full' : 'hidden'
  })
  const config = finalConfig

  // Handle scroll detection based on config
  useEffect(() => {
    if (config.scrollBehavior === 'static') {
      setIsScrolled(false)
      return
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > config.scrollThreshold)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [config.scrollBehavior, config.scrollThreshold])

  // Determine navbar visibility and styling
  const isTransparent = config.transparent && !isScrolled && !isMegaMenuOpen
  const shouldShowHeader = config.position === 'fixed' || isScrolled

  // Dynamic classes based on config
  const positionClass = config.position === 'absolute'
    ? (isScrolled ? 'fixed' : 'absolute')
    : 'fixed'

  const bgClass = isTransparent
    ? 'bg-transparent border-transparent'
    : 'bg-white border-gray-200'

  const zIndexStyle = isScrolled
    ? config.zIndex.scrolled
    : config.zIndex.initial

  return (
    <>
      <div
        className={`${positionClass} top-0 inset-x-0 group transition-all duration-300 ease-in-out ${shouldShowHeader ? 'translate-y-0 opacity-100' : ''
          } hidden md:block`}
        style={{
          height: `${config.height.initial}px`,
          zIndex: zIndexStyle
        }}
      >
        <header
          className={`relative mx-auto duration-300 ease-in-out ${bgClass} border-b shadow-none`}
          style={{ height: `${isScrolled ? config.height.scrolled : config.height.initial}px` }}
        >
          <nav className="max-w-[1440px] mx-auto flex items-center justify-between w-full h-full px-6">
            {/* Left: Logo + Categories/Browse + Contact & Help (when logged in) */}
            <div className="flex items-center gap-6 ml-2">
              <NavbarLogo isTransparent={isTransparent} />
              <NavbarBrowse
                categories={categories}
                config={config}
                isTransparent={isTransparent}
                isScrolled={isScrolled}
                onMegaMenuChange={setIsMegaMenuOpen}
                isLoggedIn={isLoggedIn}
              />
            </div>

            {/* Center: Search Bar */}
            {config.searchVariant !== 'hidden' && (
              <NavbarSearch />
            )}

            {/* Right: Actions */}
            <NavbarActions
              config={config}
              isTransparent={isTransparent}
              pathname={pathname}
              isScrolled={isScrolled}
            />
          </nav>

          {/* Breadcrumb - Conditional based on config */}
          {config.showBreadcrumb && (
            <Breadcrumb pathname={pathname} />
          )}
        </header>
      </div>

      {/* Category Hero Banner - Shows below navbar on category pages */}
      <CategoryHeroBanner
        isVisible={config.showCategoryHero && !isScrolled}
        category={{
          name: "Category Name", // TODO: Get from page context
          description: "Browse our selection of quality products",
          image: undefined
        }}
      />

      {/* Secondary Filter Bar - Sticky below navbar on scroll */}
      <SecondaryFilterBar
        isVisible={config.showSecondaryFilterBar && isScrolled}
      />
    </>
  )
}
