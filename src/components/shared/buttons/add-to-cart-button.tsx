"use client"

import { useState } from "react"
import { ShoppingCart, LoaderCircle, Check } from "lucide-react"
import { useCart } from "@/lib/hooks"
import { cn } from "@/lib/utils"

type AddToCartMode = 'hook' | 'callback'

interface BaseProps {
    /** Button size variant */
    size?: "sm" | "md" | "lg"
    /** Whether the button is disabled */
    disabled?: boolean
    /** Additional CSS classes */
    className?: string
    /** Quantity to add */
    quantity?: number
    /** Show success animation after adding */
    showSuccessState?: boolean
    /** Callback after successful add */
    onSuccess?: () => void
}

interface HookModeProps extends BaseProps {
    /** Mode: use built-in cart hook */
    mode?: 'hook'
    /** Variant ID for cart hook mode */
    variantId: string
    productId?: never
    onAddToCart?: never
}

interface CallbackModeProps extends BaseProps {
    /** Mode: use custom callback */
    mode: 'callback'
    /** Product ID for callback mode */
    productId: string
    /** Custom add to cart callback */
    onAddToCart: (productId: string, quantity: number) => void | Promise<void>
    variantId?: never
}

type AddToCartButtonProps = HookModeProps | CallbackModeProps

const sizeClasses = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-3.5 px-8 text-lg"
}

/**
 * Consolidated Add to Cart Button
 * 
 * Supports two modes:
 * - 'hook' mode: Uses the built-in useCart hook (default)
 * - 'callback' mode: Uses a custom onAddToCart callback
 */
export function AddToCartButton(props: AddToCartButtonProps) {
    const {
        size = "md",
        disabled = false,
        className = "",
        quantity = 1,
        showSuccessState = true,
        onSuccess,
        mode = 'hook'
    } = props

    const { addItem } = useCart()
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const handleClick = async () => {
        if (disabled || isLoading) return

        setIsLoading(true)
        try {
            if (mode === 'hook') {
                const hookProps = props as HookModeProps
                await addItem(hookProps.variantId, quantity)
            } else {
                const callbackProps = props as CallbackModeProps
                await callbackProps.onAddToCart(callbackProps.productId, quantity)
            }

            if (showSuccessState) {
                setShowSuccess(true)
                setTimeout(() => setShowSuccess(false), 2000)
            }

            onSuccess?.()
        } catch (error) {
            console.error("Error adding to cart:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={disabled || isLoading}
            className={cn(
                "w-full bg-blue-600 text-white rounded-lg font-semibold",
                "hover:bg-blue-700 transition-colors",
                "flex items-center justify-center gap-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                sizeClasses[size],
                className
            )}
        >
            {isLoading ? (
                <>
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                    Adding...
                </>
            ) : showSuccess ? (
                <>
                    <Check className="w-5 h-5" />
                    Added!
                </>
            ) : (
                <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                </>
            )}
        </button>
    )
}

export default AddToCartButton

