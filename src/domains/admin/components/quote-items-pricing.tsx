'use client'

import { QuoteItem } from '@/types/b2b/quote'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Save, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface QuoteItemsPricingProps {
    items: QuoteItem[]
    canEditPricing: boolean
    hasUnsavedChanges: boolean
    isSaving: boolean
    isPending: boolean
    calculatedTotals: {
        subtotal: number
        discount: number
        tax: number
        total: number
    }
    taxEnabled: boolean
    onTaxToggle: (enabled: boolean) => void
    onItemPriceChange: (itemId: string, field: 'unit_price' | 'discount_percentage', value: number) => void
    onSavePricing: () => void
    onStartReview: () => void
}

export function QuoteItemsPricing({
    items,
    canEditPricing,
    hasUnsavedChanges,
    isSaving,
    isPending,
    calculatedTotals,
    taxEnabled,
    onTaxToggle,
    onItemPriceChange,
    onSavePricing,
    onStartReview
}: QuoteItemsPricingProps) {
    return (
        <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-600" />
                    Quote Items & Pricing
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        {/* ... table content remains same ... */}
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Product / Specification</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Qty</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Unit Price (₹)</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{item.product_name}</p>
                                            {item.product_sku && <p className="text-xs text-gray-500">SKU: {item.product_sku}</p>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="font-semibold text-sm">
                                            {item.quantity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        {canEditPricing ? (
                                            <input
                                                type="number"
                                                value={item.unit_price || ''}
                                                onChange={(e) => onItemPriceChange(item.id, 'unit_price', Number(e.target.value))}
                                                className="w-32 px-3 py-2 text-right border border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-sm"
                                                placeholder="Enter price"
                                            />
                                        ) : (
                                            <div className="text-right">
                                                {item.unit_price && item.unit_price > 0 ? (
                                                    <span className="font-semibold text-gray-900">
                                                        {item.unit_price.toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-orange-600 font-medium">Pricing not set</span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        {item.total_price && item.total_price > 0 ? (
                                            <span className="font-bold text-gray-900">
                                                {item.total_price.toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-500">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pricing Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    {calculatedTotals.total > 0 ? (
                        <div className="flex flex-col items-end gap-6">
                            <div className="w-full max-w-sm space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-semibold">₹ {calculatedTotals.subtotal.toLocaleString()}</span>
                                </div>

                                <div className="flex items-center justify-between py-1">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="tax-mode"
                                            checked={taxEnabled}
                                            onCheckedChange={onTaxToggle}
                                            disabled={!canEditPricing}
                                        />
                                        <Label htmlFor="tax-mode" className="text-sm text-gray-600">Enable Tax (18% GST)</Label>
                                    </div>
                                    <span className={`font-semibold ${!taxEnabled ? 'text-gray-400 decoration-line-through' : ''}`}>
                                        ₹ {calculatedTotals.tax.toLocaleString()}
                                    </span>
                                </div>

                                <div className="pt-3 border-t-2 border-gray-300 flex justify-between items-center">
                                    <span className="font-bold text-lg">Grand Total:</span>
                                    <span className="font-bold text-2xl text-[#FF6B35]">
                                        ₹ {calculatedTotals.total.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Save Pricing Button - Right Aligned */}
                            {canEditPricing && hasUnsavedChanges && (
                                <Button
                                    onClick={onSavePricing}
                                    disabled={isSaving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Pricing
                                </Button>
                            )}
                        </div>
                    ) : isPending ? (
                        <div className="flex justify-center py-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-2">Pricing not set yet</p>
                                <Button
                                    onClick={onStartReview}
                                    disabled={isSaving}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Start Review
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center py-4">
                            <div className="text-center bg-orange-50 border border-orange-200 rounded-lg px-6 py-4">
                                <p className="text-sm text-orange-700 font-medium">Pricing not set yet</p>
                                <p className="text-xs text-orange-600 mt-1">Set unit prices to calculate totals</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Save Pricing Button - REMOVED from centered position, now inside the summary block or... */}
                {/* Wait, if calculatedTotals.total is 0, we might still want to save? usually not. */}
                {/* If total is 0, hasUnsavedChanges might be true if I set a price then cleared it. */}
                {/* I will add a fallback Save Button if total is 0 but changes exist */}

                {canEditPricing && hasUnsavedChanges && calculatedTotals.total === 0 && (
                    <div className="flex justify-end mt-4 pt-4 border-t">
                        <Button
                            onClick={onSavePricing}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Pricing
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
