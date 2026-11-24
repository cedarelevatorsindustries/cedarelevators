'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldAlert, ArrowLeft, LogOut, Clock } from 'lucide-react'
import { performAdminLogout } from '@/lib/auth/admin-logout'

interface AdminAccessDeniedViewProps {
  type: 'unauthorized' | 'inactive'
  error?: string
  onSignOut?: () => void
}

export function AdminAccessDeniedView({ type, error, onSignOut }: AdminAccessDeniedViewProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await performAdminLogout({ onComplete: onSignOut })
  }

  const isInactive = type === 'inactive'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" data-testid="admin-access-denied-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo/cedar-logo.png"
            alt="Cedar Elevators"
            className="h-6 lg:h-8 w-auto"
          />
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-gray-600 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 rounded-xl transition-all duration-200 border border-gray-200 hover:border-orange-200"
        >
          <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4" />
          Back to Store
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isInactive ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
            }`}>
              {isInactive ? <Clock className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isInactive ? 'Account Pending Approval' : 'Access Denied'}
          </h2>

          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            {error || (
              isInactive
                ? 'Your administrator account has been created but is currently awaiting super-admin approval or has been deactivated.'
                : 'This account does not have administrator privileges to access the Cedar Elevators Admin Portal.'
            )}
          </p>

          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors shadow disabled:opacity-50 text-sm"
              data-testid="admin-access-denied-signout"
            >
              <LogOut className="w-4 h-4" />
              {isSigningOut ? 'Signing Out...' : 'Sign Out & Return to Login'}
            </button>

            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
            >
              Go to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
