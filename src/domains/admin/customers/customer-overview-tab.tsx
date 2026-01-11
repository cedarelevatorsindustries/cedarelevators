'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  MapPin,
  ShoppingBag,
  DollarSign,
} from 'lucide-react'
import { Customer, getAccountTypeLabel, getCompanyTypeLabel } from '@/types/b2b/customer'
import { formatDistanceToNow } from 'date-fns'

interface CustomerOverviewTabProps {
  customer: Customer
}

export function CustomerOverviewTab({ customer }: CustomerOverviewTabProps) {
  const isBusiness = customer.account_type === 'business'
  const businessProfile = customer.business_profile

  return (
    <div className="space-y-6" data-testid="customer-overview-tab">
      {/* Stats Cards */}
      {/* Customer Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card data-testid="basic-info-card">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Account Type</p>
                <Badge variant="outline" className="mt-1">
                  {getAccountTypeLabel(customer.account_type)}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">
                  {customer.phone || 'Not provided'}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(customer.registration_date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Info or Addresses */}
        {isBusiness && businessProfile ? (
          <Card data-testid="business-info-card">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Company Name</p>
                  <p className="text-sm text-muted-foreground">
                    {businessProfile.company_name}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">GST Number</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {businessProfile.gst_number || 'Not provided'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card data-testid="addresses-card">
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="space-y-4">
                  {customer.addresses.map((address: any, index: number) => (
                    <div
                      key={address.id || index}
                      className="p-3 rounded-lg border bg-muted/50"
                      data-testid={`address-${index}`}
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{address.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.address_line1}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.pincode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Phone: {address.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground" data-testid="no-addresses">
                  No saved addresses
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

