'use server'

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================================================
// Types
// ============================================================================

export interface WarrantyHero {
    id: string
    title: string
    description: string
}

export interface WarrantyPeriod {
    id: string
    months: number
    warranty_type: string
    applies_to: string
}

export interface WarrantyCoverage {
    id: string
    level_type: 'application' | 'category' | 'subcategory'
    reference_id: string | null
    reference_name: string
    duration: string
    coverage_text: string
    sort_order: number
}

export interface WarrantyClaimStep {
    id: string
    step_number: number
    title: string
    description: string
    sort_order: number
}

export interface WarrantyData {
    hero: WarrantyHero | null
    period: WarrantyPeriod | null
    coverage: WarrantyCoverage[]
    claimSteps: WarrantyClaimStep[]
}

// ============================================================================
// Fetch All Data (Admin)
// ============================================================================

export async function getWarrantyDataAction(): Promise<{ data: WarrantyData | null; error: string | null }> {
    try {
        const supabase = createServerSupabaseClient()

        if (!supabase) {
            return { data: null, error: 'Failed to create database client' }
        }

        // Fetch hero
        const { data: hero, error: heroError } = await supabase
            .from('warranty_hero')
            .select('*')
            .single()

        if (heroError && heroError.code !== 'PGRST116') {
            console.error('Error fetching warranty hero:', heroError)
        }

        // Fetch period
        const { data: period, error: periodError } = await supabase
            .from('warranty_period')
            .select('*')
            .single()

        if (periodError && periodError.code !== 'PGRST116') {
            console.error('Error fetching warranty period:', periodError)
        }

        // Fetch coverage
        const { data: coverage, error: coverageError } = await supabase
            .from('warranty_coverage')
            .select('*')
            .order('sort_order', { ascending: true })

        if (coverageError) {
            console.error('Error fetching warranty coverage:', coverageError)
        }

        // Fetch claim steps
        const { data: claimSteps, error: claimStepsError } = await supabase
            .from('warranty_claim_steps')
            .select('*')
            .order('sort_order', { ascending: true })

        if (claimStepsError) {
            console.error('Error fetching warranty claim steps:', claimStepsError)
        }

        return {
            data: {
                hero: hero || null,
                period: period || null,
                coverage: coverage || [],
                claimSteps: claimSteps || []
            },
            error: null
        }
    } catch (error) {
        console.error('Error in getWarrantyDataAction:', error)
        return { data: null, error: 'Failed to fetch warranty data' }
    }
}

// ============================================================================
// Hero Actions
// ============================================================================

export async function updateWarrantyHeroAction(data: { title: string; description: string }): Promise<{ error: string | null }> {
    try {
        const supabase = createAdminClient()

        // Get the hero ID first
        const { data: heroData } = await supabase
            .from('warranty_hero')
            .select('id')
            .single()

        const { error } = await supabase
            .from('warranty_hero')
            .update({
                title: data.title,
                description: data.description
            })
            .eq('id', heroData?.id)

        if (error) throw error

        revalidatePath('/warranty')
        revalidatePath('/admin/settings/cms/warranty')

        return { error: null }
    } catch (error) {
        console.error('Error updating warranty hero:', error)
        return { error: 'Failed to update hero section' }
    }
}

// ============================================================================
// Period Actions
// ============================================================================

export async function updateWarrantyPeriodAction(data: { months: number; warranty_type: string; applies_to: string }): Promise<{ error: string | null }> {
    try {
        const supabase = createAdminClient()

        // Get the period ID first
        const { data: periodData } = await supabase
            .from('warranty_period')
            .select('id')
            .single()

        const { error } = await supabase
            .from('warranty_period')
            .update({
                months: data.months,
                warranty_type: data.warranty_type,
                applies_to: data.applies_to
            })
            .eq('id', periodData?.id)

        if (error) throw error

        revalidatePath('/warranty')
        revalidatePath('/admin/settings/cms/warranty')

        return { error: null }
    } catch (error) {
        console.error('Error updating warranty period:', error)
        return { error: 'Failed to update period section' }
    }
}

// ============================================================================
// Coverage Actions
// ============================================================================

export async function createWarrantyCoverageAction(data: Omit<WarrantyCoverage, 'id' | 'sort_order'>): Promise<{ error: string | null }> {
    try {
        const supabase = createAdminClient()

        // Get max sort order
        const { data: existing } = await supabase
            .from('warranty_coverage')
            .select('sort_order')
            .order('sort_order', { ascending: false })
            .limit(1)
            .single()

        const sortOrder = (existing?.sort_order || 0) + 1

        const { error } = await supabase
            .from('warranty_coverage')
            .insert({
                ...data,
                sort_order: sortOrder
            })

        if (error) throw error

        revalidatePath('/warranty')
        revalidatePath('/admin/settings/cms/warranty')

        return { error: null }
    } catch (error) {
        console.error('Error creating warranty coverage:', error)
        return { error: 'Failed to create coverage item' }
    }
}

export async function updateWarrantyCoverageAction(id: string, data: { duration: string; coverage_text: string }): Promise<{ error: string | null }> {
    try {
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('warranty_coverage')
            .update({
                duration: data.duration,
                coverage_text: data.coverage_text
            })
            .eq('id', id)

        if (error) throw error

        revalidatePath('/warranty')
        revalidatePath('/admin/settings/cms/warranty')

        return { error: null }
    } catch (error) {
        console.error('Error updating warranty coverage:', error)
        return { error: 'Failed to update coverage item' }
    }
}

export async function deleteWarrantyCoverageAction(id: string): Promise<{ error: string | null }> {
    try {
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('warranty_coverage')
            .delete()
            .eq('id', id)

        if (error) throw error

        revalidatePath('/warranty')
        revalidatePath('/admin/settings/cms/warranty')

        return { error: null }
    } catch (error) {
        console.error('Error deleting warranty coverage:', error)
        return { error: 'Failed to delete coverage item' }
    }
}

export async function bulkSaveWarrantyCoverageAction(items: Array<{ id?: string; level_type: string; reference_id: string | null; reference_name: string; duration: string; coverage_text: string }>): Promise<{ error: string | null }> {
    try {
        const supabase = createAdminClient()

        // For each item, upsert (update if exists, insert if new)
        for (let i = 0; i < items.length; i++) {
            const item = items[i]

            if (item.id) {
                // Update existing
                const { error } = await supabase
                    .from('warranty_coverage')
                    .update({
                        duration: item.duration,
                        coverage_text: item.coverage_text
                    })
                    .eq('id', item.id)

                if (error) throw error
            } else {
                // Insert new
                const { error } = await supabase
                    .from('warranty_coverage')
                    .insert({
                        level_type: item.level_type,
                        reference_id: item.reference_id,
                        reference_name: item.reference_name,
                        duration: item.duration,
                        coverage_text: item.coverage_text,
                        sort_order: i + 1
                    })

                if (error) throw error
            }
        }

        revalidatePath('/warranty')
        revalidatePath('/admin/settings/cms/warranty')

        return { error: null }
    } catch (error) {
        console.error('Error bulk saving warranty coverage:', error)
        return { error: 'Failed to save coverage items' }
    }
}

// ============================================================================
// Claim Steps Actions
// ============================================================================

export async function updateWarrantyClaimStepAction(id: string, data: { title: string; description: string }): Promise<{ error: string | null }> {
    try {
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('warranty_claim_steps')
            .update({
                title: data.title,
                description: data.description
            })
            .eq('id', id)

        if (error) throw error

        revalidatePath('/warranty')
        revalidatePath('/admin/settings/cms/warranty')

        return { error: null }
    } catch (error) {
        console.error('Error updating warranty claim step:', error)
        return { error: 'Failed to update claim step' }
    }
}

export async function bulkSaveWarrantyClaimStepsAction(steps: Array<{ id?: string; step_number: number; title: string; description: string }>): Promise<{ error: string | null }> {
    try {
        const supabase = createAdminClient()

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i]

            if (step.id) {
                const { error } = await supabase
                    .from('warranty_claim_steps')
                    .update({
                        step_number: step.step_number,
                        title: step.title,
                        description: step.description
                    })
                    .eq('id', step.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('warranty_claim_steps')
                    .insert({
                        step_number: step.step_number,
                        title: step.title,
                        description: step.description,
                        sort_order: i + 1
                    })

                if (error) throw error
            }
        }

        revalidatePath('/warranty')
        revalidatePath('/admin/settings/cms/warranty')

        return { error: null }
    } catch (error) {
        console.error('Error bulk saving warranty claim steps:', error)
        return { error: 'Failed to save claim steps' }
    }
}

// ============================================================================
// Fetch Applications, Categories, Subcategories
// ============================================================================

export async function getApplicationsForWarrantyAction(): Promise<{ data: Array<{ id: string; name: string }>; error: string | null }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) return { data: [], error: 'Failed to create database client' }

        const { data, error } = await supabase
            .from('applications')
            .select('id, title')
            .order('title')

        if (error) throw error

        return { data: (data || []).map(item => ({ id: item.id, name: item.title })), error: null }
    } catch (error) {
        console.error('Error fetching applications:', error)
        return { data: [], error: 'Failed to fetch applications' }
    }
}

export async function getCategoriesForWarrantyAction(): Promise<{ data: Array<{ id: string; name: string }>; error: string | null }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) return { data: [], error: 'Failed to create database client' }

        const { data, error } = await supabase
            .from('categories')
            .select('id, title')
            .order('title')

        if (error) throw error

        return { data: (data || []).map(item => ({ id: item.id, name: item.title })), error: null }
    } catch (error) {
        console.error('Error fetching categories:', error)
        return { data: [], error: 'Failed to fetch categories' }
    }
}

export async function getSubcategoriesForWarrantyAction(): Promise<{ data: Array<{ id: string; name: string }>; error: string | null }> {
    try {
        const supabase = createServerSupabaseClient()
        if (!supabase) return { data: [], error: 'Failed to create database client' }

        const { data, error } = await supabase
            .from('subcategories')
            .select('id, title')
            .order('title')

        if (error) throw error

        return { data: (data || []).map(item => ({ id: item.id, name: item.title })), error: null }
    } catch (error) {
        console.error('Error fetching subcategories:', error)
        return { data: [], error: 'Failed to fetch subcategories' }
    }
}
