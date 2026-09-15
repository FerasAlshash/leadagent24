-- Schema for Enterprise Provider Credentials Vault & Campaign Outbound Identities
-- Run this in your Supabase SQL Editor

-- 1. Create table for user email provider credentials (vault)
CREATE TABLE IF NOT EXISTS public.user_email_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Hireley Master Resend", "Agency Brevo"
    provider TEXT NOT NULL, -- 'resend', 'brevo', 'sendgrid', 'smtp'
    api_key TEXT,
    smtp_host TEXT,
    smtp_port INTEGER DEFAULT 587,
    smtp_user TEXT,
    smtp_pass TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_email_credentials_user ON public.user_email_credentials(user_id);

-- Enable RLS
ALTER TABLE public.user_email_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own email credentials" ON public.user_email_credentials;
CREATE POLICY "Users can view own email credentials"
    ON public.user_email_credentials FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own email credentials" ON public.user_email_credentials;
CREATE POLICY "Users can insert own email credentials"
    ON public.user_email_credentials FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own email credentials" ON public.user_email_credentials;
CREATE POLICY "Users can update own email credentials"
    ON public.user_email_credentials FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own email credentials" ON public.user_email_credentials;
CREATE POLICY "Users can delete own email credentials"
    ON public.user_email_credentials FOR DELETE
    USING (auth.uid() = user_id);

-- 2. Update campaign_email_integrations to reference credential_id optionally
ALTER TABLE public.campaign_email_integrations 
    ADD COLUMN IF NOT EXISTS credential_id UUID REFERENCES public.user_email_credentials(id) ON DELETE SET NULL;
