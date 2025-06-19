// Content Management API - Authors CRUD

import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb, db, generateSlug, type Author } from '../../../lib/supabase/client'
import { withAdminAuth, AuthenticatedRequest, validateMethod, ErrorResponses } from '../../../lib/auth/middleware'

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
        return await handleGetAuthors(req, res)
      case 'POST':
        return await handleCreateAuthor(req, res)
      case 'PUT':
        return await handleUpdateAuthor(req, res)
      case 'DELETE':
        return await handleDeleteAuthor(req, res)
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
    console.error('Authors API error:', error)
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

// GET /api/content/authors - List authors or get single author
async function handleGetAuthors(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse>) {
  const { id, slug } = req.query

  // Get single author by ID or slug
  if (id || slug) {
    try {
      let result
      if (slug) {
        result = await db.getAuthorBySlug(slug as string)
      } else {
        // For ID, we'll need to add this method to the db helper
        result = await db.getAuthors()
        const author = result.data?.find(a => a.id === id)
        result = { data: author, error: author ? null : new Error('Author not found') }
      }

      if (result.error || !result.data) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'AUTHOR_NOT_FOUND',
            message: 'Author not found',
          },
        })
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: 'Author retrieved successfully',
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch author',
        },
      })
    }
  }

  // List all authors
  try {
    const result = await db.getAuthors()

    if (result.error) {
      throw result.error
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: 'Authors retrieved successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch authors',
      },
    })
  }
}

// POST /api/content/authors - Create new author
async function handleCreateAuthor(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse>) {
  const authorData = req.body

  // Validate required fields
  if (!authorData.name) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Author name is required',
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

    return res.status(201).json({
      success: true,
      data: result.data,
      message: 'Author created successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: 'Failed to create author',
        details: error.message,
      },
    })
  }
}

// PUT /api/content/authors - Update existing author
async function handleUpdateAuthor(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query
  const updateData = req.body

  if (!id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Author ID is required',
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

    return res.status(200).json({
      success: true,
      data: result.data,
      message: 'Author updated successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update author',
        details: error.message,
      },
    })
  }
}

// DELETE /api/content/authors - Delete author
async function handleDeleteAuthor(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Author ID is required',
      },
    })
  }

  try {
    // Note: This will set author_id to NULL in posts due to ON DELETE SET NULL
    const result = await adminDb.deleteAuthor(id as string)

    if (result.error) {
      throw result.error
    }

    return res.status(200).json({
      success: true,
      message: 'Author deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete author',
        details: error.message,
      },
    })
  }
}
