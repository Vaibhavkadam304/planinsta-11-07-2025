CREATE TABLE IF NOT EXISTS public.ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    user_id UUID REFERENCES public.users(id) NOT NULL,
    plan_id UUID REFERENCES public.business_plans(id),
    model_used TEXT,
    tokens_used INTEGER,
    cost NUMERIC
);
