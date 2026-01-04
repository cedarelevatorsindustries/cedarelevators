"use client"

import { useState } from "react"
import { Building2, CheckCircle, Clock, XCircle, FileText, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { approveVerification, rejectVerification } from "@/lib/actions/business-verification"

interface BusinessVerificationPanelProps {
    business: {
        id: string
        name: string
        gst_number?: string | null
        pan_number?: string | null
        verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
        verification_requested_at?: string | null
        verified_at?: string | null
        verification_notes?: string | null
        verification_documents?: any
        company_address?: string | null
        contact_person?: string | null
        contact_phone?: string | null
    }
    onUpdate?: () => void
}

export function BusinessVerificationPanel({ business, onUpdate }: BusinessVerificationPanelProps) {
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [adminNotes, setAdminNotes] = useState('')

    const getStatusBadge = () => {
        switch (business.verification_status) {
            case 'verified':
                return (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                    </div>
                )
            case 'pending':
                return (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        Pending Review
                    </div>
                )
            case 'rejected':
                return (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Rejected
                    </div>
                )
            default:
                return (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                        Not Applied
                    </div>
                )
        }
    }

    const handleApprove = async () => {
        setIsApproving(true)
        try {
            const result = await approveVerification(business.id, adminNotes)
            if (result.success) {
                toast.success('Business verification approved')
                onUpdate?.()
            } else {
                toast.error(result.error || 'Failed to approve verification')
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve verification')
        } finally {
            setIsApproving(false)
        }
    }

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason')
            return
        }

        setIsRejecting(true)
        try {
            const result = await rejectVerification(business.id, rejectionReason)
            if (result.success) {
                toast.success('Business verification rejected')
                setShowRejectModal(false)
                setRejectionReason('')
                onUpdate?.()
            } else {
                toast.error(result.error || 'Failed to reject verification')
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject verification')
        } finally {
            setIsRejecting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Status Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Verification Status</h3>
                    {getStatusBadge()}
                </div>
            </div>

            {/* Business Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Business Name</label>
                            <p className="text-sm text-gray-900 mt-1">{business.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">GST Number</label>
                            <p className="text-sm text-gray-900 mt-1">{business.gst_number || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">PAN Number</label>
                            <p className="text-sm text-gray-900 mt-1">{business.pan_number || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Contact Person</label>
                            <p className="text-sm text-gray-900 mt-1">{business.contact_person || 'Not provided'}</p>
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Company Address</label>
                            <p className="text-sm text-gray-900 mt-1">{business.company_address || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Contact Phone</label>
                            <p className="text-sm text-gray-900 mt-1">{business.contact_phone || 'Not provided'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Documents */}
            {business.verification_documents && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Submitted Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {business.verification_documents.gst_certificate && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium">GST Certificate</span>
                                    </div>
                                    <Button size="sm" variant="outline">
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                    </Button>
                                </div>
                            )}
                            {business.verification_documents.company_registration && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium">Company Registration</span>
                                    </div>
                                    <Button size="sm" variant="outline">
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                    </Button>
                                </div>
                            )}
                            {business.verification_documents.pan_card && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium">PAN Card</span>
                                    </div>
                                    <Button size="sm" variant="outline">
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Timeline */}
            {business.verification_requested_at && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Verification Requested</p>
                                <p className="text-xs text-gray-600">
                                    {new Date(business.verification_requested_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        {business.verified_at && (
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Verified</p>
                                    <p className="text-xs text-gray-600">
                                        {new Date(business.verified_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Notes */}
            {business.verification_notes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-700">{business.verification_notes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Actions for Pending Status */}
            {business.verification_status === 'pending' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Review Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Admin Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Notes (Optional)
                            </label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add notes for approval..."
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowRejectModal(true)}
                                variant="outline"
                                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                                disabled={isApproving || isRejecting}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                            </Button>
                            <Button
                                onClick={handleApprove}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                disabled={isApproving || isRejecting}
                            >
                                {isApproving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Approving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full">
                        <CardHeader>
                            <CardTitle>Reject Verification</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rejection Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Provide a clear reason for rejection..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => {
                                        setShowRejectModal(false)
                                        setRejectionReason('')
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={isRejecting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleReject}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    disabled={isRejecting || !rejectionReason.trim()}
                                >
                                    {isRejecting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Rejecting...
                                        </>
                                    ) : (
                                        'Confirm Rejection'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

