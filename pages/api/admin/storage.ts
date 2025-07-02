// Storage Management API for Admin

import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth, validateMethod, ApiResponse } from '../../../lib/auth/middleware'
import { 
  cleanupOrphanedImages, 
  getStorageStats, 
  deleteFile,
  ensureBucketExists 
} from '../../../lib/supabase/storage'

interface StorageStatsResponse {
  folders: Record<string, { count: number; size: number }>
  total: {
    count: number
    size: number
    sizeFormatted: string
  }
}

interface CleanupResponse {
  orphanedCount?: number
  deletedCount?: number
  orphanedFiles?: string[]
  deletedFiles?: string[]
  totalSize: number
}

export default withAdminAuth(async (req, res) => {
  const { action } = req.query

  switch (req.method) {
    case 'GET':
      if (action === 'stats') {
        return handleGetStats(req, res)
      }
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Invalid action specified'
        }
      })

    case 'POST':
      if (action === 'cleanup') {
        return handleCleanup(req, res)
      } else if (action === 'ensure-bucket') {
        return handleEnsureBucket(req, res)
      }
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Invalid action specified'
        }
      })

    case 'DELETE':
      if (action === 'file') {
        return handleDeleteFile(req, res)
      }
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Invalid action specified'
        }
      })

    default:
      return res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Method not allowed'
        }
      })
  }
})

// GET /api/admin/storage?action=stats - Get storage usage statistics
async function handleGetStats(
  req: any, 
  res: NextApiResponse<ApiResponse<StorageStatsResponse>>
) {
  try {
    const stats = await getStorageStats()
    
    return res.status(200).json({
      success: true,
      data: stats,
      message: 'Storage statistics retrieved successfully'
    })
  } catch (error) {
    console.error('Storage stats error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'STATS_FAILED',
        message: 'Failed to retrieve storage statistics',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    })
  }
}

// POST /api/admin/storage?action=cleanup - Clean up orphaned images
async function handleCleanup(
  req: any, 
  res: NextApiResponse<ApiResponse<CleanupResponse>>
) {
  try {
    const { dryRun = true } = req.body
    
    const result = await cleanupOrphanedImages(dryRun)
    
    return res.status(200).json({
      success: true,
      data: result,
      message: dryRun 
        ? `Found ${result.orphanedCount || result.deletedCount || 0} orphaned images`
        : `Cleaned up ${result.deletedCount || 0} orphaned images`
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'CLEANUP_FAILED',
        message: 'Failed to cleanup orphaned images',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    })
  }
}

// POST /api/admin/storage?action=ensure-bucket - Ensure storage bucket exists
async function handleEnsureBucket(
  req: any, 
  res: NextApiResponse<ApiResponse<any>>
) {
  try {
    const { bucketName = 'assets', options = {} } = req.body
    
    const bucket = await ensureBucketExists(bucketName, options)
    
    return res.status(200).json({
      success: true,
      data: bucket,
      message: `Bucket '${bucketName}' is ready`
    })
  } catch (error) {
    console.error('Ensure bucket error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'BUCKET_SETUP_FAILED',
        message: 'Failed to setup storage bucket',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    })
  }
}

// DELETE /api/admin/storage?action=file - Delete a specific file
async function handleDeleteFile(
  req: any, 
  res: NextApiResponse<ApiResponse<boolean>>
) {
  try {
    const { bucket = 'assets', path } = req.body
    
    if (!path) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'File path is required'
        }
      })
    }
    
    await deleteFile(bucket, path)
    
    return res.status(200).json({
      success: true,
      data: true,
      message: `File '${path}' deleted successfully`
    })
  } catch (error) {
    console.error('Delete file error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete file',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    })
  }
}
