import { NextApiRequest, NextApiResponse } from 'next'

interface CreateTagRequest {
  tagName: string
  tagGroupName?: string
  description?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check if API key is configured
    if (!process.env.VIRTUOUS_API_KEY) {
      return res.status(500).json({
        error: 'VIRTUOUS_API_KEY environment variable is not set'
      })
    }

    const { tagName, tagGroupName = 'Marketing Sources', description }: CreateTagRequest = req.body

    if (!tagName) {
      return res.status(400).json({
        error: 'tagName is required'
      })
    }

    // Create tag in Virtuous
    const createTagPayload = {
      tagName: tagName,
      tagGroupName: tagGroupName,
      description: description || `Marketing source tag: ${tagName}`
    }

    const virtuousResponse = await fetch('https://api.virtuoussoftware.com/api/Tag', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VIRTUOUS_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(createTagPayload)
    })

    const responseText = await virtuousResponse.text()

    if (!virtuousResponse.ok) {
      console.error('Failed to create tag in Virtuous:', {
        status: virtuousResponse.status,
        statusText: virtuousResponse.statusText,
        body: responseText
      })
      
      return res.status(500).json({
        error: 'Failed to create tag in Virtuous',
        status: virtuousResponse.status,
        statusText: virtuousResponse.statusText,
        details: responseText
      })
    }

    let createdTag
    try {
      createdTag = JSON.parse(responseText)
    } catch (e) {
      // Sometimes Virtuous returns plain text or different format
      createdTag = { response: responseText }
    }

    return res.status(200).json({
      success: true,
      message: `Tag "${tagName}" created successfully`,
      data: createdTag
    })

  } catch (error) {
    console.error('Error creating Virtuous tag:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
