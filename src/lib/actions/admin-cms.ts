"use server"

import { createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface CMSPageInput {
    title: string
    slug: string
    content?: string | null
    seo_title?: string | null
    seo_description?: string | null
    hero_subtitle?: string | null
    hero_image_url?: string | null
    show_toc?: boolean
    show_last_updated?: boolean
    is_published?: boolean
}

export interface CMSPageFull {
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
    created_by: string | null
    updated_by: string | null
}

/**
 * Get all CMS pages (admin only)
 */
export async function getAllCMSPages(): Promise<CMSPageFull[]> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from("cms_pages")
        .select("*")
        .order("title", { ascending: true })

    if (error) {
        console.error("Error fetching CMS pages:", error)
        throw new Error("Failed to fetch CMS pages")
    }

    return data as CMSPageFull[]
}

/**
 * Get a single CMS page by ID (admin only)
 */
export async function getCMSPageById(id: string): Promise<CMSPageFull | null> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from("cms_pages")
        .select("*")
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching CMS page:", error)
        return null
    }

    return data as CMSPageFull
}

/**
 * Create a new CMS page
 */
export async function createCMSPage(input: CMSPageInput): Promise<{ success: boolean; id?: string; error?: string }> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from("cms_pages")
        .insert([input])
        .select()
        .single()

    if (error) {
        console.error("Error creating CMS page:", error)
        return { success: false, error: error.message }
    }

    revalidatePath("/admin/settings/cms")
    revalidatePath(`/${input.slug}`)

    return { success: true, id: data.id }
}

/**
 * Update an existing CMS page
 */
export async function updateCMSPage(
    id: string,
    input: Partial<CMSPageInput>
): Promise<{ success: boolean; error?: string }> {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from("cms_pages")
        .update(input)
        .eq("id", id)

    if (error) {
        console.error("Error updating CMS page:", error)
        return { success: false, error: error.message }
    }

    // Revalidate admin list and the public page
    revalidatePath("/admin/settings/cms")

    // Get the slug to revalidate the public page
    const { data: page } = await supabase
        .from("cms_pages")
        .select("slug")
        .eq("id", id)
        .single()

    if (page) {
        revalidatePath(`/${page.slug}`)
    }

    return { success: true }
}

/**
 * Delete a CMS page
 */
export async function deleteCMSPage(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createAdminClient()

    // Get slug before deleting for revalidation
    const { data: page } = await supabase
        .from("cms_pages")
        .select("slug")
        .eq("id", id)
        .single()

    const { error } = await supabase
        .from("cms_pages")
        .delete()
        .eq("id", id)

    if (error) {
        console.error("Error deleting CMS page:", error)
        return { success: false, error: error.message }
    }

    revalidatePath("/admin/settings/cms")
    if (page) {
        revalidatePath(`/${page.slug}`)
    }

    return { success: true }
}

/**
 * Publish a CMS page
 */
export async function publishCMSPage(id: string): Promise<{ success: boolean; error?: string }> {
    return updateCMSPage(id, { is_published: true })
}

/**
 * Unpublish a CMS page
 */
export async function unpublishCMSPage(id: string): Promise<{ success: boolean; error?: string }> {
    return updateCMSPage(id, { is_published: false })
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

/**
 * Duplicate a CMS page
 */
export async function duplicateCMSPage(id: string): Promise<{ success: boolean; id?: string; error?: string }> {
    const supabase = createAdminClient()

    // Get the original page
    const { data: original, error: fetchError } = await supabase
        .from("cms_pages")
        .select("*")
        .eq("id", id)
        .single()

    if (fetchError || !original) {
        return { success: false, error: "Page not found" }
    }

    // Create a copy with modified title and slug
    const copy: CMSPageInput = {
        title: `${original.title} (Copy)`,
        slug: `${original.slug}-copy`,
        content: original.content,
        seo_title: original.seo_title,
        seo_description: original.seo_description,
        hero_subtitle: original.hero_subtitle,
        hero_image_url: original.hero_image_url,
        show_toc: original.show_toc,
        show_last_updated: original.show_last_updated,
        is_published: false // Always start as draft
    }

    return createCMSPage(copy)
}
