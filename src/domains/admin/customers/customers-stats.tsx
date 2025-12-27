'use client'

/**
 * Customers Stats Component
 */

export function CustomersStats({ stats, isLoading }: any) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600">Total Customers</div>
                <div className="text-2xl font-bold">0</div>
            </div>
        </div>
    )
}
