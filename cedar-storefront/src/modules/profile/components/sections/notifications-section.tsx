'use client'

import { useState } from 'react'
import { NotificationPreferences } from '@/lib/types/profile'
import { Bell, Mail, MessageSquare, Smartphone, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationsSectionProps {
  preferences: NotificationPreferences | null
  onUpdate: (preferences: Partial<NotificationPreferences>) => Promise<void>
  className?: string
}

export default function NotificationsSection({
  preferences,
  onUpdate,
  className,
}: NotificationsSectionProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<NotificationPreferences>>(
    preferences || {
      order_updates_email: true,
      order_updates_sms: false,
      order_updates_push: true,
      quote_responses_email: true,
      quote_responses_push: true,
      price_drops_email: false,
      stock_alerts_email: false,
      promotions_email: false,
      newsletters_email: false,
      account_security_email: true,
      team_activity_email: false,
    }
  )

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(formData)
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save preferences. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const togglePreference = (key: keyof NotificationPreferences) => {
    setFormData((prev: NotificationPreferences) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const notificationGroups = [
    {
      title: 'Order Updates',
      description: 'Get notified about your order status and delivery updates',
      icon: <Bell size={20} />,
      preferences: [
        { key: 'order_updates_email' as const, label: 'Email', icon: <Mail size={16} /> },
        { key: 'order_updates_sms' as const, label: 'SMS', icon: <MessageSquare size={16} /> },
        { key: 'order_updates_push' as const, label: 'Push', icon: <Smartphone size={16} /> },
      ],
    },
    {
      title: 'Quote Responses',
      description: 'Notifications when you receive responses to your quote requests',
      icon: <MessageSquare size={20} />,
      preferences: [
        { key: 'quote_responses_email' as const, label: 'Email', icon: <Mail size={16} /> },
        { key: 'quote_responses_push' as const, label: 'Push', icon: <Smartphone size={16} /> },
      ],
    },
    {
      title: 'Product Alerts',
      description: 'Stay informed about price drops and stock availability',
      icon: <Bell size={20} />,
      preferences: [
        { key: 'price_drops_email' as const, label: 'Price Drops', icon: <Mail size={16} /> },
        { key: 'stock_alerts_email' as const, label: 'Stock Alerts', icon: <Mail size={16} /> },
      ],
    },
    {
      title: 'Marketing & Promotions',
      description: 'Receive updates about new products, offers, and newsletters',
      icon: <Mail size={20} />,
      preferences: [
        { key: 'promotions_email' as const, label: 'Promotions', icon: <Mail size={16} /> },
        { key: 'newsletters_email' as const, label: 'Newsletters', icon: <Mail size={16} /> },
      ],
    },
    {
      title: 'Account & Security',
      description: 'Important notifications about your account security',
      icon: <Bell size={20} />,
      preferences: [
        { key: 'account_security_email' as const, label: 'Security Alerts', icon: <Mail size={16} /> },
        { key: 'team_activity_email' as const, label: 'Team Activity', icon: <Mail size={16} /> },
      ],
    },
  ]

  return (
    <div className={cn('bg-white rounded-lg shadow-sm', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
          <p className="text-sm text-gray-600 mt-1">
            Choose how you want to receive notifications
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {notificationGroups.map((group, index) => (
          <div
            key={index}
            className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0"
          >
            {/* Group Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="text-gray-600 mt-1">{group.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900">{group.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
              </div>
            </div>

            {/* Preferences */}
            <div className="ml-11 space-y-3">
              {group.preferences.map((pref) => (
                <label
                  key={pref.key}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500">{pref.icon}</div>
                    <span className="text-sm text-gray-700">{pref.label}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData[pref.key] || false}
                      onChange={() => togglePreference(pref.key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Bell size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">About Notifications</h4>
              <p className="text-sm text-blue-800">
                You can customize how you receive notifications for different types of updates. 
                Email notifications are sent to your registered email address. SMS notifications 
                require a verified phone number. Push notifications work when you're logged in 
                to the Cedar app.
              </p>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Bell size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Important</h4>
              <p className="text-sm text-yellow-800">
                Account security notifications cannot be disabled to ensure the safety of your account. 
                You will always receive critical security alerts via email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
