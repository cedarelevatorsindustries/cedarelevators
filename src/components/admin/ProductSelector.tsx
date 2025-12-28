"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, Search, Package, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useProducts } from "@/hooks/queries/useProducts"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types/products"

interface ProductSelectorProps {
  selectedProductIds: string[]
  onSelectionChange: (productIds: string[]) => void
  maxSelection?: number
  className?: string
  label?: string
  placeholder?: string
  disabled?: boolean
}

export function ProductSelector({
  selectedProductIds,
  onSelectionChange,
  maxSelection,
  className,
  label = "Select Products",
  placeholder = "Search products...",
  disabled = false
}: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  
  const { data, isLoading } = useProducts({ search: searchQuery, status: 'active' })
  const products = data?.products || []

  const selectedProducts = useMemo(() => {
    return products.filter(p => selectedProductIds.includes(p.id))
  }, [products, selectedProductIds])

  const handleToggleProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      onSelectionChange(selectedProductIds.filter(id => id !== productId))
    } else {
      if (maxSelection && selectedProductIds.length >= maxSelection) {
        return
      }
      onSelectionChange([...selectedProductIds, productId])
    }
  }

  const handleRemoveProduct = (productId: string) => {
    onSelectionChange(selectedProductIds.filter(id => id !== productId))
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {maxSelection && (
            <span className="ml-2 text-xs text-gray-500">
              (Max {maxSelection})
            </span>
          )}
        </label>
      )}

      {/* Selected Products Display */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {selectedProducts.map((product) => (
            <Badge
              key={product.id}
              variant="outline"
              className="pl-2 pr-1 py-1 bg-white border-gray-300 hover:border-gray-400 transition-colors"
            >
              <span className="text-sm">{product.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveProduct(product.id)}
                disabled={disabled}
                className="ml-1 rounded-full hover:bg-gray-200 p-0.5 transition-colors disabled:opacity-50"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedProducts.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled}
              className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Product Selector Dropdown */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-white border-gray-300 hover:bg-gray-50",
            !selectedProducts.length && "text-gray-500"
          )}
        >
          <span className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {selectedProducts.length > 0
              ? `${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''} selected`
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Product List */}
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    {searchQuery ? 'No products found' : 'No products available'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {products.map((product) => {
                      const isSelected = selectedProductIds.includes(product.id)
                      const isDisabled = !isSelected && maxSelection && selectedProductIds.length >= maxSelection

                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleToggleProduct(product.id)}
                          disabled={isDisabled || disabled}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                            isSelected
                              ? "bg-orange-50 border border-orange-200"
                              : "hover:bg-gray-50 border border-transparent",
                            isDisabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={isDisabled || disabled}
                            className="pointer-events-none"
                          />
                          
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.sku && <span className="mr-2">SKU: {product.sku}</span>}
                              <span>₹{product.price}</span>
                            </p>
                          </div>

                          {isSelected && (
                            <Check className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <span className="text-xs text-gray-600">
                {selectedProductIds.length} selected
                {maxSelection && ` of ${maxSelection} max`}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-7 text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>

      {maxSelection && selectedProductIds.length >= maxSelection && (
        <p className="text-xs text-orange-600">
          Maximum selection limit reached
        </p>
      )}
    </div>
  )
}
