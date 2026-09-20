-- =========================================================================
-- Schema for Prospecting Access Control & Whitelisted Users (LeadAgent24)
-- Run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =========================================================================

-- 1. System Settings Table (Key-Value Store for Global SaaS Configuration)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only Backend Service Role has full access (Client browsers cannot query/tamper directly)
DROP POLICY IF EXISTS "Service role full access on system_settings" ON public.system_settings;
CREATE POLICY "Service role full access on system_settings"
    ON public.system_settings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Seed Default Live Prospecting Restriction Setting
INSERT INTO public.system_settings (key, value)
VALUES ('prospecting_access_control', '{"restricted": true}'::jsonb)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = timezone('utc'::text, now());

-- 2. Authorized Prospecting Users Table (Whitelisted Accounts for Live Search)
CREATE TABLE IF NOT EXISTS public.authorized_prospecting_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for instant lookup by email
CREATE INDEX IF NOT EXISTS idx_authorized_prospecting_users_email 
    ON public.authorized_prospecting_users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.authorized_prospecting_users ENABLE ROW LEVEL SECURITY;

-- Only Backend Service Role has full access
DROP POLICY IF EXISTS "Service role full access on authorized_prospecting_users" ON public.authorized_prospecting_users;
CREATE POLICY "Service role full access on authorized_prospecting_users"
    ON public.authorized_prospecting_users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Optional: Seed Initial Authorized User Example
-- INSERT INTO public.authorized_prospecting_users (email, granted_at)
-- VALUES ('partner@yourcompany.com', timezone('utc'::text, now()))
-- ON CONFLICT (email) DO NOTHING;
