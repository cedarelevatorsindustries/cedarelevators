"use client"

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"

export default function SSOCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()
  const [isProcessing, setIsProcessing] = useState(false)
  const [callbackComplete, setCallbackComplete] = useState(false)

  // Handle the OAuth callback completion
  useEffect(() => {
    console.log("SSO Callback mounted")
    // Give the AuthenticateWithRedirectCallback component time to process
    const timer = setTimeout(() => {
      console.log("Callback processing window complete")
      setCallbackComplete(true)
    }, 2000) // Wait 2 seconds for callback to process

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Don't process until callback has had time to complete
    if (!callbackComplete || !isLoaded || isProcessing) {
      console.log("Waiting for callback:", { callbackComplete, isLoaded, isProcessing })
      return
    }

    // Wait for user to be loaded after OAuth completion
    if (user) {
      setIsProcessing(true)
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

      // Check for account type from URL params first (most reliable), then sessionStorage (fallback)
      const accountTypeFromUrl = searchParams.get('accountType')
      const pendingAccountType = accountTypeFromUrl || sessionStorage.getItem('pendingAccountType')

      console.log("Account type from URL:", accountTypeFromUrl)
      console.log("Account type from sessionStorage:", sessionStorage.getItem('pendingAccountType'))
      console.log("Final pending account type:", pendingAccountType)

      if (pendingAccountType) {
        console.log("Pending account type found:", pendingAccountType)
        // Clear the pending account type immediately
        sessionStorage.removeItem('pendingAccountType')

        // Set the account type via API
        const setAccountType = async () => {
          try {
            const response = await fetch("/api/auth/set-account-type", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ accountType: pendingAccountType }),
            })

            if (!response.ok) {
              const data = await response.json()
              throw new Error(data.error || "Failed to set account type")
            }

            console.log("Account type set successfully, redirecting to homepage")
            // Redirect immediately without waiting for user reload
            router.push("/")
          } catch (error) {
            console.error("Error setting account type:", error)
            // Even on error, redirect to choose-type instead of staying stuck
            router.push("/choose-type")
          }
        }

        setAccountType()
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
  }, [user, isLoaded, router, isProcessing, callbackComplete])

  // Fallback timeout - if stuck loading for more than 60 seconds, redirect to choose-type
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn("SSO callback timeout - isLoaded:", isLoaded, "user:", user?.id, "callbackComplete:", callbackComplete)
      if (!user && isLoaded && callbackComplete) {
        console.warn("SSO callback timeout - redirecting to choose-type")
        router.push("/choose-type")
      }
    }, 60000) // 60 second timeout (increased from 30)

    return () => clearTimeout(timeout)
  }, [user, isLoaded, router, callbackComplete])

  // Log state changes for debugging
  useEffect(() => {
    console.log("SSO Callback State:", { isLoaded, hasUser: !!user, userId: user?.id, isProcessing, callbackComplete })
  }, [isLoaded, user, isProcessing, callbackComplete])

  return (
    <>
      <AuthenticateWithRedirectCallback
        continueSignUpUrl="/sso-callback"
        signUpFallbackRedirectUrl="/sso-callback"
      />
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

