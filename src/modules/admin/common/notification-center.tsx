'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Package, ShoppingCart, User, AlertCircle, CheckCircle } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { NotificationType } from '@/lib/services/notifications'

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'order':
      return <ShoppingCart className="h-5 w-5" />
    case 'stock':
      return <Package className="h-5 w-5" />
    case 'customer':
      return <User className="h-5 w-5" />
    case 'system':
      return <AlertCircle className="h-5 w-5" />
    default:
      return <Bell className="h-5 w-5" />
  }
}

function getPriorityColor(priority: 'low' | 'medium' | 'high') {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'low':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 border-white"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">All caught up!</p>
              <p className="text-sm text-gray-500 mt-1">You have no new notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white border-gray-300 shadow-sm'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-red-600 rounded-full ml-2 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
