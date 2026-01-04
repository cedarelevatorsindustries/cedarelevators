"use client"

import { useState } from "react"
import { useUser } from "@/lib/auth/client"
import { Building2, User, ChevronDown, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ProfileSwitcher() {
  const { user, isLoading, switchProfile, createBusinessProfile } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  if (isLoading || !user) {
    return null
  }

  const currentProfile = user.activeProfile?.profile_type || 'individual'

  const handleSwitch = async (profileType: 'individual' | 'business') => {
    // ONE-WAY RESTRICTION: Cannot switch from business to individual
    if (currentProfile === 'business' && profileType === 'individual') {
      toast.error('Cannot switch back to individual account once you have switched to business.')
      return
    }

    if (user.activeProfile?.profile_type === profileType) {
      setIsOpen(false)
      return
    }

    // Check if user has business profile
    if (profileType === 'business' && !user.hasBusinessProfile) {
      // Auto-create business profile
      setIsSwitching(true)
      try {
        const userName = user.name || user.email?.split('@')[0] || 'User'
        await createBusinessProfile({
          name: `${userName}'s Business`,
          gst_number: '',
          pan_number: ''
        })
        toast.success('Business profile created! Complete your details in profile.')
        setIsOpen(false)
        window.location.href = window.location.href
      } catch (error: any) {
        toast.error(error.message || 'Failed to create business profile')
      } finally {
        setIsSwitching(false)
      }
      return
    }

    setIsSwitching(true)
    try {
      await switchProfile(profileType)
      toast.success(`Switched to ${profileType} profile`)
      setIsOpen(false)
      window.location.href = window.location.href
    } catch (error: any) {
      toast.error(error.message || 'Failed to switch profile')
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => currentProfile !== 'business' && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 transition-colors ${currentProfile === 'business'
            ? 'bg-gray-50 cursor-default'
            : 'bg-white hover:bg-gray-50 cursor-pointer'
          }`}
        disabled={isSwitching}
      >
        {currentProfile === 'business' ? (
          <Building2 className="w-4 h-4 text-purple-600" />
        ) : (
          <User className="w-4 h-4 text-blue-600" />
        )}
        <span className="text-sm font-medium text-gray-700">
          {currentProfile === 'business' ? 'Business' : 'Individual'}
        </span>
        {user.isVerified && (
          <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
            Verified
          </span>
        )}
        {isSwitching ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : currentProfile !== 'business' ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : null}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Switch Profile
              </p>

              {/* Individual Profile */}
              <button
                onClick={() => handleSwitch('individual')}
                disabled={isSwitching}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${currentProfile === 'individual'
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <User className="w-4 h-4" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Individual</p>
                  <p className="text-xs text-gray-500">Personal account</p>
                </div>
                {currentProfile === 'individual' && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>

              {/* Business Profile */}
              <button
                onClick={() => handleSwitch('business')}
                disabled={isSwitching}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${currentProfile === 'business'
                  ? 'bg-purple-50 text-purple-700'
                  : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <Building2 className="w-4 h-4" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Business
                    {user.isVerified && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                        Verified
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.business?.name || 'Click to create'}
                  </p>
                </div>
                {currentProfile === 'business' && (
                  <Check className="w-4 h-4 text-purple-600" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

