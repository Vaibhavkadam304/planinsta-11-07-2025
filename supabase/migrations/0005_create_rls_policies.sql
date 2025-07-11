-- 0005_create_rls_policies.sql

----------------------------------------------------------------
-- 0) Enable RLS on all of our tables
----------------------------------------------------------------
ALTER TABLE IF EXISTS public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.folders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_usage       ENABLE ROW LEVEL SECURITY;

----------------------------------------------------------------
-- 1) RLS policies for public.users
----------------------------------------------------------------
-- Drop any existing policies so CREATE never fails
DROP POLICY IF EXISTS "Users can only view their own profile."  ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile."    ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile."    ON public.users;

-- Allow signed-in users to select their own row, or the service_role (for sync trigger)
CREATE POLICY "Users can only view their own profile."
  ON public.users
  FOR SELECT
  USING (
    auth.uid() = id
    OR auth.role() = 'service_role'
  );

-- Allow signed-in users to INSERT their own row, or the service_role
CREATE POLICY "Users can create their own profile."
  ON public.users
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
    OR auth.role() = 'service_role'
  );

-- Allow signed-in users to UPDATE their own row, or the service_role
CREATE POLICY "Users can update their own profile."
  ON public.users
  FOR UPDATE
  USING (
    auth.uid() = id
    OR auth.role() = 'service_role'
  );

----------------------------------------------------------------
-- 2) RLS policies for public.business_plans
----------------------------------------------------------------
DROP POLICY IF EXISTS "Users can only view their own plans."    ON public.business_plans;
DROP POLICY IF EXISTS "Users can create plans for themselves."  ON public.business_plans;
DROP POLICY IF EXISTS "Users can update their own plans."       ON public.business_plans;
DROP POLICY IF EXISTS "Users can delete their own plans."       ON public.business_plans;

CREATE POLICY "Users can only view their own plans."
  ON public.business_plans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create plans for themselves."
  ON public.business_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans."
  ON public.business_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans."
  ON public.business_plans
  FOR DELETE
  USING (auth.uid() = user_id);

----------------------------------------------------------------
-- 3) RLS policies for public.folders
----------------------------------------------------------------
DROP POLICY IF EXISTS "Users can only view their own folders."    ON public.folders;
DROP POLICY IF EXISTS "Users can create folders for themselves."  ON public.folders;
DROP POLICY IF EXISTS "Users can update their own folders."       ON public.folders;
DROP POLICY IF EXISTS "Users can delete their own folders."       ON public.folders;

CREATE POLICY "Users can only view their own folders."
  ON public.folders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create folders for themselves."
  ON public.folders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders."
  ON public.folders
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders."
  ON public.folders
  FOR DELETE
  USING (auth.uid() = user_id);

----------------------------------------------------------------
-- 4) RLS policies for public.ai_usage
----------------------------------------------------------------
DROP POLICY IF EXISTS "Users can only view their own AI usage."     ON public.ai_usage;
DROP POLICY IF EXISTS "AI usage can be created by authenticated users." ON public.ai_usage;

CREATE POLICY "Users can only view their own AI usage."
  ON public.ai_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "AI usage can be created by authenticated users."
  ON public.ai_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
