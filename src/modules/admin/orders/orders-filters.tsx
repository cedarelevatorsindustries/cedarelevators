"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface OrderFilters {
  search: string
  status: string
  paymentStatus: string
  dateFrom: string
  dateTo: string
  customer: string
}

interface OrdersFiltersProps {
  filters: OrderFilters
  onFiltersChange: (filters: OrderFilters) => void
  totalOrders: number
}

export function OrdersFilters({ filters, onFiltersChange, totalOrders }: OrdersFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, search: localSearch })
  }

  const handleClearFilters = () => {
    setLocalSearch('')
    onFiltersChange({
      search: '',
      status: 'all',
      paymentStatus: 'all',
      dateFrom: '',
      dateTo: '',
      customer: ''
    })
  }

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.paymentStatus !== 'all'

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search - Takes most of the space */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by order number, name, or email..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </form>

        {/* Filters grouped on the right */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Filter */}
          <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value })}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Status Filter */}
          <Select value={filters.paymentStatus} onValueChange={(value) => onFiltersChange({ ...filters, paymentStatus: value })}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
              >
                Status: {filters.status}
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
            {filters.paymentStatus && filters.paymentStatus !== 'all' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onFiltersChange({ ...filters, paymentStatus: 'all' })}
              >
                Payment: {filters.paymentStatus}
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
