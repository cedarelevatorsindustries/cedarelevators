import { AdminRole } from '@/lib/admin-auth-client'

/**
 * Settings Access Control Utilities
 * Implements 2-tier access system for Admin Settings
 */

// Tier-1 (Critical): Super Admin ONLY
// Can break payments, affect taxes, impact business trust
const TIER_1_ROLES: AdminRole[] = ['super_admin']

// Tier-2 (Operational): Admin + Manager + Staff
// Can be adjusted safely during early operations
const TIER_2_ROLES: AdminRole[] = ['super_admin', 'admin', 'manager', 'staff']

export type SettingsTier = 'critical' | 'operational'

export interface SettingsModule {
  id: string
  title: string
  href: string
  description: string
  tier: SettingsTier
  allowedRoles: AdminRole[]
  icon: string
  hidden?: boolean // For system settings
}

/**
 * All settings modules configuration
 */
export const SETTINGS_MODULES: SettingsModule[] = [
  {
    id: 'store',
    title: 'Store & Branding',
    href: '/admin/settings/store',
    description: 'Identity & contact information',
    tier: 'operational',
    allowedRoles: TIER_2_ROLES,
    icon: 'Store'
  },
  {
    id: 'pricing-rules',
    title: 'Pricing Rules',
    href: '/admin/settings/pricing-rules',
    description: 'Control global pricing behavior',
    tier: 'critical',
    allowedRoles: TIER_1_ROLES,
    icon: 'DollarSign'
  },
  {
    id: 'payments',
    title: 'Payments',
    href: '/admin/settings/payments',
    description: 'Payment method configuration',
    tier: 'critical',
    allowedRoles: TIER_1_ROLES,
    icon: 'CreditCard'
  },
  {
    id: 'tax',
    title: 'Tax (GST)',
    href: '/admin/settings/tax',
    description: 'GST rates and tax rules',
    tier: 'critical',
    allowedRoles: TIER_1_ROLES,
    icon: 'Receipt'
  },
  {
    id: 'shipping',
    title: 'Shipping',
    href: '/admin/settings/shipping',
    description: 'Fulfillment and delivery settings',
    tier: 'operational',
    allowedRoles: TIER_2_ROLES,
    icon: 'Truck'
  },
  {
    id: 'users',
    title: 'Admin Users',
    href: '/admin/settings/users',
    description: 'Manage admin access',
    tier: 'critical',
    allowedRoles: TIER_1_ROLES,
    icon: 'UserCog'
  },
  {
    id: 'system',
    title: 'System',
    href: '/admin/settings/system',
    description: 'Feature flags and maintenance',
    tier: 'critical',
    allowedRoles: TIER_1_ROLES,
    icon: 'Settings',
    hidden: true // Not shown in sidebar, direct URL only
  }
]

/**
 * Check if user can access Tier-1 (Critical) settings
 * Only Super Admin can access Tier-1
 */
export function canAccessTier1(role: AdminRole): boolean {
  return TIER_1_ROLES.includes(role)
}

/**
 * Check if user can access Tier-2 (Operational) settings
 * Admin, Manager, Staff can access Tier-2
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
export function getTierBadgeVariant(tier: SettingsTier): 'destructive' | 'warning' {
  return tier === 'critical' ? 'destructive' : 'warning'
}

/**
 * Get tier badge text
 */
export function getTierBadgeText(tier: SettingsTier): string {
  if (tier === 'critical') {
    return '🔴 Restricted - Super Admin Only'
  }
  return '🟡 Operational'
}
