import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase/client'

/**
 * Test tag lookup without actually applying tags to contacts
 */
async function testTagLookup(tagName: string): Promise<{found: boolean, tagId?: number, cached?: boolean}> {
  try {
    // First check our local cache
    const { data: cachedTag, error: cacheError } = await supabaseAdmin
      .from('virtuous_tags')
      .select('virtuous_tag_id')
      .eq('tag_name', tagName.toLowerCase())
      .single()

    if (!cacheError && cachedTag) {
      return {
        found: true,
        tagId: parseInt(cachedTag.virtuous_tag_id),
        cached: true
      }
    }

    // Not in cache, look up in Virtuous
    const virtuousResponse = await fetch('https://api.virtuoussoftware.com/api/Tag?take=100', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.VIRTUOUS_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!virtuousResponse.ok) {
      console.error('Failed to fetch tags from Virtuous:', virtuousResponse.status)
      return { found: false }
    }

    const response = await virtuousResponse.json()
    const tags = response.list || response
    const foundTag = tags.find(tag => 
      tag.tagName.toLowerCase() === tagName.toLowerCase()
    )

    if (foundTag) {
      // Cache the tag for future use
      await supabaseAdmin
        .from('virtuous_tags')
        .upsert({
          tag_name: tagName.toLowerCase(),
          virtuous_tag_id: foundTag.id.toString(),
          updated_at: new Date().toISOString()
        })

      return {
        found: true,
        tagId: foundTag.id,
        cached: false
      }
    }

    return { found: false }

  } catch (error) {
    console.error('Error looking up tag:', error)
    return { found: false }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { tags } = req.body

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({
        error: 'tags array is required'
      })
    }

    console.log('Testing tag lookup for tags:', tags)

    const results = []
    for (const tagName of tags) {
      const result = await testTagLookup(tagName)
      results.push({
        tagName,
        ...result
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Tag lookup test completed',
      results: results
    })

  } catch (error) {
    console.error('Tag lookup test error:', error)
    return res.status(500).json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
