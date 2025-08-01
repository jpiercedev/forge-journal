// Supabase Client Configuration for Forge Journal

import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if we're in a build environment without env vars
const isBuildTime = process.env.NODE_ENV === 'production' && (!supabaseUrl || !supabaseAnonKey)

if (!isBuildTime && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables')
}

// Client for browser/frontend use
export const supabase = isBuildTime
  ? null as any // Placeholder during build time
  : createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (has elevated permissions)
// Only create this on the server side where the service key is available
export const supabaseAdmin = (() => {
  if (typeof window !== 'undefined') {
    // Running on client side - return null or a placeholder
    return null as any
  }

  if (isBuildTime || !supabaseServiceKey) {
    // During build time or when service key is missing, return placeholder
    return null as any
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
})()

// Database types
export interface Author {
  id: string
  name: string
  title?: string
  bio?: string
  image_url?: string
  image_alt?: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  title: string
  slug: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  title: string
  slug: string
  content: any // JSONB content
  excerpt?: string
  cover_image_url?: string
  cover_image_alt?: string
  author_id?: string
  published_at?: string
  created_at: string
  updated_at: string
  seo_title?: string
  seo_description?: string
  word_count: number
  reading_time: number
  status: 'draft' | 'published' | 'archived'
  
  // Relations (when joined)
  author?: Author
  categories?: Category[]
}

export interface PostCategory {
  post_id: string
  category_id: string
}

export interface Image {
  id: string
  filename: string
  original_name: string
  url: string
  alt_text?: string
  caption?: string
  width?: number
  height?: number
  file_size?: number
  mime_type?: string
  created_at: string
}

export interface Ad {
  id: string
  title: string
  type: 'banner' | 'sidebar'
  headline: string
  subheading?: string
  image_url?: string
  image_alt?: string
  cta_text: string
  cta_link: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// Database helper functions
export const db = {
  // Posts
  async getPosts(options: {
    status?: 'draft' | 'published' | 'archived'
    limit?: number
    offset?: number
    includeAuthor?: boolean
    includeCategories?: boolean
    slug?: string
  } = {}) {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not available') }
    }

    // Build the select clause dynamically to avoid trailing commas
    const selectFields = ['*']
    if (options.includeAuthor) {
      selectFields.push('author:authors(*)')
    }
    if (options.includeCategories) {
      selectFields.push('categories:post_categories(category:categories(*))')
    }

    let query = supabase
      .from('posts')
      .select(selectFields.join(', '))
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.slug) {
      query = query.eq('slug', options.slug)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    return query
  },

  async getPostBySlug(slug: string, includeAuthor = true, includeCategories = true) {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not available') }
    }

    // Build the select clause dynamically to avoid trailing commas
    const selectFields = ['*']
    if (includeAuthor) {
      selectFields.push('author:authors(*)')
    }
    if (includeCategories) {
      selectFields.push('categories:post_categories(category:categories(*))')
    }

    return supabase
      .from('posts')
      .select(selectFields.join(', '))
      .eq('slug', slug)
      .single()
  },

  async getPostById(id: string, includeAuthor = true, includeCategories = true) {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not available') }
    }

    // Build the select clause dynamically to avoid trailing commas
    const selectFields = ['*']
    if (includeAuthor) {
      selectFields.push('author:authors(*)')
    }
    if (includeCategories) {
      selectFields.push('categories:post_categories(category:categories(*))')
    }

    return supabase
      .from('posts')
      .select(selectFields.join(', '))
      .eq('id', id)
      .single()
  },

  // Authors
  async getAuthors() {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not available') }
    }

    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('created_at')

    if (error || !data) {
      return { data, error }
    }

    // Custom ordering: Steve Riggle first, Jason Nelson second, then others
    const orderedAuthors = data.sort((a, b) => {
      if (a.name === 'PASTOR STEVE RIGGLE') return -1
      if (b.name === 'PASTOR STEVE RIGGLE') return 1
      if (a.name === 'DR. JASON NELSON') return -1
      if (b.name === 'DR. JASON NELSON') return 1
      return 0
    })

    return { data: orderedAuthors, error: null }
  },

  async getAuthorBySlug(slug: string) {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not available') }
    }

    return supabase
      .from('authors')
      .select('*')
      .eq('slug', slug)
      .single()
  },

  // Categories
  async getCategories() {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not available') }
    }

    return supabase
      .from('categories')
      .select('*')
      .order('title')
  },

  async getCategoryBySlug(slug: string) {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not available') }
    }

    return supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
  },

  async getPostsByCategory(categoryId: string, options: {
    status?: 'draft' | 'published' | 'archived'
    limit?: number
    offset?: number
    includeAuthor?: boolean
    includeCategories?: boolean
  } = {}) {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not available') }
    }

    try {
      // First, get post IDs that belong to this category
      const { data: postCategories, error: pcError } = await supabase
        .from('post_categories')
        .select('post_id')
        .eq('category_id', categoryId)

      if (pcError) {
        return { data: null, error: pcError }
      }

      if (!postCategories || postCategories.length === 0) {
        return { data: [], error: null }
      }

      const postIds = postCategories.map(pc => pc.post_id)

      // Build the select clause dynamically
      const selectFields = ['*']
      if (options.includeAuthor) {
        selectFields.push('author:authors(*)')
      }
      if (options.includeCategories) {
        selectFields.push('categories:post_categories(category:categories(*))')
      }

      let query = supabase
        .from('posts')
        .select(selectFields.join(', '))
        .in('id', postIds)
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false })

      if (options.status) {
        query = query.eq('status', options.status)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, (options.offset || 0) + (options.limit || 10) - 1)
      }

      return query
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  async getPostsByCategorySlug(categorySlug: string, options: {
    status?: 'draft' | 'published' | 'archived'
    limit?: number
    offset?: number
    includeAuthor?: boolean
    includeCategories?: boolean
  } = {}) {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not available') }
    }

    // First get the category to get its ID
    const categoryResult = await this.getCategoryBySlug(categorySlug)
    if (categoryResult.error || !categoryResult.data) {
      return { data: null, error: categoryResult.error || new Error('Category not found') }
    }

    return this.getPostsByCategory(categoryResult.data.id, options)
  },

  // Ads
  async getAds(type?: 'banner' | 'sidebar', activeOnly = true) {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not available') }
    }

    let query = supabase
      .from('ads')
      .select('*')
      .order('display_order')
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (type) {
      query = query.eq('type', type)
    }

    return query
  },

  async getAdById(id: string) {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not available') }
    }

    return supabase
      .from('ads')
      .select('*')
      .eq('id', id)
      .single()
  }
}

// Admin database operations (server-side only)
export const adminDb = {
  // Posts
  async createPost(postData: Partial<Post>) {
    if (!supabaseAdmin) {
      return { data: null, error: new Error('Supabase admin client not available') }
    }

    return supabaseAdmin
      .from('posts')
      .insert(postData)
      .select()
      .single()
  },

  async updatePost(id: string, postData: Partial<Post>) {
    if (!supabaseAdmin) {
      return { data: null, error: new Error('Supabase admin client not available') }
    }

    return supabaseAdmin
      .from('posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single()
  },

  async deletePost(id: string) {
    if (!supabaseAdmin) {
      return { data: null, error: new Error('Supabase admin client not available') }
    }

    return supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id)
  },

  async getPostBySlug(slug: string, includeAuthor = true, includeCategories = true) {
    // Build the select clause dynamically to avoid trailing commas
    const selectFields = ['*']
    if (includeAuthor) {
      selectFields.push('author:authors(*)')
    }
    if (includeCategories) {
      selectFields.push('categories:post_categories(category:categories(*))')
    }

    return supabaseAdmin
      .from('posts')
      .select(selectFields.join(', '))
      .eq('slug', slug)
      .single()
  },

  async getPostById(id: string, includeAuthor = true, includeCategories = true) {
    // Build the select clause dynamically to avoid trailing commas
    const selectFields = ['*']
    if (includeAuthor) {
      selectFields.push('author:authors(*)')
    }
    if (includeCategories) {
      selectFields.push('categories:post_categories(category:categories(*))')
    }

    return supabaseAdmin
      .from('posts')
      .select(selectFields.join(', '))
      .eq('id', id)
      .single()
  },

  // Authors
  async createAuthor(authorData: Partial<Author>) {
    return supabaseAdmin
      .from('authors')
      .insert(authorData)
      .select()
      .single()
  },

  async updateAuthor(id: string, authorData: Partial<Author>) {
    return supabaseAdmin
      .from('authors')
      .update(authorData)
      .eq('id', id)
      .select()
      .single()
  },

  async deleteAuthor(id: string) {
    return supabaseAdmin
      .from('authors')
      .delete()
      .eq('id', id)
  },

  async getAuthors() {
    const { data, error } = await supabaseAdmin
      .from('authors')
      .select('*')
      .order('created_at')

    if (error || !data) {
      return { data, error }
    }

    // Custom ordering: Steve Riggle first, Jason Nelson second, then others
    const orderedAuthors = data.sort((a, b) => {
      if (a.name === 'PASTOR STEVE RIGGLE') return -1
      if (b.name === 'PASTOR STEVE RIGGLE') return 1
      if (a.name === 'DR. JASON NELSON') return -1
      if (b.name === 'DR. JASON NELSON') return 1
      return 0
    })

    return { data: orderedAuthors, error: null }
  },

  // Categories
  async createCategory(categoryData: Partial<Category>) {
    return supabaseAdmin
      .from('categories')
      .insert(categoryData)
      .select()
      .single()
  },

  async updateCategory(id: string, categoryData: Partial<Category>) {
    return supabaseAdmin
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single()
  },

  async deleteCategory(id: string) {
    return supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id)
  },

  // Post Categories
  async setPostCategories(postId: string, categoryIds: string[]) {
    // First, remove existing categories
    await supabaseAdmin
      .from('post_categories')
      .delete()
      .eq('post_id', postId)

    // Then add new categories
    if (categoryIds.length > 0) {
      const postCategories = categoryIds.map(categoryId => ({
        post_id: postId,
        category_id: categoryId
      }))

      return supabaseAdmin
        .from('post_categories')
        .insert(postCategories)
    }

    return { data: [], error: null }
  },

  // Ads
  async createAd(adData: Partial<Ad>) {
    return supabaseAdmin
      .from('ads')
      .insert(adData)
      .select()
      .single()
  },

  async updateAd(id: string, adData: Partial<Ad>) {
    return supabaseAdmin
      .from('ads')
      .update(adData)
      .eq('id', id)
      .select()
      .single()
  },

  async deleteAd(id: string) {
    return supabaseAdmin
      .from('ads')
      .delete()
      .eq('id', id)
  },

  async getAds(type?: 'banner' | 'sidebar', activeOnly = false) {
    let query = supabaseAdmin
      .from('ads')
      .select('*')
      .order('display_order')
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (type) {
      query = query.eq('type', type)
    }

    return query
  },

  async getAdById(id: string) {
    return supabaseAdmin
      .from('ads')
      .select('*')
      .eq('id', id)
      .single()
  }
}

// Utility functions
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.max(1, Math.round(wordCount / wordsPerMinute))
}

export function validateSupabaseConfig(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey)
}
