"use client"

import Image from "next/image"
import { User } from "lucide-react"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"

interface SidebarHeaderProps {
  isLoggedIn: boolean
  userName: string
  onClose: () => void
}

export function SidebarHeader({ isLoggedIn, userName, onClose }: SidebarHeaderProps) {
  const { user } = useUser()

  if (isLoggedIn || user) {
    return (
      <div className="px-4 py-4 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-12 h-12"
                }
              }}
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {user?.fullName || userName}
              </h3>
              <p className="text-sm text-gray-600">
                {user?.primaryEmailAddress?.emailAddress || "john@company.com"}
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

