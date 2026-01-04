"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { AuthSplitLayout, AccountTypeSelector } from "../components"

export default function ChooseTypeTemplate() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      // If user is authenticated and has account type, redirect to homepage
      if (user) {
        const accountType = user.unsafeMetadata?.accountType || user.publicMetadata?.accountType
        if (accountType) {
          router.push("/")
          return
        }
      }

      // User is authenticated but doesn't have account type - show selector
      // This happens after OTP verification or social login
      setIsCheckingAuth(false)
    }
  }, [isLoaded, user, router])

  const handleSelectType = async (type: "individual" | "business") => {
    // If user is not authenticated, redirect to appropriate signup page for manual signup
    if (!user) {
      router.push(type === "business" ? "/business-signup" : "/individual-signup")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Set account type in Clerk and sync to Supabase
      const response = await fetch("/api/auth/set-account-type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountType: type }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to set account type")
      }

      // Reload user to get updated metadata
      await user.reload()

      // Redirect to homepage
      router.push("/")
    } catch (err) {
      console.error("Error setting account type:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking authentication
  if (!isLoaded || isCheckingAuth) {
    return (
      <AuthSplitLayout
        illustrationImage="/images/auth-pannels/account-type-selection.png"
        illustrationAlt="Account type selection illustration"
        overlayTitle="Join Cedar Elevators"
        overlaySubtitle="Choose the account type that fits your needs"
        mobileBackgroundColor="orange"
      >
        <div className="flex items-center justify-center py-12">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[#F97316]"></div>
            <span>Loading...</span>
          </div>
        </div>
      </AuthSplitLayout>
    )
  }

  return (
    <AuthSplitLayout
      illustrationImage="/images/auth-pannels/account-type-selection.png"
      illustrationAlt="Account type selection illustration"
      overlayTitle="Join Cedar Elevators"
      overlaySubtitle="Choose the account type that fits your needs"
      mobileBackgroundColor="orange"
      contentClassName="max-w-4xl"
    >
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <AccountTypeSelector onSelectType={handleSelectType} disabled={isSubmitting} />
      {isSubmitting && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#F97316]"></div>
            <span>Setting up your account...</span>
          </div>
        </div>
      )}
    </AuthSplitLayout>
  )
}
