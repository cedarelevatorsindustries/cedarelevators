'use client'

import { useEffect, useState, useCallback } from 'react'
import { getPusherClient } from '@/lib/pusher'
import { toast } from 'sonner'
import type { Channel } from 'pusher-js'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  link?: string
  created_at: string
  read?: boolean
}

interface UseNotificationsOptions {
  customerId?: string | null
  channel?: string
  onNotification?: (notification: Notification) => void
  showToast?: boolean // Control whether to show toast notifications
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { customerId, channel: customChannel, onNotification, showToast = false } = options
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  // Only connect if user is logged in
  const shouldConnect = !!customerId
  
  // Determine channel name
  const channelName = customChannel || (customerId ? `user-${customerId}` : null)

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  useEffect(() => {
    // Don't connect if no channel name or not logged in
    if (!channelName || !shouldConnect) {
      setIsConnected(false)
      return
    }

    const pusher = getPusherClient()
    let channel: Channel

    try {
      channel = pusher.subscribe(channelName)
      setIsConnected(true)

      // Listen for new notifications
      channel.bind('new_notification', (data: Notification) => {
        const notification: Notification = {
          ...data,
          id: data.id || crypto.randomUUID(),
          created_at: data.created_at || new Date().toISOString(),
          read: false,
        }

        setNotifications(prev => [notification, ...prev].slice(0, 50)) // Keep last 50
        setUnreadCount(prev => prev + 1)

        // Only show toast if explicitly enabled
        if (showToast) {
          const toastOptions = {
            description: notification.message,
            duration: 5000,
            action: notification.link
              ? {
                  label: 'View',
                  onClick: () => {
                    window.location.href = notification.link!
                  },
                }
              : undefined,
          }

          switch (notification.type) {
            case 'success':
              toast.success(notification.title, toastOptions)
              break
            case 'error':
              toast.error(notification.title, toastOptions)
              break
            case 'warning':
              toast.warning(notification.title, toastOptions)
              break
            default:
              toast.info(notification.title, toastOptions)
          }
        }

        // Call custom handler if provided
        onNotification?.(notification)
      })

      // Also listen for generic 'my-event' for testing
      channel.bind('my-event', (data: any) => {
        const notification: Notification = {
          id: crypto.randomUUID(),
          title: data.title || 'New Message',
          message: data.message || JSON.stringify(data),
          type: data.type || 'info',
          link: data.link,
          created_at: new Date().toISOString(),
          read: false,
        }

        setNotifications(prev => [notification, ...prev].slice(0, 50))
        setUnreadCount(prev => prev + 1)
        
        if (showToast) {
          toast.info(notification.title, { description: notification.message })
        }
        
        onNotification?.(notification)
      })

      // Connection state handlers
      pusher.connection.bind('connected', () => setIsConnected(true))
      pusher.connection.bind('disconnected', () => setIsConnected(false))
      pusher.connection.bind('error', () => setIsConnected(false))

    } catch (error) {
      console.error('Pusher subscription error:', error)
      setIsConnected(false)
    }

    return () => {
      if (channel) {
        channel.unbind_all()
        pusher.unsubscribe(channelName)
      }
    }
  }, [channelName, onNotification, showToast, shouldConnect])

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  }
}
