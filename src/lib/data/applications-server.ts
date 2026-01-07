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
            .order('id', { ascending: true })

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
            sort_order: app.sort_order || 0,
            is_active: app.status === 'active',
            status: app.status,
            created_at: app.created_at,
            updated_at: app.updated_at
        }))

        return applications
    } catch (error) {
        console.error("Error fetching applications from Supabase (server):", error)
        return []
    }
}
