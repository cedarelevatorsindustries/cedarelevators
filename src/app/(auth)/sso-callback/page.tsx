"use client"

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

export default function SSOCallback() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded) return

    // Wait for user to be loaded after OAuth completion
    if (user) {
      console.log("User loaded in SSO callback:", user.id)
      console.log("Created at:", user.createdAt)
      console.log("Last sign in at:", user.lastSignInAt)
      console.log("User metadata:", user.unsafeMetadata, user.publicMetadata)

      // Check if user has account type already set
      const accountType = user.unsafeMetadata?.accountType || user.publicMetadata?.accountType

      if (accountType) {
        // Existing user with account type - redirect to homepage
        console.log("Existing user with account type:", accountType, "- redirecting to homepage")
        router.push("/")
        return
      }

      // Check if this is a brand new user (first time signing up)
      const isNewUser = user.createdAt?.getTime() === user.lastSignInAt?.getTime()
      
      if (isNewUser) {
        // New user: First sign-up, redirect to choose-type page
        console.log("New user detected - redirecting to choose-type")
        router.push("/choose-type")
      } else {
        // Existing user but no account type set - redirect to choose-type
        console.log("Existing user without account type - redirecting to choose-type")
        router.push("/choose-type")
      }
    }
  }, [user, isLoaded, router])

  return (
    <>
      <AuthenticateWithRedirectCallback />
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#F97316]"></div>
            <span className="text-lg font-medium text-gray-700">Completing sign in...</span>
          </div>
          {/* Hidden CAPTCHA element to prevent console warning */}
          <div id="clerk-captcha" className="hidden"></div>
        </div>
      </div>
    </>
  )
}

