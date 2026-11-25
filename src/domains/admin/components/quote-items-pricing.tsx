'use client'

import Link from 'next/link'
import { QuoteItem } from '@/types/b2b/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Save, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CalculatedQuoteSummary, formatINR } from '@/lib/utils/quote-pricing'

interface TaxConfigSummary {
  gst_enabled: boolean
  default_gst_percentage: number
  store_gstin?: string | null
  store_state?: string | null
  use_cgst_sgst_igst?: boolean
}

interface QuoteItemsPricingProps {
  items: QuoteItem[]
  submittedQuantities?: Record<string, number>
  canEditPricing: boolean
  hasUnsavedChanges: boolean
  isSaving: boolean
  calculatedTotals: CalculatedQuoteSummary
  taxConfig?: TaxConfigSummary
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
  submittedQuantities = {},
  canEditPricing,
  hasUnsavedChanges,
  isSaving,
  calculatedTotals,
  taxConfig,
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
  const taxSettingsMissing = !taxConfig
  const taxRateInvalid = taxEnabled && (!Number.isFinite(taxRate) || taxRate <= 0)
  const itemDiscountSum = calculatedTotals.items.reduce(
    (sum, i) => sum + (Number(i.discount_amount) || 0),
    0
  )

  return (
    <Card className="border-gray-200 shadow-none">
      <CardHeader className="border-b border-gray-100 bg-gray-50/60 py-4 flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-600" />
          <span>Products &amp; Commercial Pricing</span>
        </CardTitle>
        {canEditPricing && hasUnsavedChanges && (
          <Button
            onClick={onSavePricing}
            disabled={isSaving}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <Save className="w-4 h-4 mr-1.5" />
            )}
            Save Draft Pricing
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        {items.length > 0 ? (
          <>
            {/* Desktop Line Items Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-3 py-2.5 font-medium">Product Snapshot</th>
                    <th className="text-center px-3 py-2.5 font-medium">Quantity</th>
                    <th className="text-right px-3 py-2.5 font-medium">Unit Price (₹)</th>
                    <th className="text-right px-3 py-2.5 font-medium">Discount (%)</th>
                    <th className="text-right px-3 py-2.5 font-medium">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, idx) => {
                    const calc = calculatedTotals.items[idx]
                    const origQty = submittedQuantities[item.id] ?? item.quantity
                    const qtyModified = origQty !== item.quantity
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
                                className="w-10 h-10 rounded-md border border-gray-200 object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900">{item.product_name}</p>
                              {item.variant_title && (
                                <p className="text-xs text-gray-600 mt-0.5">
                                  Variant: {item.variant_title}
                                </p>
                              )}
                              {(item.variant_sku || item.product_sku) && (
                                <p className="text-xs font-mono text-gray-500 mt-0.5">
                                  SKU: {item.variant_sku || item.product_sku}
                                </p>
                              )}
                              {specsEntries.length > 0 && (
                                <p className="text-[11px] text-gray-500 mt-1">
                                  {specsEntries.map(([k, v]) => `${k}: ${String(v)}`).join(' · ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3.5 text-center">
                          {canEditPricing ? (
                            <div className="inline-flex flex-col items-center">
                              <input
                                type="number"
                                min={1}
                                max={10000}
                                value={item.quantity}
                                onChange={(e) =>
                                  onItemChange(
                                    item.id,
                                    'quantity',
                                    Math.min(10000, Math.max(1, Number(e.target.value) || 1))
                                  )
                                }
                                className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded-md text-sm tabular-nums bg-white"
                              />
                              {qtyModified && (
                                <span className="text-[11px] text-amber-700 mt-1 whitespace-nowrap">
                                  Submitted: {origQty}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span className="font-medium tabular-nums">{item.quantity}</span>
                              {qtyModified && (
                                <span className="text-[11px] text-gray-500 mt-0.5">
                                  Submitted: {origQty}
                                </span>
                              )}
                            </div>
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
                                onItemChange(
                                  item.id,
                                  'unit_price',
                                  Math.max(0, Number(e.target.value) || 0)
                                )
                              }
                              className="w-28 px-2.5 py-1.5 text-right border border-gray-300 focus:border-orange-500 rounded-md focus:ring-2 focus:ring-orange-500/20 text-sm tabular-nums bg-white outline-none"
                              placeholder="0.00"
                            />
                          ) : (
                            <span className="font-medium text-gray-900 tabular-nums">
                              {item.unit_price ? formatINR(item.unit_price) : 'Not priced'}
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
                              className="w-20 px-2 py-1.5 text-right border border-gray-300 rounded-md text-sm tabular-nums bg-white"
                            />
                          ) : (
                            <span className="tabular-nums">{item.discount_percentage || 0}%</span>
                          )}
                        </td>

                        <td className="px-3 py-3.5 text-right font-medium text-gray-900 tabular-nums whitespace-nowrap">
                          {calc && calc.net_amount > 0 ? formatINR(calc.net_amount) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Pricing Cards */}
            <div className="md:hidden space-y-3">
              {items.map((item, idx) => {
                const calc = calculatedTotals.items[idx]
                const origQty = submittedQuantities[item.id] ?? item.quantity
                const qtyModified = origQty !== item.quantity

                return (
                  <div key={item.id} className="rounded-lg border border-gray-200 p-3.5 space-y-3">
                    <div className="flex items-start gap-3">
                      {item.product_thumbnail ? (
                        <img
                          src={item.product_thumbnail}
                          alt={item.product_name}
                          className="w-10 h-10 rounded-md border border-gray-200 object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                        {item.variant_title && (
                          <p className="text-xs text-gray-600">{item.variant_title}</p>
                        )}
                        {(item.variant_sku || item.product_sku) && (
                          <p className="text-xs font-mono text-gray-500">
                            SKU: {item.variant_sku || item.product_sku}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="block text-gray-500 mb-1">Qty</label>
                        {canEditPricing ? (
                          <input
                            type="number"
                            min={1}
                            max={10000}
                            value={item.quantity}
                            onChange={(e) =>
                              onItemChange(
                                item.id,
                                'quantity',
                                Math.min(10000, Math.max(1, Number(e.target.value) || 1))
                              )
                            }
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm tabular-nums"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{item.quantity}</p>
                        )}
                        {qtyModified && (
                          <p className="text-[11px] text-amber-700 mt-0.5">Sub: {origQty}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-500 mb-1">Unit (₹)</label>
                        {canEditPricing ? (
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.unit_price ?? ''}
                            onChange={(e) =>
                              onItemChange(
                                item.id,
                                'unit_price',
                                Math.max(0, Number(e.target.value) || 0)
                              )
                            }
                            placeholder="0.00"
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm tabular-nums"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">
                            {item.unit_price ? formatINR(item.unit_price) : '—'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-500 mb-1">Disc (%)</label>
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
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm tabular-nums"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{item.discount_percentage || 0}%</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                      <span className="text-gray-500">Line Total</span>
                      <span className="font-semibold text-gray-900 tabular-nums">
                        {calc && calc.net_amount > 0 ? formatINR(calc.net_amount) : '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                General Project Enquiry (0 Catalog Line Items)
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Enter a quoted commercial package or engineering consultation amount before issuing.
              </p>
            </div>
            <div className="max-w-xs">
              <label className="block text-xs text-gray-600 mb-1">
                Quoted Amount (₹ Excl. GST)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                disabled={!canEditPricing}
                value={customGeneralAmount || ''}
                onChange={(e) =>
                  onCustomGeneralAmountChange(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white tabular-nums"
                placeholder="Enter quoted amount"
              />
            </div>
          </div>
        )}

        {/* Commercial Configuration & Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-gray-200">
          {/* Left: Overall Discount, Tax Config & Terms */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider">
                Overall Quotation Discount
              </label>
              <div className="flex gap-2">
                <select
                  value={overallDiscountType}
                  disabled={!canEditPricing}
                  onChange={(e) =>
                    onOverallDiscountChange(
                      e.target.value as 'fixed' | 'percentage',
                      overallDiscountValue
                    )
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
                    onOverallDiscountChange(
                      overallDiscountType,
                      Math.max(0, Number(e.target.value) || 0)
                    )
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white tabular-nums"
                />
              </div>
            </div>

            {/* Configuration-Driven Tax Panel */}
            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
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
                      value={taxRate || ''}
                      placeholder="0"
                      onChange={(e) =>
                        onTaxRateChange(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                      }
                      className="w-20 px-2 py-1 text-right border border-gray-300 rounded text-sm bg-white tabular-nums"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                )}
              </div>

              {taxSettingsMissing ? (
                <p className="text-xs text-amber-800 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    Verified Tax Settings are not configured. Configure GST rate and GSTIN in{' '}
                    <Link href="/admin/settings/tax" className="underline">
                      Tax Settings
                    </Link>
                    .
                  </span>
                </p>
              ) : (
                <p className="text-[11px] text-gray-500">
                  Store GST default: {taxConfig.default_gst_percentage}%
                  {taxConfig.store_state ? ` · State: ${taxConfig.store_state}` : ''}
                  {taxConfig.use_cgst_sgst_igst ? ' · CGST/SGST/IGST enabled' : ''}
                </p>
              )}

              {taxRateInvalid && (
                <p className="text-xs text-red-700">
                  Enter a valid GST rate (&gt; 0%) when GST is enabled.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-1.5">
                Terms &amp; Conditions (Shown on PDF)
              </label>
              <textarea
                rows={4}
                disabled={!canEditPricing}
                value={termsAndConditions}
                onChange={(e) => onTermsChange(e.target.value)}
                placeholder="e.g. Delivery timeline, warranty terms, freight charges extra at actuals."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y bg-white"
              />
            </div>
          </div>

          {/* Right: Financial Summary */}
          <div className="bg-gray-50/80 rounded-xl border border-gray-200 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5 text-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Financial Summary
              </p>

              <div className="flex justify-between">
                <span className="text-gray-600">Gross Subtotal</span>
                <span className="font-medium text-gray-900 tabular-nums">
                  {formatINR(calculatedTotals.subtotal)}
                </span>
              </div>

              {itemDiscountSum > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Item Discounts</span>
                  <span className="font-medium tabular-nums">- {formatINR(itemDiscountSum)}</span>
                </div>
              )}

              {calculatedTotals.discount_total - itemDiscountSum > 0.009 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Overall Discount</span>
                  <span className="font-medium tabular-nums">
                    - {formatINR(calculatedTotals.discount_total - itemDiscountSum)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Taxable Amount</span>
                <span className="font-medium text-gray-900 tabular-nums">
                  {formatINR(calculatedTotals.taxable_amount)}
                </span>
              </div>

              {taxEnabled && (
                <div className="flex justify-between">
                  <span className="text-gray-600">GST ({calculatedTotals.tax_rate}%)</span>
                  <span className="font-medium text-gray-900 tabular-nums">
                    {formatINR(calculatedTotals.tax_total)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-300 flex justify-between items-baseline">
                <span className="font-semibold text-base text-gray-900">Grand Total (INR)</span>
                <span className="font-semibold text-xl text-orange-600 tabular-nums">
                  {formatINR(calculatedTotals.grand_total)}
                </span>
              </div>
            </div>

            {canEditPricing && (
              <Button
                onClick={onSavePricing}
                disabled={isSaving || !hasUnsavedChanges}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {hasUnsavedChanges ? 'Save Draft Pricing' : 'All Changes Saved'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
