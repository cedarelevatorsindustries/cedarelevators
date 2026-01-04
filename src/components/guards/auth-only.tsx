"use client"

import { useAccountType } from "@/lib/hooks"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function AuthOnly({ 
  children, 
  fallback = null,
  redirectTo = "/sign-in"
}: AuthOnlyProps) {
  const { isGuest, isLoaded } = useAccountType()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isGuest && redirectTo) {
      router.push(redirectTo)
    }
  }, [isLoaded, isGuest, redirectTo, router])

  if (!isLoaded) {
    return null
  }

  if (isGuest) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

