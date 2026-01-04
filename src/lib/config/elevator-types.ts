/**
 * Elevator Types Configuration for Cedar Elevators
 * These match the elevator_types table in the database
 */

export interface ElevatorType {
  id?: string // UUID from database
  name: string
  slug: string
  description: string
  icon?: string
  sortOrder: number
}

export const ELEVATOR_TYPES: Omit<ElevatorType, 'id'>[] = [
  {
    name: 'Passenger',
    slug: 'passenger',
    description: 'Passenger elevator systems for people transport',
    icon: 'Users',
    sortOrder: 1,
  },
  {
    name: 'Residential',
    slug: 'residential',
    description: 'Residential elevator systems and components',
    icon: 'Home',
    sortOrder: 2,
  },
  {
    name: 'Commercial',
    slug: 'commercial',
    description: 'Commercial building elevator solutions',
    icon: 'Building2',
    sortOrder: 3,
  },
  {
    name: 'Industrial',
    slug: 'industrial',
    description: 'Heavy-duty industrial elevator systems',
    icon: 'Factory',
    sortOrder: 4,
  },
  {
    name: 'Hospital',
    slug: 'hospital',
    description: 'Hospital and medical facility elevators',
    icon: 'Hospital',
    sortOrder: 5,
  },
  {
    name: 'Freight',
    slug: 'freight',
    description: 'Freight and cargo elevator systems',
    icon: 'Package',
    sortOrder: 6,
  },
  {
    name: 'Home',
    slug: 'home',
    description: 'Home elevator solutions for residential properties',
    icon: 'Home',
    sortOrder: 7,
  },
]

/**
 * Get elevator type by slug
 */
export function getElevatorTypeBySlug(slug: string): Omit<ElevatorType, 'id'> | undefined {
  return ELEVATOR_TYPES.find((type) => type.slug === slug)
}

/**
 * Get elevator type display name
 */
export function getElevatorTypeLabel(slug: string): string {
  const type = getElevatorTypeBySlug(slug)
  return type?.name || slug
}

/**
 * Get elevator type icon
 */
export function getElevatorTypeIcon(slug: string): string | undefined {
  const type = getElevatorTypeBySlug(slug)
  return type?.icon
}

