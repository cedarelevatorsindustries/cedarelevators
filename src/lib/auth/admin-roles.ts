import { createServerSupabase, createAdminClient } from '@/lib/supabase/server'
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
  'use server'
  try {
    // Use session-aware client to access the authenticated admin user
    const supabase = await createServerSupabase()

    // Get authenticated user from Supabase Auth (admin panel uses Supabase Auth)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('No Supabase auth user found:', authError)
      return null
    }

    // Find admin user by email (matching with admin_users table)
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .eq('is_active', true)
      .single()

    if (error || !adminUser) {
      console.error('Admin user not found or not active:', {
        email: user.email,
        userId: user.id,
        error
      })
      return null
    }

    return adminUser
  } catch (error) {
    console.error('Error getting current admin user:', error)
    return null
  }
}

export async function getCurrentAdminRole(): Promise<AdminRole | null> {
  'use server'
  const adminUser = await getCurrentAdminUser()
  return adminUser?.role || null
}

export async function hasRole(requiredRole: AdminRole): Promise<boolean> {
  'use server'
  const currentRole = await getCurrentAdminRole()
  if (!currentRole) {
    return false
  }

  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole]
}

export async function canViewQuotes(): Promise<boolean> {
  'use server'
  return await hasRole('staff') // All roles can view
}

export async function canPriceQuotes(): Promise<boolean> {
  'use server'
  return await hasRole('manager') // Manager and above
}

export async function canApproveQuotes(): Promise<boolean> {
  'use server'
  return await hasRole('manager') // Manager and above
}

export async function canConvertQuotes(): Promise<boolean> {
  'use server'
  return await hasRole('manager') // Manager and above
}

export async function canApproveVerification(): Promise<boolean> {
  'use server'
  return await hasRole('admin') // Admin and above
}

export async function canManageProducts(): Promise<boolean> {
  'use server'
  return await hasRole('manager') // Manager and above for editing
}

export async function canAdjustInventory(): Promise<boolean> {
  'use server'
  return await hasRole('manager') // Manager and above
}

export async function canManageAdminUsers(): Promise<boolean> {
  'use server'
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

