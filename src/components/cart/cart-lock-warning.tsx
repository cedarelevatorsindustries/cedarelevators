/**
 * Cart Lock Warning Component
 * Cedar Elevator Industries
 * 
 * Shows a warning banner when cart is locked during checkout
 * Soft lock: Doesn't block modifications, just warns user
 */

'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Clock, X } from 'lucide-react'
import { CartLockStatus } from '@/lib/actions/cart-locking'
import { formatDistanceToNow } from 'date-fns'

interface CartLockWarningProps {
  lockStatus: CartLockStatus
  onDismiss?: () => void
  showDismiss?: boolean
}

export function CartLockWarning({ 
  lockStatus, 
  onDismiss,
  showDismiss = true 
}: CartLockWarningProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!lockStatus.is_locked || !lockStatus.locked_until) return

    const updateTimer = () => {
      const lockedUntil = new Date(lockStatus.locked_until!)
      const now = new Date()
      const diff = lockedUntil.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining('expired')
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeRemaining(`${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [lockStatus])

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  if (!lockStatus.is_locked || dismissed) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-amber-900">
              Cart is in Checkout Mode
            </h3>
            {showDismiss && (
              <button
                onClick={handleDismiss}
                className="text-amber-600 hover:text-amber-800 transition-colors"
                aria-label="Dismiss warning"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-amber-800 mb-2">
            This cart is currently being used for checkout. Modifications made now may affect your order.
          </p>
          <div className="flex items-center gap-2 text-xs text-amber-700">
            <Clock className="h-4 w-4" />
            <span>
              {timeRemaining === 'expired' 
                ? 'Lock expired - cart is now available for editing'
                : `Auto-unlocks in ${timeRemaining}`
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact version for mobile
export function CartLockWarningCompact({ lockStatus }: { lockStatus: CartLockStatus }) {
  if (!lockStatus.is_locked) return null

  return (
    <div className="bg-amber-100 border-l-4 border-amber-500 p-3 mb-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-900 font-medium">
          In checkout mode - changes may affect order
        </p>
      </div>
    </div>
  )
}
