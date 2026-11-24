'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, AlertCircle, Shield, CheckCircle2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { adminResetPasswordAction } from '@/lib/actions/admin-auth'

export default function AdminResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const verifyRecoverySession = async () => {
      // Check if code param is present for PKCE exchange
      const code = searchParams.get('code')
      if (code) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            console.warn('[reset-password] Client code exchange error:', exchangeError.message)
          }
        } catch (err) {
          console.warn('[reset-password] Code exchange exception:', err)
        }
      }

      // Check current user session
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (user && !userError) {
        setHasValidSession(true)
      } else {
        setHasValidSession(false)
      }

      setIsCheckingSession(false)
    }

    verifyRecoverySession()

    // Listen for auth state events like PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && session.user)) {
        setHasValidSession(true)
        setIsCheckingSession(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [searchParams, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('Please enter a new password.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.')
      return
    }

    setIsLoading(true)

    try {
      const result = await adminResetPasswordAction(password)

      if (!result.success) {
        setError(result.error || 'Failed to update password. Please try again.')
        return
      }

      setIsSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="admin-reset-password-screen">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between p-4 lg:p-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo/cedar-logo.png"
            alt="Cedar Elevators"
            className="h-6 lg:h-8 w-auto"
          />
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-gray-600 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 rounded-xl transition-all duration-200 border border-gray-200 hover:border-orange-200"
        >
          <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4" />
          Back to Admin Login
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
        <div className="w-full max-w-md">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-2 rounded-xl shadow-lg">
              <Shield className="w-5 h-5" />
              <span className="font-heading font-bold text-sm tracking-wide">ADMIN SECURITY</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 lg:p-8 relative overflow-hidden">
            {isCheckingSession ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Verifying password recovery session...</p>
              </div>
            ) : isSuccess ? (
              /* Success View */
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Your administrator password has been updated. You can now sign in using your new credentials.
                </p>
                <Link
                  href="/admin"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-heading font-bold text-sm rounded-xl transition-colors shadow-lg hover:shadow-xl"
                  data-testid="admin-reset-success-login"
                >
                  Sign In to Admin Dashboard
                </Link>
              </div>
            ) : !hasValidSession ? (
              /* Invalid or Expired Session */
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h2>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  This password recovery link is invalid, incomplete, or has already expired. Password reset links are time-limited for security.
                </p>
                <div className="space-y-3">
                  <Link
                    href="/admin/recover"
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-heading font-bold text-sm rounded-xl transition-colors shadow-lg hover:shadow-xl"
                    data-testid="admin-request-new-link"
                  >
                    Request a New Recovery Link
                  </Link>
                  <Link
                    href="/admin"
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            ) : (
              /* Active Reset Form */
              <div>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Set New Password</h1>
                  <p className="text-sm text-gray-600">
                    Create a strong password for your administrator account.
                  </p>
                </div>

                {error && (
                  <div
                    className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2 mb-4"
                    data-testid="admin-reset-error"
                  >
                    <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-xs font-semibold text-gray-900 mb-2"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 text-sm text-gray-900"
                        required
                        disabled={isLoading}
                        data-testid="admin-reset-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-xs font-semibold text-gray-900 mb-2"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new password"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 text-sm text-gray-900"
                        required
                        disabled={isLoading}
                        data-testid="admin-reset-confirm-input"
                      />
                    </div>
                  </div>

                  {/* Requirements checklist */}
                  <div className="text-xs text-gray-500 space-y-1 pt-1">
                    <p className={password.length >= 8 ? 'text-emerald-600 font-medium' : 'text-gray-500'}>
                      • Minimum 8 characters
                    </p>
                    <p className={password && password === confirmPassword ? 'text-emerald-600 font-medium' : 'text-gray-500'}>
                      • Passwords must match
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || password.length < 8 || password !== confirmPassword}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-heading font-bold text-sm tracking-wide hover:from-orange-700 hover:to-orange-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    data-testid="admin-reset-submit"
                  >
                    {isLoading ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
