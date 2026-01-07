// Elevator Type Status
export type ElevatorTypeStatus = 'active' | 'draft' | 'archived'

// Base Elevator Type interface
export interface ElevatorType {
  id: string
  title: string
  subtitle: string
  description: string
  slug: string
  status: 'active' | 'draft' | 'archived'
  thumbnail_image: string | null
  banner_image: string | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

// Form data for creating/updating elevator types
export interface ElevatorTypeFormData {
  title: string
  subtitle: string
  description: string
  slug: string
  status: 'active' | 'draft' | 'archived'
  thumbnail_image: string | null
  banner_image: string | null
  meta_title: string | null
  meta_description: string | null
}

// Extended type with computed fields
export interface ElevatorTypeWithStats extends ElevatorType {
  product_count: number
}
