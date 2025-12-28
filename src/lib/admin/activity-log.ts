/**
 * Admin Activity Logging Service
 * Tracks all admin actions for audit trail
 */

import { createClient } from '@/lib/supabase/server'

export interface ActivityLog {
  id?: string
  admin_id: string
  admin_email: string
  action: string
  resource_type: 'product' | 'category' | 'order' | 'customer' | 'setting' | 'user'
  resource_id?: string
  details?: any
  ip_address?: string
  user_agent?: string
  created_at?: string
}

export type ActivityAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'publish'
  | 'unpublish'
  | 'import'
  | 'export'
  | 'login'
  | 'logout'

/**
 * Log admin activity
 */
export async function logActivity(
  activity: Omit<ActivityLog, 'id' | 'created_at'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('admin_activity_logs')
      .insert(activity)

    if (error) {
      console.error('Failed to log activity:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Activity logging error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get activity logs with filters
 */
export async function getActivityLogs(filters: {
  adminId?: string
  resourceType?: string
  action?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}): Promise<{
  success: boolean
  logs?: ActivityLog[]
  total?: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      adminId,
      resourceType,
      action,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = filters

    let query = supabase
      .from('admin_activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (adminId) {
      query = query.eq('admin_id', adminId)
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType)
    }

    if (action) {
      query = query.eq('action', action)
    }

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      logs: data || [],
      total: count || 0,
    }
  } catch (error: any) {
    console.error('Failed to fetch activity logs:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get activity statistics
 */
export async function getActivityStats(days: number = 30): Promise<{
  success: boolean
  stats?: {
    totalActions: number
    actionsByType: Record<string, number>
    actionsByResource: Record<string, number>
    topAdmins: Array<{ admin_email: string; count: number }>
  }
  error?: string
}> {
  try {
    const supabase = await createClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: logs, error } = await supabase
      .from('admin_activity_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())

    if (error) {
      return { success: false, error: error.message }
    }

    const totalActions = logs?.length || 0

    // Actions by type
    const actionsByType = logs?.reduce((acc: Record<string, number>, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1
      return acc
    }, {})

    // Actions by resource
    const actionsByResource = logs?.reduce((acc: Record<string, number>, log) => {
      acc[log.resource_type] = (acc[log.resource_type] || 0) + 1
      return acc
    }, {})

    // Top admins
    const adminCounts = logs?.reduce((acc: Record<string, number>, log) => {
      acc[log.admin_email] = (acc[log.admin_email] || 0) + 1
      return acc
    }, {})

    const topAdmins = Object.entries(adminCounts || {})
      .map(([admin_email, count]) => ({ admin_email, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      success: true,
      stats: {
        totalActions,
        actionsByType: actionsByType || {},
        actionsByResource: actionsByResource || {},
        topAdmins,
      },
    }
  } catch (error: any) {
    console.error('Failed to fetch activity stats:', error)
    return { success: false, error: error.message }
  }
}
