// File Upload API for Admin

import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth, ApiResponse } from '../../../lib/auth/middleware'
import { uploadFile, getPublicUrl } from '../../../lib/supabase/storage'
import formidable from 'formidable'
import fs from 'fs'

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

interface UploadResponse {
  url: string
  path: string
  size: number
  type: string
}

export default withAdminAuth(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed'
      }
    })
  }

  return handleUpload(req, res)
})

async function handleUpload(
  req: any,
  res: NextApiResponse<ApiResponse<UploadResponse>>
) {
  try {
    // Parse the form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowEmptyFiles: false,
      filter: ({ mimetype }) => {
        // Only allow image files
        return mimetype?.startsWith('image/') || false
      }
    })

    const [fields, files] = await form.parse(req)
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file
    const folder = Array.isArray(fields.folder) ? fields.folder[0] : fields.folder || 'uploads'

    if (!file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      })
    }

    // Validate file type
    if (!file.mimetype?.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'Only image files are allowed'
        }
      })
    }

    // Generate unique filename
    const fileExt = file.originalFilename?.split('.').pop()?.toLowerCase() || 'jpg'
    const sanitizedName = file.originalFilename
      ?.replace(/\.[^/.]+$/, '') // Remove extension
      ?.replace(/[^a-z0-9]/gi, '-') // Replace non-alphanumeric with dash
      ?.toLowerCase()
      ?.substring(0, 20) || 'upload' // Limit length
    
    const fileName = `${sanitizedName}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath)

    // Upload to Supabase storage
    await uploadFile('assets', filePath, fileBuffer, {
      contentType: file.mimetype,
      cacheControl: '3600'
    })

    // Get public URL
    const publicUrl = getPublicUrl('assets', filePath)

    // Clean up temporary file
    fs.unlinkSync(file.filepath)

    return res.status(200).json({
      success: true,
      data: {
        url: publicUrl,
        path: filePath,
        size: file.size,
        type: file.mimetype
      },
      message: 'File uploaded successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('File too large')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File is too large. Maximum size is 5MB.'
          }
        })
      }
      
      if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Invalid file type. Please upload an image file.'
          }
        })
      }
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: 'Failed to upload file',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    })
  }
}
