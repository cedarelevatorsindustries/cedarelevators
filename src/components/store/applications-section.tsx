'use client'

import { useRouter, usePathname } from "next/navigation"
import { Wrench, ClipboardCheck, Cog, Grid3x3 } from "lucide-react"
import { useState, useEffect } from "react"

export function ApplicationsSection() {
    const router = useRouter()
    const pathname = usePathname()
    const [isMobile, setIsMobile] = useState(false)

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const applications = [
        {
            name: "Erection",
            slug: "erection",
            description: "Mechanical components and installation parts",
            badge: "ESSENTIAL",
            badgeColor: "bg-orange-600",
            image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop&crop=center",
            icon: Wrench
        },
        {
            name: "Testing",
            slug: "testing",
            description: "Electrical testing equipment and components",
            badge: "QUALITY",
            badgeColor: "bg-blue-600",
            image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&crop=center",
            icon: ClipboardCheck
        },
        {
            name: "Service",
            slug: "service",
            description: "Repair, AMC, and maintenance solutions",
            badge: "SUPPORT",
            badgeColor: "bg-green-600",
            image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop&crop=center",
            icon: Cog
        },
        {
            name: "Others",
            slug: "others",
            description: "Additional elevator components",
            badge: "NEW",
            badgeColor: "bg-purple-600",
            image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&h=600&fit=crop&crop=center",
            icon: Grid3x3
        }
    ]

    const handleApplicationClick = (slug: string) => {
        // Always go to catalog page with application filter (for both logged-in and guest users)
        router.push(`/catalog?application=${slug}`)
    }

    return (
        <section className="py-8 px-4 md:px-12 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Shop by Application
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Browse components organized by application type
                    </p>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {applications.map((app) => (
                        <button
                            key={app.slug}
                            onClick={() => handleApplicationClick(app.slug)}
                            className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 aspect-[4/3] text-left w-full"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={app.image}
                                    alt={app.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                            </div>

                            {/* Badge */}
                            <div className="absolute top-3 left-3">
                                <span className={`${app.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
                                    {app.badge}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <h3 className="text-lg font-bold mb-1 group-hover:text-blue-300 transition-colors">
                                    {app.name}
                                </h3>
                                <p className="text-gray-200 text-xs line-clamp-2">
                                    {app.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Mobile Horizontal Scroll */}
                <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-4 pb-4">
                        {applications.map((app) => (
                            <button
                                key={app.slug}
                                onClick={() => handleApplicationClick(app.slug)}
                                className="group relative overflow-hidden rounded-2xl shadow-md flex-shrink-0 w-[280px] aspect-[4/3] text-left"
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <img
                                        src={app.image}
                                        alt={app.name}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                </div>

                                {/* Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className={`${app.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
                                        {app.badge}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                    <h3 className="text-lg font-bold mb-1">
                                        {app.name}
                                    </h3>
                                    <p className="text-gray-200 text-xs line-clamp-2">
                                        {app.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </section>
    )
}
