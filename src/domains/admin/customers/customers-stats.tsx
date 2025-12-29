'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react'
import { CustomerStats } from '@/types/b2b/customer'

interface CustomersStatsProps {
  stats?: CustomerStats
  isLoading: boolean
}

export function CustomersStats({ stats, isLoading }: CustomersStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6" data-testid="customers-stats-loading">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6" data-testid="customers-stats">
      <Card data-testid="stat-total-customers">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_customers}</div>
          <p className="text-xs text-muted-foreground mt-1">All accounts</p>
        </CardContent>
      </Card>

      <Card data-testid="stat-individual-customers">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Individual</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.individual_customers}</div>
          <p className="text-xs text-muted-foreground mt-1">Personal accounts</p>
        </CardContent>
      </Card>

      <Card data-testid="stat-business-customers">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Business</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.business_customers}</div>
          <p className="text-xs text-muted-foreground mt-1">Business accounts</p>
        </CardContent>
      </Card>

      <Card data-testid="stat-verified-businesses">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verified</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.verified_businesses}</div>
          <p className="text-xs text-muted-foreground mt-1">Verified businesses</p>
        </CardContent>
      </Card>

      <Card data-testid="stat-pending-verifications">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending_verifications}</div>
          <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
        </CardContent>
      </Card>

      <Card data-testid="stat-total-revenue">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{(stats.total_revenue / 100000).toFixed(1)}L
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total lifetime value</p>
        </CardContent>
      </Card>
    </div>
  )
}
