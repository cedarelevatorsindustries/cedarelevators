"use client"

import { Shield, Truck, Award, Clock, CreditCard, Headphones } from 'lucide-react'

interface TrustBadgesProps {
  compact?: boolean
}

const BADGES = [
  { icon: Shield, label: 'Secure Checkout', description: '256-bit SSL encryption' },
  { icon: Truck, label: 'Free Shipping', description: 'On orders above ₹50,000' },
  { icon: Award, label: '2-Year Warranty', description: 'On all products' },
  { icon: Clock, label: 'Fast Delivery', description: '5-7 business days' },
  { icon: CreditCard, label: '30-Day Credit', description: 'For verified dealers' },
  { icon: Headphones, label: '24/7 Support', description: 'WhatsApp & Phone' },
]

export default function TrustBadges({ compact = false }: TrustBadgesProps) {
  if (compact) {
    return (
      <div className="space-y-2">
        {BADGES.slice(0, 3).map((badge, index) => {
          const Icon = badge.icon
          return (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <Icon className="w-4 h-4 text-green-600" />
              <span>{badge.label}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {BADGES.map((badge, index) => {
        const Icon = badge.icon
        return (
          <div 
            key={index} 
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{badge.label}</p>
              <p className="text-xs text-gray-500">{badge.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
