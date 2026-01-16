"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export interface CMSPage {
    id: string
    slug: string
    title: string
    content: string | null
    seo_title: string | null
    seo_description: string | null
    hero_subtitle: string | null
    hero_image_url: string | null
    show_toc: boolean
    show_last_updated: boolean
    is_published: boolean
    version: number
    created_at: string
    updated_at: string
}

/**
 * Get a CMS page by slug for public viewing
 */
export async function getCMSPageBySlug(slug: string): Promise<CMSPage | null> {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
        return null
    }

    const { data, error } = await supabase
        .from("cms_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single()

    if (error || !data) {
        // Return unpublished page structure for empty state
        const { data: unpublished } = await supabase
            .from("cms_pages")
            .select("id, slug, title")
            .eq("slug", slug)
            .single()

        if (unpublished) {
            return {
                ...unpublished,
                content: null,
                seo_title: null,
                seo_description: null,
                hero_subtitle: null,
                hero_image_url: null,
                show_toc: true,
                show_last_updated: true,
                is_published: false,
                version: 1,
                created_at: "",
                updated_at: ""
            }
        }

        return null
    }

    return data as CMSPage
}
