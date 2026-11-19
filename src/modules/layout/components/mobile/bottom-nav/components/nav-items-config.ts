import { House, ShoppingBag, FileText, Phone } from "lucide-react"

export interface NavItemConfig {
  href: string
  icon: React.ComponentType<{ size?: number }>
  label: string
}

// Phase 1: Product Catalogue & Quotation Discovery Navigation
export const navItems: NavItemConfig[] = [
  { href: "/", icon: House, label: "Home" },
  { href: "/products", icon: ShoppingBag, label: "Catalog" },
  { href: "/quotes/new", icon: FileText, label: "Get Quote" },
  { href: "/contact", icon: Phone, label: "Contact" }
]

/**
 * Filtered nav items for Phase 1 (customer-facing e-commerce & profile tabs disabled)
 */
export function getFilteredNavItems(): NavItemConfig[] {
  return navItems
}

/**
 * Single, friendly quote label for Phase 1 guest discovery
 */
export function getQuoteTabLabel(): string {
  return "Get Quote"
}
