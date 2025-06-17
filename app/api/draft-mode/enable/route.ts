import { apiVersion, dataset, projectId } from 'lib/sanity.api'
import { createClient } from 'next-sanity'
import { defineEnableDraftMode } from 'next-sanity/draft-mode'

const token = process.env.SANITY_API_READ_TOKEN

// Create a fallback GET handler for when token is not available
const fallbackGET = () => {
  return new Response(
    JSON.stringify({
      error: 'SANITY_API_READ_TOKEN environment variable is not configured'
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

// Export GET handler based on token availability
export const GET = token ? (() => {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  })

  return defineEnableDraftMode({ client }).GET
})() : fallbackGET
