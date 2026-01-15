/**
 * Address Management Functions
 * Cedar Elevator Industries
 */

'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import type { ActionResponse, BusinessAddress } from './types'

/**
 * Get business addresses for current user
 */
export async function getBusinessAddresses(): Promise<ActionResponse<BusinessAddress[]>> {
    try {
        const { userId } = await auth()
        if (!userId) return { success: false, error: 'Not authenticated' }

        const supabase = await createServerSupabase()
        const { data, error } = await supabase
            .from('business_addresses')
            .select('*')
            .eq('clerk_user_id', userId)
            .eq('is_active', true)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) return { success: false, error: error.message }
        return { success: true, data: data || [] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Get individual user address
 */
export async function getIndividualAddress(): Promise<ActionResponse<any>> {
    try {
        const { userId } = await auth()
        if (!userId) return { success: false, error: 'Not authenticated' }

        const supabase = await createServerSupabase()
        const { data: address, error } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('clerk_user_id', userId)
            .eq('is_default', true)
            .single()

        if (error && error.code !== 'PGRST116') {
            return { success: false, error: error.message }
        }

        return {
            success: true,
            data: address,
            message: address ? undefined : 'No default address found'
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Add business address
 */
export async function addBusinessAddress(address: BusinessAddress): Promise<ActionResponse<BusinessAddress>> {
    try {
        const { userId } = await auth()
        if (!userId) return { success: false, error: 'Not authenticated' }

        const supabase = await createServerSupabase()

        // If default, unset other defaults
        if (address.is_default) {
            await supabase
                .from('business_addresses')
                .update({ is_default: false })
                .eq('business_id', address.business_id)
                .eq('address_type', address.address_type)
        }

        const { data, error } = await supabase
            .from('business_addresses')
            .insert({ ...address, clerk_user_id: userId })
            .select()
            .single()

        if (error) return { success: false, error: error.message }

        revalidatePath('/checkout')
        return { success: true, data: data!, message: 'Address added successfully' }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Update business address
 */
export async function updateBusinessAddress(
    addressId: string,
    updates: Partial<BusinessAddress>
): Promise<ActionResponse<BusinessAddress>> {
    try {
        const { userId } = await auth()
        if (!userId) return { success: false, error: 'Not authenticated' }

        const supabase = await createServerSupabase()

        // If setting as default, unset others
        if (updates.is_default && updates.business_id && updates.address_type) {
            await supabase
                .from('business_addresses')
                .update({ is_default: false })
                .eq('business_id', updates.business_id)
                .eq('address_type', updates.address_type)
                .neq('id', addressId)
        }

        const { data, error } = await supabase
            .from('business_addresses')
            .update(updates)
            .eq('id', addressId)
            .eq('clerk_user_id', userId)
            .select()
            .single()

        if (error) return { success: false, error: error.message }

        revalidatePath('/checkout')
        return { success: true, data: data!, message: 'Address updated successfully' }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Delete business address (soft delete)
 */
export async function deleteBusinessAddress(addressId: string): Promise<ActionResponse<void>> {
    try {
        const { userId } = await auth()
        if (!userId) return { success: false, error: 'Not authenticated' }

        const supabase = await createServerSupabase()
        const { error } = await supabase
            .from('business_addresses')
            .update({ is_active: false })
            .eq('id', addressId)
            .eq('clerk_user_id', userId)

        if (error) return { success: false, error: error.message }

        revalidatePath('/checkout')
        return { success: true, message: 'Address deleted successfully' }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
