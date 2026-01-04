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
 * Get intelligent quote tab label based on user type
 * Single entry point principle: /quotes for all users
 */
export function getQuoteTabLabel(userType: "guest" | "individual" | "business" | "verified"): string {
  // Guest: "Get Quote" - encourages lead capture
  // All logged-in users: "Quotes" - simple and consistent
  return userType === "guest" ? "Get Quote" : "Quotes"
}

