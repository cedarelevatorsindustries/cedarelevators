/**
 * Helper to fetch pickup locations from database
 */

'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import type { PickupLocation } from '@/modules/checkout/types/checkout-ui'

export async function getPickupLocations(): Promise<PickupLocation[]> {
    try {
        const supabase = await createServerSupabase()

        const { data, error } = await supabase
            .from('pickup_locations')
            .select('*')
            .eq('is_active', true)
            .order('city')

        if (error) {
            console.error('Error fetching pickup locations:', error)
            return []
        }

        return data as PickupLocation[]
    } catch (error) {
        console.error('Failed to fetch pickup locations:', error)
        return []
    }
}
