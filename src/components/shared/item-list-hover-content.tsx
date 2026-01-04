"use client"

import { ReactNode } from "react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { cn } from "@/lib/utils"

export interface ListItem {
    id: string
    title: string
    image?: string
    subtitle?: string
    price?: string
    quantity?: number
}

interface ItemListHoverContentProps {
    /** Title for the header */
    title: string
    /** List of items to display */
    items: ListItem[]
    /** Empty state configuration */
    emptyState: {
        icon: ReactNode
        message: string
        action?: {
            label: string
            href: string
        }
    }
    /** Footer configuration */
    footer?: {
        /** For items like total in cart */
        summary?: {
            label: string
            value: string
        }
        /** Main action button */
        action: {
            label: string
            href: string
        }
    }
    /** Custom render for each item */
    renderItem?: (item: ListItem) => ReactNode
    /** Max height for scrollable list */
    maxHeight?: string
}

/**
 * Generic Item List Hover Content
 * Reusable content component for cart, wishlist, and similar hover dropdowns
 */
export function ItemListHoverContent({
    title,
    items,
    emptyState,
    footer,
    renderItem,
    maxHeight = "max-h-96"
}: ItemListHoverContentProps) {
    // Empty state
    if (items.length === 0) {
        return (
            <div className="w-80 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <div className="flex flex-col items-center justify-center py-8">
                    {emptyState.icon}
                    <p className="text-sm text-gray-600 mt-3">{emptyState.message}</p>
                </div>
                {emptyState.action && (
                    <LocalizedClientLink
                        href={emptyState.action.href}
                        className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors mt-4"
                    >
                        {emptyState.action.label}
                    </LocalizedClientLink>
                )}
            </div>
        )
    }

    return (
        <div className="w-96">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>

            {/* Item List */}
            <div className={cn("overflow-y-auto", maxHeight)}>
                {items.map((item) =>
                    renderItem ? renderItem(item) : (
                        <DefaultItemRow key={item.id} item={item} />
                    )
                )}
            </div>

            {/* Footer */}
            {footer && (
                <div className="p-4 border-t border-gray-200">
                    {footer.summary && (
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-medium text-gray-700">{footer.summary.label}</span>
                            <span className="text-lg font-bold text-gray-900">{footer.summary.value}</span>
                        </div>
                    )}
                    <LocalizedClientLink
                        href={footer.action.href}
                        className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        {footer.action.label}
                    </LocalizedClientLink>
                </div>
            )}
        </div>
    )
}

/** Default item row rendering */
function DefaultItemRow({ item }: { item: ListItem }) {
    return (
        <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
            <div className="flex gap-3">
                {item.image && (
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                    />
                )}
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.title}
                    </h4>
                    {item.subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                    )}
                    {item.price && (
                        <p className="text-sm text-gray-600 mt-1">
                            {item.price}
                            {item.quantity && item.quantity > 1 && ` x ${item.quantity}`}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ItemListHoverContent

