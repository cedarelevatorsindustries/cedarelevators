import Link from "next/link"
import { ArrowRight, FileText } from "lucide-react"

export function CompactHero() {
  return (
    <section 
      className="relative w-full overflow-hidden bg-gradient-to-b from-orange-200/70 via-orange-50/60 to-white"
      style={{
        background: "linear-gradient(180deg, #FED7AA 0%, #FFEDD5 28%, #FFF7ED 65%, #FFFFFF 100%)"
      }}
    >
      {/* Subtle Warm Ambient Glow */}
      <div 
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[280px] bg-orange-300/20 blur-3xl rounded-full"
        aria-hidden="true"
      />

      {/* Main Hero Container - Clear breathing room below fixed top navbar */}
      <div
        className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-12"
        style={{ paddingTop: "8.5rem", paddingBottom: "3.5rem" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8 lg:gap-14">
          {/* Left Side: Headline & Subtitle in Geist */}
          <div className="max-w-2xl">
            <h1 className="type-hero text-gray-900">
              Elevator Components. Quality You Can Rely On.
            </h1>

            <p className="type-body mt-3 sm:mt-4 text-gray-700 max-w-xl">
              Explore elevator components, spare parts and solutions for modern vertical transportation.
            </p>
          </div>

          {/* Right Side: Compact CTA Buttons with balanced padding */}
          <div className="flex flex-row items-center gap-3 sm:gap-4 flex-shrink-0 w-full sm:w-auto mt-4 md:mt-0">
            {/* Primary CTA - Orange */}
            <Link
              href="/products"
              className="type-button flex-1 sm:flex-initial group inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white rounded-lg shadow-xs hover:shadow transition-all duration-150 min-h-[40px] whitespace-nowrap text-center"
              style={{ padding: "0.625rem 1.25rem" }}
            >
              <span>Browse Products</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Secondary CTA - Outlined */}
            <Link
              href="/quotes/new"
              className="type-button flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg shadow-xs transition-all duration-150 min-h-[40px] whitespace-nowrap text-center"
              style={{ padding: "0.625rem 1.25rem" }}
            >
              <FileText className="w-4 h-4 text-gray-500" />
              <span>Request a Quote</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CompactHero
