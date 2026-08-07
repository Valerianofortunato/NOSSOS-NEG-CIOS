-- SUPABASE DATABASE SCHEMA FOR "NOSSOS NEGÓCIOS"
-- Paste this script into your Supabase SQL Editor (Dashboard > SQL Editor) to initialize all tables and storage buckets.

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  account_type TEXT DEFAULT 'cliente',
  referral_code TEXT,
  referrals_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  avatar TEXT,
  rating NUMERIC DEFAULT 5,
  ratings_count INT DEFAULT 0,
  wallet_balance NUMERIC DEFAULT 0,
  password TEXT,
  company_info JSONB,
  professional_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_phone TEXT,
  seller_avatar TEXT,
  seller_is_verified BOOLEAN DEFAULT FALSE,
  seller_account_type TEXT DEFAULT 'cliente',
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_promoted BOOLEAN DEFAULT FALSE,
  promotion_tier TEXT,
  likes INT DEFAULT 0,
  liked_by TEXT[] DEFAULT '{}',
  comments JSONB DEFAULT '[]',
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  messages_count INT DEFAULT 0,
  custom_commission_percentage NUMERIC,
  custom_commission_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 4. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  product_title TEXT,
  product_price NUMERIC,
  product_image TEXT,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_avatar TEXT,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_avatar TEXT,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  is_read_by_buyer BOOLEAN DEFAULT FALSE,
  is_read_by_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT,
  text TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  target_user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. USER RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_ratings (
  id TEXT PRIMARY KEY,
  target_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  rating NUMERIC NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMMISSION NEGOTIATIONS TABLE
CREATE TABLE IF NOT EXISTS public.commission_negotiations (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  requested_percentage NUMERIC NOT NULL,
  justification TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  product_title TEXT NOT NULL,
  product_price NUMERIC NOT NULL,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  commission_percentage NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  seller_payout NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PAYMENT ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_title TEXT NOT NULL,
  target_id TEXT,
  proof_file_url TEXT,
  proof_notes TEXT,
  reference_code TEXT,
  invoice_number TEXT,
  status TEXT DEFAULT 'pending',
  invoice_status TEXT DEFAULT 'ready_for_billing',
  history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AD CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  target_url TEXT,
  placement TEXT NOT NULL,
  duration_months INT DEFAULT 1,
  price NUMERIC NOT NULL,
  proof_image TEXT,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. KYC SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  doc_front TEXT,
  doc_back TEXT,
  selfie TEXT,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_title TEXT,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. JOB CANDIDACIES TABLE
CREATE TABLE IF NOT EXISTS public.job_candidacies (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  candidate_phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'Pendente',
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- Option 1: Disable RLS for simple, error-free anonymous access (Recommended)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_negotiations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_candidacies DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want RLS enabled, uncomment the block below:
/*
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
      'profiles', 'products', 'favorites', 'conversations', 'chat_messages',
      'notifications', 'user_ratings', 'commission_negotiations', 'transactions',
      'payment_orders', 'ad_campaigns', 'kyc_submissions', 'reports', 'job_candidacies'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow public full access" ON public.%I;', tbl);
        EXECUTE format('CREATE POLICY "Allow public full access" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);', tbl);
    END LOOP;
END $$;
*/

-- STORAGE BUCKETS SETUP (OPTIONAL)
-- Creates default storage buckets if storage extension is active
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) VALUES 
    ('avatars', 'avatars', true),
    ('products', 'products', true),
    ('companies', 'companies', true),
    ('documents', 'documents', true),
    ('banners', 'banners', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
EXCEPTION WHEN OTHERS THEN
  -- Safe fallback if storage schema permissions differ in your Supabase project
  NULL;
END $$;

