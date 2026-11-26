"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, FileText, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"
import type { Product } from "@/lib/types/domain"
import type { Collection } from "@/lib/types/collections"

interface ExclusiveCedarProps {
  collections?: Array<Collection & { products: Product[] }>
}

const FALLBACK_PRODUCTS = [
  {
    id: "fallback-wire-coil",
    title: "Elevator Wire Coil",
    description: "Control panel wiring.",
    handle: "wire-coil",
    thumbnail: "https://res.cloudinary.com/dfjmqeigc/image/upload/v1768916901/products/wire-coil/lqxcry67kbumqk0gzu0t.jpg",
  },
  {
    id: "fallback-travelling-cable",
    title: "12-Core Travelling Cable",
    description: "Flexible signal cable.",
    handle: "travelling-cable-12-core",
    thumbnail: "https://res.cloudinary.com/dfjmqeigc/image/upload/v1768989089/products/travelling-able-12-core/jkc3itc5lkqyavxoaoli.jpg",
  },
]

function EditorialContent() {
  return (
    <div className="space-y-4">
      <div>
        <span className="type-eyebrow inline-block text-orange-400 mb-3">
          CEDAR COLLECTION
        </span>
        <h2 className="type-section text-white font-extralight">
          Essential Components. Carefully Selected.
        </h2>
        <p className="type-body-sm mt-4 text-zinc-300">
          Explore a focused range of elevator cables, wiring and essential components for installation, maintenance and system upgrades.
        </p>
      </div>

      {/* Highlights */}
      <div className="pt-2 space-y-3.5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <span className="type-body-sm text-zinc-300">
            A focused selection - Explore components across key elevator requirements.
          </span>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <span className="type-body-sm text-zinc-300">
            Product guidance - Get assistance identifying the right part for your application.
          </span>
        </div>
      </div>

      {/* CTAs - Side-by-side on mobile, unchanged on desktop */}
      <div className="pt-4 flex flex-row flex-nowrap sm:flex-wrap items-center gap-2.5 sm:gap-4">
        <Link
          href="/products"
          className="type-button inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors min-h-[44px] whitespace-nowrap flex-1 sm:flex-initial"
        >
          <span>Explore the Collection</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
        </Link>
        <Link
          href="/quotes/new"
          className="type-button inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm rounded-lg border border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/60 text-blue-100 transition-colors min-h-[44px] whitespace-nowrap flex-1 sm:flex-initial"
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-300 flex-shrink-0" />
          <span>Request a Quote</span>
        </Link>
      </div>
    </div>
  )
}

export function ExclusiveCedar({ collections = [] }: ExclusiveCedarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)

  const exclusiveCol =
    collections.find((c) => c.slug === "exclusive-in-cedar") ||
    collections[0]

  const rawProducts = exclusiveCol?.products || []
  const displayProducts = rawProducts.length > 0 ? rawProducts : (FALLBACK_PRODUCTS as any[])

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollLeft(scrollContainerRef.current.scrollLeft)
    }
  }

  const scrollByDirection = (direction: "left" | "right") => {
    const el = scrollContainerRef.current
    if (!el) return
    // On initial desktop view, first right click scrolls past the editorial block so 1st card aligns left
    const step = Math.max(360, Math.round(el.clientWidth * 0.52))
    el.scrollBy({ left: direction === "left" ? -step : step, behavior: "smooth" })
  }

  // Fade out editorial column smoothly as user scrolls horizontally on desktop
  const editorialOpacity = Math.max(0, Math.min(1, 1 - scrollLeft / 240))
  const isEditorialHidden = editorialOpacity <= 0.02

  return (
    <section className="w-full py-8 sm:py-12 bg-black text-white overflow-hidden">
      <style>{`
        .exclusive-editorial-slide {
          flex: 0 0 44%;
          max-width: 560px;
          padding-left: 3rem;
          padding-right: 2.5rem;
        }
        .exclusive-product-card {
          flex: 0 0 70vw;
        }
        @media (min-width: 640px) {
          .exclusive-product-card {
            flex: 0 0 230px;
          }
        }
        @media (min-width: 768px) {
          .exclusive-product-card {
            flex: 0 0 calc((100% - 2.5rem) / 2.6);
          }
        }
        @media (min-width: 1024px) {
          .exclusive-product-card {
            flex: 0 0 calc((100% - 4.5rem) / 4.2);
          }
        }
      `}</style>

      <div className="w-full">
        {/* Mobile/Tablet Editorial Block (shown above horizontal scroll on < lg) */}
        <div className="lg:hidden mb-6 px-4 sm:px-6 md:px-8">
          <EditorialContent />
        </div>

        {/* Desktop Scroll Navigation Controls */}
        <div className="hidden lg:flex items-center justify-end gap-2 mb-4 px-12">
          <button
            type="button"
            onClick={() => scrollByDirection("left")}
            aria-label="Scroll curated components left"
            className="w-9 h-9 rounded-full border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByDirection("right")}
            aria-label="Scroll curated components right"
            className="w-9 h-9 rounded-full border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-200 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Full-Bleed Horizontal Scroll Track (bleeds smoothly from screen edges):
            - Initial desktop: Left editorial text + 1st card full + 2nd card partial
            - On scroll: Editorial text fades out/hides, 1st card moves left, 4 cards in a row (3 full + 4th partial) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex items-stretch gap-4 sm:gap-5 lg:gap-6 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory no-scrollbar scroll-smooth pl-4 pr-4 sm:pl-6 sm:pr-6 md:pl-8 md:pr-8 lg:pl-0 lg:pr-12"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Desktop Editorial Slide (fades out as user scrolls right) */}
          <div
            className={`hidden lg:flex flex-col justify-center exclusive-editorial-slide snap-start transition-opacity duration-200 ${isEditorialHidden ? "pointer-events-none" : ""
              }`}
            style={{ opacity: editorialOpacity }}
            aria-hidden={isEditorialHidden}
          >
            <EditorialContent />
          </div>

          {/* All Product Cards in Horizontal Scroll */}
          {displayProducts.map((p: any) => {
            const imageSrc =
              p.thumbnail ||
              (Array.isArray(p.images) && p.images.length > 0
                ? typeof p.images[0] === "string"
                  ? p.images[0]
                  : p.images[0]?.url
                : null)
            const productSlug = p.handle || p.id

            return (
              <div
                key={p.id}
                className="exclusive-product-card snap-start bg-zinc-900/90 rounded-xl border border-zinc-800 p-3 sm:p-3.5 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  {/* Nested 1:1 Square Image Card filling full square */}
                  <div className="w-full aspect-square rounded-lg bg-white overflow-hidden mb-3">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
                        <span className="text-xs text-zinc-600">Cedar Component</span>
                      </div>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                    {p.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {p.description || "Curated elevator engineering component."}
                  </p>
                </div>

                {/* Price on request & Actions */}
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80">
                  <span className="block text-[11px] text-zinc-400 mb-2">
                    Price on request
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/products/${productSlug}`}
                      className="inline-flex items-center justify-center py-1.5 px-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
                    >
                      Details
                    </Link>
                    <Link
                      href={
                        p.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(p.id))
                          ? `/quotes/new?product=${encodeURIComponent(productSlug)}&productId=${encodeURIComponent(p.id)}`
                          : `/quotes/new?product=${encodeURIComponent(productSlug)}`
                      }
                      className="inline-flex items-center justify-center py-1.5 px-2.5 rounded-md bg-orange-600 hover:bg-orange-500 text-xs font-medium text-white transition-colors"
                    >
                      Enquire
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ExclusiveCedar
