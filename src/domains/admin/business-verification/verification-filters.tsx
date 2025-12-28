'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface VerificationFiltersProps {
  filters: {
    status?: string
    search?: string
  }
  onFilterChange: (filters: { status?: string; search?: string }) => void
}

export function VerificationFilters({ filters, onFilterChange }: VerificationFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by company name or GST number..."
          value={filters.search || ''}
          onChange={(e) =>
            onFilterChange({ ...filters, search: e.target.value })
          }
          data-testid="verification-search-input"
        />
      </div>
      <div className="w-full sm:w-48">
        <Label htmlFor="status">Status</Label>
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onFilterChange({ ...filters, status: value })
          }
        >
          <SelectTrigger id="status" data-testid="verification-status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
