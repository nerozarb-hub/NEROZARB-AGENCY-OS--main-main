import { supabase } from './supabase';
import { AppData, Client, Task, Post, Protocol, OnboardingProtocol, ActivityEntry, TimelineEvent, OnboardingStep } from './storage';

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
const mapSettings = (row: any): AppData['settings'] => ({
    ceoPhraseHash: row.ceoPhraseHash ?? row.ceo_phrase_hash ?? null,
    teamPhraseHash: row.teamPhraseHash ?? row.team_phrase_hash ?? null,
    initialized: row.initialized ?? false,
    lastUpdated: row.lastUpdated ?? row.last_updated ?? null,
});

// ─────────────────────────────────────────────────────────────────────────────
// FETCH
// ─────────────────────────────────────────────────────────────────────────────

export const fetchAppDataFromSupabase = async (): Promise<Partial<AppData> | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
        const [clientsRes, tasksRes, postsRes, protocolsRes, onboardingsRes, settingsRes] = await Promise.all([
            supabase.from('clients').select('*'),
            supabase.from('tasks').select('*'),
            supabase.from('posts').select('*'),
            supabase.from('protocols').select('*'),
            supabase.from('onboarding_protocols').select('*'),
            supabase.from('settings').select('*').eq('id', 'global').single()
        ]);

        if (clientsRes.error) throw clientsRes.error;
        if (tasksRes.error) throw tasksRes.error;
        if (postsRes.error) throw postsRes.error;
        if (protocolsRes.error) throw protocolsRes.error;
        if (onboardingsRes.error) throw onboardingsRes.error;

        const result: Partial<AppData> = {
            clients: (clientsRes.data ?? []).map(mapClient),
            tasks: (tasksRes.data ?? []).map(mapTask),
            posts: (postsRes.data ?? []).map(mapPost),
            protocols: (protocolsRes.data ?? []).map(mapProtocol),
            onboardings: (onboardingsRes.data ?? []).map(mapOnboarding),
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
