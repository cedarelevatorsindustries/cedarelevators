"use client"

import { AlertCircle, CheckCircle, Clock, Package } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface VerificationBannerProps {
  status: "pending" | "approved" | "rejected" | "incomplete"
  variant?: "mobile" | "desktop"
  onAction?: () => void
  className?: string
}

export default function VerificationBanner({
  status,
  variant = "mobile",
  onAction,
  className = ""
}: VerificationBannerProps) {
  const isMobile = variant === "mobile"

  const config = {
    pending: {
      icon: Clock,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      title: "Verification in Progress",
      description: "Our team is reviewing your documents. You'll receive an email once approved (usually within 24 hours).",
      showButton: false,
      buttonText: undefined,
      buttonColor: undefined
    },
    approved: {
      icon: CheckCircle,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      title: "Verified Business Account",
      description: "You have full access to all B2B features including custom quotes and bulk ordering.",
      showButton: false,
      buttonText: undefined,
      buttonColor: undefined
    },
    rejected: {
      icon: AlertCircle,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      title: "Verification Rejected",
      description: "Please review the rejection reason and resubmit your documents.",
      buttonText: "Resubmit Documents",
      buttonColor: "bg-red-500 hover:bg-red-600",
      showButton: true
    },
    incomplete: {
      icon: AlertCircle,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      title: "Complete Business Verification",
      description: "Complete business verification to unlock quotes & bulk ordering features.",
      buttonText: "Complete Verification →",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
      showButton: true
    }
  }

  const currentConfig = config[status]
  const Icon = currentConfig.icon

  if (isMobile) {
    return (
      <div className={cn(
        "mx-4 mt-4 rounded-xl p-4 border",
        currentConfig.bgColor,
        currentConfig.borderColor,
        className
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            currentConfig.bgColor,
            currentConfig.iconColor
          )}>
            <Icon size={20} />
          </div>
          <div className="flex-1">
            {status !== "pending" && status !== "approved" && (
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-2",
                currentConfig.bgColor,
                currentConfig.iconColor,
                "text-sm font-semibold"
              )}>
                <AlertCircle size={16} />
                Action Required
              </div>
            )}
            <h3 className="font-bold text-gray-900 mb-1">{currentConfig.title}</h3>
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
              {currentConfig.description}
            </p>
            {currentConfig.showButton && (
              <button
                onClick={onAction}
                className={cn(
                  "px-6 py-2.5 text-white font-semibold rounded-lg transition-colors",
                  currentConfig.buttonColor
                )}
              >
                {currentConfig.buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Desktop variant
  return (
    <div className={cn(
      "rounded-lg p-6 border",
      currentConfig.bgColor,
      currentConfig.borderColor,
      className
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0",
          currentConfig.bgColor,
          currentConfig.iconColor
        )}>
          <Icon size={32} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {currentConfig.title}
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            {currentConfig.description}
          </p>
          {currentConfig.showButton && (
            <button
              onClick={onAction}
              className={cn(
                "px-6 py-2.5 text-white font-semibold rounded-lg transition-colors",
                currentConfig.buttonColor
              )}
            >
              {currentConfig.buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Upgrade to Business Banner (for individual users)
interface UpgradeBusinessBannerProps {
  variant?: "mobile" | "desktop"
  className?: string
}

export function UpgradeBusinessBanner({ variant = "mobile", className = "" }: UpgradeBusinessBannerProps) {
  const isMobile = variant === "mobile"

  if (isMobile) {
    return (
      <div className={cn(
        "mx-4 mt-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 shadow-sm",
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">
              Upgrade to Business Account
            </h3>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              Get bulk pricing, credit terms, and dedicated support for your business.
            </p>
            <Link
              href="/profile/account"
              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Desktop variant
  return (
    <div className={cn(
      "bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200",
      className
    )}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
          <Package className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Upgrade to Business Account
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Get bulk pricing, credit terms, and dedicated support for your business.
          </p>
          <Link
            href="/profile/account"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
          >
            Upgrade Now →
          </Link>
        </div>
      </div>
    </div>
  )
}
