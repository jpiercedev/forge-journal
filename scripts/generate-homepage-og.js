#!/usr/bin/env node

/**
 * Generate Homepage OG Image Script
 * 
 * This script takes a high-resolution screenshot of the homepage
 * and saves it as a static OG image for social media sharing.
 * 
 * Usage:
 *   node scripts/generate-homepage-og.js [url]
 * 
 * Example:
 *   node scripts/generate-homepage-og.js http://localhost:3002
 *   node scripts/generate-homepage-og.js https://forgejournal.com
 */

const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const width = 1200
const height = 630

async function generateHomepageOG(url = 'http://localhost:3002') {
  console.log('🚀 Starting homepage OG image generation...')
  console.log(`📸 Target URL: ${url}`)
  
  let browser
  
  try {
    // Launch browser
    console.log('🌐 Launching browser...')
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    })

    const page = await browser.newPage()
    
    // Set viewport to match OG image dimensions with high DPI
    await page.setViewport({
      width: 1200,
      height: 800, // Slightly taller to capture more content
      deviceScaleFactor: 2, // High DPI for crisp screenshot
    })

    console.log('📄 Navigating to homepage...')
    
    // Navigate to the page with simpler wait condition
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    // Wait for any dynamic content to load
    console.log('⏳ Waiting for content to load...')
    await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
    
    // Hide any elements that might interfere with the screenshot
    await page.evaluate(() => {
      // Hide any modal overlays, cookie banners, etc.
      const elementsToHide = [
        '[data-testid="cookie-banner"]',
        '.modal-overlay',
        '.notification-banner',
        '.dev-tools'
      ]
      
      elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector)
        elements.forEach(el => el.style.display = 'none')
      })
    })

    console.log('📸 Taking screenshot...')
    
    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      width: width,
      height: height,
      clip: {
        x: 0,
        y: 0,
        width: width,
        height: height,
      },
    })

    // Save to public folder
    const outputPath = path.join(process.cwd(), 'public', 'og-homepage.png')
    fs.writeFileSync(outputPath, screenshot)
    
    console.log('✅ Homepage OG image generated successfully!')
    console.log(`📁 Saved to: ${outputPath}`)
    console.log(`🔗 Will be available at: /api/og-homepage`)
    
  } catch (error) {
    console.error('❌ Error generating homepage OG image:', error)
    process.exit(1)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// Get URL from command line arguments or use default
const url = process.argv[2] || 'http://localhost:3002'

// Run the script
generateHomepageOG(url)
  .then(() => {
    console.log('🎉 Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
