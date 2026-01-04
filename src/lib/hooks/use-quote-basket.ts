'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/lib/auth/client'
import { toast } from 'sonner'
import {
    QuoteBasketItem,
    QuoteBasket,
    UserType
} from '@/types/b2b/quote'
import {
    getQuoteBasket,
    updateQuoteBasket as syncQuoteBasket,
    addToQuoteBasket as serverAddToBasket,
    removeFromQuoteBasket as serverRemoveFromBasket,
    clearQuoteBasket as serverClearBasket
} from '@/lib/actions/quote-basket'

const GUEST_BASKET_KEY = 'cedar_quote_basket'
const MAX_GUEST_ITEMS = 1
const MAX_INDIVIDUAL_ITEMS = 10
const MAX_BUSINESS_ITEMS = 50
const MAX_VERIFIED_ITEMS = 1000 // Effectively unlimited

// Get user type from Clerk metadata
function getUserTypeFromMetadata(user: any): UserType {
    if (!user) return 'guest'

    const accountType = user.unsafeMetadata?.accountType || user.publicMetadata?.accountType
    const isVerified = user.publicMetadata?.isVerified || user.unsafeMetadata?.isVerified

    if (accountType === 'business') {
        return isVerified ? 'verified' : 'business'
    }

    return 'individual'
}

// Get max items limit based on user type
function getMaxItems(userType: UserType): number {
    switch (userType) {
        case 'guest': return MAX_GUEST_ITEMS
        case 'individual': return MAX_INDIVIDUAL_ITEMS
        case 'business': return MAX_BUSINESS_ITEMS
        case 'verified': return MAX_VERIFIED_ITEMS
        default: return MAX_GUEST_ITEMS
    }
}

export function useQuoteBasket() {
    const { user, isLoaded } = useUser()
    const [basket, setBasket] = useState<QuoteBasket>({ items: [], updated_at: new Date().toISOString() })
    const [isLoading, setIsLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)

    const userType = getUserTypeFromMetadata(user)
    const maxItems = getMaxItems(userType)
    const isGuest = !user

    // Load basket on mount
    useEffect(() => {
        if (!isLoaded) return

        async function loadBasket() {
            setIsLoading(true)
            try {
                if (isGuest) {
                    // Load from localStorage for guests
                    const stored = localStorage.getItem(GUEST_BASKET_KEY)
                    if (stored) {
                        const parsed = JSON.parse(stored)
                        setBasket(parsed)
                    }
                } else {
                    // Load from Supabase for logged-in users
                    const serverBasket = await getQuoteBasket()
                    if (serverBasket) {
                        setBasket(serverBasket)
                    }
                }
            } catch (error) {
                console.error('Error loading quote basket:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadBasket()
    }, [isLoaded, isGuest, user?.id])

    // Save guest basket to localStorage
    const saveGuestBasket = useCallback((newBasket: QuoteBasket) => {
        localStorage.setItem(GUEST_BASKET_KEY, JSON.stringify(newBasket))
    }, [])

    // Add item to basket
    const addItem = useCallback(async (item: Omit<QuoteBasketItem, 'id'>) => {
        try {
            setIsSyncing(true)

            const newItem: QuoteBasketItem = {
                ...item,
                id: `basket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }

            // Check item limit for guests
            if (isGuest && basket.items.length >= maxItems) {
                // Replace the existing item for guests
                const newBasket: QuoteBasket = {
                    items: [newItem],
                    updated_at: new Date().toISOString()
                }
                setBasket(newBasket)
                saveGuestBasket(newBasket)
                toast.info('Guests can only quote one item at a time. Previous item replaced.')
                return true
            }

            // Check limit for other users
            if (basket.items.length >= maxItems) {
                toast.error(`Maximum ${maxItems} items allowed. Upgrade your account for more.`)
                return false
            }

            // Check if product already exists (update quantity instead)
            const existingIndex = basket.items.findIndex(
                i => i.product_id === item.product_id && i.variant_id === item.variant_id
            )

            let newItems: QuoteBasketItem[]

            if (existingIndex >= 0) {
                // Update existing item quantity
                newItems = [...basket.items]
                newItems[existingIndex] = {
                    ...newItems[existingIndex],
                    quantity: newItems[existingIndex].quantity + (item.quantity || 1)
                }
                toast.success('Item quantity updated in quote basket')
            } else {
                // Add new item
                newItems = [...basket.items, newItem]
                toast.success('Added to quote basket')
            }

            const newBasket: QuoteBasket = {
                items: newItems,
                updated_at: new Date().toISOString()
            }

            setBasket(newBasket)

            if (isGuest) {
                saveGuestBasket(newBasket)
            } else {
                // Sync with server
                await serverAddToBasket(newItem)
            }

            return true
        } catch (error) {
            console.error('Error adding item to quote basket:', error)
            toast.error('Failed to add item to quote basket')
            return false
        } finally {
            setIsSyncing(false)
        }
    }, [basket, isGuest, maxItems, saveGuestBasket])

    // Remove item from basket
    const removeItem = useCallback(async (itemId: string) => {
        try {
            setIsSyncing(true)

            const newItems = basket.items.filter(i => i.id !== itemId)
            const newBasket: QuoteBasket = {
                items: newItems,
                updated_at: new Date().toISOString()
            }

            setBasket(newBasket)

            if (isGuest) {
                saveGuestBasket(newBasket)
            } else {
                await serverRemoveFromBasket(itemId)
            }

            toast.success('Item removed from quote basket')
            return true
        } catch (error) {
            console.error('Error removing item from quote basket:', error)
            toast.error('Failed to remove item')
            return false
        } finally {
            setIsSyncing(false)
        }
    }, [basket, isGuest, saveGuestBasket])

    // Update item quantity
    const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            return removeItem(itemId)
        }

        try {
            setIsSyncing(true)

            const newItems = basket.items.map(i =>
                i.id === itemId ? { ...i, quantity } : i
            )
            const newBasket: QuoteBasket = {
                items: newItems,
                updated_at: new Date().toISOString()
            }

            setBasket(newBasket)

            if (isGuest) {
                saveGuestBasket(newBasket)
            } else {
                await syncQuoteBasket(newBasket)
            }

            return true
        } catch (error) {
            console.error('Error updating quantity:', error)
            toast.error('Failed to update quantity')
            return false
        } finally {
            setIsSyncing(false)
        }
    }, [basket, isGuest, saveGuestBasket, removeItem])

    // Toggle bulk pricing for an item
    const toggleBulkPricing = useCallback(async (itemId: string) => {
        try {
            setIsSyncing(true)

            const newItems = basket.items.map(i =>
                i.id === itemId ? { ...i, bulk_pricing_requested: !i.bulk_pricing_requested } : i
            )
            const newBasket: QuoteBasket = {
                items: newItems,
                updated_at: new Date().toISOString()
            }

            setBasket(newBasket)

            if (!isGuest) {
                await syncQuoteBasket(newBasket)
            } else {
                saveGuestBasket(newBasket)
            }

            return true
        } catch (error) {
            console.error('Error toggling bulk pricing:', error)
            return false
        } finally {
            setIsSyncing(false)
        }
    }, [basket, isGuest, saveGuestBasket])

    // Clear basket
    const clearBasket = useCallback(async () => {
        try {
            setIsSyncing(true)

            const newBasket: QuoteBasket = {
                items: [],
                updated_at: new Date().toISOString()
            }

            setBasket(newBasket)

            if (isGuest) {
                localStorage.removeItem(GUEST_BASKET_KEY)
            } else {
                await serverClearBasket()
            }

            toast.success('Quote basket cleared')
            return true
        } catch (error) {
            console.error('Error clearing basket:', error)
            toast.error('Failed to clear basket')
            return false
        } finally {
            setIsSyncing(false)
        }
    }, [isGuest])

    // Get item count
    const itemCount = basket.items.reduce((sum, item) => sum + item.quantity, 0)

    return {
        basket,
        items: basket.items,
        itemCount,
        isLoading,
        isSyncing,
        userType,
        maxItems,
        isGuest,
        addItem,
        removeItem,
        updateQuantity,
        toggleBulkPricing,
        clearBasket,
        refresh: async () => {
            if (!isGuest) {
                const serverBasket = await getQuoteBasket()
                if (serverBasket) setBasket(serverBasket)
            }
        }
    }
}

