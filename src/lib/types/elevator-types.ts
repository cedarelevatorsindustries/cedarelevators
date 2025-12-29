// =====================================================
// Elevator Types - Type Definitions
// =====================================================

export interface ElevatorType {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ElevatorTypeFormData {
  name: string
  slug: string
  description?: string
  icon?: string
  sort_order: number
  is_active: boolean
}

export interface ElevatorTypeFilters {
  search?: string
  is_active?: boolean
}

export interface CreateElevatorTypeResult {
  success: boolean
  elevatorType?: ElevatorType
  error?: string
}

export interface UpdateElevatorTypeResult {
  success: boolean
  elevatorType?: ElevatorType
  error?: string
}

export interface FetchElevatorTypesResult {
  success: boolean
  elevatorTypes?: ElevatorType[]
  error?: string
}

export interface DeleteElevatorTypeResult {
  success: boolean
  error?: string
}

// Helper function to generate slug
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
