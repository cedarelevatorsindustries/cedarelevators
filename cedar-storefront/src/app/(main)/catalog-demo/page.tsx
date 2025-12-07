import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Catalog Variations Demo - Cedar Elevators",
  description: "Explore all 11 catalog page variations with a single unified component",
}

const catalogVariations = [
  {
    id: 1,
    type: "browse-all",
    title: "Browse All",
    description: "All products with carousel banner",
    url: "/catalog?type=browse-all",
    features: ["Carousel Banner", "All Products", "Full Filters"],
    color: "from-orange-500 to-orange-600",
  },
  {
    id: 2,
    type: "search",
    title: "Search",
    description: "Search results with related keywords",
    url: "/catalog?type=search&search=control%20panel",
    features: ["Related Keywords", "Search Results", "No Banner"],
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 3,
    type: "category",
    title: "Category",
    description: "Products by category with hero lite",
    url: "/catalog?type=category&category=control-panels",
    features: ["Hero Lite", "Category Info", "Subcategories"],
    color: "from-purple-500 to-purple-600",
  },
  {
    id: 4,
    type: "application",
    title: "Application",
    description: "Products by application with hero lite",
    url: "/catalog?type=application&application=passenger-elevator",
    features: ["Hero Lite", "Application Info", "Filtered Products"],
    color: "from-green-500 to-green-600",
  },
  {
    id: 5,
    type: "recently-viewed",
    title: "Recently Viewed",
    description: "Recently viewed + all other products",
    url: "/catalog?type=recently-viewed",
    features: ["Primary Section", "Fallback Products", "No Banner"],
    color: "from-pink-500 to-pink-600",
  },
  {
    id: 6,
    type: "recommended",
    title: "Recommended For You",
    description: "Recommended products + all others",
    url: "/catalog?type=recommended",
    features: ["Personalized", "Fallback Products", "No Banner"],
    color: "from-indigo-500 to-indigo-600",
  },
  {
    id: 7,
    type: "top-choice",
    title: "Top Choice This Month",
    description: "Top choice products + all others",
    url: "/catalog?type=top-choice",
    features: ["Curated Selection", "Fallback Products", "No Banner"],
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: 8,
    type: "new-arrival",
    title: "New Arrivals",
    description: "Products from last 30 days + all others",
    url: "/catalog?type=new-arrival",
    features: ["Last 30 Days", "Fallback Products", "No Banner"],
    color: "from-red-500 to-red-600",
  },
  {
    id: 9,
    type: "trending-collections",
    title: "Trending Collections",
    description: "Trending products with category tags",
    url: "/catalog?type=trending-collections",
    features: ["Category Tags", "Trending Badge", "Fallback Products"],
    color: "from-teal-500 to-teal-600",
  },
  {
    id: 10,
    type: "top-applications",
    title: "Top Applications",
    description: "Top applications with application tags",
    url: "/catalog?type=top-applications",
    features: ["Application Tags", "Top Badge", "Fallback Products"],
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id: 11,
    type: "exclusive-business",
    title: "Exclusive to Business",
    description: "B2B exclusive products + all others",
    url: "/catalog?type=exclusive-business",
    features: ["B2B Only", "Fallback Products", "No Banner"],
    color: "from-gray-700 to-gray-800",
  },
]

export default function CatalogDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white">
        <div className="max-w-[1400px] mx-auto px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              Catalog Page Variations
            </h1>
            <p className="text-xl text-orange-100 mb-6">
              One URL. One Component. 11 Different Behaviors. Zero Code Duplication.
            </p>
            <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-left">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1">The Secret: Single PLP with Type Param</p>
                  <p className="text-orange-100 text-sm">
                    All 11 variations → ONE page → <code className="bg-black/20 px-2 py-1 rounded">/catalog</code>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-orange-100">
                <span>Just change the query param:</span>
                <code className="bg-black/20 px-2 py-1 rounded">?type=browse-all</code>
                <span>→</span>
                <code className="bg-black/20 px-2 py-1 rounded">?type=recently-viewed</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variations Grid */}
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogVariations.map((variation) => (
            <Link
              key={variation.id}
              href={variation.url}
              className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-orange-400"
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${variation.color} p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center font-bold text-2xl text-white border border-white/30">
                      {variation.id}
                    </div>
                    <svg
                      className="w-6 h-6 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {variation.title}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {variation.description}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Features
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {variation.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium"
                      >
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    URL Parameter
                  </div>
                  <code className="block bg-gray-50 text-gray-800 text-xs px-3 py-2 rounded-lg font-mono border border-gray-200">
                    ?type={variation.type}
                  </code>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 pb-6">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3 text-center border border-orange-200">
                  <span className="text-orange-700 font-semibold text-sm">
                    Click to View Live Demo →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Common Features Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6">
            <h2 className="text-3xl font-bold text-white">Common Features Across All Variations</h2>
            <p className="text-gray-300 mt-2">Every catalog type includes these powerful features</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "🎴",
                  title: "Product Cards",
                  description: "Consistent cards with badges, tags, and hover effects",
                },
                {
                  icon: "🔍",
                  title: "Filter Sidebar",
                  description: "Advanced filtering by category, price, rating, and more",
                },
                {
                  icon: "🔄",
                  title: "Sort Options",
                  description: "Sort by relevance, name, price (low/high), and newest",
                },
                {
                  icon: "📄",
                  title: "Pagination",
                  description: "24 items per page with smooth navigation",
                },
                {
                  icon: "📊",
                  title: "Results Header",
                  description: "Product count, view modes (grid/list), and controls",
                },
                {
                  icon: "📱",
                  title: "Responsive Design",
                  description: "Optimized for desktop, tablet, and mobile devices",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Architecture Highlight */}
        <div className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">⚡</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Efficient Architecture
              </h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span><strong>Single Component:</strong> One CatalogTemplate handles all 11 variations</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span><strong>Type-Based Routing:</strong> Configuration driven by CATALOG_CONFIGS</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span><strong>Smart Filtering:</strong> Primary + fallback product sections</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span><strong>Zero Duplication:</strong> Shared filters, sort, pagination, and UI</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
