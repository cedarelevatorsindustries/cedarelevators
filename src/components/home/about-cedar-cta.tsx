import Link from "next/link"
import { ArrowRight, FileText } from "lucide-react"

export function AboutCedarCta() {
  return (
    <section id="about-section" className="w-full py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-zinc-950 via-[#0a152d] to-zinc-950 text-white">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Part A — About Cedar */}
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-orange-400 mb-2">
            About Cedar
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-tight">
            Engineering solutions for vertical mobility.
          </h2>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-zinc-300 font-normal leading-relaxed max-w-4xl">
            Cedar Elevators Industries provides elevator components and engineering solutions for vertical transportation requirements. Explore our product catalogue and connect with our team for quotation assistance.
          </p>
        </div>

        {/* Subtle Hairline Divider between Company Intro & Conversion CTA */}
        <div className="mt-8 sm:mt-12 pt-8 sm:pt-10 border-t border-blue-900/30">
          {/* Part B — Conversion CTA */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-3xl">
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Looking for the right components for your project?
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Explore our catalogue or contact our team to discuss your product requirements and request a quotation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
              {/* Primary CTA — Orange */}
              <Link
                href="/quotes/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all duration-150 min-h-[44px] whitespace-nowrap"
              >
                <span>Request a Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Secondary CTA — Engineering Blue */}
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-950/60 hover:bg-blue-900/80 active:bg-blue-900 text-blue-100 border border-blue-500/30 hover:border-blue-400/60 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 min-h-[44px] whitespace-nowrap"
              >
                <FileText className="w-4 h-4 text-blue-300" />
                <span>Browse Products</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutCedarCta
