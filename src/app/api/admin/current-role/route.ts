import { NextResponse } from 'next/server'
import { getCurrentAdminUser, getCurrentAdminRole } from '@/lib/auth/admin-roles'

/**
 * GET /api/admin/current-role
 * Returns the current admin user's role
 */
export async function GET() {
  try {
    const adminUser = await getCurrentAdminUser()
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Not authorized as admin' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      role: adminUser.role,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        full_name: adminUser.full_name,
        is_active: adminUser.is_active
      }
    })
  } catch (error) {
    console.error('Error fetching admin role:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin role' },
      { status: 500 }
    )
  }
}

