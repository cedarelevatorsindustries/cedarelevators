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



  { icon: Info, label: "About Us", href: "/about" },
  { icon: Phone, label: "Contact", href: "/contact" },

]

// Logged-in user more menu items (Contact and Help Center included for sticky navbar)
export const loggedInMoreMenuItems: MenuItem[] = [
  { icon: Truck, label: "Track Order", href: "/profile/orders" },

  { icon: Info, label: "About Us", href: "/about" },
  { icon: Phone, label: "Contact", href: "/contact" },

]

// Mobile hamburger menu items - Logged-in user
export const loggedInShoppingItems: MenuItem[] = [
  { icon: ShoppingCart, label: "My Cart", href: "/cart" },
  { icon: Heart, label: "Saved Items / Wishlist", href: "/wishlist" }
]

export const loggedInActivityItems: MenuItem[] = [
  { icon: FileText, label: "My Orders", href: "/profile/orders" },
  { icon: Truck, label: "Track Order", href: "/track" },
  { icon: Bell, label: "My Notifications", href: "/notifications" },

]

export const companyInfoItems: MenuItem[] = [
  { icon: Info, label: "About Cedar", href: "/about" },
  { icon: Phone, label: "Contact Us", href: "/contact" },

]

export const legalPolicyItems: MenuItem[] = [
  { icon: FileText, label: "Terms & Privacy", href: "/terms" },
  { icon: FileText, label: "Additional Legal Pages", href: "/legal" }
]

// Mobile hamburger menu items - Guest user
// Note: Shopping and Get Started sections removed as per user requirements

export const guestAboutItems: MenuItem[] = [
  { icon: Settings, label: "Why Choose Cedar", href: "/why-cedar" },
  { icon: FileText, label: "Warranty Information", href: "/warranty" },
  { icon: Phone, label: "Contact Us", href: "/contact" }
]

export const guestLegalItems: MenuItem[] = [
  { icon: FileText, label: "Privacy Policy", href: "/privacy-policy" },
  { icon: FileText, label: "Terms & Conditions", href: "/terms-conditions" },
  { icon: Package, label: "Return Policy", href: "/return-policy" },
  { icon: Truck, label: "Shipping Policy", href: "/shipping-policy" }
]

