'use client'

import { Package, FileText, Upload, TrendingUp, Lock } from 'lucide-react'
import { AccountType } from '@/lib/constants/profile'
import { cn } from '@/lib/utils'

interface QuickActionsProps {
  accountType: AccountType
  isVerified?: boolean
  onActionClick: (action: string) => void
  className?: string
}

export default function QuickActions({ accountType, isVerified = false, onActionClick, className }: QuickActionsProps) {
  const individualActions = [
    {
      id: 'reorder',
      label: 'Reorder Last Order',
      description: 'Quick reorder from history',
      icon: Package,
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'track',
      label: 'Track Orders',
      description: 'View order status',
      icon: TrendingUp,
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    },
  ]

  const businessActions = [
    {
      id: 'view-orders',
      label: 'View Orders',
      description: 'See all your orders',
      icon: Package,
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      locked: false,
    },
    {
      id: 'saved-lists',
      label: 'Saved Lists',
      description: 'Your wishlists',
      icon: TrendingUp,
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      locked: false,
    },
    {
      id: 'request-quote',
      label: 'Request Quote',
      description: isVerified ? 'Get custom pricing' : 'Verify to unlock',
      icon: FileText,
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      locked: !isVerified,
    },
    {
      id: 'bulk-order',
      label: 'Bulk Order',
      description: isVerified ? 'Upload CSV' : 'Verify to unlock',
      icon: Upload,
      color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      locked: !isVerified,
    },
  ]

  const actions = accountType === 'business' ? businessActions : individualActions.map(a => ({ ...a, locked: false }))

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => !action.locked && onActionClick(action.id)}
          disabled={action.locked}
          className={cn(
            'flex flex-col items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all text-left group relative',
            action.locked 
              ? 'opacity-60 cursor-not-allowed' 
              : 'hover:border-[#F97316] hover:shadow-sm cursor-pointer'
          )}
        >
          {action.locked && (
            <div className="absolute top-2 right-2">
              <Lock size={16} className="text-gray-400" />
            </div>
          )}
          <div className={cn('p-3 rounded-lg', action.color)}>
            <action.icon size={24} />
          </div>
          <div>
            <h3 className={cn(
              'font-semibold text-sm',
              action.locked 
                ? 'text-gray-500 dark:text-gray-500' 
                : 'text-gray-900 dark:text-white group-hover:text-[#F97316] transition-colors'
            )}>
              {action.label}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {action.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}
