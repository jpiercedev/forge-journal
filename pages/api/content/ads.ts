// Content Management API - Ads CRUD

import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb, db, generateSlug, type Ad } from '../../../lib/supabase/client'
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
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  console.log(`Ads API called: ${req.method} /api/content/ads`)

  try {
    switch (req.method) {
      case 'GET':
        // GET requests are public - no authentication required
        return await handleGetAds(req, res)
      case 'POST':
      case 'PUT':
      case 'DELETE':
        // These methods require admin authentication
        return withAdminAuth(async (authReq: AuthenticatedRequest, authRes: NextApiResponse<ApiResponse>) => {

          switch (req.method) {
            case 'POST':
              return await handleCreateAd(authReq, authRes)
            case 'PUT':
              return await handleUpdateAd(authReq, authRes)
            case 'DELETE':
              return await handleDeleteAd(authReq, authRes)
          }
        })(req, res)
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

// GET /api/content/ads - List all ads or get single ad by ID
async function handleGetAds(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  const { id, type, active } = req.query



  try {
    if (id) {
      // Get single ad by ID
      console.log('Fetching single ad with ID:', id)
      const { data: ad, error } = await db.getAdById(id as string)

      if (error) {
        console.error('Error fetching single ad:', error)
        return res.status(404).json({
          success: false,
          error: {
            code: 'AD_NOT_FOUND',
            message: 'Ad not found',
            details: error.message,
          },
        })
      }

      console.log('Successfully fetched single ad:', ad)
      return res.status(200).json({
        success: true,
        data: ad,
      })
    } else {
      // Get all ads with optional filtering
      const activeOnly = active === 'true'
      const adType = type as 'banner' | 'sidebar' | undefined


      const { data: ads, error } = await db.getAds(adType, activeOnly)

      if (error) {

        return res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch ads',
            details: error.message,
          },
        })
      }


      return res.status(200).json({
        success: true,
        data: ads || [],
      })
    }
  } catch (error) {

    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch ads',
        details: error.message,
      },
    })
  }
}

// POST /api/content/ads - Create new ad
async function handleCreateAd(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse>) {
  const { title, type, headline, subheading, image_url, image_alt, cta_text, cta_link, is_active, display_order } = req.body

  // Validate required fields
  if (!title || !type || !headline || !cta_text || !cta_link) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields: title, type, headline, cta_text, cta_link',
      },
    })
  }

  // Validate ad type
  if (!['banner', 'sidebar'].includes(type)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid ad type. Must be "banner" or "sidebar"',
      },
    })
  }

  try {
    const adData = {
      title,
      type,
      headline,
      subheading: subheading || null,
      image_url: image_url || null,
      image_alt: image_alt || null,
      cta_text,
      cta_link,
      is_active: is_active !== undefined ? is_active : true,
      display_order: display_order || 0,
    }

    const { data: ad, error } = await adminDb.createAd(adData)

    if (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to create ad',
          details: error.message,
        },
      })
    }

    return res.status(201).json({
      success: true,
      data: ad,
      message: 'Ad created successfully',
    })
  } catch (error) {
    console.error('Error creating ad:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create ad',
        details: error.message,
      },
    })
  }
}

// PUT /api/content/ads - Update ad
async function handleUpdateAd(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query
  const { title, type, headline, subheading, image_url, image_alt, cta_text, cta_link, is_active, display_order } = req.body

  if (!id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Ad ID is required',
      },
    })
  }

  // Validate ad type if provided
  if (type && !['banner', 'sidebar'].includes(type)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid ad type. Must be "banner" or "sidebar"',
      },
    })
  }

  try {
    const updateData: Partial<Ad> = {}
    
    if (title !== undefined) updateData.title = title
    if (type !== undefined) updateData.type = type
    if (headline !== undefined) updateData.headline = headline
    if (subheading !== undefined) updateData.subheading = subheading
    if (image_url !== undefined) updateData.image_url = image_url
    if (image_alt !== undefined) updateData.image_alt = image_alt
    if (cta_text !== undefined) updateData.cta_text = cta_text
    if (cta_link !== undefined) updateData.cta_link = cta_link
    if (is_active !== undefined) updateData.is_active = is_active
    if (display_order !== undefined) updateData.display_order = display_order

    const { data: ad, error } = await adminDb.updateAd(id as string, updateData)

    if (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to update ad',
          details: error.message,
        },
      })
    }

    return res.status(200).json({
      success: true,
      data: ad,
      message: 'Ad updated successfully',
    })
  } catch (error) {
    console.error('Error updating ad:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update ad',
        details: error.message,
      },
    })
  }
}

// DELETE /api/content/ads - Delete ad
async function handleDeleteAd(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Ad ID is required',
      },
    })
  }

  try {
    const { error } = await adminDb.deleteAd(id as string)

    if (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to delete ad',
          details: error.message,
        },
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Ad deleted successfully',
    })
  } catch (error) {

    return res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete ad',
        details: error.message,
      },
    })
  }
}

export default handler
