'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WishlistItem {
  id: string
  variant_id: string
  quantity: number
  notes?: string
}

interface WishlistList {
  id: string
  name: string
  items: WishlistItem[]
}

interface WishlistContextType {
  lists: WishlistList[]
  activeList: WishlistList | null
  isLoading: boolean
  itemCount: number
  addAllToCart: (listId: string) => Promise<void>
  requestQuote: (listId: string) => Promise<void>
  clearList: (listId: string) => Promise<void>
  shareList: (listId: string, permissions: string[], accessLevel: string) => Promise<string>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<WishlistList[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch wishlist data
    setIsLoading(false)
  }, [])

  const activeList = lists[0] || null
  const itemCount = activeList?.items.length || 0

  const addAllToCart = async (listId: string) => {
    // TODO: Implement add all to cart
    console.log('Adding all items to cart:', listId)
  }

  const requestQuote = async (listId: string) => {
    // TODO: Implement request quote
    console.log('Requesting quote for list:', listId)
  }

  const clearList = async (listId: string) => {
    // TODO: Implement clear list
    setLists(lists.filter(list => list.id !== listId))
  }

  const shareList = async (listId: string, permissions: string[], accessLevel: string) => {
    // TODO: Implement share list
    return `share-token-${listId}`
  }

  return (
    <WishlistContext.Provider
      value={{
        lists,
        activeList,
        isLoading,
        itemCount,
        addAllToCart,
        requestQuote,
        clearList,
        shareList,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlistContext() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlistContext must be used within a WishlistProvider')
  }
  return context
}

