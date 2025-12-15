"use client"

import { useState, useRef, useEffect } from "react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { Bell, Check, CheckCheck, Trash2, X, Maximize2 } from "lucide-react"
import { useNotifications, type Notification } from "@/lib/hooks"

interface NotificationHoverCardContentProps {
  customerId?: string | null
  channel?: string
  onOpenSidebar?: () => void
  onClose?: () => void
}

export function NotificationHoverCardContent({ customerId, channel, onOpenSidebar, onClose }: NotificationHoverCardContentProps) {
  const handleExpandClick = () => {
    if (onClose) onClose()
    if (onOpenSidebar) onOpenSidebar()
  }
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications({ customerId, channel })

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50'
      case 'error':
        return 'border-l-red-500 bg-red-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="w-80 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
          </div>
          {onOpenSidebar && (
            <button
              onClick={handleExpandClick}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Expand to full view"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <Bell size={48} className="text-gray-300 mb-3" />
          <p className="text-sm text-gray-600">No new notifications</p>
          <p className="text-xs text-gray-400 mt-1">We'll notify you when something arrives</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-96">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
              {unreadCount} new
            </span>
          )}
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            title={isConnected ? 'Connected' : 'Disconnected'}
          />
        </div>
        <div className="flex items-center gap-1">
          {onOpenSidebar && (
            <button
              onClick={handleExpandClick}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Expand to full view"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`p-4 border-b border-gray-100 border-l-4 cursor-pointer transition-colors hover:bg-gray-50 ${
              getTypeStyles(notification.type)
            } ${notification.read ? 'opacity-60' : ''}`}
            onClick={() => {
              if (!notification.read) markAsRead(notification.id)
              if (notification.link) {
                window.location.href = notification.link
              }
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm ${notification.read ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
                  {notification.title}
                </h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                <span className="text-xs text-gray-400 mt-1 block">{formatTime(notification.created_at)}</span>
              </div>
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    markAsRead(notification.id)
                  }}
                  className="p-1 text-gray-400 hover:text-green-600 rounded flex-shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
            {notification.link && (
              <p className="text-xs text-orange-600 mt-2 font-medium">
                Click to view →
              </p>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <LocalizedClientLink
          href="/notifications"
          className="block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View all notifications
        </LocalizedClientLink>
      </div>
    </div>
  )
}

// Standalone notification bell component with real-time Pusher integration
export function NotificationBell({ 
  customerId, 
  channel,
  isTransparent = false 
}: { 
  customerId?: string | null
  channel?: string
  isTransparent?: boolean 
}) {
  const { unreadCount, isConnected } = useNotifications({ customerId, channel })
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-colors ${
          isTransparent 
            ? 'text-white hover:bg-white/10' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell size={20} />
        
        {/* Connection indicator */}
        <span
          className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-xs font-bold text-white bg-red-600 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <NotificationHoverCardContent customerId={customerId} channel={channel} />
        </div>
      )}
    </div>
  )
}
