# Ads Image Upload Feature

The ads management system in Forge Journal has been updated to use image uploads instead of URL inputs, providing a more user-friendly experience for admin users.

## Changes Made

### Database Schema Updates
- **Renamed field**: `background_image_url` → `image_url` for consistency with other image fields
- **Added field**: `image_alt` for accessibility and SEO
- **Migration**: Created migration `20241220000000_update_ads_table_image_fields.sql` to update existing data

### Admin Interface Updates
- **Replaced URL input**: The "Background Image URL" text input has been replaced with the `ImageUpload` component
- **Added alt text field**: New input field for image alt text
- **Image preview**: Users can now see a preview of uploaded images
- **Drag & drop**: Support for drag and drop image uploads
- **File validation**: Automatic validation of file type and size (5MB limit)

### API Updates
- Updated `/api/content/ads` endpoints to handle `image_url` and `image_alt` fields
- Maintained backward compatibility during migration

### Frontend Component Updates
- **SidebarAd**: Updated to use `image_url` and `image_alt` fields
- **DynamicBanner**: Updated to use `image_url` field for background images

## Usage

### Creating/Editing Ads
1. Navigate to `/admin/ads`
2. Click "Create New Ad" or edit an existing ad
3. Use the "Ad Image" upload component to:
   - Click to browse files
   - Drag and drop images
   - See image preview
   - Remove uploaded images
4. Fill in the "Image Alt Text" field for accessibility
5. Complete other ad fields and save

### Image Storage
- Images are stored in Supabase storage under the `assets/ads/` folder
- File naming includes timestamp and random string for uniqueness
- Supported formats: JPEG, PNG, GIF, WebP, SVG
- Maximum file size: 5MB

### Benefits
- **Better UX**: No need to host images externally or copy URLs
- **Consistency**: Same upload experience as posts and author photos
- **Security**: Server-side validation and secure storage
- **Performance**: Optimized image delivery through Supabase CDN
- **Accessibility**: Proper alt text support for screen readers

## Technical Details

### File Structure
```
components/
  ├── ImageUpload.tsx          # Reusable upload component
  ├── SidebarAd.tsx           # Updated to use image_url
  └── DynamicBanner.tsx       # Updated to use image_url

pages/
  ├── admin/ads.tsx           # Updated admin interface
  └── api/content/ads.ts      # Updated API endpoints

types/
  └── ads.ts                  # Updated TypeScript interfaces

supabase/migrations/
  └── 20241220000000_update_ads_table_image_fields.sql
```

### Database Schema
```sql
CREATE TABLE ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('banner', 'sidebar')),
  headline VARCHAR(255) NOT NULL,
  subheading TEXT,
  image_url TEXT,           -- Updated field name
  image_alt TEXT,           -- New field
  cta_text VARCHAR(100) NOT NULL,
  cta_link TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
