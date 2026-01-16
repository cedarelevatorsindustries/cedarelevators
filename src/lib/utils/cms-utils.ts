/**
 * Map URL path to CMS page slug
 */
export function getSlugFromPath(path: string): string {
    const slugMap: Record<string, string> = {
        "/about": "about-us",
        "/why-choose": "why-choose-cedar",
        "/warranty": "warranty-information",
        "/privacy": "privacy-policy",
        "/terms": "terms-conditions",
        "/return-policy": "return-policy",
        "/shipping-policy": "shipping-policy"
    }

    return slugMap[path] || path.replace("/", "")
}

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}
