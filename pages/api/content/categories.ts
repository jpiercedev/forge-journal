// Content Management API - Categories CRUD

import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb, db, generateSlug, type Category } from '../../../lib/supabase/client'

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Validate authentication
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Valid authorization token required',
      },
    })
  }

  const token = authHeader.substring(7)
  if (token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Invalid authorization token',
      },
    })
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetCategories(req, res)
      case 'POST':
        return await handleCreateCategory(req, res)
      case 'PUT':
        return await handleUpdateCategory(req, res)
      case 'DELETE':
        return await handleDeleteCategory(req, res)
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
    console.error('Categories API error:', error)
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

// GET /api/content/categories - List categories or get single category
async function handleGetCategories(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id, slug } = req.query

  // Get single category by ID or slug
  if (id || slug) {
    try {
      let result
      if (slug) {
        result = await db.getCategoryBySlug(slug as string)
      } else {
        // For ID, we'll need to add this method to the db helper
        result = await db.getCategories()
        const category = result.data?.find(c => c.id === id)
        result = { data: category, error: category ? null : new Error('Category not found') }
      }

      if (result.error || !result.data) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found',
          },
        })
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: 'Category retrieved successfully',
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch category',
        },
      })
    }
  }

  // List all categories
  try {
    const result = await db.getCategories()

    if (result.error) {
      throw result.error
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: 'Categories retrieved successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch categories',
      },
    })
  }
}

// POST /api/content/categories - Create new category
async function handleCreateCategory(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const categoryData = req.body

  // Validate required fields
  if (!categoryData.title) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Category title is required',
      },
    })
  }

  try {
    // Generate slug if not provided
    if (!categoryData.slug) {
      categoryData.slug = generateSlug(categoryData.title)
    }

    const result = await adminDb.createCategory(categoryData)

    if (result.error) {
      throw result.error
    }

    return res.status(201).json({
      success: true,
      data: result.data,
      message: 'Category created successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: 'Failed to create category',
        details: error.message,
      },
    })
  }
}

// PUT /api/content/categories - Update existing category
async function handleUpdateCategory(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query
  const updateData = req.body

  if (!id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Category ID is required',
      },
    })
  }

  try {
    // Update slug if title changed
    if (updateData.title && !updateData.slug) {
      updateData.slug = generateSlug(updateData.title)
    }

    const result = await adminDb.updateCategory(id as string, updateData)

    if (result.error) {
      throw result.error
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: 'Category updated successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update category',
        details: error.message,
      },
    })
  }
}

// DELETE /api/content/categories - Delete category
async function handleDeleteCategory(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Category ID is required',
      },
    })
  }

  try {
    // Note: This will remove category associations from posts due to CASCADE
    const result = await adminDb.deleteCategory(id as string)

    if (result.error) {
      throw result.error
    }

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete category',
        details: error.message,
      },
    })
  }
}
