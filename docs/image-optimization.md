# Image Optimization System

The Forge Journal project includes a comprehensive image optimization system designed to reduce file sizes while maintaining high visual quality. This helps reduce Vercel's image transformation costs and improves page load performance.

## Overview

The system provides:
- **Automatic optimization** for all uploaded images
- **Batch optimization** for existing local images
- **Supabase storage optimization** for cloud-stored images
- **Multiple optimization presets** for different image types
- **WebP conversion** for maximum compression efficiency

## Key Benefits

- **91%+ file size reduction** achieved in testing
- **Reduced Vercel image transformation costs**
- **Faster page load times**
- **Maintained visual quality**
- **Automatic optimization on upload**

## Components

### 1. Image Optimizer Utility (`lib/utils/image-optimizer.ts`)

Core TypeScript utility providing:
- Image buffer optimization using Sharp
- Multiple optimization presets
- File size calculation and formatting
- Compression statistics

**Presets:**
- `coverImage`: Blog post covers (1920x1080, 85% quality)
- `avatar`: Contributor photos (400x400, 85% quality)  
- `advertisement`: Ad images (800x600, 80% quality)
- `thumbnail`: Small images (300x300, 75% quality)

### 2. Enhanced Upload API (`pages/api/admin/upload.ts`)

Automatically optimizes images during upload:
- Detects image type based on folder
- Applies appropriate optimization preset
- Converts to WebP format
- Returns compression statistics

### 3. Local Image Optimizer (`scripts/optimize-images.js`)

Batch processes local images in `public/images/`:
- Processes all image formats (JPG, PNG, WebP)
- Creates optimized versions alongside originals
- Provides detailed compression statistics
- Uses Sharp for high-quality processing

### 4. Supabase Storage Optimizer (`scripts/optimize-supabase-images.js`)

Optimizes images already stored in Supabase:
- Downloads, optimizes, and re-uploads images
- Skips already optimized files
- Processes specific folders or all folders
- Maintains original files for safety

## Usage

### Optimize Local Images

```bash
# Optimize all images in public/images/
npm run optimize-images

# Optimize only contributor photos
npm run optimize-contributors
```

### Optimize Supabase Storage Images

```bash
# Optimize all folders in Supabase storage
npm run optimize-supabase

# Optimize specific folders
npm run optimize-supabase-posts
npm run optimize-supabase-contributors
```

### Automatic Upload Optimization

Images uploaded through the admin interface are automatically optimized. No additional action required.

## Configuration

### Optimization Presets

Edit `lib/utils/image-optimizer.ts` to modify presets:

```typescript
export const OPTIMIZATION_PRESETS = {
  coverImage: {
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'webp' as const,
    progressive: true
  },
  // ... other presets
}
```

### Script Settings

Modify `scripts/optimize-images.js` CONFIG object:

```javascript
const CONFIG = {
  webpQuality: 85,
  jpegQuality: 85,
  maxWidth: 1920,
  maxHeight: 1080,
  contributorMaxWidth: 400,
  contributorMaxHeight: 400,
  // ...
}
```

## File Naming Convention

Optimized files use the following naming pattern:
- Original: `image-name.jpg`
- Optimized: `image-name-optimized.webp`

This allows you to:
- Keep original files as backup
- Easily identify optimized versions
- Update references gradually

## Performance Results

Based on testing with contributor photos:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total Size | 931.9 KB | 79.7 KB | 91.4% reduction |
| Average File Size | 155.3 KB | 13.3 KB | 91.4% reduction |
| Largest File | 289.8 KB | 16.3 KB | 94.4% reduction |

## Best Practices

### For New Images
1. Upload images through the admin interface
2. System automatically optimizes during upload
3. Use the returned optimized URL in your app

### For Existing Images
1. Run local optimization scripts first
2. Test optimized versions in your app
3. Run Supabase optimization for cloud storage
4. Update image references to use optimized versions

### Maintenance
1. Run optimization scripts after bulk image uploads
2. Monitor file sizes in Vercel dashboard
3. Periodically check for new unoptimized images

## Troubleshooting

### Sharp Installation Issues
If Sharp fails to install:
```bash
npm install sharp --save-dev --force
```

### Large File Warnings
If files are still large after optimization:
1. Check if original dimensions are excessive
2. Consider lowering quality settings
3. Verify WebP format is being used

### Supabase Connection Issues
Ensure environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Technical Details

### Image Processing Pipeline
1. **Input Validation**: Check file type and size
2. **Metadata Extraction**: Get original dimensions
3. **Resize**: Scale down if larger than max dimensions
4. **Format Conversion**: Convert to WebP for best compression
5. **Quality Optimization**: Apply quality settings
6. **Progressive Enhancement**: Enable progressive loading
7. **Output**: Generate optimized buffer/file

### Supported Formats
- **Input**: JPG, JPEG, PNG, WebP, GIF
- **Output**: WebP (recommended), JPEG, PNG

### Dependencies
- **Sharp**: High-performance image processing
- **Supabase**: Cloud storage integration
- **Formidable**: File upload handling

## Future Enhancements

Potential improvements:
- **AVIF format support** for even better compression
- **Responsive image generation** (multiple sizes)
- **Automatic cleanup** of old unoptimized files
- **CDN integration** for global image delivery
- **Real-time optimization monitoring**
