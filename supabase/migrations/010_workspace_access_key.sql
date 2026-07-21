-- A single shared workspace key is stored encrypted in Vault and is only readable by Edge Functions.
create or replace function public.get_workspace_access_key()
returns text language sql stable security definer set search_path = vault, public as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'workspace_access_key' limit 1;
$$;
revoke all on function public.get_workspace_access_key() from public, anon, authenticated;
grant execute on function public.get_workspace_access_key() to service_role;

-- The actual key is configured directly in Supabase Vault as `workspace_access_key`.
-- Never commit an access key to source control or browser environment variables.
