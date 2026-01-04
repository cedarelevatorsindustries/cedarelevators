'use client'

import { useRouter } from "next/navigation"
import { Wrench, ClipboardCheck, Cog, Grid3x3, Package } from "lucide-react"
import { useState, useEffect } from "react"
import type { Application } from "@/lib/data/applications"

// Icon mapping for applications
const iconMap: Record<string, any> = {
    wrench: Wrench,
    clipboard: ClipboardCheck,
    cog: Cog,
    grid: Grid3x3,
    package: Package
}

// Badge color mapping
const badgeColorMap: Record<string, string> = {
    orange: "bg-orange-600",
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    red: "bg-red-600",
    yellow: "bg-yellow-600"
}

interface ApplicationsSectionProps {
    applications: Application[]
}

export function ApplicationsSection({ applications }: ApplicationsSectionProps) {
    const router = useRouter()
    const [isMobile, setIsMobile] = useState(false)

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Don't render if no applications
    if (!applications || applications.length === 0) {
        return null
    }

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
                    {applications.map((app) => {
                        const IconComponent = app.icon && iconMap[app.icon.toLowerCase()] ? iconMap[app.icon.toLowerCase()] : Grid3x3
                        const imageSrc = app.thumbnail_image || app.image_url || '/images/image.png'
                        const badgeColor = badgeColorMap[app.icon?.toLowerCase() || 'blue'] || 'bg-blue-600'
                        
                        return (
                            <button
                                key={app.slug}
                                onClick={() => handleApplicationClick(app.slug)}
                                className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 aspect-[4/3] text-left w-full"
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <img
                                        src={imageSrc}
                                        alt={app.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                </div>

                                {/* Badge */}
                                {app.icon && (
                                    <div className="absolute top-3 left-3">
                                        <span className={`${badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
                                            {app.name}
                                        </span>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                    <h3 className="text-lg font-bold mb-1 group-hover:text-blue-300 transition-colors">
                                        {app.name}
                                    </h3>
                                    <p className="text-gray-200 text-xs line-clamp-2">
                                        {app.description || 'Browse products in this application'}
                                    </p>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Mobile Horizontal Scroll */}
                <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-4 pb-4">
                        {applications.map((app) => {
                            const IconComponent = app.icon && iconMap[app.icon.toLowerCase()] ? iconMap[app.icon.toLowerCase()] : Grid3x3
                            const imageSrc = app.thumbnail_image || app.image_url || '/images/image.png'
                            const badgeColor = badgeColorMap[app.icon?.toLowerCase() || 'blue'] || 'bg-blue-600'
                            
                            return (
                                <button
                                    key={app.slug}
                                    onClick={() => handleApplicationClick(app.slug)}
                                    className="group relative overflow-hidden rounded-2xl shadow-md flex-shrink-0 w-[280px] aspect-[4/3] text-left"
                                >
                                    {/* Background Image */}
                                    <div className="absolute inset-0">
                                        <img
                                            src={imageSrc}
                                            alt={app.name}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                    </div>

                                    {/* Badge */}
                                    {app.icon && (
                                        <div className="absolute top-3 left-3">
                                            <span className={`${badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
                                                {app.name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                        <h3 className="text-lg font-bold mb-1">
                                            {app.name}
                                        </h3>
                                        <p className="text-gray-200 text-xs line-clamp-2">
                                            {app.description || 'Browse products in this application'}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
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

