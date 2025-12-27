'use client'

import { useRouter } from "next/navigation"

export function ElevatorTypesSection() {
    const router = useRouter()

    const elevatorTypes = [
        {
            name: "Passenger Lifts",
            slug: "passenger",
            description: "Components for passenger elevators in commercial and residential buildings",
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&crop=center"
        },
        {
            name: "Freight Elevators",
            slug: "freight",
            description: "Heavy-duty components for cargo transport and industrial use",
            image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&h=600&fit=crop&crop=center"
        },
        {
            name: "Home Lifts",
            slug: "home",
            description: "Premium residential elevator solutions for luxury homes",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&crop=center"
        },
        {
            name: "Hospital Lifts",
            slug: "hospital",
            description: "Medical-grade elevator systems for healthcare facilities",
            image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&h=600&fit=crop&crop=center"
        },
        {
            name: "Dumbwaiter",
            slug: "dumbwaiter",
            description: "Compact service lifts for food, documents, and small items",
            image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center"
        },
        {
            name: "Escalators",
            slug: "escalator",
            description: "Moving stairway components for malls and transit stations",
            image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop&crop=center"
        }
    ]

    const handleElevatorTypeClick = (slug: string) => {
        // Navigate to catalog page with elevator type filter
        router.push(`/catalog?type=${slug}`)
    }

    return (
        <section className="py-8 px-4 md:px-12 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Shop by Elevator Type
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Browse components organized by elevator type
                    </p>
                </div>

                {/* Desktop Grid - 3 columns to show 6 items in 2 rows */}
                <div className="hidden md:grid md:grid-cols-3 gap-4">
                    {elevatorTypes.map((type) => (
                        <button
                            key={type.slug}
                            onClick={() => handleElevatorTypeClick(type.slug)}
                            className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 aspect-[4/3] text-left w-full"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={type.image}
                                    alt={type.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <h3 className="text-lg font-bold mb-1 group-hover:text-blue-300 transition-colors">
                                    {type.name}
                                </h3>
                                <p className="text-gray-200 text-xs line-clamp-2">
                                    {type.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Mobile Horizontal Scroll */}
                <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-4 pb-4">
                        {elevatorTypes.map((type) => (
                            <button
                                key={type.slug}
                                onClick={() => handleElevatorTypeClick(type.slug)}
                                className="group relative overflow-hidden rounded-2xl shadow-md flex-shrink-0 w-[280px] aspect-[4/3] text-left"
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <img
                                        src={type.image}
                                        alt={type.name}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                    <h3 className="text-lg font-bold mb-1">
                                        {type.name}
                                    </h3>
                                    <p className="text-gray-200 text-xs line-clamp-2">
                                        {type.description}
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
