'use client'

import { UserProfile } from '@/lib/types/profile'
import { CircleCheck, AlertCircle, ArrowRight, Building2, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { getInitials } from '@/lib/utils/profile'
import Link from 'next/link'
import { useState } from 'react'
import { useUser } from '@/lib/auth/client'
import { toast } from 'sonner'

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

  const { user: enhancedUser, switchProfile, createBusinessProfile } = useUser()
  const [isSwitching, setIsSwitching] = useState(false)

  const isBusiness = enhancedUser?.activeProfile?.profile_type === 'business'
  const hasBusinessProfile = enhancedUser?.hasBusinessProfile

  const handleSwitch = async () => {
    if (isSwitching) return

    setIsSwitching(true)
    try {
      if (isBusiness) {
        await switchProfile('individual')
        toast.success('Switched to Individual profile')
      } else {
        if (hasBusinessProfile) {
          await switchProfile('business')
          toast.success('Switched to Business profile')
        } else {
          const userName = `${user.first_name} ${user.last_name}`.trim()
          await createBusinessProfile({
            name: userName ? `${userName}'s Business` : 'My Business',
            gst_number: '',
            pan_number: ''
          })
          toast.success('Business profile created! Complete your details below.')
        }
      }
      window.location.href = window.location.href
    } catch (error: any) {
      console.error("Error switching profile:", error)
      toast.error(error.message || "Failed to switch profile")
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Overview</h1>
        <p className="text-gray-600 mt-1">Manage your account information and settings</p>
      </div>

      {/* User Identity Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
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
            <h2 className="text-xl font-semibold text-gray-900">
              {user.company_name || `${user.first_name} ${user.last_name}`}
            </h2>
            <p className="text-gray-600 mt-1">{user.email}</p>

            {/* Account Type Badge */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                accountType === 'business'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              )}>
                {accountType === 'business' ? 'Business Account' : 'Individual Account'}
              </span>

              {/* Verification Badge (Business only) */}
              {accountType === 'business' && (
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  verificationStatus === 'approved' && 'bg-green-100 text-green-700',
                  verificationStatus === 'pending' && 'bg-orange-100 text-orange-700',
                  (verificationStatus === 'incomplete' || verificationStatus === 'rejected') && 'bg-red-100 text-red-700'
                )}>
                  {verificationStatus === 'approved' && '✓ Verified'}
                  {verificationStatus === 'pending' && 'Pending Verification'}
                  {verificationStatus === 'incomplete' && 'Verification Required'}
                  {verificationStatus === 'rejected' && 'Verification Rejected'}
                </span>
              )}

              {/* Profile Switcher Button */}
              <button
                onClick={handleSwitch}
                disabled={isSwitching}
                className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isBusiness ? (
                  <>
                    <UserCircle size={14} />
                    {isSwitching ? 'Switching...' : 'Switch to Individual'}
                  </>
                ) : (
                  <>
                    <Building2 size={14} />
                    {isSwitching ? 'Switching...' : 'Switch to Business'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Alert (Business Unverified Only) */}
      {needsVerification && (
        <div className={cn(
          'rounded-lg p-6 border',
          verificationStatus === 'pending'
            ? 'bg-orange-50 border-orange-200'
            : 'bg-red-50 border-red-200'
        )}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {verificationStatus === 'pending' ? (
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="text-orange-600" size={24} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {verificationStatus === 'pending'
                  ? 'Verification in Progress'
                  : 'Complete Business Verification'
                }
              </h3>
              <p className={cn(
                'text-sm mb-4',
                verificationStatus === 'pending'
                  ? 'text-orange-800'
                  : 'text-red-800'
              )}>
                {verificationStatus === 'pending'
                  ? 'Our team is reviewing your documents. You\'ll receive an email once approved (usually within 24 hours).'
                  : 'Complete business verification to unlock full B2B features including custom quotes and bulk ordering.'
                }
              </p>
              {verificationStatus !== 'pending' && (
                <button
                  onClick={() => onNavigate('approvals')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                >
                  Complete Verification <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )
      }

      {/* Verified Success Banner (Business Verified Only) */}
      {
        isVerified && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CircleCheck className="text-green-600" size={24} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-1">Verified Business Account</h3>
                <p className="text-green-700 text-sm">You have full access to all B2B features including custom quotes, bulk ordering, and priority support.</p>
              </div>
            </div>
          </div>
        )
      }

      {/* Individual Upgrade CTA */}
      {
        accountType === 'individual' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <ArrowRight className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-1">Upgrade to Business Account</h3>
                <p className="text-blue-700 text-sm mb-4">Get access to wholesale pricing, custom quotes, bulk ordering, and dedicated account management.</p>
                <Link
                  href="/upgrade-to-business"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Upgrade Now <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )
      }

      {/* Quick Links to Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate(accountType === 'business' ? 'business-info' : 'personal-info')}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-orange-500 transition-colors text-left group"
        >
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">
            {accountType === 'business' ? 'Business Information' : 'Personal Information'}
          </h3>
          <p className="text-sm text-gray-600">Update your {accountType === 'business' ? 'company' : 'profile'} details</p>
        </button>

        <button
          onClick={() => onNavigate('addresses')}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-orange-500 transition-colors text-left group"
        >
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">Addresses</h3>
          <p className="text-sm text-gray-600">Manage your shipping and billing addresses</p>
        </button>

        <button
          onClick={() => onNavigate('notifications')}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-orange-500 transition-colors text-left group"
        >
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">Notifications</h3>
          <p className="text-sm text-gray-600">Configure your notification preferences</p>
        </button>

        <button
          onClick={() => onNavigate('security')}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-orange-500 transition-colors text-left group"
        >
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">Security Settings</h3>
          <p className="text-sm text-gray-600">Manage password and security options</p>
        </button>
      </div>
    </div >
  )
}

