"use client"

import { useRoleSync } from "@/lib/hooks"
import { useEffect } from "react"
import { isDemoMode } from "@/lib/data/demo/config"

export default function RoleSyncProvider({ children }: { children: React.ReactNode }) {
  const { isSyncing, isSynced, error } = useRoleSync()

  useEffect(() => {
    if (isDemoMode()) {
      console.log("🚀 Running in DEMO MODE - Medusa sync disabled")
      return
    }

    if (error) {
      console.warn("⚠️ Role sync failed (non-blocking):", error)
      console.log("💡 Make sure Medusa backend is running on http://localhost:9000")
    }
    if (isSynced) {
      console.log("✅ Role synced successfully")
    }
  }, [error, isSynced])

  // Don't block rendering - sync happens in background
  return <>{children}</>
}
