"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"
import { InventoryFilters as InventoryFiltersType } from "@/lib/types/inventory"

interface InventoryFiltersProps {
  filters: InventoryFiltersType
  onFiltersChange: (filters: InventoryFiltersType) => void
}

export function InventoryFilters({ filters, onFiltersChange }: InventoryFiltersProps) {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search })
  }

  const handleStockStatusChange = (stockStatus: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock') => {
    onFiltersChange({ ...filters, stockStatus })
  }

  const clearFilters = () => {
    onFiltersChange({ stockStatus: 'all' })
  }

  const hasActiveFilters = filters.search || filters.stockStatus !== 'all'

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
          <div className="space-y-2 min-w-0">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          <div className="space-y-2 min-w-0">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock Status</label>
            <Select value={filters.stockStatus || 'all'} onValueChange={handleStockStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 min-w-0 flex items-end">
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}