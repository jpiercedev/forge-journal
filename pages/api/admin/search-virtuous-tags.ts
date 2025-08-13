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
    // Check if API key is configured
    if (!process.env.VIRTUOUS_API_KEY) {
      return res.status(500).json({
        error: 'VIRTUOUS_API_KEY environment variable is not set'
      })
    }

    const { search } = req.query

    // Get all tags from Virtuous
    const virtuousResponse = await fetch('https://api.virtuoussoftware.com/api/Tag', {
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

    // Filter tags if search term provided
    let filteredTags = tags
    if (search && typeof search === 'string') {
      filteredTags = tags.filter(tag => 
        tag.tagName.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Look for specific tags we're interested in
    const orangeTag = tags.find(tag => tag.tagName.toLowerCase() === 'orange')
    const texasTag = tags.find(tag => tag.tagName.toLowerCase() === 'texas')

    return res.status(200).json({
      success: true,
      totalTags: tags.length,
      filteredTags: filteredTags.length,
      searchTerm: search || null,
      tags: filteredTags.map(tag => ({
        id: tag.id,
        name: tag.tagName,
        group: tag.tagGroupName
      })),
      targetTags: {
        orange: orangeTag ? { id: orangeTag.id, name: orangeTag.tagName, group: orangeTag.tagGroupName } : null,
        texas: texasTag ? { id: texasTag.id, name: texasTag.tagName, group: texasTag.tagGroupName } : null
      },
      rawResponse: {
        hasListProperty: !!response.list,
        responseKeys: Object.keys(response),
        firstFewTags: tags.slice(0, 3)
      }
    })

  } catch (error) {
    console.error('Error searching Virtuous tags:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
