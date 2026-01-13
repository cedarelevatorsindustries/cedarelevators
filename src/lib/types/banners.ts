/**
 * Banner Management Types for Cedar Elevators
 * 
 * Banner Management handles ONLY:
 * - Catalog Carousel
 * 
 * Entity banners (category/application/type headers) are managed in their respective modules.
 */

// Banner placement - ONLY Catalog Carousel
// Other placements moved to entity tables (categories.banner_image, etc.)
export type BannerPlacement =
    | 'hero-carousel'        // Catalog Carousel
    | 'all-products-carousel' // Alias for hero-carousel

// DEPRECATED placements (moved to entity modules):
// - 'category-header' → categories.banner_image
// - 'application-header' → categories.banner_image (where application type)
// - 'collection-banner' → collections.banner_image
// - 'announcement-bar' → Out of scope

// What the banner links to (carousel navigation)
export type BannerLinkType = 'application' | 'category' | 'elevator-type' | 'collection'

// DEPRECATED: Use BannerLinkType instead
export type BannerTargetType = BannerLinkType

// CTA button styles
export type BannerCtaStyle = 'primary' | 'secondary' | 'outline'

// Computed banner status
export type BannerStatus = 'active' | 'scheduled' | 'expired' | 'disabled'

/**
 * Banner entity from database
 */
export interface Banner {
    id: string
    title: string
    subtitle?: string | null
    internal_name: string
    image_url: string
    image_alt?: string | null
    mobile_image_url?: string | null
    placement: BannerPlacement
    // Collection association (null = general catalog banner)
    collection_id?: string | null
    // Link destination (required for carousel banners)
    link_type?: BannerLinkType | null  // Preferred: use this
    link_id?: string | null             // Preferred: use this
    // DEPRECATED: Use link_type/link_id instead
    target_type?: BannerTargetType | null
    target_id?: string | null
    cta_text?: string | null // REQUIRED for carousel banners
    cta_link?: string | null // Optional manual override (use link_type/link_id instead)
    cta_style: BannerCtaStyle
    start_date?: string | null
    end_date?: string | null
    is_active: boolean
    position: number
    background_color?: string | null
    text_color: string
    created_at: string
    updated_at: string
    created_by?: string | null
    // New slides column - single table architecture
    slides?: BannerSlide[] | null
}

/**
 * Banner with computed status
 */
export interface BannerWithStatus extends Banner {
    status: BannerStatus
}

/**
 * Banner Slide entity - for multiple images per banner
 */
export interface BannerSlide {
    id: string
    banner_id: string
    image_url: string
    mobile_image_url?: string | null
    image_alt?: string | null
    sort_order: number
    created_at?: string
    updated_at?: string
}

// DEPRECATED: BannerWithSlides is now just Banner
export type BannerWithSlides = Banner

/**
 * Form data for creating/editing banners
 */
export interface BannerFormData {
    title: string
    subtitle?: string
    internal_name: string
    image_url?: string
    image_alt?: string
    mobile_image_url?: string
    placement?: BannerPlacement // Default to 'hero-carousel'
    collection_id?: string | null // Collection association
    // Link destination (required for carousel)
    link_type?: BannerLinkType
    link_id?: string
    // DEPRECATED: Use link_type/link_id instead
    target_type?: BannerTargetType
    target_id?: string
    cta_text?: string // REQUIRED for carousel
    cta_link?: string // Optional manual override
    cta_style?: BannerCtaStyle
    start_date?: string
    end_date?: string
    is_active?: boolean
    position?: number
    background_color?: string
    text_color?: string
    slides?: BannerSlide[]
}

/**
 * Filters for banner queries
 */
export interface BannerFilters {
    placement?: BannerPlacement
    status?: BannerStatus
    target_type?: BannerTargetType
    search?: string
}

/**
 * Banner statistics
 */
export interface BannerStats {
    total: number
    active: number
    scheduled: number
    expired: number
    disabled: number
}

/**
 * Placement configuration for UI
 */
export interface PlacementConfig {
    id: BannerPlacement
    label: string
    description: string
    aspectRatio: string
    recommendedSize: string
    icon: string
}

// Banner placement - ONLY Catalog Carousel
// Other placements moved to entity tables (categories.banner_image, etc.)
export const BANNER_PLACEMENTS: PlacementConfig[] = [
    {
        id: 'hero-carousel', // Internal ID kept for compatibility
        label: 'Catalog Carousel',
        description: 'Catalog carousel for product discovery navigation (3-5 slides recommended)',
        aspectRatio: '16:9',
        recommendedSize: '1920x1080',
        icon: 'Layout'
    },
    // DEPRECATED placements - managed in entity modules:
    // {
    //     id: 'category-header',
    //     label: 'Category Page Header',
    //     description: 'NOW MANAGED IN: Category Module → Visual Identity → Banner Image',
    //     ...
    // },
]

/**
 * Helper to compute banner status
 */
export function computeBannerStatus(banner: Banner): BannerStatus {
    if (!banner.is_active) return 'disabled'

    const now = new Date()

    if (banner.start_date && new Date(banner.start_date) > now) {
        return 'scheduled'
    }

    if (banner.end_date && new Date(banner.end_date) < now) {
        return 'expired'
    }

    return 'active'
}

/**
 * Helper to add status to banners
 */
export function withStatus(banners: Banner[]): BannerWithStatus[] {
    return banners.map(banner => ({
        ...banner,
        status: computeBannerStatus(banner)
    }))
}

