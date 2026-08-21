# NEROZARB Agency OS — Transformation Plan

Phase 0 output. Written before any implementation. Source: full repository audit (App.tsx, layout, ui primitives, AppDataContext, storage.ts, supabaseSync.ts, all `src/views/*`, all `supabase/migrations/*`, `supabase/functions/*`, existing docs).

---

## 1. Current-State Architecture

- **Frontend**: React 19 + Vite 6 + TS 5.8, no router — a single `activeView` string in `App.tsx` swaps between lazy-loaded views (Command Center, Client OS, Fulfillment OS, Content OS, Prompt Studio, Onboarding OS, Portal OS via a manual `/portal/:token` path check). No URL state; refresh always returns to Overview.
- **State**: one `AppDataContext` holding a flat `AppData` object (`clients[], tasks[], posts[], onboardings[], protocols[]` + 9 Prompt OS collections). ~20 mutator functions do optimistic local updates then fire-and-forget Supabase syncs — no rollback, no conflict resolution, last-write-wins.
- **Persistence**: `localStorage` (`nerozarb-os-v2`) is the primary read path on load; Supabase is synced in bulk on every debounced (500ms) state change, and a realtime subscription across 14 tables just triggers a full refetch on any change (no row-level diffing).
- **Auth**: one shared "workspace key," validated by an Edge Function that mints a throwaway anonymous Supabase Auth user per login (`*@access.nerozarb.invalid`), all mapped to one singleton `organizations` row, all granted `role: 'admin'`. There is no per-person identity anywhere in the system. A client-only `authLevel` session flag (never server-verified) fakes a CEO/Team distinction that RLS does not enforce and that any user can override via devtools.
- **Data model**: `Client` doubles as both CRM record and paying-account record (no separate Lead/Opportunity). `Task`/`Post` assign work to a `NodeRole` job-title enum, not a person. No `Invoice`/`Payment`/`TeamMember` tables exist anywhere in the 10 migrations.
- **Two ID strategies coexist**: legacy entities use a client-computed `maxId + 1` (race-prone, collides across tabs/users) sent explicitly into Postgres `SERIAL` columns; Prompt OS entities correctly use `crypto.randomUUID()` against `uuid` PKs with `gen_random_uuid()` defaults. The Prompt OS pattern is the one to standardize on.
- **Prompt OS / AI**: the newest and best-built subsystem — deterministic prompt compilation, versioned templates/blocks/packs/recipes, audit trail, server-side Gemini proxy via Edge Function (`gemini-generate`) so no API key reaches the browser. This is the architectural template the rest of the app should follow.
- **Multi-tenancy**: migration `005` added real `organizations`/`organization_members` with `has_org_access()`-scoped RLS — a legitimate org-isolation layer. But `organization_members.role` has 5 declared values and only `'admin'` is ever assigned; there is no user-level permission distinction within an org.

## 2. Current UX Problems

- CEO dashboard ("Cash Collected," "Friction Alerts," etc.) is built on client-side reduces over static fields, not real events — see Revenue Leaks below.
- "My Tasks" (`MyTasksView.tsx`) filters by a `sessionStorage` key (`nodeRole`) that is **never written anywhere in the codebase** — it silently always shows the hardcoded fallback assignee's tasks to every single user, regardless of who they are.
- Navigation is module-oriented (6 flat items including "Prompt Studio" and "Setup" at equal visual weight to "Clients" and "Tasks") rather than outcome-oriented.
- Two independent, disagreeing client-health formulas exist (`RosterView.tsx` 3-bucket enum vs. `ClientDetailView.tsx` 0–100 score).
- `ClientDetailView.tsx` ships hard-coded fake placeholder content cards ("Content Pipeline Preview") that are not wired to real data.
- Task and Post pipelines are two independent 6-stage/8-stage state machines for conceptually similar "work moving through approval" flows — no shared vocabulary.
- No design-system primitives for table, select/combobox, avatar, date picker, tabs, pagination — every view hand-rolls its own list/table markup.
- Terminology throughout leans toward internal jargon ("NodeRole," "Revenue Gate," "Shadow Avatar" surfaced directly in client-facing UI) rather than plain operational language.

## 3. Revenue Leaks (current state)

- **No invoice/payment tracking exists at all.** "Cash Collected" on the CEO dashboard is `sum(contractValue || ltv)` across active clients — a static, hand-entered snapshot, not actual received payments. It cannot represent partial payments, refunds, or what's actually outstanding.
- **No Lead/Opportunity entity** — `Client.status` doubles as pipeline stage and account status. There's no deal value forecasting, no expected-close-date, no source attribution, no win/loss tracking, no follow-up-date enforcement. Leads can silently go stale with nothing surfacing it.
- **Client portal is broken for cross-device use**: `addProjectPhase`/`addClientUpdate` write to local state but the sync layer explicitly strips `projectPhases`/`clientUpdates` before writing to Supabase — so a client opening their magic-link portal on a different device than the one that posted the update sees nothing new. This directly undermines client-facing communication, a retention lever.
- **Multiple dashboard KPIs are silently broken** due to case-mismatched string comparisons (`'Deployed'` vs `'deployed'`, `'Published'` vs `'PUBLISHED'`, nonexistent values like `'Completed'`/`'done'`/`'medium'`) — nav badges, "Friction Alerts," "Open tasks," and per-client health scores all miscalculate. A CEO trusting these numbers is making decisions on wrong data.
- **RLS gap on the client portal**: the `clients` table grants anonymous `SELECT` with `USING (true)` — any caller with API access can read every client row, not just the one matching their magic-link token. This is a real data-exposure risk, not just a UX bug.

## 4. Workflow Problems

- **No real team-member identity anywhere** — tasks/posts assign to a 6-value `NodeRole` job-title enum (`storage.ts:22`), the DB schema mirrors this as a Postgres enum column rather than a `user_id` FK, and even after org-level auth was added in migration 005, `tasks`/`posts` were never connected to `organization_members`. Workload, accountability, and "my work" views are structurally impossible until this changes.
- **Every org member is `admin`** — there is no manager/employee/sales/client role distinction enforced at the data layer. The app-level CEO/Team toggle is UI-only and trivially bypassable.
- Onboarding steps have an `owner: 'CEO' | 'Team'` binary, not a person — same identity-collapse problem one level down.
- No blocker/waiting-state tracking distinct from status — a stuck task looks identical to a healthy in-progress one until its deadline passes.
- No project/sprint layer between Client and Task — sprints are auto-generated as a flat batch of 7 tasks with no umbrella entity to track overall progress/health.

## 5. Proposed Information Architecture

Outcome-oriented top-level navigation, replacing the current 6 flat module-based items:

1. **Home** — role-aware landing (CEO Action Center / Employee My Work / Manager team view / Sales follow-up queue)
2. **Sales** — leads, opportunities, pipeline, follow-up queue
3. **Clients** — unified client workspace (overview, projects, tasks, content, files, timeline, money, portal, notes)
4. **Work** — projects, tasks, content (task and content pipelines share vocabulary/status model)
5. **Team** — people, workload, capacity, performance

Secondary utilities demoted under Tools/Settings/contextual links rather than top-level nav: Prompt Library (was Prompt Studio), SOP Library (was Knowledge Vault/Protocols), Settings. Onboarding moves inside the Client workspace rather than being a standalone module. Client Portal stays a separate token-gated surface (unchanged entry point) but its data-completeness bug (§3) gets fixed as part of the Client entity work.

## 6. New Database Entities Required

All new tables use `uuid` PKs with `gen_random_uuid()` defaults and `organization_id` FK + RLS scoped via the existing `private.has_org_access()` pattern from migration 005 — following the Prompt OS subsystem's already-correct convention rather than the legacy `SERIAL` pattern.

- **`team_members`** — `id uuid, user_id uuid references auth.users, organization_id, name, email, avatar_url, role, department, weekly_capacity_hours, active, created_at`. This becomes the real assignee target for tasks/posts, replacing `NodeRole` as an identity (NodeRole can survive as an optional skill/function tag).
- **`leads`** / opportunity fields folded into one table (per the spec's simplicity principle) — `id uuid, organization_id, company_name, contact_name, email, phone, website, industry, country, source, owner_id → team_members, stage, estimated_value, qualification_score, pain_point, offer, notes, next_action, next_follow_up_at, last_contact_at, created_at`. Stage enum: `new → contacted → replied → qualified → discovery → proposal_sent → negotiation → won → lost`.
- **`lead_activities`** — lightweight activity/interaction log distinct from the free-text client timeline, `id uuid, lead_id, type, note, created_at, created_by → team_members`.
- **`invoices`** — `id uuid, organization_id, client_id, amount, currency, status(draft/sent/partial/paid/overdue/cancelled), issue_date, due_date, notes`.
- **`payments`** — `id uuid, organization_id, client_id, invoice_id, amount, currency, date, method, reference`.
- **`revenue_goals`** — `id uuid, organization_id, period, target_amount, currency`.
- **`projects`** — `id uuid, organization_id, client_id, name, owner_id → team_members, status, start_date, due_date, value, health, progress`. Sits between Client and Task.
- **Schema additions to existing tables**: `tasks.assignee_id uuid references team_members(id)` and `tasks.reviewer_id`, `tasks.project_id`, `tasks.blocker_reason`, `tasks.acceptance_criteria` (replacing/supplementing `assigned_node`); same `assignee_id` addition to `posts`. `clients` gains explicit separation from `leads` (a `Client` row is only created on Won — no more overloading `ClientStatus: 'Lead'`).

Currency handling: every money column pairs with an explicit `currency` field (no implicit USD/PKR summation); a reporting layer converts to one base currency for aggregate views only, never mutating the stored transaction currency.

## 7. Schema Migration Strategy

- New tables (`team_members`, `leads`, `lead_activities`, `invoices`, `payments`, `revenue_goals`, `projects`) ship as pure additive migrations — zero risk to existing data.
- `tasks`/`posts` get new nullable `assignee_id`/`reviewer_id`/`project_id` columns additively; `assigned_node` is kept (not dropped) during a transition period and back-filled where a reasonable NodeRole→team_member mapping can be made manually; UI switches to reading/writing `assignee_id` once `team_members` exist and at least one real person record has been created per NodeRole.
- ID strategy: all *new* tables use UUID PKs from day one. Legacy `SERIAL`-keyed tables (`clients`, `tasks`, `posts`, `protocols`) are **not** retro-migrated to UUID in this pass — that's a higher-risk, lower-value change given FK fan-out; instead, the client-side `maxId + 1` generator (`AppDataContext.tsx:6-9`) is deleted and replaced by letting Postgres `SERIAL` assign IDs on insert (returning the DB-assigned id to the client), which removes the race condition without a schema change.
- RLS: extend the existing `has_org_access()` policy pattern to all new tables; tighten the over-broad anonymous `clients` SELECT policy (§3) to filter by the requesting portal token rather than granting blanket table access — this is a security fix independent of feature work and should land early.
- No destructive migrations. No existing `clients`/`tasks`/`posts`/`protocols` rows are altered or dropped at any point in this plan.

## 8. Implementation Phases

**P0 — must fix before team adoption**: real `team_members` + per-person auth/permissions, `assignee_id` on tasks/posts, fix the ~13 status-string comparison bugs (§20 of audit — cited by file:line), fix dashboard KPIs to use canonical status helpers, simplify navigation to the 5-item IA, build CEO Action Center and Employee My Work, switch legacy IDs off client-computed max+1, basic Lead/Opportunity pipeline.

**P1 — direct revenue impact**: follow-up queue, opportunity values + next-action enforcement, Won→Client conversion automation, `invoices`/`payments` tables + real revenue dashboard (cash collected / outstanding / pipeline as three distinct numbers), client risk alerts, fix the client-portal sync gap (§3).

**P2 — operational leverage**: `projects` entity, workload/capacity view, CEO review queue, blocker tracking, onboarding folded into Client workspace, Content↔Task linkage, universal search/Quick Add.

**P3 — intelligence**: CEO daily brief, AI task-brief generation, AI account summaries/risk detection, Prompt Studio surfaced contextually rather than as a top-level destination.

This plan proceeds phase by phase; each phase ends with lint + build passing before the next starts.

## 9. Files/Modules Impacted (P0 scope)

- `supabase/migrations/` — new migration(s) for `team_members`, `leads`, additive `assignee_id`/`reviewer_id`/`project_id` columns, RLS policies.
- `src/utils/storage.ts` — remove `NodeRole`-as-identity typing where it becomes `assigneeId`; delete dead `hashPassphrase`/passphrase types.
- `src/contexts/AppDataContext.tsx` — remove `safeMaxId`, add `teamMembers`/`leads` collections and mutators, add canonical status-check helpers (`isTaskDone`, `isPostPublished`, etc.) to replace raw string comparisons repo-wide.
- `src/utils/supabaseSync.ts` — add mappers for new tables; fix defaults that silently paper over the NodeRole gap (`?? 'CEO'`, `?? 'Art Director'`).
- `src/components/layout/Sidebar.tsx`, `AppShell.tsx` — new 5-item IA, fix badge-count status bugs.
- `src/views/CommandCenter/DashboardView.tsx` — rebuilt as role-aware Home/Action Center; fix KPI bugs.
- `src/views/FulfillmentOS/MyTasksView.tsx` — filter by real authenticated `team_member.id`, not the dead `sessionStorage.getItem('nodeRole')` key.
- New `src/views/Sales/*` for the Lead/Opportunity pipeline.
- New `src/views/Team/*` for team directory/workload.
- `App.tsx` — auth flow gains real per-user Supabase Auth (magic-link/password) instead of the single shared workspace key; role resolved server-side from `organization_members`/`team_members`, not a client session flag.

## 10. Risks

- **Auth rework is foundational, not incremental.** Moving from one shared workspace key to real per-person auth touches the Edge Function (`workspace-access`), every `authLevel === 'ceo'` gate scattered across ~5 views, and RLS policy design. This is the highest-risk single change in P0 and should be built and tested in isolation before other P0 items land on top of it.
- **NodeRole → assignee_id cutover needs a manual mapping step** — there's no automatic way to know which real person a given legacy `'Art Director'` task belongs to; this requires the CEO to do a one-time reassignment pass after `team_members` exist. Plan should surface an explicit "Unassigned (legacy: Art Director)" bucket rather than guessing.
- **Client portal RLS tightening could break the existing magic-link flow** if not tested carefully against real portal tokens before deploying — this is a security fix but must be verified end-to-end (portal load, cross-device) before shipping.
- **No test suite exists** in the repo (confirmed during audit — no test files found), so every phase's "QA" step is manual verification of the flows listed in the original spec (Lead→Won→Client, Delivery, Payment, Team, Client). Regressions will not be caught automatically; manual flow verification after each phase is mandatory, not optional.
- **Dead/unused code found during audit** (`SetupView.tsx` + `hashPassphrase`, `workspace-bootstrap` Edge Function, `@google/genai`/`googleapis`/`better-sqlite3` deps, unused `multer` import) should be removed opportunistically during P0 navigation/auth work rather than as a separate pass, to avoid it being a distraction later.
