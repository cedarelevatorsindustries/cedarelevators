'use client'

import { useState } from 'react'
import { FileText, Minus, Plus, ShieldCheck } from 'lucide-react'
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
                        <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5 text-[#25D366]"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        <span>WhatsApp Inquiry</span>
                    </a>
                </div>
            </div>
        </div>
    )
}
