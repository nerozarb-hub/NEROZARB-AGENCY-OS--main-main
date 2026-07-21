-- A single shared workspace key is stored encrypted in Vault and is only readable by Edge Functions.
create or replace function public.get_workspace_access_key()
returns text language sql stable security definer set search_path = vault, public as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'workspace_access_key' limit 1;
$$;
revoke all on function public.get_workspace_access_key() from public, anon, authenticated;
grant execute on function public.get_workspace_access_key() to service_role;

select vault.create_secret(
  'AC-82-AF-53-16-45-81-8E-D3-8C',
  'workspace_access_key',
  'NEROZARB shared workspace access key'
)
where not exists (select 1 from vault.secrets where name = 'workspace_access_key');
