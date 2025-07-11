-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can only view their own profile." ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON public.users
FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for business_plans table
CREATE POLICY "Users can only view their own plans." ON public.business_plans
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create plans for themselves." ON public.business_plans
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans." ON public.business_plans
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans." ON public.business_plans
FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for folders table
CREATE POLICY "Users can only view their own folders." ON public.folders
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create folders for themselves." ON public.folders
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders." ON public.folders
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders." ON public.folders
FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for ai_usage table
CREATE POLICY "Users can only view their own AI usage." ON public.ai_usage
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "AI usage can be created by authenticated users." ON public.ai_usage
FOR INSERT WITH CHECK (auth.uid() = user_id);
