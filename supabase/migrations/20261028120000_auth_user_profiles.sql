-- Link public.users rows to Supabase anonymous/authenticated users.
-- Apply only after reviewing existing hosted policies and confirming that
-- public.users.email may be nullable for anonymous demo profiles.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_user_id uuid
    REFERENCES auth.users (id) ON DELETE CASCADE;

ALTER TABLE public.users
  ALTER COLUMN email DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_auth_user_id_idx
  ON public.users (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.users FROM anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.users TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Authenticated users can read their own user row'
  ) THEN
    CREATE POLICY "Authenticated users can read their own user row"
      ON public.users
      FOR SELECT TO authenticated
      USING ((select auth.uid()) = auth_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Authenticated users can insert their own user row'
  ) THEN
    CREATE POLICY "Authenticated users can insert their own user row"
      ON public.users
      FOR INSERT TO authenticated
      WITH CHECK ((select auth.uid()) = auth_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Authenticated users can update their own user row'
  ) THEN
    CREATE POLICY "Authenticated users can update their own user row"
      ON public.users
      FOR UPDATE TO authenticated
      USING ((select auth.uid()) = auth_user_id)
      WITH CHECK ((select auth.uid()) = auth_user_id);
  END IF;
END
$$;
