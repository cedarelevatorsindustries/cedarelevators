/**
 * Cart Abandonment Handler
 * Tracks cart abandonment and optionally shows recovery popups
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface CartAbandonmentHandlerProps {
  itemCount: number
  enabled?: boolean
}

export function CartAbandonmentHandler({ 
  itemCount, 
  enabled = true 
}: CartAbandonmentHandlerProps) {
  const router = useRouter()
  const [showExitPopup, setShowExitPopup] = useState(false)

  useEffect(() => {
    if (!enabled || itemCount === 0) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show browser prompt, not custom dialog
      const message = 'You have items in your cart. Are you sure you want to leave?'
      e.preventDefault()
      e.returnValue = message
      return message
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0 && itemCount > 0) {
        setShowExitPopup(true)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [itemCount, enabled])

  return (
    <AlertDialog open={showExitPopup} onOpenChange={setShowExitPopup}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Wait! Don't Leave Empty-Handed</AlertDialogTitle>
          <AlertDialogDescription>
            You have {itemCount} item{itemCount > 1 ? 's' : ''} in your cart.
            Complete your purchase or request a quote before you go!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continue Shopping</AlertDialogCancel>
          <AlertDialogAction onClick={() => router.push('/checkout')}>
            Go to Checkout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
