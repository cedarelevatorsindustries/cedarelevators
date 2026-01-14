"use client"

import Image from "next/image"
import { User } from "lucide-react"
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { useUser } from "@/lib/auth/client"
import { cn } from "@/lib/utils"

interface SidebarHeaderProps {
  isLoggedIn: boolean
  userName: string
  onClose: () => void
}

export function SidebarHeader({ isLoggedIn, userName, onClose }: SidebarHeaderProps) {
  const { user } = useUser()
  const isBusiness = user?.userType === 'business' || user?.activeProfile?.profile_type === 'business'
  const isVerified = isBusiness && user?.isVerified

  if (isLoggedIn || user) {
    return (
      <div className="px-4 py-4 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-full flex items-center justify-center",
              isVerified ? "p-[2px] bg-gradient-to-tr from-[#FDE047] via-[#F59E0B] to-[#D97706]" : ""
            )}>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: cn("w-12 h-12", isVerified && "border-2 border-white")
                  }
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {user?.name || userName}
              </h3>
              <p className="text-sm text-gray-600">
                {user?.email || "john@company.com"}
              </p>
            </div>
          </div>
          <Image
            src="/logo/CEIicon.png"
            alt="Cedar Elevators Industries"
            width={32}
            height={32}
            className="w-8 h-8"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 bg-blue-50 border-b border-gray-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <User size={20} className="text-blue-600" />
          <SignInButton mode="modal">
            <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors font-medium">
              Login
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors font-medium">
              Sign Up
            </button>
          </SignUpButton>
        </div>
        <Image
          src="/logo/CEIicon.png"
          alt="Cedar Elevators Industries"
          width={32}
          height={32}
          className="w-8 h-8"
        />
      </div>
    </div>
  )
}

