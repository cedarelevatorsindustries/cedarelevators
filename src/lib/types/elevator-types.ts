// =====================================================
// Elevator Types - Type Definitions
// =====================================================

export interface ElevatorType {
  id: string
  name: string
  slug: string
  description?: string
  // Visual Identity
  icon?: string // Legacy: emoji/icon string
  thumbnail_image?: string // Square/card image or icon for elevator type cards and filters
  banner_image?: string // Wide banner for elevator type PLP header (optional, non-clickable)
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ElevatorTypeFormData {
  name: string
  slug: string
  description?: string
  // Visual Identity
  icon?: string // Legacy: emoji/icon
  thumbnail_image?: string // Square/card image
  banner_image?: string // Wide banner for PLP header
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
