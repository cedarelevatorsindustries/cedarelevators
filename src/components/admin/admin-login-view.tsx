'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react'
import { BlurVignette, BlurVignetteArticle } from '@/components/ui/blur-vignette'
import { adminLoginAction } from '@/lib/actions/admin-auth'

interface AdminLoginViewProps {
  onLoginSuccess?: () => void
}

export function AdminLoginView({ onLoginSuccess }: AdminLoginViewProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const email = formData.email.trim()
    const password = formData.password

    if (!email) {
      setError('Please enter your administrator email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    setIsLoading(true)

    try {
      const result = await adminLoginAction(email, password)

      if (!result.success) {
        if (result.pending) {
          setError('Your administrator account is pending approval.')
          return
        }

        setError(result.error || 'Invalid email or password.')
        return
      }

      setIsSuccess(true)
      if (onLoginSuccess) {
        onLoginSuccess()
      } else {
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center selection:bg-orange-500 selection:text-white"
      style={{ backgroundColor: '#000000' }}
      data-testid="admin-login-screen"
    >
      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW (min-width: 768px): Un-dimmed video with BlurVignette     */}
      {/* ========================================================================= */}
      <div
        className="hidden md:flex min-h-screen w-full p-2 lg:p-3 items-stretch justify-between"
        style={{ backgroundColor: '#000000' }}
      >
        {/* Left Side: Video Showcase Card (No dimming, vibrant video) */}
        <div
          className="w-1/2 relative rounded-lg lg:rounded-xl overflow-hidden border border-zinc-800/70 shadow-2xl flex flex-col justify-between"
          style={{ minHeight: 'calc(100vh - 1rem)', backgroundColor: '#090a0c' }}
        >
          {/* Apple Vision Pro-style BlurVignette Wrapper without heavy dimming */}
          <BlurVignette
            radius="16px"
            inset="10px"
            transitionLength="100px"
            blur="15px"
            classname="w-full h-full overflow-hidden absolute inset-0"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover object-center transition-all hover:scale-105 duration-700 pointer-events-none"
            >
              <source src="/videos/auth/elevator-machinery-showcase.mp4" type="video/mp4" />
            </video>
            <BlurVignetteArticle />
          </BlurVignette>

          {/* Top Left: Increased Logo Size */}
          <div className="relative z-20 p-6 lg:p-8">
            <Link href="/" className="inline-block group">
              <img
                src="/logo/cedarelevators.webp"
                alt="Cedar Elevators"
                className="h-10 lg:h-12 w-auto object-contain brightness-125 drop-shadow-xl group-hover:opacity-90 transition-opacity"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/logo/cedarelevators.png'
                }}
              />
            </Link>
          </div>

          {/* Bottom-Aligned Minimal Brand Copy (Drop-shadow for legibility) */}
          <div className="relative z-20 p-6 lg:p-8 text-white flex flex-col justify-end">
            <h2 className="text-xl lg:text-2xl font-semibold tracking-tight text-white leading-tight max-w-md drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              Engineering Vertical Mobility.
            </h2>
            <p className="text-xs lg:text-sm text-zinc-200 mt-2 font-normal leading-relaxed max-w-md drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
              Precision components. Reliable solutions. Built for every journey.
            </p>
          </div>
        </div>

        {/* Right Side: Spacious Form directly on Black Background */}
        <div className="w-1/2 flex flex-col justify-between py-6 px-6 lg:px-14 xl:px-20 max-w-[560px] mx-auto">
          {/* Top Right: Subtle "Back to website" Link */}
          <div className="flex justify-end mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors py-1.5 px-3 rounded-md hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to website</span>
            </Link>
          </div>

          {/* Centered Form Workspace */}
          <div className="w-full max-w-[400px] mx-auto my-auto py-4">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-zinc-400 mt-2 font-normal">
                Sign in to access your administrative dashboard
              </p>
            </div>

            {/* Success Alert */}
            {isSuccess && (
              <div
                className="rounded-md p-3.5 flex items-start gap-2.5 mb-6 text-emerald-200 border"
                style={{ backgroundColor: 'rgba(6, 78, 59, 0.3)', borderColor: 'rgba(5, 150, 105, 0.4)' }}
                data-testid="admin-login-success"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-emerald-300">Authenticated Successfully</p>
                  <p className="text-xs text-emerald-400/90 mt-0.5">Opening admin workspace...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                className="rounded-md p-3.5 flex items-start gap-2.5 mb-6 text-red-200 border"
                style={{ backgroundColor: 'rgba(127, 29, 29, 0.3)', borderColor: 'rgba(220, 38, 38, 0.4)' }}
                data-testid="admin-login-error"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-red-300">Authentication Failed</p>
                  <p className="text-xs text-red-300/90 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Desktop Form with Spacious Input Padding */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Address */}
              <div>
                <label
                  htmlFor="desktop-email"
                  className="block text-xs font-medium text-zinc-300 mb-2"
                >
                  Email address <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    id="desktop-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@cedarelevators.in"
                    className="w-full h-12 pl-10 pr-4 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 border transition-all"
                    style={{ backgroundColor: '#0c0d0f', borderColor: '#202227' }}
                    required
                    disabled={isLoading || isSuccess}
                    data-testid="admin-login-email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="desktop-password"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Password <span className="text-orange-500">*</span>
                  </label>
                  <Link
                    href="/admin/recover"
                    className="text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors"
                    data-testid="admin-login-recovery-link"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    id="desktop-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full h-12 pl-10 pr-10 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 border transition-all"
                    style={{ backgroundColor: '#0c0d0f', borderColor: '#202227' }}
                    required
                    disabled={isLoading || isSuccess}
                    data-testid="admin-login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                    disabled={isLoading || isSuccess}
                    data-testid="admin-login-toggle-password"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Sign In Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full h-12 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-medium text-sm rounded-md transition duration-150 shadow-md shadow-orange-950/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  data-testid="admin-login-submit"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing in...
                    </span>
                  ) : isSuccess ? (
                    'Opening workspace...'
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Terms and Privacy Policy Note */}
            <div className="mt-8 pt-4 border-t border-zinc-900 text-center">
              <p className="text-[11px] text-zinc-500 font-normal leading-relaxed">
                By signing in, you agree to Cedar Elevators{' '}
                <Link
                  href="/terms"
                  className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="h-4" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE VIEW (below 768px): Light Frosted Glassmorphism Card            */}
      {/* ========================================================================= */}
      <div className="flex md:hidden min-h-screen w-full relative overflow-x-hidden flex-col justify-center items-center p-4 sm:p-6">
        {/* Full Viewport Un-Dimmed Video Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover object-center"
          >
            <source src="/videos/auth/elevator-machinery-showcase.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Top Center Logo (Outside the card, no manual duplicate typography) */}
        <div className="relative z-10 flex flex-col items-center justify-center mb-5">
          <Link href="/" className="inline-block group">
            <img
              src="/logo/cedarelevators.webp"
              alt="Cedar Elevators"
              className="h-10 w-auto object-contain brightness-125 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/logo/cedarelevators.png'
              }}
            />
          </Link>
        </div>

        {/* Centered Floating Light Frosted Glass Card */}
        <div
          className="relative z-10 w-full max-w-[400px] rounded-xl p-6 sm:p-7 shadow-2xl border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.74)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: 'rgba(255, 255, 255, 0.65)',
            boxShadow: '0 24px 48px -12px rgba(0,0,0,0.35), 0 0 1px 1px rgba(255,255,255,0.85) inset'
          }}
        >
          {/* Header Row: Back Link */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Admin Portal
            </span>
            <Link
              href="/"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to website</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-zinc-600 mt-1 font-normal">
              Sign in to your admin workspace
            </p>
          </div>

          {/* Success Notification */}
          {isSuccess && (
            <div
              className="rounded-md p-3 flex items-start gap-2 mb-4 bg-emerald-100/90 border border-emerald-400 text-emerald-900"
              data-testid="admin-login-success"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-900">Authenticated Successfully</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Opening admin workspace...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className="rounded-md p-3 flex items-start gap-2 mb-4 bg-red-100/90 border border-red-400 text-red-900"
              data-testid="admin-login-error"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-900">Authentication Failed</p>
                <p className="text-[11px] text-red-800 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Mobile Form with Light Frosted Inputs & Crisp Radii */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label
                htmlFor="mobile-email"
                className="block text-xs font-medium text-zinc-800 mb-1.5"
              >
                Email address <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="mobile-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@cedarelevators.in"
                  className="w-full h-11 pl-10 pr-4 rounded-md text-sm text-zinc-900 placeholder-zinc-500 border border-zinc-300/80 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.88)',
                    outline: 'none'
                  }}
                  required
                  disabled={isLoading || isSuccess}
                  data-testid="admin-login-email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="mobile-password"
                  className="block text-xs font-medium text-zinc-800"
                >
                  Password <span className="text-orange-600">*</span>
                </label>
                <Link
                  href="/admin/recover"
                  className="text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  data-testid="admin-login-recovery-link"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="mobile-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full h-11 pl-10 pr-10 rounded-md text-sm text-zinc-900 placeholder-zinc-500 border border-zinc-300/80 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.88)',
                    outline: 'none'
                  }}
                  required
                  disabled={isLoading || isSuccess}
                  data-testid="admin-login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-800 transition-colors p-1"
                  disabled={isLoading || isSuccess}
                  data-testid="admin-login-toggle-password"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mobile Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full h-11 mt-2 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-medium text-sm rounded-md transition duration-150 shadow-md shadow-orange-950/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              data-testid="admin-login-submit"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : isSuccess ? (
                'Opening workspace...'
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Terms & Privacy Note */}
          <p className="text-center text-[11px] text-zinc-600 mt-5 font-normal leading-relaxed">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-zinc-900 font-medium hover:text-orange-600 underline transition-colors">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-zinc-900 font-medium hover:text-orange-600 underline transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
