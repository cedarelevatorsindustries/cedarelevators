'use server'

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================================================
// Types
// ============================================================================

export type PolicyType = 'privacy' | 'terms' | 'return' | 'shipping'
export type PolicyStatus = 'draft' | 'published'
export type SectionContentType = 'paragraph' | 'bullet' | 'numbered' | 'table'

export interface PolicySection {
    id: string
    title: string
    content: string
    content_type: SectionContentType
    items?: string[] // For bullet/numbered lists
    table_data?: { headers: string[]; rows: string[][] } // For tables
    order: number
}

export interface Policy {
    id: string
    policy_type: PolicyType
    title: string
    last_updated: string
    content: PolicySection[]
    status: PolicyStatus
    created_at: string
    updated_at: string
}

// ============================================================================
// Fetch All Policies
// ============================================================================

export async function getPoliciesAction(): Promise<{ data: Policy[] | null; error: string | null }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) return { data: null, error: 'Failed to create database client' }

        const { data, error } = await supabase
            .from('policies')
            .select('*')
            .order('policy_type', { ascending: true })

        if (error) throw error

        return {
            data: data as Policy[],
            error: null
        }
    } catch (error) {
        console.error('Error fetching policies:', error)
        return { data: null, error: 'Failed to fetch policies' }
    }
}

// ============================================================================
// Fetch Policy by Type
// ============================================================================

export async function getPolicyByTypeAction(policyType: PolicyType): Promise<{ data: Policy | null; error: string | null }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) return { data: null, error: 'Failed to create database client' }

        const { data, error } = await supabase
            .from('policies')
            .select('*')
            .eq('policy_type', policyType)
            .eq('status', 'published')
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching policy:', error)
        }

        return {
            data: data as Policy | null,
            error: null
        }
    } catch (error) {
        console.error('Error fetching policy:', error)
        return { data: null, error: 'Failed to fetch policy' }
    }
}

// ============================================================================
// Upsert Policy (Create or Update)
// ============================================================================

export async function upsertPolicyAction(
    policyType: PolicyType,
    data: { title: string; content: PolicySection[]; last_updated: string }
): Promise<{ error: string | null }> {
    try {
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('policies')
            .upsert({
                policy_type: policyType,
                title: data.title,
                content: data.content,
                last_updated: data.last_updated,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'policy_type'
            })

        if (error) throw error

        // Revalidate relevant paths
        const pathMap = {
            'privacy': '/privacy',
            'terms': '/terms',
            'return': '/return-policy',
            'shipping': '/shipping-policy'
        }

        revalidatePath(pathMap[policyType])
        revalidatePath('/admin/settings/cms/policies')

        return { error: null }
    } catch (error) {
        console.error('Error upserting policy:', error)
        return { error: 'Failed to save policy' }
    }
}

// ============================================================================
// Update Policy Status
// ============================================================================

export async function updatePolicyStatusAction(
    policyType: PolicyType,
    status: PolicyStatus
): Promise<{ error: string | null }> {
    try {
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('policies')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('policy_type', policyType)

        if (error) throw error

        // Revalidate relevant paths
        const pathMap = {
            'privacy': '/privacy',
            'terms': '/terms',
            'return': '/return-policy',
            'shipping': '/shipping-policy'
        }

        revalidatePath(pathMap[policyType])
        revalidatePath('/admin/settings/cms/policies')

        return { error: null }
    } catch (error) {
        console.error('Error updating policy status:', error)
        return { error: 'Failed to update policy status' }
    }
}
