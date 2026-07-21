-- Remove superseded permissive child-record policies from the initial Prompt OS migration.
drop policy if exists "authenticated template versions" on prompt_template_versions;
drop policy if exists "authenticated block versions" on instruction_block_versions;
drop policy if exists "authenticated pack versions" on context_pack_versions;
drop policy if exists "authenticated context pack blocks" on context_pack_blocks;
drop policy if exists "authenticated recipe versions" on prompt_recipe_versions;
drop policy if exists "authenticated compiled prompt sources" on compiled_prompt_sources;

-- Organization bootstrap now runs only in the JWT-protected Edge Function.
revoke all on function public.bootstrap_organization(text) from public, anon, authenticated;
drop function public.bootstrap_organization(text);
revoke all on function public.get_gemini_api_key() from public, anon, authenticated;

-- Explicitly index the relationships used by the cloud sync paths.
create index if not exists tasks_client_idx on tasks(client_id);
create index if not exists posts_client_idx on posts(client_id);
create index if not exists onboarding_protocols_client_idx on onboarding_protocols(client_id);
create index if not exists project_phases_client_idx on project_phases(client_id);
create index if not exists client_updates_client_idx on client_updates(client_id);
create index if not exists compiled_prompts_brief_idx on compiled_prompts(brief_id);
create index if not exists compiled_prompts_model_idx on compiled_prompts(model_profile_id);
create index if not exists compiled_sources_prompt_idx on compiled_prompt_sources(compiled_prompt_id);
create index if not exists pack_blocks_block_idx on context_pack_blocks(instruction_block_id);
