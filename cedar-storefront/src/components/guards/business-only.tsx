"use client"

import { useAccountType } from "@/lib/hooks"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface BusinessOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function BusinessOnly({ 
  children, 
  fallback = null,
  redirectTo 
}: BusinessOnlyProps) {
  const { isBusiness, isLoaded } = useAccountType()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isBusiness && redirectTo) {
      router.push(redirectTo)
    }
  }, [isLoaded, isBusiness, redirectTo, router])

  if (!isLoaded) {
    return null
  }

  if (!isBusiness) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
