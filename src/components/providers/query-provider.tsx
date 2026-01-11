'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

/**
 * React Query Provider Component
 * Provides QueryClient to all child components
 * 
 * Optimized settings:
 * - staleTime: 2 minutes (reduces refetching)
 * - gcTime: 10 minutes (keeps data in cache longer)
 * - refetchOnMount: false (uses cache if fresh)
 * - refetchOnWindowFocus: false (prevents unnecessary refetches)
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 2,      // 2 minutes - data stays fresh longer
                        gcTime: 1000 * 60 * 10,        // 10 minutes - garbage collection
                        refetchOnWindowFocus: false,   // Don't refetch on tab focus
                        refetchOnMount: false,         // Don't refetch if data is fresh
                        retry: 1,                      // Retry failed requests once
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

