'use client'

import { useState } from 'react'
import { Upload, FileText, CircleCheck, XCircle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'incomplete'

interface BusinessVerificationSectionProps {
  verificationStatus?: VerificationStatus
  rejectionReason?: string
  onSubmit: (data: BusinessVerificationData) => Promise<void>
  className?: string
}

interface BusinessVerificationData {
  company_name: string
  gst_number: string
  pan_number: string
  contact_person: string
  contact_phone: string
  documents: {
    gst_certificate?: File
    pan_card?: File
    incorporation_certificate?: File
  }
}

export default function BusinessVerificationSection({
  verificationStatus = 'incomplete',
  rejectionReason,
  onSubmit,
  className,
}: BusinessVerificationSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<BusinessVerificationData>({
    company_name: '',
    gst_number: '',
    pan_number: '',
    contact_person: '',
    contact_phone: '',
    documents: {},
  })

  const handleFileChange = (field: keyof BusinessVerificationData['documents'], file: File | null) => {
    if (file) {
      setFormData({
        ...formData,
        documents: {
          ...formData.documents,
          [field]: file,
        },
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting verification:', error)
      alert('Failed to submit verification. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'approved':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CircleCheck className="text-green-600" size={20} />
            <span className="text-green-700 font-semibold">Verified Business</span>
          </div>
        )
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <Clock className="text-orange-600" size={20} />
            <span className="text-orange-700 font-semibold">
              Verification Pending – Usually approved within 24 hrs
            </span>
          </div>
        )
      case 'rejected':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="text-red-600" size={20} />
            <span className="text-red-700 font-semibold">Verification Rejected</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-700 font-semibold">
              Complete business verification to unlock custom quotes & bulk ordering
            </span>
          </div>
        )
    }
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
          {/* Status Badge - Top Right */}
          <div className="flex-shrink-0">
            {verificationStatus === 'approved' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                <CircleCheck size={14} />
                Verified
              </span>
            )}
            {verificationStatus === 'pending' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                <Clock size={14} />
                Pending
              </span>
            )}
            {verificationStatus === 'rejected' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                <XCircle size={14} />
                Rejected
              </span>
            )}
            {verificationStatus === 'incomplete' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                <AlertCircle size={14} />
                Action Required
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Status Message with Illustration */}
        {verificationStatus === 'pending' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <img 
                  src="/images/verification/verification_illustration.png" 
                  alt="Verification in progress" 
                  className="w-32 h-32 md:w-40 md:h-40 object-contain"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-semibold text-orange-900 mb-2">Verification in Progress</h4>
                <p className="text-sm text-orange-800">
                  Our team is reviewing your documents. You'll receive an email once approved (usually within 24 hours).
                </p>
              </div>
            </div>
          </div>
        )}
        
        {verificationStatus === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <img 
                  src="/images/verification/verification_illustration.png" 
                  alt="Business verified" 
                  className="w-32 h-32 md:w-40 md:h-40 object-contain"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-semibold text-green-900 mb-2">Your Business is Verified!</h4>
                <p className="text-sm text-green-800">
                  You now have access to custom quotes, bulk ordering, and all B2B features.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {verificationStatus === 'incomplete' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <img 
                  src="/images/verification/verification_illustration.png" 
                  alt="Action required" 
                  className="w-32 h-32 md:w-40 md:h-40 object-contain"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 text-sm font-semibold rounded-full mb-3">
                  <AlertCircle size={16} />
                  Action Required
                </div>
                <h4 className="text-xl font-semibold text-red-900 mb-2">Complete Business Verification</h4>
                <p className="text-sm text-red-800">
                  Complete business verification to unlock quotes & bulk ordering features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Reason with Illustration */}
        {verificationStatus === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <img 
                  src="/images/verification/verification_illustration.png" 
                  alt="Verification rejected" 
                  className="w-32 h-32 md:w-40 md:h-40 object-contain"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-semibold text-red-900 mb-2">Verification Rejected</h4>
                {rejectionReason && (
                  <p className="text-sm text-red-800 mb-2">
                    <strong>Reason:</strong> {rejectionReason}
                  </p>
                )}
                <p className="text-sm text-red-800">
                  Please review the information and resubmit your verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Verification Form */}
        {(verificationStatus === 'incomplete' || verificationStatus === 'rejected') && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Details */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="company-name">
                    Legal Company Name *
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="company-name"
                    type="text"
                    placeholder="Enter legal company name"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="gst-number">
                    GST Number *
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="gst-number"
                    type="text"
                    placeholder="Enter GST number"
                    required
                    value={formData.gst_number}
                    onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="pan-number">
                    PAN Number *
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="pan-number"
                    type="text"
                    placeholder="Enter PAN number"
                    required
                    value={formData.pan_number}
                    onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="contact-person">
                    Contact Person *
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="contact-person"
                    type="text"
                    placeholder="Enter contact person name"
                    required
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="contact-phone">
                    Contact Phone *
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="contact-phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    required
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Document Uploads */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload at least 2 documents: GST Certificate + (PAN Card or Incorporation Certificate)
              </p>
              
              <div className="space-y-4">
                {/* GST Certificate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Certificate *
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.documents.gst_certificate?.name || 'Choose file'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFileChange('gst_certificate', e.target.files?.[0] || null)}
                      />
                    </label>
                    {formData.documents.gst_certificate && (
                      <FileText className="text-green-600" size={24} />
                    )}
                  </div>
                </div>

                {/* PAN Card */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Card
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.documents.pan_card?.name || 'Choose file'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFileChange('pan_card', e.target.files?.[0] || null)}
                      />
                    </label>
                    {formData.documents.pan_card && (
                      <FileText className="text-green-600" size={24} />
                    )}
                  </div>
                </div>

                {/* Incorporation Certificate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate of Incorporation
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.documents.incorporation_certificate?.name || 'Choose file'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFileChange('incorporation_certificate', e.target.files?.[0] || null)}
                      />
                    </label>
                    {formData.documents.incorporation_certificate && (
                      <FileText className="text-green-600" size={24} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : verificationStatus === 'rejected' ? 'Resubmit' : 'Submit for Verification'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

