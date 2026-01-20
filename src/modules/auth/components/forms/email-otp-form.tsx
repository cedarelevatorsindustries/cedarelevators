"use client"

import { useState } from "react"
import { useSignUp } from "@/lib/auth/client"
import { useRouter } from "next/navigation"
import { Mail } from "lucide-react"

type Props = {
  email: string
}

export default function EmailOTPForm({ email }: Props) {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [code, setCode] = useState("")
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/")
      } else {
        setError("Verification failed. Please try again.")
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setError(err.errors[0].longMessage)
    }
  }

  const handleResend = async () => {
    if (!isLoaded) return
    setResending(true)
    setResendMessage("")
    setError(null)

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setResendMessage("OTP sent! Check your email.")
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setResendMessage(err.errors[0].longMessage)
    }

    setResending(false)
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail size={32} className="text-[#2D5BFF]" />
        </div>
        <h2 className="text-gray-900 text-3xl font-bold leading-tight tracking-tight">
          Verify Your Email
        </h2>
        <p className="text-gray-600 text-sm font-normal leading-normal">
          We sent a 6-digit code to
        </p>
        <p className="text-gray-900 text-base font-semibold">
          {email}
        </p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col w-full">
          <label className="text-gray-900 text-sm font-medium leading-normal mb-2">
            Enter OTP Code
          </label>
          <input
            type="text"
            name="token"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            required
            maxLength={6}
            pattern="[0-9]{6}"
            autoComplete="one-time-code"
            className="w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#2D5BFF]/50 border border-gray-300 bg-white focus:border-[#2D5BFF] h-14 placeholder:text-gray-500 px-4 text-center tracking-[0.5em] text-2xl font-bold"
          />
          <p className="text-xs text-gray-500 mt-2">
            Enter the 6-digit code from your email
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className={`p-3 rounded-lg text-sm ${resendMessage.includes("error") || resendMessage.includes("Error")
            ? "bg-red-50 text-red-600"
            : "bg-green-50 text-green-600"
            }`}>
            {resendMessage}
          </div>
        )}

        <button
          type="submit"
          className="flex w-full h-12 items-center justify-center rounded-lg bg-[#2D5BFF] px-6 text-base font-medium text-white shadow-sm transition-colors hover:bg-[#2D5BFF]/90 focus:outline-none focus:ring-2 focus:ring-[#2D5BFF] focus:ring-offset-2"
        >
          Verify & Continue
        </button>
      </form>

      {/* Resend OTP */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-medium text-[#2D5BFF] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? "Sending..." : "Resend OTP"}
          </button>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          You can request a new code every 60 seconds
        </p>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> Check your spam folder if you don't see the email. The code expires in 10 minutes.
        </p>
      </div>
    </div>
  )
}

