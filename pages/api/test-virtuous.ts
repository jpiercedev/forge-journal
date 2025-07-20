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
        error: 'VIRTUOUS_API_KEY environment variable is not set',
        configured: false
      })
    }

    // Test getting all tags to see the format
    const testResponse = await fetch('https://api.virtuoussoftware.com/api/Tag', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.VIRTUOUS_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    const responseText = await testResponse.text()

    return res.status(200).json({
      configured: true,
      apiKeyPresent: !!process.env.VIRTUOUS_API_KEY,
      apiKeyLength: process.env.VIRTUOUS_API_KEY?.length || 0,
      testApiCall: {
        status: testResponse.status,
        statusText: testResponse.statusText,
        headers: Object.fromEntries(testResponse.headers.entries()),
        body: responseText.substring(0, 500) // First 500 chars to avoid huge responses
      }
    })

  } catch (error) {
    console.error('Virtuous test error:', error)
    return res.status(500).json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      configured: !!process.env.VIRTUOUS_API_KEY
    })
  }
}
