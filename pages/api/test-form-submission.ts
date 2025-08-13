import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { marketingSource = 'test-source' } = req.body

    console.log(`Testing form submission with marketing source: ${marketingSource}`)

    // Simulate the contact submission
    const formData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test+${marketingSource}+${Date.now()}@jpierce.dev`,
      phone: '555-1234',
      smsOptIn: false,
      marketingSource: marketingSource
    }

    console.log('Submitting form data:', formData)

    // Call the actual contact submission API
    const response = await fetch(`${req.headers.origin}/api/contact/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })

    const result = await response.json()

    return res.status(200).json({
      success: true,
      message: 'Test form submission completed',
      formData: formData,
      submissionResult: result
    })

  } catch (error) {
    console.error('Test form submission error:', error)
    return res.status(500).json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
