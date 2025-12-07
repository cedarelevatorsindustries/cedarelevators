"use client"

import { useState } from 'react'
import { Upload, CheckCircle, XCircle, AlertCircle, Eye, Download, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulkUpload {
  id: string
  fileName: string
  uploadDate: string
  status: 'success' | 'partial' | 'failed'
  totalItems: number
  successItems: number
  failedItems: number
  errorLog?: string
}

export default function BulkQuoteHistory() {
  const [uploads, setUploads] = useState<BulkUpload[]>([
    {
      id: '1',
      fileName: 'monthly_order_jan_2024.csv',
      uploadDate: '2024-01-20T10:30:00',
      status: 'success',
      totalItems: 50,
      successItems: 50,
      failedItems: 0
    },
    {
      id: '2',
      fileName: 'spare_parts_bulk.xlsx',
      uploadDate: '2024-01-18T14:15:00',
      status: 'partial',
      totalItems: 100,
      successItems: 95,
      failedItems: 5,
      errorLog: 'Invalid SKU: SKU-123, SKU-456, SKU-789\nOut of stock: SKU-234, SKU-567'
    },
    {
      id: '3',
      fileName: 'maintenance_kit.csv',
      uploadDate: '2024-01-15T09:00:00',
      status: 'failed',
      totalItems: 25,
      successItems: 0,
      failedItems: 25,
      errorLog: 'File format error: Invalid CSV structure'
    }
  ])

  const [selectedUpload, setSelectedUpload] = useState<BulkUpload | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const getStatusConfig = (status: BulkUpload['status']) => {
    const configs = {
      success: {
        label: 'Success',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      partial: {
        label: 'Partial Success',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: AlertCircle,
        iconColor: 'text-orange-600'
      },
      failed: {
        label: 'Failed',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        iconColor: 'text-red-600'
      }
    }
    return configs[status]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewErrors = (upload: BulkUpload) => {
    setSelectedUpload(upload)
    setShowErrorModal(true)
  }

  const handleRetry = (uploadId: string) => {
    alert(`Retrying upload ${uploadId}...`)
  }

  const handleDownloadErrorLog = (upload: BulkUpload) => {
    // Create a blob with error log
    const blob = new Blob([upload.errorLog || ''], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error_log_${upload.fileName}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900">Bulk Upload History</h3>
          <p className="text-xs text-gray-600 mt-1">Track your CSV/Excel bulk quote uploads</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{uploads.length} uploads</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="text-green-600" size={16} />
            <span className="text-xs font-medium text-green-700">Success</span>
          </div>
          <p className="text-xl font-bold text-green-900">
            {uploads.filter(u => u.status === 'success').length}
          </p>
        </div>

        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="text-orange-600" size={16} />
            <span className="text-xs font-medium text-orange-700">Partial</span>
          </div>
          <p className="text-xl font-bold text-orange-900">
            {uploads.filter(u => u.status === 'partial').length}
          </p>
        </div>

        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="text-red-600" size={16} />
            <span className="text-xs font-medium text-red-700">Failed</span>
          </div>
          <p className="text-xl font-bold text-red-900">
            {uploads.filter(u => u.status === 'failed').length}
          </p>
        </div>
      </div>

      {/* Upload List */}
      {uploads.length === 0 ? (
        <div className="text-center py-8">
          <Upload className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-sm text-gray-600">No bulk uploads yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {uploads.map((upload) => {
            const statusConfig = getStatusConfig(upload.status)
            const StatusIcon = statusConfig.icon

            return (
              <div
                key={upload.id}
                className={cn(
                  'p-4 border-2 rounded-lg transition-all',
                  statusConfig.color
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn('p-2 rounded-lg bg-white')}>
                      <StatusIcon className={statusConfig.iconColor} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{upload.fileName}</h4>
                      <p className="text-xs text-gray-600 mt-1">{formatDate(upload.uploadDate)}</p>
                    </div>
                  </div>
                  <span className={cn('px-2 py-1 rounded text-xs font-semibold whitespace-nowrap', statusConfig.color)}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-lg font-bold text-gray-900">{upload.totalItems}</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-xs text-gray-600">Success</p>
                    <p className="text-lg font-bold text-green-600">{upload.successItems}</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-xs text-gray-600">Failed</p>
                    <p className="text-lg font-bold text-red-600">{upload.failedItems}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {upload.failedItems > 0 && (
                    <>
                      <button
                        onClick={() => handleViewErrors(upload)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-colors"
                      >
                        <Eye size={14} />
                        View Errors
                      </button>
                      <button
                        onClick={() => handleRetry(upload.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <RefreshCw size={14} />
                        Retry Failed
                      </button>
                    </>
                  )}
                  {upload.failedItems === 0 && (
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-colors">
                      <Eye size={14} />
                      View Details
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && selectedUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Error Details</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedUpload.fileName}</p>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="text-red-600" size={20} />
                  <h4 className="font-semibold text-red-900">
                    {selectedUpload.failedItems} items failed to process
                  </h4>
                </div>
                <p className="text-sm text-red-800">
                  Review the errors below and fix the issues in your file before re-uploading.
                </p>
              </div>

              {selectedUpload.errorLog && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Error Log:</h4>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {selectedUpload.errorLog}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowErrorModal(false)
                    setSelectedUpload(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadErrorLog(selectedUpload)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <Download size={16} />
                  Download Error Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Download the error log to see detailed information about failed items. 
          Fix the errors in your file and re-upload to complete your bulk quote.
        </p>
      </div>
    </div>
  )
}
