# NEROZARB Agency OS — Streamlined Prompt Vault & Workflow Overhaul

Redesign the overcomplicated multi-tab Prompt Studio into a fast, single-view **Prompt OS Vault** organized by agency creative categories and clients, and connect it directly to Tasks and Content production across the operating system.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product and workflow decisions were confirmed and guide this implementation plan:

- **Confirmed Decision 1 — Single-View Prompt Vault**: Replace the 4-tab academic compiler (`Create from brief`, `Instruction blocks`, `Recipes`, `Context packs`, `Quality rubrics`, `Model profiles`) with a single, high-speed **Prompt Vault** featuring instant filtering by **Agency Category** and **Client** (Global Agency vs. Client-Specific).
- **Confirmed Decision 2 — Smart Variable Fill + Client Context Auto-Injection + One-Click Copy**: Selecting any prompt opens a clean interactive runner panel where `{{client.name}}`, `{{client.niche}}`, `{{client.audience}}`, `{{client.problem}}`, and `{{client.pillars}}` auto-populate from the selected client record, alongside simple inputs for custom variables (`{{topic}}`, `{{offer}}`, `{{platform}}`, etc.) and a prominent **Copy Ready Prompt** action.
- **Confirmed Decision 3 — Pre-Loaded Agency Prompts & Direct Task/Content Linking**: Ship a curated library of high-converting marketing agency prompts across all 8 core categories and let operators attach or launch saved prompts directly inside **Tasks (Fulfillment OS)** and **Social Posts (Content OS)**.

---

## 1. Overview & Core Concept

- **What It Does**: Gives agency strategists, copywriters, art directors, and video editors a frictionless workspace to save, find, customize, and copy prompts in seconds—organized both by **Creative Category** and by **Client**—while unifying task and content modals with the same clean, effortless workflow.
- **Target Audience / Persona**: Marketing agency CEO and operators who need repeatable creative output without wrestling with complex prompt-engineering schemas.
- **Key Value**: Cuts prompt discovery and customization from 12+ form fields down to 3 clicks: **Pick Category/Client → Fill Quick Variables → Copy or Attach to Task/Post**.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Browse & Filter Prompts (Left/Center Vault Grid)**:
   - Filter bar at the top lets the user filter by **Client** (`All Prompts`, `Global Agency Prompts`, or a specific Client) and search by keyword.
   - Interactive **Category Tabs** filter across the core marketing agency pillars:
     - `All Categories`
     - `Brand Story`
     - `Strategy`
     - `Brainstorming`
     - `Art Direction`
     - `Image Prompts`
     - `Videos`
     - `Storytelling`
     - `Copywriting & Scripting`
   - Each card displays the prompt title, category · client scope · usage count (as clean unboxed metadata), a 2-line preview, detected variables, and a quick **Copy** or **Use Prompt** button.

2. **Use & Customize a Prompt (Right-Hand Interactive Workbench / Drawer)**:
   - Clicking a prompt opens it in the **Quick Use & Variable Filler** panel.
   - **Client Context Selector**: Picking a client automatically injects their stored strategy (Brand Name, Niche, Shadow Avatar / Audience, Core Problem / Bleeding Neck, and Content Pillars) into the prompt preview in real time.
   - **Quick Variable Inputs**: Any `{{variable}}` placeholders in the prompt (such as `{{hook_angle}}`, `{{offer}}`, `{{platform}}`, `{{visual_style}}`) automatically generate simple text inputs right above the live preview.
   - **One-Click Actions**:
     - **Copy Final Prompt** (copies the fully resolved prompt with client context and variables filled in, increments usage count, and shows a confirmation toast).
     - **Send to New Task** or **Send to Content Post** (pre-fills a task or post brief with the resolved prompt).

3. **Create or Edit a Prompt (Simple 1-Step Modal)**:
   - Clicking **New Prompt** opens a focused modal with only what matters:
     - **Prompt Title**
     - **Category** (Brand Story, Strategy, Brainstorming, Art Direction, Image Prompts, Videos, Storytelling, Copywriting & Scripting)
     - **Client Scope** (`All Clients / Global` or a specific Client)
     - **When to use / Notes** (short 1-line helper)
     - **Prompt Text** (with 1-click variable insertion buttons like `+ Client Name`, `+ Target Audience`, `+ Topic`, `+ Offer`, `+ Platform` so nobody has to memorize syntax).

4. **Seamless OS Integration (Tasks & Content OS)**:
   - In **New Task / Task Detail** and **New Post / Post Detail**, operators can link a saved prompt from the Prompt Vault, view or copy the linked prompt right inside the task/post modal, or click **Open in Prompt Studio** to customize it for that client.
   - Clean up legacy pseudo-technical jargon (`TERMINATE_SESSION`, `OPERATIONAL FLUX LOG`, `QUANTUM ALLOCATION`, broken `VAULT_ACCESS` button) in Task and Content modals so the entire OS speaks clear, human agency language.

### Visual Identity & Theme

- **Aesthetic Direction**: Refined Dark SaaS Workspace (`#0C0F14` Onyx canvas, `#13191A` structural card surfaces, `1px` subtle borders `rgba(220, 235, 215, 0.13)`).
- **Color Palette & Mood**: 60% deep onyx canvas, 30% elevated dark slate surfaces and muted sage-gray typography (`#DCE4D8` / `#AAB6A6`), 10% botanical sage-green primary accent (`#6E9B52`) reserved for primary CTAs, active category filters, and focus rings.
- **Typography & Hierarchy**: `Outfit` for display headers and clean UI controls; monospace (`Space Mono` / `tabular-nums`) strictly for variable tokens (`{{variable}}`), usage counters, and dates.
- **Zero-Pill Metadata Discipline**: Card metadata (Category · Client Name · Used N times) rendered as clean unboxed inline text with middle-dot (`·`) separators; interactive category and client selectors styled as crisp segmented filter buttons.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Unified Single-Screen Master-Detail Vault vs. Multi-Tab Compiler**
  - *Chosen Approach*: Side-by-side Vault Grid + Live Prompt Workbench on desktop (and clean slide-over drawer on mobile).
  - *Why*: Eliminates tab-switching between "Library" and "Compose". Users see their categorized prompts on the left and immediately test, fill variables, and copy on the right.
  - *Alternatives Considered*: Keeping separate tabs for Templates, Blocks, and Recipes—rejected because it forces operators to manage 5 abstract entities just to save and reuse a prompt.

- **Decision 2: Automatic `{{variable}}` Detection + Optional Client Strategy Block**
  - *Chosen Approach*: Parse any `{{variable_name}}` directly from the prompt text and auto-fill `{{client.*}}` tokens from the active client record, plus provide a 1-click toggle to append the client's full strategy profile (Niche, Audience, Core Problem, Content Pillars) to any prompt.
  - *Why*: Even if a prompt doesn't explicitly contain `{{client.audience}}` tags, toggling "Include Client Strategy Context" automatically prepends the client's brand context before copying.

- **Decision 3: Curated Starter Library for Immediate Agency Value**
  - *Chosen Approach*: Seed the workspace with 12 battle-tested agency prompts spanning all 8 categories (`Brand Story`, `Strategy`, `Brainstorming`, `Art Direction`, `Image Prompts`, `Videos`, `Storytelling`, `Copywriting & Scripting`) whenever the library is empty or via a 1-click "Load Starter Agency Prompts" button.
  - *Why*: Ensures the team has working, high-caliber prompts on day one and a clear model for writing their own.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         AppDataContext & Storage                         │
│  • Clients, Tasks, Posts, PromptTemplates (with Category & ClientScope)  │
│  • Auto-seeded Starter Agency Prompts across all 8 categories            │
└───────────────┬──────────────────────────────────────────┬───────────────┘
                │                                          │
                ▼                                          ▼
┌───────────────────────────────────────┐  ┌───────────────────────────────┐
│        Prompt Studio (Vault OS)       │  │   Fulfillment OS & Content OS │
│ ┌───────────────────────────────────┐ │  │ ┌───────────────────────────┐ │
│ │ Filter Bar                        │ │  │ │ New / Detail Task Modal   │ │
│ │ • Category Segmented Bar (8 cats) │ │  │ │ • Attach Saved Prompt     │ │
│ │ • Client Scope Selector + Search  │ │  │ │ • 1-Click Copy / Open     │ │
│ └─────────────────┬─────────────────┘ │  │ └───────────────────────────┘ │
│                   ▼                   │  │ ┌───────────────────────────┐ │
│ ┌─────────────────┐ ┌───────────────┐ │  │ │ New / Detail Post Modal   │ │
│ │ Prompt Grid     │ │ Live Runner   │ │  │ │ • Attach Saved Prompt     │ │
│ │ • Unboxed meta  │ │ • Client auto │ │  │ │ • 1-Click Copy / Open     │ │
│ │ • Quick Copy    │ │   context     │ │  │ └───────────────────────────┘ │
│ │ • Favorite/Pin  │ │ • {{var}}     │ │  └───────────────────────────────┘
│ │ • Edit / Delete │ │   inputs      │ │
│ └─────────────────┘ │ • 1-Click Copy│ │
│                     │ • Send to     │ │
│                     │   Task / Post │ │
│                     └───────────────┘ │
└───────────────────────────────────────┘
```

### Data Model & State

- **Extended `PromptTemplate` Entity**:
  - `id`: unique identifier
  - `title`: clear human title
  - `category`: `'Brand Story' | 'Strategy' | 'Brainstorming' | 'Art Direction' | 'Image Prompts' | 'Videos' | 'Storytelling' | 'Copywriting & Scripting'`
  - `clientId`: `number | null` (`null` = Global Agency Prompt reusable for any client; `number` = saved specifically for that client)
  - `description`: brief usage note
  - `content`: prompt body supporting `{{variable}}` placeholders
  - `isFavorite`: boolean for pinning top agency prompts
  - `usageCount`: number tracking how often the team copies/uses the prompt
- **Task & Post Prompt Linking**:
  - `Task.linkedPromptId` / `Task.compiledPromptId` and `Post.linkedPromptId` reference `PromptTemplate.id` so operators can attach a prompt when creating or editing a Task or Content Post and copy the client-resolved prompt directly inside the task/post view.

### Interactive Component & State Mapping

- **Category & Client Filtering**: Clicking a category button or selecting a client filters the prompt grid in real time (`0ms` client-side memoized filter) and displays counts per category in tabular numerals.
- **Variable Parser & Live Resolver**: Typing `{{offer}}` or `{{visual_style}}` in the prompt editor immediately registers those keys; in the runner panel, typing into those variable fields updates the highlighted live prompt preview and the clipboard output.
- **One-Click Task/Post Handoff**: Clicking "Create Task with Prompt" or "Create Post with Prompt" inside the Prompt Runner creates or opens the corresponding item with the resolved prompt pre-filled in its brief and navigates directly to it.
