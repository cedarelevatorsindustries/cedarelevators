"use client"

import { useState, useEffect } from "react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Search,
    Package,
    Users,
    ShoppingCart,
    Settings,
    BarChart3,
    Layers,
    FileText,
    Percent
} from "lucide-react"

const searchData = [
    // Orders
    {
        id: "orders",
        title: "Orders",
        description: "Manage customer orders",
        icon: ShoppingCart,
        href: "/admin/orders",
        category: "Navigation"
    },

    // Products
    {
        id: "products",
        title: "Products",
        description: "Manage your product catalog",
        icon: Package,
        href: "/admin/products",
        category: "Navigation"
    },
    {
        id: "inventory",
        title: "Inventory",
        description: "Track stock levels",
        icon: BarChart3,
        href: "/admin/inventory",
        category: "Navigation"
    },

    // Customers
    {
        id: "customers",
        title: "Customers",
        description: "Manage customer accounts",
        icon: Users,
        href: "/admin/customers",
        category: "Navigation"
    },

    // Collections
    {
        id: "collections",
        title: "Collections",
        description: "Product collections",
        icon: Layers,
        href: "/admin/collections",
        category: "Navigation"
    },

    // Coupons
    {
        id: "coupons",
        title: "Coupons",
        description: "Discount codes and promotions",
        icon: Percent,
        href: "/admin/coupons",
        category: "Navigation"
    },

    // Settings
    {
        id: "settings",
        title: "Settings",
        description: "Store configuration",
        icon: Settings,
        href: "/admin/settings",
        category: "Navigation"
    },

    // Quick Actions
    {
        id: "create-product",
        title: "Create New Product",
        description: "Add a new product to your catalog",
        icon: Package,
        href: "/admin/products/new",
        category: "Quick Actions"
    },
    {
        id: "create-coupon",
        title: "Create New Coupon",
        description: "Set up a discount code",
        icon: Percent,
        href: "/admin/coupons/new",
        category: "Quick Actions"
    },
]

export function GlobalSearch() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            // Windows/Linux: Ctrl+J, Mac: Cmd+J
            if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const handleSelect = (href: string) => {
        setOpen(false)
        // Use Next.js router for better navigation
        if (typeof window !== 'undefined') {
            window.location.href = href
        }
    }

    const groupedData = searchData.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = []
        }
        acc[item.category].push(item)
        return acc
    }, {} as Record<string, typeof searchData>)

    return (
        <>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search orders, products, customers..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    {Object.entries(groupedData).map(([category, items]) => (
                        <div key={category}>
                            <CommandGroup heading={category}>
                                {items.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <CommandItem
                                            key={item.id}
                                            value={`${item.title} ${item.description}`}
                                            onSelect={() => handleSelect(item.href)}
                                            className="flex items-center space-x-3 p-3 cursor-pointer"
                                        >
                                            <div className="p-2 rounded-lg bg-red-100">
                                                <Icon className="h-4 w-4 text-red-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">
                                                    {item.title}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {item.description}
                                                </div>
                                            </div>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                            <CommandSeparator />
                        </div>
                    ))}

                    <div className="border-t border-gray-200 p-4 text-xs text-gray-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                    <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600">
                                        ↵
                                    </kbd>
                                    <span>to select</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600">
                                        ↑↓
                                    </kbd>
                                    <span>to navigate</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1">
                                <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600">
                                    esc
                                </kbd>
                                <span>to close</span>
                            </div>
                        </div>
                    </div>
                </CommandList>
            </CommandDialog>
        </>
    )
}
