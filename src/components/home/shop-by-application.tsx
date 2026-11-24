import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { Application } from "@/lib/data/applications"

interface ShopByApplicationProps {
  applications?: Application[]
}

const DEFAULT_APPLICATIONS = [
  {
    name: "Erection",
    slug: "erection",
    description: "Components and equipment for elevator installation.",
    image: "https://res.cloudinary.com/dfjmqeigc/image/upload/v1768827123/cedar/applications/u2n4mpklhylpvldzbafk.jpg"
  },
  {
    name: "Testing",
    slug: "testing",
    description: "Equipment and components for inspection and testing.",
    image: "https://res.cloudinary.com/dfjmqeigc/image/upload/v1768827618/cedar/applications/aw0gmpuohwrmv8jhvct2.jpg"
  },
  {
    name: "Service",
    slug: "service",
    description: "Tools and components for elevator maintenance.",
    image: "https://res.cloudinary.com/dfjmqeigc/image/upload/v1768828195/cedar/applications/t6egqhvp7x7dhg2chlgh.jpg"
  }
]

export function ShopByApplication({ applications = [] }: ShopByApplicationProps) {
  const items = applications.length >= 3
    ? applications.slice(0, 3).map((app) => ({
        name: app.name,
        slug: app.slug || "erection",
        description:
          app.name.toLowerCase().includes("erection")
            ? "Components and equipment for elevator installation."
            : app.name.toLowerCase().includes("testing")
            ? "Equipment and components for inspection and testing."
            : "Tools and components for elevator maintenance.",
        image: app.thumbnail_image || app.image_url || DEFAULT_APPLICATIONS[0].image
      }))
    : DEFAULT_APPLICATIONS

  return (
    <section className="w-full py-8 sm:py-14 bg-white">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header with Blue & Orange Theme */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-blue-600">
              Workflow Discovery
            </span>
            <h2 className="text-xl sm:text-3xl font-semibold text-zinc-900 tracking-tight mt-0.5 sm:mt-1">
              Shop by Application
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-0.5 sm:mt-1 hidden sm:block">
              Explore essential components grouped by elevator deployment phase.
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-orange-600 hover:text-blue-600 transition-colors"
          >
            <span>All Applications</span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        {/* Responsive Full-Width Layout: Carousel on Mobile / 3-Card Row on Desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible pb-3 md:pb-0 snap-x snap-mandatory no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
          {items.map((app) => (
            <Link
              key={app.slug}
              href={`/catalog?application=${app.slug}`}
              className="group relative rounded-xl overflow-hidden border border-zinc-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-300 w-[78vw] sm:w-[320px] md:w-auto flex-shrink-0 snap-center aspect-[4/3] flex flex-col justify-end p-4 sm:p-6"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${app.image})` }}
              />

              {/* Darkened Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10 transition-opacity group-hover:from-black/90" />

              {/* Content */}
              <div className="relative z-10 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-2xl font-semibold tracking-tight text-white group-hover:text-orange-300 transition-colors">
                    {app.name}
                  </h3>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-blue-600 group-hover:border-blue-400 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 mt-1.5 sm:mt-2 font-normal leading-relaxed">
                  {app.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ShopByApplication
