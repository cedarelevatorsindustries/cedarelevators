'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { SearchSuggestion } from '@/lib/actions/search'

interface UseSearchOptions {
    debounceMs?: number
    minChars?: number
}

export function useSearch(options: UseSearchOptions = {}) {
    const { debounceMs = 300, minChars = 2 } = options

    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    const fetchSuggestions = useCallback(async (searchQuery: string) => {
        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        if (searchQuery.length < minChars) {
            setSuggestions([])
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        abortControllerRef.current = new AbortController()

        try {
            const response = await fetch(
                `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`,
                { signal: abortControllerRef.current.signal }
            )

            if (!response.ok) {
                throw new Error('Failed to fetch suggestions')
            }

            const data = await response.json()
            setSuggestions(data.suggestions || [])
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err.message)
                setSuggestions([])
            }
        } finally {
            setIsLoading(false)
        }
    }, [minChars])

    const handleQueryChange = useCallback((newQuery: string) => {
        setQuery(newQuery)

        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        // Set new debounced fetch
        debounceTimerRef.current = setTimeout(() => {
            fetchSuggestions(newQuery)
        }, debounceMs)
    }, [debounceMs, fetchSuggestions])

    const clearSuggestions = useCallback(() => {
        setSuggestions([])
    }, [])

    const clearQuery = useCallback(() => {
        setQuery('')
        setSuggestions([])
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    return {
        query,
        setQuery: handleQueryChange,
        suggestions,
        isLoading,
        error,
        clearSuggestions,
        clearQuery
    }
}
