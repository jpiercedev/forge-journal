import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs'

export default async function ogHomepage(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check if we have a static homepage screenshot
    const screenshotPath = path.join(process.cwd(), 'public', 'og-homepage.png')
    
    if (fs.existsSync(screenshotPath)) {
      // Serve the static screenshot
      const screenshot = fs.readFileSync(screenshotPath)
      
      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Cache-Control', 'public, max-age=86400') // Cache for 24 hours
      res.status(200).send(screenshot)
      return
    }
    
    // Fallback to the generated OG image
    const fallbackUrl = `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : `http://localhost:${process.env.PORT || 3000}`}/api/og?title=Forge%20Journal`
    
    try {
      const fallbackResponse = await fetch(fallbackUrl)
      const fallbackImage = await fallbackResponse.arrayBuffer()
      
      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.status(200).send(Buffer.from(fallbackImage))
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError)
      res.status(500).json({ error: 'Homepage OG image generation failed' })
    }
  } catch (error) {
    console.error('Homepage OG error:', error)
    res.status(500).json({ error: 'Homepage OG image generation failed' })
  }
}
