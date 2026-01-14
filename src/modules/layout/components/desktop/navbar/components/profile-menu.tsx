"use client"

import { useState, useEffect, useRef } from "react"
import { User, FileText, LogOut, Building2, UserCircle } from "lucide-react"
import { useClerk } from "@clerk/nextjs"
import { useUser } from "@/lib/auth/client"
import LocalizedClientLink from "@/components/ui/localized-client-link"
import Image from "next/image"
import { toast } from "sonner"
import { logger } from "@/lib/services/logger"
import { cn } from "@/lib/utils"

interface ProfileMenuProps {
  isTransparent: boolean
  onHover?: () => void
}

export function ProfileMenu({ isTransparent, onHover }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const { signOut } = useClerk()
  const { user, clerkUser, switchProfile, createBusinessProfile } = useUser()

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (onHover) onHover()
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const avatarUrl = user?.imageUrl || clerkUser?.imageUrl
  const userName = user?.name || clerkUser?.fullName || clerkUser?.firstName || "User"

  const isIndividual = user?.activeProfile?.profile_type === 'individual'
  const isBusiness = user?.activeProfile?.profile_type === 'business'
  const hasBusinessProfile = user?.hasBusinessProfile
  const isVerified = isBusiness && user?.isVerified

  const handleSwitch = async () => {
    if (isSwitching) return

    console.log('=== PROFILE SWITCH DEBUG ===')
    console.log('Current user:', user)
    console.log('isBusiness:', isBusiness)
    console.log('isIndividual:', isIndividual)
    console.log('hasBusinessProfile:', hasBusinessProfile)
    console.log('userName:', userName)

    // ONE-WAY RESTRICTION: Cannot switch from business to individual
    if (isBusiness) {
      toast.error('Cannot switch back to individual account once you have switched to business.')
      return
    }

    setIsSwitching(true)
    try {
      logger.debug('Switching from individual to business...')
      // Switch to business (create if doesn't exist)
      if (hasBusinessProfile) {
        logger.debug('Business profile exists, switching...')
        await switchProfile('business')
        toast.success('Switched to Business profile')
      } else {
        logger.debug('Creating new business profile...')
        // Create business profile with minimal data
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

  return (
    <div
      className="relative"
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Profile button with conditional gold ring for verified business users */}
      <div className={cn(
        "rounded-full flex items-center justify-center",
        isVerified ? "p-[2px] bg-gradient-to-tr from-[#FDE047] via-[#F59E0B] to-[#D97706]" : ""
      )}>
        <button
          className={cn(
            "w-8 h-8 rounded-full overflow-hidden transition-all focus:outline-none",
            !isVerified && "border-2 hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            isVerified && "border-2 border-white" // Add white border between image and gradient
          )}
          aria-label="User menu"
          aria-expanded={isOpen}
          style={{
            borderColor: !isVerified && isTransparent ? 'rgba(255, 255, 255, 0.5)' : undefined
          }}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={userName}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 z-50">
          {/* Arrow/Tail */}
          <div className="absolute right-2 -top-2">
            <div className="w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45 shadow-lg" />
          </div>

          {/* Card content */}
          <div className="relative bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48">
            <LocalizedClientLink
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User size={16} />
              My Profile
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account/orders"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FileText size={16} />
              My Orders
            </LocalizedClientLink>

            {/* Simple Switch Button - Only show for individual users */}
            {isIndividual && (
              <>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  className="flex items-center gap-3 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors w-full text-left disabled:opacity-50"
                  onClick={handleSwitch}
                  disabled={isSwitching}
                >
                  <Building2 size={16} />
                  {isSwitching ? "Switching..." : "Switch to Business"}
                </button>
              </>
            )}
            <div className="border-t border-gray-200 my-1"></div>
            <button
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              onClick={() => {
                setIsOpen(false)
                signOut({ redirectUrl: '/sign-in' })
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

