"use client"

import { useState } from "react"
import { useSignIn } from "@/lib/auth/client"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function LoginForm() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/dashboard")
      } else {
        console.log(result)
      }
    } catch (err: any) {
      console.error("error", err.errors[0].longMessage)
      setError(err.errors[0].longMessage)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      })
    } catch (err: any) {
      console.error("error", err)
      setError(err.errors ? err.errors[0].longMessage : "An error occurred")
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden text-center mb-4">
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[#0B3D91]">
          Cedar Elevator Industries
        </h1>
        <p className="mt-2 text-base font-normal leading-normal text-gray-600">
          Elevating Your Business Access
        </p>
      </div>

      {/* Desktop Header - Only visible on desktop */}
      <div className="hidden lg:flex flex-col gap-2 text-left">
        <h2 className="text-gray-900 text-3xl font-bold leading-tight tracking-tight">
          Welcome Back
        </h2>
        <p className="text-gray-600 text-sm font-normal leading-normal">
          Login to your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email Field */}
        <div className="flex flex-col w-full">
          <label className="text-gray-900 text-sm font-medium leading-normal mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#2D5BFF]/50 border border-gray-300 bg-white focus:border-[#2D5BFF] h-12 placeholder:text-gray-500 px-4 text-base font-normal leading-normal"
          />
        </div>

        {/* Password Field */}
        <div className="flex flex-col w-full">
          <label className="text-gray-900 text-sm font-medium leading-normal mb-2">
            Password
          </label>
          <div className="relative flex w-full items-center">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#2D5BFF]/50 border border-gray-300 bg-white focus:border-[#2D5BFF] h-12 placeholder:text-gray-500 px-4 pr-12 text-base font-normal leading-normal"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 mr-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start">
            <div className="flex items-center h-6">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#2D5BFF] focus:ring-[#2D5BFF]/50"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="remember-me"
                className="font-medium text-gray-900"
              >
                Remember me
              </label>
            </div>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#2D5BFF] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <hr className="w-full border-gray-200" />
          <p className="text-sm text-gray-500">Or</p>
          <hr className="w-full border-gray-200" />
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 text-base font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2D5BFF]/50 focus:ring-offset-2"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.5777 12.2599C22.5777 11.4599 22.5077 10.6599 22.3677 9.8999H12.2178V14.3399H18.1578C17.8878 15.8699 17.0678 17.1399 15.8178 17.9699V20.8199H19.6878C21.6178 19.0199 22.5777 15.9399 22.5777 12.2599Z"
              fill="#4285F4"
            />
            <path
              d="M12.2178 23.0001C15.2578 23.0001 17.8378 22.0101 19.6878 20.8201L15.8178 17.9701C14.7978 18.6601 13.5978 19.0501 12.2178 19.0501C9.62779 19.0501 7.42779 17.3901 6.57779 15.0801L2.58779 15.0801V17.9901C4.43779 21.0301 8.02779 23.0001 12.2178 23.0001Z"
              fill="#34A853"
            />
            <path
              d="M6.57779 15.08C6.34779 14.39 6.21779 13.65 6.21779 12.9C6.21779 12.15 6.34779 11.41 6.57779 10.72V7.81L2.58779 7.81C1.72779 9.53 1.21779 11.14 1.21779 12.9C1.21779 14.66 1.72779 16.27 2.58779 17.99L6.57779 15.08Z"
              fill="#FBBC05"
            />
            <path
              d="M12.2178 6.74994C13.7278 6.72994 15.1578 7.25994 16.2278 8.27994L19.7578 4.74994C17.8278 2.97994 15.2578 1.79994 12.2178 1.79994C8.02779 1.79994 4.43779 3.76994 2.58779 6.80994L6.57779 9.71994C7.42779 7.40994 9.62779 5.74994 12.2178 5.74994V6.74994Z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-900">
          Don't have an account?{" "}
          <Link href="/choose-type" className="font-bold text-[#F97316] hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  )
}
