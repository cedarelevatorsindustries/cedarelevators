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

      {/* Main Hero Container - Spacious breathing room below fixed top navbar */}
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-12 pt-36 sm:pt-40 md:pt-44 lg:pt-48 pb-16 sm:pb-20 md:pb-24 lg:pb-28">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8 lg:gap-14">
          {/* Left Side: Exactly 2 texts (Headline & Subtitle in Space Grotesk font) */}
          <div className="max-w-2xl">
            <h1 className="font-space-grotesk text-2xl sm:text-3xl md:text-4xl lg:text-4.5xl xl:text-5xl font-semibold text-gray-900 tracking-tight leading-tight">
              Elevator Components. Quality You Can Rely On.
            </h1>

            <p className="font-space-grotesk mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-700 font-normal leading-relaxed max-w-xl">
              Explore elevator components, spare parts and solutions for modern vertical transportation.
            </p>
          </div>

          {/* Right Side: CTA Buttons side-by-side on mobile, generous padding */}
          <div className="flex flex-row items-center gap-4 sm:gap-6 lg:gap-8 flex-shrink-0 w-full sm:w-auto mt-6 md:mt-0">
            {/* Primary CTA - Orange */}
            <Link
              href="/products"
              className="flex-1 sm:flex-initial font-space-grotesk group inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:px-7 sm:py-3.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white text-sm sm:text-base font-semibold rounded-lg shadow-xs hover:shadow transition-all duration-150 min-h-[46px] sm:min-h-[48px] whitespace-nowrap text-center"
            >
              <span>Browse Products</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Secondary CTA - Outlined */}
            <Link
              href="/quotes/new"
              className="flex-1 sm:flex-initial font-space-grotesk inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:px-7 sm:py-3.5 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 border border-gray-300 hover:border-gray-400 text-sm sm:text-base font-semibold rounded-lg shadow-xs transition-all duration-150 min-h-[46px] sm:min-h-[48px] whitespace-nowrap text-center"
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
