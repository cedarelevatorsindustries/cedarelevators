'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface CustomerQuotesTabProps {
  customerClerkId: string
  quotes: any[]
}

export function CustomerQuotesTab({ customerClerkId, quotes }: CustomerQuotesTabProps) {
  const router = useRouter()

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      reviewing: 'bg-blue-100 text-blue-700 border-blue-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      converted: 'bg-purple-100 text-purple-700 border-purple-200',
    }

    return (
      <Badge variant="outline" className={statusColors[status] || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityColors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-700 border-gray-200',
      medium: 'bg-orange-100 text-orange-700 border-orange-200',
      high: 'bg-red-100 text-red-700 border-red-200',
    }

    return (
      <Badge variant="outline" className={priorityColors[priority] || ''}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  return (
    <Card data-testid="customer-quotes-tab">
      <CardHeader>
        <CardTitle>Quote History</CardTitle>
      </CardHeader>
      <CardContent>
        {quotes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow
                  key={quote.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/admin/quotes/${quote.id}`)}
                  data-testid={`quote-row-${quote.id}`}
                >
                  <TableCell className="font-medium">
                    {quote.quote_number}
                  </TableCell>
                  <TableCell>
                    {format(new Date(quote.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {quote.items?.length || 0} items
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(quote.priority)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(quote.status)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{quote.estimated_total?.toLocaleString() || '0'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8" data-testid="no-quotes">
            No quotes yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}

