'use client'

import { PriceActionCard } from '@/modules/products/components/product/price-action-card'
import { getUserPricingState } from '@/lib/utils/pricing-utils'
import { useUser } from '@/lib/auth/client'

interface PricingBlockSectionProps {
  price?: number | null
  originalPrice?: number | null
  onAddToCart?: (quantity: number) => void
  onRequestQuote?: (quantity: number) => void
  className?: string
  isMobile?: boolean
  actionDisabled?: boolean
  productId?: string
}

export default function PricingBlockSection({
  price,
  originalPrice,
  onAddToCart,
  onRequestQuote,
  className = '',
  isMobile = false,
  actionDisabled = false,
  productId
}: PricingBlockSectionProps) {
  const { user } = useUser()
  const userState = getUserPricingState(user)

  // Get verification status from user object
  const verificationStatus = user?.business?.verification_status === 'verified' ? 'approved' :
    user?.business?.verification_status === 'pending' ? 'pending' :
      user?.business?.verification_status === 'rejected' ? 'rejected' : 'incomplete'

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
      productId={productId}
      verificationStatus={verificationStatus}
    />
  )
}
