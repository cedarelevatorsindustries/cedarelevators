"use client"

import { useState } from "react"
import { useSignIn } from "@/lib/auth/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordForm() {
  const { isLoaded, signIn } = useSignIn()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })
      setIsSubmitted(true)
      // Optional: redirect immediately or let user read the message
      // router.push("/auth/reset-password") 
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setError(err.errors[0].longMessage)
    }
  }

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md flex flex-col gap-6 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-gray-900 text-3xl font-bold mb-2">Check Your Email</h2>
          <p className="text-gray-600">
            We've sent a password reset code to <strong>{email}</strong>
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/reset-password"
            className="w-full flex items-center justify-center rounded-lg bg-[#2D5BFF] px-6 h-12 text-base font-medium text-white shadow-sm hover:bg-[#2D5BFF]/90"
          >
            Enter Code & Reset Password
          </Link>
          <Link href="/sign-in" className="text-[#1E3A8A] hover:underline text-base font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-gray-900 text-3xl font-bold leading-tight tracking-tight">
          Forgot Password?
        </h2>
        <p className="text-gray-600 text-sm font-normal leading-normal">
          Enter your email and we'll send you a reset code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}
        <div className="flex flex-col w-full">
          <label className="text-gray-900 text-sm font-medium leading-normal mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="w-full rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D5BFF]/50 border border-gray-300 bg-white focus:border-[#2D5BFF] h-12 placeholder:text-gray-500 px-4 text-base font-normal leading-normal"
          />
        </div>

        <button
          type="submit"
          className="flex h-12 items-center justify-center rounded-lg bg-[#2D5BFF] px-6 text-base font-medium text-white shadow-sm hover:bg-[#2D5BFF]/90 focus:outline-none focus:ring-2 focus:ring-[#2D5BFF] focus:ring-offset-2"
        >
          Send Reset Code
        </button>
      </form>

      <div className="text-center">
        <Link
          href="/sign-in"
          className="flex items-center justify-center gap-2 text-[#2D5BFF] hover:underline text-sm font-medium leading-normal"
        >
          <ArrowLeft size={18} />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  )
}

