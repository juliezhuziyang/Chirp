-- KV store for Chirp auth, sessions, newsletter, and user profiles
-- Run in Supabase Dashboard → SQL Editor if not using `supabase db push`

CREATE TABLE IF NOT EXISTS public.kv_store_b89d4352 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Optional: enable RLS (edge function uses service role and bypasses RLS)
ALTER TABLE public.kv_store_b89d4352 ENABLE ROW LEVEL SECURITY;

-- No public policies: only service_role (edge function) should access this table

COMMENT ON TABLE public.kv_store_b89d4352 IS 'Chirp key-value store for users, sessions, newsletter';
