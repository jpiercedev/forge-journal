// Sanity Data Formatting for Smart Import

import { createClient } from '@sanity/client';

import { ExtractedImage,ParsedContent, SanityPostData } from '../../types/smart-import';
import { apiVersion, dataset, projectId } from '../sanity.api';

// Create Sanity client for write operations
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

/**
 * Convert parsed content to Sanity post format
 */
export async function formatForSanity(
  parsedContent: ParsedContent,
  options: {
    generateSlug?: boolean;
    createAuthor?: boolean;
    authorName?: string;
  } = {}
): Promise<SanityPostData> {
  const { title, content, excerpt, author, publishedAt, images } = parsedContent;

  // Generate slug from title
  const slug = options.generateSlug !== false ? generateSlug(title) : title.toLowerCase().replace(/\s+/g, '-');

  // Convert content to Sanity block format
  const blockContent = await convertToBlockContent(content, images);

  // Handle author
  let authorRef: { _type: 'reference'; _ref: string } | undefined;
  if (author || options.authorName) {
    const authorName = options.authorName || author;
    if (authorName && options.createAuthor !== false) {
      const authorId = await createOrGetAuthor(authorName);
      if (authorId) {
        authorRef = {
          _type: 'reference',
          _ref: authorId,
        };
      }
    }
  }

  // Handle cover image
  let coverImage;
  if (images && images.length > 0) {
    const firstImage = images[0];
    try {
      const imageAsset = await uploadImageFromUrl(firstImage.url, firstImage.alt);
      if (imageAsset) {
        coverImage = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id,
          },
          alt: firstImage.alt || title,
        };
      }
    } catch (error) {
      console.warn('Failed to upload cover image:', error);
    }
  }

  // Use provided date or current date
  const date = publishedAt || new Date().toISOString();

  const sanityData: SanityPostData = {
    _type: 'post',
    title,
    slug: {
      _type: 'slug',
      current: slug,
    },
    content: blockContent,
    date,
  };

  // Add optional fields
  if (excerpt) {
    sanityData.excerpt = excerpt;
  }

  if (coverImage) {
    sanityData.coverImage = coverImage;
  }

  if (authorRef) {
    sanityData.author = authorRef;
  }

  return sanityData;
}

/**
 * Convert plain text content to Sanity block content
 */
async function convertToBlockContent(content: string, images?: ExtractedImage[]): Promise<any[]> {
  const blocks: any[] = [];
  
  // Split content into paragraphs
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    // Check if this looks like a heading
    if (isHeading(trimmed)) {
      blocks.push(createHeadingBlock(trimmed));
    } else if (isList(trimmed)) {
      blocks.push(...createListBlocks(trimmed));
    } else {
      blocks.push(createParagraphBlock(trimmed));
    }
  }

  // Add images as separate blocks if available
  if (images && images.length > 1) {
    for (let i = 1; i < images.length; i++) {
      try {
        const imageAsset = await uploadImageFromUrl(images[i].url, images[i].alt);
        if (imageAsset) {
          blocks.push(createImageBlock(imageAsset._id, images[i].alt));
        }
      } catch (error) {
        console.warn(`Failed to upload image ${i}:`, error);
      }
    }
  }

  return blocks;
}

/**
 * Create a paragraph block
 */
function createParagraphBlock(text: string): any {
  return {
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: text,
        marks: [],
      },
    ],
  };
}

/**
 * Create a heading block
 */
function createHeadingBlock(text: string): any {
  // Remove common heading markers
  const cleanText = text.replace(/^#+\s*/, '').replace(/^[-=]+\s*/, '');
  
  return {
    _type: 'block',
    style: 'h2', // Default to h2 for imported content
    children: [
      {
        _type: 'span',
        text: cleanText,
        marks: [],
      },
    ],
  };
}

/**
 * Create list blocks
 */
function createListBlocks(text: string): any[] {
  const lines = text.split('\n').filter(line => line.trim());
  const blocks: any[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      const listText = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
      blocks.push({
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [
          {
            _type: 'span',
            text: listText,
            marks: [],
          },
        ],
      });
    }
  }

  return blocks;
}

/**
 * Create an image block
 */
function createImageBlock(assetId: string, alt?: string): any {
  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: assetId,
    },
    alt: alt || 'Imported image',
  };
}

/**
 * Check if text looks like a heading
 */
function isHeading(text: string): boolean {
  // Check for markdown-style headings
  if (text.match(/^#+\s+/)) return true;
  
  // Check for underlined headings
  if (text.match(/^.+\n[-=]+$/)) return true;
  
  // Check for short, title-case text
  if (text.length < 100 && text.match(/^[A-Z][^.!?]*$/)) return true;
  
  return false;
}

/**
 * Check if text looks like a list
 */
function isList(text: string): boolean {
  const lines = text.split('\n');
  const listLines = lines.filter(line => 
    line.trim().match(/^[-*•]\s+/) || line.trim().match(/^\d+\.\s+/)
  );
  
  return listLines.length > 1 && listLines.length >= lines.length * 0.5;
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 96); // Limit length
}

/**
 * Create or get existing author
 */
async function createOrGetAuthor(name: string): Promise<string | null> {
  try {
    // Check if author already exists
    const existingAuthor = await client.fetch(
      `*[_type == "author" && name == $name][0]`,
      { name }
    );

    if (existingAuthor) {
      return existingAuthor._id;
    }

    // Create new author
    const newAuthor = await client.create({
      _type: 'author',
      name,
      // Add default picture placeholder
      picture: {
        _type: 'image',
        alt: `${name} - Author`,
      },
    });

    return newAuthor._id;
  } catch (error) {
    console.error('Failed to create/get author:', error);
    return null;
  }
}

/**
 * Upload image from URL to Sanity
 */
async function uploadImageFromUrl(url: string, alt?: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const filename = url.split('/').pop() || 'imported-image';

    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename,
    });

    return asset;
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }
}

/**
 * Create the final post in Sanity
 */
export async function createSanityPost(postData: SanityPostData): Promise<any> {
  try {
    // Check if slug already exists
    const existingPost = await client.fetch(
      `*[_type == "post" && slug.current == $slug][0]`,
      { slug: postData.slug.current }
    );

    if (existingPost) {
      // Generate unique slug
      const timestamp = Date.now();
      postData.slug.current = `${postData.slug.current}-${timestamp}`;
    }

    const createdPost = await client.create(postData);
    return createdPost;
  } catch (error) {
    console.error('Failed to create Sanity post:', error);
    throw error;
  }
}

/**
 * Validate Sanity configuration
 */
export function validateSanityConfig(): boolean {
  return !!(projectId && dataset && process.env.SANITY_API_WRITE_TOKEN);
}
