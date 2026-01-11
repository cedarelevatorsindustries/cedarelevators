'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useCustomer } from '@/hooks/queries/useCustomers'
import { CustomerOverviewTab } from '@/domains/admin/customers/customer-overview-tab'
import { CustomerVerificationTab } from '@/domains/admin/customers/customer-verification-tab'
import { CustomerQuotesTab } from '@/domains/admin/customers/customer-quotes-tab'
import { CustomerOrdersTab } from '@/domains/admin/customers/customer-orders-tab'
import { CustomerNotesTab } from '@/domains/admin/customers/customer-notes-tab'
import { getVerificationStatusLabel, getVerificationStatusColor } from '@/types/b2b/customer'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerClerkId = params.id as string
  const [activeTab, setActiveTab] = useState('overview')

  // React Query hook
  const { data: customer, isLoading, isError, refetch } = useCustomer(customerClerkId)

  const handleRefresh = async () => {
    await refetch()
    toast.success('Customer data refreshed')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-state">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading customer details...</p>
        </div>
      </div>
    )
  }

  if (isError || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" data-testid="error-state">
        <p className="text-muted-foreground mb-4">Customer not found</p>
        <Button onClick={() => router.back()} data-testid="back-button-error">Go Back</Button>
      </div>
    )
  }

  const isBusiness = customer.account_type === 'business'
  const verificationStatus = customer.business_profile?.verification_status

  return (
    <div className="space-y-6" data-testid="customer-detail-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight" data-testid="customer-name">
                {customer.business_profile?.company_name || customer.full_name || customer.email}
              </h1>
              {isBusiness && verificationStatus && (
                <Badge
                  variant="outline"
                  className={getVerificationStatusColor(verificationStatus)}
                  data-testid="verification-status-badge"
                >
                  {getVerificationStatusLabel(verificationStatus)}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1" data-testid="customer-email">{customer.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            data-testid="back-button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            data-testid="refresh-button"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = `mailto:${customer.email}`)}
            data-testid="email-customer-button"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Customer
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" data-testid="customer-tabs">
        <TabsList className="w-full flex">
          <TabsTrigger
            value="overview"
            className="flex-1 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            data-testid="tab-overview"
          >
            Overview
          </TabsTrigger>
          {isBusiness && (
            <TabsTrigger
              value="verification"
              className="flex-1 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              data-testid="tab-verification"
            >
              Verification
              {verificationStatus === 'pending' && (
                <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-700 border-orange-200">
                  Pending
                </Badge>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger
            value="quotes"
            className="flex-1 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            data-testid="tab-quotes"
          >
            Quotes
            {customer.quotes && customer.quotes.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {customer.quotes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="flex-1 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            data-testid="tab-orders"
          >
            Orders
            {customer.orders && customer.orders.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {customer.orders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="flex-1 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            data-testid="tab-notes"
          >
            Internal Notes
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <CustomerOverviewTab customer={customer} />
        </TabsContent>

        {/* Verification Tab (Business only) */}
        {isBusiness && (
          <TabsContent value="verification" className="space-y-6">
            <CustomerVerificationTab customer={customer} onUpdate={refetch} />
          </TabsContent>
        )}

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="space-y-6">
          <CustomerQuotesTab customerClerkId={customerClerkId} quotes={customer.quotes || []} />
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <CustomerOrdersTab customerClerkId={customerClerkId} orders={customer.orders || []} />
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <CustomerNotesTab customerClerkId={customerClerkId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
