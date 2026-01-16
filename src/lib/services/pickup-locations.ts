'use server'

import { createAdminClient } from '@/lib/supabase/server'

export interface PickupLocationData {
    name: string
    address: string
    city: string
    state?: string
    postal_code?: string
    phone?: string
    hours?: string
    is_active?: boolean
}

export interface PickupLocation extends PickupLocationData {
    id: string
    created_at: string
    updated_at: string
}

/**
 * Get all pickup locations (admin view)
 */
export async function getAllPickupLocations() {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('pickup_locations')
            .select('*')
            .order('city')

        if (error) {
            console.error('Error fetching pickup locations:', error)
            return { success: false, error: error.message, data: null }
        }

        return { success: true, data: data as PickupLocation[], error: null }
    } catch (error) {
        console.error('Failed to fetch pickup locations:', error)
        return { success: false, error: 'Failed to fetch pickup locations', data: null }
    }
}

/**
 * Create a new pickup location
 */
export async function createPickupLocation(locationData: PickupLocationData) {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('pickup_locations')
            .insert([locationData])
            .select()
            .single()

        if (error) {
            console.error('Error creating pickup location:', error)
            return { success: false, error: error.message, data: null }
        }

        return { success: true, data: data as PickupLocation, error: null }
    } catch (error) {
        console.error('Failed to create pickup location:', error)
        return { success: false, error: 'Failed to create pickup location', data: null }
    }
}

/**
 * Update a pickup location
 */
export async function updatePickupLocation(id: string, locationData: Partial<PickupLocationData>) {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('pickup_locations')
            .update({ ...locationData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating pickup location:', error)
            return { success: false, error: error.message, data: null }
        }

        return { success: true, data: data as PickupLocation, error: null }
    } catch (error) {
        console.error('Failed to update pickup location:', error)
        return { success: false, error: 'Failed to update pickup location', data: null }
    }
}

/**
 * Delete a pickup location
 */
export async function deletePickupLocation(id: string) {
    try {
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('pickup_locations')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting pickup location:', error)
            return { success: false, error: error.message }
        }

        return { success: true, error: null }
    } catch (error) {
        console.error('Failed to delete pickup location:', error)
        return { success: false, error: 'Failed to delete pickup location' }
    }
}

/**
 * Toggle active status of a pickup location
 */
export async function togglePickupLocationStatus(id: string, isActive: boolean) {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('pickup_locations')
            .update({ is_active: isActive, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error toggling pickup location status:', error)
            return { success: false, error: error.message, data: null }
        }

        return { success: true, data: data as PickupLocation, error: null }
    } catch (error) {
        console.error('Failed to toggle pickup location status:', error)
        return { success: false, error: 'Failed to toggle status', data: null }
    }
}
