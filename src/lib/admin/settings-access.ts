import { AdminRole } from '@/lib/admin-auth-client'

/**
 * Settings Access Control Utilities
 * Implements 2-tier access system for Admin Settings
 */

// Tier-1 (Critical): Super Admin ONLY
const TIER_1_ROLES: AdminRole[] = ['super_admin']

// Tier-2 (Operational): Admin + Manager + Staff
const TIER_2_ROLES: AdminRole[] = ['super_admin', 'admin', 'manager', 'staff']

export type SettingsTier = 'critical' | 'operational'
export type SettingsGroup = 'store' | 'commerce' | 'access' | 'cms' | 'system'

export interface SettingsModule {
  id: string
  title: string
  href: string
  description: string
  tier: SettingsTier
  allowedRoles: AdminRole[]
  icon: string
  group: SettingsGroup
  hidden?: boolean
}

export interface SettingsGroupConfig {
  id: SettingsGroup
  title: string
  defaultExpanded?: boolean
}

/**
 * Settings group configuration
 */
export const SETTINGS_GROUPS: SettingsGroupConfig[] = [
  { id: 'store', title: 'STORE', defaultExpanded: true },
  { id: 'commerce', title: 'COMMERCE', defaultExpanded: true },
  { id: 'access', title: 'ACCESS', defaultExpanded: true },
  { id: 'cms', title: 'CMS', defaultExpanded: true },
  { id: 'system', title: 'SYSTEM', defaultExpanded: true }
]

/**
 * All settings modules configuration
 * Order: General, Payments, Tax, Shipping, Admin Users (System hidden)
 */
export const SETTINGS_MODULES: SettingsModule[] = [
  {
    id: 'general',
    title: 'General',
    href: '/admin/settings/general',
    description: 'Store identity & contact info',
    tier: 'operational',
    allowedRoles: TIER_2_ROLES,
    icon: 'Store',
    group: 'store'
  },
  {
    id: 'shipping',
    title: 'Shipping',
    href: '/admin/settings/shipping',
    description: 'Fulfillment and delivery settings',
    tier: 'operational',
    allowedRoles: TIER_2_ROLES,
    icon: 'Truck',
    group: 'commerce'
  },
  {
    id: 'payments',
    title: 'Payments',
    href: '/admin/settings/payments',
    description: 'Enable or disable payment methods',
    tier: 'critical',
    allowedRoles: TIER_1_ROLES,
    icon: 'CreditCard',
    group: 'commerce'
  },
  {
    id: 'tax',
    title: 'Taxes',
    href: '/admin/settings/tax',
    description: 'GST rates and tax rules',
    tier: 'critical',
    allowedRoles: TIER_1_ROLES,
    icon: 'Receipt',
    group: 'commerce'
  },
  {
    id: 'users',
    title: 'Admin Users',
    href: '/admin/settings/users',
    description: 'Manage admin access',
    tier: 'critical',
    allowedRoles: TIER_1_ROLES,
    icon: 'Users',
    group: 'access'
  },
  {
    id: 'policies',
    title: 'Policies',
    href: '/admin/settings/cms/policies',
    description: 'Privacy, Terms, Return, Shipping',
    tier: 'operational',
    allowedRoles: TIER_2_ROLES,
    icon: 'FileText',
    group: 'cms'
  },
  {
    id: 'warranty-info',
    title: 'Warranty Info',
    href: '/admin/settings/cms/warranty',
    description: 'Warranty information page',
    tier: 'operational',
    allowedRoles: TIER_2_ROLES,
    icon: 'Shield',
    group: 'cms'
  },
  {
    id: 'why-choose',
    title: 'Why Choose Cedar',
    href: '/admin/settings/cms/why-choose',
    description: 'Why choose us page',
    tier: 'operational',
    allowedRoles: TIER_2_ROLES,
    icon: 'Star',
    group: 'cms'
  },
  {
    id: 'system',
    title: 'System',
    href: '/admin/settings/system',
    description: 'Feature flags and maintenance',
    tier: 'critical',
    allowedRoles: TIER_1_ROLES,
    icon: 'Settings',
    group: 'access',
    hidden: true
  }
]

/**
 * Get modules grouped by section
 */
export function getGroupedModules(): Record<SettingsGroup, SettingsModule[]> {
  const grouped: Record<SettingsGroup, SettingsModule[]> = {
    store: [],
    commerce: [],
    access: [],
    cms: [],
    system: []
  }

  SETTINGS_MODULES.forEach(module => {
    if (!module.hidden) {
      grouped[module.group].push(module)
    }
  })

  return grouped
}

/**
 * Check if user can access Tier-1 (Critical) settings
 */
export function canAccessTier1(role: AdminRole): boolean {
  return TIER_1_ROLES.includes(role)
}

/**
 * Check if user can access Tier-2 (Operational) settings
 */
export function canAccessTier2(role: AdminRole): boolean {
  return TIER_2_ROLES.includes(role)
}

/**
 * Check if user can access a specific settings module
 */
export function canAccessModule(role: AdminRole, moduleId: string): boolean {
  const module = SETTINGS_MODULES.find(m => m.id === moduleId)
  if (!module) return false
  return module.allowedRoles.includes(role)
}

/**
 * Get all settings modules accessible to a user role
 */
export function getAccessibleSettings(role: AdminRole): SettingsModule[] {
  return SETTINGS_MODULES.filter(module =>
    !module.hidden && module.allowedRoles.includes(role)
  )
}

/**
 * Get settings modules for sidebar navigation
 */
export function getSettingsSidebarItems(role: AdminRole): SettingsModule[] {
  return SETTINGS_MODULES.filter(module =>
    !module.hidden && module.allowedRoles.includes(role)
  )
}

/**
 * Check if a module is restricted for the user
 */
export function isModuleRestricted(role: AdminRole, moduleId: string): boolean {
  const module = SETTINGS_MODULES.find(m => m.id === moduleId)
  if (!module) return true
  return !module.allowedRoles.includes(role)
}

/**
 * Get tier badge variant
 */
export function getTierBadgeVariant(tier: SettingsTier): 'destructive' | 'secondary' {
  return tier === 'critical' ? 'destructive' : 'secondary'
}

/**
 * Get tier badge text
 */
export function getTierBadgeText(tier: SettingsTier): string {
  if (tier === 'critical') {
    return 'Super Admin Only'
  }
  return ''
}

