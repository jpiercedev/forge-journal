import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs'

export default async function pdfDownload(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pdfPath = path.join(process.cwd(), 'public', 'holy-spirit.pdf')

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'PDF not found' })
    }

    const pdfBuffer = fs.readFileSync(pdfPath)

    // Use RFC 5987 encoding for filename with special characters
    const filename = 'The Forge Journal - Who Is The Holy Spirit.pdf'
    const encodedFilename = encodeURIComponent(filename)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`)
    res.setHeader('Content-Length', pdfBuffer.length)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

    res.status(200).send(pdfBuffer)
  } catch (error) {
    console.error('PDF download error:', error)
    res.status(500).json({ error: 'Failed to download PDF' })
  }
}

