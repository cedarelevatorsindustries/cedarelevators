"use client"

import { Award, Shield, Globe, Headphones, ShieldCheck, Truck, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Feature {
    icon: React.ReactNode
    title: string
    description?: string
}

interface WhyCedarSectionProps {
    variant?: 'desktop' | 'mobile'
}

// Desktop features with descriptions
const desktopFeatures: Feature[] = [
    {
        icon: <ShieldCheck size={24} />,
        title: "Quality Assurance",
        description: "Stringent quality checks for all components"
    },
    {
        icon: <Truck size={24} />,
        title: "Fast Delivery",
        description: "Pan-India delivery within 3-5 business days"
    },
    {
        icon: <Award size={24} />,
        title: "Certified Products",
        description: "ISO 9001 certified products"
    },
    {
        icon: <Clock size={24} />,
        title: "24/7 Support",
        description: "Round-the-clock customer support"
    }
]

// Mobile features - simpler, more compact
const mobileFeatures: Feature[] = [
    {
        icon: <Award size={32} className="text-primary" />,
        title: "20+ Years Experience"
    },
    {
        icon: <Shield size={32} className="text-primary" />,
        title: "ISO 9001 Certified"
    },
    {
        icon: <Globe size={32} className="text-primary" />,
        title: "Global Shipping"
    },
    {
        icon: <Headphones size={32} className="text-primary" />,
        title: "Expert Support"
    }
]

/**
 * Unified Why Cedar Section
 * Responsive component that handles both mobile and desktop layouts
 */
export function WhyCedarSection({ variant = 'desktop' }: WhyCedarSectionProps) {
    const isMobile = variant === 'mobile'
    const features = isMobile ? mobileFeatures : desktopFeatures

    if (isMobile) {
        return (
            <div className="px-4 py-8 bg-white">
                <h3 className="text-gray-900 text-lg font-bold leading-tight tracking-[-0.015em] pb-3 text-center">
                    WHY CEDAR?
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center gap-2 rounded-lg bg-gray-50 p-4 text-center border border-gray-200"
                        >
                            {feature.icon}
                            <p className="text-sm font-medium text-gray-900">
                                {feature.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="pl-12 pr-12">
            <h2 className="text-[#181411] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">
                Why Choose Cedar?
            </h2>
            <div className="flex flex-col gap-10 py-10 @container">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-0">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="flex flex-1 gap-3 rounded-lg border border-[#e6e0db] bg-white p-4 flex-col"
                        >
                            <div className="text-blue-500">
                                {feature.icon}
                            </div>
                            <div className="flex flex-col gap-1">
                                <h2 className="text-[#181411] text-base font-bold leading-tight">
                                    {feature.title}
                                </h2>
                                {feature.description && (
                                    <p className="text-[#8a7560] text-sm font-normal leading-normal">
                                        {feature.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default WhyCedarSection

