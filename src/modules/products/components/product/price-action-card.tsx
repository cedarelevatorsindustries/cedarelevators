'use client'

import { useState } from 'react'
import { FileText, Minus, Plus, MessageCircle, ShieldCheck } from 'lucide-react'
import { formatPrice } from '@/lib/utils/pricing-utils'

interface PriceActionCardProps {
    userState?: any
    price?: number | null
    mrp?: number | null
    onAddToCart?: (quantity: number) => void
    onRequestQuote?: (quantity: number) => void
    className?: string
    isMobile?: boolean
    actionDisabled?: boolean
    productId?: string
    verificationStatus?: string
}

export function PriceActionCard({
    price,
    mrp,
    onRequestQuote,
    className = '',
    isMobile = false,
    actionDisabled = false,
}: PriceActionCardProps) {
    const [quantity, setQuantity] = useState(1)

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta))
    }

    const hasPrice = typeof price === 'number' && price > 0

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
            {/* Header Badge */}
            <div className="bg-orange-50 border-b border-orange-100 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-950">
                        Commercial Quotation Available
                    </span>
                </div>
                <span className="text-xs font-medium text-orange-700 bg-orange-100/80 px-2.5 py-0.5 rounded-full">
                    Direct B2B Pricing
                </span>
            </div>

            <div className="p-6">
                {/* Pricing Display */}
                <div className="flex flex-col mb-6">
                    {hasPrice ? (
                        <div className="flex items-baseline gap-3 flex-wrap">
                            <h2 className="text-gray-900 text-3xl font-bold tracking-tight">
                                {formatPrice(price)}
                            </h2>
                            <span className="text-xs text-gray-500 font-medium">
                                (Estimated Base Price excl. taxes & freight)
                            </span>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-gray-900 text-2xl font-bold tracking-tight">
                                Price on Request
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Customized commercial pricing provided upon quotation submission.
                            </p>
                        </div>
                    )}
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity Required
                    </label>
                    <div className="flex items-center w-[140px] border border-gray-200 rounded-lg bg-white">
                        <button
                            type="button"
                            onClick={() => handleQuantityChange(-1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-orange-600 transition-colors hover:bg-gray-50 rounded-l-lg"
                            aria-label="Decrease quantity"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <input
                            type="text"
                            value={quantity}
                            readOnly
                            className="w-full h-10 text-center text-gray-900 font-medium bg-transparent border-0 focus:ring-0 p-0 text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => handleQuantityChange(1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-orange-600 transition-colors hover:bg-gray-50 rounded-r-lg"
                            aria-label="Increase quantity"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Primary Action Buttons */}
                <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3`}>
                    {/* Primary Button: Request a Quote */}
                    <button
                        type="button"
                        onClick={() => onRequestQuote?.(quantity)}
                        disabled={actionDisabled}
                        className={`flex-1 font-semibold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] ${
                            actionDisabled
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white shadow-orange-600/20'
                        }`}
                    >
                        <FileText className="w-5 h-5" />
                        <span>Request a Quote</span>
                    </button>

                    {/* Secondary Button: WhatsApp Inquiry */}
                    <a
                        href={`https://wa.me/918220202757?text=${encodeURIComponent(
                            `Hi Cedar Elevators, I am interested in inquiring about ${quantity} unit(s) of this product.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 font-semibold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        <span>WhatsApp Inquiry</span>
                    </a>
                </div>

                {/* Information Notes */}
                <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>⚡ Quick turn-around quotation response</span>
                    <span>Direct engineering consultation</span>
                </div>
            </div>
        </div>
    )
}
