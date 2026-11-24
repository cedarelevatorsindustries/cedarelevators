"use client"

import { Package } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { ProductCategory } from "@/lib/types/domain"
import type { NavbarConfig } from "../config"

interface NavbarBrowseProps {
  categories?: ProductCategory[]
  config?: NavbarConfig
  isTransparent?: boolean
  isScrolled?: boolean
  onMegaMenuChange?: (isOpen: boolean) => void
  isLoggedIn?: boolean
}

export function NavbarBrowse({}: NavbarBrowseProps = {}) {
  return (
    <LocalizedClientLink
      href="/products"
      className="flex items-center gap-2 text-sm font-medium transition-colors font-montserrat text-gray-700 hover:text-orange-600 whitespace-nowrap"
      aria-label="Browse Products"
    >
      <Package size={16} className="text-gray-600" />
      <span>Browse Products</span>
    </LocalizedClientLink>
  )
}
