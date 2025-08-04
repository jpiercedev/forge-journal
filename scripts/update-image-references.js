#!/usr/bin/env node

/**
 * Update Image References Script
 * 
 * This script helps update image references in the codebase to use
 * optimized versions instead of original files.
 * 
 * Usage:
 *   node scripts/update-image-references.js [--dry-run] [--folder=path]
 * 
 * Examples:
 *   node scripts/update-image-references.js --dry-run
 *   node scripts/update-image-references.js --folder=components
 *   node scripts/update-image-references.js
 */

const fs = require('fs')
const path = require('path')

// Configuration
const CONFIG = {
  // File extensions to search in
  searchExtensions: ['.tsx', '.ts', '.jsx', '.js', '.md', '.mdx'],
  
  // Directories to search (relative to project root)
  searchDirectories: ['components', 'pages', 'lib', 'docs'],
  
  // Image extensions to look for
  imageExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  
  // Patterns to match image references
  patterns: [
    // Static imports: import image from '/images/...'
    /(['"`])\/images\/([^'"`\s]+\.(jpg|jpeg|png|webp))(['"`])/gi,
    
    // Image src attributes: src="/images/..."
    /src=(['"`])\/images\/([^'"`\s]+\.(jpg|jpeg|png|webp))(['"`])/gi,
    
    // CSS background images: url('/images/...')
    /url\((['"`]?)\/images\/([^'"`\s)]+\.(jpg|jpeg|png|webp))(['"`]?)\)/gi,
    
    // Markdown images: ![alt](/images/...)
    /!\[[^\]]*\]\(\/images\/([^)]+\.(jpg|jpeg|png|webp))\)/gi,
    
    // Next.js Image component src
    /src=['"`]\/images\/([^'"`\s]+\.(jpg|jpeg|png|webp))['"`]/gi
  ]
}

/**
 * Check if optimized version exists
 */
function hasOptimizedVersion(imagePath) {
  const fullPath = path.join(process.cwd(), 'public', imagePath)
  const parsedPath = path.parse(fullPath)
  const optimizedPath = path.join(parsedPath.dir, `${parsedPath.name}-optimized.webp`)
  
  return fs.existsSync(optimizedPath)
}

/**
 * Get optimized image path
 */
function getOptimizedPath(imagePath) {
  const parsedPath = path.parse(imagePath)
  return path.join(parsedPath.dir, `${parsedPath.name}-optimized.webp`).replace(/\\/g, '/')
}

/**
 * Process a single file
 */
function processFile(filePath, dryRun = false) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let updatedContent = content
    let changesMade = false
    const changes = []

    // Apply each pattern
    CONFIG.patterns.forEach((pattern, patternIndex) => {
      updatedContent = updatedContent.replace(pattern, (match, ...groups) => {
        // Extract the image path from the match
        let imagePath
        let prefix = ''
        let suffix = ''
        
        if (patternIndex === 0) {
          // Static imports: import image from '/images/...'
          prefix = groups[0]
          imagePath = groups[1]
          suffix = groups[3]
        } else if (patternIndex === 1) {
          // Image src attributes
          prefix = `src=${groups[0]}`
          imagePath = groups[1]
          suffix = groups[3]
        } else if (patternIndex === 2) {
          // CSS background images
          prefix = `url(${groups[0]}`
          imagePath = groups[1]
          suffix = `${groups[3]})`
        } else if (patternIndex === 3) {
          // Markdown images
          const altMatch = match.match(/!\[([^\]]*)\]/)
          const alt = altMatch ? altMatch[1] : ''
          imagePath = groups[0]
          prefix = `![${alt}](`
          suffix = ')'
        } else if (patternIndex === 4) {
          // Next.js Image component
          imagePath = groups[0]
          prefix = 'src="'
          suffix = '"'
        }

        // Check if optimized version exists
        if (hasOptimizedVersion(imagePath)) {
          const optimizedPath = getOptimizedPath(imagePath)
          changesMade = true
          changes.push({
            original: imagePath,
            optimized: optimizedPath,
            line: content.substring(0, content.indexOf(match)).split('\n').length
          })
          
          return `${prefix}/images/${optimizedPath}${suffix}`
        }
        
        return match
      })
    })

    if (changesMade) {
      console.log(`📝 ${path.relative(process.cwd(), filePath)}`)
      changes.forEach(change => {
        console.log(`   Line ${change.line}: ${change.original} → ${change.optimized}`)
      })
      
      if (!dryRun) {
        fs.writeFileSync(filePath, updatedContent, 'utf8')
        console.log(`   ✅ Updated ${changes.length} image reference(s)`)
      } else {
        console.log(`   🔍 Would update ${changes.length} image reference(s)`)
      }
      
      return changes.length
    }
    
    return 0
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message)
    return 0
  }
}

/**
 * Recursively find files to process
 */
function findFiles(directory, extensions) {
  const files = []
  
  function traverse(dir) {
    try {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          // Skip node_modules and other common directories
          if (!item.startsWith('.') && item !== 'node_modules' && item !== 'dist' && item !== 'build') {
            traverse(fullPath)
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase()
          if (extensions.includes(ext)) {
            files.push(fullPath)
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error reading directory ${dir}:`, error.message)
    }
  }
  
  traverse(directory)
  return files
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔄 Image Reference Updater')
  console.log('==========================\n')

  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const folderArg = args.find(arg => arg.startsWith('--folder='))
  const targetFolder = folderArg ? folderArg.split('=')[1] : null

  if (dryRun) {
    console.log('🔍 Running in DRY RUN mode - no files will be modified\n')
  }

  // Determine directories to search
  let searchDirs = CONFIG.searchDirectories
  if (targetFolder) {
    searchDirs = [targetFolder]
    console.log(`📁 Searching in folder: ${targetFolder}\n`)
  } else {
    console.log(`📁 Searching in folders: ${searchDirs.join(', ')}\n`)
  }

  let totalFiles = 0
  let totalChanges = 0

  // Process each directory
  for (const dir of searchDirs) {
    const fullDirPath = path.join(process.cwd(), dir)
    
    if (!fs.existsSync(fullDirPath)) {
      console.log(`⚠️  Directory not found: ${dir}`)
      continue
    }

    console.log(`📂 Processing directory: ${dir}`)
    
    const files = findFiles(fullDirPath, CONFIG.searchExtensions)
    console.log(`   Found ${files.length} files to check\n`)

    for (const file of files) {
      const changes = processFile(file, dryRun)
      if (changes > 0) {
        totalFiles++
        totalChanges += changes
      }
    }
    
    console.log('') // Add spacing between directories
  }

  // Summary
  console.log('📊 Summary:')
  console.log(`   Files processed: ${totalFiles}`)
  console.log(`   Total changes: ${totalChanges}`)
  
  if (dryRun && totalChanges > 0) {
    console.log('\n💡 Run without --dry-run to apply changes')
  } else if (totalChanges > 0) {
    console.log('\n✅ Image references updated successfully!')
  } else {
    console.log('\n📝 No image references needed updating')
  }

  console.log('\n💡 Tips:')
  console.log('   - Test your app after updating references')
  console.log('   - Ensure optimized images exist before updating references')
  console.log('   - Use --dry-run to preview changes first')
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
  processFile,
  findFiles,
  hasOptimizedVersion,
  getOptimizedPath
}
