/**
 * Application Types Configuration for Cedar Elevators
 * These represent the top-level categorization for products
 * These match the categories table where parent_id IS NULL
 */

export interface ApplicationType {
  id?: string // UUID from database
  name: string
  slug: string
  description: string
  icon?: string
  sortOrder: number
  isActive: boolean
}

export const APPLICATION_TYPES: Omit<ApplicationType, 'id'>[] = [
  {
    name: 'Erection',
    slug: 'erection',
    description: 'Installation and erection services',
    icon: 'Construction',
    sortOrder: 1,
    isActive: true,
  },
  {
    name: 'Testing',
    slug: 'testing',
    description: 'Testing and commissioning services',
    icon: 'TestTube',
    sortOrder: 2,
    isActive: true,
  },
  {
    name: 'Service',
    slug: 'service',
    description: 'Maintenance and service components',
    icon: 'Wrench',
    sortOrder: 3,
    isActive: true,
  },
  {
    name: 'Others',
    slug: 'others',
    description: 'Miscellaneous elevator products and services',
    icon: 'MoreHorizontal',
    sortOrder: 4,
    isActive: true,
  },
  {
    name: 'General',
    slug: 'general',
    description: 'General uncategorized items',
    icon: 'Package',
    sortOrder: 999,
    isActive: true,
  },
]

/**
 * Get application type by slug
 */
export function getApplicationTypeBySlug(slug: string): Omit<ApplicationType, 'id'> | undefined {
  return APPLICATION_TYPES.find((type) => type.slug === slug)
}

/**
 * Get application type display name
 */
export function getApplicationTypeLabel(slug: string): string {
  const type = getApplicationTypeBySlug(slug)
  return type?.name || slug
}

/**
 * Get application type icon
 */
export function getApplicationTypeIcon(slug: string): string | undefined {
  const type = getApplicationTypeBySlug(slug)
  return type?.icon
}

/**
 * Get active application types only
 */
export function getActiveApplicationTypes(): Omit<ApplicationType, 'id'>[] {
  return APPLICATION_TYPES.filter((type) => type.isActive)
}
