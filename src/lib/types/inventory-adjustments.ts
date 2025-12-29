/**
 * Inventory Adjustment Types for Cedar Elevators
 * Phase 4: Simplified inventory management with manual adjustments
 */

// Adjustment Types
export type AdjustmentType = 'set' | 'add' | 'reduce' | 'recount'

// Adjustment Reasons
export type AdjustmentReason =
  | 'damaged'
  | 'lost'
  | 'found'
  | 'returned'
  | 'expired'
  | 'supplier_error'
  | 'physical_recount'
  | 'warehouse_transfer'
  | 'initial_stock'
  | 'correction'
  | 'other'

// Inventory Adjustment Entity
export interface InventoryAdjustment {
  id: string
  product_id: string
  adjustment_type: AdjustmentType
  quantity_before: number
  quantity_after: number
  quantity_changed: number
  reason: string
  notes?: string
  adjusted_by: string // Admin clerk_user_id
  adjusted_by_name?: string
  created_at: string
}

// Inventory Adjustment Form Data
export interface InventoryAdjustmentFormData {
  product_id: string
  adjustment_type: AdjustmentType
  quantity: number // The value to set/add/reduce
  reason: AdjustmentReason | string
  notes?: string
}

// Adjustment Reason Options for UI
export const ADJUSTMENT_REASON_OPTIONS: { value: AdjustmentReason; label: string }[] = [
  { value: 'damaged', label: 'Damaged Items' },
  { value: 'lost', label: 'Lost/Missing Items' },
  { value: 'found', label: 'Found Items' },
  { value: 'returned', label: 'Customer Returns' },
  { value: 'expired', label: 'Expired/Obsolete' },
  { value: 'supplier_error', label: 'Supplier Error' },
  { value: 'physical_recount', label: 'Physical Recount' },
  { value: 'warehouse_transfer', label: 'Warehouse Transfer' },
  { value: 'initial_stock', label: 'Initial Stock Entry' },
  { value: 'correction', label: 'Data Correction' },
  { value: 'other', label: 'Other' },
]

// Get adjustment reason label
export function getAdjustmentReasonLabel(reason: string): string {
  const option = ADJUSTMENT_REASON_OPTIONS.find((opt) => opt.value === reason)
  return option?.label || reason
}

// Get adjustment type label
export function getAdjustmentTypeLabel(type: AdjustmentType): string {
  const labels: Record<AdjustmentType, string> = {
    set: 'Set to',
    add: 'Add',
    reduce: 'Reduce',
    recount: 'Recount',
  }
  return labels[type] || type
}

// Get adjustment type color
export function getAdjustmentTypeColor(type: AdjustmentType): string {
  const colors: Record<AdjustmentType, string> = {
    set: 'bg-blue-100 text-blue-700 border-blue-200',
    add: 'bg-green-100 text-green-700 border-green-200',
    reduce: 'bg-red-100 text-red-700 border-red-200',
    recount: 'bg-purple-100 text-purple-700 border-purple-200',
  }
  return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200'
}

// Format quantity change for display
export function formatQuantityChange(change: number): string {
  if (change > 0) {
    return `+${change}`
  }
  return change.toString()
}
