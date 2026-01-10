'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, CircleCheck, XCircle, Clock, AlertCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Use internal status type for the component's state management
type InternalVerificationStatus = 'pending' | 'approved' | 'rejected' | 'incomplete'

interface BusinessVerificationSectionProps {
  className?: string
}

interface VerificationData {
  id?: string
  business_name: string
  owner_name: string
  business_phone: string
  gstin: string
}

interface Document {
  id: string
  document_type: string
  document_url: string
  file_name: string
  uploaded_at: string
}

export default function BusinessVerificationSection({
  className,
}: BusinessVerificationSectionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<InternalVerificationStatus>('incomplete')
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [verificationId, setVerificationId] = useState<string>('')
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false)

  const [formData, setFormData] = useState<VerificationData>({
    business_name: '',
    owner_name: '',
    business_phone: '',
    gstin: '',
  })

  // Fetch verification status on mount
  useEffect(() => {
    fetchVerification()
  }, [])

  const fetchVerification = async () => {
    try {
      const response = await fetch('/api/business-verification')
      const data = await response.json()

      if (data.success && data.verification) {
        const v = data.verification
        setStatus(v.status)
        setRejectionReason(v.rejection_reason || '')
        setVerificationId(v.id)
        setDocuments(v.documents || [])

        // Populate form with existing data
        setFormData({
          business_name: v.legal_business_name || '',
          owner_name: v.contact_person_name || '',
          business_phone: v.contact_person_phone || '',
          gstin: v.gstin || '',
        })
      }
    } catch (error) {
      console.error('Error fetching verification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate: Either GST number OR visiting card must be provided
    const hasGST = formData.gstin.trim().length > 0
    const hasVisitingCard = documents.some(doc => doc.document_type === 'visiting_card')

    if (!hasGST && !hasVisitingCard) {
      toast.error('Please provide either GST number or upload a visiting card')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/business-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legal_business_name: formData.business_name,
          contact_person_name: formData.owner_name,
          contact_person_phone: formData.business_phone,
          gstin: formData.gstin,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Verification submitted successfully!')
        setVerificationId(data.verification_id)
        setStatus('pending')
      } else {
        toast.error(data.error || 'Failed to submit verification')
      }
    } catch (error) {
      console.error('Error submitting verification:', error)
      toast.error('Failed to submit verification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!verificationId && status === 'incomplete') {
      toast.error('Please save your information first before uploading documents')
      return
    }

    // Check if visiting card already uploaded
    if (documents.some(doc => doc.document_type === 'visiting_card')) {
      toast.error('Visiting card already uploaded. Delete the existing one to upload a new one.')
      return
    }

    setUploadingDoc(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('document_type', 'visiting_card')
      formData.append('verification_id', verificationId)

      const response = await fetch('/api/business-verification/documents', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Visiting card uploaded successfully')
        await fetchVerification() // Refresh to get updated documents
      } else {
        toast.error(data.error || 'Failed to upload document')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setUploadingDoc(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/business-verification/documents?id=${documentId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Document deleted successfully')
        await fetchVerification()
      } else {
        toast.error(data.error || 'Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            <CircleCheck size={14} />
            Verified
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
            <Clock size={14} />
            Pending Review
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            <XCircle size={14} />
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            <AlertCircle size={14} />
            Action Required
          </span>
        )
    }
  }

  const canEdit = status === 'incomplete' || status === 'rejected'
  const canUploadDocs = status === 'incomplete' || status === 'rejected' || status === 'pending'

  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Business Verification</h2>
            <p className="text-sm text-gray-600 mt-1">
              Verify your business to unlock pricing and B2B features
            </p>
          </div>
          <div className="flex-shrink-0">
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Status Messages */}
        {status === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <CircleCheck className="text-green-600 flex-shrink-0" size={32} />
              <div>
                <h4 className="text-lg font-semibold text-green-900">Your Business is Verified!</h4>
                <p className="text-sm text-green-800 mt-1">
                  You now have access to pricing, custom quotes, and all B2B features.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <Clock className="text-orange-600 flex-shrink-0" size={32} />
              <div>
                <h4 className="text-lg font-semibold text-orange-900">Verification in Progress</h4>
                <p className="text-sm text-orange-800 mt-1">
                  Our team is reviewing your information. You'll receive an email once approved (usually within 24 hours).
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'rejected' && rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <XCircle className="text-red-600 flex-shrink-0" size={32} />
              <div>
                <h4 className="text-lg font-semibold text-red-900">Verification Rejected</h4>
                <p className="text-sm text-red-800 mt-2">
                  <strong>Reason:</strong> {rejectionReason}
                </p>
                <p className="text-sm text-red-800 mt-1">
                  Please review the information and resubmit your verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Simplified Form */}
        {canEdit && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="Enter your business name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    placeholder="Enter owner's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.business_phone}
                    onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
                    placeholder="Enter business phone number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number (Optional - Required if no visiting card)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="Enter GST number (if applicable)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide either GST number OR upload a visiting card below
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : status === 'rejected' ? 'Resubmit Verification' : 'Verify Business'}
              </button>
            </div>
          </form>
        )}

        {/* Visiting Card Upload Section */}
        {(canUploadDocs || status === 'approved') && (
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Visiting Card</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload your business visiting card (Required if no GST number provided)
              <br />
              <span className="text-xs text-gray-500">Max 5MB. Formats: PDF, JPG, PNG</span>
            </p>

            {/* Uploaded Document */}
            {documents.length > 0 && (
              <div className="mb-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.file_name}</p>
                        <p className="text-xs text-gray-500">Visiting Card</p>
                      </div>
                    </div>
                    {canUploadDocs && (
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload New Document */}
            {canUploadDocs && documents.length === 0 && (
              <div>
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {uploadingDoc ? 'Uploading...' : 'Choose visiting card to upload'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    disabled={uploadingDoc}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleFileUpload(file)
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Final Submit for Review */}
        {status === 'incomplete' && verificationId && (
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 font-semibold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
