-- Production isolation, authenticated collaboration, and realtime sync.
-- This migration assumes 001–004 have been applied to a new project.
create schema if not exists private;
revoke all on schema private from public;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
create table if not exists organization_members (
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','prompt_architect','reviewer','operator','client')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index if not exists organization_members_user_idx on organization_members(user_id, organization_id);

create or replace function private.has_org_access(target_org uuid)
returns boolean language sql stable security definer set search_path = public, private as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_org and user_id = (select auth.uid())
  );
$$;
revoke all on function private.has_org_access(uuid) from public;
grant execute on function private.has_org_access(uuid) to authenticated;

create or replace function public.bootstrap_organization(org_name text default 'NEROZARB')
returns uuid language plpgsql security definer set search_path = public as $$
declare existing_org uuid; new_org uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  select organization_id into existing_org from organization_members where user_id = (select auth.uid()) limit 1;
  if existing_org is not null then return existing_org; end if;
  insert into organizations(name) values (coalesce(nullif(trim(org_name), ''), 'NEROZARB')) returning id into new_org;
  insert into organization_members(organization_id, user_id, role) values (new_org, (select auth.uid()), 'admin');
  return new_org;
end;
$$;
revoke all on function public.bootstrap_organization(text) from public;
grant execute on function public.bootstrap_organization(text) to authenticated;

-- Every operational record belongs to exactly one organization. The trigger fills it for authenticated browser writes.
alter table clients add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table tasks add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table posts add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table protocols add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table onboarding_protocols add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table project_phases add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table client_updates add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table settings add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table prompt_templates add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table instruction_blocks add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table context_packs add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table prompt_recipes add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table quality_rubrics add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table model_profiles add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table prompt_briefs add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table compiled_prompts add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table prompt_generation_runs add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table tasks add column if not exists compiled_prompt_id uuid references compiled_prompts(id) on delete set null;
alter table posts alter column linked_prompt_id type uuid using null;
alter table posts add constraint posts_compiled_prompt_fk foreign key (linked_prompt_id) references compiled_prompts(id) on delete set null;

create or replace function private.assign_organization_id()
returns trigger language plpgsql security definer set search_path = public, private as $$
begin
  if new.organization_id is null then
    select organization_id into new.organization_id from organization_members where user_id = (select auth.uid()) limit 1;
  end if;
  if new.organization_id is null then raise exception 'No organization membership found'; end if;
  return new;
end;
$$;
revoke all on function private.assign_organization_id() from public;

do $$ declare tbl text;
begin
  foreach tbl in array array['clients','tasks','posts','protocols','onboarding_protocols','project_phases','client_updates','settings','prompt_templates','instruction_blocks','context_packs','prompt_recipes','quality_rubrics','model_profiles','prompt_briefs','compiled_prompts','prompt_generation_runs'] loop
    execute format('drop trigger if exists assign_organization_%I on public.%I', tbl, tbl);
    execute format('create trigger assign_organization_%I before insert on public.%I for each row execute function private.assign_organization_id()', tbl, tbl);
    execute format('create index if not exists %I on public.%I(organization_id)', tbl || '_organization_idx', tbl);
  end loop;
end $$;

-- Replace permissive policies from the starter schema with organization membership policies.
do $$ declare tbl text; policy_name text;
begin
  foreach tbl in array array['clients','tasks','posts','protocols','onboarding_protocols','project_phases','client_updates','settings','prompt_templates','instruction_blocks','context_packs','prompt_recipes','quality_rubrics','model_profiles','prompt_briefs','compiled_prompts','prompt_generation_runs'] loop
    for policy_name in select policyname from pg_policies where schemaname = 'public' and tablename = tbl loop
      execute format('drop policy if exists %I on public.%I', policy_name, tbl);
    end loop;
    execute format('create policy %I on public.%I for select to authenticated using ((select private.has_org_access(organization_id)))', tbl || '_select_member', tbl);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select private.has_org_access(organization_id)))', tbl || '_insert_member', tbl);
    execute format('create policy %I on public.%I for update to authenticated using ((select private.has_org_access(organization_id))) with check ((select private.has_org_access(organization_id)))', tbl || '_update_member', tbl);
    execute format('create policy %I on public.%I for delete to authenticated using ((select private.has_org_access(organization_id)))', tbl || '_delete_member', tbl);
  end loop;
end $$;

alter table organizations enable row level security;
alter table organization_members enable row level security;
create policy organizations_select_member on organizations for select to authenticated using ((select private.has_org_access(id)));
create policy memberships_select_self on organization_members for select to authenticated using (user_id = (select auth.uid()));

-- Child Prompt OS records inherit access from their parent source record.
alter table prompt_template_versions enable row level security;
alter table instruction_block_versions enable row level security;
alter table context_pack_versions enable row level security;
alter table context_pack_blocks enable row level security;
alter table prompt_recipe_versions enable row level security;
alter table compiled_prompt_sources enable row level security;
create policy template_versions_member on prompt_template_versions for all to authenticated using (exists (select 1 from prompt_templates t where t.id = template_id and (select private.has_org_access(t.organization_id)))) with check (exists (select 1 from prompt_templates t where t.id = template_id and (select private.has_org_access(t.organization_id))));
create policy block_versions_member on instruction_block_versions for all to authenticated using (exists (select 1 from instruction_blocks b where b.id = instruction_block_id and (select private.has_org_access(b.organization_id)))) with check (exists (select 1 from instruction_blocks b where b.id = instruction_block_id and (select private.has_org_access(b.organization_id))));
create policy pack_versions_member on context_pack_versions for all to authenticated using (exists (select 1 from context_packs p where p.id = context_pack_id and (select private.has_org_access(p.organization_id)))) with check (exists (select 1 from context_packs p where p.id = context_pack_id and (select private.has_org_access(p.organization_id))));
create policy pack_blocks_member on context_pack_blocks for all to authenticated using (exists (select 1 from context_packs p where p.id = context_pack_id and (select private.has_org_access(p.organization_id)))) with check (exists (select 1 from context_packs p where p.id = context_pack_id and (select private.has_org_access(p.organization_id))));
create policy recipe_versions_member on prompt_recipe_versions for all to authenticated using (exists (select 1 from prompt_recipes r where r.id = prompt_recipe_id and (select private.has_org_access(r.organization_id)))) with check (exists (select 1 from prompt_recipes r where r.id = prompt_recipe_id and (select private.has_org_access(r.organization_id))));
create policy compiled_sources_member on compiled_prompt_sources for select to authenticated using (exists (select 1 from compiled_prompts p where p.id = compiled_prompt_id and (select private.has_org_access(p.organization_id))));

-- Explicit Data API grants are required for newer Supabase projects.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Private, organization-scoped asset bucket.
insert into storage.buckets(id, name, public) values ('prompt-assets', 'prompt-assets', false) on conflict (id) do nothing;
create policy prompt_assets_member_select on storage.objects for select to authenticated using (bucket_id = 'prompt-assets' and (select private.has_org_access((storage.foldername(name))[1]::uuid)));
create policy prompt_assets_member_insert on storage.objects for insert to authenticated with check (bucket_id = 'prompt-assets' and (select private.has_org_access((storage.foldername(name))[1]::uuid)));
create policy prompt_assets_member_update on storage.objects for update to authenticated using (bucket_id = 'prompt-assets' and (select private.has_org_access((storage.foldername(name))[1]::uuid))) with check (bucket_id = 'prompt-assets' and (select private.has_org_access((storage.foldername(name))[1]::uuid)));
create policy prompt_assets_member_delete on storage.objects for delete to authenticated using (bucket_id = 'prompt-assets' and (select private.has_org_access((storage.foldername(name))[1]::uuid)));

-- Realtime is opt-in per table.
alter publication supabase_realtime add table clients, tasks, posts, protocols, onboarding_protocols, prompt_templates, instruction_blocks, context_packs, prompt_recipes, quality_rubrics, model_profiles, prompt_briefs, compiled_prompts, prompt_generation_runs;
