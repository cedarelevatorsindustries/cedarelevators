'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { Customer, CustomerType, getAccountTypeLabel, getVerificationStatusLabel, getVerificationStatusColor } from '@/types/b2b/customer'
import { format } from 'date-fns'
import { Building2, User, MoreVertical, Eye, FileText, ShoppingCart, Receipt, AlertCircle } from 'lucide-react'

interface CustomersTableProps {
  customers: Customer[]
  isLoading: boolean
}

function getCustomerTypeLabel(type: CustomerType): string {
  const labels: Record<CustomerType, string> = {
    lead: 'Lead',
    customer: 'Customer',
    business: 'Business',
    individual: 'Individual',
  }
  return labels[type]
}

function getCustomerTypeColor(type: CustomerType): string {
  const colors: Record<CustomerType, string> = {
    lead: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    customer: 'bg-green-100 text-green-700 border-green-200',
    business: 'bg-blue-100 text-blue-700 border-blue-200',
    individual: 'bg-gray-100 text-gray-700 border-gray-200',
  }
  return colors[type]
}

export function CustomersTable({ customers, isLoading }: CustomersTableProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="customers-table-loading">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div
        className="text-center py-12 bg-muted/50 rounded-lg"
        data-testid="no-customers-found"
      >
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">No customers found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Customers will appear here when they request quotes, place orders, or submit business verification
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border" data-testid="customers-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Account Type</TableHead>
            <TableHead>Customer Type</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Quotes</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow
              key={customer.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/admin/customers/${customer.clerk_user_id}`)}
              data-testid={`customer-row-${customer.id}`}
            >
              {/* Customer Name/Email */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {customer.account_type === 'business' ? (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {customer.business_profile?.company_name ||
                        customer.full_name ||
                        customer.email}
                    </p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </div>
              </TableCell>

              {/* Account Type */}
              <TableCell>
                <Badge variant="outline" data-testid={`account-type-${customer.id}`}>
                  {getAccountTypeLabel(customer.account_type)}
                </Badge>
              </TableCell>

              {/* Customer Type */}
              <TableCell>
                {customer.customer_type && (
                  <Badge
                    variant="outline"
                    className={getCustomerTypeColor(customer.customer_type)}
                    data-testid={`customer-type-${customer.id}`}
                  >
                    {getCustomerTypeLabel(customer.customer_type)}
                  </Badge>
                )}
              </TableCell>

              {/* Verification Status - Only for Business */}
              <TableCell>
                {customer.account_type === 'business' ? (
                  <Badge
                    variant="outline"
                    className={getVerificationStatusColor(customer.verification_status || 'unverified')}
                    data-testid={`verification-status-${customer.id}`}
                  >
                    {getVerificationStatusLabel(customer.verification_status || 'unverified')}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </TableCell>

              {/* Total Quotes */}
              <TableCell>
                <span className="font-medium">{customer.total_quotes}</span>
              </TableCell>

              {/* Total Orders */}
              <TableCell>
                <span className="font-medium">{customer.total_orders}</span>
              </TableCell>

              {/* Total Revenue */}
              <TableCell>
                <span className="font-medium">₹{customer.total_spent.toLocaleString()}</span>
              </TableCell>

              {/* Last Activity */}
              <TableCell>
                <span className="text-sm">
                  {customer.last_activity
                    ? format(new Date(customer.last_activity), 'MMM d, yyyy')
                    : format(new Date(customer.registration_date), 'MMM d, yyyy')}
                </span>
              </TableCell>

              {/* Contextual Actions */}
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`actions-menu-${customer.id}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Always show View Customer */}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/customers/${customer.clerk_user_id}`)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Customer
                    </DropdownMenuItem>

                    {/* Business-specific actions */}
                    {customer.account_type === 'business' && (
                      <>
                        {/* Review Verification - Primary action for pending */}
                        {customer.verification_status === 'pending' && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/customers/${customer.clerk_user_id}?tab=verification`)
                            }}
                            className="text-orange-600 font-medium"
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Review Verification
                          </DropdownMenuItem>
                        )}

                        {/* View Rejection Reason - for rejected */}
                        {customer.verification_status === 'rejected' && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/customers/${customer.clerk_user_id}?tab=verification`)
                            }}
                            className="text-red-600"
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            View Rejection Reason
                          </DropdownMenuItem>
                        )}

                        {/* View Invoices - for verified businesses */}
                        {customer.verification_status === 'verified' && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/customers/${customer.clerk_user_id}?tab=activity`)
                            }}
                          >
                            <Receipt className="h-4 w-4 mr-2" />
                            View Invoices
                          </DropdownMenuItem>
                        )}
                      </>
                    )}

                    {/* View Quotes - for all */}
                    {customer.total_quotes > 0 && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/customers/${customer.clerk_user_id}?tab=activity`)
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Quotes ({customer.total_quotes})
                      </DropdownMenuItem>
                    )}

                    {/* View Orders - for all */}
                    {customer.total_orders > 0 && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/customers/${customer.clerk_user_id}?tab=activity`)
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        View Orders ({customer.total_orders})
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
