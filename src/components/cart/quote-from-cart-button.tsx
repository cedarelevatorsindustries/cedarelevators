/**
 * Quote from Cart Button
 * Cedar Elevator Industries
 * 
 * Button to request quote from cart items with prefill
 */

'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { DerivedCartItem } from '@/types/cart.types'
import { storeCartItemsForQuote, buildQuoteUrlFromCart } from '@/lib/utils/cart-to-quote'
import { toast } from 'sonner'

interface QuoteFromCartButtonProps {
  cartItems: DerivedCartItem[]
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
  clearCartOnQuote?: boolean
  onQuoteCreated?: () => void
}

export function QuoteFromCartButton({
  cartItems,
  variant = 'default',
  size = 'lg',
  fullWidth = false,
  className = '',
  clearCartOnQuote = false,
  onQuoteCreated
}: QuoteFromCartButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleRequestQuote = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsLoading(true)
    try {
      // Store cart items for quote prefill
      storeCartItemsForQuote(cartItems)

      // Build URL with cart source
      const quoteUrl = buildQuoteUrlFromCart(cartItems, 'cart')

      // Navigate to quote page
      router.push(quoteUrl)

      // Optionally clear cart
      if (clearCartOnQuote) {
        onQuoteCreated?.()
      }

      toast.success('Redirecting to quote request...')
    } catch (error) {
      console.error('Error requesting quote from cart:', error)
      toast.error('Failed to create quote request')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleRequestQuote}
      variant={variant}
      size={size}
      disabled={isLoading || cartItems.length === 0}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      data-testid="quote-from-cart-btn"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Creating Quote...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4 mr-2" />
          Request Quote ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
        </>
      )}
    </Button>
  )
}
