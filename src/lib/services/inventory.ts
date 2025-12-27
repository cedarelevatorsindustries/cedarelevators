import { createServerSupabase } from '@/lib/supabase/server'
import { InventoryAdjustment } from '@/lib/types/inventory'

export class InventoryService {
    /**
     * Adjust stock for a variant
     */
    static async adjustStock(
        adjustment: InventoryAdjustment
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const supabase = await createServerSupabase()

            // Get current stock
            const { data: variant, error: fetchError } = await supabase
                .from('product_variants')
                .select('stock')
                .eq('id', adjustment.variant_id)
                .single()

            if (fetchError || !variant) {
                return { success: false, error: 'Variant not found' }
            }

            let newStock: number

            switch (adjustment.adjust_type) {
                case 'add':
                    newStock = (variant.stock || 0) + adjustment.quantity
                    break
                case 'subtract':
                    newStock = Math.max(0, (variant.stock || 0) - adjustment.quantity)
                    break
                case 'set':
                    newStock = adjustment.quantity
                    break
                default:
                    return { success: false, error: 'Invalid adjustment type' }
            }

            // Update stock
            const { error: updateError } = await supabase
                .from('product_variants')
                .update({ stock: newStock, updated_at: new Date().toISOString() })
                .eq('id', adjustment.variant_id)

            if (updateError) {
                console.error('Error updating stock:', updateError)
                return { success: false, error: updateError.message }
            }

            // Log the adjustment
            await supabase.from('inventory_adjustments').insert({
                variant_id: adjustment.variant_id,
                quantity_change: adjustment.adjust_type === 'subtract' ? -adjustment.quantity : adjustment.quantity,
                reason: adjustment.reason,
                adjustment_type: adjustment.adjust_type,
                previous_quantity: variant.stock || 0,
                new_quantity: newStock,
            })

            return { success: true }
        } catch (error: any) {
            console.error('Error in adjustStock:', error)
            return { success: false, error: error.message || 'Failed to adjust stock' }
        }
    }
}
