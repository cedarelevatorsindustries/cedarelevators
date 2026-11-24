import Link from "next/link"
import { ArrowRight, FileText, CheckCircle2 } from "lucide-react"
import type { Product } from "@/lib/types/domain"
import type { Collection } from "@/lib/types/collections"

interface ExclusiveCedarProps {
  collections?: Array<Collection & { products: Product[] }>
}

export function ExclusiveCedar({ collections = [] }: ExclusiveCedarProps) {
  const exclusiveCol =
    collections.find((c) => c.slug === "exclusive-in-cedar") ||
    collections[0]

  const featuredProducts = (exclusiveCol?.products || []).slice(0, 4)

  return (
    <section className="w-full py-10 sm:py-16 bg-black text-white">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          {/* Editorial Column (5 cols on desktop) */}
          <div className="lg:col-span-5">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-orange-400 mb-1.5 sm:mb-2">
              Curated Selections
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-tight">
              Cedar Selection — Curated Engineering Components
            </h2>
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed">
              Handpicked components engineered for high duty cycles, seamless shaft integration, and proven operating reliability.
            </p>

            {/* Factual Highlights with Blue & Orange Accents */}
            <div className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-zinc-300">
                  Precision-matched components tested for demanding duty cycles.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-zinc-300">
                  Direct technical assistance available for exact sizing and compatibility.
                </span>
              </div>
            </div>

            {/* CTAs with Orange & Blue Palette */}
            <div className="mt-6 sm:mt-8 flex items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-semibold transition-colors min-h-[40px] sm:min-h-[44px]"
              >
                <span>Explore Selection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/quotes/new"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg border border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/60 text-blue-100 text-xs sm:text-sm font-medium transition-colors min-h-[40px] sm:min-h-[44px]"
              >
                <FileText className="w-4 h-4 text-blue-300" />
                <span>Request Quote</span>
              </Link>
            </div>
          </div>

          {/* Featured Cards Right Column: 2-Column Grid on Mobile / 4-Col Grid on Desktop */}
          <div className="lg:col-span-7 mt-4 lg:mt-0">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((p) => {
                  const imageSrc =
                    p.thumbnail ||
                    (Array.isArray(p.images) && p.images.length > 0
                      ? (typeof p.images[0] === "string" ? p.images[0] : (p.images[0] as any)?.url)
                      : null)
                  const productSlug = p.handle || p.id

                  return (
                    <div
                      key={p.id}
                      className="bg-zinc-900/90 rounded-xl border border-zinc-800 hover:border-blue-500/50 p-3 sm:p-4 flex flex-col justify-between transition-colors shadow-2xs"
                    >
                      <div>
                        <div className="w-full h-28 sm:h-36 rounded-lg bg-zinc-950 flex items-center justify-center p-2 sm:p-3 mb-2.5 overflow-hidden">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={p.title}
                              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform"
                            />
                          ) : (
                            <span className="text-[11px] text-zinc-600">Cedar Component</span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-1 hover:text-blue-400 transition-colors">
                          {p.title}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                          {p.description || "Curated elevator engineering component."}
                        </p>
                      </div>

                      {/* Price on request & Actions */}
                      <div className="mt-2.5 pt-2 border-t border-zinc-800/80">
                        <span className="block text-[10px] text-zinc-400 mb-2">
                          Price on request
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <Link
                            href={`/products/${productSlug}`}
                            className="inline-flex items-center justify-center py-1.5 px-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[11px] font-medium text-zinc-200 transition-colors"
                          >
                            Details
                          </Link>
                          <Link
                            href={`/quotes/new?product=${encodeURIComponent(productSlug)}`}
                            className="inline-flex items-center justify-center py-1.5 px-2 rounded-md bg-orange-600 hover:bg-orange-500 text-[11px] font-medium text-white transition-colors"
                          >
                            Enquire
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                /* Fallback curated cards */
                <>
                  <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-3 sm:p-4">
                    <div className="w-full h-28 sm:h-36 rounded-lg bg-zinc-950 flex items-center justify-center p-2 mb-2">
                      <img
                        src="https://res.cloudinary.com/dfjmqeigc/image/upload/v1768916901/products/wire-coil/lqxcry67kbumqk0gzu0t.jpg"
                        alt="Wire Coil"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <h4 className="text-xs font-semibold text-white line-clamp-1">Elevator Wire Coil</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Control panel wiring.</p>
                  </div>
                  <div className="bg-zinc-900/90 rounded-xl border border-zinc-800 p-3 sm:p-4">
                    <div className="w-full h-28 sm:h-36 rounded-lg bg-zinc-950 flex items-center justify-center p-2 mb-2">
                      <img
                        src="https://res.cloudinary.com/dfjmqeigc/image/upload/v1768989089/products/travelling-able-12-core/jkc3itc5lkqyavxoaoli.jpg"
                        alt="Travelling Cable"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <h4 className="text-xs font-semibold text-white line-clamp-1">12-Core Travelling Cable</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Flexible signal cable.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExclusiveCedar
