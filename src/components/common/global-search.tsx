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
    LayoutDashboard,
    Package,
    FolderTree,
    Layers,
    Image,
    Settings,
    Store,
    FileText,
    Tag,
} from "lucide-react"

const searchData = [
    // Main Navigation
    {
        id: "dashboard",
        title: "Dashboard",
        description: "Overview and business performance metrics",
        icon: LayoutDashboard,
        href: "/admin",
        category: "Navigation"
    },
    {
        id: "quotations",
        title: "Quotation Requests",
        description: "Review, price, and issue customer quotations",
        icon: FileText,
        href: "/admin/quotes",
        category: "Navigation"
    },
    {
        id: "products",
        title: "Products",
        description: "Manage your elevator product catalog",
        icon: Package,
        href: "/admin/products",
        category: "Navigation"
    },
    {
        id: "applications",
        title: "Applications",
        description: "Building types and elevator applications",
        icon: Layers,
        href: "/admin/applications",
        category: "Navigation"
    },
    {
        id: "categories",
        title: "Categories",
        description: "Product categories and taxonomies",
        icon: FolderTree,
        href: "/admin/categories",
        category: "Navigation"
    },
    {
        id: "elevator-types",
        title: "Elevator Types",
        description: "Traction, hydraulic, and custom elevator types",
        icon: Tag,
        href: "/admin/elevator-types",
        category: "Navigation"
    },
    {
        id: "collections",
        title: "Collections",
        description: "Featured product groupings and collections",
        icon: Store,
        href: "/admin/collections",
        category: "Navigation"
    },
    {
        id: "banners",
        title: "Banners",
        description: "Storefront promotional and hero banners",
        icon: Image,
        href: "/admin/banners",
        category: "Navigation"
    },
    {
        id: "settings",
        title: "Settings",
        description: "System and profile configuration",
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
        id: "review-quotes",
        title: "Review New Quotations",
        description: "Open pending customer quote submissions",
        icon: FileText,
        href: "/admin/quotes",
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
                <CommandInput placeholder="Search quotations, customers, products..." />
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
                                            className="flex items-center space-x-3 p-3 cursor-pointer rounded-lg"
                                        >
                                            <div className="p-2 rounded-lg bg-[#F9F8F5] border border-[#EAE8E2]">
                                                <Icon className="h-4 w-4 text-[#77736D]" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-[#171717]">
                                                    {item.title}
                                                </div>
                                                <div className="text-sm text-[#77736D]">
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

