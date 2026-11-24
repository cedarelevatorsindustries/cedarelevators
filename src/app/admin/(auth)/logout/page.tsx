'use client'

import { useEffect } from 'react'
import { performAdminLogout } from '@/lib/auth/admin-logout'

export default function AdminLogoutPage() {
  useEffect(() => {
    performAdminLogout()
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center text-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-lg">Logging out of administrator portal...</p>
      </div>
    </div>
  )
}
