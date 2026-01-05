"use client"

import { useState } from "react"
import { useSignIn } from "@/lib/auth/client"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Check } from "lucide-react"
import { logger } from "@/lib/services/logger"

export default function ResetPasswordForm() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const requirements = [
    { label: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
    { label: "One uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: "One number", test: (pwd: string) => /[0-9]/.test(pwd) },
    { label: "One special character", test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd) },
  ]

  const getPasswordStrength = (pwd: string) => {
    return requirements.filter((req) => req.test(pwd)).length
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/sign-in")
      } else {
        logger.error('Password reset prompt failed', result)
      }
    } catch (err: any) {
      logger.error("Password reset error", err)
      setError(err.errors?.[0]?.longMessage || "An error occurred")
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-gray-900 text-3xl font-bold leading-tight tracking-tight">
          Reset Your Password
        </h2>
        <p className="text-gray-600 text-sm font-normal leading-normal">
          Enter the code from your email and your new password.
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
            Reset Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              const value = e.target.value
              if (value === "" || (/^\d+$/.test(value) && value.length <= 6)) {
                setCode(value)
              }
            }}
            placeholder="Enter 6-digit code"
            required
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            className="w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#2D5BFF]/50 border border-gray-300 bg-white focus:border-[#2D5BFF] h-12 placeholder:text-gray-500 px-4 text-base font-normal leading-normal tracking-widest text-center font-semibold"
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="text-gray-900 text-sm font-medium leading-normal mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              className="w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#2D5BFF]/50 border border-gray-300 bg-white focus:border-[#2D5BFF] h-12 placeholder:text-gray-500 px-4 pr-12 text-base font-normal leading-normal"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 pr-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {password && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-6 justify-between">
              <p className="text-gray-900 text-sm font-medium leading-normal">
                Password Strength
              </p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full flex-1 ${index < passwordStrength
                    ? strengthColors[passwordStrength - 1]
                    : "bg-gray-200"
                    }`}
                ></div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col w-full">
          <label className="text-gray-900 text-sm font-medium leading-normal mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#2D5BFF]/50 border border-gray-300 bg-white focus:border-[#2D5BFF] h-12 placeholder:text-gray-500 px-4 pr-12 text-base font-normal leading-normal"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 pr-3 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-2">
          {requirements.map((req, index) => (
            <label key={index} className="flex items-center gap-x-3 py-1">
              <div
                className={`h-5 w-5 rounded border-2 flex items-center justify-center ${req.test(password)
                  ? "bg-[#1E3A8A] border-[#1E3A8A]"
                  : "border-gray-300 bg-transparent"
                  }`}
              >
                {req.test(password) && <Check size={14} className="text-white" />}
              </div>
              <p className="text-gray-900 text-sm font-normal leading-normal">
                {req.label}
              </p>
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="w-full mt-2 flex items-center justify-center rounded-lg bg-[#2D5BFF] px-6 h-12 text-base font-medium text-white shadow-sm hover:bg-[#2D5BFF]/90 focus:outline-none focus:ring-2 focus:ring-[#2D5BFF] focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Reset Password
        </button>
      </form>
    </div>
  )
}

