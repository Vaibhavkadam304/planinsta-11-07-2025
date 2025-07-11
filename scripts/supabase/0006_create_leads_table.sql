-- Create leads table for capturing potential customers
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  source VARCHAR(100) NOT NULL, -- which page they came from
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Create index on source for analytics
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for lead capture)
CREATE POLICY "Allow lead creation" ON leads
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for admin access (you can modify this based on your admin setup)
CREATE POLICY "Allow admin access to leads" ON leads
  FOR ALL 
  USING (true);
