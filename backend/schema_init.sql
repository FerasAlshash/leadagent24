-- =========================================================================
-- LeadAgent24: Complete Unified Database Setup Schema
-- Run this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =========================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. Profiles Table (User Metadata & Role Isolation)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'member', -- 'admin' or 'member'
    full_name TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- =========================================================================
-- 2. Campaigns Table (Multi-Campaign Workspace Management)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    business_type TEXT,
    location TEXT,
    lead_number INTEGER DEFAULT 10,
    email_style TEXT DEFAULT 'Professional',
    schedule_type TEXT DEFAULT 'once',
    is_active BOOLEAN DEFAULT true,
    sender_name TEXT,
    company_name TEXT,
    company_pitch TEXT,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own campaigns" ON public.campaigns;
CREATE POLICY "Users can view own campaigns" ON public.campaigns
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own campaigns" ON public.campaigns;
CREATE POLICY "Users can insert own campaigns" ON public.campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own campaigns" ON public.campaigns;
CREATE POLICY "Users can update own campaigns" ON public.campaigns
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.campaigns;
CREATE POLICY "Users can delete own campaigns" ON public.campaigns
    FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- 3. Leads Table (Discovered Businesses & Outbound Deliveries)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    "Company_Name" TEXT,
    "Category" TEXT,
    "Website" TEXT,
    "Phone_Nummber" TEXT,
    "Email_Address" TEXT,
    "LinkedIn" TEXT,
    "Address" TEXT,
    "Instagram" TEXT,
    "Facebook" TEXT,
    "Cold_Mail_Status" TEXT,
    "SEND_Time" TEXT,
    email_subject TEXT,
    email_body TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON public.leads(campaign_id);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
CREATE POLICY "Users can view own leads" ON public.leads
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own leads" ON public.leads;
CREATE POLICY "Users can insert own leads" ON public.leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
CREATE POLICY "Users can update own leads" ON public.leads
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;
CREATE POLICY "Users can delete own leads" ON public.leads
    FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- 4. User Email Credentials Vault (Secure BYOK Provider Storage)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.user_email_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'resend', 'brevo', 'sendgrid', 'smtp'
    api_key TEXT,
    smtp_host TEXT,
    smtp_port INTEGER DEFAULT 587,
    smtp_user TEXT,
    smtp_pass TEXT,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_email_credentials_user_id ON public.user_email_credentials(user_id);

ALTER TABLE public.user_email_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own email credentials" ON public.user_email_credentials;
CREATE POLICY "Users can view own email credentials" ON public.user_email_credentials
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own email credentials" ON public.user_email_credentials;
CREATE POLICY "Users can insert own email credentials" ON public.user_email_credentials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own email credentials" ON public.user_email_credentials;
CREATE POLICY "Users can update own email credentials" ON public.user_email_credentials
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own email credentials" ON public.user_email_credentials;
CREATE POLICY "Users can delete own email credentials" ON public.user_email_credentials
    FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- 5. Campaign Email Integrations (Per-Campaign Outbound Identity)
-- =========================================================================
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
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_campaign_email_integration UNIQUE (campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_email_integrations_campaign ON public.campaign_email_integrations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_email_integrations_user ON public.campaign_email_integrations(user_id);

ALTER TABLE public.campaign_email_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own campaign email integrations" ON public.campaign_email_integrations;
CREATE POLICY "Users can view own campaign email integrations" ON public.campaign_email_integrations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own campaign email integrations" ON public.campaign_email_integrations;
CREATE POLICY "Users can insert own campaign email integrations" ON public.campaign_email_integrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own campaign email integrations" ON public.campaign_email_integrations;
CREATE POLICY "Users can update own campaign email integrations" ON public.campaign_email_integrations
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own campaign email integrations" ON public.campaign_email_integrations;
CREATE POLICY "Users can delete own campaign email integrations" ON public.campaign_email_integrations
    FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- 6. System Settings Table (Global SaaS Configuration & Feature Flags)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on system_settings" ON public.system_settings;
CREATE POLICY "Service role full access on system_settings"
    ON public.system_settings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Default Live Prospecting Restricted Mode Setting
INSERT INTO public.system_settings (key, value)
VALUES ('prospecting_access_control', '{"restricted": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- =========================================================================
-- 7. Authorized Prospecting Users Table (Live Search Access Whitelist)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.authorized_prospecting_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_authorized_prospecting_users_email 
    ON public.authorized_prospecting_users(email);

ALTER TABLE public.authorized_prospecting_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on authorized_prospecting_users" ON public.authorized_prospecting_users;
CREATE POLICY "Service role full access on authorized_prospecting_users"
    ON public.authorized_prospecting_users
    FOR ALL
    USING (true)
    WITH CHECK (true);
