import NotificationsSectionWrapper from '@/modules/profile/components/sections/notifications-section-wrapper'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Notifications | Cedar B2B Storefront",
  description: "Manage your notification preferences",
}

export default function NotificationsPage() {
  return <NotificationsSectionWrapper />
}
