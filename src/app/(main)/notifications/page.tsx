"use client"

import { useState } from "react"
import { useUser } from "@/lib/auth/client"
import { useNotifications } from "@/lib/hooks"
import { Bell, ArrowLeft, Truck, FileText, Receipt, Megaphone, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Notification } from "@/lib/hooks"

type TabType = 'all' | 'orders' | 'quotes' | 'promotions'

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications({ 
    customerId: user?.id,
    channel: user?.id ? `user-${user.id}` : undefined
  })

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
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
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

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      default:
        return 'ℹ'
    }
  }

  const getNotificationCategory = (notification: Notification): TabType => {
    const title = notification.title.toLowerCase()
    const message = notification.message.toLowerCase()
    
    if (title.includes('order') || message.includes('shipped') || message.includes('delivered')) {
      return 'orders'
    }
    if (title.includes('quote') || message.includes('quote')) {
      return 'quotes'
    }
    if (title.includes('promotion') || title.includes('discount') || message.includes('off')) {
      return 'promotions'
    }
    return 'all'
  }

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => getNotificationCategory(n) === activeTab)

  const tabs = [
    { id: 'all' as TabType, label: 'All', count: notifications.length },
    { id: 'orders' as TabType, label: 'Orders', count: notifications.filter(n => getNotificationCategory(n) === 'orders').length },
    { id: 'quotes' as TabType, label: 'Quotes', count: notifications.filter(n => getNotificationCategory(n) === 'quotes').length },
    { id: 'promotions' as TabType, label: 'Promotions', count: notifications.filter(n => getNotificationCategory(n) === 'promotions').length },
  ]

  const getNotificationIcon = (notification: Notification) => {
    const category = getNotificationCategory(notification)
    switch (category) {
      case 'orders':
        return <Truck className="w-5 h-5" />
      case 'quotes':
        return <FileText className="w-5 h-5" />
      case 'promotions':
        return <Megaphone className="w-5 h-5" />
      default:
        return <Receipt className="w-5 h-5" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view notifications</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to access your notifications</p>
          <button
            onClick={() => router.push('/sign-in')}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Notifications</h1>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mark all as read link */}
          {unreadCount > 0 && (
            <div className="mt-3">
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h2>
            <p className="text-gray-600">
              We'll notify you when something important happens
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 overflow-hidden transition-all hover:shadow-md ${
                  getTypeStyles(notification.type)
                } ${notification.read ? 'opacity-70' : ''}`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* Type Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      notification.type === 'success' ? 'bg-green-100 text-green-600' :
                      notification.type === 'error' ? 'bg-red-100 text-red-600' :
                      notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className={`text-base sm:text-lg ${
                            notification.read ? 'text-gray-700' : 'font-semibold text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.created_at)}
                            </span>
                            {notification.link && (
                              <button
                                onClick={() => {
                                  if (!notification.read) markAsRead(notification.id)
                                  router.push(notification.link!)
                                }}
                                className="text-xs font-medium text-orange-600 hover:text-orange-700"
                              >
                                View details →
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        {notifications.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
