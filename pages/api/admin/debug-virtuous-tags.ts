import { NextApiRequest, NextApiResponse } from 'next'

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
    
    // Show the complete raw response for debugging
    console.log('Full Virtuous API Response:', JSON.stringify(response, null, 2))

    const tags = response.list || response
    
    // Search for any tag containing "orange" or "texas" (case insensitive)
    const possibleMatches = tags.filter(tag => {
      const tagName = tag.tagName.toLowerCase()
      return tagName.includes('orange') || 
             tagName.includes('texas') || 
             tagName.includes('orang') || 
             tagName.includes('texa')
    })

    // Also search for recently created tags (if there's a date field)
    const allTagNames = tags.map(tag => tag.tagName)

    return res.status(200).json({
      success: true,
      debug: {
        totalFromAPI: response.total || tags.length,
        actualTagCount: tags.length,
        responseStructure: {
          hasListProperty: !!response.list,
          hasTotal: !!response.total,
          responseKeys: Object.keys(response),
          totalValue: response.total
        }
      },
      allTagNames: allTagNames,
      possibleMatches: possibleMatches,
      searchResults: {
        exactOrange: tags.find(tag => tag.tagName.toLowerCase() === 'orange'),
        exactTexas: tags.find(tag => tag.tagName.toLowerCase() === 'texas'),
        capitalOrange: tags.find(tag => tag.tagName === 'Orange'),
        capitalTexas: tags.find(tag => tag.tagName === 'Texas'),
        anyOrange: tags.filter(tag => tag.tagName.toLowerCase().includes('orange')),
        anyTexas: tags.filter(tag => tag.tagName.toLowerCase().includes('texas'))
      },
      rawResponse: response
    })

  } catch (error) {
    console.error('Error debugging Virtuous tags:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
