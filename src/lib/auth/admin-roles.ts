'use server'

import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { AdminRole } from '@/types/b2b/quote'

// =====================================================
// Role Hierarchy
// =====================================================

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  staff: 1,
  manager: 2,
  admin: 3,
  super_admin: 4,
}

// =====================================================
// Permission Checks
// =====================================================

export async function getCurrentAdminUser() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return null
    }

    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return null
    }

    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('clerk_user_id', userId)
      .eq('is_active', true)
      .single()

    if (error || !adminUser) {
      return null
    }

    return adminUser
  } catch (error) {
    console.error('Error getting current admin user:', error)
    return null
  }
}

export async function getCurrentAdminRole(): Promise<AdminRole | null> {
  const adminUser = await getCurrentAdminUser()
  return adminUser?.role || null
}

export async function hasRole(requiredRole: AdminRole): Promise<boolean> {
  const currentRole = await getCurrentAdminRole()
  if (!currentRole) {
    return false
  }

  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole]
}

export async function canViewQuotes(): Promise<boolean> {
  return await hasRole('staff') // All roles can view
}

export async function canPriceQuotes(): Promise<boolean> {
  return await hasRole('manager') // Manager and above
}

export async function canApproveQuotes(): Promise<boolean> {
  return await hasRole('manager') // Manager and above
}

export async function canConvertQuotes(): Promise<boolean> {
  return await hasRole('manager') // Manager and above
}

export async function canApproveVerification(): Promise<boolean> {
  return await hasRole('admin') // Admin and above
}

export async function canManageProducts(): Promise<boolean> {
  return await hasRole('manager') // Manager and above for editing
}

export async function canAdjustInventory(): Promise<boolean> {
  return await hasRole('manager') // Manager and above
}

export async function canManageAdminUsers(): Promise<boolean> {
  return await hasRole('super_admin') // Super admin only
}

// =====================================================
// Role Display Helpers
// =====================================================

export function getRoleLabel(role: AdminRole): string {
  const labels: Record<AdminRole, string> = {
    staff: 'Staff',
    manager: 'Manager',
    admin: 'Admin',
    super_admin: 'Super Admin',
  }
  return labels[role]
}

export function getRoleColor(role: AdminRole): string {
  const colors: Record<AdminRole, string> = {
    staff: 'bg-gray-100 text-gray-700',
    manager: 'bg-blue-100 text-blue-700',
    admin: 'bg-purple-100 text-purple-700',
    super_admin: 'bg-orange-100 text-orange-700',
  }
  return colors[role]
}

// =====================================================
// Permission Matrix
// =====================================================

export const PERMISSIONS = {
  quotes: {
    view: ['staff', 'manager', 'admin', 'super_admin'],
    price: ['manager', 'admin', 'super_admin'],
    approve: ['manager', 'admin', 'super_admin'],
    convert: ['manager', 'admin', 'super_admin'],
  },
  customers: {
    view: ['staff', 'manager', 'admin', 'super_admin'],
    verify: ['admin', 'super_admin'],
  },
  products: {
    view: ['staff', 'manager', 'admin', 'super_admin'],
    edit: ['manager', 'admin', 'super_admin'],
    delete: ['admin', 'super_admin'],
  },
  inventory: {
    view: ['staff', 'manager', 'admin', 'super_admin'],
    adjust: ['manager', 'admin', 'super_admin'],
  },
} as const
