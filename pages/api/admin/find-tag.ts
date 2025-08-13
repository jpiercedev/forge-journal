import { NextApiRequest, NextApiResponse } from 'next'

interface VirtuousTag {
  id: number
  tagName: string
  tagGroupName: string
  contactsByTagUrl: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { tagName } = req.query

    if (!tagName || typeof tagName !== 'string') {
      return res.status(400).json({
        error: 'tagName query parameter is required'
      })
    }

    // Check if API key is configured
    if (!process.env.VIRTUOUS_API_KEY) {
      return res.status(500).json({
        error: 'VIRTUOUS_API_KEY environment variable is not set'
      })
    }

    // Get all tags from Virtuous with pagination
    const virtuousResponse = await fetch('https://api.virtuoussoftware.com/api/Tag?take=100', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.VIRTUOUS_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!virtuousResponse.ok) {
      return res.status(500).json({
        error: 'Failed to fetch tags from Virtuous',
        status: virtuousResponse.status,
        statusText: virtuousResponse.statusText
      })
    }

    const response = await virtuousResponse.json()
    const tags: VirtuousTag[] = response.list || response

    // Find the specific tag (case insensitive)
    const foundTag = tags.find(tag => 
      tag.tagName.toLowerCase() === tagName.toLowerCase()
    )

    if (foundTag) {
      return res.status(200).json({
        success: true,
        found: true,
        tag: {
          id: foundTag.id,
          name: foundTag.tagName,
          group: foundTag.tagGroupName
        },
        totalTagsSearched: tags.length
      })
    } else {
      return res.status(200).json({
        success: true,
        found: false,
        searchedFor: tagName,
        totalTagsSearched: tags.length,
        allTagNames: tags.map(t => t.tagName).sort()
      })
    }

  } catch (error) {
    console.error('Error finding tag:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
