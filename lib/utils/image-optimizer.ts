/**
 * Image Optimization Utilities for Forge Journal
 * 
 * This module provides utilities for optimizing images before upload
 * and processing images that are already in Supabase storage.
 */

import sharp from 'sharp'

export interface OptimizationOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  format?: 'webp' | 'jpeg' | 'png'
  progressive?: boolean
}

export interface OptimizationResult {
  buffer: Buffer
  originalSize: number
  optimizedSize: number
  reduction: number
  format: string
  width: number
  height: number
}

/**
 * Default optimization settings for different image types
 */
export const OPTIMIZATION_PRESETS = {
  // For blog post cover images
  coverImage: {
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'webp' as const,
    progressive: true
  },
  
  // For contributor/author photos
  avatar: {
    quality: 85,
    maxWidth: 400,
    maxHeight: 400,
    format: 'webp' as const,
    progressive: true
  },
  
  // For advertisement images
  advertisement: {
    quality: 80,
    maxWidth: 800,
    maxHeight: 600,
    format: 'webp' as const,
    progressive: true
  },
  
  // For thumbnails
  thumbnail: {
    quality: 75,
    maxWidth: 300,
    maxHeight: 300,
    format: 'webp' as const,
    progressive: true
  }
}

/**
 * Optimize an image buffer
 */
export async function optimizeImageBuffer(
  inputBuffer: Buffer,
  options: OptimizationOptions = {}
): Promise<OptimizationResult> {
  const {
    quality = 85,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'webp',
    progressive = true
  } = options

  const originalSize = inputBuffer.length
  
  // Get original image metadata
  const metadata = await sharp(inputBuffer).metadata()
  
  let sharpInstance = sharp(inputBuffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })

  // Apply format-specific optimizations
  if (format === 'webp') {
    sharpInstance = sharpInstance.webp({ 
      quality,
      effort: 6, // Higher effort for better compression
      progressive
    })
  } else if (format === 'jpeg') {
    sharpInstance = sharpInstance.jpeg({ 
      quality,
      progressive,
      mozjpeg: true
    })
  } else if (format === 'png') {
    sharpInstance = sharpInstance.png({ 
      quality,
      compressionLevel: 9,
      progressive
    })
  }

  const optimizedBuffer = await sharpInstance.toBuffer()
  const optimizedSize = optimizedBuffer.length
  const reduction = ((originalSize - optimizedSize) / originalSize) * 100

  // Get final image metadata
  const finalMetadata = await sharp(optimizedBuffer).metadata()

  return {
    buffer: optimizedBuffer,
    originalSize,
    optimizedSize,
    reduction,
    format,
    width: finalMetadata.width || 0,
    height: finalMetadata.height || 0
  }
}

/**
 * Optimize an image file
 */
export async function optimizeImageFile(
  inputPath: string,
  outputPath?: string,
  options: OptimizationOptions = {}
): Promise<OptimizationResult> {
  const fs = await import('fs')
  const path = await import('path')
  
  const inputBuffer = fs.readFileSync(inputPath)
  const result = await optimizeImageBuffer(inputBuffer, options)
  
  if (outputPath) {
    fs.writeFileSync(outputPath, result.buffer)
  } else {
    // Generate output path with optimized suffix
    const parsedPath = path.parse(inputPath)
    const newPath = path.join(
      parsedPath.dir,
      `${parsedPath.name}-optimized.${result.format}`
    )
    fs.writeFileSync(newPath, result.buffer)
  }
  
  return result
}

/**
 * Get the appropriate optimization preset based on image purpose
 */
export function getOptimizationPreset(purpose: keyof typeof OPTIMIZATION_PRESETS): OptimizationOptions {
  return OPTIMIZATION_PRESETS[purpose]
}

/**
 * Determine the best optimization preset based on image dimensions and file path
 */
export function suggestOptimizationPreset(
  width: number,
  height: number,
  filePath?: string
): keyof typeof OPTIMIZATION_PRESETS {
  if (filePath) {
    if (filePath.includes('contributor') || filePath.includes('author')) {
      return 'avatar'
    }
    if (filePath.includes('ad') || filePath.includes('banner')) {
      return 'advertisement'
    }
    if (filePath.includes('thumb')) {
      return 'thumbnail'
    }
  }
  
  // Based on dimensions
  const maxDimension = Math.max(width, height)
  
  if (maxDimension <= 300) {
    return 'thumbnail'
  } else if (maxDimension <= 600) {
    return 'avatar'
  } else if (maxDimension <= 800) {
    return 'advertisement'
  } else {
    return 'coverImage'
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Validate image file type
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ]
  
  return validTypes.includes(mimeType.toLowerCase())
}

/**
 * Get recommended file extension for optimized format
 */
export function getOptimizedExtension(originalMimeType: string): string {
  // Always recommend WebP for best compression
  return 'webp'
}

/**
 * Calculate compression statistics
 */
export function calculateCompressionStats(originalSize: number, optimizedSize: number) {
  const reduction = ((originalSize - optimizedSize) / originalSize) * 100
  const compressionRatio = originalSize / optimizedSize
  
  return {
    reduction: Math.round(reduction * 10) / 10, // Round to 1 decimal
    compressionRatio: Math.round(compressionRatio * 10) / 10,
    savedBytes: originalSize - optimizedSize,
    savedBytesFormatted: formatFileSize(originalSize - optimizedSize)
  }
}
