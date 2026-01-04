/**
 * Activity Log Page
 * View admin activity audit trail
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface ActivityLog {
  id: string
  admin_email: string
  action: string
  resource_type: string
  resource_id?: string
  details?: any
  created_at: string
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [page])

  const fetchLogs = async () => {
    setLoading(true)

    try {
      const response = await fetch(
        `/api/admin/activity-log?limit=50&offset=${page * 50}`
      )
      const data = await response.json()

      if (data.success) {
        setLogs(data.data)
        setTotal(data.total)
      } else {
        toast.error('Failed to fetch logs')
      }
    } catch (error) {
      toast.error('Error fetching logs')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/activity-log?action=stats&days=30')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats')
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-green-600'
      case 'update':
        return 'text-blue-600'
      case 'delete':
        return 'text-red-600'
      case 'approve':
        return 'text-green-600'
      case 'reject':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground mt-2">
            Monitor all admin actions and changes
          </p>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Actions (30d)</p>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalActions}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Creates</p>
            <p className="text-2xl font-bold mt-2 text-green-600">
              {stats.actionsByType?.create || 0}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Updates</p>
            <p className="text-2xl font-bold mt-2 text-blue-600">
              {stats.actionsByType?.update || 0}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Deletes</p>
            <p className="text-2xl font-bold mt-2 text-red-600">
              {stats.actionsByType?.delete || 0}
            </p>
          </Card>
        </div>
      )}

      {/* Activity Feed */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No activity logs found
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{log.admin_email}</span>
                    <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {log.resource_type}
                    </span>
                  </div>
                  {log.resource_id && (
                    <p className="text-sm text-muted-foreground">
                      ID: {log.resource_id}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 50 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {page * 50 + 1} - {Math.min((page + 1) * 50, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * 50 >= total}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

