"use client"

import { Receipt, Info } from 'lucide-react'

interface GSTBreakdownProps {
  subtotal: number
  shippingState?: string
  sellerState?: string
  showPrices: boolean
}

export default function GSTBreakdown({ 
  subtotal, 
  shippingState = 'Maharashtra',
  sellerState = 'Maharashtra',
  showPrices 
}: GSTBreakdownProps) {
  const formatPrice = (amount: number) => {
    if (!showPrices) return '₹X,XXX'
    return `₹${(amount / 100).toLocaleString('en-IN')}`
  }

  const isIntraState = shippingState === sellerState
  const gstRate = 18 // 18% GST
  const gstAmount = Math.round(subtotal * (gstRate / 100))

  // For intra-state: CGST + SGST (9% each)
  // For inter-state: IGST (18%)
  const cgst = isIntraState ? Math.round(gstAmount / 2) : 0
  const sgst = isIntraState ? Math.round(gstAmount / 2) : 0
  const igst = !isIntraState ? gstAmount : 0

  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="w-4 h-4 text-blue-600" />
        <span className="font-semibold text-blue-900 text-sm">GST Breakdown</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Taxable Amount</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        {isIntraState ? (
          <>
            <div className="flex justify-between text-gray-600">
              <span>CGST (9%)</span>
              <span className="font-medium">{formatPrice(cgst)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>SGST (9%)</span>
              <span className="font-medium">{formatPrice(sgst)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-gray-600">
            <span>IGST (18%)</span>
            <span className="font-medium">{formatPrice(igst)}</span>
          </div>
        )}

        <div className="pt-2 border-t border-blue-200 flex justify-between font-semibold text-blue-900">
          <span>Total GST</span>
          <span>{formatPrice(gstAmount)}</span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 flex items-start gap-2 text-xs text-blue-700">
        <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
        <span>
          {isIntraState 
            ? `Intra-state supply (${shippingState}). CGST + SGST applicable.`
            : `Inter-state supply (${sellerState} → ${shippingState}). IGST applicable.`
          }
        </span>
      </div>
    </div>
  )
}
