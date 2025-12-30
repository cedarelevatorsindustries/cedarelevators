"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"

export default function SettingsLandingPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/settings/general')
  }, [router])

  return (
    <div className="flex items-center justify-center py-12">
      <LoaderCircle className="h-8 w-8 animate-spin text-orange-600" />
    </div>
  )
}
