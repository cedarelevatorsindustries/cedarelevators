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
  getVerificationDocuments,
  getVerificationAuditLog,
} from '@/lib/actions/admin-customers'
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

  return (
    <div className="space-y-6" data-testid="customer-verification-tab">
      {/* Verification Status Card */}
      <Card data-testid="verification-status-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>
                Review and approve business verification documents
              </CardDescription>
            </div>
            {verificationStatus === 'pending' && canApproveVerification() && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  data-testid="reject-verification-button"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => setShowApproveDialog(true)}
                  data-testid="approve-verification-button"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Verification
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Company Name</p>
              <p className="text-sm font-semibold">{businessProfile.company_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">GST Number</p>
              <p className="text-sm font-mono">{businessProfile.gst_number || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">PAN Number</p>
              <p className="text-sm font-mono">{businessProfile.pan_number || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Documents Uploaded</p>
              <p className="text-sm font-semibold">{documents.length}</p>
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
        </CardContent>
      </Card>

      {/* Documents Card */}
      <Card data-testid="documents-card">
        <CardHeader>
          <CardTitle>Verification Documents</CardTitle>
          <CardDescription>
            Review uploaded documents for business verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`document-${doc.id}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {getDocumentTypeLabel(doc.document_type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doc.file_name} • Uploaded {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                      </p>
                      {doc.rejection_reason && (
                        <p className="text-xs text-red-600 mt-1">
                          Rejected: {doc.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={getDocumentStatusColor(doc.status)}
                      data-testid={`document-status-${doc.id}`}
                    >
                      {getDocumentStatusLabel(doc.status)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.file_url, '_blank')}
                      data-testid={`view-document-${doc.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {doc.status === 'pending' && canApproveVerification() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApproveDocument(doc.id)}
                        data-testid={`approve-document-${doc.id}`}
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8" data-testid="no-documents">
              No documents uploaded yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card data-testid="audit-log-card">
        <CardHeader>
          <CardTitle>Verification History</CardTitle>
          <CardDescription>Timeline of all verification actions</CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length > 0 ? (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex gap-4" data-testid={`audit-log-${log.id}`}>
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-muted p-2">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="w-px h-full bg-muted mt-2"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium">{log.action_type.replace(/_/g, ' ').toUpperCase()}</p>
                    {log.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {log.admin_name && `${log.admin_name} • `}
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8" data-testid="no-audit-logs">
              No verification history yet
            </p>
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
