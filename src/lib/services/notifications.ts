/**
 * Notification Types and Service
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'order' | 'quote' | 'system' | 'stock' | 'customer'

export interface NotificationData {
    id: string
    type: NotificationType
    title: string
    message: string
    read: boolean
    createdAt: Date
    created_at?: string  // Alias for compatibility
    priority?: 'low' | 'medium' | 'high'
    metadata?: Record<string, any>
}

export class NotificationService {
    static async getNotifications(): Promise<NotificationData[]> {
        // Placeholder - implement actual notification fetching
        return []
    }

    static async markAsRead(id: string): Promise<void> {
        // Placeholder - implement actual mark as read
    }

    static async markAllAsRead(): Promise<void> {
        // Placeholder - implement actual mark all as read
    }

    static async deleteNotification(id: string): Promise<void> {
        // Placeholder - implement actual deletion
    }
}
