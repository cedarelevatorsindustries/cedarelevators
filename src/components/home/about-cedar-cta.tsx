import Link from "next/link"
import { ArrowRight, FileText } from "lucide-react"

export function AboutCedarCta() {
  return (
    <section
      id="about-section"
      className="w-full bg-black text-white"
      style={{
        backgroundColor: "#000000",
        paddingTop: "4.5rem",
        paddingBottom: "4.5rem"
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Part A - About Cedar */}
        <div className="max-w-4xl">
          <span className="type-eyebrow inline-block text-orange-400 mb-3">
            About Cedar
          </span>
          <h2 className="type-hero text-white">
            Engineering solutions for vertical mobility.
          </h2>
          <p className="type-body mt-4 text-zinc-300">
            Cedar Elevators Industries provides elevator components and engineering solutions for vertical transportation requirements. Explore our product catalogue and connect with our team for quotation assistance.
          </p>
        </div>

        {/* Subtle Hairline Divider between Company Intro & Conversion CTA */}
        <div
          className="border-t border-zinc-800"
          style={{ marginTop: "2.5rem", paddingTop: "2.5rem" }}
        >
          {/* Part B - Conversion CTA */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 lg:gap-8">
            <div className="max-w-2xl">
              <h3 className="type-subsection text-white">
                Looking for the right components for your project?
              </h3>
              <p className="type-body-sm mt-2.5 text-zinc-300">
                Explore our catalogue or contact our team to discuss your product requirements and request a quotation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-shrink-0">
              {/* Primary CTA - Orange */}
              <Link
                href="/quotes/new"
                className="type-button inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-150 min-h-[42px] whitespace-nowrap text-center"
                style={{ padding: "0.625rem 1.375rem" }}
              >
                <span>Request a Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Secondary CTA - High-contrast Outline */}
              <Link
                href="/products"
                className="type-button inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white border border-white/25 hover:border-white/40 rounded-lg transition-all duration-150 min-h-[42px] whitespace-nowrap text-center"
                style={{ padding: "0.625rem 1.375rem" }}
              >
                <FileText className="w-4 h-4 text-zinc-300" />
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
