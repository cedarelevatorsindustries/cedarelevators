'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface UploadedFile {
    name: string
    url: string
    size: number
    publicId?: string
}

interface FileUploadProps {
    maxFiles?: number
    maxSizeBytes?: number
    acceptedTypes?: string[]
    onFilesChange: (files: UploadedFile[]) => void
    value?: UploadedFile[]
}

export function FileUpload({
    maxFiles = 2,
    maxSizeBytes = 10 * 1024 * 1024, // 10MB default
    acceptedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    onFilesChange,
    value = []
}: FileUploadProps) {
    const [files, setFiles] = useState<UploadedFile[]>(value)
    const [isDragging, setIsDragging] = useState(false)
    const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
    const fileInputRef = useRef<HTMLInputElement>(null)

    const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'quote_attachments'
    const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''

    const uploadToCloudinary = async (file: File): Promise<UploadedFile | null> => {
        if (!cloudinaryCloudName) {
            toast.error('Cloudinary not configured - missing cloud name')
            console.error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable')
            return null
        }

        console.log('Uploading to Cloudinary:', {
            cloudName: cloudinaryCloudName,
            preset: cloudinaryUploadPreset,
            fileName: file.name,
            fileType: file.type
        })

        // Determine resource type based on file type
        const isPdf = file.type === 'application/pdf'
        const resourceType = isPdf ? 'raw' : 'image'

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', cloudinaryUploadPreset)

        try {
            const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/${resourceType}/upload`
            console.log('Upload URL:', uploadUrl)

            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData
            })

            const data = await response.json()
            console.log('Cloudinary response:', data)

            if (!response.ok) {
                console.error('Cloudinary upload error:', data)
                throw new Error(data.error?.message || `Upload failed (${response.status})`)
            }

            return {
                name: file.name,
                url: data.secure_url,
                size: file.size,
                publicId: data.public_id
            }
        } catch (error: any) {
            console.error('Cloudinary upload error:', error)
            toast.error(error.message || `Failed to upload ${file.name}`)
            return null
        }
    }

    const validateFile = (file: File): string | null => {
        // Check file size
        if (file.size > maxSizeBytes) {
            return `File size exceeds ${Math.round(maxSizeBytes / 1024 / 1024)}MB limit`
        }

        // Check file type
        if (!acceptedTypes.includes(file.type)) {
            return 'File type not supported (only PDF, JPG, PNG allowed)'
        }

        return null
    }

    const handleFiles = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return

        const newFilesArray = Array.from(fileList)

        // Check total files limit
        if (files.length + newFilesArray.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} files allowed`)
            return
        }

        // Validate and upload each file
        for (const file of newFilesArray) {
            const error = validateFile(file)
            if (error) {
                toast.error(`${file.name}: ${error}`)
                continue
            }

            // Mark as uploading
            setUploadingFiles(prev => new Set(prev).add(file.name))

            // Upload to Cloudinary
            const uploadedFile = await uploadToCloudinary(file)

            // Remove from uploading set
            setUploadingFiles(prev => {
                const next = new Set(prev)
                next.delete(file.name)
                return next
            })

            if (uploadedFile) {
                const updatedFiles = [...files, uploadedFile]
                setFiles(updatedFiles)
                onFilesChange(updatedFiles)
                toast.success(`${file.name} uploaded successfully`)
            }
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const droppedFiles = e.dataTransfer.files
        handleFiles(droppedFiles)
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files)
    }

    const removeFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index)
        setFiles(updatedFiles)
        onFilesChange(updatedFiles)
        toast.success('File removed')
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const canAddMore = files.length < maxFiles

    return (
        <div className="space-y-4">
            {/* Upload Zone */}
            {canAddMore && (
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                        ${isDragging
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 bg-gray-50 hover:border-orange-500'
                        }
                    `}
                >
                    <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-orange-500' : 'text-gray-400'}`} />
                    <p className="text-sm font-medium text-gray-700">
                        {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, PNG up to {Math.round(maxSizeBytes / 1024 / 1024)}MB • Max {maxFiles} files
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={acceptedTypes.join(',')}
                        onChange={handleFileInputChange}
                        className="hidden"
                    />
                </div>
            )}

            {/* Uploading Files */}
            {Array.from(uploadingFiles).map((fileName) => (
                <div key={fileName} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                        <p className="text-xs text-gray-500">Uploading...</p>
                    </div>
                </div>
            ))}

            {/* Uploaded Files List */}
            {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg group hover:border-gray-300 transition-colors">
                    <div className="flex-shrink-0">
                        {file.name.toLowerCase().endsWith('.pdf') ? (
                            <FileText className="w-5 h-5 text-red-500" />
                        ) : (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ))}

            {/* Files limit info */}
            {files.length > 0 && (
                <p className="text-xs text-gray-500 text-center">
                    {files.length} of {maxFiles} files uploaded
                </p>
            )}
        </div>
    )
}
