/**
 * Banner Management Types for Cedar Elevators
 */

// Banner placement locations across the storefront
export type BannerPlacement =
    | 'hero-carousel'        // Main homepage carousel
    | 'category-header'      // Top of category pages
    | 'application-header'   // Top of application pages
    | 'announcement-bar'     // Persistent top bar
    | 'collection-banner'    // Collection promotional banners

// What the banner targets
export type BannerTargetType = 'category' | 'application' | 'collection' | 'all'

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
    target_type?: BannerTargetType | null
    target_id?: string | null
    cta_text?: string | null
    cta_link?: string | null
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
}

/**
 * Banner with computed status
 */
export interface BannerWithStatus extends Banner {
    status: BannerStatus
}

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
    placement: BannerPlacement
    target_type?: BannerTargetType
    target_id?: string
    cta_text?: string
    cta_link?: string
    cta_style?: BannerCtaStyle
    start_date?: string
    end_date?: string
    is_active?: boolean
    position?: number
    background_color?: string
    text_color?: string
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

/**
 * Available banner placements with metadata
 */
export const BANNER_PLACEMENTS: PlacementConfig[] = [
    {
        id: 'hero-carousel',
        label: 'Homepage Hero Carousel',
        description: 'Main banner slider on the homepage',
        aspectRatio: '16:9',
        recommendedSize: '1920x1080',
        icon: 'Layout'
    },
    {
        id: 'category-header',
        label: 'Category Page Header',
        description: 'Banner at the top of category listing pages',
        aspectRatio: '21:9',
        recommendedSize: '1920x480',
        icon: 'FolderOpen'
    },
    {
        id: 'application-header',
        label: 'Application Page Header',
        description: 'Banner for application pages (Residential, Commercial, etc.)',
        aspectRatio: '21:9',
        recommendedSize: '1920x480',
        icon: 'Layers'
    },
    {
        id: 'announcement-bar',
        label: 'Announcement Bar',
        description: 'Thin persistent bar at the top of the website',
        aspectRatio: 'N/A',
        recommendedSize: 'Text only or small icon',
        icon: 'Bell'
    },
    {
        id: 'collection-banner',
        label: 'Collection Banner',
        description: 'Promotional banner for featured collections',
        aspectRatio: '16:9',
        recommendedSize: '1200x675',
        icon: 'Grid'
    }
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
