# Open Graph Images for Social Media Sharing

This document explains the Open Graph (OG) image system implemented for Forge Journal to optimize social media sharing.

## Overview

The system provides two types of OG images:

1. **Homepage OG Image** - High-resolution screenshot of the actual homepage
2. **Blog Post OG Images** - Dynamic images with featured image, title, excerpt, and author

## Homepage OG Images

### How it works
- Uses a static high-resolution screenshot of the homepage stored at `/public/og-homepage.png`
- Served via `/api/og-homepage` endpoint
- Falls back to generated OG image if screenshot doesn't exist

### Generating Homepage Screenshots

To update the homepage OG image with a fresh screenshot:

```bash
# Make sure your dev server is running
npm run dev

# Generate new screenshot (replace URL with your local or production URL)
node scripts/generate-homepage-og.js http://localhost:3002

# For production
node scripts/generate-homepage-og.js https://forgejournal.com
```

The script will:
- Launch a headless browser
- Navigate to the specified URL
- Take a 1200x630 screenshot optimized for social media
- Save it as `/public/og-homepage.png`

### When to regenerate
- After significant homepage design changes
- When updating branding or layout
- Before major releases or marketing campaigns

## Blog Post OG Images

### How it works
- Dynamic generation via `/api/og-post` endpoint
- Includes featured image as background (if available)
- Overlays post title, excerpt, and author information
- Falls back to gradient background if no featured image

### URL Parameters
```
/api/og-post?title=Post%20Title&excerpt=Post%20excerpt&image=https://example.com/image.jpg&author=Author%20Name
```

Parameters:
- `title` - Blog post title (truncated to 80 characters)
- `excerpt` - Post excerpt (truncated to 200 characters)  
- `image` - Featured image URL (optional)
- `author` - Author name (optional)

## Meta Tags Implementation

### Homepage (`components/IndexPageHead.tsx`)
- Uses `/api/og-homepage` for both `og:image` and `twitter:image`
- Includes comprehensive OG and Twitter Card meta tags
- Proper site information and branding

### Blog Posts (`components/PostPageHead.tsx`)
- Uses `/api/og-post` with dynamic post data
- Includes article-specific meta tags
- Reading time and word count for rich snippets

## Social Media Optimization

### Supported Platforms
- **Facebook** - Open Graph protocol
- **Twitter** - Twitter Cards (summary_large_image)
- **LinkedIn** - Open Graph protocol
- **Other platforms** - Generic Open Graph support

### Image Specifications
- **Dimensions**: 1200x630 pixels (16:9 aspect ratio)
- **Format**: PNG
- **File size**: Optimized for fast loading
- **Quality**: High resolution for crisp display

## Testing

### Local Testing
1. Start development server: `npm run dev`
2. Test homepage OG: `http://localhost:3002/api/og-homepage`
3. Test blog post OG: `http://localhost:3002/api/og-post?title=Test&excerpt=Test%20excerpt`

### External Validation
Use these tools to validate OG images on live sites:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [OpenGraph.xyz](https://www.opengraph.xyz/)

## Deployment Notes

### Production Considerations
- Homepage screenshots should be regenerated after design changes
- OG images are cached for performance (1 hour for homepage, dynamic for posts)
- Ensure all image URLs are absolute and publicly accessible

### Environment Variables
The system automatically detects the environment:
- Development: Uses `http://localhost:PORT`
- Production: Uses `VERCEL_URL` or falls back to `https://forgejournal.com`

## Troubleshooting

### Common Issues

**Homepage screenshot generation fails:**
- Ensure the target URL is accessible
- Check that the development server is running
- Verify Puppeteer dependencies are installed

**Blog post OG images not displaying:**
- Check that featured image URLs are publicly accessible
- Verify meta tags are properly rendered in page source
- Clear social media platform caches using their debugging tools

**Images not updating on social platforms:**
- Social platforms cache OG images aggressively
- Use platform-specific debugging tools to force refresh
- Wait 24-48 hours for natural cache expiration

## File Structure

```
├── components/
│   ├── IndexPageHead.tsx     # Homepage meta tags
│   └── PostPageHead.tsx      # Blog post meta tags
├── pages/api/
│   ├── og-homepage.tsx       # Homepage OG image endpoint
│   └── og-post.tsx          # Blog post OG image endpoint
├── scripts/
│   └── generate-homepage-og.js # Screenshot generation script
├── public/
│   └── og-homepage.png      # Static homepage screenshot
└── docs/
    └── og-images.md         # This documentation
```
