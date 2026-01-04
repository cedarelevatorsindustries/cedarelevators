"use client"

import Link from "next/link"
import { MapPin, Truck, Heart, Bell, Briefcase } from "lucide-react"

type Props = {
  onSelectType: (type: "individual" | "business") => void
  disabled?: boolean
}

export default function AccountTypeSelector({ onSelectType, disabled = false }: Props) {
  const benefits = [
    { icon: MapPin, label: "Saved Addresses" },
    { icon: Truck, label: "Order Tracking" },
    { icon: Heart, label: "Wishlist & Favorites" },
    { icon: Bell, label: "Notification Preferences" },
    { icon: Briefcase, label: "Exclusive Business Tools" },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Page Heading */}
      <div className="text-center mb-8">
        <h1 className="text-[#1E3A8A] font-serif text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
          Create Your Cedar Elevators Account
        </h1>
        <p className="mt-3 text-gray-600 text-base font-normal leading-normal">
          Unlock your profile, track orders, and access exclusive tools by creating a free account.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="mt-10">
        <h3 className="text-[#1E3A8A] text-lg font-bold font-serif leading-tight tracking-tight text-center mb-6">
          Your Account Benefits
        </h3>
        <div className="space-y-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-lg bg-gray-50 p-4"
            >
              <div className="text-[#1E3A8A] flex items-center justify-center rounded-lg bg-[#1E3A8A]/10 shrink-0 size-10">
                <benefit.icon size={24} />
              </div>
              <p className="text-gray-900 text-base font-medium leading-normal flex-1">
                {benefit.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <button
          onClick={() => onSelectType("business")}
          disabled={disabled}
          className="w-full max-w-sm flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#F97316] text-white text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="truncate">Register as Business</span>
        </button>
        <button
          onClick={() => onSelectType("individual")}
          disabled={disabled}
          className="w-full max-w-sm flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#1E3A8A] text-white text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="truncate">Register as Individual</span>
        </button>
        <p className="text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-bold text-[#F97316] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}


