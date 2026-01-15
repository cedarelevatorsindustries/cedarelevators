"use client"

import { useUser } from "@clerk/nextjs"

export type AccountType = "individual" | "business"

export function useAccountType() {
  const { user, isLoaded } = useUser()

  const accountType = (user?.unsafeMetadata?.accountType as AccountType) || "individual"
  const isBusiness = accountType === "business"
  const isIndividual = accountType === "individual" || !accountType
  const isGuest = !user

  const companyName = user?.unsafeMetadata?.company as string | undefined

  console.log('[useAccountType] Debug:', {
    isLoaded,
    userExists: !!user,
    unsafeMetadata: user?.unsafeMetadata,
    accountType,
    isBusiness,
    isIndividual,
    isGuest
  })

  return {
    accountType,
    isBusiness,
    isIndividual,
    isGuest,
    isLoaded,
    companyName,
    user,
  }
}

