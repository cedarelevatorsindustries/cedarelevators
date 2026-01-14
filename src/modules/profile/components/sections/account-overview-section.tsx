'use client'

import { UserProfile } from '@/lib/types/profile'
import { CircleCheck, AlertCircle, ArrowRight, Building2, UserCircle, Edit2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { getInitials } from '@/lib/utils/profile'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/auth/client'
import { toast } from 'sonner'
import { useClerk } from '@clerk/nextjs'
import GoldVerificationBadge from '../gold-verification-badge'

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
  const router = useRouter()
  const { signOut } = useClerk()

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
      // Force a complete server refresh to update all UI components
      router.refresh()
      // Small delay then hard reload to ensure all server components update
      setTimeout(() => window.location.reload(), 100)
    } catch (error: any) {
      console.error("Error switching profile:", error)
      toast.error(error.message || "Failed to switch profile")
    } finally {
      setIsSwitching(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="space-y-6">
      {/* Page Title with Logout Button */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Overview</h1>
          <p className="text-gray-600 mt-1">Manage your account information and settings</p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* User Identity Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={cn(
            "rounded-full",
            isVerified && "ring-4 ring-yellow-400 ring-offset-2"
          )}>
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
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span>{`${user.first_name} ${user.last_name}`.trim() || user.email}</span>
              {isVerified && <GoldVerificationBadge size={20} />}
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

              {/* Verification Badge (Business only) - Only show "Verified" text for verified */}
              {accountType === 'business' && verificationStatus === 'approved' && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  Verified
                </span>
              )}

              {/* Non-verified statuses */}
              {accountType === 'business' && verificationStatus !== 'approved' && (
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  verificationStatus === 'pending' && 'bg-orange-100 text-orange-700',
                  (verificationStatus === 'incomplete' || verificationStatus === 'rejected') && 'bg-red-100 text-red-700'
                )}>
                  {verificationStatus === 'pending' && 'Pending Verification'}
                  {verificationStatus === 'incomplete' && 'Verification Required'}
                  {verificationStatus === 'rejected' && 'Verification Rejected'}
                </span>
              )}

              {/* Profile Switcher Button - Only for Individual accounts */}
              {!isBusiness && (
                <button
                  onClick={handleSwitch}
                  disabled={isSwitching}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Building2 size={14} />
                  {isSwitching ? 'Switching...' : 'Switch to Business'}
                </button>
              )}

              {/* Edit Profile Button */}
              <button
                onClick={() => onNavigate('personal-info')}
                className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1.5"
              >
                <Edit2 size={14} />
                Edit Profile
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
                <button
                  onClick={handleSwitch}
                  disabled={isSwitching}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSwitching ? 'Switching...' : 'Upgrade Now'} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )
      }


    </div >
  )
}

