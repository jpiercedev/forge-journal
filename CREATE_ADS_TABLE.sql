-- Create ads table for managing banner and sidebar advertisements
-- Run this SQL in your Supabase dashboard SQL editor

-- Create the ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('banner', 'sidebar')),
  headline VARCHAR(255) NOT NULL,
  subheading TEXT,
  image_url TEXT,
  image_alt TEXT,
  cta_text VARCHAR(100) NOT NULL,
  cta_link TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ads_type_active ON ads(type, is_active);
CREATE INDEX IF NOT EXISTS idx_ads_display_order ON ads(display_order);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_ads_updated_at ON ads;
CREATE TRIGGER trigger_ads_updated_at
  BEFORE UPDATE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION update_ads_updated_at();

-- Insert sample banner ad (based on the existing Leaderboard component)
INSERT INTO ads (title, type, headline, subheading, image_url, image_alt, cta_text, cta_link, is_active, display_order)
VALUES (
  'Forge Pastors Training Banner',
  'banner',
  'FORGE PASTORS TRAINING',
  'Equipping Leaders to Shape the Nation • Next Cohort Starting Soon',
  'https://images.unsplash.com/photo-1606768666853-403c90a981ad?w=800&h=200&fit=crop&crop=center',
  'Forge Pastors Training Banner',
  'SIGN UP NOW',
  'https://forgejournal.com/training',
  true,
  1
) ON CONFLICT (title) DO NOTHING;

-- Insert sample sidebar ad
INSERT INTO ads (title, type, headline, subheading, image_url, image_alt, cta_text, cta_link, is_active, display_order)
VALUES (
  'Leadership Resources Sidebar',
  'sidebar',
  'LEADERSHIP RESOURCES',
  'Download our free guide to pastoral leadership in challenging times',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center',
  'Leadership Resources Sidebar',
  'DOWNLOAD FREE',
  'https://forgejournal.com/resources',
  true,
  1
) ON CONFLICT (title) DO NOTHING;
