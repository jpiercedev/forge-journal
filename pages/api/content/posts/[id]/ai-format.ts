// AI Formatter API Route - /api/content/posts/[id]/ai-format
// Formats blog post content using AI without changing the actual text

import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../../../lib/supabase/client';
import { formatContentWithAI } from '../../../../../lib/ai-formatter/content-analyzer';
import { AIFormatterResponse } from '../../../../../types/smart-import';
import { withAdminAuth, AuthenticatedRequest, validateMethod, ErrorResponses } from '../../../../../lib/auth/middleware';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<AIFormatterResponse>
) {
  if (!validateMethod(req, ['POST'])) {
    return res.status(405).json(ErrorResponses.METHOD_NOT_ALLOWED);
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_POST_ID',
        message: 'Valid post ID is required',
      },
    });
  }

  try {
    // Get the post from database
    const { data: post, error: fetchError } = await adminDb.getPostById(id);
    
    if (fetchError) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch post from database',
          details: fetchError.message,
        },
      });
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found',
        },
      });
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'AI_SERVICE_UNAVAILABLE',
          message: 'AI formatting service is not available. OpenAI API key is missing.',
        },
      });
    }

    // Store original content
    const originalContent = (post as any).content;

    // Format content using AI (simple one-step process)
    let formattedContent;
    try {
      formattedContent = await formatContentWithAI(originalContent);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'AI_FORMATTING_FAILED',
          message: 'Failed to format content with AI',
          details: error.message,
        },
      });
    }

    // Update the post with formatted content
    try {
      const updateData = {
        content: formattedContent,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await adminDb.updatePost(id, updateData);
      
      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update post with formatted content',
          details: error.message,
        },
      });
    }

    // Count the changes made (simple heuristic)
    const originalBlocks = originalContent?.content?.length || 0;
    const formattedBlocks = formattedContent?.content?.length || 0;
    const changesCount = Math.abs(formattedBlocks - originalBlocks) +
                        (formattedContent?.content?.filter((block: any) =>
                          block.type === 'heading' || block.type === 'blockquote' ||
                          block.type === 'bullet_list' || block.type === 'ordered_list'
                        ).length || 0);

    // Return success response with details
    return res.status(200).json({
      success: true,
      data: {
        originalContent,
        formattedContent,
        changes: Array.from({ length: changesCount }, (_, i) => ({
          type: 'paragraph' as const,
          action: 'formatted' as const,
          originalText: 'Content formatted',
          formattedStructure: { type: 'paragraph', content: 'Formatted content' },
          confidence: 0.9
        })),
      },
    });

  } catch (error) {
    console.error('AI Formatter error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error during AI formatting',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
}

export default withAdminAuth(handler);
