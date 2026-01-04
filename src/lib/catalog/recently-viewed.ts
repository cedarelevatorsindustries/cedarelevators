"use client"

const STORAGE_KEY = "recentlyViewed"
const MAX_ITEMS = 20

/**
 * Add a product to recently viewed list
 */
export function addToRecentlyViewed(productId: string): void {
  if (typeof window === "undefined") return

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    let items: string[] = stored ? JSON.parse(stored) : []

    // Remove if already exists
    items = items.filter((id) => id !== productId)

    // Add to beginning
    items.unshift(productId)

    // Keep only MAX_ITEMS
    items = items.slice(0, MAX_ITEMS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error("Failed to update recently viewed:", error)
  }
}

/**
 * Get recently viewed product IDs
 */
export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Failed to get recently viewed:", error)
    return []
  }
}

/**
 * Clear recently viewed list
 */
export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear recently viewed:", error)
  }
}

