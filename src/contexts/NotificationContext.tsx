'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Notification {
    id: string
    type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'quote' | 'system' | 'stock' | 'customer'
    title: string
    message: string
    read: boolean
    createdAt: Date
    created_at?: Date  // Alias for compatibility
    priority?: 'low' | 'medium' | 'high'
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    removeNotification: (id: string) => void
    clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])

    const unreadCount = notifications.filter(n => !n.read).length

    const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
        const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            read: false,
            createdAt: new Date(),
        }
        setNotifications(prev => [newNotification, ...prev])
    }

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        )
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const clearAll = () => {
        setNotifications([])
    }

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                removeNotification,
                clearAll,
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        // Return a no-op implementation if context is not available
        return {
            notifications: [],
            unreadCount: 0,
            addNotification: () => { },
            markAsRead: () => { },
            markAllAsRead: () => { },
            removeNotification: () => { },
            clearAll: () => { },
        }
    }
    return context
}
