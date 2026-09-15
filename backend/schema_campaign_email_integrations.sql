-- Migration: Campaign-Level Email Integrations (Multi-Brand / Multi-Domain Outreach)
-- Allows individual campaigns to override workspace-level email settings.

CREATE TABLE IF NOT EXISTS public.campaign_email_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'resend', -- 'brevo', 'sendgrid', 'resend', 'smtp'
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
    
    CONSTRAINT unique_campaign_email_integration UNIQUE (campaign_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.campaign_email_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own campaign email integration"
    ON public.campaign_email_integrations
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaign email integration"
    ON public.campaign_email_integrations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaign email integration"
    ON public.campaign_email_integrations
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaign email integration"
    ON public.campaign_email_integrations
    FOR DELETE
    USING (auth.uid() = user_id);
