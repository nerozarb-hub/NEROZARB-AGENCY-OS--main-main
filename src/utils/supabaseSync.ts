import { supabase } from './supabase';
import { AppData, Client, Task, Post, Protocol, OnboardingProtocol, ActivityEntry, TimelineEvent, OnboardingStep, PromptTemplate, InstructionBlock, ContextPack, PromptRecipe, StructuredBrief, CompiledPrompt, GenerationRun, ModelProfile, QualityRubric, TeamMember } from './storage';

// Helper to check if Supabase is actually configured
const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return Boolean(url && key && url !== 'https://placeholder-project.supabase.co');
};

// Retry-once wrapper for transient Supabase failures
async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T | null> {
    try {
        return await fn();
    } catch (e) {
        console.warn(`[Supabase] ${label} failed, retrying once...`, e);
        try {
            return await fn();
        } catch (e2) {
            console.error(`[Supabase] ${label} retry failed. Data saved locally.`, e2);
            return null;
        }
    }
}

// Debounce map — prevents flooding Supabase with rapid sequential updates to the same entity
const pendingSyncs = new Map<string, ReturnType<typeof setTimeout>>();
function debouncedSync(key: string, fn: () => void, delayMs = 300) {
    const existing = pendingSyncs.get(key);
    if (existing) clearTimeout(existing);
    pendingSyncs.set(key, setTimeout(() => {
        pendingSyncs.delete(key);
        fn();
    }, delayMs));
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA MAPPERS: Supabase snake_case → App camelCase
// Supabase / PostgreSQL returns column names in snake_case.
// Our TypeScript models use camelCase. These mappers convert the raw DB rows
// into the correct shape before they touch any React state.
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapClient = (row: any): Client => ({
    id: row.id,
    name: row.name ?? '',
    status: row.status ?? 'Lead',
    revenueGate: row.revenue_gate ?? row.revenueGate ?? '',
    tier: row.tier ?? '',
    ltv: row.ltv ?? 0,
    contractValue: row.contract_value ?? row.contractValue ?? 0,
    phone: row.phone ?? '',
    email: row.email ?? '',
    contactName: row.contact_name ?? row.contactName ?? '',
    niche: row.niche ?? '',
    startDate: row.start_date ?? row.startDate ?? '',
    shadowAvatar: row.shadow_avatar ?? row.shadowAvatar ?? '',
    bleedingNeck: row.bleeding_neck ?? row.bleedingNeck ?? '',
    contentPillars: row.content_pillars ?? row.contentPillars ?? [],
    relationshipHealth: row.relationship_health ?? row.relationshipHealth ?? 'healthy',
    onboardingStatus: row.onboarding_status ?? row.onboardingStatus ?? 'not-started',
    notes: row.notes ?? '',
    timeline: (row.timeline ?? []).map((e: any): TimelineEvent => ({
        id: e.id,
        date: e.date ?? '',
        event: e.event ?? '',
        type: e.type ?? 'system',
    })),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTask = (row: any): Task => ({
    id: row.id,
    clientId: row.client_id ?? row.clientId,
    name: row.name ?? '',
    category: row.category ?? 'Other',
    phase: row.phase ?? 'phase1',
    stagePipeline: row.stage_pipeline ?? row.stagePipeline ?? ['BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED'],
    currentStage: row.current_stage ?? row.currentStage ?? 'BRIEFED',
    assignedNode: row.assigned_node ?? row.assignedNode ?? 'CEO',
    assigneeId: row.assignee_id ?? row.assigneeId ?? null,
    reviewerId: row.reviewer_id ?? row.reviewerId ?? null,
    priority: row.priority ?? 'normal',
    status: row.status ?? 'active',
    deadline: row.deadline ?? '',
    estimatedHours: row.estimated_hours ?? row.estimatedHours ?? null,
    brief: row.brief ?? '',
    assetLinks: row.asset_links ?? row.assetLinks ?? [],
    sopReference: row.sop_reference ?? row.sopReference ?? null,
    activityLog: (row.activity_log ?? row.activityLog ?? []).map((e: any): ActivityEntry => ({
        timestamp: e.timestamp ?? new Date().toISOString(),
        type: e.type ?? 'created',
        from: e.from ?? null,
        to: e.to ?? null,
        text: e.text ?? '',
        author: e.author ?? 'team',
    })),
    notes: row.notes ?? '',
    deliveredOnTime: row.delivered_on_time ?? row.deliveredOnTime ?? null,
    linkedPostId: row.linked_post_id ?? row.linkedPostId ?? null,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPost = (row: any): Post => ({
    id: row.id,
    clientId: row.client_id ?? row.clientId,
    platforms: row.platforms ?? [],
    postType: row.post_type ?? row.postType ?? 'Static Post',
    contentPillar: row.content_pillar ?? row.contentPillar ?? 'Other',
    templateType: row.template_type ?? row.templateType ?? null,
    hook: row.hook ?? '',
    triggerUsed: row.trigger_used ?? row.triggerUsed ?? null,
    captionBody: row.caption_body ?? row.captionBody ?? '',
    cta: row.cta ?? '',
    ctaType: row.cta_type ?? row.ctaType ?? 'Link in bio',
    hashtags: row.hashtags ?? '',
    visualBrief: row.visual_brief ?? row.visualBrief ?? '',
    scheduledDate: row.scheduled_date ?? row.scheduledDate ?? '',
    scheduledTime: row.scheduled_time ?? row.scheduledTime ?? '10:00',
    publishedDate: row.published_date ?? row.publishedDate ?? null,
    status: row.status ?? 'PLANNED',
    priority: row.priority ?? 'normal',
    assignedTo: row.assigned_to ?? row.assignedTo ?? 'Art Director',
    assigneeId: row.assignee_id ?? row.assigneeId ?? null,
    linkedTaskId: row.linked_task_id ?? row.linkedTaskId ?? null,
    assetLinks: row.asset_links ?? row.assetLinks ?? [],
    referencePost: row.reference_post ?? row.referencePost ?? null,
    performance: row.performance ?? null,
    activityLog: (row.activity_log ?? row.activityLog ?? []).map((e: any): ActivityEntry => ({
        timestamp: e.timestamp ?? new Date().toISOString(),
        type: e.type ?? 'created',
        from: e.from ?? null,
        to: e.to ?? null,
        text: e.text ?? '',
        author: e.author ?? 'team',
    })),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapProtocol = (row: any): Protocol => ({
    id: row.id,
    title: row.title ?? '',
    category: row.category ?? 'sop',
    pillar: row.pillar ?? 'Operations',
    tags: row.tags ?? [],
    status: row.status ?? 'draft',
    content: row.content ?? '',
    promptTool: row.prompt_tool ?? row.promptTool ?? null,
    promptVariables: row.prompt_variables ?? row.promptVariables ?? [],
    usageNotes: row.usage_notes ?? row.usageNotes ?? null,
    exampleOutput: row.example_output ?? row.exampleOutput ?? null,
    linkedTaskTypes: row.linked_task_types ?? row.linkedTaskTypes ?? [],
    linkedClientId: row.linked_client_id ?? row.linkedClientId ?? null,
    relatedProtocolIds: row.related_protocol_ids ?? row.relatedProtocolIds ?? [],
    externalReferences: row.external_references ?? row.externalReferences ?? [],
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
    copyCount: row.copy_count ?? row.copyCount ?? 0,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapOnboarding = (row: any): OnboardingProtocol => ({
    id: row.id ?? '',
    clientId: row.client_id ?? row.clientId,
    steps: (row.steps ?? []).map((s: any): OnboardingStep => ({
        id: s.id ?? '',
        label: s.label ?? '',
        completed: s.completed ?? false,
        owner: s.owner ?? 'Team',
        details: s.details ?? '',
        completedAt: s.completed_at ?? s.completedAt,
    })),
    progress: row.progress ?? 0,
    status: row.status ?? 'on-track',
    lastUpdated: row.last_updated ?? row.lastUpdated ?? new Date().toISOString(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTeamMember = (row: any): TeamMember => ({
    id: row.id,
    userId: row.user_id ?? row.userId ?? null,
    name: row.name ?? '',
    email: row.email ?? null,
    avatarUrl: row.avatar_url ?? row.avatarUrl ?? null,
    role: row.role ?? 'employee',
    department: row.department ?? null,
    weeklyCapacityHours: row.weekly_capacity_hours ?? row.weeklyCapacityHours ?? 40,
    active: row.active ?? true,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapSettings = (row: any): AppData['settings'] => ({
    ceoPhraseHash: row.ceoPhraseHash ?? row.ceo_phrase_hash ?? null,
    teamPhraseHash: row.teamPhraseHash ?? row.team_phrase_hash ?? null,
    initialized: row.initialized ?? false,
    lastUpdated: row.lastUpdated ?? row.last_updated ?? null,
});

// Prompt OS records use UUID identifiers and preserve compiler snapshots exactly as stored.
const promptDates = (row: any) => ({ createdAt: row.created_at ?? new Date().toISOString(), updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString() });
const mapTemplate = (row: any): PromptTemplate => ({ id: row.id, title: row.title ?? '', description: row.description ?? '', category: row.category ?? 'Content', content: row.content ?? '', status: row.status ?? 'draft', version: row.version ?? 1, tags: row.tags ?? [], ...promptDates(row) });
const mapBlock = (row: any): InstructionBlock => ({ id: row.id, title: row.title ?? '', description: row.description ?? '', instruction: row.instruction ?? '', category: row.category ?? 'General', scope: row.scope ?? 'global', priority: row.priority ?? 100, status: row.status ?? 'draft', version: row.version ?? 1, tags: row.tags ?? [], compatibleTasks: row.compatible_tasks ?? [], compatibleIndustries: row.compatible_industries ?? [], compatibleModels: row.compatible_models ?? [], source: row.source ?? '', conditions: row.conditions ?? [], clientId: row.client_id ?? undefined, lastValidatedAt: row.last_validated_at ?? undefined, ...promptDates(row) });
const mapPack = (row: any): ContextPack => ({ id: row.id, name: row.name ?? '', description: row.description ?? '', packType: row.pack_type ?? 'brand', status: row.status ?? 'draft', version: row.version ?? 1, priority: row.priority ?? 100, clientId: row.client_id ?? undefined, productName: row.product_name ?? undefined, required: row.required ?? false, blockIds: [], assetUrls: row.asset_urls ?? [], references: row.reference_urls ?? [], tags: row.tags ?? [], lastValidatedAt: row.last_validated_at ?? undefined, ...promptDates(row) });
const mapRecipe = (row: any): PromptRecipe => ({ id: row.id, name: row.name ?? '', description: row.description ?? '', taskType: row.task_type ?? '', outputType: row.output_type ?? '', status: row.status ?? 'draft', version: row.version ?? 1, requiredInputs: row.required_inputs ?? [], optionalInputs: row.optional_inputs ?? [], variables: row.variables ?? [], requiredPackTypes: row.required_pack_types ?? [], defaultBlockIds: row.default_block_ids ?? [], conditionalBlockIds: row.conditional_block_ids ?? [], outputSchema: row.output_schema ?? '', evaluationRubricId: row.evaluation_rubric_id ?? undefined, compatibleModels: row.compatible_models ?? [], defaultModel: row.default_model ?? '', ...promptDates(row) });
const mapRubric = (row: any): QualityRubric => ({ id: row.id, name: row.name ?? '', criteria: row.criteria ?? [], passThreshold: Number(row.pass_threshold ?? 80), status: row.status ?? 'draft', version: row.version ?? 1, ...promptDates(row) });
const mapModel = (row: any): ModelProfile => ({ id: row.id, provider: row.provider ?? '', name: row.name ?? '', family: row.family ?? 'text', contextLimit: row.context_limit ?? 32000, supportsJson: row.supports_json ?? false, supportedAssetTypes: row.supported_asset_types ?? [], active: row.active ?? true, version: row.version ?? 1, ...promptDates(row) });
const mapBrief = (row: any): StructuredBrief => ({ id: row.id, clientId: row.client_id, product: row.product ?? '', campaign: row.campaign ?? '', deliverableType: row.deliverable_type ?? '', platform: row.platform ?? '', objective: row.objective ?? '', audience: row.audience ?? '', contentPillar: row.content_pillar ?? '', offer: row.offer ?? '', cta: row.cta ?? '', brief: row.brief ?? '', recipeId: row.recipe_id ?? undefined, contextPackIds: [], assetUrls: row.asset_urls ?? [], status: row.status ?? 'draft', ...promptDates(row) });
const mapCompiled = (row: any): CompiledPrompt => ({ id: row.id, briefId: row.brief_id, prompt: row.prompt ?? '', appliedBlockIds: [], appliedPackIds: [], sourceSnapshots: [], resolvedVariables: row.resolved_variables ?? {}, audit: row.audit ?? undefined, modelProfileId: row.model_profile_id ?? undefined, missingInputs: row.audit?.missingInputs ?? [], conflicts: row.audit?.conflicts ?? [], createdAt: row.created_at ?? new Date().toISOString() });
const mapRun = (row: any): GenerationRun => ({ id: row.id, briefId: row.brief_id, compiledPromptId: row.compiled_prompt_id, provider: row.provider ?? undefined, model: row.model ?? undefined, status: row.status ?? 'ready-for-generation', qualityScore: row.quality_score === null ? null : Number(row.quality_score), reviewerFeedback: row.reviewer_feedback ?? '', createdAt: row.created_at ?? new Date().toISOString() });

// ─────────────────────────────────────────────────────────────────────────────
// FETCH
// ─────────────────────────────────────────────────────────────────────────────

export const fetchAppDataFromSupabase = async (): Promise<Partial<AppData> | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
        const [clientsRes, tasksRes, postsRes, protocolsRes, onboardingsRes, teamMembersRes, settingsRes, templatesRes, blocksRes, packsRes, recipesRes, rubricsRes, modelsRes, briefsRes, compiledRes, runsRes] = await Promise.all([
            supabase.from('clients').select('*'),
            supabase.from('tasks').select('*'),
            supabase.from('posts').select('*'),
            supabase.from('protocols').select('*'),
            supabase.from('onboarding_protocols').select('*'),
            supabase.from('team_members').select('*'),
            supabase.from('settings').select('*').eq('id', 'global').maybeSingle(),
            supabase.from('prompt_templates').select('*'),
            supabase.from('instruction_blocks').select('*'),
            supabase.from('context_packs').select('*'),
            supabase.from('prompt_recipes').select('*'),
            supabase.from('quality_rubrics').select('*'),
            supabase.from('model_profiles').select('*'),
            supabase.from('prompt_briefs').select('*'),
            supabase.from('compiled_prompts').select('*'),
            supabase.from('prompt_generation_runs').select('*')
        ]);

        if (clientsRes.error) throw clientsRes.error;
        if (tasksRes.error) throw tasksRes.error;
        if (postsRes.error) throw postsRes.error;
        if (protocolsRes.error) throw protocolsRes.error;
        if (onboardingsRes.error) throw onboardingsRes.error;
        if (teamMembersRes.error) throw teamMembersRes.error;
        if (templatesRes.error || blocksRes.error || packsRes.error || recipesRes.error || rubricsRes.error || modelsRes.error || briefsRes.error || compiledRes.error || runsRes.error) throw templatesRes.error || blocksRes.error || packsRes.error || recipesRes.error || rubricsRes.error || modelsRes.error || briefsRes.error || compiledRes.error || runsRes.error;

        const result: Partial<AppData> = {
            clients: (clientsRes.data ?? []).map(mapClient),
            tasks: (tasksRes.data ?? []).map(mapTask),
            posts: (postsRes.data ?? []).map(mapPost),
            protocols: (protocolsRes.data ?? []).map(mapProtocol),
            onboardings: (onboardingsRes.data ?? []).map(mapOnboarding),
            teamMembers: (teamMembersRes.data ?? []).map(mapTeamMember),
            promptTemplates: (templatesRes.data ?? []).map(mapTemplate),
            instructionBlocks: (blocksRes.data ?? []).map(mapBlock),
            contextPacks: (packsRes.data ?? []).map(mapPack),
            promptRecipes: (recipesRes.data ?? []).map(mapRecipe),
            qualityRubrics: (rubricsRes.data ?? []).map(mapRubric),
            modelProfiles: (modelsRes.data ?? []).map(mapModel),
            briefs: (briefsRes.data ?? []).map(mapBrief),
            compiledPrompts: (compiledRes.data ?? []).map(mapCompiled),
            generationRuns: (runsRes.data ?? []).map(mapRun),
        };

        if (settingsRes.data) {
            result.settings = mapSettings(settingsRes.data);
        }

        return result;
    } catch (e) {
        console.error('Failed to fetch from Supabase. Falling back to local storage.', e);
        return null;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// SYNC HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Utility to map camelCase object keys to snake_case for DB
function toDB(obj: any) {
    if (!obj || typeof obj !== 'object') return obj;
    const result: any = {};
    for (const key of Object.keys(obj)) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        result[snakeKey] = obj[key];
    }
    return result;
}

export const syncClientToSupabase = async (client: Client, isNew: boolean = false) => {
    if (!isSupabaseConfigured()) return;
    debouncedSync(`client-${client.id}`, () => {
        withRetry(async () => {
            // project_phases and client_updates are separate tables in Supabase.
            // DO NOT sync them directly to the clients table schema.
            const { projectPhases, clientUpdates, ...clientData } = client;
            
            const dbClient = toDB(clientData);
            if (isNew) {
                const { error } = await supabase.from('clients').insert([dbClient]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('clients').update(dbClient).eq('id', client.id);
                if (error) throw error;
            }
        }, `sync client ${client.id}`);
    });
};

export const deleteClientFromSupabase = async (id: number) => {
    if (!isSupabaseConfigured()) return;
    try {
        await supabase.from('clients').delete().eq('id', id);
    } catch (e) {
        console.error('Failed to delete client from Supabase', e);
    }
};

export const syncTaskToSupabase = async (task: Task, isNew: boolean = false) => {
    if (!isSupabaseConfigured()) return;
    debouncedSync(`task-${task.id}`, () => {
        withRetry(async () => {
            const dbTask = toDB(task);
            if (isNew) {
                const { error } = await supabase.from('tasks').insert([dbTask]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('tasks').update(dbTask).eq('id', task.id);
                if (error) throw error;
            }
        }, `sync task ${task.id}`);
    });
};

export const syncTasksToSupabase = async (tasks: Task[]) => {
    if (!isSupabaseConfigured() || tasks.length === 0) return;
    try {
        await supabase.from('tasks').upsert(tasks.map(toDB));
    } catch (e) {
        console.error('Failed to bulk sync tasks to Supabase', e);
    }
};

export const syncPostToSupabase = async (post: Post, isNew: boolean = false) => {
    if (!isSupabaseConfigured()) return;
    debouncedSync(`post-${post.id}`, () => {
        withRetry(async () => {
            const dbPost = toDB(post);
            if (isNew) {
                const { error } = await supabase.from('posts').insert([dbPost]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('posts').update(dbPost).eq('id', post.id);
                if (error) throw error;
            }
        }, `sync post ${post.id}`);
    });
};

export const syncPostsToSupabase = async (posts: Post[]) => {
    if (!isSupabaseConfigured() || posts.length === 0) return;
    try {
        await supabase.from('posts').upsert(posts.map(toDB));
    } catch (e) {
        console.error('Failed to bulk sync posts to Supabase', e);
    }
};

export const syncProtocolToSupabase = async (protocol: Protocol, isNew: boolean = false) => {
    if (!isSupabaseConfigured()) return;
    debouncedSync(`protocol-${protocol.id}`, () => {
        withRetry(async () => {
            const dbProtocol = toDB(protocol);
            if (isNew) {
                const { error } = await supabase.from('protocols').insert([dbProtocol]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('protocols').update(dbProtocol).eq('id', protocol.id);
                if (error) throw error;
            }
        }, `sync protocol ${protocol.id}`);
    });
};

export const deleteProtocolFromSupabase = async (id: number) => {
    if (!isSupabaseConfigured()) return;
    try {
        await supabase.from('protocols').delete().eq('id', id);
    } catch (e) {
        console.error('Failed to delete protocol from Supabase', e);
    }
};

export const syncOnboardingToSupabase = async (onboarding: OnboardingProtocol, isNew: boolean = false) => {
    if (!isSupabaseConfigured()) return;
    try {
        const dbOnboarding = toDB(onboarding);
        // Supabase table is named 'onboarding_protocols' in schema but previously code used 'onboardings'
        // Using 'onboarding_protocols' as defined in 001_initial_schema.sql
        if (isNew) {
            await supabase.from('onboarding_protocols').insert([dbOnboarding]);
        } else {
            await supabase.from('onboarding_protocols').update(dbOnboarding).eq('id', onboarding.id);
        }
    } catch (e) {
        console.error('Failed to sync onboarding to Supabase', e);
    }
};

export const syncTeamMemberToSupabase = async (member: TeamMember, isNew: boolean = false) => {
    if (!isSupabaseConfigured()) return;
    debouncedSync(`team-member-${member.id}`, () => {
        withRetry(async () => {
            const dbMember = toDB(member);
            if (isNew) {
                const { error } = await supabase.from('team_members').insert([dbMember]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('team_members').update(dbMember).eq('id', member.id);
                if (error) throw error;
            }
        }, `sync team member ${member.id}`);
    });
};

export const deleteTeamMemberFromSupabase = async (id: string) => {
    if (!isSupabaseConfigured()) return;
    try {
        await supabase.from('team_members').delete().eq('id', id);
    } catch (e) {
        console.error('Failed to delete team member from Supabase', e);
    }
};

export const syncSettingsToSupabase = async (settings: AppData['settings']) => {
    if (!isSupabaseConfigured()) return;
    try {
        await supabase.from('settings').upsert({
            id: 'global',
            ceoPhraseHash: settings.ceoPhraseHash,
            teamPhraseHash: settings.teamPhraseHash,
            initialized: settings.initialized,
            lastUpdated: settings.lastUpdated
        });
    } catch (e) {
        console.error('Failed to sync settings to Supabase', e);
    }
};

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const syncPromptOsToSupabase = async (data: AppData) => {
    if (!isSupabaseConfigured()) return;
    const templates = data.promptTemplates.filter(item => isUuid(item.id)).map(item => ({ id: item.id, title: item.title, description: item.description, category: item.category, content: item.content, status: item.status, version: item.version, tags: item.tags, created_at: item.createdAt, updated_at: item.updatedAt }));
    const blocks = data.instructionBlocks.filter(item => isUuid(item.id)).map(item => ({ id: item.id, client_id: item.clientId ?? null, title: item.title, description: item.description ?? '', instruction: item.instruction, category: item.category ?? 'General', scope: item.scope, priority: item.priority ?? 100, status: item.status, version: item.version, tags: item.tags, compatible_tasks: item.compatibleTasks ?? [], compatible_industries: item.compatibleIndustries ?? [], compatible_models: item.compatibleModels ?? [], source: item.source ?? null, conditions: item.conditions ?? [], last_validated_at: item.lastValidatedAt ?? null, created_at: item.createdAt, updated_at: item.updatedAt }));
    const packs = data.contextPacks.filter(item => isUuid(item.id)).map(item => ({ id: item.id, client_id: item.clientId ?? null, name: item.name, description: item.description, pack_type: item.packType, product_name: item.productName ?? null, priority: item.priority ?? 100, required: item.required ?? false, status: item.status, version: item.version, asset_urls: item.assetUrls ?? [], reference_urls: item.references ?? [], tags: item.tags ?? [], last_validated_at: item.lastValidatedAt ?? null, created_at: item.createdAt, updated_at: item.updatedAt }));
    const recipes = data.promptRecipes.filter(item => isUuid(item.id)).map(item => ({ id: item.id, name: item.name, description: item.description, task_type: item.taskType, output_type: item.outputType, status: item.status, version: item.version, required_inputs: item.requiredInputs, optional_inputs: item.optionalInputs ?? [], variables: item.variables ?? [], required_pack_types: item.requiredPackTypes ?? [], default_block_ids: item.defaultBlockIds ?? [], conditional_block_ids: item.conditionalBlockIds ?? [], output_schema: item.outputSchema ?? null, evaluation_rubric_id: item.evaluationRubricId ?? null, compatible_models: item.compatibleModels ?? [], default_model: item.defaultModel, created_at: item.createdAt, updated_at: item.updatedAt }));
    const rubrics = data.qualityRubrics.filter(item => isUuid(item.id)).map(item => ({ id: item.id, name: item.name, criteria: item.criteria, pass_threshold: item.passThreshold, status: item.status, version: item.version, created_at: item.createdAt, updated_at: item.updatedAt }));
    const models = data.modelProfiles.filter(item => isUuid(item.id)).map(item => ({ id: item.id, provider: item.provider, name: item.name, family: item.family, context_limit: item.contextLimit, supports_json: item.supportsJson, supported_asset_types: item.supportedAssetTypes, active: item.active, version: item.version, created_at: item.createdAt, updated_at: item.updatedAt }));
    const briefs = data.briefs.filter(item => isUuid(item.id)).map(item => ({ id: item.id, client_id: item.clientId, recipe_id: item.recipeId && isUuid(item.recipeId) ? item.recipeId : null, product: item.product ?? null, campaign: item.campaign ?? null, deliverable_type: item.deliverableType, platform: item.platform, objective: item.objective, audience: item.audience ?? null, content_pillar: item.contentPillar ?? null, offer: item.offer ?? null, cta: item.cta ?? null, brief: item.brief, structured_data: { mandatoryInclusions: item.mandatoryInclusions ?? '', prohibitedInclusions: item.prohibitedInclusions ?? '', contextPackIds: item.contextPackIds }, asset_urls: item.assetUrls ?? [], status: item.status, created_at: item.createdAt, updated_at: item.updatedAt }));
    const compiled = data.compiledPrompts.filter(item => isUuid(item.id) && isUuid(item.briefId)).map(item => ({ id: item.id, brief_id: item.briefId, prompt: item.prompt, resolved_variables: item.resolvedVariables ?? {}, audit: item.audit ?? {}, model_profile_id: item.modelProfileId && isUuid(item.modelProfileId) ? item.modelProfileId : null, created_at: item.createdAt }));
    const runs = data.generationRuns.filter(item => isUuid(item.id) && isUuid(item.briefId) && isUuid(item.compiledPromptId)).map(item => ({ id: item.id, brief_id: item.briefId, compiled_prompt_id: item.compiledPromptId, provider: item.provider ?? null, model: item.model ?? null, status: item.status, quality_score: item.qualityScore, reviewer_feedback: item.reviewerFeedback, created_at: item.createdAt }));
    try {
        await Promise.all([
            templates.length && supabase.from('prompt_templates').upsert(templates), blocks.length && supabase.from('instruction_blocks').upsert(blocks), packs.length && supabase.from('context_packs').upsert(packs), recipes.length && supabase.from('prompt_recipes').upsert(recipes), rubrics.length && supabase.from('quality_rubrics').upsert(rubrics), models.length && supabase.from('model_profiles').upsert(models), briefs.length && supabase.from('prompt_briefs').upsert(briefs), compiled.length && supabase.from('compiled_prompts').upsert(compiled), runs.length && supabase.from('prompt_generation_runs').upsert(runs),
        ]);
        const sources = data.compiledPrompts.flatMap(prompt => (prompt.sourceSnapshots ?? []).filter(source => isUuid(prompt.id) && isUuid(source.id)).map(source => ({ compiled_prompt_id: prompt.id, source_type: source.type, source_id: source.id, source_title: source.title, source_version: source.version, source_snapshot: source.snapshot })));
        if (sources.length) await supabase.from('compiled_prompt_sources').upsert(sources);
    } catch (error) { console.error('Failed to sync Prompt OS data.', error); }
};

export const subscribeToRealtimeSync = (onChange: () => void) => {
    if (!isSupabaseConfigured()) return () => undefined;
    const tables = ['clients', 'tasks', 'posts', 'protocols', 'onboarding_protocols', 'team_members', 'prompt_templates', 'instruction_blocks', 'context_packs', 'prompt_recipes', 'quality_rubrics', 'model_profiles', 'prompt_briefs', 'compiled_prompts', 'prompt_generation_runs'];
    const channel = tables.reduce((current, table) => current.on('postgres_changes', { event: '*', schema: 'public', table }, onChange), supabase.channel('nerozarb-agency-sync'));
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
};
