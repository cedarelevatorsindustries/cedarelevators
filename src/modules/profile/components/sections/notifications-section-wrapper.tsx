'use client'

import { useProfile } from '@/lib/hooks/useProfile'
import NotificationsSection from './notifications-section'
import { LoaderCircle } from 'lucide-react'

export default function NotificationsSectionWrapper() {
  const {
    notificationPreferences,
    isLoading,
    updateNotificationPreferences,
  } = useProfile()

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <LoaderCircle size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <NotificationsSection
      preferences={notificationPreferences}
      onUpdate={updateNotificationPreferences}
    />
  )
}
