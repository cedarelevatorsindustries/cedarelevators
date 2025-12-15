"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, X, Maximize2, Truck, FileText, Receipt, Megaphone, ArrowLeft } from "lucide-react"
import { useNotifications } from "@/lib/hooks"
import type { Notification } from "@/lib/hooks"

type TabType = 'all' | 'orders' | 'quotes' | 'promotions'

interface NotificationSidebarProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
}

export default function NotificationSidebar({ isOpen, onClose, userId }: NotificationSidebarProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [isExpanded, setIsExpanded] = useState(false)
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ 
    customerId: userId,
    channel: userId ? `user-${userId}` : undefined
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

  const getIconBgColor = (notification: Notification) => {
    const category = getNotificationCategory(notification)
    switch (category) {
      case 'orders':
        return 'bg-blue-100'
      case 'quotes':
        return 'bg-purple-100'
      case 'promotions':
        return 'bg-orange-100'
      default:
        return 'bg-gray-100'
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transition-all duration-300 ${
          isExpanded ? 'w-full md:w-[600px]' : 'w-full md:w-[400px]'
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isExpanded ? "Compact view" : "Expand view"}
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1.5 text-xs text-gray-500">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Mark all as read */}
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
        <div className="overflow-y-auto h-[calc(100vh-180px)]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Bell className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-sm text-gray-600">
                {activeTab === 'all' 
                  ? "You're all caught up!"
                  : `No ${activeTab} notifications`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) markAsRead(notification.id)
                    if (notification.link) {
                      router.push(notification.link)
                      onClose()
                    }
                  }}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${getIconBgColor(notification)} flex items-center justify-center`}>
                      {getNotificationIcon(notification)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500 mt-1 inline-block">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
