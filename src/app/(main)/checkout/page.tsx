/**
 * Checkout Page
 * Uses responsive checkout templates (mobile/desktop)
 */

'use client'

import { useEffect, useState } from 'react'
import CheckoutTemplate from '@/modules/checkout/templates/checkout-template'
import MobileCheckoutTemplate from '@/modules/checkout/templates/mobile-checkout-template'

export default function CheckoutPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile ? <MobileCheckoutTemplate /> : <CheckoutTemplate />
}
