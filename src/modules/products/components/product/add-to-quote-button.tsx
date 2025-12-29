"use client"

import { useState } from "react"
import { FileText, LoaderCircle, Plus, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { useQuoteBasket } from "@/lib/hooks/use-quote-basket"

interface AddToQuoteButtonProps {
    product: {
        id: string
        name: string
        sku?: string
        thumbnail?: string
        price?: number
        variant_id?: string
    }
    quantity?: number
    className?: string
    variant?: "primary" | "secondary" | "outline" | "icon"
    showLabel?: boolean
}

export function AddToQuoteButton({
    product,
    quantity = 1,
    className = "",
    variant = "secondary",
    showLabel = true
}: AddToQuoteButtonProps) {
    const { addItem, isGuest, userType, isSyncing } = useQuoteBasket()
    const [isAdding, setIsAdding] = useState(false)

    const handleAddToQuote = async () => {
        setIsAdding(true)

        try {
            const success = await addItem({
                product_id: product.id,
                variant_id: product.variant_id,
                product_name: product.name,
                product_sku: product.sku,
                product_thumbnail: product.thumbnail,
                quantity,
                unit_price: product.price
            })

            if (!success) {
                // Error already shown by hook
                return
            }
        } catch (error) {
            console.error("Error adding to quote:", error)
            toast.error("Failed to add to quote basket")
        } finally {
            setIsAdding(false)
        }
    }

    const isLoading = isAdding || isSyncing

    // Get button label based on user type
    const getLabel = () => {
        if (userType === 'business' || userType === 'verified') {
            return "Get Bulk Quote"
        }
        return "Request Quote"
    }

    // Variant styles
    const getStyles = () => {
        const base = "flex items-center justify-center gap-2 font-medium transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"

        switch (variant) {
            case "primary":
                return `${base} bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 shadow-sm`
            case "secondary":
                return `${base} bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5`
            case "outline":
                return `${base} border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2.5`
            case "icon":
                return `${base} p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700`
            default:
                return `${base} bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5`
        }
    }

    const Icon = userType === 'business' || userType === 'verified' ? ShoppingBag : FileText

    return (
        <button
            onClick={handleAddToQuote}
            disabled={isLoading}
            className={`${getStyles()} ${className}`}
            title={getLabel()}
        >
            {isLoading ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : variant === "icon" ? (
                <Plus className="w-4 h-4" />
            ) : (
                <Icon className="w-4 h-4" />
            )}
            {showLabel && variant !== "icon" && (
                <span className="text-sm">{getLabel()}</span>
            )}
        </button>
    )
}

// Compact version for product cards
export function AddToQuoteButtonCompact({
    product,
    quantity = 1
}: Omit<AddToQuoteButtonProps, 'variant' | 'showLabel' | 'className'>) {
    return (
        <AddToQuoteButton
            product={product}
            quantity={quantity}
            variant="icon"
            showLabel={false}
            className="w-9 h-9"
        />
    )
}
