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
