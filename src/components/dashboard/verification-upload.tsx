"use client"

import { useState } from 'react'
import { X, Upload, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface VerificationUploadProps {
  onClose: () => void
  onSuccess: () => void
}

export default function VerificationUpload({ onClose, onSuccess }: VerificationUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>('gst_certificate')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // In a real implementation, you would upload to a storage service (e.g., Supabase Storage, AWS S3)
      // For this demo, we'll simulate an upload with a data URL
      
      const reader = new FileReader()
      reader.onloadend = async () => {
        const fileUrl = reader.result as string
        
        const response = await fetch('/api/verification-documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_type: documentType,
            file_name: selectedFile.name,
            file_url: fileUrl, // In production, this would be the URL from your storage service
            file_size: selectedFile.size,
            mime_type: selectedFile.type,
          }),
        })

        if (response.ok) {
          onSuccess()
        } else {
          alert('Failed to upload document')
        }
      }
      
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upload Verification Documents</CardTitle>
              <CardDescription>
                Upload documents to verify your business account
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="close-upload-modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              data-testid="document-type-select"
            >
              <option value="gst_certificate">GST Certificate</option>
              <option value="business_license">Business License</option>
              <option value="incorporation_certificate">Incorporation Certificate</option>
              <option value="pan_card">PAN Card</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Select File</label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id="file-upload"
                data-testid="file-input"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {selectedFile ? (
                  <div className="flex items-center space-x-2">
                    <File className="w-8 h-8 text-orange-500" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to select file
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, JPG, PNG (Max 5MB)
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex space-x-3">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              data-testid="upload-document-button"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p className="font-medium mb-1">Required Documents:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>GST Certificate or Business License</li>
              <li>Company Incorporation Certificate (for companies)</li>
              <li>PAN Card of the business</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
