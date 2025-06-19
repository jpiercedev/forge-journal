// Smart Import Types for Forge Journal

export interface ImportRequest {
  method: 'url' | 'text' | 'file';
  content: string;
  options?: ImportOptions;
}

export interface ImportOptions {
  generateExcerpt?: boolean;
  detectAuthor?: boolean;
  extractImages?: boolean;
  suggestCategories?: boolean;
  customPrompt?: string;
}

export interface ParsedContent {
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  publishedAt?: string;
  images?: ExtractedImage[];
  categories?: string[];
  metadata?: ContentMetadata;
}

export interface ExtractedImage {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ContentMetadata {
  wordCount: number;
  readingTime: number;
  language?: string;
  sourceUrl?: string;
  extractedAt: string;
}

export interface SanityPostData {
  _type: 'post';
  title: string;
  slug: {
    _type: 'slug';
    current: string;
  };
  content: any[]; // Sanity block content
  excerpt?: string;
  coverImage?: {
    _type: 'image';
    asset: {
      _type: 'reference';
      _ref: string;
    };
    alt?: string;
  };
  date: string;
  author?: {
    _type: 'reference';
    _ref: string;
  };
}

export interface SupabasePostData {
  title: string;
  slug: string;
  content: any; // Rich content as JSON
  excerpt?: string;
  cover_image_url?: string;
  cover_image_alt?: string;
  author_id?: string;
  published_at?: string;
  seo_title?: string;
  seo_description?: string;
  word_count: number;
  reading_time: number;
  status: 'draft' | 'published' | 'archived';
}

export interface ImportPreview {
  parsedContent: ParsedContent;
  sanityData?: SanityPostData; // Legacy support
  supabaseData?: SupabasePostData;
  warnings?: string[];
  suggestions?: string[];
}

export interface ImportResult {
  success: boolean;
  postId?: string;
  slug?: string;
  error?: string;
  warnings?: string[];
}

export interface ImportProgress {
  stage: 'parsing' | 'processing' | 'formatting' | 'uploading' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  details?: string;
}

export interface FileUpload {
  filename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UrlImportRequest {
  url: string;
  options?: ImportOptions;
}

export interface TextImportRequest {
  text: string;
  title?: string;
  options?: ImportOptions;
}

export interface FileImportRequest {
  file: FileUpload;
  options?: ImportOptions;
}

// AI Processing Types
export interface AIProcessingRequest {
  content: string;
  type: 'url' | 'text' | 'file';
  options: ImportOptions;
}

export interface AIProcessingResponse {
  title: string;
  content: string;
  excerpt: string;
  author?: string;
  publishedAt?: string;
  categories?: string[];
  confidence: number; // 0-1
}

// Error Types
export interface ImportError {
  code: string;
  message: string;
  details?: any;
  stage?: string;
}

export type ImportErrorCode = 
  | 'INVALID_URL'
  | 'FETCH_FAILED'
  | 'PARSE_FAILED'
  | 'AI_PROCESSING_FAILED'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'SANITY_CREATE_FAILED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'AUTHENTICATION_FAILED';

// Configuration Types
export interface SmartImportConfig {
  ai: {
    provider: 'openai';
    model: string;
    temperature: number;
    maxTokens: number;
  };
  limits: {
    maxFileSize: number; // bytes
    maxContentLength: number; // characters
    rateLimit: {
      requests: number;
      window: number; // seconds
    };
  };
  features: {
    urlImport: boolean;
    fileImport: boolean;
    imageExtraction: boolean;
    authorDetection: boolean;
  };
  supportedFileTypes: string[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ImportError;
  message?: string;
}

export interface ParseUrlResponse extends ApiResponse<ParsedContent> {}
export interface ParseTextResponse extends ApiResponse<ParsedContent> {}
export interface ParseFileResponse extends ApiResponse<ParsedContent> {}
export interface CreatePostResponse extends ApiResponse<ImportResult> {}
export interface PreviewResponse extends ApiResponse<ImportPreview> {}

// Utility Types
export type ImportMethod = 'url' | 'text' | 'file';
export type ProcessingStage = ImportProgress['stage'];

// Form Types for UI Components
export interface ImportFormData {
  method: ImportMethod;
  url?: string;
  text?: string;
  file?: File;
  options: ImportOptions;
}

export interface PreviewFormData extends SanityPostData {
  // Additional fields for editing
  parsedContent: ParsedContent;
  generateSlug?: boolean;
  createAuthor?: boolean;
  authorName?: string;
}

// AI Formatter Types
export interface AIFormatterRequest {
  postId: string;
}

export interface AIFormatterResponse {
  success: boolean;
  data?: {
    originalContent: any;
    formattedContent: any;
    changes: ContentChange[];
  };
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export interface ContentChange {
  type: 'heading' | 'quote' | 'paragraph' | 'list' | 'emphasis';
  action: 'detected' | 'formatted' | 'restructured';
  originalText: string;
  formattedStructure: any;
  confidence: number; // 0-1 confidence score
}

export interface ContentAnalysis {
  headings: DetectedHeading[];
  quotes: DetectedQuote[];
  lists: DetectedList[];
  paragraphs: DetectedParagraph[];
  emphasis: DetectedEmphasis[];
}

export interface DetectedHeading {
  text: string;
  level: number; // 1-6
  confidence: number;
  position: number;
}

export interface DetectedQuote {
  text: string;
  type: 'blockquote' | 'inline';
  confidence: number;
  position: number;
}

export interface DetectedList {
  items: string[];
  type: 'ordered' | 'unordered';
  confidence: number;
  position: number;
}

export interface DetectedParagraph {
  text: string;
  type: 'normal' | 'intro' | 'conclusion';
  confidence: number;
  position: number;
}

export interface DetectedEmphasis {
  text: string;
  type: 'bold' | 'italic' | 'important';
  confidence: number;
  position: number;
}
