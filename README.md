# Forge Journal

A modern blog platform built with Next.js and Supabase, designed specifically for pastors and leadership who are helping to shape the nation.

## Features

- **Modern Blog Platform**: Clean, responsive design optimized for reading
- **Supabase Backend**: Powerful PostgreSQL database with real-time capabilities
- **Smart Import**: AI-powered content import from URLs, files, and text
- **Content Management**: Full-featured admin dashboard for managing posts and authors
- **SEO Optimized**: Built-in SEO features and meta tag management
- **Responsive Design**: Mobile-first design that works on all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI GPT-4 for smart content processing
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 20 or later
- A Supabase account
- An OpenAI API key (for Smart Import features)

### 1. Clone and Install

```bash
git clone https://github.com/jpiercedev/nextjs-blog-cms-sanity-v3.git forge-journal
cd forge-journal
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database migrations from the `supabase/migrations` folder
3. Copy your project URL and API keys

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI for Smart Import (optional)
OPENAI_API_KEY=your_openai_api_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Your Forge Journal will be running at [http://localhost:3000](http://localhost:3000)!

## Project Structure

### Important Files and Folders

| File/Folder | Description |
| ----------- | ----------- |
| `/pages/` | Next.js pages and API routes |
| `/components/` | React components |
| `/lib/supabase/` | Supabase client and database utilities |
| `/lib/smart-import/` | Smart Import AI processing logic |
| `/supabase/migrations/` | Database schema and migrations |
| `/types/` | TypeScript type definitions |

### Key Features

- **Admin Dashboard**: Access at `/admin/dashboard` for content management
- **Smart Import**: Access at `/admin/smart-import` for AI-powered content import
- **Blog Posts**: Managed through Supabase with rich content support
- **Author Management**: Full author profiles with images and bios

## Smart Import

The Smart Import feature allows you to import content from various sources using AI:

- **URL Import**: Extract and format content from web pages
- **File Import**: Process PDF, Word documents, and text files
- **Text Import**: Paste text content for AI processing

### How it Works

1. Content is extracted from the source
2. OpenAI processes and structures the content
3. Metadata is automatically generated (title, excerpt, categories)
4. Content is formatted for Supabase storage
5. Posts are created as drafts for review

## Database Schema

The Supabase database includes these main tables:

- `posts` - Blog posts with rich content
- `authors` - Author profiles and information
- `categories` - Content categorization
- `post_categories` - Many-to-many relationship for post categories

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

## Development

### Running Tests

```bash
npm run test
```

### Code Formatting

```bash
npm run format
```

### Type Checking

```bash
npm run type-check
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and formatting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions and support:

- Create an issue on GitHub
- Check the documentation in the `/docs` folder
- Review the Smart Import guides for AI features

## Acknowledgments

- Built with Next.js and Supabase
- AI features powered by OpenAI
- Design inspired by modern publishing platforms