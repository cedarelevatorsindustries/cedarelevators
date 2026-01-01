/**
 * Why Cedar Features Constants
 * Shared data for "Why Choose Cedar" sections across mobile and desktop
 */

import { Award, Shield, Globe, Headphones, ShieldCheck, Truck, Clock, LucideIcon } from "lucide-react"

export interface WhyCedarFeature {
    icon: LucideIcon
    title: string
    description?: string
}

// Desktop features - with descriptions
export const WHY_CEDAR_FEATURES_DESKTOP: WhyCedarFeature[] = [
    {
        icon: ShieldCheck,
        title: "Quality Assurance",
        description: "Stringent quality checks for all components"
    },
    {
        icon: Truck,
        title: "Fast Delivery",
        description: "Pan-India delivery within 3-5 business days"
    },
    {
        icon: Award,
        title: "Certified Products",
        description: "ISO 9001 certified products"
    },
    {
        icon: Clock,
        title: "24/7 Support",
        description: "Round-the-clock customer support"
    }
]

// Mobile features - compact, no descriptions
export const WHY_CEDAR_FEATURES_MOBILE: WhyCedarFeature[] = [
    {
        icon: Award,
        title: "20+ Years Experience"
    },
    {
        icon: Shield,
        title: "ISO 9001 Certified"
    },
    {
        icon: Globe,
        title: "Global Shipping"
    },
    {
        icon: Headphones,
        title: "Expert Support"
    }
]

// Combined getter
export function getWhyCedarFeatures(variant: 'desktop' | 'mobile' = 'desktop'): WhyCedarFeature[] {
    return variant === 'mobile' ? WHY_CEDAR_FEATURES_MOBILE : WHY_CEDAR_FEATURES_DESKTOP
}
