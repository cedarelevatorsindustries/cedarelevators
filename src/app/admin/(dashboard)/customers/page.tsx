'use client'

import { useState } from 'react'
import { CustomerFilters } from '@/lib/types/customers'
import { CustomersTable } from '@/domains/admin/customers/customers-table'
import { CustomersFilters } from '@/domains/admin/customers/customers-filters'
import { CustomersStats } from '@/domains/admin/customers/customers-stats'
import { CustomersEmptyState } from '@/components/common/empty-states'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCustomers, useCustomerStats } from '@/hooks/queries/useCustomers'
import { useExportCustomers } from '@/hooks/mutations/useCustomerMutations'

export default function CustomersPage() {
  const [filters, setFilters] = useState<CustomerFilters>({
    status: 'all',
  })
  const [page, setPage] = useState(1)
  const limit = 20

  // React Query hooks
  const {
    data,
    isLoading: isLoadingCustomers,
    error: customersError,
    refetch: refetchCustomers
  } = useCustomers(filters, page, limit)

  const customers = data?.customers || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useCustomerStats()

  const exportMutation = useExportCustomers()

  const handleExport = async () => {
    try {
      const { exportCustomersAction } = await import('@/lib/actions/customers')
      const result = await exportCustomersAction(filters)
      if (result.success && result.data) {
        const csv = convertToCSV(result.data)
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Customers exported successfully')
      } else {
        toast.error(result.error || 'Failed to export customers')
      }
    } catch (error) {
      console.error('Error exporting customers:', error)
      toast.error('Failed to export customers')
    }
  }

  // Helper function to convert export data to CSV string
  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in values
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      ),
    ]

    return csvRows.join('\n')
  }

  const handleRefresh = async () => {
    await Promise.all([refetchCustomers(), refetchStats()])
    toast.success('Data refreshed')
  }

  const handleFiltersChange = (newFilters: CustomerFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const hasCustomers = customers.length > 0

  return (
    <div className="space-y-8" data-testid="customers-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Customers
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Manage customer accounts and view purchase history
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoadingCustomers || isLoadingStats}
          data-testid="refresh-customers-button"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${(isLoadingCustomers || isLoadingStats) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoadingCustomers ? (
        <div className="space-y-6">
          <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      ) : hasCustomers ? (
        <>
          {/* Stats Cards */}
          <CustomersStats stats={stats || undefined} isLoading={isLoadingStats} />

          {/* Filters */}
          <CustomersFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onExport={handleExport}
            isExporting={exportMutation.isPending}
          />

          {/* Customers Table */}
          <CustomersTable customers={customers} isLoading={isLoadingCustomers} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                <span className="font-medium">{total}</span> customers
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <CustomersEmptyState />
      )}
    </div>
  )
}

