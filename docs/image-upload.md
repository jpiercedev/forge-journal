# Image Upload Feature

The Forge Journal admin interface now supports direct image uploads to Supabase storage instead of requiring users to provide image URLs.

## Features

### Cover Image Upload
- **Location**: Blog post editor (both new and edit pages)
- **Replaces**: Previous URL input field for cover images
- **Storage**: Images are stored in Supabase storage under `assets/posts/` folder
- **File Types**: JPEG, PNG, GIF, WebP, SVG
- **Size Limit**: 5MB per image
- **Preview**: Shows image preview with remove option
- **Upload Method**: Secure server-side upload via `/api/admin/upload` endpoint

### ImageUpload Component

The reusable `ImageUpload` component provides:

- **Drag & Drop**: Users can drag images directly onto the upload area
- **Click to Upload**: Traditional file picker interface
- **File Validation**: Automatic validation of file type and size
- **Progress Indicator**: Shows upload progress with spinner
- **Error Handling**: Clear error messages for upload failures
- **Preview**: Image preview with remove functionality
- **Unique Naming**: Automatic generation of unique filenames

#### Usage

```tsx
import ImageUpload from 'components/ImageUpload'

<ImageUpload
  label="Cover Image"
  value={formData.cover_image}
  onChange={(url) => setFormData(prev => ({ ...prev, cover_image: url }))}
  onError={(error) => setError(error)}
  folder="posts"
  placeholder="Upload a cover image for your post"
  maxSize={5 * 1024 * 1024} // 5MB
  showPreview={true}
/>
```

#### Props

- `value?: string` - Current image URL
- `onChange: (url: string) => void` - Callback when image is uploaded
- `onError?: (error: string) => void` - Error callback
- `label?: string` - Field label (default: "Image")
- `placeholder?: string` - Upload area placeholder text
- `folder?: string` - Storage folder (default: "uploads")
- `className?: string` - Additional CSS classes
- `accept?: string` - File type filter (default: "image/*")
- `maxSize?: number` - Maximum file size in bytes (default: 5MB)
- `showPreview?: boolean` - Show image preview (default: true)

## Architecture

### Upload Flow
1. **Client Side**: User selects/drops image file in ImageUpload component
2. **Validation**: File type and size validated on client
3. **API Upload**: File sent to `/api/admin/upload` endpoint via FormData
4. **Server Processing**: Server validates, generates unique filename, uploads to Supabase
5. **Response**: Public URL returned to client and stored in form state

### Security
- **Authentication**: Upload endpoint requires admin authentication
- **Server-side Validation**: File type and size re-validated on server
- **Unique Naming**: Prevents filename conflicts and overwrites
- **Environment Isolation**: Service role key only available server-side

## Storage Management

### Supabase Storage Setup

The system uses a Supabase storage bucket named "assets" with the following structure:

```
assets/
├── posts/           # Blog post cover images
├── contributors/    # Author/contributor photos
├── ads/            # Advertisement images
└── uploads/        # General uploads
```

### Storage Utilities

The `lib/supabase/storage.ts` file provides utilities for:

- **File Upload**: `uploadFile(bucket, path, file, options)`
- **File Deletion**: `deleteFile(bucket, path)`
- **Public URLs**: `getPublicUrl(bucket, path)`
- **File Listing**: `listFiles(bucket, folder, options)`
- **Cleanup**: `cleanupOrphanedImages(dryRun)`
- **Statistics**: `getStorageStats(bucket)`

### Upload API

#### POST `/api/admin/upload`
Upload a single image file:

**Request**: Multipart form data
- `file`: Image file (required)
- `folder`: Storage folder (optional, default: "uploads")

**Response**:
```json
{
  "success": true,
  "data": {
    "url": "https://uvnbfnobyqbonuxztjuz.supabase.co/storage/v1/object/public/assets/posts/my-image-1703123456789-abc123.jpg",
    "path": "posts/my-image-1703123456789-abc123.jpg",
    "size": 1024576,
    "type": "image/jpeg"
  },
  "message": "File uploaded successfully"
}
```

**Error Responses**:
- `400`: Invalid file type, file too large, or no file provided
- `401`: Authentication required
- `500`: Server error during upload

### Admin Storage API

The `/api/admin/storage` endpoint provides:

#### GET `/api/admin/storage?action=stats`
Returns storage usage statistics:

```json
{
  "success": true,
  "data": {
    "folders": {
      "posts": { "count": 15, "size": 2048576 },
      "contributors": { "count": 8, "size": 1024000 }
    },
    "total": {
      "count": 23,
      "size": 3072576,
      "sizeFormatted": "2.93 MB"
    }
  }
}
```

#### POST `/api/admin/storage?action=cleanup`
Clean up orphaned images:

```json
{
  "dryRun": true  // Set to false to actually delete files
}
```

#### DELETE `/api/admin/storage?action=file`
Delete a specific file:

```json
{
  "bucket": "assets",
  "path": "posts/old-image.jpg"
}
```

## File Naming Convention

Uploaded files are automatically renamed using the pattern:
```
{sanitized-original-name}-{timestamp}-{random}.{extension}
```

Example: `my-blog-post-1703123456789-abc123.jpg`

This ensures:
- No file name conflicts
- Traceable upload times
- SEO-friendly names
- Unique identifiers

## Security & Permissions

### Storage Bucket Configuration
- **Public Access**: Enabled for read operations
- **File Types**: Restricted to image formats only
- **Size Limits**: 50MB bucket limit, 5MB per file for posts
- **Authentication**: Upload requires admin authentication

### File Validation
- **Client-side**: File type and size validation before upload
- **Server-side**: Additional validation in Supabase
- **Error Handling**: Graceful error messages for users

## Migration from URL Input

The previous URL input fields have been replaced with the ImageUpload component in:

- `/admin/posts/new` - New post creation
- `/admin/posts/[id]` - Post editing

### Database Schema

The existing database schema remains unchanged:
- `posts.cover_image_url` - Stores the Supabase storage URL
- `posts.cover_image_alt` - Stores alt text (future enhancement)

### Backward Compatibility

- Existing posts with external image URLs continue to work
- New uploads use Supabase storage URLs
- No data migration required

## Future Enhancements

Potential improvements for the image upload system:

1. **Image Optimization**: Automatic resizing and compression
2. **Multiple Formats**: Generate WebP versions for better performance
3. **Alt Text**: UI for adding image alt text
4. **Bulk Upload**: Multiple image selection
5. **Image Gallery**: Browse and reuse uploaded images
6. **CDN Integration**: Optional CDN for faster image delivery
7. **Image Editing**: Basic crop/resize functionality

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check Supabase credentials and bucket permissions
2. **Large Files**: Ensure file size is under 5MB limit
3. **Wrong Format**: Only image files are accepted
4. **Slow Upload**: Check network connection and file size

### Error Messages

- "File too large" - Reduce image size or compress
- "Invalid file type" - Use JPEG, PNG, GIF, WebP, or SVG
- "Upload failed" - Check network and try again
- "Duplicate file" - File with same name exists (rare due to unique naming)

### Storage Cleanup

Run the cleanup utility periodically to remove orphaned images:

```bash
# Dry run to see what would be deleted
curl -X POST "http://localhost:3000/api/admin/storage?action=cleanup" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'

# Actually delete orphaned files
curl -X POST "http://localhost:3000/api/admin/storage?action=cleanup" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'
```
