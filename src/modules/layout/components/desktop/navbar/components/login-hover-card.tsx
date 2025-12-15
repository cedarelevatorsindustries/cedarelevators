"use client"

import { useState, useRef, useEffect } from "react"
import { User } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { useSignIn } from "@/lib/auth/client"

interface LoginHoverCardProps {
  isTransparent: boolean
  onHover?: () => void
}

export function LoginHoverCard({ isTransparent, onHover }: LoginHoverCardProps) {
  const { isLoaded: signInLoaded, signIn } = useSignIn()
  const [isOpen, setIsOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (onHover) onHover()
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 100)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const iconClass = isTransparent
    ? "text-white hover:text-blue-300"
    : "text-gray-700 hover:text-blue-700"

  const handleGoogleAuth = async () => {
    // Try sign-in first, if user doesn't exist, Clerk will handle sign-up
    if (!signInLoaded) return
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      })
    } catch (err: any) {
      console.error("Google Auth error:", err)
      // If sign-in fails, the error might indicate we need to sign up
      // Clerk should handle this automatically with OAuth
    }
  }

  return (
    <div 
      className="relative" 
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center gap-2 transition-colors font-montserrat ${iconClass}`}
        aria-label="Login"
        aria-expanded={isOpen}
      >
        <User size={20} />
        <span className="text-sm font-medium">Login</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 z-50">
          {/* Arrow/Tail */}
          <div className="absolute right-8 -top-2">
            <div className="w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45 shadow-lg" />
          </div>
          
          {/* Card content */}
          <div className="relative w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome to Cedar
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Sign in to access your account and enjoy personalized shopping experience
            </p>
            
            {/* Login/Signup Buttons */}
            <div className="space-y-3 mb-4">
              <LocalizedClientLink
                href="/sign-in"
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-semibold py-3 px-4 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Login
              </LocalizedClientLink>
              
              <LocalizedClientLink
                href="/sign-up"
                className="block w-full bg-white hover:bg-gray-50 text-gray-700 text-center font-semibold py-3 px-4 rounded-lg border-2 border-gray-300 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </LocalizedClientLink>
            </div>
            
            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            {/* Google Authentication */}
            <button
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border-2 border-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
