'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Search, X } from 'lucide-react'
import { CustomerFilters } from '@/types/b2b/customer'

interface CustomersFiltersProps {
  filters: CustomerFilters
  onFiltersChange: (filters: CustomerFilters) => void
  onExport: () => void
  isExporting: boolean
}

export function CustomersFilters({
  filters,
  onFiltersChange,
  onExport,
  isExporting,
}: CustomersFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleAccountTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      account_type: value as any,
    })
  }

  const handleVerificationStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      verification_status: value as any,
    })
  }

  const handleDateRangeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      date_range: value as any,
    })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value as any,
    })
  }

  const hasActiveFilters =
    filters.search ||
    (filters.account_type && filters.account_type !== 'all') ||
    (filters.verification_status && filters.verification_status !== 'all') ||
    (filters.date_range && filters.date_range !== 'all') ||
    (filters.status && filters.status !== 'all')

  const clearFilters = () => {
    onFiltersChange({
      account_type: 'all',
      verification_status: 'all',
      date_range: 'all',
      search: '',
      status: 'all',
    })
  }

  return (
    <div className="space-y-4" data-testid="customers-filters">
      {/* Search and Export */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by email, name, or company..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            data-testid="search-input"
          />
        </div>
        <Button
          variant="outline"
          onClick={onExport}
          disabled={isExporting}
          data-testid="export-button"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Account Type Filter */}
        <Select
          value={filters.account_type || 'all'}
          onValueChange={handleAccountTypeChange}
        >
          <SelectTrigger data-testid="account-type-filter">
            <SelectValue placeholder="Account Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>

        {/* Verification Status Filter */}
        <Select
          value={filters.verification_status || 'all'}
          onValueChange={handleVerificationStatusChange}
        >
          <SelectTrigger data-testid="verification-status-filter">
            <SelectValue placeholder="Verification Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Select
          value={filters.date_range || 'all'}
          onValueChange={handleDateRangeChange}
        >
          <SelectTrigger data-testid="date-range-filter">
            <SelectValue placeholder="Registration Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="last_7_days">Last 7 Days</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            <SelectItem value="last_90_days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger data-testid="status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="w-full"
            data-testid="clear-filters-button"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}
