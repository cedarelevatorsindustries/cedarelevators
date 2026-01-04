"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { IndianRupee, Package, AlertCircle, CheckCircle2 } from "lucide-react"

interface PricingInventoryData {
  // Pricing
  price: string
  comparePrice: string
  cost: string
  taxable: boolean
  bulkPricingAvailable: boolean
  bulkPricingNote: string

  // Inventory
  trackInventory: boolean
  stockQuantity: string
  lowStockThreshold: string
  allowBackorders: boolean
}

interface PricingInventoryTabProps {
  formData: PricingInventoryData
  onFormDataChange: (updates: Partial<PricingInventoryData>) => void
  hasVariants: boolean
}

export function PricingInventoryTab({ formData, onFormDataChange, hasVariants }: PricingInventoryTabProps) {
  const calculateDiscount = () => {
    const price = parseFloat(formData.price) || 0
    const comparePrice = parseFloat(formData.comparePrice) || 0

    if (price > 0 && comparePrice > price) {
      const discount = ((comparePrice - price) / comparePrice) * 100
      return Math.round(discount)
    }
    return 0
  }

  const calculateMargin = () => {
    const price = parseFloat(formData.price) || 0
    const cost = parseFloat(formData.cost) || 0

    if (price > 0 && cost > 0 && price > cost) {
      const margin = ((price - cost) / price) * 100
      return Math.round(margin)
    }
    return 0
  }

  const discount = calculateDiscount()
  const margin = calculateMargin()
  const hasPrice = parseFloat(formData.price) > 0

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-1">Step 6: Pricing & Inventory</h3>
        <p className="text-sm text-blue-700">Set pricing and stock management for fulfillment</p>
      </div>

      {/* Important Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Pricing Reference Only</h4>
            <p className="text-sm text-yellow-700">
              💡 Pricing here is for internal reference and catalog display.
              Final selling prices are determined through the Quote system.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Product Pricing
            {hasPrice && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </CardTitle>
          <CardDescription className="text-gray-500">
            Base pricing for catalog display and internal costing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasVariants && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                ⚠️ <strong>Variants detected:</strong> Pricing can be overridden per variant in the Variants tab.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 w-full">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="price" className="flex items-center gap-2">
                Base Price (₹) <span className="text-red-500">*</span>
                {hasPrice && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.price}
                onChange={(e) => onFormDataChange({ price: e.target.value })}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Display price in catalog</p>
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="comparePrice">Compare at Price (MRP) (₹)</Label>
              <Input
                id="comparePrice"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.comparePrice}
                onChange={(e) => onFormDataChange({ comparePrice: e.target.value })}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Original price (for discounts)</p>
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="cost">Cost per Item (₹)</Label>
              <Input
                id="cost"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.cost}
                onChange={(e) => onFormDataChange({ cost: e.target.value })}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Internal cost (for margins)</p>
            </div>
          </div>

          {/* Price Analysis */}
          {(discount > 0 || margin > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {discount > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-900">Customer Saves</p>
                      <p className="text-xs text-green-700">
                        ₹{formData.price} vs MRP ₹{formData.comparePrice}
                      </p>
                    </div>
                    <Badge className="bg-green-600 text-white">{discount}% OFF</Badge>
                  </div>
                </div>
              )}

              {margin > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Gross Margin</p>
                      <p className="text-xs text-blue-700">
                        ₹{formData.price} - ₹{formData.cost} cost
                      </p>
                    </div>
                    <Badge variant="secondary">{margin}%</Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="taxable"
              checked={formData.taxable}
              onCheckedChange={(checked) => onFormDataChange({ taxable: !!checked })}
            />
            <Label htmlFor="taxable" className="cursor-pointer">Charge tax on this product</Label>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Pricing */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Bulk Pricing</CardTitle>
          <CardDescription className="text-gray-500">
            Enable volume-based pricing for large orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bulkPricing"
              checked={formData.bulkPricingAvailable}
              onCheckedChange={(checked) => onFormDataChange({ bulkPricingAvailable: !!checked })}
            />
            <Label htmlFor="bulkPricing" className="cursor-pointer">Bulk pricing available</Label>
          </div>

          {formData.bulkPricingAvailable && (
            <div className="space-y-2">
              <Label htmlFor="bulkNote">Bulk Pricing Note</Label>
              <Textarea
                id="bulkNote"
                placeholder="e.g., Contact for bulk orders of 50+ units. Special rates available for contractors."
                value={formData.bulkPricingNote}
                onChange={(e) => onFormDataChange({ bulkPricingNote: e.target.value })}
                rows={3}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Displayed on product page for bulk inquiries</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Section */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Management
          </CardTitle>
          <CardDescription className="text-gray-500">
            Stock tracking and fulfillment settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasVariants && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                ⚠️ <strong>Variants detected:</strong> Stock can be managed per variant in the Variants tab.
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="trackInventory"
              checked={formData.trackInventory}
              onCheckedChange={(checked) => onFormDataChange({ trackInventory: !!checked })}
            />
            <Label htmlFor="trackInventory" className="cursor-pointer">Track inventory for this product</Label>
          </div>

          {formData.trackInventory && (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 w-full">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => onFormDataChange({ stockQuantity: e.target.value })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Available units in stock</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lowStock">Low Stock Threshold</Label>
                <Input
                  id="lowStock"
                  type="number"
                  placeholder="5"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) => onFormDataChange({ lowStockThreshold: e.target.value })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Alert when stock falls below</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="backorders"
              checked={formData.allowBackorders}
              onCheckedChange={(checked) => onFormDataChange({ allowBackorders: !!checked })}
            />
            <Label htmlFor="backorders" className="cursor-pointer">
              Allow backorders (sell when out of stock)
            </Label>
          </div>

          {formData.allowBackorders && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                ℹ️ Customers can place orders even when stock is 0. Product will show as "Available for backorder".
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
