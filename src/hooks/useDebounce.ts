import { useEffect, useState } from 'react'

/**
 * Custom hook for debouncing values
 * Useful for search inputs to avoid excessive API calls
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (recommended: 300-500ms for search)
 * @returns The debounced value
 * 
 * @example
 * const [searchInput, setSearchInput] = useState("")
 * const debouncedSearch = useDebounce(searchInput, 400)
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        // Set up a timer to update the debounced value after the delay
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        // Clean up the timer if value changes before delay expires
        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}
