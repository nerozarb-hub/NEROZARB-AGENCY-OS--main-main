-- Migration 003 granted anon SELECT on clients/project_phases/client_updates with
-- `USING (true)` and a comment admitting "the actual filtering is done in the
-- frontend query" — meaning any caller with the public anon key could read every
-- client's full record (contract value, contact info, strategy notes), not just
-- the row matching a magic link token. RLS cannot conditionally scope by
-- "whatever the client happened to filter by" — filtering by token must happen
-- server-side. The client-portal-data Edge Function now does that with the
-- service_role key, so anonymous direct table access is no longer needed at all.

DROP POLICY IF EXISTS "Allow public read by magic link token" ON clients;
DROP POLICY IF EXISTS "Allow public read by magic link token" ON project_phases;
DROP POLICY IF EXISTS "Allow public read by magic link token" ON client_updates;
