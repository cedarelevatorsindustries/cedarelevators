"use client"

import Image from "next/image"

export default function VerificationStatusCard() {
  // TODO: Fetch from user profile or Medusa metadata
  const isVerified = false
  const status = "pending" as "pending" | "verified" | "rejected"
  const submittedDate = new Date().toISOString()
  const documentsRequired = ["GST Certificate", "Business License"]

  // Determine colors and content based on status
  const getStatusConfig = () => {
    switch (status) {
      case "verified":
        return {
          bgColor: "bg-gradient-to-r from-green-500 to-green-600",
          title: "VERIFIED PARTNER STATUS",
          description: "Your business is verified and approved for exclusive partner benefits.",
          textColor: "text-white",
          buttonBg: "bg-white/20 hover:bg-white/30",
          buttonText: "text-white"
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
    <div className={`${config.bgColor} rounded-xl shadow-lg overflow-hidden h-72`}>
      <div className="flex items-center h-full">
        {/* Illustration - Full height */}
        <div className="relative w-72 h-72 flex-shrink-0">
          <Image
            src="/images/verification/verification_illustration.png"
            alt="Verification Status"
            fill
            className="object-contain"
          />
        </div>

        {/* Content - Moved to the right */}
        <div className="flex-1 py-8 pr-8 pl-4">
          <h2 className={`text-2xl font-bold mb-2 ${config.textColor}`}>
            {config.title}
          </h2>
          <p className={`text-base mb-4 ${config.textColor} opacity-90`}>
            {config.description}
          </p>

          <div className="flex items-center gap-6 mb-6">
            <div className={`text-sm ${config.textColor} opacity-80`}>
              <span className="font-medium">Submission Date:</span> {new Date(submittedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {isVerified && (
              <div className={`text-sm ${config.textColor} opacity-80`}>
                <span className="font-medium">Verification ID:</span> #VP-8742
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isVerified && (
              <button className={`${config.buttonBg} ${config.buttonText} px-6 py-3 rounded-lg font-semibold transition-colors backdrop-blur-sm`}>
                Upload Missing Documents
              </button>
            )}
            <button className={`bg-white ${isVerified ? 'text-green-700' : 'text-gray-700'} px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors`}>
              View Benefits
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
