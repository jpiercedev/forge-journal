// Content Management API - Contributors CRUD

import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb, db, generateSlug, type Author } from '../../../lib/supabase/client'
import { withAdminAuth, AuthenticatedRequest, validateMethod, ErrorResponses } from '../../../lib/auth/middleware'

// Helper function to trigger page revalidation
async function triggerRevalidation(res: NextApiResponse) {
  try {
    await res.revalidate('/contributors')
    console.log('Successfully triggered revalidation for /contributors')
  } catch (error) {
    console.warn('Error triggering revalidation:', error)
    // Don't fail the main operation if revalidation fails
  }
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: string
  }
  message?: string
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetContributors(req, res)
      case 'POST':
        return await handleCreateContributor(req, res)
      case 'PUT':
        return await handleUpdateContributor(req, res)
      case 'DELETE':
        return await handleDeleteContributor(req, res)
      default:
        return res.status(405).json({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Method not allowed',
          },
        })
    }
  } catch (error) {
    console.error('Contributors API error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    })
  }
}

export default withAdminAuth(handler)

// GET /api/content/contributors - List contributors or get single contributor
async function handleGetContributors(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse>) {
  const { id, slug } = req.query

  // Get single contributor by ID or slug
  if (id || slug) {
    try {
      let result
      if (slug) {
        result = await db.getAuthorBySlug(slug as string)
      } else {
        // For ID, we'll need to add this method to the db helper
        result = await db.getAuthors()
        const author = result.data?.find(a => a.id === id)
        result = { data: author, error: author ? null : new Error('Contributor not found') }
      }

      if (result.error || !result.data) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CONTRIBUTOR_NOT_FOUND',
            message: 'Contributor not found',
          },
        })
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: 'Contributor retrieved successfully',
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch contributor',
        },
      })
    }
  }

  // List all contributors
  try {
    const result = await db.getAuthors()

    if (result.error) {
      throw result.error
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: 'Contributors retrieved successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch contributors',
      },
    })
  }
}

// POST /api/content/contributors - Create new contributor
async function handleCreateContributor(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse>) {
  const authorData = req.body

  // Validate required fields
  if (!authorData.name) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Contributor name is required',
      },
    })
  }

  try {
    // Generate slug if not provided
    if (!authorData.slug) {
      authorData.slug = generateSlug(authorData.name)
    }

    const result = await adminDb.createAuthor(authorData)

    if (result.error) {
      throw result.error
    }

    // Trigger revalidation of contributors page
    await triggerRevalidation(res)

    return res.status(201).json({
      success: true,
      data: result.data,
      message: 'Contributor created successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: 'Failed to create contributor',
        details: error.message,
      },
    })
  }
}

// PUT /api/content/contributors - Update existing contributor
async function handleUpdateContributor(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query
  const updateData = req.body

  if (!id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Contributor ID is required',
      },
    })
  }

  try {
    // Update slug if name changed
    if (updateData.name && !updateData.slug) {
      updateData.slug = generateSlug(updateData.name)
    }

    const result = await adminDb.updateAuthor(id as string, updateData)

    if (result.error) {
      throw result.error
    }

    // Trigger revalidation of contributors page
    await triggerRevalidation(res)

    return res.status(200).json({
      success: true,
      data: result.data,
      message: 'Contributor updated successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update contributor',
        details: error.message,
      },
    })
  }
}

// DELETE /api/content/contributors - Delete contributor
async function handleDeleteContributor(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Contributor ID is required',
      },
    })
  }

  try {
    // Note: This will set author_id to NULL in posts due to ON DELETE SET NULL
    const result = await adminDb.deleteAuthor(id as string)

    if (result.error) {
      throw result.error
    }

    // Trigger revalidation of contributors page
    await triggerRevalidation(res)

    return res.status(200).json({
      success: true,
      message: 'Contributor deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete contributor',
        details: error.message,
      },
    })
  }
}
