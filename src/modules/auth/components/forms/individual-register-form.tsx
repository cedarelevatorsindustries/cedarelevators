"use client"

import { useState } from "react"
import { useSignUp } from "@/lib/auth/client"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { PasswordStrengthIndicator } from "../password-strength-indicator"

export default function IndividualRegisterForm() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          accountType: "individual",
        },
      })

      // Prepare email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })

      // Redirect to verification page
      window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setError(err.errors?.[0]?.longMessage || "An error occurred during registration")
    }
  }

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return

    console.log("Starting Google OAuth flow...")

    try {
      // Store intended account type in session storage for SSO callback
      sessionStorage.setItem('pendingAccountType', 'individual')

      console.log("Initiating OAuth redirect...")
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/sso-callback",
      })
    } catch (err: any) {
      console.error("Google OAuth error:", err)
      setError(err.errors ? err.errors[0].longMessage : "An error occurred")
    }
  }

  return (
    <div className="flex w-full flex-col items-stretch justify-center">
      {/* Progress */}
      <div className="pb-3 pt-1">
        <p className="text-gray-500 text-sm font-normal leading-normal">
          Step 1 of 2: Your Details
        </p>
      </div>

      {/* Header */}
      <div className="pb-6">
        <h2 className="text-gray-900 text-3xl font-bold leading-tight tracking-tight">
          Create Individual Account
        </h2>
        <p className="text-gray-600 text-sm font-normal leading-normal mt-2">
          Join Cedar Elevators Industries
        </p>
      </div>

      {/* Social Sign Up */}
      <div className="flex flex-col gap-3 py-3">
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-5 text-base font-bold text-gray-800 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M22.5777 12.2599C22.5777 11.4599 22.5077 10.6599 22.3677 9.8999H12.2178V14.3399H18.1578C17.8878 15.8699 17.0678 17.1399 15.8178 17.9699V20.8199H19.6878C21.6178 19.0199 22.5777 15.9399 22.5777 12.2599Z" fill="#4285F4" />
            <path d="M12.2178 23.0001C15.2578 23.0001 17.8378 22.0101 19.6878 20.8201L15.8178 17.9701C14.7978 18.6601 13.5978 19.0501 12.2178 19.0501C9.62779 19.0501 7.42779 17.3901 6.57779 15.0801L2.58779 15.0801V17.9901C4.43779 21.0301 8.02779 23.0001 12.2178 23.0001Z" fill="#34A853" />
            <path d="M6.57779 15.08C6.34779 14.39 6.21779 13.65 6.21779 12.9C6.21779 12.15 6.34779 11.41 6.57779 10.72V7.81L2.58779 7.81C1.72779 9.53 1.21779 11.14 1.21779 12.9C1.21779 14.66 1.72779 16.27 2.58779 17.99L6.57779 15.08Z" fill="#FBBC05" />
            <path d="M12.2178 6.74994C13.7278 6.72994 15.1578 7.25994 16.2278 8.27994L19.7578 4.74994C17.8278 2.97994 15.2578 1.79994 12.2178 1.79994C8.02779 1.79994 4.43779 3.76994 2.58779 6.80994L6.57779 9.71994C7.42779 7.40994 9.62779 5.74994 12.2178 5.74994V6.74994Z" fill="#EA4335" />
          </svg>
          Sign up with Google
        </button>
      </div>

      {/* Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-sm text-gray-500">
            Or sign up with email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Name Fields */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              required
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316] h-12 px-4 text-base"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              required
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316] h-12 px-4 text-base"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316] h-12 px-4 text-base"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316] h-12 px-4 pr-12 text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {password && <PasswordStrengthIndicator password={password} />}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirm-password"
              placeholder="Re-enter your password"
              required
              className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316] h-12 px-4 pr-12 text-base"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start">
          <div className="flex items-center h-6">
            <input
              type="checkbox"
              id="terms-agreement"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required
              className="h-4 w-4 rounded border-gray-300 text-[#F97316] focus:ring-[#F97316]"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms-agreement" className="font-medium text-gray-700">
              I agree to the{" "}
              <Link href="/terms" className="font-medium text-[#F97316] hover:underline">
                Terms of Service
              </Link>{" "}
              &{" "}
              <Link href="/privacy" className="font-medium text-[#F97316] hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>

        {/* Clerk CAPTCHA Element */}
        <div id="clerk-captcha"></div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!agreedToTerms}
          className="flex w-full h-12 items-center justify-center rounded-lg bg-[#F97316] px-5 text-base font-bold text-white hover:bg-[#F97316]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Account
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-[#F97316] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

