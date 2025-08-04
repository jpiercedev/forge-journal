// Supabase Data Formatting for Smart Import

import { adminDb, generateSlug, calculateReadingTime, type Post, type Author } from '../supabase/client'
import { ExtractedImage, ParsedContent } from '../../types/smart-import'

export interface SupabasePostData {
  title: string
  slug: string
  content: any // Rich content as JSON
  excerpt?: string
  cover_image_url?: string
  cover_image_alt?: string
  video_url?: string
  hide_featured_image?: boolean
  author_id?: string
  published_at?: string
  seo_title?: string
  seo_description?: string
  word_count: number
  reading_time: number
  status: 'draft' | 'published' | 'archived'
}

/**
 * Convert parsed content to Supabase post format
 */
export async function formatForSupabase(
  parsedContent: ParsedContent,
  options: {
    generateSlug?: boolean
    createAuthor?: boolean
    authorName?: string
    status?: 'draft' | 'published'
    video_url?: string
    hide_featured_image?: boolean
  } = {}
): Promise<SupabasePostData> {
  const { title, content, excerpt, author, publishedAt, images } = parsedContent

  // Generate slug from title
  const slug = options.generateSlug !== false ? generateSlug(title) : generateSlug(title)

  // Convert content to structured JSON format
  const structuredContent = await convertToStructuredContent(content, images)

  // Calculate content metrics
  const plainTextContent = extractPlainText(structuredContent)
  const wordCount = plainTextContent.split(/\s+/).length
  const readingTime = calculateReadingTime(plainTextContent)

  // Handle author
  let authorId: string | undefined
  if (options.createAuthor && (author || options.authorName)) {
    const authorName = author || options.authorName!
    authorId = await createOrGetAuthor(authorName)
  }

  // Handle cover image
  let coverImageUrl: string | undefined
  let coverImageAlt: string | undefined
  if (images && images.length > 0) {
    const firstImage = images[0]
    coverImageUrl = firstImage.url
    coverImageAlt = firstImage.alt || `Cover image for ${title}`
  }

  // Generate SEO fields
  const seoTitle = title.length > 60 ? title.substring(0, 57) + '...' : title
  const seoDescription = excerpt || plainTextContent.substring(0, 155) + '...'

  // Use provided date or current date for published posts
  const publishedDate = options.status === 'published' 
    ? (publishedAt || new Date().toISOString())
    : undefined

  const supabaseData: SupabasePostData = {
    title,
    slug,
    content: structuredContent,
    excerpt,
    cover_image_url: coverImageUrl,
    cover_image_alt: coverImageAlt,
    video_url: options.video_url || null,
    hide_featured_image: options.hide_featured_image || false,
    author_id: authorId,
    published_at: publishedDate,
    seo_title: seoTitle,
    seo_description: seoDescription,
    word_count: wordCount,
    reading_time: readingTime,
    status: options.status || 'draft'
  }

  return supabaseData
}

/**
 * Convert plain text content to structured JSON format
 */
async function convertToStructuredContent(content: string, images?: ExtractedImage[]): Promise<any> {
  const blocks: any[] = []
  
  // Split content into paragraphs
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim())

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim()
    if (!trimmed) continue

    // Check if this looks like a heading
    if (isHeading(trimmed)) {
      blocks.push(createHeadingBlock(trimmed))
    } else if (isList(trimmed)) {
      blocks.push(...createListBlocks(trimmed))
    } else {
      blocks.push(createParagraphBlock(trimmed))
    }
  }

  // Add images at the end if any
  if (images && images.length > 0) {
    for (const image of images.slice(1)) { // Skip first image (used as cover)
      blocks.push(createImageBlock(image))
    }
  }

  return {
    type: 'doc',
    content: blocks
  }
}

/**
 * Check if text looks like a heading
 */
function isHeading(text: string): boolean {
  // Check for markdown-style headings
  if (text.match(/^#{1,6}\s/)) return true
  
  // Check for short lines that might be headings
  if (text.length < 100 && !text.endsWith('.') && !text.endsWith('!') && !text.endsWith('?')) {
    return true
  }
  
  return false
}

/**
 * Check if text looks like a list
 */
function isList(text: string): boolean {
  return text.match(/^[\s]*[-*•]\s/) !== null || text.match(/^[\s]*\d+\.\s/) !== null
}

/**
 * Create heading block
 */
function createHeadingBlock(text: string): any {
  // Remove markdown heading markers
  const cleanText = text.replace(/^#{1,6}\s*/, '')
  const level = text.match(/^(#{1,6})/)?.[1]?.length || 2
  
  return {
    type: 'heading',
    attrs: { level: Math.min(level, 6) },
    content: [{ type: 'text', text: cleanText }]
  }
}

/**
 * Create paragraph block
 */
function createParagraphBlock(text: string): any {
  return {
    type: 'paragraph',
    content: [{ type: 'text', text }]
  }
}

/**
 * Create list blocks
 */
function createListBlocks(text: string): any[] {
  const lines = text.split('\n').filter(line => line.trim())
  const listItems = lines.map(line => {
    const cleanText = line.replace(/^[\s]*[-*•]\s*/, '').replace(/^[\s]*\d+\.\s*/, '')
    return {
      type: 'list_item',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: cleanText }]
      }]
    }
  })

  const isOrdered = text.match(/^[\s]*\d+\.\s/) !== null

  return [{
    type: isOrdered ? 'ordered_list' : 'bullet_list',
    content: listItems
  }]
}

/**
 * Create image block
 */
function createImageBlock(image: ExtractedImage): any {
  return {
    type: 'image',
    attrs: {
      src: image.url,
      alt: image.alt || '',
      title: image.caption || ''
    }
  }
}

/**
 * Extract plain text from structured content
 */
function extractPlainText(content: any): string {
  if (typeof content === 'string') return content
  
  if (content.content && Array.isArray(content.content)) {
    return content.content.map((block: any) => extractPlainText(block)).join(' ')
  }
  
  if (content.text) return content.text
  
  return ''
}

/**
 * Create or get existing author
 */
async function createOrGetAuthor(name: string): Promise<string | undefined> {
  try {
    // Check if author already exists
    const { data: existingAuthor } = await adminDb.createAuthor({
      name,
      slug: generateSlug(name),
      title: 'Contributing Author'
    })

    if (existingAuthor) {
      return existingAuthor.id
    }

    return undefined
  } catch (error) {
    // If author already exists (slug conflict), try to find them
    try {
      const { data: authors } = await adminDb.getAuthors()
      const existingAuthor = authors?.find(a => a.name.toLowerCase() === name.toLowerCase())
      return existingAuthor?.id
    } catch (findError) {
      console.error('Failed to create/find author:', error)
      return undefined
    }
  }
}

/**
 * Create the final post in Supabase
 */
export async function createSupabasePost(postData: SupabasePostData): Promise<Post> {
  try {
    // Check if slug already exists
    const { data: existingPost } = await adminDb.getPostBySlug(postData.slug)
    
    if (existingPost) {
      // Generate unique slug
      const timestamp = Date.now()
      postData.slug = `${postData.slug}-${timestamp}`
    }

    const { data: createdPost, error } = await adminDb.createPost(postData)
    
    if (error) {
      throw error
    }

    if (!createdPost) {
      throw new Error('Failed to create post')
    }

    return createdPost
  } catch (error) {
    console.error('Failed to create Supabase post:', error)
    throw error
  }
}

/**
 * Validate Supabase configuration
 */
export function validateSupabaseConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}
