-- 0006_create_leads_table.sql

----------------------------------------------------------------
-- 1) Create leads table (if it doesn’t already exist)
----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(255) NOT NULL,
  email       varchar(255) NOT NULL,
  phone       varchar(20)  NOT NULL,
  source      varchar(100) NOT NULL, -- e.g. which page they came from
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now()
);

----------------------------------------------------------------
-- 2) Indexes
----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_leads_email  ON public.leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads (source);

----------------------------------------------------------------
-- 3) Enable row-level security
----------------------------------------------------------------
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

----------------------------------------------------------------
-- 4) Drop any existing policies so re-running never errors
----------------------------------------------------------------
DROP POLICY IF EXISTS "Allow lead creation"      ON public.leads;
DROP POLICY IF EXISTS "Allow admin access to leads" ON public.leads;

----------------------------------------------------------------
-- 5) RLS: allow any authenticated user to INSERT leads
----------------------------------------------------------------
CREATE POLICY "Allow lead creation"
  ON public.leads
  FOR INSERT
  WITH CHECK ( true );

----------------------------------------------------------------
-- 6) RLS: (optional) admin can do anything
----------------------------------------------------------------
CREATE POLICY "Allow admin access to leads"
  ON public.leads
  FOR ALL
  USING ( true );
