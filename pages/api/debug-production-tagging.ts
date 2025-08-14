import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { contactId, email } = req.body

    if (!contactId && !email) {
      return res.status(400).json({
        error: 'Either contactId or email is required'
      })
    }

    console.log(`=== PRODUCTION TAGGING DEBUG ===`)
    console.log(`Contact ID: ${contactId}`)
    console.log(`Email: ${email}`)
    console.log(`Time: ${new Date().toISOString()}`)

    // Test 1: Check database connection
    console.log(`\n1. Testing database connection...`)
    try {
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      )
      
      const { data: dbTest, error: dbError } = await supabase
        .from('virtuous_tags')
        .select('*')
        .limit(1)
      
      if (dbError) {
        console.log(`❌ Database error:`, dbError)
        return res.status(500).json({ error: 'Database connection failed', details: dbError })
      } else {
        console.log(`✅ Database connection successful`)
      }
    } catch (dbErr) {
      console.log(`❌ Database connection failed:`, dbErr)
      return res.status(500).json({ error: 'Database connection failed', details: dbErr })
    }

    // Test 2: Check Virtuous API connection
    console.log(`\n2. Testing Virtuous API connection...`)
    try {
      const virtuousResponse = await fetch('https://api.virtuoussoftware.com/api/Tag?take=5', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.VIRTUOUS_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!virtuousResponse.ok) {
        console.log(`❌ Virtuous API error: ${virtuousResponse.status} ${virtuousResponse.statusText}`)
        return res.status(500).json({ 
          error: 'Virtuous API connection failed', 
          status: virtuousResponse.status,
          statusText: virtuousResponse.statusText
        })
      } else {
        const virtuousData = await virtuousResponse.json()
        console.log(`✅ Virtuous API connection successful, got ${virtuousData.list?.length || 0} tags`)
      }
    } catch (virtuousErr) {
      console.log(`❌ Virtuous API connection failed:`, virtuousErr)
      return res.status(500).json({ error: 'Virtuous API connection failed', details: virtuousErr })
    }

    // Test 3: Test tag lookup for our specific tags
    console.log(`\n3. Testing tag lookup...`)
    const testTags = ['The Forge Journal', 'FJ Welcome Series', 'paramtest']
    
    for (const tagName of testTags) {
      try {
        console.log(`  Testing lookup for: "${tagName}"`)
        
        // Import the tag lookup function
        const { lookupAndCacheTag } = require('./admin/virtuous-tags')
        const result = await lookupAndCacheTag(tagName)
        
        if (result.found) {
          console.log(`  ✅ "${tagName}" found with ID: ${result.tagId}`)
        } else {
          console.log(`  ❌ "${tagName}" not found`)
        }
      } catch (tagErr) {
        console.log(`  ❌ Error looking up "${tagName}":`, tagErr)
      }
    }

    // Test 4: If contactId provided, test actual tag application
    if (contactId) {
      console.log(`\n4. Testing tag application to contact ${contactId}...`)
      
      try {
        // Import the tag application function
        const { applyVirtuousTags } = require('./admin/virtuous-tags')
        await applyVirtuousTags(contactId, testTags)
        console.log(`✅ Tag application completed for contact ${contactId}`)
      } catch (applyErr) {
        console.log(`❌ Tag application failed:`, applyErr)
      }
    }

    console.log(`\n=== DEBUG COMPLETE ===`)

    return res.status(200).json({
      success: true,
      message: 'Production tagging debug completed',
      timestamp: new Date().toISOString(),
      contactId,
      email,
      note: 'Check server logs for detailed results'
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return res.status(500).json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
