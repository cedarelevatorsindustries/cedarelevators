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
import { useRouter } from 'next/navigation'
import { Customer, getAccountTypeLabel, getVerificationStatusLabel, getVerificationStatusColor } from '@/types/b2b/customer'
import { format } from 'date-fns'
import { Building2, User, Mail, Phone, ArrowRight } from 'lucide-react'

interface CustomersTableProps {
  customers: Customer[]
  isLoading: boolean
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
          Try adjusting your filters or search criteria
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
            <TableHead>Verification</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Action</TableHead>
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

              {/* Verification Status */}
              <TableCell>
                {customer.account_type === 'business' && customer.verification_status ? (
                  <Badge
                    variant="outline"
                    className={getVerificationStatusColor(customer.verification_status)}
                    data-testid={`verification-status-${customer.id}`}
                  >
                    {getVerificationStatusLabel(customer.verification_status)}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </TableCell>

              {/* Contact */}
              <TableCell>
                <div className="space-y-1">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {!customer.phone && (
                    <span className="text-sm text-muted-foreground">No phone</span>
                  )}
                </div>
              </TableCell>

              {/* Total Orders */}
              <TableCell>
                <span className="font-medium">{customer.total_orders}</span>
                <span className="text-sm text-muted-foreground ml-1">orders</span>
              </TableCell>

              {/* Total Spent */}
              <TableCell>
                <span className="font-medium">₹{customer.total_spent.toLocaleString()}</span>
              </TableCell>

              {/* Registration Date */}
              <TableCell>
                <span className="text-sm">
                  {format(new Date(customer.registration_date), 'MMM d, yyyy')}
                </span>
              </TableCell>

              {/* Action */}
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/admin/customers/${customer.clerk_user_id}`)
                  }}
                  data-testid={`view-customer-${customer.id}`}
                >
                  View
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
