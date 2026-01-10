import { createAdminClient } from "@/lib/supabase/server"
import { Application } from "./applications"

/**
 * List all active applications for public display (Server-side only)
 * Uses Admin Client to bypass RLS, ensuring guest users can see public active applications
 */
export async function listApplicationsServer(): Promise<Application[]> {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('status', 'active')
            .eq('status', 'active')
        // Remove DB sort to handle nulls in JS
        // .order('product_card_position', { ascending: true })

        if (error) {
            console.error("Error fetching applications (server):", error)
            return []
        }

        // Map database fields to Application interface
        const applications = (data || []).map((app: any) => ({
            id: app.id,
            name: app.title || app.name,
            slug: app.handle || app.slug,
            description: app.subtitle || app.description,
            image_url: app.banner_url || app.image_url,
            thumbnail_image: app.thumbnail || app.thumbnail_image,
            banner_image: app.banner_url || app.banner_image,
            image_alt: app.title || app.name,
            icon: (app.title || app.name)?.toLowerCase(),
            card_position: app.product_card_position || 0,
            sort_order: app.sort_order || 0,
            is_active: app.status === 'active',
            status: app.status,
            created_at: app.created_at,
            updated_at: app.updated_at
        }))

        // Absolute positioning with gap filling
        // Ensure all positions are numbers
        const positioned = applications.filter((app: any) => Number(app.card_position || 0) > 0)
        const unpositioned = applications.filter((app: any) => !app.card_position || Number(app.card_position) === 0)

        // Sort unpositioned items alphabetically
        unpositioned.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''))

        const result: Application[] = []
        const maxPosition = positioned.length > 0 ? Math.max(...positioned.map((app: any) => Number(app.card_position))) : 0
        let unpositionedIndex = 0

        for (let i = 1; i <= maxPosition; i++) {
            const itemAtPosition = positioned.find((app: any) => Number(app.card_position) === i)

            if (itemAtPosition) {
                result.push(itemAtPosition)
            } else {
                if (unpositionedIndex < unpositioned.length) {
                    result.push(unpositioned[unpositionedIndex])
                    unpositionedIndex++
                }
            }
        }

        if (unpositionedIndex < unpositioned.length) {
            result.push(...unpositioned.slice(unpositionedIndex))
        }

        return result
    } catch (error) {
        console.error("Error fetching applications from Supabase (server):", error)
        return []
    }
}
