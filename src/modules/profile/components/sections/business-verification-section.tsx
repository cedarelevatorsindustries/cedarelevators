'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, CircleCheck, XCircle, Clock, AlertCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { CustomSelect } from '@/components/ui/custom-select'

type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'incomplete'

interface BusinessVerificationSectionProps {
  className?: string
}

interface VerificationData {
  id?: string
  legal_business_name: string
  business_type: string
  registration_number: string
  year_established: string
  registered_address_line1: string
  registered_address_line2: string
  city: string
  state: string
  country: string
  postal_code: string
  same_as_billing: boolean
  contact_person_name: string
  contact_person_email: string
  contact_person_phone: string
  contact_person_designation: string
  gstin: string
  pan_number: string
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
  const [status, setStatus] = useState<VerificationStatus>('incomplete')
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [verificationId, setVerificationId] = useState<string>('')
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const [selectedDocType, setSelectedDocType] = useState<string>('business_registration')

  const [formData, setFormData] = useState<VerificationData>({
    legal_business_name: '',
    business_type: 'private_limited',
    registration_number: '',
    year_established: '',
    registered_address_line1: '',
    registered_address_line2: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    same_as_billing: false,
    contact_person_name: '',
    contact_person_email: '',
    contact_person_phone: '',
    contact_person_designation: '',
    gstin: '',
    pan_number: '',
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
          legal_business_name: v.legal_business_name || '',
          business_type: v.business_type || 'private_limited',
          registration_number: v.registration_number || '',
          year_established: v.year_established?.toString() || '',
          registered_address_line1: v.registered_address_line1 || '',
          registered_address_line2: v.registered_address_line2 || '',
          city: v.city || '',
          state: v.state || '',
          country: v.country || 'India',
          postal_code: v.postal_code || '',
          same_as_billing: v.same_as_billing || false,
          contact_person_name: v.contact_person_name || '',
          contact_person_email: v.contact_person_email || '',
          contact_person_phone: v.contact_person_phone || '',
          contact_person_designation: v.contact_person_designation || '',
          gstin: v.gstin || '',
          pan_number: v.pan_number || '',
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

    // Validate minimum documents
    if (documents.length < 1) {
      toast.error('Please upload at least 1 document')
      return
    }

    if (documents.length > 2) {
      toast.error('Maximum 2 documents allowed')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/business-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year_established: formData.year_established ? parseInt(formData.year_established) : null,
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

  const handleFileUpload = async (documentType: string, file: File) => {
    if (!verificationId && status === 'incomplete') {
      toast.error('Please save your information first before uploading documents')
      return
    }

    setUploadingDoc(documentType)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('document_type', documentType)
      formData.append('verification_id', verificationId)

      const response = await fetch('/api/business-verification/documents', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Document uploaded successfully')
        await fetchVerification() // Refresh to get updated documents
      } else {
        toast.error(data.error || 'Failed to upload document')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setUploadingDoc(null)
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
              Verify your business to unlock B2B features like custom quotes and bulk ordering
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
                  You now have access to custom quotes, bulk ordering, and all B2B features.
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
                  Our team is reviewing your documents. You'll receive an email once approved (usually within 24 hours).
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

        {/* Form */}
        {canEdit && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Level 1: Business Basics */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Basics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Legal Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.legal_business_name}
                    onChange={(e) => setFormData({ ...formData, legal_business_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <CustomSelect
                    value={formData.business_type}
                    onChange={(value) => setFormData({ ...formData, business_type: value })}
                    options={[
                      { value: 'proprietorship', label: 'Proprietorship' },
                      { value: 'partnership', label: 'Partnership' },
                      { value: 'private_limited', label: 'Private Limited' },
                      { value: 'llp', label: 'LLP' },
                      { value: 'other', label: 'Other' },
                    ]}
                    placeholder="Select Business Type"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number * (GSTIN / CIN / Reg No)
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year of Establishment (Optional)
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.year_established}
                    onChange={(e) => setFormData({ ...formData, year_established: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Business Address */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registered Business Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.registered_address_line1}
                    onChange={(e) => setFormData({ ...formData, registered_address_line1: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.registered_address_line2}
                    onChange={(e) => setFormData({ ...formData, registered_address_line2: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN / ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.same_as_billing}
                      onChange={(e) => setFormData({ ...formData, same_as_billing: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">Same as billing address</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Authorized Contact Person */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Authorized Contact Person</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.contact_person_name}
                    onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.contact_person_email}
                    onChange={(e) => setFormData({ ...formData, contact_person_email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.contact_person_phone}
                    onChange={(e) => setFormData({ ...formData, contact_person_phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation / Role *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.contact_person_designation}
                    onChange={(e) => setFormData({ ...formData, contact_person_designation: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Level 2: Tax Information */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GSTIN (if applicable)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Number (optional but recommended)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.pan_number}
                    onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                  />
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
                {isSubmitting ? 'Saving...' : status === 'rejected' ? 'Resubmit' : 'Save Information'}
              </button>
            </div>
          </form>
        )}

        {/* Document Upload Section */}
        {(canUploadDocs || status === 'approved') && (
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Documents</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload 1-2 documents: Business Registration, GST Certificate, Trade License, Incorporation Certificate, or PAN Card
              <br />
              <span className="text-xs text-gray-500">Max 5MB per file. Formats: PDF, JPG, PNG</span>
            </p>

            {/* Uploaded Documents */}
            {documents.length > 0 && (
              <div className="mb-4 space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.file_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{doc.document_type.replace('_', ' ')}</p>
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
            {canUploadDocs && documents.length < 2 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <CustomSelect
                    value={selectedDocType}
                    onChange={setSelectedDocType}
                    options={[
                      { value: 'business_registration', label: 'Business Registration Certificate' },
                      { value: 'gst_certificate', label: 'GST Certificate' },
                      { value: 'trade_license', label: 'Trade License' },
                      { value: 'incorporation_certificate', label: 'Incorporation Certificate' },
                      { value: 'pan_card', label: 'PAN Card' },
                    ]}
                    placeholder="Select Document Type"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                    <Upload size={20} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {uploadingDoc ? 'Uploading...' : 'Choose file to upload'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      disabled={!!uploadingDoc}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFileUpload(selectedDocType, file)
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Final Submit for Review */}
        {status === 'incomplete' && documents.length >= 1 && documents.length <= 2 && (
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
