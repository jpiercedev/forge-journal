import { NextApiRequest, NextApiResponse } from 'next'

interface RevalidateRequest extends NextApiRequest {
  body: {
    path?: string
    paths?: string[]
    secret?: string
  }
}

interface ApiResponse {
  success: boolean
  message?: string
  error?: {
    code: string
    message: string
  }
  revalidated?: string[]
}

export default async function handler(req: RevalidateRequest, res: NextApiResponse<ApiResponse>) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST requests are allowed'
      }
    })
  }

  try {
    const { path, paths, secret } = req.body

    // Optional: Add secret validation for security
    // You can set REVALIDATE_SECRET in your environment variables
    if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid secret'
        }
      })
    }

    // Determine which paths to revalidate
    let pathsToRevalidate: string[] = []
    
    if (path) {
      pathsToRevalidate = [path]
    } else if (paths && Array.isArray(paths)) {
      pathsToRevalidate = paths
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Either "path" or "paths" array must be provided'
        }
      })
    }

    // Validate paths
    const validPaths = pathsToRevalidate.filter(p => typeof p === 'string' && p.startsWith('/'))
    if (validPaths.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PATHS',
          message: 'All paths must be strings starting with "/"'
        }
      })
    }

    // Revalidate each path
    const revalidatedPaths: string[] = []
    const errors: string[] = []

    for (const pathToRevalidate of validPaths) {
      try {
        await res.revalidate(pathToRevalidate)
        revalidatedPaths.push(pathToRevalidate)
      } catch (error) {
        console.error(`Failed to revalidate ${pathToRevalidate}:`, error)
        errors.push(`Failed to revalidate ${pathToRevalidate}`)
      }
    }

    if (errors.length > 0 && revalidatedPaths.length === 0) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'REVALIDATION_FAILED',
          message: `Failed to revalidate paths: ${errors.join(', ')}`
        }
      })
    }

    return res.status(200).json({
      success: true,
      message: `Successfully revalidated ${revalidatedPaths.length} path(s)`,
      revalidated: revalidatedPaths
    })

  } catch (error) {
    console.error('Revalidation error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error during revalidation'
      }
    })
  }
}
