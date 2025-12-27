"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface ShopByTypeSectionProps {
    hasProducts?: boolean
}

// Elevator type categories
const elevatorTypes = [
    {
        id: "passenger-lifts",
        title: "Passenger Lifts",
        description: "Components for passenger elevators in commercial and residential buildings",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&crop=center",
        href: "/products?type=passenger"
    },
    {
        id: "freight-elevators",
        title: "Freight Elevators",
        description: "Heavy-duty components for cargo transport and industrial use",
        image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&h=600&fit=crop&crop=center",
        href: "/products?type=freight"
    },
    {
        id: "home-lifts",
        title: "Home Lifts",
        description: "Premium residential elevator solutions for luxury homes",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&crop=center",
        href: "/products?type=home"
    },
    {
        id: "hospital-lifts",
        title: "Hospital Lifts",
        description: "Medical-grade elevator systems for healthcare facilities",
        image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&h=600&fit=crop&crop=center",
        href: "/products?type=hospital"
    },
    {
        id: "dumbwaiter",
        title: "Dumbwaiter",
        description: "Compact service lifts for food, documents, and small items",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center",
        href: "/products?type=dumbwaiter"
    },
    {
        id: "escalators",
        title: "Escalators",
        description: "Moving stairway components for malls and transit stations",
        image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop&crop=center",
        href: "/products?type=escalator"
    }
]

export default function ShopByTypeSection({ hasProducts = false }: ShopByTypeSectionProps) {
    // Don't render if no products in backend
    if (!hasProducts) {
        return null
    }

    return (
        <section className="bg-white py-8">
            <div className="px-12">
                {/* Section Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Shop by Elevator Type
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Browse our premium elevator selection organized by elevator type
                    </p>
                </div>

                {/* Elevator Types Grid - Square Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {elevatorTypes.map((type) => (
                        <Link
                            key={type.id}
                            href={type.href}
                            className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 aspect-square"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 bg-gray-200">
                                <img
                                    src={type.image}
                                    alt={type.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />

                                {/* Dark Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300" />
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <h3 className="text-base font-bold mb-1 group-hover:text-blue-300 transition-colors line-clamp-2">
                                    {type.title}
                                </h3>
                                <p className="text-gray-200 text-xs mb-2 leading-relaxed line-clamp-2">
                                    {type.description}
                                </p>

                                {/* CTA Button */}
                                <div className="flex items-center text-blue-300 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="mr-1">Shop Now</span>
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
