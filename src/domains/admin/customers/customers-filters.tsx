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

  const handleCustomerTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      customer_type: value as any,
    })
  }

  const handleVerificationStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      verification_status: value as any,
    })
  }

  const handleHasOrdersChange = (value: string) => {
    onFiltersChange({
      ...filters,
      has_orders: value === 'all' ? undefined : value === 'yes',
    })
  }

  const handleHasQuotesChange = (value: string) => {
    onFiltersChange({
      ...filters,
      has_quotes: value === 'all' ? undefined : value === 'yes',
    })
  }

  const hasActiveFilters =
    filters.search ||
    (filters.account_type && filters.account_type !== 'all') ||
    (filters.customer_type && filters.customer_type !== 'all') ||
    (filters.verification_status && filters.verification_status !== 'all') ||
    filters.has_orders !== undefined ||
    filters.has_quotes !== undefined

  const clearFilters = () => {
    onFiltersChange({
      account_type: 'all',
      customer_type: 'all',
      verification_status: 'all',
      has_orders: undefined,
      has_quotes: undefined,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
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

        {/* Customer Type Filter */}
        <Select
          value={filters.customer_type || 'all'}
          onValueChange={handleCustomerTypeChange}
        >
          <SelectTrigger data-testid="customer-type-filter">
            <SelectValue placeholder="Customer Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lead">Leads</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
          </SelectContent>
        </Select>

        {/* Verification Status Filter - Only relevant for business */}
        <Select
          value={filters.verification_status || 'all'}
          onValueChange={handleVerificationStatusChange}
        >
          <SelectTrigger data-testid="verification-status-filter">
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="incomplete">Incomplete</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Has Orders Filter */}
        <Select
          value={
            filters.has_orders === undefined
              ? 'all'
              : filters.has_orders
                ? 'yes'
                : 'no'
          }
          onValueChange={handleHasOrdersChange}
        >
          <SelectTrigger data-testid="has-orders-filter">
            <SelectValue placeholder="Has Orders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Has Orders</SelectItem>
            <SelectItem value="no">No Orders</SelectItem>
          </SelectContent>
        </Select>

        {/* Has Quotes Filter */}
        <Select
          value={
            filters.has_quotes === undefined
              ? 'all'
              : filters.has_quotes
                ? 'yes'
                : 'no'
          }
          onValueChange={handleHasQuotesChange}
        >
          <SelectTrigger data-testid="has-quotes-filter">
            <SelectValue placeholder="Has Quotes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Has Quotes</SelectItem>
            <SelectItem value="no">No Quotes</SelectItem>
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
