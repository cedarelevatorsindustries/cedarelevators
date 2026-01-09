'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, CheckCircle, Clock, TrendingUp, UserPlus } from 'lucide-react'
import { CustomerStats } from '@/types/b2b/customer'

interface CustomersStatsProps {
  stats?: CustomerStats
  isLoading: boolean
}

export function CustomersStats({ stats, isLoading }: CustomersStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="customers-stats-loading">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="customers-stats">
      <Card data-testid="stat-total-customers">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_customers}</div>
          <p className="text-xs text-muted-foreground mt-1">With commercial intent</p>
        </CardContent>
      </Card>

      <Card data-testid="stat-leads">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads</CardTitle>
          <UserPlus className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.leads}</div>
          <p className="text-xs text-muted-foreground mt-1">Quotes only, no orders</p>
        </CardContent>
      </Card>

      <Card data-testid="stat-active-customers">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active_customers}</div>
          <p className="text-xs text-muted-foreground mt-1">Have placed orders</p>
        </CardContent>
      </Card>

      <Card data-testid="stat-pending-verifications">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending_verifications}</div>
          <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
        </CardContent>
      </Card>
    </div>
  )
}
