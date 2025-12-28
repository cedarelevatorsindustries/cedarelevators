'use server'

import { createServerSupabase, createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import Pusher from 'pusher'

const pusher = process.env.PUSHER_APP_ID ? new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
}) : null

interface CreateNotificationInput {
  user_id: string
  type: 'order' | 'payment' | 'business' | 'system' | 'promotion'
  title: string
  message: string
  action_url?: string
  metadata?: any
}

/**
 * Create and send notification
 */
export async function createNotification(data: CreateNotificationInput) {
  try {
    const supabase = await createServerSupabase()

    if (!data.user_id || !data.type || !data.title || !data.message) {
      return { success: false, error: 'Missing required fields' }
    }

    // Store notification in database
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        action_url: data.action_url,
        metadata: data.metadata,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return { success: false, error: error.message }
    }

    // Send real-time notification via Pusher
    if (pusher) {
      try {
        await pusher.trigger(`private-user-${data.user_id}`, 'notification', {
          id: notification.id,
          type: data.type,
          title: data.title,
          message: data.message,
          action_url: data.action_url,
          created_at: notification.created_at,
        })
      } catch (pusherError) {
        console.error('Error sending Pusher notification:', pusherError)
        // Don't fail the whole operation if Pusher fails
      }
    }

    return { success: true, notification }
  } catch (error: any) {
    console.error('Error in createNotification:', error)
    return { success: false, error: error.message || 'Failed to create notification' }
  }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(filters?: {
  limit?: number
  offset?: number
  is_read?: boolean
  type?: string
}) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data: notifications, error, count } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return { success: false, error: error.message }
    }

    return { success: true, notifications, total: count || 0 }
  } catch (error: any) {
    console.error('Error in getUserNotifications:', error)
    return { success: false, error: error.message || 'Failed to fetch notifications' }
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error marking notification as read:', error)
      return { success: false, error: error.message }
    }

    return { success: true, notification }
  } catch (error: any) {
    console.error('Error in markNotificationAsRead:', error)
    return { success: false, error: error.message || 'Failed to mark notification as read' }
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in markAllNotificationsAsRead:', error)
    return { success: false, error: error.message || 'Failed to mark all notifications as read' }
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting notification:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteNotification:', error)
    return { success: false, error: error.message || 'Failed to delete notification' }
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount() {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error getting unread count:', error)
      return { success: false, error: error.message }
    }

    return { success: true, count: count || 0 }
  } catch (error: any) {
    console.error('Error in getUnreadNotificationCount:', error)
    return { success: false, error: error.message || 'Failed to get unread count' }
  }
}

/**
 * Get or create notification preferences
 */
export async function getNotificationPreferences() {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Try to get existing preferences
    let { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    // If no preferences exist, create default ones
    if (error && error.code === 'PGRST116') {
      const { data: newPreferences, error: createError } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: userId,
          email_notifications: true,
          push_notifications: true,
          order_updates: true,
          payment_updates: true,
          business_updates: true,
          system_updates: true,
          promotional_updates: false,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating preferences:', createError)
        return { success: false, error: createError.message }
      }

      preferences = newPreferences
    } else if (error) {
      console.error('Error fetching preferences:', error)
      return { success: false, error: error.message }
    }

    return { success: true, preferences }
  } catch (error: any) {
    console.error('Error in getNotificationPreferences:', error)
    return { success: false, error: error.message || 'Failed to get preferences' }
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(updates: {
  email_notifications?: boolean
  push_notifications?: boolean
  order_updates?: boolean
  payment_updates?: boolean
  business_updates?: boolean
  system_updates?: boolean
  promotional_updates?: boolean
}) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating preferences:', error)
      return { success: false, error: error.message }
    }

    return { success: true, preferences }
  } catch (error: any) {
    console.error('Error in updateNotificationPreferences:', error)
    return { success: false, error: error.message || 'Failed to update preferences' }
  }
}

/**
 * Notification helper: Send order update notification
 */
export async function sendOrderNotification(
  userId: string,
  orderNumber: string,
  status: string,
  orderId: string
) {
  const statusMessages: Record<string, string> = {
    confirmed: 'Your order has been confirmed',
    processing: 'Your order is being processed',
    shipped: 'Your order has been shipped',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled',
  }

  return createNotification({
    user_id: userId,
    type: 'order',
    title: `Order ${orderNumber} ${status}`,
    message: statusMessages[status] || 'Order status updated',
    action_url: `/orders/${orderId}`,
    metadata: { order_id: orderId, order_number: orderNumber, status },
  })
}

/**
 * Notification helper: Send payment notification
 */
export async function sendPaymentNotification(
  userId: string,
  amount: number,
  status: 'success' | 'failed',
  orderId: string
) {
  return createNotification({
    user_id: userId,
    type: 'payment',
    title: status === 'success' ? 'Payment Successful' : 'Payment Failed',
    message:
      status === 'success'
        ? `Payment of ₹${amount} processed successfully`
        : `Payment of ₹${amount} failed. Please try again.`,
    action_url: `/orders/${orderId}`,
    metadata: { order_id: orderId, amount, status },
  })
}

/**
 * Notification helper: Send business verification notification
 */
export async function sendBusinessVerificationNotification(
  userId: string,
  status: 'pending' | 'verified' | 'rejected',
  message: string
) {
  return createNotification({
    user_id: userId,
    type: 'business',
    title: `Business Verification ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message,
    action_url: '/dashboard/business',
    metadata: { status },
  })
}
