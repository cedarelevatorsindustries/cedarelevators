/**
 * Profile Indicator Component
 * Shows current shopping profile (Individual/Business)
 */

'use client'

import { User, Building2 } from 'lucide-react'
import { ProfileType } from '@/types/cart.types'

interface ProfileIndicatorProps {
  profileType: ProfileType
  itemCount?: number
  className?: string
}

export function ProfileIndicator({ 
  profileType, 
  itemCount, 
  className = '' 
}: ProfileIndicatorProps) {
  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700 ${className}`}
      data-testid="profile-indicator"
    >
      {profileType === 'individual' ? (
        <>
          <User className="w-4 h-4" />
          <span>Individual</span>
        </>
      ) : (
        <>
          <Building2 className="w-4 h-4" />
          <span>Business</span>
        </>
      )}
      {itemCount !== undefined && itemCount > 0 && (
        <span className="ml-1 px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full">
          {itemCount}
        </span>
      )}
    </div>
  )
}

