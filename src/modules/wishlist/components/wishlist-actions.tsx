'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { WishlistItem } from '@/lib/hooks/use-wishlist'

interface WishlistActionsProps {
  items: WishlistItem[]
}

export function WishlistActions({ items }: WishlistActionsProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const count = items.length
  const totalUnits = items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0)
  const paddedCount = String(count).padStart(2, '0')

  const handleProceedToQuote = () => {
    if (count === 0) return

    setIsProcessing(true)
    try {
      const productIds = Array.from(new Set(items.map((item) => item.product_id))).join(',')
      router.push(`/quotes/new?from=quote-list&productIds=${encodeURIComponent(productIds)}`)
    } catch (error) {
      toast.error('Failed to open quote request')
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Desktop Quote List Summary Panel */}
      <div className="hidden lg:block bg-white p-6 rounded-2xl border border-gray-200 sticky top-24">
        <h2 className="text-base font-normal text-gray-900 mb-4">
          Quote List Summary
        </h2>

        {/* Prominent Count */}
        <div className="pb-5 border-b border-gray-100">
          <div className="text-5xl font-extralight tracking-tight text-gray-900">
            {paddedCount}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Products in your list
          </p>
        </div>

        {/* Selection Metadata */}
        <div className="py-4 space-y-3 border-b border-gray-100 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Items selected</span>
            <span className="text-gray-900">{count} ({totalUnits} units)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Availability</span>
            <span className="text-gray-900">Check on request</span>
          </div>
        </div>

        {/* Callout & Primary CTA */}
        <div className="pt-5 space-y-3">
          <p className="text-sm font-normal text-gray-900">
            Ready to discuss your requirements?
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your selected products are ready to be included in a quotation request.
          </p>

          <Button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-2"
            size="lg"
            onClick={handleProceedToQuote}
            disabled={isProcessing || count === 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Opening Quote...
              </>
            ) : (
              <>
                <span>Proceed to Quote Request</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 leading-relaxed pt-1">
            You can continue browsing and update this list anytime.
          </p>
        </div>
      </div>

      {/* Mobile Sticky Summary Bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Quote List Summary</p>
            <p className="text-sm text-gray-900">
              {count} {count === 1 ? 'product' : 'products'} ({totalUnits} units)
            </p>
          </div>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={handleProceedToQuote}
            disabled={isProcessing || count === 0}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Proceed to Quote Request</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
