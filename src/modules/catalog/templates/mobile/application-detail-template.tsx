"use client"

import { useState, useEffect, type ReactElement } from "react"
import { Product } from "@/lib/types/domain"
import { ArrowLeft, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import ProductCard from "@/components/ui/product-card"
import { Application } from "@/lib/data/applications"

interface ApplicationDetailTemplateProps {
    application: Application
    products: Product[]
    allApplications: Application[]
    onBack?: () => void
}

export default function ApplicationDetailTemplate({
    application,
    products,
    allApplications,
    onBack
}: ApplicationDetailTemplateProps): ReactElement {
    const router = useRouter()
    const [selectedApplicationId, setSelectedApplicationId] = useState<string>(application.id)

    // Filter products by selected application
    const filteredProducts = products.filter(p => p.application_id === selectedApplicationId)

    // Auto-select current application on mount
    useEffect(() => {
        setSelectedApplicationId(application.id)
    }, [application.id])

    // Get selected application details
    const selectedApp = allApplications.find(app => app.id === selectedApplicationId) || application

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {/* Header - Fixed */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => onBack ? onBack() : router.back()}
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-base font-bold text-gray-900 line-clamp-1">
                        {selectedApp.name}
                    </h1>
                    <p className="text-xs text-gray-500">
                        {filteredProducts.length} products
                    </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Search size={20} />
                </button>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Applications */}
                <div className="w-24 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                    <div className="py-2">
                        {allApplications.map((app) => (
                            <button
                                key={app.id}
                                onClick={() => setSelectedApplicationId(app.id)}
                                className={`w-full px-2 py-3 text-center transition-all ${selectedApplicationId === app.id
                                        ? "bg-white border-l-2 border-orange-600 text-orange-600 font-semibold"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-1">
                                    {/* Icon/Image */}
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${selectedApplicationId === app.id
                                            ? "bg-orange-50"
                                            : "bg-white"
                                        }`}>
                                        {app.thumbnail_image ? (
                                            <img
                                                src={app.thumbnail_image}
                                                alt={app.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl">
                                                {app.icon || "📦"}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs leading-tight line-clamp-2">
                                        {app.name}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Content - Products Grid */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-3">
                        {/* Products Grid - 2 Columns */}
                        <div className="grid grid-cols-2 gap-3">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    variant="mobile"
                                />
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-5xl mb-3">📦</div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">
                                    No products found
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Check back soon for new items in {selectedApp.name}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
