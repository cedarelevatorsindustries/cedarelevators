"use client"

import { ReactNode } from "react"

type AuthSplitLayoutProps = {
  children: ReactNode
  illustrationImage: string
  illustrationAlt?: string
  overlayTitle?: string
  overlaySubtitle?: string
  mobileBackgroundColor?: "blue" | "orange"
}

export default function AuthSplitLayout({
  children,
  illustrationImage,
  illustrationAlt = "Authentication illustration",
  overlayTitle,
  overlaySubtitle,
  mobileBackgroundColor = "blue",
}: AuthSplitLayoutProps) {
  const mobileBgClass = mobileBackgroundColor === "orange"
    ? "bg-gradient-to-br from-orange-50/50 to-orange-50 lg:bg-white"
    : "bg-gradient-to-br from-blue-50 to-blue-100 lg:bg-white"

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel - 50% width, hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={illustrationImage}
          alt={illustrationAlt}
          className="w-full h-full object-cover"
        />

        {/* Text Overlay */}
        {(overlayTitle || overlaySubtitle) && (
          <div className="absolute inset-0 flex items-start justify-center pt-16 px-12">
            <div className="text-center max-w-xl">
              {overlayTitle && (
                <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-4 drop-shadow-lg">
                  {overlayTitle}
                </h1>
              )}
              {overlaySubtitle && (
                <p className="text-white text-xl md:text-2xl font-medium leading-relaxed drop-shadow-lg">
                  {overlaySubtitle}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Full width on mobile with gradient, 50% width on desktop */}
      <div className={`flex w-full lg:w-1/2 flex-col items-center justify-center py-12 px-6 lg:px-16 ${mobileBgClass}`}>
        <div className="w-full max-w-2xl">{children}</div>
      </div>
    </div>
  )
}

