'use client'

import { useState } from 'react'
import { FileText, Upload, Check, X, Eye, Trash2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  type: 'gst' | 'pan' | 'license'
  name: string
  uploadDate: string
  status: 'approved' | 'pending' | 'rejected'
  fileUrl: string
  rejectionReason?: string
}

interface BusinessDocumentsSectionProps {
  accountType: 'guest' | 'individual' | 'business'
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'incomplete'
}

export default function BusinessDocumentsSection({
  accountType,
  verificationStatus
}: BusinessDocumentsSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      type: 'gst',
      name: 'GST_Certificate.pdf',
      uploadDate: '2024-01-15',
      status: 'approved',
      fileUrl: '#'
    },
    {
      id: '2',
      type: 'pan',
      name: 'PAN_Card.pdf',
      uploadDate: '2024-01-15',
      status: 'approved',
      fileUrl: '#'
    },
    {
      id: '3',
      type: 'license',
      name: 'Business_License.pdf',
      uploadDate: '2024-01-20',
      status: 'pending',
      fileUrl: '#'
    }
  ])

  const [uploadingType, setUploadingType] = useState<string | null>(null)

  // Only business accounts can access documents
  if (accountType !== 'business') {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-8 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-500 rounded-lg">
                <FileText className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Business Account Required
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Upgrade to a business account to upload and manage business documents.
                </p>
                <a
                  href="/profile/account"
                  className="inline-block px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Upgrade Account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const documentTypes = [
    {
      type: 'gst',
      label: 'GST Certificate',
      description: 'Upload your GST registration certificate',
      required: true,
      icon: '📄'
    },
    {
      type: 'pan',
      label: 'PAN Card',
      description: 'Upload company PAN card',
      required: true,
      icon: '🆔'
    },
    {
      type: 'license',
      label: 'Business License',
      description: 'Upload your business registration/license',
      required: true,
      icon: '📋'
    }
  ]

  const getDocument = (type: string) => {
    return documents.find(doc => doc.type === type)
  }

  const handleFileUpload = (type: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadingType(type)
      // Simulate upload
      setTimeout(() => {
        const newDoc: Document = {
          id: Date.now().toString(),
          type: type as any,
          name: file.name,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'pending',
          fileUrl: '#'
        }
        setDocuments(prev => [...prev.filter(d => d.type !== type), newDoc])
        setUploadingType(null)
      }, 1500)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== id))
    }
  }

  const getStatusBadge = (status: Document['status']) => {
    const configs = {
      approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: Check },
      pending: { label: 'Pending Review', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: X },
    }
    return configs[status]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const allDocsApproved = documentTypes.every(type => {
    const doc = getDocument(type.type)
    return doc && doc.status === 'approved'
  })

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Business Documents</h2>
        <p className="text-sm text-gray-600 mt-1">
          Upload and manage your business verification documents
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Status Banner */}
        {allDocsApproved ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-full">
                <Check className="text-white" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-green-900">All Documents Verified</h4>
                <p className="text-sm text-green-700">
                  Your business documents have been approved. You have full access to all features.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <FileText className="text-white" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Document Verification Required</h4>
                <p className="text-sm text-blue-700">
                  Upload all required documents to complete your business verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Cards */}
        <div className="space-y-4">
          {documentTypes.map((docType) => {
            const existingDoc = getDocument(docType.type)
            const isUploading = uploadingType === docType.type

            return (
              <div
                key={docType.type}
                className="border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{docType.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {docType.label}
                        {docType.required && (
                          <span className="text-xs text-red-600 font-normal">*Required</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{docType.description}</p>
                    </div>
                  </div>
                </div>

                {existingDoc ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="text-gray-400" size={24} />
                        <div>
                          <p className="font-medium text-gray-900">{existingDoc.name}</p>
                          <p className="text-sm text-gray-600">
                            Uploaded on {formatDate(existingDoc.uploadDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {(() => {
                          const statusConfig = getStatusBadge(existingDoc.status)
                          const StatusIcon = statusConfig.icon
                          return (
                            <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', statusConfig.color)}>
                              <StatusIcon size={14} />
                              {statusConfig.label}
                            </span>
                          )
                        })()}

                        <button
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>

                        {existingDoc.status !== 'approved' && (
                          <button
                            onClick={() => handleDelete(existingDoc.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    {existingDoc.status === 'rejected' && existingDoc.rejectionReason && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {existingDoc.rejectionReason}
                        </p>
                      </div>
                    )}

                    {existingDoc.status !== 'approved' && (
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg cursor-pointer transition-colors">
                        <Upload size={16} />
                        Re-upload Document
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(docType.type, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div>
                    {isUploading ? (
                      <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                          <p className="text-sm text-gray-600">Uploading...</p>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all">
                        <Upload className="text-gray-400 mb-3" size={32} />
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, JPG, PNG (Max 5MB)
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(docType.type, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Document Guidelines</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Documents must be clear and readable</li>
                <li>• All information must be visible</li>
                <li>• Documents should be valid and not expired</li>
                <li>• File size should not exceed 5MB</li>
                <li>• Accepted formats: PDF, JPG, PNG</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
