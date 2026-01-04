"use client"

import { useAccountType } from "@/lib/hooks"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface IndividualOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function IndividualOnly({ 
  children, 
  fallback = null,
  redirectTo 
}: IndividualOnlyProps) {
  const { isIndividual, isLoaded } = useAccountType()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isIndividual && redirectTo) {
      router.push(redirectTo)
    }
  }, [isLoaded, isIndividual, redirectTo, router])

  if (!isLoaded) {
    return null
  }

  if (!isIndividual) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

