import { NextApiRequest, NextApiResponse } from 'next'
import { applyVirtuousTags } from './admin/virtuous-tags'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { contactId, tags } = req.body

    if (!contactId || !tags || !Array.isArray(tags)) {
      return res.status(400).json({
        error: 'contactId and tags array are required'
      })
    }

    console.log(`Testing dynamic tagging for contact ${contactId} with tags:`, tags)

    // Test the dynamic tagging system
    await applyVirtuousTags(contactId, tags)

    return res.status(200).json({
      success: true,
      message: `Successfully processed tags for contact ${contactId}`,
      tags: tags
    })

  } catch (error) {
    console.error('Dynamic tagging test error:', error)
    return res.status(500).json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
