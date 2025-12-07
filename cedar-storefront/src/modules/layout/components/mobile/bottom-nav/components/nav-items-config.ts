import { Home, ShoppingBag, ShoppingCart, User, FileText } from "lucide-react"

export interface NavItemConfig {
  href: string
  icon: React.ComponentType<{ size?: number }>
  label: string
}

export const navItems: NavItemConfig[] = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/catalog", icon: ShoppingBag, label: "Catalog" },
  { href: "/request-quote", icon: FileText, label: "Quote" },
  { href: "/cart", icon: ShoppingCart, label: "Cart" },
  { href: "/profile", icon: User, label: "My Cedar" }
]

/**
 * Get intelligent quote tab label based on user type
 */
export function getQuoteTabLabel(userType: "guest" | "individual" | "business"): string {
  switch (userType) {
    case "guest":
      return "Get Quote"
    case "individual":
      return "My Quotes"
    case "business":
      return "Business"
    default:
      return "Quote"
  }
}
