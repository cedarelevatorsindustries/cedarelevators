"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"


export function useRoleSync() {
  const { user, isLoaded } = useUser()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSynced, setIsSynced] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {


    // Only sync if user is loaded and logged in
    if (!isLoaded || !user || isSynced || isSyncing) {
      return
    }

    const syncRole = async () => {
      setIsSyncing(true)
      setError(null)

      try {
        const response = await fetch("/api/sync-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to sync role")
        }

        setIsSynced(true)
      } catch (err) {
        console.error("Role sync error:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsSyncing(false)
      }
    }

    syncRole()
  }, [user, isLoaded, isSynced, isSyncing])

  return {
    isSyncing,
    isSynced,
    error,
  }
}
