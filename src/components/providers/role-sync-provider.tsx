"use client"

import { useRoleSync } from "@/lib/hooks"
import { useEffect } from "react"


export default function RoleSyncProvider({ children }: { children: React.ReactNode }) {
  const { isSyncing, isSynced, error } = useRoleSync()

  useEffect(() => {


    if (error) {
      console.warn("⚠️ Role sync failed (non-blocking):", error)
      console.log("✅ User profile synced to Supabase")
    }
    if (isSynced) {
      console.log("✅ Role synced successfully")
    }
  }, [error, isSynced])

  // Don't block rendering - sync happens in background
  return <>{children}</>
}
