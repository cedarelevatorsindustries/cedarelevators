"use client"

import { useSearchParams } from 'next/navigation'
import { useAccountType } from '@/lib/hooks'
import ThankYouSection from '../sections/09-thank-you-section'
import ThankYouUpsell from '../components/thank-you-upsell'
import WhatsAppButton from '../components/whatsapp-button'

interface OrderConfirmationTemplateProps {
  orderId: string
}

// Mock recommended products - replace with actual API call
const MOCK_RECOMMENDED = [
  { id: '1', title: 'Elevator Door Operator', thumbnail: null, price: 4500000 },
  { id: '2', title: 'Safety Gear Assembly', thumbnail: null, price: 2800000 },
  { id: '3', title: 'Control Panel Unit', thumbnail: null, price: 8500000 },
  { id: '4', title: 'Guide Rails Set', thumbnail: null, price: 3200000 },
]

export default function OrderConfirmationTemplate({ orderId }: OrderConfirmationTemplateProps) {
  const searchParams = useSearchParams()
  const { isGuest, isBusiness, user } = useAccountType()
  
  const orderType = (searchParams.get('type') as 'order' | 'quote') || 'order'
  const email = searchParams.get('email') || user?.emailAddresses?.[0]?.emailAddress || 'customer@example.com'
  
  const isVerified = user?.publicMetadata?.verified === true || 
                     user?.unsafeMetadata?.verified === true
  const showPrices = isBusiness && isVerified

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Thank You Section */}
      <ThankYouSection
        orderId={orderId}
        orderType={orderType}
        email={email}
        estimatedDelivery={orderType === 'order' ? '5-7 business days' : undefined}
        isGuest={isGuest}
      />

      {/* Upsell Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ThankYouUpsell
          recommendedProducts={MOCK_RECOMMENDED}
          orderedProducts={[]}
          showPrices={showPrices}
        />
      </div>

      {/* WhatsApp Button */}
      <WhatsAppButton 
        floating 
        message={`Hi, I just ${orderType === 'order' ? 'placed order' : 'requested quote'} ${orderId}. Can you help me track it?`}
      />
    </div>
  )
}

