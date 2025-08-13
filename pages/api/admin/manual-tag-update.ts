import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { tagName, virtuousTagId } = req.body

    if (!tagName || !virtuousTagId) {
      return res.status(400).json({
        error: 'tagName and virtuousTagId are required'
      })
    }

    // Update or insert the tag mapping
    const { data, error } = await supabaseAdmin
      .from('virtuous_tags')
      .upsert({
        tag_name: tagName.toLowerCase(),
        virtuous_tag_id: virtuousTagId.toString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({
        error: 'Failed to update tag mapping',
        details: error.message
      })
    }

    return res.status(200).json({
      success: true,
      message: `Successfully updated tag mapping for "${tagName}"`,
      data: data
    })

  } catch (error) {
    console.error('Manual tag update error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
