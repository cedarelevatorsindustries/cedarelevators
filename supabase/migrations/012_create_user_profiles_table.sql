-- Migration: Create user_profiles table
-- This table stores user profile information synced from Clerk

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  account_type TEXT DEFAULT 'individual' CHECK (account_type IN ('individual', 'business')),
  company_name TEXT,
  tax_id TEXT,
  is_verified BOOLEAN DEFAULT false,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON public.user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON public.user_profiles(account_type);

-- Add comments
COMMENT ON TABLE public.user_profiles IS 'User profile information synced from Clerk authentication';
COMMENT ON COLUMN public.user_profiles.clerk_user_id IS 'Clerk user ID (unique identifier from Clerk)';
COMMENT ON COLUMN public.user_profiles.account_type IS 'Type of account: individual or business';
COMMENT ON COLUMN public.user_profiles.is_verified IS 'Whether the business account is verified';

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Create policy to allow authenticated users to insert their profile
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');
