/**
 * Cart Locking Actions
 * Cedar Elevator Industries
 * 
 * Handles cart locking during checkout:
 * - Soft lock (shows warning, doesn't block)
 * - 5 minute timeout
 * - Auto-unlock expired locks
 */

'use server'

import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { CartActionResponse } from '@/types/cart.types'
import { logger } from '@/lib/services/logger'

// =====================================================
// Cart Lock Status Type
// =====================================================

export interface CartLockStatus {
  is_locked: boolean
  locked_at?: string
  locked_until?: string
  locked_by?: string
  lock_reason?: string
  remaining_seconds?: number
}

// =====================================================
// Lock Cart for Checkout
// =====================================================

export async function lockCartForCheckout(
  cartId: string,
  durationMinutes: number = 5
): Promise<CartActionResponse<CartLockStatus>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClerkSupabaseClient()

    // Call database function to lock cart
    const { data, error } = await supabase.rpc('lock_cart_for_checkout', {
      p_cart_id: cartId,
      p_clerk_user_id: userId,
      p_duration_minutes: durationMinutes
    })

    if (error) {
      logger.error('Error locking cart', error)
      return { success: false, error: 'Failed to lock cart' }
    }

    if (!data.success) {
      return { 
        success: false, 
        error: data.error,
        data: data as CartLockStatus
      }
    }

    return { 
      success: true, 
      data: data as CartLockStatus,
      message: 'Cart locked for checkout'
    }

  } catch (error) {
    logger.error('lockCartForCheckout error', error)
    return { success: false, error: 'Failed to lock cart' }
  }
}

// =====================================================
// Unlock Cart
// =====================================================

export async function unlockCart(
  cartId: string
): Promise<CartActionResponse<CartLockStatus>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClerkSupabaseClient()

    // Call database function to unlock cart
    const { data, error } = await supabase.rpc('unlock_cart', {
      p_cart_id: cartId,
      p_clerk_user_id: userId
    })

    if (error) {
      logger.error('Error unlocking cart', error)
      return { success: false, error: 'Failed to unlock cart' }
    }

    if (!data.success) {
      return { success: false, error: data.error }
    }

    return { 
      success: true, 
      data: data as CartLockStatus,
      message: 'Cart unlocked'
    }

  } catch (error) {
    logger.error('unlockCart error', error)
    return { success: false, error: 'Failed to unlock cart' }
  }
}

// =====================================================
// Check Cart Lock Status
// =====================================================

export async function checkCartLockStatus(
  cartId: string
): Promise<CartActionResponse<CartLockStatus>> {
  try {
    const supabase = await createClerkSupabaseClient()

    // Call database function to check lock status
    const { data, error } = await supabase.rpc('is_cart_locked', {
      p_cart_id: cartId
    })

    if (error) {
      logger.error('Error checking cart lock status', error)
      return { success: false, error: 'Failed to check lock status' }
    }

    if (!data.success) {
      return { success: false, error: data.error }
    }

    // Calculate remaining seconds if locked
    let remaining_seconds: number | undefined
    if (data.is_locked && data.locked_until) {
      const lockedUntil = new Date(data.locked_until)
      const now = new Date()
      remaining_seconds = Math.max(0, Math.floor((lockedUntil.getTime() - now.getTime()) / 1000))
    }

    return { 
      success: true, 
      data: {
        ...data,
        remaining_seconds
      } as CartLockStatus
    }

  } catch (error) {
    logger.error('checkCartLockStatus error', error)
    return { success: false, error: 'Failed to check lock status' }
  }
}

// =====================================================
// Extend Cart Lock (Refresh)
// =====================================================

export async function extendCartLock(
  cartId: string,
  additionalMinutes: number = 5
): Promise<CartActionResponse<CartLockStatus>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClerkSupabaseClient()

    // Check current lock status
    const lockStatus = await checkCartLockStatus(cartId)
    if (!lockStatus.success || !lockStatus.data?.is_locked) {
      return { success: false, error: 'Cart is not locked' }
    }

    // Extend lock by updating locked_until
    const { error } = await supabase
      .from('carts')
      .update({
        locked_until: new Date(Date.now() + additionalMinutes * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', cartId)
      .eq('clerk_user_id', userId)

    if (error) {
      logger.error('Error extending cart lock', error)
      return { success: false, error: 'Failed to extend lock' }
    }

    // Return updated lock status
    return await checkCartLockStatus(cartId)

  } catch (error) {
    logger.error('extendCartLock error', error)
    return { success: false, error: 'Failed to extend lock' }
  }
}
