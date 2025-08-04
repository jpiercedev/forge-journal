#!/usr/bin/env node

/**
 * Optimize Images in Supabase Storage
 * 
 * This script downloads images from Supabase storage, optimizes them,
 * and uploads the optimized versions back to storage.
 * 
 * Usage:
 *   node scripts/optimize-supabase-images.js [folder]
 * 
 * Examples:
 *   node scripts/optimize-supabase-images.js posts
 *   node scripts/optimize-supabase-images.js contributors
 *   node scripts/optimize-supabase-images.js  # All folders
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const sharp = require('sharp')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Optimization presets
const PRESETS = {
  posts: {
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'webp'
  },
  contributors: {
    quality: 85,
    maxWidth: 400,
    maxHeight: 400,
    format: 'webp'
  },
  ads: {
    quality: 80,
    maxWidth: 800,
    maxHeight: 600,
    format: 'webp'
  },
  default: {
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'webp'
  }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Optimize image buffer using Sharp
 */
async function optimizeImageBuffer(buffer, preset) {
  const { quality, maxWidth, maxHeight, format } = preset
  
  let sharpInstance = sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })

  if (format === 'webp') {
    sharpInstance = sharpInstance.webp({ 
      quality,
      effort: 6
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

  return await sharpInstance.toBuffer()
}

/**
 * Check if file should be optimized
 */
function shouldOptimize(fileName, fileSize) {
  // Skip if already optimized (contains 'optimized' in name)
  if (fileName.includes('optimized')) {
    return false
  }
  
  // Skip if already WebP and small
  if (fileName.endsWith('.webp') && fileSize < 50 * 1024) { // Less than 50KB
    return false
  }
  
  // Skip very small files
  if (fileSize < 10 * 1024) { // Less than 10KB
    return false
  }
  
  return true
}

/**
 * Process images in a folder
 */
async function processFolder(folderName) {
  console.log(`📁 Processing folder: ${folderName}`)
  
  try {
    // List all files in the folder
    const { data: files, error: listError } = await supabase.storage
      .from('assets')
      .list(folderName, { limit: 100 })

    if (listError) {
      console.error(`❌ Error listing files in ${folderName}:`, listError.message)
      return
    }

    if (!files || files.length === 0) {
      console.log(`📂 No files found in ${folderName}`)
      return
    }

    console.log(`📸 Found ${files.length} files in ${folderName}`)
    
    let processedCount = 0
    let totalOriginalSize = 0
    let totalOptimizedSize = 0
    
    const preset = PRESETS[folderName] || PRESETS.default

    for (const file of files) {
      const fileName = file.name
      const fileSize = file.metadata?.size || 0
      
      // Skip non-image files
      if (!fileName.match(/\.(jpg|jpeg|png|webp)$/i)) {
        continue
      }
      
      // Check if should optimize
      if (!shouldOptimize(fileName, fileSize)) {
        console.log(`⏭️  Skipping ${fileName} (already optimized or too small)`)
        continue
      }

      console.log(`🔄 Processing ${fileName} (${formatFileSize(fileSize)})...`)
      
      try {
        // Download the file
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('assets')
          .download(`${folderName}/${fileName}`)

        if (downloadError) {
          console.error(`❌ Error downloading ${fileName}:`, downloadError.message)
          continue
        }

        // Convert to buffer
        const originalBuffer = Buffer.from(await fileData.arrayBuffer())
        const originalSize = originalBuffer.length
        
        // Optimize the image
        const optimizedBuffer = await optimizeImageBuffer(originalBuffer, preset)
        const optimizedSize = optimizedBuffer.length
        
        // Only upload if there's significant reduction
        const reduction = ((originalSize - optimizedSize) / originalSize) * 100
        if (reduction < 10) {
          console.log(`⏭️  Skipping ${fileName} (only ${reduction.toFixed(1)}% reduction)`)
          continue
        }

        // Generate optimized filename
        const nameParts = fileName.split('.')
        nameParts.pop() // Remove original extension
        const optimizedFileName = `${nameParts.join('.')}-optimized.${preset.format}`
        const optimizedPath = `${folderName}/${optimizedFileName}`

        // Upload optimized version
        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(optimizedPath, optimizedBuffer, {
            contentType: `image/${preset.format}`,
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error(`❌ Error uploading optimized ${fileName}:`, uploadError.message)
          continue
        }

        totalOriginalSize += originalSize
        totalOptimizedSize += optimizedSize
        processedCount++

        console.log(`   ✅ ${formatFileSize(originalSize)} → ${formatFileSize(optimizedSize)} (${reduction.toFixed(1)}% reduction)`)
        console.log(`   📤 Uploaded as: ${optimizedFileName}`)

      } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error.message)
      }
    }

    if (processedCount > 0) {
      const totalReduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1)
      console.log(`\n📊 Summary for ${folderName}:`)
      console.log(`   Processed: ${processedCount} images`)
      console.log(`   Original total: ${formatFileSize(totalOriginalSize)}`)
      console.log(`   Optimized total: ${formatFileSize(totalOptimizedSize)}`)
      console.log(`   Total reduction: ${totalReduction}%`)
    } else {
      console.log(`\n📊 No images were optimized in ${folderName}`)
    }

  } catch (error) {
    console.error(`❌ Error processing folder ${folderName}:`, error.message)
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🖼️  Supabase Image Optimizer')
  console.log('============================\n')

  const args = process.argv.slice(2)
  const targetFolder = args[0]

  if (targetFolder) {
    // Process specific folder
    await processFolder(targetFolder)
  } else {
    // Process all known folders
    const folders = ['posts', 'contributors', 'ads', 'uploads']
    
    for (const folder of folders) {
      await processFolder(folder)
      console.log('') // Add spacing between folders
    }
  }

  console.log('✨ Supabase image optimization complete!')
  console.log('\n💡 Tips:')
  console.log('   - Update your app to use the optimized versions')
  console.log('   - Consider removing original large files after testing')
  console.log('   - Run this script periodically for new uploads')
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
  processFolder,
  optimizeImageBuffer,
  formatFileSize
}
