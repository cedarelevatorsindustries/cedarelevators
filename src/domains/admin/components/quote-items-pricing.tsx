'use client'

import { QuoteItem } from '@/types/b2b/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CalculatedQuoteSummary, formatINR } from '@/lib/utils/quote-pricing'

interface QuoteItemsPricingProps {
  items: QuoteItem[]
  canEditPricing: boolean
  hasUnsavedChanges: boolean
  isSaving: boolean
  calculatedTotals: CalculatedQuoteSummary
  taxEnabled: boolean
  taxRate: number
  overallDiscountType: 'fixed' | 'percentage'
  overallDiscountValue: number
  customGeneralAmount: number
  termsAndConditions: string
  onTaxToggle: (enabled: boolean) => void
  onTaxRateChange: (rate: number) => void
  onOverallDiscountChange: (type: 'fixed' | 'percentage', value: number) => void
  onCustomGeneralAmountChange: (amount: number) => void
  onTermsChange: (terms: string) => void
  onItemChange: (
    itemId: string,
    field: 'unit_price' | 'discount_percentage' | 'quantity',
    value: number
  ) => void
  onSavePricing: () => void
}

export function QuoteItemsPricing({
  items,
  canEditPricing,
  hasUnsavedChanges,
  isSaving,
  calculatedTotals,
  taxEnabled,
  taxRate,
  overallDiscountType,
  overallDiscountValue,
  customGeneralAmount,
  termsAndConditions,
  onTaxToggle,
  onTaxRateChange,
  onOverallDiscountChange,
  onCustomGeneralAmountChange,
  onTermsChange,
  onItemChange,
  onSavePricing,
}: QuoteItemsPricingProps) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50/50 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-600" />
          Line Items &amp; Commercial Pricing
        </CardTitle>
        {canEditPricing && hasUnsavedChanges && (
          <Button
            onClick={onSavePricing}
            disabled={isSaving}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
            Save Draft Pricing
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Product Snapshot
                  </th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Qty
                  </th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Unit Price (₹)
                  </th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Disc (%)
                  </th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Line Total (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => {
                  const calc = calculatedTotals.items[idx]
                  const specsEntries =
                    item.specifications && typeof item.specifications === 'object'
                      ? Object.entries(item.specifications).slice(0, 3)
                      : []

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 align-top">
                      <td className="px-3 py-3.5">
                        <div className="flex items-start gap-3">
                          {item.product_thumbnail ? (
                            <img
                              src={item.product_thumbnail}
                              alt={item.product_name}
                              className="w-10 h-10 rounded border border-gray-200 object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">{item.product_name}</p>
                            {item.variant_title && (
                              <p className="text-xs text-gray-700 mt-0.5">Variant: {item.variant_title}</p>
                            )}
                            {(item.variant_sku || item.product_sku) && (
                              <p className="text-xs font-mono text-gray-500 mt-0.5">
                                SKU: {item.variant_sku || item.product_sku}
                              </p>
                            )}
                            {specsEntries.length > 0 && (
                              <p className="text-[11px] text-gray-500 mt-1">
                                {specsEntries.map(([k, v]) => `${k}: ${String(v)}`).join(' • ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 text-center">
                        {canEditPricing ? (
                          <input
                            type="number"
                            min={1}
                            max={10000}
                            value={item.quantity}
                            onChange={(e) =>
                              onItemChange(item.id, 'quantity', Math.max(1, Number(e.target.value) || 1))
                            }
                            className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded-md text-sm"
                          />
                        ) : (
                          <span className="font-semibold">{item.quantity}</span>
                        )}
                      </td>

                      <td className="px-3 py-3.5 text-right">
                        {canEditPricing ? (
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.unit_price ?? ''}
                            onChange={(e) =>
                              onItemChange(item.id, 'unit_price', Math.max(0, Number(e.target.value) || 0))
                            }
                            className="w-28 px-2.5 py-1.5 text-right border border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 font-medium text-sm"
                            placeholder="0.00"
                          />
                        ) : (
                          <span className="font-semibold text-gray-900">
                            {item.unit_price ? formatINR(item.unit_price) : 'Not set'}
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3.5 text-right">
                        {canEditPricing ? (
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step="0.5"
                            value={item.discount_percentage ?? 0}
                            onChange={(e) =>
                              onItemChange(
                                item.id,
                                'discount_percentage',
                                Math.min(100, Math.max(0, Number(e.target.value) || 0))
                              )
                            }
                            className="w-20 px-2 py-1.5 text-right border border-gray-300 rounded-md text-sm"
                          />
                        ) : (
                          <span>{item.discount_percentage || 0}%</span>
                        )}
                      </td>

                      <td className="px-3 py-3.5 text-right font-bold text-gray-900">
                        {calc && calc.net_amount > 0 ? formatINR(calc.net_amount) : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
            <p className="text-sm font-medium text-gray-900">
              General Project Enquiry (0 Catalog Line Items)
            </p>
            <p className="text-xs text-gray-600">
              Enter a custom commercial package or consultation quotation amount before issuing the PDF.
            </p>
            <div className="max-w-xs">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Quoted Amount (₹ Excl. GST)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                disabled={!canEditPricing}
                value={customGeneralAmount || ''}
                onChange={(e) => onCustomGeneralAmountChange(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm font-medium bg-white"
                placeholder="Enter quoted amount"
              />
            </div>
          </div>
        )}

        {/* Commercial Configuration & Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
          {/* Left: Overall Discount, Tax & Terms */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-gray-600">
                Overall Quote Discount
              </label>
              <div className="flex gap-2">
                <select
                  value={overallDiscountType}
                  disabled={!canEditPricing}
                  onChange={(e) =>
                    onOverallDiscountChange(e.target.value as 'fixed' | 'percentage', overallDiscountValue)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="fixed">Fixed (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  disabled={!canEditPricing}
                  value={overallDiscountValue || 0}
                  onChange={(e) =>
                    onOverallDiscountChange(overallDiscountType, Math.max(0, Number(e.target.value) || 0))
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                />
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="gst-toggle"
                    checked={taxEnabled}
                    onCheckedChange={onTaxToggle}
                    disabled={!canEditPricing}
                  />
                  <Label htmlFor="gst-toggle" className="text-sm font-medium text-gray-800">
                    Apply GST
                  </Label>
                </div>
                {taxEnabled && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.5"
                      disabled={!canEditPricing}
                      value={taxRate}
                      onChange={(e) => onTaxRateChange(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                      className="w-20 px-2 py-1 text-right border border-gray-300 rounded text-sm bg-white"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                Terms &amp; Conditions (Shown on PDF)
              </label>
              <textarea
                rows={4}
                disabled={!canEditPricing}
                value={termsAndConditions}
                onChange={(e) => onTermsChange(e.target.value)}
                placeholder="e.g. Delivery within 7 working days. Freight / door delivery extra at actuals."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none bg-white"
              />
            </div>
          </div>

          {/* Right: Financial Totals */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Gross Subtotal</span>
                <span className="font-semibold text-gray-900">{formatINR(calculatedTotals.subtotal)}</span>
              </div>
              {calculatedTotals.discount_total > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Total Discount</span>
                  <span className="font-semibold">- {formatINR(calculatedTotals.discount_total)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Taxable Amount</span>
                <span className="font-semibold text-gray-900">{formatINR(calculatedTotals.taxable_amount)}</span>
              </div>
              {taxEnabled && (
                <div className="flex justify-between">
                  <span className="text-gray-600">GST ({calculatedTotals.tax_rate}%)</span>
                  <span className="font-semibold text-gray-900">{formatINR(calculatedTotals.tax_total)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
                <span className="font-bold text-base text-gray-900">Grand Total (INR)</span>
                <span className="font-bold text-2xl text-orange-600">{formatINR(calculatedTotals.grand_total)}</span>
              </div>
            </div>

            {canEditPricing && (
              <Button
                onClick={onSavePricing}
                disabled={isSaving || !hasUnsavedChanges}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {hasUnsavedChanges ? 'Save Pricing & Draft Changes' : 'Pricing Saved'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
