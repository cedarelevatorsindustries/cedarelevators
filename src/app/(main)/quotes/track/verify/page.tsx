'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Loader2, ArrowLeft, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { QuotationPageShell } from '@/modules/quote/components/shared/quotation-page-shell'
import { maskEmailAddress } from '@/modules/quote/components/shared/quote-confirmation-storage'

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email')?.trim().toLowerCase() || ''

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  // Initialize resend cooldown cleanly from recent request timestamp
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = sessionStorage.getItem('cedar_otp_cooldown_until')
      if (raw) {
        const remaining = Math.ceil((parseInt(raw, 10) - Date.now()) / 1000)
        if (remaining > 0 && remaining <= 120) {
          setCooldownSeconds(remaining)
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [])

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 1 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownSeconds])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    const cleanCode = code.trim()

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter a valid email address.')
      return
    }
    if (!/^\d{6}$/.test(cleanCode)) {
      setFormError('Please enter the 6-digit verification code.')
      return
    }

    setFormError(null)
    setIsVerifying(true)
    try {
      const res = await fetch('/api/quotes/track/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        const msg = data.error || 'Verification code is invalid or expired.'
        setFormError(msg)
        toast.error(msg)
        return
      }
      toast.success('Email verified')
      router.push('/quotes/track')
      router.refresh()
    } catch {
      const msg = 'Network error while verifying code. Please try again.'
      setFormError(msg)
      toast.error(msg)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      setFormError('Enter your email address first.')
      return
    }
    if (cooldownSeconds > 0 || isResending) return

    setFormError(null)
    setIsResending(true)
    try {
      const res = await fetch('/api/quotes/track/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        const retrySecs =
          typeof data.retryAfterSeconds === 'number' && data.retryAfterSeconds > 0
            ? Math.min(300, data.retryAfterSeconds)
            : 60
        if (res.status === 429) {
          setCooldownSeconds(retrySecs)
        }
        const msg = data.error || 'Could not resend verification code right now.'
        setFormError(msg)
        toast.error(msg)
        return
      }

      setCooldownSeconds(60)
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('cedar_otp_cooldown_until', String(Date.now() + 60 * 1000))
        } catch {
          // Ignore storage limitations
        }
      }
      toast.success('A new verification code has been sent if an active mailbox matches.')
    } catch {
      toast.error('Network error while resending code.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <QuotationPageShell maxWidth="narrow">
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_1px_2px_rgba(17,24,39,0.04)] p-6 sm:p-8 space-y-6">
        <Link
          href="/quotes/track"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Use another email</span>
        </Link>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200/70 flex items-center justify-center mx-auto text-orange-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="type-eyebrow text-orange-600 pt-1">Verification</p>
          <h1 className="type-subsection text-gray-900">Verify Your Email</h1>
          <p className="type-body-sm text-gray-600">
            Enter the 6-digit verification code sent to{' '}
            <span className="text-gray-900">{maskEmailAddress(email)}</span>.
          </p>
        </div>

        <form onSubmit={handleVerify} noValidate className="space-y-4">
          {!initialEmail && (
            <div>
              <label htmlFor="verify-email" className="block text-sm text-gray-800 mb-1.5">
                Email Address
              </label>
              <input
                id="verify-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
              />
            </div>
          )}

          <div>
            <label htmlFor="otp-code" className="block text-sm text-gray-800 mb-1.5">
              Verification Code
            </label>
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                if (formError) setFormError(null)
              }}
              placeholder="000000"
              aria-invalid={Boolean(formError)}
              className={`w-full px-4 py-3 bg-white border rounded-lg text-center text-2xl font-mono tracking-[0.4em] text-gray-900 placeholder:text-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-colors ${
                formError ? 'border-red-400' : 'border-gray-300'
              }`}
            />
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 flex items-start gap-2 text-xs text-red-700"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full min-h-[44px] py-2.5 px-5 bg-[#FF5A1F] hover:bg-[#e54e18] text-white rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify Email</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || cooldownSeconds > 0}
            className="text-xs sm:text-sm text-orange-600 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed transition-colors"
          >
            {isResending
              ? 'Sending verification code...'
              : cooldownSeconds > 0
                ? `Resend Code in ${cooldownSeconds}s`
                : 'Resend Code'}
          </button>
        </div>
      </div>
    </QuotationPageShell>
  )
}

export default function VerifyGuestQuotePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF9] pt-24 pb-16 px-4 flex justify-center">
          <div className="max-w-[540px] w-full h-80 rounded-2xl bg-white border border-gray-200 animate-pulse" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  )
}
