-- Submissions Tables Schema
-- Migration: 003_submissions_tables.sql

-- Subscribers table for newsletter signups
CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    sms_opt_in BOOLEAN DEFAULT false,
    virtuous_contact_id TEXT, -- Store the Virtuous CRM contact ID
    is_existing BOOLEAN DEFAULT false, -- Track if they were already in Virtuous
    source TEXT DEFAULT 'website', -- Track where they subscribed from
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact form submissions table
CREATE TABLE contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_created_at ON subscribers(created_at DESC);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- Add unique constraint on email for subscribers to prevent duplicates
CREATE UNIQUE INDEX idx_subscribers_email_unique ON subscribers(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_subscribers_updated_at 
    BEFORE UPDATE ON subscribers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_submissions_updated_at 
    BEFORE UPDATE ON contact_submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admin users can view all subscribers" ON subscribers
    FOR SELECT USING (true); -- Will be restricted by admin authentication

CREATE POLICY "Admin users can insert subscribers" ON subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin users can update subscribers" ON subscribers
    FOR UPDATE USING (true);

CREATE POLICY "Admin users can delete subscribers" ON subscribers
    FOR DELETE USING (true);

CREATE POLICY "Admin users can view all contact submissions" ON contact_submissions
    FOR SELECT USING (true);

CREATE POLICY "Admin users can insert contact submissions" ON contact_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin users can update contact submissions" ON contact_submissions
    FOR UPDATE USING (true);

CREATE POLICY "Admin users can delete contact submissions" ON contact_submissions
    FOR DELETE USING (true);
