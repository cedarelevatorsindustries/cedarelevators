'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useVerifyBusiness } from '@/hooks/queries/useBusinessVerification'
import { getBusinessProfile } from '@/lib/actions/business'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Building2,
  FileText,
  MapPin,
  Phone,
  Globe,
  Mail,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Download,
  ExternalLink,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { clerkClient } from '@clerk/nextjs/server'

interface BusinessProfileDetail {
  id: string
  company_name: string
  company_type: string
  gst_number?: string
  pan_number?: string
  tan_number?: string
  business_address: any
  billing_address: any
  phone: string
  website?: string
  annual_revenue?: string
  employee_count?: string
  verification_status: string
  verification_notes?: string
  verified_at?: string
  verified_by?: string
  created_at: string
  clerk_user_id: string
  documents: Array<{
    id: string
    document_type: string
    file_name: string
    file_url: string
    file_size: number
    mime_type: string
    status: string
    uploaded_at: string
  }>
}

export default function BusinessVerificationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<BusinessProfileDetail | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const verifyMutation = useVerifyBusiness()

  useEffect(() => {
    loadProfile()
  }, [params.id])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      
      // Fetch business profile with documents
      const result = await getBusinessProfile()
      if (!result.success || !result.profile) {
        toast.error('Business profile not found')
        router.push('/admin/business-verification')
        return
      }

      setProfile(result.profile as BusinessProfileDetail)
      setNotes(result.profile.verification_notes || '')

      // Get user email from Clerk (would need to implement this properly)
      // For now, we'll skip email fetching
      
    } catch (error: any) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load business profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (status: 'verified' | 'rejected') => {
    if (!profile) return

    try {
      await verifyMutation.mutateAsync({
        profileId: profile.id,
        status,
        notes: notes || undefined,
      })

      setShowApproveDialog(false)
      setShowRejectDialog(false)
      
      // Refresh profile
      await loadProfile()
      
      // Navigate back after 2 seconds
      setTimeout(() => {
        router.push('/admin/business-verification')
      }, 2000)
    } catch (error) {
      // Error handled by mutation
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-96" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Business profile not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/admin/business-verification')}
          >
            Back to List
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      verified: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      unverified: 'bg-gray-100 text-gray-800 border-gray-200',
    }

    return (
      <Badge className={colors[status] || colors.unverified}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatAddress = (address: any) => {
    if (!address) return 'Not provided'
    return `${address.address_line1}${address.address_line2 ? ', ' + address.address_line2 : ''}, ${address.city}, ${address.state} ${address.postal_code}, ${address.country}`
  }

  const isPending = profile.verification_status === 'pending'

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/business-verification')}
            data-testid="back-button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              {profile.company_name}
              {getStatusBadge(profile.verification_status)}
            </h2>
            <p className="text-muted-foreground">
              Submitted {format(new Date(profile.created_at), 'PPP')}
            </p>
          </div>
        </div>
        
        {isPending && (
          <div className="flex gap-2">
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="reject-button">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Business Verification</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to reject this business verification? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="reject-notes">Reason for rejection</Label>
                  <Textarea
                    id="reject-notes"
                    placeholder="Provide a reason for rejection..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    data-testid="rejection-notes"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleVerify('rejected')}
                    disabled={verifyMutation.isPending}
                    data-testid="confirm-reject-button"
                  >
                    {verifyMutation.isPending ? 'Rejecting...' : 'Reject Business'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
              <DialogTrigger asChild>
                <Button data-testid="approve-button">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve Business Verification</DialogTitle>
                  <DialogDescription>
                    Confirm that you have reviewed all documents and want to verify this business account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="approve-notes">Notes (optional)</Label>
                  <Textarea
                    id="approve-notes"
                    placeholder="Add any notes about the verification..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    data-testid="approval-notes"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleVerify('verified')}
                    disabled={verifyMutation.isPending}
                    data-testid="confirm-approve-button"
                  >
                    {verifyMutation.isPending ? 'Approving...' : 'Approve Business'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Company Type</p>
              <p className="mt-1 capitalize">{profile.company_type?.replace('_', ' ')}</p>
            </div>
            {profile.gst_number && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">GST Number</p>
                <p className="mt-1 font-mono">{profile.gst_number}</p>
              </div>
            )}
            {profile.pan_number && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">PAN Number</p>
                <p className="mt-1 font-mono">{profile.pan_number}</p>
              </div>
            )}
            {profile.tan_number && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">TAN Number</p>
                <p className="mt-1 font-mono">{profile.tan_number}</p>
              </div>
            )}
            {profile.annual_revenue && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Annual Revenue</p>
                <p className="mt-1">{profile.annual_revenue}</p>
              </div>
            )}
            {profile.employee_count && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employee Count</p>
                <p className="mt-1">{profile.employee_count}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="mt-1">{profile.phone}</p>
            </div>
            {profile.website && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Website</p>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1 text-blue-600 hover:underline"
                >
                  {profile.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Business Address</p>
              <p className="mt-1 text-sm">{formatAddress(profile.business_address)}</p>
            </div>
            {profile.billing_address && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Billing Address</p>
                <p className="mt-1 text-sm">{formatAddress(profile.billing_address)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Documents
          </CardTitle>
          <CardDescription>Review all submitted documents</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.documents && profile.documents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {profile.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`document-${doc.id}`}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium capitalize">
                        {doc.document_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {format(new Date(doc.uploaded_at), 'PPP')}
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No documents uploaded</p>
          )}
        </CardContent>
      </Card>

      {/* Verification History */}
      {(profile.verified_at || profile.verification_notes) && (
        <Card>
          <CardHeader>
            <CardTitle>Verification History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile.verified_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified At</p>
                <p className="mt-1">{format(new Date(profile.verified_at), 'PPPpp')}</p>
              </div>
            )}
            {profile.verification_notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="mt-1 text-sm whitespace-pre-wrap">{profile.verification_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
