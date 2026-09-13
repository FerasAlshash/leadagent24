-- SQL Migration to support Full SaaS Multi-Campaigns
-- Run this if you want to persist sender info on the campaign table:
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS company_pitch TEXT;
