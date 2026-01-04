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

  useEffect(() => {
    if (isLoaded) {
      // If user is not authenticated, redirect to sign-in
      if (!user) {
        router.push("/sign-in")
        return
      }

      // If user is authenticated and has account type, redirect to homepage
      const accountType = user.unsafeMetadata?.accountType || user.publicMetadata?.accountType
      if (accountType) {
        router.push("/")
      }
    }
  }, [isLoaded, user, router])

  const handleSelectType = async (type: "individual" | "business") => {
    // User must be authenticated to select account type
    if (!user) {
      router.push("/sign-in")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Update role in Clerk
      const updateRoleResponse = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountType: type }),
      })

      if (!updateRoleResponse.ok) {
        const data = await updateRoleResponse.json()
        throw new Error(data.error || "Failed to update account type")
      }

      // Reload user to get updated metadata
      await user.reload()

      // Sync role to Supabase
      const syncResponse = await fetch("/api/sync-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!syncResponse.ok) {
        const syncData = await syncResponse.json()
        console.error("Failed to sync role to backend:", syncData.error)
        // Don't throw error here - user can still proceed
      }

      // Redirect to homepage
      router.push("/")
    } catch (err) {
      console.error("Error updating account type:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsSubmitting(false)
    }
  }

  return (
    <AuthSplitLayout
      illustrationImage="/images/auth-pannels/account-type-selection.png"
      illustrationAlt="Account type selection illustration"
      overlayTitle="Join Cedar Elevators"
      overlaySubtitle="Choose the account type that fits your needs"
      mobileBackgroundColor="orange"
    >
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <AccountTypeSelector onSelectType={handleSelectType} />
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

