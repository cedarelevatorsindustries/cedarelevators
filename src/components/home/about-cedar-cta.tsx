import Link from "next/link"
import { ArrowRight, FileText } from "lucide-react"

export function AboutCedarCta() {
  return (
    <section 
      id="about-section" 
      className="w-full py-14 sm:py-18 lg:py-24 bg-[#0a152d] text-white overflow-hidden relative"
      style={{
        backgroundColor: "#0a152d",
        background: "linear-gradient(135deg, #070d1e 0%, #0f1f42 50%, #070d1e 100%)"
      }}
    >
      {/* Subtle Ambient Radial Glow */}
      <div 
        className="pointer-events-none absolute -top-24 right-1/4 w-[500px] h-[300px] bg-blue-500/10 blur-3xl rounded-full"
        aria-hidden="true"
      />
      <div 
        className="pointer-events-none absolute -bottom-24 left-1/4 w-[500px] h-[300px] bg-orange-500/10 blur-3xl rounded-full"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Part A — About Cedar */}
        <div className="max-w-4xl">
          <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-400 mb-3">
            About Cedar
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tight leading-tight">
            Engineering solutions for vertical mobility.
          </h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-zinc-300 font-normal leading-relaxed">
            Cedar Elevators Industries provides elevator components and engineering solutions for vertical transportation requirements. Explore our product catalogue and connect with our team for quotation assistance.
          </p>
        </div>

        {/* Subtle Hairline Divider between Company Intro & Conversion CTA */}
        <div className="mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-blue-900/40">
          {/* Part B — Conversion CTA */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 lg:gap-8">
            <div className="max-w-2xl">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Looking for the right components for your project?
              </h3>
              <p className="mt-2 text-sm sm:text-base text-zinc-300 leading-relaxed">
                Explore our catalogue or contact our team to discuss your product requirements and request a quotation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-shrink-0">
              {/* Primary CTA — Orange */}
              <Link
                href="/quotes/new"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white text-sm sm:text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-150 min-h-[48px] sm:min-h-[52px] whitespace-nowrap text-center"
              >
                <span>Request a Quote</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>

              {/* Secondary CTA — High-contrast Outline */}
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white border border-white/25 hover:border-white/40 text-sm sm:text-base font-semibold rounded-xl transition-all duration-150 min-h-[48px] sm:min-h-[52px] whitespace-nowrap text-center"
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" />
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
