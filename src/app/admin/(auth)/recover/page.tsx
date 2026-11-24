'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, AlertCircle, Shield, CheckCircle2, ArrowLeft, Key } from 'lucide-react'
import { adminRequestPasswordRecoveryAction, adminRecoveryAction } from '@/lib/actions/admin-auth'

export default function AdminRecoverPage() {
  const [mode, setMode] = useState<'email' | 'key'>('email')
  const [email, setEmail] = useState('')
  const [recoveryKey, setRecoveryKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setError('Please enter your administrator email address.')
      return
    }

    setIsLoading(true)

    try {
      const result = await adminRequestPasswordRecoveryAction(cleanEmail)

      if (result.success) {
        setSuccessMessage(result.message || 'Recovery instructions dispatched.')
      } else {
        setError(result.error || 'Failed to send recovery request.')
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !recoveryKey.trim()) {
      setError('Both email and recovery key are required.')
      return
    }

    setIsLoading(true)

    try {
      const result = await adminRecoveryAction(
        email.trim(),
        recoveryKey.replace(/-/g, '')
      )

      if (!result.success) {
        setError(result.error || 'Recovery failed with provided key.')
        return
      }

      setSuccessMessage(result.message || 'Recovery key verified. Password reset instructions have been dispatched to your email address.')
    } catch (err: any) {
      setError('An unexpected error occurred during key verification.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="admin-recover-screen">
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
          {/* Header Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-2 rounded-xl shadow-lg">
              <Shield className="w-5 h-5" />
              <span className="font-heading font-bold text-sm tracking-wide">ACCOUNT RECOVERY</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 lg:p-8 relative overflow-hidden">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Recover Admin Access
              </h1>
              <p className="text-sm text-gray-600">
                {mode === 'email'
                  ? 'Request a secure password reset link via Supabase Auth'
                  : 'Use your setup recovery key for emergency access'}
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => { setMode('email'); setError(''); setSuccessMessage(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === 'email'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Email Recovery
              </button>
              <button
                type="button"
                onClick={() => { setMode('key'); setError(''); setSuccessMessage(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === 'key'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Emergency Key
              </button>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div
                className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6"
                data-testid="admin-recover-success"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-800">Instructions Dispatched</p>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2 mb-6"
                data-testid="admin-recover-error"
              >
                <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800">{error}</p>
              </div>
            )}

            {/* Email Mode Form */}
            {mode === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-900 mb-2">
                    Administrator Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@cedarelevators.in"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-900"
                      required
                      disabled={isLoading}
                      data-testid="admin-recover-email"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    We'll send a time-limited password reset link to this address.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-heading font-bold text-sm tracking-wide hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                  data-testid="admin-recover-submit"
                >
                  {isLoading ? 'Sending Instructions...' : 'Send Password Reset Link'}
                </button>
              </form>
            ) : (
              /* Emergency Key Form */
              <form onSubmit={handleKeySubmit} className="space-y-4">
                <div>
                  <label htmlFor="key-email" className="block text-xs font-semibold text-gray-900 mb-2">
                    Super Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="key-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@cedarelevators.in"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-sm text-gray-900"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="recovery-key" className="block text-xs font-semibold text-gray-900 mb-2">
                    32-Character Recovery Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="recovery-key"
                      type="text"
                      value={recoveryKey}
                      onChange={(e) => setRecoveryKey(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-sm font-mono text-gray-900"
                      required
                      disabled={isLoading}
                      data-testid="admin-recover-key"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-heading font-bold text-sm tracking-wide hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Verifying Key...' : 'Verify Recovery Key'}
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <Link
                href="/admin"
                className="text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                ← Return to Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
