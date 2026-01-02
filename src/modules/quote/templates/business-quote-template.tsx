"use client"

import { Product } from "@/lib/types/domain"
import { BusinessQuoteForm } from "../components/business-quote-form"

interface BusinessQuoteTemplateProps {
  products: Product[]
  prefilledProduct?: {
    id: string
    variantId?: string
    quantity?: number
    source?: string
  }
}

export default function BusinessQuoteTemplate({
  products,
  prefilledProduct
}: BusinessQuoteTemplateProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <BusinessQuoteForm
          products={products}
          prefilledProduct={prefilledProduct}
        />
      </div>
    </div>
  )
}
