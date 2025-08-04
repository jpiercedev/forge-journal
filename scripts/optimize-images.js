#!/usr/bin/env node

/**
 * Image Optimization Script for Forge Journal
 *
 * This script optimizes images to reduce file sizes while maintaining quality.
 * It processes images in the public/images directory and can also be used
 * to optimize images before uploading to Supabase storage.
 *
 * Features:
 * - Converts images to WebP format for better compression
 * - Maintains high quality while reducing file size
 * - Processes multiple image formats (JPG, PNG, WebP)
 * - Creates optimized versions alongside originals
 * - Provides detailed size reduction statistics
 * - Uses Sharp for fast, high-quality image processing
 */

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

// Configuration
const CONFIG = {
  // Quality settings (0-100, higher = better quality)
  webpQuality: 85,
  jpegQuality: 85,
  
  // Maximum dimensions (will maintain aspect ratio)
  maxWidth: 1920,
  maxHeight: 1080,
  
  // For contributor photos, use smaller dimensions
  contributorMaxWidth: 400,
  contributorMaxHeight: 400,
  
  // Supported input formats
  supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  
  // Output format preference
  outputFormat: 'webp'
}

/**
 * Check if Sharp is available
 */
function checkSharp() {
  try {
    require('sharp')
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get file size in a human-readable format
 */
function getFileSize(input) {
  let bytes

  if (typeof input === 'string') {
    // It's a file path
    const stats = fs.statSync(input)
    bytes = stats.size
  } else if (typeof input === 'object' && input.size !== undefined) {
    // It's an object with size property
    bytes = input.size
  } else {
    // It's a number
    bytes = input
  }

  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Optimize a single image file using Sharp
 */
async function optimizeImage(inputPath, outputPath, options = {}) {
  const {
    quality = CONFIG.webpQuality,
    maxWidth = CONFIG.maxWidth,
    maxHeight = CONFIG.maxHeight,
    format = CONFIG.outputFormat
  } = options

  try {
    let sharpInstance = sharp(inputPath)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })

    // Apply format-specific optimizations
    if (format === 'webp') {
      sharpInstance = sharpInstance.webp({
        quality,
        effort: 6 // Higher effort for better compression
      })
    } else if (format === 'jpeg' || format === 'jpg') {
      sharpInstance = sharpInstance.jpeg({
        quality,
        progressive: true,
        mozjpeg: true
      })
    } else if (format === 'png') {
      sharpInstance = sharpInstance.png({
        quality,
        compressionLevel: 9,
        progressive: true
      })
    }

    await sharpInstance.toFile(outputPath)
    return true
  } catch (error) {
    console.error(`❌ Failed to optimize ${inputPath}:`, error.message)
    return false
  }
}

/**
 * Process images in a directory
 */
async function processDirectory(dirPath, options = {}) {
  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Directory not found: ${dirPath}`)
    return
  }
  
  const files = fs.readdirSync(dirPath)
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase()
    return CONFIG.supportedFormats.includes(ext)
  })
  
  if (imageFiles.length === 0) {
    console.log(`📁 No images found in ${dirPath}`)
    return
  }
  
  console.log(`📸 Processing ${imageFiles.length} images in ${dirPath}`)
  
  let totalOriginalSize = 0
  let totalOptimizedSize = 0
  let processedCount = 0
  
  for (const filename of imageFiles) {
    const inputPath = path.join(dirPath, filename)
    const nameWithoutExt = path.parse(filename).name
    const outputFilename = `${nameWithoutExt}-optimized.${CONFIG.outputFormat}`
    const outputPath = path.join(dirPath, outputFilename)
    
    // Skip if optimized version already exists and is newer
    if (fs.existsSync(outputPath)) {
      const inputStats = fs.statSync(inputPath)
      const outputStats = fs.statSync(outputPath)
      
      if (outputStats.mtime > inputStats.mtime) {
        console.log(`⏭️  Skipping ${filename} (already optimized)`)
        continue
      }
    }
    
    const originalSize = fs.statSync(inputPath).size
    totalOriginalSize += originalSize
    
    console.log(`🔄 Optimizing ${filename}...`)

    const success = await optimizeImage(inputPath, outputPath, options)
    
    if (success && fs.existsSync(outputPath)) {
      const optimizedSize = fs.statSync(outputPath).size
      totalOptimizedSize += optimizedSize
      processedCount++
      
      const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1)
      console.log(`   ✅ ${getFileSize(inputPath)} → ${getFileSize(outputPath)} (${reduction}% reduction)`)
    }
  }
  
  if (processedCount > 0) {
    const totalReduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1)
    console.log(`\n📊 Summary for ${dirPath}:`)
    console.log(`   Processed: ${processedCount} images`)
    console.log(`   Original total: ${getFileSize({ size: totalOriginalSize })}`)
    console.log(`   Optimized total: ${getFileSize({ size: totalOptimizedSize })}`)
    console.log(`   Total reduction: ${totalReduction}%`)
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🖼️  Forge Journal Image Optimizer')
  console.log('==================================\n')

  // Check for Sharp
  if (!checkSharp()) {
    console.error('❌ Sharp library not found. Please install it:')
    console.error('  npm install sharp --save-dev')
    process.exit(1)
  }
  
  // Get command line arguments
  const args = process.argv.slice(2)
  const targetDir = args[0] || 'public/images'
  
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Target directory not found: ${targetDir}`)
    process.exit(1)
  }
  
  // Process different directories with appropriate settings
  if (targetDir.includes('contributors')) {
    console.log('👥 Processing contributor photos with smaller dimensions...')
    await processDirectory(targetDir, {
      maxWidth: CONFIG.contributorMaxWidth,
      maxHeight: CONFIG.contributorMaxHeight,
      quality: CONFIG.webpQuality
    })
  } else if (fs.lstatSync(targetDir).isDirectory()) {
    // Process all subdirectories
    const subdirs = fs.readdirSync(targetDir).filter(item => {
      const itemPath = path.join(targetDir, item)
      return fs.lstatSync(itemPath).isDirectory()
    })
    
    if (subdirs.length > 0) {
      for (const subdir of subdirs) {
        const subdirPath = path.join(targetDir, subdir)

        if (subdir === 'contributors') {
          console.log('👥 Processing contributor photos...')
          await processDirectory(subdirPath, {
            maxWidth: CONFIG.contributorMaxWidth,
            maxHeight: CONFIG.contributorMaxHeight,
            quality: CONFIG.webpQuality
          })
        } else {
          console.log(`📁 Processing ${subdir}...`)
          await processDirectory(subdirPath)
        }
      }
    } else {
      // Process the directory itself
      await processDirectory(targetDir)
    }
  }
  
  console.log('\n✨ Image optimization complete!')
  console.log('\n💡 Tips:')
  console.log('   - Use the optimized versions in your app for better performance')
  console.log('   - Consider updating image references to use .webp extensions')
  console.log('   - Run this script whenever you add new images')
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error('❌ Unexpected error:', error.message)
  process.exit(1)
})

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  optimizeImage,
  processDirectory,
  CONFIG
}
