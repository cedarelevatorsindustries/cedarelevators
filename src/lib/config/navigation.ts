/**
 * Centralized navigation configuration for Cedar Elevators
 * Defines menu structures for Desktop, Mobile Bottom Nav, and Mobile Sidebar
 */

import {
    Home,
    ShoppingCart,
    Heart,
    FileText,
    Package,
    User,
    Settings,
    HelpCircle,
    Phone,
    Info,
    FileCheck,
    Bell,
    MapPin,
    Shield
} from "lucide-react"

// ============================================================================
// Desktop Mega Menu Configuration
// ============================================================================

export interface MegaMenuItem {
    title: string
    href: string
    description?: string
}

export interface MegaMenuSection {
    title: string
    items: MegaMenuItem[]
}

export const DESKTOP_MEGA_MENU = {
    catalog: {
        title: "Catalog",
        sections: [
            {
                title: "Browse",
                items: [
                    { title: "All Products", href: "/catalog", description: "Browse complete catalog" },
                    { title: "New Arrivals", href: "/catalog/collections/new-arrivals", description: "Latest products" },
                    { title: "Best Sellers", href: "/catalog/collections/best-sellers", description: "Popular items" },
                ]
            },
            {
                title: "By Application",
                items: [
                    { title: "Erection", href: "/catalog/applications/erection" },
                    { title: "Service", href: "/catalog/applications/service" },
                    { title: "Modernization", href: "/catalog/applications/modernization" },
                    { title: "Testing", href: "/catalog/applications/testing" },
                ]
            },
            {
                title: "By Elevator Type",
                items: [
                    { title: "Home Lifts", href: "/catalog/types/home-lifts" },
                    { title: "Residential", href: "/catalog/types/residential-lifts" },
                    { title: "Commercial", href: "/catalog/types/commercial-elevators" },
                    { title: "Hospital", href: "/catalog/types/hospital-lifts" },
                    { title: "Goods Lifts", href: "/catalog/types/goods-lifts" },
                    { title: "Hydraulic", href: "/catalog/types/hydraulic-lifts" },
                ]
            },
            {
                title: "Collections",
                items: [
                    { title: "Premium Range", href: "/catalog/collections/premium-range" },
                    { title: "Business Exclusive", href: "/catalog/collections/business-exclusive" },
                    { title: "Trending", href: "/catalog/collections/trending" },
                ]
            }
        ]
    },
    quickLinks: [
        { title: "Request Quote", href: "/quotes/new" },
        { title: "Track Order", href: "/profile/orders" },
    ],
    moreMenu: [
        { title: "Track Order", href: "/profile/orders" },
        { title: "About Us", href: "/about" },
        { title: "Contact Us", href: "/contact" },
    ]
} as const

// ============================================================================
// Mobile Bottom Navigation Configuration
// ============================================================================

export const MOBILE_BOTTOM_NAV = [
    {
        id: "home",
        label: "Home",
        href: "/",
        icon: Home,
    },
    {
        id: "catalog",
        label: "Catalog",
        href: "/catalog",
        icon: Package,
    },
    {
        id: "quote",
        label: "Quote",
        href: "/quotes/new",
        icon: FileText,
    },
    {
        id: "cart",
        label: "Cart",
        href: "/cart",
        icon: ShoppingCart,
    },
    {
        id: "profile",
        label: "MyCedar",
        href: "/profile",
        icon: User,
    },
] as const

// ============================================================================
// Mobile Sidebar Menu Configuration
// ============================================================================

export interface SidebarMenuItem {
    title: string
    href: string
    icon?: any
    badge?: string | number
    requiresAuth?: boolean
}

export interface SidebarMenuSection {
    title: string
    items: SidebarMenuItem[]
}

export const MOBILE_SIDEBAR_MENU: SidebarMenuSection[] = [
    {
        title: "Shopping",
        items: [
            { title: "My Cart", href: "/cart", icon: ShoppingCart },
            { title: "Saved Items", href: "/wishlist", icon: Heart },
        ]
    },
    {
        title: "My Activity",
        items: [
            { title: "My Orders", href: "/profile/orders", icon: Package, requiresAuth: true },
            { title: "Track Order", href: "/profile/orders", icon: MapPin },
            { title: "My Notifications", href: "/notifications", icon: Bell, requiresAuth: true },
        ]
    },
    {
        title: "Company Info",
        items: [
            { title: "About Cedar", href: "/about", icon: Info },
            { title: "Contact Us", href: "/contact", icon: Phone },
        ]
    },
    {
        title: "Legal",
        items: [
            { title: "Terms & Privacy", href: "/policies/terms", icon: FileCheck },
            { title: "Return Policy", href: "/returns", icon: Shield },
            { title: "Shipping Policy", href: "/shipping" },
            { title: "Warranty", href: "/warranty" },
        ]
    }
] as const

// ============================================================================
// Footer Configuration
// ============================================================================

export const FOOTER_CONFIG = {
    brand: {
        name: "Cedar Elevators Industries",
        tagline: "Premium lift components for every project",
        address: "67/37 North Mada Street, Padi, Chennai - 600050, Tamil Nadu, India",
        phone: "7299012340",
        email: "contact@cedarelevator.com"
    },
    columns: [
        {
            title: "Support",
            links: [
                { title: "Track Order", href: "/profile/orders" },
                { title: "Shipping Info", href: "/shipping" },
                { title: "Returns & Refunds", href: "/returns" },
                { title: "Warranty", href: "/warranty" },
                { title: "Contact", href: "/contact" },
            ]
        },
        {
            title: "Company",
            links: [
                { title: "About Us", href: "/about" },
                { title: "Why Choose Cedar", href: "/about#why-cedar" },
            ]
        },
        {
            title: "Quick Links",
            links: [
                { title: "Request Quote", href: "/quotes/new" },
                { title: "All Products", href: "/catalog" },
                { title: "Saved Items", href: "/wishlist" },
            ]
        },
        {
            title: "Policies",
            links: [
                { title: "Privacy Policy", href: "/policies/privacy" },
                { title: "Terms of Service", href: "/policies/terms" },
                { title: "Return Policy", href: "/returns" },
                { title: "Shipping Policy", href: "/shipping" },
            ]
        }
    ],
    social: {
        facebook: "#",
        twitter: "#",
        instagram: "#",
        linkedin: "#"
    }
} as const

// ============================================================================
// Type Exports
// ============================================================================

export type BottomNavItem = typeof MOBILE_BOTTOM_NAV[number]
export type SidebarSection = typeof MOBILE_SIDEBAR_MENU[number]

