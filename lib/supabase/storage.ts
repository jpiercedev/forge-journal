// Supabase Storage Utilities for Forge Journal

import { supabaseAdmin } from './client'

export interface StorageFile {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: {
    eTag: string
    size: number
    mimetype: string
    cacheControl: string
    lastModified: string
    contentLength: number
    httpStatusCode: number
  }
}

/**
 * Upload a file to Supabase storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  options: {
    contentType?: string
    cacheControl?: string
    upsert?: boolean
  } = {}
) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options.contentType,
      cacheControl: options.cacheControl || '3600',
      upsert: options.upsert || false
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  return data
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * Delete a file from storage
 */
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }

  return true
}

/**
 * Delete multiple files from storage
 */
export async function deleteFiles(bucket: string, paths: string[]) {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove(paths)

  if (error) {
    throw new Error(`Failed to delete files: ${error.message}`)
  }

  return true
}

/**
 * List files in a storage folder
 */
export async function listFiles(
  bucket: string,
  folder?: string,
  options: {
    limit?: number
    offset?: number
    sortBy?: { column: string; order: 'asc' | 'desc' }
  } = {}
) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .list(folder, {
      limit: options.limit || 100,
      offset: options.offset || 0,
      sortBy: options.sortBy || { column: 'name', order: 'asc' }
    })

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data as StorageFile[]
}

/**
 * Extract file path from Supabase storage URL
 */
export function extractFilePathFromUrl(url: string, bucket: string = 'assets'): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const bucketIndex = pathParts.indexOf(bucket)
    
    if (bucketIndex === -1) {
      return null
    }
    
    // Return the path after the bucket name
    return pathParts.slice(bucketIndex + 1).join('/')
  } catch {
    return null
  }
}

/**
 * Clean up orphaned images that are no longer referenced in posts
 */
export async function cleanupOrphanedImages(dryRun: boolean = true) {
  try {
    // Get all images in the posts folder
    const postsImages = await listFiles('assets', 'posts')
    
    // Get all posts with cover images
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('cover_image_url')
      .not('cover_image_url', 'is', null)

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`)
    }

    // Extract file paths from post cover image URLs
    const referencedPaths = new Set(
      posts
        .map(post => extractFilePathFromUrl(post.cover_image_url, 'assets'))
        .filter(Boolean) as string[]
    )

    // Find orphaned images
    const orphanedImages = postsImages.filter(file => {
      const filePath = `posts/${file.name}`
      return !referencedPaths.has(filePath)
    })

    if (dryRun) {
      console.log(`Found ${orphanedImages.length} orphaned images:`)
      orphanedImages.forEach(file => {
        console.log(`- posts/${file.name} (${(file.metadata.size / 1024).toFixed(1)} KB)`)
      })
      return {
        orphanedCount: orphanedImages.length,
        orphanedFiles: orphanedImages.map(f => `posts/${f.name}`),
        totalSize: orphanedImages.reduce((sum, f) => sum + f.metadata.size, 0)
      }
    }

    // Delete orphaned images
    if (orphanedImages.length > 0) {
      const pathsToDelete = orphanedImages.map(file => `posts/${file.name}`)
      await deleteFiles('assets', pathsToDelete)
      console.log(`Deleted ${orphanedImages.length} orphaned images`)
    }

    return {
      deletedCount: orphanedImages.length,
      deletedFiles: orphanedImages.map(f => `posts/${f.name}`),
      totalSize: orphanedImages.reduce((sum, f) => sum + f.metadata.size, 0)
    }
  } catch (error) {
    console.error('Error cleaning up orphaned images:', error)
    throw error
  }
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(bucket: string = 'assets') {
  try {
    const folders = ['posts', 'contributors', 'ads']
    const stats: Record<string, { count: number; size: number }> = {}

    for (const folder of folders) {
      const files = await listFiles(bucket, folder)
      stats[folder] = {
        count: files.length,
        size: files.reduce((sum, file) => sum + file.metadata.size, 0)
      }
    }

    // Get total stats
    const totalCount = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0)
    const totalSize = Object.values(stats).reduce((sum, stat) => sum + stat.size, 0)

    return {
      folders: stats,
      total: {
        count: totalCount,
        size: totalSize,
        sizeFormatted: formatBytes(totalSize)
      }
    }
  } catch (error) {
    console.error('Error getting storage stats:', error)
    throw error
  }
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Ensure storage bucket exists with proper configuration
 */
export async function ensureBucketExists(
  bucketName: string = 'assets',
  options: {
    public?: boolean
    allowedMimeTypes?: string[]
    fileSizeLimit?: number
  } = {}
) {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`)
    }

    const existingBucket = buckets.find(bucket => bucket.name === bucketName)
    
    if (existingBucket) {
      console.log(`✅ Bucket '${bucketName}' already exists`)
      return existingBucket
    }

    // Create bucket
    const { data: bucket, error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: options.public ?? true,
      allowedMimeTypes: options.allowedMimeTypes ?? [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
      ],
      fileSizeLimit: options.fileSizeLimit ?? 52428800 // 50MB
    })

    if (createError) {
      throw new Error(`Failed to create bucket: ${createError.message}`)
    }

    console.log(`✅ Created bucket '${bucketName}' successfully`)
    return bucket
  } catch (error) {
    console.error(`Error ensuring bucket exists:`, error)
    throw error
  }
}
