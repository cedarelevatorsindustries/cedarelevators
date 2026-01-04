'use server'

/**
 * CMS Service
 * Service functions for managing CMS content (policies, etc.)
 */

import { createServerSupabase } from '@/lib/supabase/server'
import { CMSPolicy, CreatePolicyData, UpdatePolicyData, PolicyType } from '@/lib/types/cms'

export interface ServiceResult<T> {
    success: boolean
    data?: T
    error?: string
}

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-')   // Replace multiple - with single -
        .replace(/^-+/, '')       // Trim - from start of text
        .replace(/-+$/, '')       // Trim - from end of text
}

/**
 * Get all policies
 */
export async function getPolicies(): Promise<ServiceResult<CMSPolicy[]>> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('cms_policies')
            .select('*')
            .order('policy_type', { ascending: true })

        if (error) {
            console.error('Error fetching policies:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data || [] }
    } catch (error) {
        console.error('Error in getPolicies:', error)
        return { success: false, error: 'Failed to fetch policies' }
    }
}

/**
 * Get a single policy by type
 */
export async function getPolicyByType(type: PolicyType): Promise<ServiceResult<CMSPolicy>> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('cms_policies')
            .select('*')
            .eq('policy_type', type)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                return { success: false, error: 'Policy not found' }
            }
            console.error('Error fetching policy:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in getPolicyByType:', error)
        return { success: false, error: 'Failed to fetch policy' }
    }
}

/**
 * Get all published policies (for public access)
 */
export async function getPublishedPolicies(): Promise<ServiceResult<CMSPolicy[]>> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('cms_policies')
            .select('*')
            .eq('status', 'published')
            .order('policy_type', { ascending: true })

        if (error) {
            console.error('Error fetching published policies:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data || [] }
    } catch (error) {
        console.error('Error in getPublishedPolicies:', error)
        return { success: false, error: 'Failed to fetch published policies' }
    }
}

/**
 * Create a new policy
 */
export async function createPolicy(policyData: CreatePolicyData): Promise<ServiceResult<CMSPolicy>> {
    try {
        const supabase = await createServerSupabase()

        // Generate slug if not provided
        const slug = policyData.slug || slugify(policyData.title)

        const { data, error } = await supabase
            .from('cms_policies')
            .insert({
                policy_type: policyData.policy_type,
                title: policyData.title,
                slug: slug,
                content: policyData.content,
                status: policyData.status || 'draft'
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating policy:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in createPolicy:', error)
        return { success: false, error: 'Failed to create policy' }
    }
}

/**
 * Update an existing policy
 */
export async function updatePolicy(
    id: string,
    policyData: UpdatePolicyData
): Promise<ServiceResult<CMSPolicy>> {
    try {
        const supabase = await createServerSupabase()

        // Prepare update data
        const updates: any = {
            ...policyData,
            updated_at: new Date().toISOString()
        }

        // If title is updated but slug is not, we might want to update slug?
        // Usually we don't auto-update slug on title change to preserve URLs.
        // But if slug is explicitly passed, use it.
        if (policyData.slug) {
            updates.slug = policyData.slug
        }

        const { data, error } = await supabase
            .from('cms_policies')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating policy:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in updatePolicy:', error)
        return { success: false, error: 'Failed to update policy' }
    }
}

/**
 * Delete a policy
 */
export async function deletePolicy(id: string): Promise<ServiceResult<void>> {
    try {
        const supabase = await createServerSupabase()

        const { error } = await supabase
            .from('cms_policies')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting policy:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error in deletePolicy:', error)
        return { success: false, error: 'Failed to delete policy' }
    }
}

/**
 * Get a single published policy by slug
 */
export async function getPublishedPolicyBySlug(slug: string): Promise<ServiceResult<CMSPolicy>> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('cms_policies')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: false, error: 'Policy not found' }
            }
            console.error('Error fetching published policy:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in getPublishedPolicyBySlug:', error)
        return { success: false, error: 'Failed to fetch policy' }
    }
}

