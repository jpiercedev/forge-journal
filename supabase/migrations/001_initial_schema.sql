-- Forge Journal Database Schema
-- Migration: 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Authors table
CREATE TABLE authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    title TEXT,
    bio TEXT,
    image_url TEXT,
    image_alt TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL, -- Rich text content as structured JSON
    excerpt TEXT,
    cover_image_url TEXT,
    cover_image_alt TEXT,
    author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- SEO fields
    seo_title TEXT,
    seo_description TEXT,
    
    -- Content metadata
    word_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0, -- in minutes
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'))
);

-- Post categories junction table (many-to-many)
CREATE TABLE post_categories (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- Images table (for managing uploaded images)
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_authors_slug ON authors(slug);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_post_categories_post_id ON post_categories(post_id);
CREATE INDEX idx_post_categories_category_id ON post_categories(category_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate reading time
CREATE OR REPLACE FUNCTION calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
DECLARE
    word_count INTEGER;
    reading_time INTEGER;
BEGIN
    -- Count words (approximate)
    word_count := array_length(string_to_array(content_text, ' '), 1);
    
    -- Calculate reading time (assuming 200 words per minute)
    reading_time := GREATEST(1, ROUND(word_count / 200.0));
    
    RETURN reading_time;
END;
$$ LANGUAGE plpgsql;

-- Insert default categories
INSERT INTO categories (title, slug, description) VALUES
    ('Ministry', 'ministry', 'Articles about ministry and pastoral care'),
    ('Leadership', 'leadership', 'Leadership principles and practices'),
    ('Theology', 'theology', 'Theological discussions and insights'),
    ('Church Growth', 'church-growth', 'Strategies for growing and strengthening churches'),
    ('Discipleship', 'discipleship', 'Making and developing disciples'),
    ('Preaching', 'preaching', 'Sermon preparation and delivery'),
    ('Community', 'community', 'Building and nurturing church community'),
    ('Spiritual Formation', 'spiritual-formation', 'Personal and congregational spiritual growth');

-- Insert default author (you can update this later)
INSERT INTO authors (name, title, bio, slug) VALUES
    ('Forge Journal Editor', 'Editor in Chief', 'The editorial team at Forge Journal, dedicated to equipping pastors and church leaders.', 'forge-journal-editor');
