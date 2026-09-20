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

-- 2. Create or update campaign_email_integrations
CREATE TABLE IF NOT EXISTS public.campaign_email_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credential_id UUID REFERENCES public.user_email_credentials(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'resend',
    api_key TEXT,
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    smtp_host VARCHAR(255),
    smtp_port INTEGER DEFAULT 587,
    smtp_user VARCHAR(255),
    smtp_pass TEXT,
    is_verified BOOLEAN DEFAULT false,
    last_tested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_campaign_email_integration UNIQUE (campaign_id)
);

ALTER TABLE public.campaign_email_integrations ENABLE ROW LEVEL SECURITY;

-- Ensure credential_id column exists if table already existed
ALTER TABLE public.campaign_email_integrations 
    ADD COLUMN IF NOT EXISTS credential_id UUID REFERENCES public.user_email_credentials(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "Users can manage own campaign email integration" ON public.campaign_email_integrations;
CREATE POLICY "Users can manage own campaign email integration"
    ON public.campaign_email_integrations FOR ALL
    USING (auth.uid() = user_id);
