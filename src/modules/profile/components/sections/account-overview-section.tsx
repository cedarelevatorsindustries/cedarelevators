'use client'

import { UserProfile } from '@/lib/types/profile'
import { CircleCheck, AlertCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { getInitials } from '@/lib/utils/profile'
import Link from 'next/link'

interface AccountOverviewSectionProps {
  user: UserProfile
  accountType: 'individual' | 'business'
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'incomplete'
  onNavigate: (section: string) => void
}

export default function AccountOverviewSection({
  user,
  accountType,
  verificationStatus = 'incomplete',
  onNavigate,
}: AccountOverviewSectionProps) {
  const isVerified = accountType === 'business' && verificationStatus === 'approved'
  const needsVerification = accountType === 'business' && verificationStatus !== 'approved'

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account information and settings</p>
      </div>

      {/* User Identity Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={`${user.first_name} ${user.last_name}`}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-semibold">
              {getInitials(user.first_name, user.last_name)}
            </div>
          )}

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user.company_name || `${user.first_name} ${user.last_name}`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{user.email}</p>
            
            {/* Account Type Badge */}
            <div className="flex items-center gap-2 mt-3">
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                accountType === 'business'
                  ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                  : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
              )}>
                {accountType === 'business' ? 'Business Account' : 'Individual Account'}
              </span>

              {/* Verification Badge (Business only) */}
              {accountType === 'business' && (
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  verificationStatus === 'approved' && 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
                  verificationStatus === 'pending' && 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
                  (verificationStatus === 'incomplete' || verificationStatus === 'rejected') && 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                )}>
                  {verificationStatus === 'approved' && '✓ Verified'}
                  {verificationStatus === 'pending' && 'Pending Verification'}
                  {verificationStatus === 'incomplete' && 'Verification Required'}
                  {verificationStatus === 'rejected' && 'Verification Rejected'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Alert (Business Unverified Only) */}
      {needsVerification && (
        <div className={cn(
          'rounded-lg p-6 border',
          verificationStatus === 'pending'
            ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/20'
            : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20'
        )}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {verificationStatus === 'pending' ? (
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <AlertCircle className="text-orange-600 dark:text-orange-400" size={24} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {verificationStatus === 'pending'
                  ? 'Verification in Progress'
                  : 'Complete Business Verification'
                }
              </h3>
              <p className={cn(
                'text-sm mb-4',
                verificationStatus === 'pending'
                  ? 'text-orange-800 dark:text-orange-300'
                  : 'text-red-800 dark:text-red-300'
              )}>
                {verificationStatus === 'pending'
                  ? 'Our team is reviewing your documents. You\'ll receive an email once approved (usually within 24 hours).'
                  : 'Complete business verification to unlock full B2B features including custom quotes and bulk ordering.'
                }
              </p>
              {verificationStatus !== 'pending' && (
                <button
                  onClick={() => onNavigate('approvals')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                  Complete Verification <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verified Success Banner (Business Verified Only) */}
      {isVerified && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-6 border border-green-200 dark:border-green-900/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CircleCheck className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">Verified Business Account</h3>
              <p className="text-green-700 dark:text-green-300 text-sm">You have full access to all B2B features including custom quotes, bulk ordering, and priority support.</p>
            </div>
          </div>
        </div>
      )}

      {/* Individual Upgrade CTA */}
      {accountType === 'individual' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-900/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ArrowRight className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">Upgrade to Business Account</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">Get access to wholesale pricing, custom quotes, bulk ordering, and dedicated account management.</p>
              <Link
                href="/upgrade-to-business"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg transition-colors"
              >
                Upgrade Now <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links to Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate(accountType === 'business' ? 'business-info' : 'personal-info')}
          className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 transition-colors text-left group"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-orange-500 transition-colors">
            {accountType === 'business' ? 'Business Information' : 'Personal Information'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Update your {accountType === 'business' ? 'company' : 'profile'} details</p>
        </button>

        <button
          onClick={() => onNavigate('addresses')}
          className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 transition-colors text-left group"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-orange-500 transition-colors">Addresses</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your shipping and billing addresses</p>
        </button>

        <button
          onClick={() => onNavigate('notifications')}
          className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 transition-colors text-left group"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-orange-500 transition-colors">Notifications</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Configure your notification preferences</p>
        </button>

        <button
          onClick={() => onNavigate('security')}
          className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 transition-colors text-left group"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-orange-500 transition-colors">Security Settings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage password and security options</p>
        </button>
      </div>
    </div>
  )
}
