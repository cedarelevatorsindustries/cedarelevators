"use client"

import Image from "next/image"
import Link from "next/link"

export default function VerificationStatusCard() {
  // TODO: Fetch from user profile or Medusa metadata
  const isVerified = false
  const status = "pending" as "pending" | "verified" | "rejected"
  const submittedDate = new Date().toISOString()

  // Determine colors and content based on status
  const getStatusConfig = () => {
    switch (status) {
      case "verified":
        return {
          bgColor: "bg-gradient-to-r from-green-500 to-green-600",
          title: "VERIFIED PARTNER STATUS",
          description: "Your business is verified and approved for exclusive partner benefits.",
          textColor: "text-white",
          buttonBg: "bg-white",
          buttonText: "text-green-700"
        }
      case "pending":
        return {
          bgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
          title: "VERIFICATION PENDING",
          description: "Your verification is under review. We'll notify you once approved.",
          textColor: "text-white",
          buttonBg: "bg-white/20 hover:bg-white/30",
          buttonText: "text-white"
        }
      default:
        return {
          bgColor: "bg-gradient-to-r from-red-500 to-red-600",
          title: "VERIFICATION REQUIRED",
          description: "Complete your verification to access exclusive business benefits.",
          textColor: "text-white",
          buttonBg: "bg-white/20 hover:bg-white/30",
          buttonText: "text-white"
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`${config.bgColor} rounded-xl shadow-lg overflow-hidden h-48`}>
      <div className="flex items-center h-full">
        {/* Illustration - Subtle */}
        <div className="relative w-48 h-48 flex-shrink-0 opacity-80">
          <Image
            src="/images/verification/verification_illustration.png"
            alt="Verification Status"
            fill
            className="object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex-1 py-6 pr-8 pl-4">
          <h2 className={`text-xl font-bold mb-2 ${config.textColor}`}>
            {config.title}
          </h2>
          <p className={`text-sm mb-4 ${config.textColor} opacity-90`}>
            {config.description}
          </p>

          <div className="flex items-center gap-6 mb-4">
            <div className={`text-xs ${config.textColor} opacity-80`}>
              <span className="font-medium">Submission Date:</span> {new Date(submittedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {isVerified && (
              <div className={`text-xs ${config.textColor} opacity-80`}>
                <span className="font-medium">Verification ID:</span> #VP-8742
              </div>
            )}
          </div>

          {/* Action Button - Only show if not verified */}
          {!isVerified && (
            <Link
              href="/profile/business/verification"
              className={`${config.buttonBg} ${config.buttonText} px-6 py-2 rounded-lg font-semibold transition-colors backdrop-blur-sm text-sm inline-block`}
            >
              Complete Verification
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

