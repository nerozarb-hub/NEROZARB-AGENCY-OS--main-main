# Prompt OS production foundation

## Current architecture audit

- The React client owns the operating state through `AppDataContext` and persists it in browser storage.
- Existing Supabase sync covers clients, tasks, posts, protocols, onboarding, and settings only.
- Prompt Studio previously stored templates, blocks, packs, briefs, compiled prompts, and runs only in the browser.
- The Express server currently exposes only `/ping`; it does not compile prompts, call providers, or enforce permissions.
- Authentication still accepts hard-coded frontend passphrases. This is not production authentication.

## Shipped foundation

- Expanded governed Prompt OS types: typed variables, conditions, priority, scopes, model profiles, rubrics, audit reports, and immutable source snapshots.
- Added deterministic Recipe recommendation, context selection, variable resolution, compilation, claim checks, duplicate checks, conflict checks, asset checks, and readiness scoring.
- Added a Supabase migration for Prompt OS canonical records, relationship tables, compiled snapshots, source-version records, model profiles, rubrics, and generation runs.
- The Composer now shows a deterministic recommended Recipe and blocks linked task creation when the audit has blocking errors.

## Migration safety

The new browser data fields default to empty arrays. Existing templates, blocks, packs, briefs, compiled prompts, and generation runs remain intact. The SQL migration creates new tables only and does not alter or delete existing operational records.

## Production risks still requiring infrastructure work

1. Apply `004_prompt_os_foundation.sql` to the target Supabase project.
2. Replace the temporary authenticated-user RLS policies with organization membership policies.
3. Move compilation, provider calls, and authorization to server-side endpoints before enabling AI execution.
4. Replace hard-coded passphrases with Supabase Auth and role claims.
5. Add Prompt OS repository sync and server-side immutable version creation after the migration is applied.

## QA report

Validated locally on 2026-07-20:

- TypeScript type check: passed.
- Production Vite build: passed.
- Local application health at `http://localhost:3000`: HTTP 200.
- Compiler smoke checks: variable resolution, unresolved-variable detection, required-field detection, and claim warnings: passed.

Known deployment gate: this workspace is not linked to a Supabase project in the available environment, so the migration has been created and validated structurally but has not been applied remotely.

## Implementation sequence

1. Foundation: governed data model, deterministic compiler, audit, migration. **Shipped locally.**
2. Library: Recipe, Context Pack, Block, Rubric, and Model Profile builders with draft-review-approve workflow.
3. Composer: structured brief parser, missing-field workflow, asset management, and model selection.
4. Integration: prefill from Content OS/Fulfillment, attach compiled snapshots to posts and tasks, client context panel.
5. Quality Lab: evaluations, output revisions, test cases, metrics, and secured provider execution.
