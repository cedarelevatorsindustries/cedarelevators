import {
  Package,
  Truck,
  FileText,
  Info,
  Phone,
  Grid3X3,
  Bookmark,
  ShieldCheck,
} from "lucide-react"

export interface MenuItem {
  icon: React.ComponentType<{ size?: number }>
  label: string
  href: string
  badge?: string
}

// Guest & Phase 1 catalog/quote navigation items
export const guestCatalogItems: MenuItem[] = [
  { icon: Package, label: "Browse Products", href: "/products" },
  { icon: Grid3X3, label: "All Categories", href: "/categories" },
  { icon: Bookmark, label: "Quote List", href: "/wishlist" },
  { icon: FileText, label: "Request a Quote", href: "/quotes/new" },
  { icon: ShieldCheck, label: "Track Quotations", href: "/quotes/track" },
]

export const guestMoreMenuItems: MenuItem[] = [
  { icon: Info, label: "About Us", href: "/about" },
  { icon: Phone, label: "Contact", href: "/contact" },
]

export const loggedInMoreMenuItems: MenuItem[] = [
  { icon: Info, label: "About Us", href: "/about" },
  { icon: Phone, label: "Contact", href: "/contact" },
]

export const companyInfoItems: MenuItem[] = [
  { icon: Info, label: "About Cedar", href: "/about" },
  { icon: ShieldCheck, label: "Why Choose Cedar", href: "/why-choose" },
  { icon: FileText, label: "Warranty Information", href: "/warranty" },
  { icon: Phone, label: "Contact Us", href: "/contact" },
]

export const legalPolicyItems: MenuItem[] = [
  { icon: FileText, label: "Privacy Policy", href: "/privacy" },
  { icon: FileText, label: "Terms & Conditions", href: "/terms" },
  { icon: Package, label: "Return Policy", href: "/return-policy" },
  { icon: Truck, label: "Shipping Policy", href: "/shipping-policy" },
]

export const guestAboutItems: MenuItem[] = companyInfoItems

export const guestLegalItems: MenuItem[] = legalPolicyItems
