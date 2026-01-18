'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Eye,
  Clock,
  AlertCircle,
  Building2,
} from 'lucide-react'
import { Customer, getDocumentTypeLabel, getDocumentStatusColor, getDocumentStatusLabel } from '@/types/b2b/customer'
import { toast } from 'sonner'
import {
  approveVerification,
  rejectVerification,
  requestMoreDocuments,
  approveDocument,
  rejectDocument,
  getVerificationAuditLog,
} from '@/lib/actions/customers/verification'
import { getVerificationDocuments } from '@/lib/actions/customers/queries'
import { useAdminRole } from '@/hooks/use-admin-role'
import { format } from 'date-fns'

interface CustomerVerificationTabProps {
  customer: Customer
  onUpdate: () => void
}

export function CustomerVerificationTab({ customer, onUpdate }: CustomerVerificationTabProps) {
  const { canApproveVerification } = useAdminRole()
  const [documents, setDocuments] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showRejectInput, setShowRejectInput] = useState(false)

  // Modals
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showRequestDocsDialog, setShowRequestDocsDialog] = useState(false)
  const [showDocumentPreview, setShowDocumentPreview] = useState<any>(null)

  // Form states
  const [approveNotes, setApproveNotes] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [requestDocsMessage, setRequestDocsMessage] = useState('')

  const businessProfile = customer.business_profile
  const verificationStatus = businessProfile?.verification_status

  useEffect(() => {
    loadVerificationData()
  }, [customer.clerk_user_id])

  const loadVerificationData = async () => {
    setLoading(true)
    try {
      const [docsResult, logsResult] = await Promise.all([
        getVerificationDocuments(customer.clerk_user_id),
        getVerificationAuditLog(customer.clerk_user_id),
      ])

      if (docsResult.success) {
        setDocuments(docsResult.documents || [])
      }
      if (logsResult.success) {
        setAuditLogs(logsResult.logs || [])
      }
    } catch (error) {
      console.error('Error loading verification data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveVerification = async () => {
    if (!businessProfile?.id) return
    setLoading(true)
    try {
      const result = await approveVerification(businessProfile.id, approveNotes)
      if (result.success) {
        toast.success('Business verification approved successfully')
        setShowApproveDialog(false)
        setApproveNotes('')
        onUpdate()
        loadVerificationData()
      } else {
        toast.error(result.error || 'Failed to approve verification')
      }
    } catch (error) {
      toast.error('Failed to approve verification')
    } finally {
      setLoading(false)
    }
  }

  const handleRejectVerification = async () => {
    if (!businessProfile?.id || !rejectReason.trim()) {
      toast.error('Rejection reason is required')
      return
    }
    setLoading(true)
    try {
      const result = await rejectVerification(businessProfile.id, rejectReason)
      if (result.success) {
        toast.success('Business verification rejected')
        setShowRejectDialog(false)
        setShowRejectInput(false)
        setRejectReason('')
        onUpdate()
        loadVerificationData()
      } else {
        toast.error(result.error || 'Failed to reject verification')
      }
    } catch (error) {
      toast.error('Failed to reject verification')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveDocument = async (documentId: string) => {
    setLoading(true)
    try {
      const result = await approveDocument(documentId)
      if (result.success) {
        toast.success('Document approved')
        loadVerificationData()
      } else {
        toast.error(result.error || 'Failed to approve document')
      }
    } catch (error) {
      toast.error('Failed to approve document')
    } finally {
      setLoading(false)
    }
  }

  if (!businessProfile) {
    return (
      <Card data-testid="no-business-profile">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">This is not a business account</p>
        </CardContent>
      </Card>
    )
  }

  const visitingCardDoc = documents.find(d => d.document_type === 'visiting_card')
  const hasGST = !!(businessProfile.gstin || businessProfile.gst_number)
  const hasVisitingCard = !!visitingCardDoc

  return (
    <div className="space-y-6" data-testid="customer-verification-tab">
      {/* Card 1: Basic Information */}
      <Card data-testid="verification-status-card">
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>
            Review and approve business verification documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Business Name</p>
              <p className="text-sm font-semibold">{businessProfile.legal_business_name || businessProfile.company_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Owner Name</p>
              <p className="text-sm font-semibold">{businessProfile.contact_person_name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Business Phone Number</p>
              <p className="text-sm font-mono">{businessProfile.contact_person_phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Verification Method</p>
              <div className="flex gap-2 flex-wrap">
                {hasGST && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    GST Number
                  </Badge>
                )}
                {hasVisitingCard && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                    Visiting Card
                  </Badge>
                )}
                {!hasGST && !hasVisitingCard && (
                  <p className="text-sm text-muted-foreground">Not provided</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="text-sm">{businessProfile.created_at ? format(new Date(businessProfile.created_at), 'MMM d, yyyy HH:mm') : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Updated At</p>
              <p className="text-sm">{businessProfile.updated_at ? format(new Date(businessProfile.updated_at), 'MMM d, yyyy HH:mm') : 'N/A'}</p>
            </div>
          </div>

          {businessProfile.verification_notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Admin Notes</p>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {businessProfile.verification_notes}
                </p>
              </div>
            </>
          )}

          {/* Reverification Indicator */}
          {verificationStatus === 'pending' && businessProfile.previous_rejection_reason && (
            <>
              <Separator />
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                      Reverification Submission
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Resubmitted
                      </Badge>
                    </h4>
                    <p className="text-sm text-yellow-800 mb-2">
                      This business was previously rejected and has resubmitted for verification.
                    </p>
                    <div className="bg-white border border-yellow-200 rounded p-3 mt-2">
                      <p className="text-xs font-medium text-yellow-900 mb-1">Previous Rejection Reason:</p>
                      <p className="text-sm text-gray-700">{businessProfile.previous_rejection_reason}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Card 2: Verification Details */}
      <Card data-testid="verification-details-card">
        <CardHeader>
          <CardTitle>
            {hasGST && hasVisitingCard
              ? 'Verification Documents'
              : hasGST
                ? 'GST Verification'
                : hasVisitingCard
                  ? 'Visiting Card Verification'
                  : 'Verification Details'}
          </CardTitle>
          <CardDescription>
            {hasGST && hasVisitingCard
              ? 'GST number and business visiting card provided for verification'
              : hasGST
                ? 'GST number provided for verification'
                : hasVisitingCard
                  ? 'Business visiting card uploaded for verification'
                  : 'No verification method provided'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasGST && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-sm font-medium text-blue-700 mb-2">GST Number</p>
              <p className="text-2xl font-bold text-blue-900 font-mono tracking-wider">
                {businessProfile.gstin || businessProfile.gst_number}
              </p>
            </div>
          )}

          {hasVisitingCard && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <p className="text-sm font-medium text-purple-700 mb-3 text-center">Business Visiting Card</p>
              <div className="flex justify-center">
                <img
                  src={visitingCardDoc.file_url}
                  alt="Business Visiting Card"
                  className="max-w-full max-h-96 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => window.open(visitingCardDoc.file_url, '_blank')}
                />
              </div>
              <div className="text-center mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(visitingCardDoc.file_url, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Size
                </Button>
              </div>
            </div>
          )}

          {!hasGST && !hasVisitingCard && (
            <div className="bg-muted rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No verification method provided</p>
            </div>
          )}

          {/* Approve/Reject Actions */}
          {verificationStatus === 'pending' && (hasGST || hasVisitingCard) && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex justify-end gap-3">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setShowRejectInput(!showRejectInput)}
                    data-testid="reject-verification-button-inline"
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleApproveVerification}
                    disabled={loading}
                    data-testid="approve-verification-button-inline"
                  >
                    Approve
                  </Button>
                </div>

                {/* Inline Reject Reason Input */}
                {showRejectInput && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-red-900">Rejection Reason *</label>
                      <Textarea
                        placeholder="Explain why the verification is being rejected..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        className="mt-2 focus-visible:ring-0 focus-visible:border-gray-900"
                        data-testid="reject-reason-textarea-inline"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowRejectInput(false)
                          setRejectReason('')
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRejectVerification}
                        disabled={loading || !rejectReason.trim()}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        data-testid="confirm-reject-button-inline"
                      >
                        Confirm Rejection
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>


      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent data-testid="approve-dialog">
          <DialogHeader>
            <DialogTitle>Approve Business Verification</DialogTitle>
            <DialogDescription>
              This will mark {businessProfile.company_name} as a verified business.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="Add any notes about the verification..."
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                rows={3}
                className="focus-visible:ring-0 focus-visible:border-gray-900"
                data-testid="approve-notes-textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              data-testid="cancel-approve-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveVerification}
              disabled={loading}
              data-testid="confirm-approve-button"
            >
              Approve Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent data-testid="reject-dialog">
          <DialogHeader>
            <DialogTitle>Reject Business Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Rejection Reason *</label>
              <Textarea
                placeholder="Explain why the verification is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="focus-visible:ring-0 focus-visible:border-gray-900"
                data-testid="reject-reason-textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              data-testid="cancel-reject-button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectVerification}
              disabled={loading || !rejectReason.trim()}
              data-testid="confirm-reject-button"
            >
              Reject Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

