-- Real per-person identity. Tasks/posts currently assign work to a `node_role`
-- job-title enum (see 001_initial_schema.sql) with no link to an actual human —
-- "My Tasks" cannot know who "me" is because nothing in the schema represents a
-- person below the organization_members row. This migration adds `team_members`
-- as the assignment target and additive `assignee_id`/`reviewer_id` columns on
-- tasks/posts. `assigned_node`/`assigned_to` (NodeRole) are kept, unchanged, as a
-- legacy/skill-tag field during the transition — nothing is dropped here.

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  avatar_url text,
  role text not null default 'employee' check (role in ('admin','manager','employee','sales','client')),
  department text,
  weekly_capacity_hours numeric not null default 40,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists team_members_organization_idx on team_members(organization_id);
create unique index if not exists team_members_user_idx on team_members(user_id) where user_id is not null;

alter table tasks add column if not exists assignee_id uuid references team_members(id) on delete set null;
alter table tasks add column if not exists reviewer_id uuid references team_members(id) on delete set null;
alter table posts add column if not exists assignee_id uuid references team_members(id) on delete set null;
create index if not exists tasks_assignee_idx on tasks(assignee_id);
create index if not exists posts_assignee_idx on posts(assignee_id);

alter table team_members enable row level security;

drop trigger if exists assign_organization_team_members on public.team_members;
create trigger assign_organization_team_members before insert on public.team_members
  for each row execute function private.assign_organization_id();

create policy "org members can view team" on team_members for select to authenticated
  using (private.has_org_access(organization_id));
create policy "org members can insert team" on team_members for insert to authenticated
  with check (private.has_org_access(organization_id));
create policy "org members can update team" on team_members for update to authenticated
  using (private.has_org_access(organization_id)) with check (private.has_org_access(organization_id));
create policy "org members can delete team" on team_members for delete to authenticated
  using (private.has_org_access(organization_id));

alter publication supabase_realtime add table team_members;
