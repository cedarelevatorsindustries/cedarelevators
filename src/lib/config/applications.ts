// Application to Category Mapping
// Maps application slugs to their associated categories

export interface ApplicationConfig {
    name: string
    slug: string
    subtitle: string
    backgroundImage: string
    categoryHandles: string[] // Category handles that belong to this application
}

export const APPLICATION_CONFIGS: Record<string, ApplicationConfig> = {
    erection: {
        name: "Erection",
        slug: "erection",
        subtitle: "Mechanical components and installation parts for elevator erection",
        backgroundImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1400&h=300&fit=crop",
        categoryHandles: [
            // Add category handles that belong to erection
            "motors",
            "cables",
            "pulleys",
            "guide-rails",
            "machine-room-equipment"
        ]
    },
    testing: {
        name: "Testing",
        slug: "testing",
        subtitle: "Electrical testing equipment and components for quality assurance",
        backgroundImage: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1400&h=300&fit=crop",
        categoryHandles: [
            // Add category handles that belong to testing
            "testing-equipment",
            "sensors",
            "control-panels",
            "safety-devices"
        ]
    },
    service: {
        name: "Service",
        slug: "service",
        subtitle: "Repair, AMC, and maintenance solutions for elevator systems",
        backgroundImage: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1400&h=300&fit=crop",
        categoryHandles: [
            // Add category handles that belong to service
            "spare-parts",
            "maintenance-tools",
            "lubricants",
            "replacement-components"
        ]
    },
    others: {
        name: "Others",
        slug: "others",
        subtitle: "Additional elevator components and accessories",
        backgroundImage: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1400&h=300&fit=crop",
        categoryHandles: [
            // Add category handles that belong to others
            "accessories",
            "signage",
            "lighting",
            "decorative-elements"
        ]
    }
}

// Helper function to get categories for an application
export function getCategoriesForApplication(
    applicationSlug: string,
    allCategories: any[]
): any[] {
    const appConfig = APPLICATION_CONFIGS[applicationSlug]
    if (!appConfig) return allCategories // Return all if config not found

    // Filter categories by handles
    const filtered = allCategories.filter(category =>
        appConfig.categoryHandles.includes(category.handle || category.id)
    )

    // If no matches found, return all categories (for now, until proper mapping is done)
    return filtered.length > 0 ? filtered : allCategories
}

// Helper function to get application config
export function getApplicationConfig(slug: string): ApplicationConfig | null {
    return APPLICATION_CONFIGS[slug] || null
}
