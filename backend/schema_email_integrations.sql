-- Migration: User Email Integrations (BYOK / Multi-Provider Email Outreach)
-- Supports Brevo, SendGrid, Resend, and Custom SMTP

CREATE TABLE IF NOT EXISTS public.user_email_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'brevo', -- 'brevo', 'sendgrid', 'resend', 'smtp'
    api_key TEXT,
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    
    -- Custom SMTP fields (optional)
    smtp_host VARCHAR(255),
    smtp_port INTEGER DEFAULT 587,
    smtp_user VARCHAR(255),
    smtp_pass TEXT,
    
    is_verified BOOLEAN DEFAULT false,
    last_tested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_user_email_integration UNIQUE (user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_email_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own integration
CREATE POLICY "Users can view own email integration"
    ON public.user_email_integrations
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert/update their own integration
CREATE POLICY "Users can insert own email integration"
    ON public.user_email_integrations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email integration"
    ON public.user_email_integrations
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email integration"
    ON public.user_email_integrations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_user_email_integrations_user_id ON public.user_email_integrations(user_id);
