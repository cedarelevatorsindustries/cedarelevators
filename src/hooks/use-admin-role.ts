"use client"

import { useState, useEffect } from 'react'
import type { AdminRole } from '@/types/b2b/quote'

// Role hierarchy for client-side checks
const ROLE_HIERARCHY: Record<AdminRole, number> = {
  staff: 1,
  manager: 2,
  admin: 3,
  super_admin: 4,
}

interface AdminRoleState {
  role: AdminRole | null
  isLoading: boolean
  error: string | null
}

/**
 * Client-side hook for admin role management
 * Note: This is for UI purposes only. All permission checks MUST be done server-side.
 */
export function useAdminRole() {
  const [state, setState] = useState<AdminRoleState>({
    role: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    fetchAdminRole()
  }, [])

  const fetchAdminRole = async () => {
    try {
      const response = await fetch('/api/admin/current-role')
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin role')
      }
      
      const data = await response.json()
      
      setState({
        role: data.role as AdminRole,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('Error fetching admin role:', error)
      setState({
        role: null,
        isLoading: false,
        error: 'Failed to fetch role',
      })
    }
  }

  const hasRole = (requiredRole: AdminRole): boolean => {
    if (!state.role) return false
    return ROLE_HIERARCHY[state.role] >= ROLE_HIERARCHY[requiredRole]
  }

  const canViewQuotes = (): boolean => {
    return hasRole('staff') // All roles can view
  }

  const canPriceQuotes = (): boolean => {
    return hasRole('manager') // Manager and above
  }

  const canApproveQuotes = (): boolean => {
    return hasRole('manager') // Manager and above
  }

  const canConvertQuotes = (): boolean => {
    return hasRole('manager') // Manager and above
  }

  const canApproveVerification = (): boolean => {
    return hasRole('admin') // Admin and above
  }

  const canManageProducts = (): boolean => {
    return hasRole('manager') // Manager and above for editing
  }

  const canAdjustInventory = (): boolean => {
    return hasRole('manager') // Manager and above
  }

  const canManageAdminUsers = (): boolean => {
    return hasRole('super_admin') // Super admin only
  }

  return {
    ...state,
    hasRole,
    canViewQuotes,
    canPriceQuotes,
    canApproveQuotes,
    canConvertQuotes,
    canApproveVerification,
    canManageProducts,
    canAdjustInventory,
    canManageAdminUsers,
  }
}

/**
 * Get role label for display
 */
export function getRoleLabel(role: AdminRole): string {
  const labels: Record<AdminRole, string> = {
    staff: 'Staff',
    manager: 'Manager',
    admin: 'Admin',
    super_admin: 'Super Admin',
  }
  return labels[role]
}

/**
 * Get role color for badges
 */
export function getRoleColor(role: AdminRole): string {
  const colors: Record<AdminRole, string> = {
    staff: 'bg-gray-100 text-gray-700 border-gray-200',
    manager: 'bg-blue-100 text-blue-700 border-blue-200',
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    super_admin: 'bg-orange-100 text-orange-700 border-orange-200',
  }
  return colors[role]
}

