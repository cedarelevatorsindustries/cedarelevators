'use client'

import { useState } from 'react'
import { useBusinessProfiles } from '@/hooks/queries/useBusinessVerification'
import { VerificationTable } from '@/domains/admin/business-verification/verification-table'
import { VerificationFilters } from '@/domains/admin/business-verification/verification-filters'
import { VerificationStats } from '@/domains/admin/business-verification/verification-stats'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function BusinessVerificationPage() {
  const [filters, setFilters] = useState<{
    status?: string
    search?: string
  }>({
    status: 'pending',
  })

  const {
    data: profiles = [],
    isLoading,
    error,
    refetch,
  } = useBusinessProfiles(filters)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" data-testid="page-title">
            Business Verification
          </h2>
          <p className="text-muted-foreground">
            Review and verify business account applications
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          data-testid="refresh-button"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-800">
            Error loading business profiles: {error.message}
          </p>
        </div>
      )}

      <VerificationStats profiles={profiles} />

      <div className="space-y-4">
        <VerificationFilters filters={filters} onFilterChange={setFilters} />
        <VerificationTable profiles={profiles} isLoading={isLoading} />
      </div>
    </div>
  )
}
