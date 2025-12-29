import {
  Package,
  Truck,
  FileText,
  Info,
  Phone,
  CircleHelp,
  Grid3X3,
  ShoppingCart,
  Heart,
  Bell,
  ClipboardList,
  UserPlus,
  Settings
} from "lucide-react"

export interface MenuItem {
  icon: React.ComponentType<{ size?: number }>
  label: string
  href: string
  badge?: string
}

// Guest user more menu items
export const guestMoreMenuItems: MenuItem[] = [
  { icon: Package, label: "Bulk Order", href: "/bulk-orders" },
  { icon: Truck, label: "Track Order", href: "/track" },
  { icon: FileText, label: "Resources", href: "/resources" },
  { icon: Info, label: "About Us", href: "/about" },
  { icon: Phone, label: "Contact", href: "/contact" },
  { icon: CircleHelp, label: "Help Center", href: "/help" }
]

// Logged-in user more menu items (Contact and Help Center included for sticky navbar)
export const loggedInMoreMenuItems: MenuItem[] = [
  { icon: Package, label: "Bulk Order", href: "/bulk-orders" },
  { icon: Truck, label: "Track Order", href: "/track" },
  { icon: FileText, label: "Resources", href: "/resources" },
  { icon: Info, label: "About Us", href: "/about" },
  { icon: Phone, label: "Contact", href: "/contact" },
  { icon: CircleHelp, label: "Help Center", href: "/help" }
]

// Mobile hamburger menu items - Logged-in user
export const loggedInShoppingItems: MenuItem[] = [
  { icon: ShoppingCart, label: "My Cart", href: "/cart" },
  { icon: Heart, label: "Saved Items / Wishlist", href: "/saved" },
  { icon: Package, label: "Bulk Order", href: "/bulk-orders" }
]

export const loggedInActivityItems: MenuItem[] = [
  { icon: FileText, label: "My Orders", href: "/account/orders" },
  { icon: Truck, label: "Track Order", href: "/track" },
  { icon: Bell, label: "My Notifications", href: "/notifications" },
  { icon: FileText, label: "Resources (Manuals, Guides)", href: "/resources" }
]

export const companyInfoItems: MenuItem[] = [
  { icon: Info, label: "About Cedar", href: "/about" },
  { icon: Phone, label: "Contact Us", href: "/contact" },
  { icon: CircleHelp, label: "Help & FAQ", href: "/help" }
]

export const legalPolicyItems: MenuItem[] = [
  { icon: FileText, label: "Terms & Privacy", href: "/terms" },
  { icon: FileText, label: "Additional Legal Pages", href: "/legal" }
]

// Mobile hamburger menu items - Guest user
export const guestShoppingItems: MenuItem[] = [
  { icon: Package, label: "Browse Products", href: "/catalog" },
  { icon: ClipboardList, label: "Bulk Order (Quick Quote)", href: "/bulk-orders" },
  { icon: ShoppingCart, label: "View Cart (0 items)", href: "/cart" }
]

export const guestGetStartedItems: MenuItem[] = [
  { icon: ClipboardList, label: "Quick Quote Request", href: "/request-quote" },
  { icon: FileText, label: "Browse Resources", href: "/resources" },
  { icon: CircleHelp, label: "Help & FAQ", href: "/help" }
]

export const guestAboutItems: MenuItem[] = [
  { icon: Info, label: "About Cedar", href: "/about" },
  { icon: Settings, label: "Why Cedar?", href: "/why-cedar" },
  { icon: Phone, label: "Contact Us", href: "/contact" }
]

export const guestLegalItems: MenuItem[] = [
  { icon: FileText, label: "Terms & Privacy", href: "/terms" },
  { icon: Truck, label: "Shipping Info", href: "/shipping" },
  { icon: Package, label: "Return Policy", href: "/returns" }
]
