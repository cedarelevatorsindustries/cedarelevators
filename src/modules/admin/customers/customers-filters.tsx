'use client'

import { useState } from 'react'
import { CustomerFilters } from '@/lib/types/customers'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, Download } from 'lucide-react'

interface CustomersFiltersProps {
  filters: CustomerFilters
  onFiltersChange: (filters: CustomerFilters) => void
  onExport: () => void
  isExporting?: boolean
}

export function CustomersFilters({
  filters,
  onFiltersChange,
  onExport,
  isExporting,
}: CustomersFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, search: localSearch })
  }

  const handleClearFilters = () => {
    setLocalSearch('')
    onFiltersChange({
      status: 'all',
    })
  }

  const hasActiveFilters = filters.search || filters.status !== 'all'

  return (
    <div className="space-y-4" data-testid="customers-filters">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by email or name..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9"
              data-testid="customer-search-input"
            />
          </div>
        </form>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, status: value as any })
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="customer-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Export Button */}
        <Button
          variant="outline"
          onClick={onExport}
          disabled={isExporting}
          data-testid="export-customers-button"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setLocalSearch('')
                  onFiltersChange({ ...filters, search: '' })
                }}
                data-testid="clear-search-filter"
              >
                Search: {filters.search}
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
            {filters.status && filters.status !== 'all' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onFiltersChange({ ...filters, status: 'all' })}
                data-testid="clear-status-filter"
              >
                Status: {filters.status}
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            data-testid="clear-all-filters"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
