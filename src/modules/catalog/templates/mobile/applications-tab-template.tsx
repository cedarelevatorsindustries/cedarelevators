"use client"

import { useState, useEffect } from "react"
import { Product } from "@/lib/types/domain"
import { Application, listApplications } from "@/lib/data/applications"
import { Package } from "lucide-react"
import ProductCard from "@/components/ui/product-card"
import ApplicationDetailTemplate from "./application-detail-template"

interface ApplicationsTabProps {
    products: Product[]
    initialApplications?: Application[]
}

export default function ApplicationsTabTemplate({
    products,
    initialApplications = []
}: ApplicationsTabProps) {
    const [applications, setApplications] = useState<Application[]>(initialApplications)
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
    const [loading, setLoading] = useState(false)

    // Fetch applications if not provided
    useEffect(() => {
        if (initialApplications.length === 0) {
            setLoading(true)
            listApplications().then(apps => {
                setApplications(apps)
                setLoading(false)
            })
        }
    }, [initialApplications])

    // Handle browser back button
    useEffect(() => {
        const handlePopState = () => {
            if (selectedApplication) {
                setSelectedApplication(null)
            }
        }

        // Push state when application is selected
        if (selectedApplication) {
            window.history.pushState({ applicationView: true }, '')
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [selectedApplication])

    // If an application is selected, show detail view
    if (selectedApplication) {
        return (
            <ApplicationDetailTemplate
                application={selectedApplication}
                products={products}
                onBack={() => setSelectedApplication(null)}
            />
        )
    }

    // Get products by application for counts
    const getProductCount = (appId: string) => {
        return products.filter(p => p.application_id === appId).length
    }

    return (
        <div className="pb-24 bg-gray-50 space-y-6">
            {/* 1. Shop by Applications - 3 Column Grid */}
            <div className="bg-white py-6 px-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Shop by Applications</h2>
                    <button
                        onClick={() => {
                            // Show first application as default when viewing all
                            if (applications.length > 0) {
                                setSelectedApplication(applications[0])
                            }
                        }}
                        className="text-xs font-bold text-blue-600"
                    >
                        View All
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading applications...</div>
                ) : (
                    <div className="grid grid-cols-3 gap-3">
                        {applications.map((app) => (
                            <button
                                key={app.id}
                                onClick={() => setSelectedApplication(app)}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-full aspect-square bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-50 transition-all overflow-hidden">
                                    {app.thumbnail_image ? (
                                        <img
                                            src={app.thumbnail_image}
                                            alt={app.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Package className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    )}
                                </div>
                                <div className="w-full">
                                    <span className="text-xs font-medium text-gray-700 text-center leading-tight line-clamp-2 group-hover:text-blue-700 block">
                                        {app.name}
                                    </span>
                                    <span className="text-[10px] text-gray-500 text-center block mt-0.5">
                                        {getProductCount(app.id)} items
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. Featured Products by Application */}
            {applications.slice(0, 2).map((app) => {
                const appProducts = products.filter(p => p.application_id === app.id).slice(0, 6)

                if (appProducts.length === 0) return null

                return (
                    <div key={app.id} className="bg-white py-6">
                        <div className="px-4 mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{app.name} Products</h2>
                                <p className="text-xs text-gray-500">{app.description || `Top products for ${app.name.toLowerCase()}`}</p>
                            </div>
                            <button
                                onClick={() => setSelectedApplication(app)}
                                className="text-xs font-bold text-blue-600"
                            >
                                View All
                            </button>
                        </div>

                        <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
                            {appProducts.map((product) => (
                                <div key={product.id} className="min-w-[200px] w-[200px] flex-shrink-0">
                                    <ProductCard
                                        product={product}
                                        variant="special"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}

            {/* 3. All Products by Application */}
            <div className="bg-white py-6">
                <div className="px-4 mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Browse All Applications</h2>
                    <p className="text-xs text-gray-500">Explore products by application type</p>
                </div>

                <div className="px-4 space-y-4">
                    {applications.map((app) => {
                        const appProducts = products.filter(p => p.application_id === app.id)

                        if (appProducts.length === 0) return null

                        return (
                            <button
                                key={app.id}
                                onClick={() => setSelectedApplication(app)}
                                className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                            >
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {app.thumbnail_image ? (
                                        <img
                                            src={app.thumbnail_image}
                                            alt={app.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Package className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900">{app.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{appProducts.length} products available</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
