"use client"

import Link from "next/link"
import { User, Building2, Check, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  onSelectType: (type: "individual" | "business") => void
  disabled?: boolean
}

export default function AccountTypeSelector({ onSelectType, disabled = false }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Page Heading */}
      <div className="text-center mb-10">
        <h1 className="text-gray-900 font-serif text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
          Choose how you want to use Cedar
        </h1>
        <p className="mt-3 text-gray-500 text-base font-normal leading-normal max-w-lg mx-auto">
          You can switch later — this helps us personalise your experience.
        </p>
      </div>

      {/* Cards Container */}
      {/* Mobile: Stacked (Business first via col-reverse). Desktop: Side-by-side (Individual Left) */}
      <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-6 items-stretch justify-center max-w-3xl mx-auto">

        {/* Individual Card */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onSelectType("individual")
          }}
          disabled={disabled}
          className={cn(
            "group flex-1 flex flex-col items-start text-left p-5 rounded-xl border-2 transition-all duration-200 relative bg-white",
            "border-gray-200 hover:border-blue-200 hover:shadow-lg",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {/* Icon */}
          <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <User size={20} strokeWidth={2} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Individual Account
          </h3>
          <p className="text-gray-500 text-sm mb-4 min-h-[40px]">
            For personal use & browsing products
          </p>

          {/* Points */}
          <ul className="space-y-2 mb-6 flex-1">
            {[
              "Track orders & deliveries",
              "Save wishlist & favourites",
              "Request quotes when needed"
            ].map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <Check size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="w-full mt-auto">
            <div className="w-full h-10 rounded-md border-2 border-[#1E3A8A] text-[#1E3A8A] font-bold text-sm flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              Continue as Individual
            </div>
            <p className="text-[11px] text-center text-gray-400 mt-2">
              You can upgrade to Business later
            </p>
          </div>
        </button>

        {/* Business Card */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onSelectType("business")
          }}
          disabled={disabled}
          className={cn(
            "group flex-1 flex flex-col items-start text-left p-5 rounded-xl border-2 transition-all duration-200 relative bg-white",
            "border-[#F97316] hover:shadow-lg", // Removed extra shadow/scale effects for equality
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {/* Recommended Badge */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#F97316] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide shadow-sm whitespace-nowrap">
            Recommended for B2B
          </div>

          {/* Icon */}
          <div className="h-10 w-10 rounded-lg bg-orange-50 text-[#F97316] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Building2 size={20} strokeWidth={2} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Business Account
          </h3>
          <p className="text-gray-500 text-sm mb-4 min-h-[40px]">
            For companies, resellers & projects
          </p>

          {/* Points */}
          <ul className="space-y-2 mb-6 flex-1">
            {[
              "Request & manage quotes",
              "Business-only pricing (after verification)",
              "Bulk orders & reordering",
              "GST invoices"
            ].map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <Check size={16} className="text-[#F97316] mt-0.5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="w-full mt-auto">
            <div className="w-full h-10 rounded-md bg-[#F97316] text-white font-bold text-sm flex items-center justify-center group-hover:bg-[#ea6406] transition-colors shadow-sm">
              <span className="flex items-center gap-2">
                Continue as Business <ArrowRight size={16} />
              </span>
            </div>
            <p className="text-[11px] text-center text-gray-400 mt-2">
              Verification required to place orders
            </p>
          </div>
        </button>

      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-bold text-[#F97316] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}


