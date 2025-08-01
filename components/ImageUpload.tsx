import React, { useState, useRef } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onError?: (error: string) => void
  label?: string
  placeholder?: string
  folder?: string // Folder within the assets bucket (e.g., 'posts', 'authors')
  className?: string
  accept?: string
  maxSize?: number // in bytes
  showPreview?: boolean
}

export default function ImageUpload({
  value,
  onChange,
  onError,
  label = 'Image',
  placeholder = 'Upload an image',
  folder = 'uploads',
  className = '',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  showPreview = true
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file')
      return false
    }

    // Check file size
    if (file.size > maxSize) {
      onError?.(`File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB`)
      return false
    }

    return true
  }

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return

    setIsUploading(true)
    onError?.('') // Clear any previous errors

    try {
      // Create form data for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      // Upload via API endpoint
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error?.message || 'Upload failed')
      }

      onChange(result.data.url)
    } catch (error) {
      console.error('Upload error:', error)
      onError?.(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    uploadFile(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 font-sans mb-2">
          {label}
        </label>
      )}

      {value && showPreview ? (
        <div className="mb-4">
          <div className="relative inline-block">
            <Image
              src={value}
              alt="Preview"
              width={200}
              height={150}
              className="rounded-lg border border-gray-300 object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              ×
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-forge-teal bg-forge-teal/5' 
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept={accept}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <div className="space-y-2">
            {isUploading ? (
              <>
                <div className="mx-auto h-12 w-12 text-forge-teal animate-spin">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-gray-600">
                  <span className="font-medium text-forge-teal hover:text-forge-teal/80 cursor-pointer">
                    Click to upload
                  </span>
                  {' '}or drag and drop
                </div>
                <p className="text-sm text-gray-500">
                  {placeholder} (max {(maxSize / 1024 / 1024).toFixed(1)}MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
