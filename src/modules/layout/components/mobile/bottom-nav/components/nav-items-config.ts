import { House, ShoppingBag, ShoppingCart, User, FileText } from "lucide-react"

export interface NavItemConfig {
  href: string
  icon: React.ComponentType<{ size?: number }>
  label: string
}

export const navItems: NavItemConfig[] = [
  { href: "/", icon: House, label: "Home" },
  { href: "/catalog", icon: ShoppingBag, label: "Catalog" },
  { href: "/quotes", icon: FileText, label: "Quote" },
  { href: "/cart", icon: ShoppingCart, label: "Cart" },
  { href: "/profile", icon: User, label: "My Cedar" }
]

/**
 * Get filtered nav items based on user type
 * Hides cart for individual and guest users (they can only request quotes)
 */
export function getFilteredNavItems(userType: "guest" | "individual" | "business_unverified" | "business_verified"): NavItemConfig[] {
  // Hide cart for individual and guest users
  if (userType === "guest" || userType === "individual") {
    return navItems.filter(item => item.href !== "/cart")
  }
  return navItems
}

/**
 * Get intelligent quote tab label based on user type
 * Single entry point principle: /quotes for all users
 */
export function getQuoteTabLabel(userType: "guest" | "individual" | "business" | "verified"): string {
  // Guest: "Get Quote" - encourages lead capture
  // All logged-in users: "Quotes" - simple and consistent
  return userType === "guest" ? "Get Quote" : "Quotes"
}

