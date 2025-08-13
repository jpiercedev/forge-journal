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

    // Try different pagination approaches to get all tags
    const allTags = []
    let page = 1
    let hasMore = true

    while (hasMore && page <= 10) { // Safety limit
      // Try with different pagination parameters
      const urls = [
        `https://api.virtuoussoftware.com/api/Tag?take=100&skip=${(page - 1) * 100}`,
        `https://api.virtuoussoftware.com/api/Tag?page=${page}&pageSize=100`,
        `https://api.virtuoussoftware.com/api/Tag?limit=100&offset=${(page - 1) * 100}`,
        `https://api.virtuoussoftware.com/api/Tag?take=100`
      ]

      for (const url of urls) {
        try {
          console.log(`Trying URL: ${url}`)
          
          const virtuousResponse = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.VIRTUOUS_API_KEY}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          })

          if (virtuousResponse.ok) {
            const response = await virtuousResponse.json()
            const tags = response.list || response
            
            console.log(`URL ${url} returned ${tags.length} tags`)
            
            if (tags.length > allTags.length) {
              allTags.length = 0 // Clear array
              allTags.push(...tags)
            }
            
            // If we got more than 10 tags, we found the right approach
            if (tags.length > 10) {
              hasMore = false
              break
            }
          }
        } catch (e) {
          console.log(`URL ${url} failed:`, e.message)
        }
      }
      
      page++
      if (allTags.length <= 10) {
        hasMore = false // If we're still getting 10 or fewer, stop trying
      }
    }

    // Search for our target tags
    const orangeTag = allTags.find(tag => 
      tag.tagName && tag.tagName.toLowerCase().includes('orange')
    )
    const texasTag = allTags.find(tag => 
      tag.tagName && tag.tagName.toLowerCase().includes('texas')
    )

    return res.status(200).json({
      success: true,
      totalFound: allTags.length,
      allTagNames: allTags.map(tag => tag.tagName).sort(),
      targetTags: {
        orange: orangeTag ? { 
          id: orangeTag.id, 
          name: orangeTag.tagName, 
          group: orangeTag.tagGroupName 
        } : null,
        texas: texasTag ? { 
          id: texasTag.id, 
          name: texasTag.tagName, 
          group: texasTag.tagGroupName 
        } : null
      }
    })

  } catch (error) {
    console.error('Error fetching all Virtuous tags:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
