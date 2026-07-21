-- Gemini provider key is encrypted in Supabase Vault and can only be read by server-side secret-key clients.
create or replace function public.get_gemini_api_key()
returns text language sql stable security definer set search_path = vault, public as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'gemini_api_key' limit 1;
$$;
revoke all on function public.get_gemini_api_key() from public;
grant execute on function public.get_gemini_api_key() to service_role;
