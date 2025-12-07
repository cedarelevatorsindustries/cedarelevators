"use client"

import { Package } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { MegaMenu } from "./mega-menu/index"
import type { NavbarConfig } from "../config"

interface NavbarBrowseProps {
  categories: HttpTypes.StoreProductCategory[]
  config: NavbarConfig
  isTransparent: boolean
  isScrolled: boolean
  onMegaMenuChange: (isOpen: boolean) => void
  isLoggedIn?: boolean
}

export function NavbarBrowse({ categories, config, isTransparent, isScrolled, onMegaMenuChange, isLoggedIn = false }: NavbarBrowseProps) {
  // When scrolled (navbar is white/fixed), show Browse Products button instead of mega menu
  if (isScrolled && config.showMegaMenu) {
    return (
      <LocalizedClientLink
        href="/catalog"
        className={`flex items-center gap-2 text-sm font-medium transition-colors font-montserrat ${
          isTransparent
            ? 'text-white hover:text-blue-300' 
            : 'text-gray-700 hover:text-blue-700'
        }`}
      >
        <Package size={16} />
        Browse Products
      </LocalizedClientLink>
    )
  }

  // Show Mega Menu (All Categories dropdown) when not scrolled in transparent hero state
  if (config.showMegaMenu && !isScrolled) {
    return (
      <MegaMenu 
        categories={categories} 
        isScrolled={!isTransparent} 
        onOpenChange={onMegaMenuChange}
      />
    )
  }

  // Show Browse Products button for other pages
  if (config.showBrowseProducts) {
    return (
      <LocalizedClientLink
        href="/catalog"
        className={`flex items-center gap-2 text-sm font-medium transition-colors font-montserrat ${
          isTransparent
            ? 'text-white hover:text-blue-300' 
            : 'text-gray-700 hover:text-blue-700'
        }`}
      >
        <Package size={16} />
        Browse Products
      </LocalizedClientLink>
    )
  }

  // Show nothing
  return null
}
