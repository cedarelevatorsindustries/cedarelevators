'use client'

import { PriceActionCard } from '@/modules/products/components/product/price-action-card'
import { getUserPricingState } from '@/lib/utils/pricing-utils'
import { useUser } from '@/lib/auth/client'

interface PricingBlockSectionProps {
  price?: number | null
  originalPrice?: number | null
  onAddToCart?: (quantity: number) => void
  onRequestQuote?: () => void
  className?: string
  isMobile?: boolean
  actionDisabled?: boolean
}

export default function PricingBlockSection({
  price,
  originalPrice,
  onAddToCart,
  onRequestQuote,
  className = '',
  isMobile = false,
  actionDisabled = false
}: PricingBlockSectionProps) {
  const { user } = useUser()
  const userState = getUserPricingState(user)

  return (
    <PriceActionCard
      userState={userState}
      price={price}
      mrp={originalPrice}
      onAddToCart={onAddToCart}
      onRequestQuote={onRequestQuote}
      className={className}
      isMobile={isMobile}
      actionDisabled={actionDisabled}
    />
  )
}
