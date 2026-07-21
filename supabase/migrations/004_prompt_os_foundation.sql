-- Prompt OS foundation: canonical records are versioned; compiled prompts retain immutable source snapshots.
create table if not exists prompt_templates (
  id uuid primary key default gen_random_uuid(), title text not null, description text default '', category text default 'Content', content text not null,
  status text not null default 'draft' check (status in ('draft','testing','approved','needs-review','deprecated','archived')),
  version integer not null default 1, tags text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists prompt_template_versions (id uuid primary key default gen_random_uuid(), template_id uuid not null references prompt_templates(id) on delete cascade, version integer not null, snapshot jsonb not null, change_reason text, created_at timestamptz not null default now(), unique(template_id, version));
create table if not exists instruction_blocks (
  id uuid primary key default gen_random_uuid(), client_id integer references clients(id) on delete cascade, title text not null, description text default '', instruction text not null,
  category text default 'General', scope text not null, priority integer not null default 100, status text not null default 'draft', version integer not null default 1,
  tags text[] not null default '{}', compatible_tasks text[] not null default '{}', compatible_industries text[] not null default '{}', compatible_models text[] not null default '{}',
  source text, conditions jsonb not null default '[]', last_validated_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists instruction_block_versions (id uuid primary key default gen_random_uuid(), instruction_block_id uuid not null references instruction_blocks(id) on delete cascade, version integer not null, snapshot jsonb not null, change_reason text, created_at timestamptz not null default now(), unique(instruction_block_id, version));
create table if not exists context_packs (
  id uuid primary key default gen_random_uuid(), client_id integer references clients(id) on delete cascade, name text not null, description text default '', pack_type text not null,
  product_name text, priority integer not null default 100, required boolean not null default false, status text not null default 'draft', version integer not null default 1,
  asset_urls text[] not null default '{}', reference_urls text[] not null default '{}', tags text[] not null default '{}', last_validated_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists context_pack_versions (id uuid primary key default gen_random_uuid(), context_pack_id uuid not null references context_packs(id) on delete cascade, version integer not null, snapshot jsonb not null, change_reason text, created_at timestamptz not null default now(), unique(context_pack_id, version));
create table if not exists context_pack_blocks (context_pack_id uuid references context_packs(id) on delete cascade, instruction_block_id uuid references instruction_blocks(id) on delete restrict, position integer not null default 0, primary key (context_pack_id, instruction_block_id));
create table if not exists prompt_recipes (
  id uuid primary key default gen_random_uuid(), name text not null, description text default '', task_type text not null, output_type text not null,
  status text not null default 'draft', version integer not null default 1, required_inputs text[] not null default '{}', optional_inputs text[] not null default '{}', variables jsonb not null default '[]',
  required_pack_types text[] not null default '{}', default_block_ids uuid[] not null default '{}', conditional_block_ids uuid[] not null default '{}', output_schema text, evaluation_rubric_id uuid, compatible_models text[] not null default '{}', default_model text default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists prompt_recipe_versions (id uuid primary key default gen_random_uuid(), prompt_recipe_id uuid not null references prompt_recipes(id) on delete cascade, version integer not null, snapshot jsonb not null, change_reason text, created_at timestamptz not null default now(), unique(prompt_recipe_id, version));
create table if not exists quality_rubrics (id uuid primary key default gen_random_uuid(), name text not null, criteria jsonb not null default '[]', pass_threshold numeric not null default 80, status text not null default 'draft', version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists model_profiles (id uuid primary key default gen_random_uuid(), provider text not null, name text not null, family text not null, context_limit integer not null, supports_json boolean not null default false, supported_asset_types text[] not null default '{}', active boolean not null default true, version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists prompt_briefs (id uuid primary key default gen_random_uuid(), client_id integer not null references clients(id) on delete restrict, recipe_id uuid references prompt_recipes(id) on delete set null, product text, campaign text, deliverable_type text not null, platform text not null, objective text not null, audience text, content_pillar text, offer text, cta text, brief text not null, structured_data jsonb not null default '{}', asset_urls text[] not null default '{}', status text not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists compiled_prompts (id uuid primary key default gen_random_uuid(), brief_id uuid not null references prompt_briefs(id) on delete restrict, prompt text not null, resolved_variables jsonb not null default '{}', audit jsonb not null default '{}', model_profile_id uuid references model_profiles(id) on delete set null, created_at timestamptz not null default now());
create table if not exists compiled_prompt_sources (compiled_prompt_id uuid references compiled_prompts(id) on delete cascade, source_type text not null, source_id uuid not null, source_title text not null, source_version integer not null, source_snapshot text not null, primary key (compiled_prompt_id, source_type, source_id, source_version));
create table if not exists prompt_generation_runs (id uuid primary key default gen_random_uuid(), compiled_prompt_id uuid not null references compiled_prompts(id) on delete restrict, provider text, model text, status text not null default 'ready-for-generation', quality_score numeric, reviewer_feedback text default '', created_at timestamptz not null default now());

create index if not exists instruction_blocks_client_status_idx on instruction_blocks(client_id, status);
create index if not exists context_packs_client_status_idx on context_packs(client_id, status);
create index if not exists prompt_recipes_status_idx on prompt_recipes(status, updated_at desc);
create index if not exists prompt_briefs_client_created_idx on prompt_briefs(client_id, created_at desc);

alter table prompt_templates enable row level security; alter table prompt_template_versions enable row level security; alter table instruction_blocks enable row level security; alter table instruction_block_versions enable row level security; alter table context_packs enable row level security; alter table context_pack_versions enable row level security; alter table context_pack_blocks enable row level security; alter table prompt_recipes enable row level security; alter table prompt_recipe_versions enable row level security; alter table quality_rubrics enable row level security; alter table model_profiles enable row level security; alter table prompt_briefs enable row level security; alter table compiled_prompts enable row level security; alter table compiled_prompt_sources enable row level security; alter table prompt_generation_runs enable row level security;
-- Temporary authenticated-only policies. Replace with organization membership policies before production launch.
create policy "authenticated prompt templates" on prompt_templates for all to authenticated using (true) with check (true);
create policy "authenticated template versions" on prompt_template_versions for all to authenticated using (true) with check (true);
create policy "authenticated instruction blocks" on instruction_blocks for all to authenticated using (true) with check (true);
create policy "authenticated block versions" on instruction_block_versions for all to authenticated using (true) with check (true);
create policy "authenticated context packs" on context_packs for all to authenticated using (true) with check (true);
create policy "authenticated pack versions" on context_pack_versions for all to authenticated using (true) with check (true);
create policy "authenticated context pack blocks" on context_pack_blocks for all to authenticated using (true) with check (true);
create policy "authenticated prompt recipes" on prompt_recipes for all to authenticated using (true) with check (true);
create policy "authenticated recipe versions" on prompt_recipe_versions for all to authenticated using (true) with check (true);
create policy "authenticated quality rubrics" on quality_rubrics for all to authenticated using (true) with check (true);
create policy "authenticated model profiles" on model_profiles for all to authenticated using (true) with check (true);
create policy "authenticated prompt briefs" on prompt_briefs for all to authenticated using (true) with check (true);
create policy "authenticated compiled prompts" on compiled_prompts for all to authenticated using (true) with check (true);
create policy "authenticated compiled prompt sources" on compiled_prompt_sources for all to authenticated using (true) with check (true);
create policy "authenticated prompt runs" on prompt_generation_runs for all to authenticated using (true) with check (true);
