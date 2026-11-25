'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !/^\d{6}$/.test(code.trim())) {
      toast.error('Enter your email and the 6-digit verification code')
      return
    }

    setIsVerifying(true)
    try {
      const res = await fetch('/api/quotes/track/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Invalid or expired verification code')
        return
      }
      toast.success('Email verified successfully')
      router.push('/quotes/track')
      router.refresh()
    } catch {
      toast.error('Network error during verification')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error('Enter your email address first')
      return
    }
    setIsResending(true)
    try {
      const res = await fetch('/api/quotes/track/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Could not resend code')
        return
      }
      toast.success('A new verification code has been sent')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4 flex justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-sm h-fit space-y-6">
        <Link
          href="/quotes/track"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Change Email
        </Link>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto text-orange-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Enter Verification Code</h1>
          <p className="text-sm text-gray-600">
            Enter the 6-digit code sent to <strong className="text-gray-900">{email || 'your email'}</strong>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          {!initialEmail && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          <div>
            <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700 mb-1.5">
              6-Digit Code
            </label>
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-center text-2xl font-mono font-bold tracking-[0.4em] focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <Button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              'Verify & View Quotations'
            )}
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-xs text-orange-600 hover:underline font-medium disabled:opacity-50"
          >
            {isResending ? 'Sending new code...' : 'Didn’t receive the code? Resend'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VerifyGuestQuotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <VerifyOtpContent />
    </Suspense>
  )
}
