'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, CircleCheck, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface BusinessProfile {
  id: string
  company_name: string
  company_type: string
  gst_number?: string
  verification_status: string
  created_at: string
  clerk_user_id: string
  documents?: { count: number }
}

interface VerificationTableProps {
  profiles: BusinessProfile[]
  isLoading?: boolean
}

export function VerificationTable({ profiles, isLoading }: VerificationTableProps) {
  const router = useRouter()

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      verified: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      unverified: 'outline',
    }

    const colors: Record<string, string> = {
      verified: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      unverified: 'bg-gray-100 text-gray-800 border-gray-200',
    }

    return (
      <Badge
        variant={variants[status] || 'outline'}
        className={colors[status]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>GST Number</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </TableCell>
                <TableCell className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </TableCell>
                <TableCell className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-28" />
                </TableCell>
                <TableCell className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </TableCell>
                <TableCell className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-20" />
                </TableCell>
                <TableCell className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </TableCell>
                <TableCell className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No business profiles found</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>GST Number</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id} data-testid={`business-profile-${profile.id}`}>
              <TableCell className="font-medium">{profile.company_name}</TableCell>
              <TableCell className="capitalize">
                {profile.company_type?.replace('_', ' ')}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {profile.gst_number || '-'}
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {profile.documents?.count || 0} uploaded
                </span>
              </TableCell>
              <TableCell>{getStatusBadge(profile.verification_status)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/business-verification/${profile.id}`)}
                  data-testid={`view-business-${profile.id}`}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
