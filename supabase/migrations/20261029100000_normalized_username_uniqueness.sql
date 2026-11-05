-- Read-only preflight to run before applying the index:
-- SELECT lower(btrim(username)) AS normalized_username,
--        count(*) AS row_count,
--        array_agg(id ORDER BY id) AS user_ids
-- FROM public.users
-- WHERE nullif(btrim(username), '') IS NOT NULL
-- GROUP BY lower(btrim(username))
-- HAVING count(*) > 1
-- ORDER BY normalized_username;
-- Resolve any reported rows manually; this migration never deletes or merges accounts.

-- Enforce case-insensitive, surrounding-whitespace-insensitive uniqueness.
-- Existing duplicate rows will cause this statement to fail safely.
CREATE UNIQUE INDEX IF NOT EXISTS users_username_normalized_idx
  ON public.users (lower(btrim(username)))
  WHERE nullif(btrim(username), '') IS NOT NULL;
