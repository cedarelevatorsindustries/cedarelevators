/**
 * Demo Mode Configuration
 * 
 * Set USE_DEMO_DATA to true to use static JSON data instead of Supabase.
 * Perfect for:
 * - Design review
 * - Layout testing
 * - Client feedback sessions
 * - Development without database
 * 
 * Switch back to false when implementing Supabase integration.
 */

export const DEMO_CONFIG = {
    // Enable/disable demo mode globally
    USE_DEMO_DATA: true,

    // Optional: Control demo mode per feature
    features: {
        products: true,
        categories: true,
        banners: true,
        cart: true,
        orders: true,
    }
} as const

// Helper function to check if demo mode is enabled
export function isDemoMode(): boolean {
    return DEMO_CONFIG.USE_DEMO_DATA
}

// Helper function to check demo mode for specific feature
export function isFeatureDemoMode(feature: keyof typeof DEMO_CONFIG.features): boolean {
    return DEMO_CONFIG.USE_DEMO_DATA && DEMO_CONFIG.features[feature]
}
