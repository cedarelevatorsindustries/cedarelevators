"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, Search, Package, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types/products"

interface ProductSelectorProps {
  products: Product[]
  selectedProductIds: string[]
  onSelectionChange: (productIds: string[]) => void
  placeholder?: string
  maxHeight?: string
  multiple?: boolean
  disabled?: boolean
}

export function ProductSelector({
  products,
  selectedProductIds,
  onSelectionChange,
  placeholder = "Select products...",
  maxHeight = "400px",
  multiple = true,
  disabled = false
}: ProductSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products
    const query = searchQuery.toLowerCase()
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query)
    )
  }, [products, searchQuery])

  // Get selected products
  const selectedProducts = useMemo(() => {
    return products.filter((p) => selectedProductIds.includes(p.id))
  }, [products, selectedProductIds])

  const handleToggleProduct = (productId: string) => {
    if (multiple) {
      const newSelection = selectedProductIds.includes(productId)
        ? selectedProductIds.filter((id) => id !== productId)
        : [...selectedProductIds, productId]
      onSelectionChange(newSelection)
    } else {
      onSelectionChange([productId])
      setOpen(false)
    }
  }

  const handleRemoveProduct = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelection = selectedProductIds.filter((id) => id !== productId)
    onSelectionChange(newSelection)
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  return (
    <div className="space-y-3">
      {/* Selected Products Display */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {selectedProducts.map((product) => (
            <Badge
              key={product.id}
              variant="secondary"
              className="pl-3 pr-2 py-1.5 bg-white border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700 mr-2">
                {product.name}
              </span>
              <button
                type="button"
                onClick={(e) => handleRemoveProduct(product.id, e)}
                disabled={disabled}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors disabled:opacity-50"
              >
                <X className="h-3 w-3 text-gray-500" />
              </button>
            </Badge>
          ))}
          {multiple && selectedProducts.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled}
              className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Product Selector Dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between h-auto min-h-[40px] py-2 px-3 bg-white hover:bg-gray-50"
          >
            <span className="flex items-center gap-2 text-gray-600">
              <Package className="h-4 w-4" />
              {selectedProducts.length > 0 ? (
                <span className="text-gray-900 font-medium">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
              ) : (
                placeholder
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="flex flex-col">
            {/* Search Input */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-white border-gray-200"
                />
              </div>
            </div>

            {/* Products List */}
            <ScrollArea className="" style={{ maxHeight }}>
              <div className="p-2">
                {filteredProducts.length === 0 ? (
                  <div className="py-8 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">
                      {searchQuery ? "No products found" : "No products available"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredProducts.map((product) => {
                      const isSelected = selectedProductIds.includes(product.id)
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleToggleProduct(product.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                            isSelected
                              ? "bg-orange-50 hover:bg-orange-100 border border-orange-200"
                              : "hover:bg-gray-50 border border-transparent"
                          )}
                        >
                          {/* Checkbox */}
                          <div
                            className={cn(
                              "h-4 w-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                              isSelected
                                ? "bg-orange-600 border-orange-600"
                                : "border-gray-300 bg-white"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>

                          {/* Product Thumbnail */}
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {product.sku || product.slug}
                            </p>
                          </div>

                          {/* Product Status Badge */}
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs capitalize",
                              product.status === "active"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : product.status === "draft"
                                ? "bg-gray-50 text-gray-600 border-gray-200"
                                : "bg-red-50 text-red-600 border-red-200"
                            )}
                          >
                            {product.status}
                          </Badge>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer with count */}
            {filteredProducts.length > 0 && (
              <div className="p-3 border-t bg-gray-50 text-xs text-gray-500 text-center">
                {selectedProducts.length > 0 ? (
                  <span>
                    {selectedProducts.length} of {products.length} products selected
                  </span>
                ) : (
                  <span>Select products from the list above</span>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
