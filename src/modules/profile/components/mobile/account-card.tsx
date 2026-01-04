'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils/profile'
import { getAccountCardCTA } from '@/lib/utils/profile-mobile'
import { AccountType } from '@/lib/constants/profile'
import { useUser } from '@/lib/auth/client'
import { toast } from 'sonner'
import { logger } from '@/lib/services/logger'

interface AccountCardProps {
  user?: {
    name: string
    email?: string
    companyName?: string
    avatarUrl?: string
  }
  accountType: AccountType
  isVerified?: boolean
}

/**
 * Account Card Component for Mobile Profile
 * 
 * Shows user identity with role-appropriate CTAs:
 * - Guest: Sign In + Create Account buttons
 * - Individual: Upgrade to Business button
 * - Business Unverified: Complete Verification button
 * - Business Verified: No CTA (just identity)
 * 
 * NO stats, NO counts, NO analytics
 */
export default function AccountCard({ user, accountType, isVerified = false }: AccountCardProps) {
  const cta = getAccountCardCTA(accountType, isVerified)
  const { user: enhancedUser, switchProfile, createBusinessProfile } = useUser()
  const [isSwitching, setIsSwitching] = useState(false)

  const hasBusinessProfile = enhancedUser?.hasBusinessProfile
  const userName = user?.name || enhancedUser?.name || 'User'

  // Handle upgrade to business (same logic as desktop)
  const handleUpgradeToBusiness = async () => {
    if (isSwitching) return

    setIsSwitching(true)
    try {
      if (hasBusinessProfile) {
        logger.debug('Business profile exists, switching...')
        await switchProfile('business')
        toast.success('Switched to Business profile')
      } else {
        logger.debug('Creating new business profile...')
        const result = await createBusinessProfile({
          name: `${userName}'s Business`,
          gst_number: '',
          pan_number: ''
        })
        logger.debug('Create business profile result:', result)
        toast.success('Business profile created! Complete your details in profile.')
      }
      logger.debug('Switch successful, reloading page...')
      window.location.href = window.location.href
    } catch (error: any) {
      logger.error("Error switching profile", error)
      toast.error(error.message || "Failed to switch profile")
    } finally {
      setIsSwitching(false)
    }
  }

  // GUEST USER
  if (accountType === 'guest') {
    return (
      <div className="bg-white p-6 flex flex-col items-center justify-center border-b border-gray-100">
        <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <User className="h-12 w-12 text-gray-500" strokeWidth={2} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Guest User</h2>
        <p className="text-gray-500 text-center text-sm px-8 mb-6 leading-relaxed">
          Sign in to manage quotes & orders
        </p>

        {cta && (
          <div className="w-full space-y-3 px-2">
            {cta.primary && (
              <Link
                href={cta.primary.href}
                className="w-full flex items-center justify-center bg-[#FF4500] hover:bg-[#FF4500]/90 text-white font-bold h-12 rounded-lg uppercase tracking-wide transition-colors"
              >
                {cta.primary.label}
              </Link>
            )}
            {cta.secondary && (
              <Link
                href={cta.secondary.href}
                className="w-full flex items-center justify-center border border-[#FF4500] text-[#FF4500] bg-white hover:bg-orange-50 font-bold h-12 rounded-lg uppercase tracking-wide transition-colors"
              >
                {cta.secondary.label}
              </Link>
            )}
          </div>
        )}
      </div>
    )
  }

  // LOGGED IN USER (Individual or Business)
  const displayName = user?.name || 'User'
  const isBusinessAccount = accountType === 'business'
  const companyName = user?.companyName

  // Parse first and last name for initials
  const nameParts = displayName.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts[nameParts.length - 1] || ''

  return (
    <div className="bg-white p-6 flex flex-col items-center justify-center border-b border-gray-100">
      {/* Avatar */}
      {user?.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt={displayName}
          width={96}
          height={96}
          className="rounded-full mb-4"
        />
      ) : (
        <div className={cn(
          "h-24 w-24 rounded-full flex items-center justify-center mb-4",
          isBusinessAccount ? "bg-purple-600" : "bg-blue-600"
        )}>
          {isBusinessAccount ? (
            <Building2 className="h-12 w-12 text-white" strokeWidth={2} />
          ) : (
            <span className="text-3xl font-bold text-white">
              {getInitials(firstName, lastName)}
            </span>
          )}
        </div>
      )}

      {/* Name / Company Name */}
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        {isBusinessAccount && companyName ? companyName : displayName}
      </h2>

      {/* Email */}
      {user?.email && (
        <p className="text-gray-500 text-sm mb-3">{user.email}</p>
      )}

      {/* Account Type Badge & Verification Status */}
      <div className="flex items-center gap-2 mb-4">
        <span className={cn(
          'px-3 py-1 rounded-full text-xs font-medium',
          isBusinessAccount
            ? 'bg-purple-100 text-purple-700'
            : 'bg-blue-100 text-blue-700'
        )}>
          {isBusinessAccount ? 'Business Account' : 'Individual Account'}
        </span>

        {isBusinessAccount && (
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            isVerified
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
          )}>
            {isVerified ? '✓ Verified' : 'Verification Pending'}
          </span>
        )}
      </div>

      {/* CTA Button (if applicable) */}
      {cta?.primary && (
        <>
          {accountType === 'individual' ? (
            <button
              onClick={handleUpgradeToBusiness}
              disabled={isSwitching}
              className={cn(
                "w-full flex items-center justify-center font-medium h-11 rounded-lg transition-colors",
                "bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSwitching ? 'Switching...' : cta.primary.label}
            </button>
          ) : (
            <Link
              href={cta.primary.href}
              className={cn(
                "w-full flex items-center justify-center font-medium h-11 rounded-lg transition-colors",
                isBusinessAccount && !isVerified
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              )}
            >
              {cta.primary.label}
            </Link>
          )}
        </>
      )}
    </div>
  )
}

