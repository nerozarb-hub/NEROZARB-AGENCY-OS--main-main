import { syncPostsToSupabase, syncPromptOsToSupabase, syncSettingsToSupabase, syncTasksToSupabase } from './supabaseSync';

export const STORAGE_KEY = 'nerozarb-os-v2';

export interface TimelineEvent { id: number; date: string; event: string; type: 'system' | 'manual'; }
export interface OnboardingStep { id: string; label: string; completed: boolean; owner: 'CEO' | 'Team'; details?: string; completedAt?: string; }
export interface OnboardingProtocol { id: string; clientId: number; steps: OnboardingStep[]; progress: number; status: 'on-track' | 'blocked' | 'completed'; lastUpdated: string; }
export interface ProjectPhase { id: number; clientId: number; title: string; status: 'pending' | 'in_progress' | 'completed'; orderIndex: number; createdAt?: string; updatedAt?: string; }
export interface ClientUpdate { id: number; clientId: number; message: string; createdAt?: string; }

export type TeamMemberRole = 'admin' | 'manager' | 'employee' | 'sales' | 'client';
export interface TeamMember {
  id: string; userId: string | null; name: string; email: string | null; avatarUrl: string | null;
  role: TeamMemberRole; department: string | null; weeklyCapacityHours: number; active: boolean;
  createdAt: string; updatedAt: string;
}

export type ClientStatus = 'Lead' | 'Discovery' | 'Active Sprint' | 'Retainer' | 'Closed';
export interface Client {
  id: number; name: string; status: ClientStatus; revenueGate: '<1M PKR' | '1M–5M PKR' | '>5M PKR' | string;
  tier: 'Tier 1: Active Presence' | 'Tier 2: 60-Day Sprint' | 'Tier 3: Market Dominance' | string;
  ltv: number; contractValue: number; phone: string; email: string; contactName: string; niche: string; startDate: string;
  shadowAvatar: string; bleedingNeck: string; contentPillars: string[]; relationshipHealth: 'healthy' | 'at-risk' | 'critical';
  onboardingStatus: 'not-started' | 'in-progress' | 'complete'; notes: string; timeline: TimelineEvent[];
  magicLinkToken?: string | null; projectPhases?: ProjectPhase[]; clientUpdates?: ClientUpdate[]; createdAt: string; updatedAt: string;
}

export type TaskCategory = 'Content Production' | 'Ad Creative' | 'Website' | 'Strategy' | 'Video Production' | 'Brand Design' | 'Analytics' | 'Automation' | 'Client Communication' | 'Other';
export type NodeRole = 'CEO' | 'Art Director' | 'Video Editor' | 'Operations Builder' | 'Social Media Manager' | 'Documentation Manager';
export type Stage = 'BRIEFED' | 'IN PRODUCTION' | 'REVIEW' | 'CEO APPROVAL' | 'CLIENT APPROVAL' | 'DEPLOYED';
export interface ActivityEntry { timestamp: string; type: 'stage_advance' | 'stage_regress' | 'note' | 'created' | 'edited'; from: string | null; to: string | null; text: string; author: 'ceo' | 'team'; }
export interface Task {
  id: number; clientId: number; name: string; category: TaskCategory; phase: 'phase1' | 'phase2' | 'phase3' | 'ongoing';
  stagePipeline: Stage[]; currentStage: Stage; assignedNode: NodeRole; priority: 'critical' | 'high' | 'normal'; status: 'active' | 'deployed' | 'cancelled';
  deadline: string; estimatedHours: number | null; brief: string; assetLinks: string[]; sopReference: string | null; activityLog: ActivityEntry[];
  notes: string; deliveredOnTime: boolean | null; linkedPostId: number | null; compiledPromptId?: string | null;
  assigneeId?: string | null; reviewerId?: string | null; createdAt: string; updatedAt: string;
}

export type PostStage = 'PLANNED' | 'BRIEF WRITTEN' | 'IN PRODUCTION' | 'REVIEW' | 'CEO APPROVAL' | 'CLIENT APPROVAL' | 'SCHEDULED' | 'PUBLISHED';
export type Platform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'twitter';
export type PostType = 'Reel / Short Video' | 'Static Post' | 'Carousel' | 'Story' | 'Text Post' | 'Event Post';
export type CTAType = 'Comment' | 'Link in bio' | 'DM for' | 'Save this' | 'Share this' | 'Custom';
export type TemplateType = 'Template A' | 'Template B' | 'Template C' | 'Custom';
export type PillarType = 'Market Truth' | 'Psychological Warfare' | 'Conversion Mechanic' | 'Viral Engine' | 'Growth Math' | 'Operations' | 'Client Management';
export type ProtocolCategory = 'sop' | 'ai-prompt' | 'client-knowledge-base' | 'brand-standard';
export type ProtocolStatus = 'active' | 'draft' | 'archived';
export interface Protocol {
  id: number; title: string; category: ProtocolCategory; pillar: PillarType; tags: string[]; status: ProtocolStatus; content: string;
  promptTool: 'gemini' | 'claude' | 'both' | null; promptVariables: string[]; usageNotes: string | null; exampleOutput: string | null;
  linkedTaskTypes: TaskCategory[]; linkedClientId: number | null; relatedProtocolIds: number[]; externalReferences: string[];
  createdAt: string; updatedAt: string; copyCount: number;
}
export interface PerformanceLog { reach: number; impressions: number; saves: number; shares: number; comments: number; likes: number; saveRate: number; shareRate: number; ceoRating: '🔴 Underperformed' | '🟡 Performed' | '🟢 Overperformed'; notes: string; }
export interface Post {
  id: number; clientId: number; platforms: Platform[]; postType: PostType; contentPillar: string; templateType: TemplateType | null;
  hook: string; triggerUsed: string | null; captionBody: string; cta: string; ctaType: CTAType; hashtags: string; visualBrief: string;
  scheduledDate: string; scheduledTime: string; publishedDate: string | null; status: PostStage; priority: 'normal' | 'high' | 'urgent'; assignedTo: NodeRole;
  linkedTaskId: number | null; linkedPromptId?: number | null; assetLinks: string[]; referencePost: string | null; performance: PerformanceLog | null;
  activityLog: ActivityEntry[]; assigneeId?: string | null; createdAt: string; updatedAt: string;
}
export type PromptScope = 'global' | 'industry' | 'client' | 'brand' | 'product' | 'campaign' | 'platform' | 'deliverable' | 'model' | 'task';
export type LibraryStatus = 'draft' | 'testing' | 'approved' | 'needs-review' | 'deprecated' | 'archived';
export type VariableType = 'short-text' | 'long-text' | 'number' | 'date' | 'boolean' | 'single-select' | 'multi-select' | 'client' | 'product' | 'campaign' | 'content-pillar' | 'asset' | 'url' | 'approved-record' | 'ai-derived';
export interface PromptVariable { key: string; label: string; description?: string; type: VariableType; required: boolean; defaultValue?: string; allowedValues?: string[]; example?: string; operatorEditable?: boolean; displayOrder: number; }
export interface PromptCondition { field: 'deliverable' | 'platform' | 'objective' | 'industry' | 'clientId' | 'product' | 'modelFamily'; operator: 'equals' | 'includes'; value: string; }
export interface InstructionBlock { id: string; title: string; description?: string; instruction: string; category?: string; scope: PromptScope; priority?: number; status: LibraryStatus; version: number; tags: string[]; compatibleTasks?: string[]; compatibleIndustries?: string[]; compatibleModels?: string[]; source?: string; lastValidatedAt?: string; clientId?: number; conditions?: PromptCondition[]; createdAt: string; updatedAt: string; }
export interface ContextPack { id: string; name: string; description: string; packType: 'organization' | 'brand' | 'industry' | 'product' | 'campaign' | 'platform'; status: LibraryStatus; version: number; priority?: number; clientId?: number; productName?: string; required?: boolean; blockIds: string[]; assetUrls?: string[]; references?: string[]; tags?: string[]; lastValidatedAt?: string; createdAt: string; updatedAt: string; }
export interface PromptRecipe { id: string; name: string; description: string; taskType: string; outputType: string; status: LibraryStatus; version: number; requiredInputs: string[]; optionalInputs?: string[]; variables?: PromptVariable[]; requiredPackTypes?: ContextPack['packType'][]; defaultBlockIds?: string[]; conditionalBlockIds?: string[]; outputSchema?: string; evaluationRubricId?: string; compatibleModels?: string[]; defaultModel: string; createdAt: string; updatedAt: string; }
export interface PromptTemplate { id: string; title: string; description: string; category: string; content: string; status: LibraryStatus; version: number; tags: string[]; createdAt: string; updatedAt: string; }
export interface StructuredBrief { id: string; clientId: number; product?: string; campaign?: string; deliverableType: string; platform: string; objective: string; audience?: string; contentPillar?: string; funnelStage?: string; offer?: string; cta?: string; coreMessage?: string; format?: string; dimensions?: string; tone?: string; mandatoryInclusions?: string; prohibitedInclusions?: string; assetUrls?: string[]; brief: string; recipeId?: string; contextPackIds: string[]; status: 'draft' | 'compiled' | 'in-review'; createdAt: string; updatedAt: string; }
export interface PromptSourceSnapshot { type: 'template' | 'recipe' | 'block' | 'context-pack' | 'rubric' | 'model'; id: string; title: string; version: number; snapshot: string; }
export interface PromptAudit { readinessScore: number; blockingErrors: string[]; warnings: string[]; missingInputs: string[]; unresolvedVariables: string[]; duplicateInstructions: string[]; conflicts: string[]; }
export interface CompiledPrompt { id: string; briefId: string; prompt: string; appliedBlockIds: string[]; appliedPackIds: string[]; sourceSnapshots?: PromptSourceSnapshot[]; resolvedVariables?: Record<string, string>; audit?: PromptAudit; modelProfileId?: string; missingInputs: string[]; conflicts: string[]; createdAt: string; }
export interface GenerationRun { id: string; briefId: string; compiledPromptId: string; provider?: string; model?: string; status: 'ready-for-generation' | 'in-review' | 'approved' | 'failed'; qualityScore: number | null; reviewerFeedback: string; createdAt: string; }
export interface ModelProfile { id: string; provider: string; name: string; family: 'text' | 'image' | 'video' | 'multimodal'; contextLimit: number; supportsJson: boolean; supportedAssetTypes: string[]; active: boolean; version: number; createdAt: string; updatedAt: string; }
export interface QualityRubric { id: string; name: string; criteria: { id: string; label: string; weight: number; blocking?: boolean }[]; passThreshold: number; status: LibraryStatus; version: number; createdAt: string; updatedAt: string; }
export interface AppData { clients: Client[]; tasks: Task[]; posts: Post[]; onboardings: OnboardingProtocol[]; protocols: Protocol[]; teamMembers: TeamMember[]; instructionBlocks: InstructionBlock[]; contextPacks: ContextPack[]; promptRecipes: PromptRecipe[]; promptTemplates: PromptTemplate[]; modelProfiles: ModelProfile[]; qualityRubrics: QualityRubric[]; briefs: StructuredBrief[]; compiledPrompts: CompiledPrompt[]; generationRuns: GenerationRun[]; settings: { ceoPhraseHash: string | null; teamPhraseHash: string | null; initialized: boolean; lastUpdated: string | null; }; }

export const INITIAL_DATA: AppData = {
  clients: [], tasks: [], posts: [], onboardings: [], protocols: [], teamMembers: [], instructionBlocks: [], contextPacks: [], promptRecipes: [], promptTemplates: [], modelProfiles: [], qualityRubrics: [], briefs: [], compiledPrompts: [], generationRuns: [],
  settings: { ceoPhraseHash: null, teamPhraseHash: null, initialized: false, lastUpdated: null },
};

export const generateOnboardingProtocol = (clientId: number): OnboardingProtocol => ({
  id: `onboarding-${clientId}-${Date.now()}`, clientId, progress: 0, status: 'on-track', lastUpdated: new Date().toISOString(),
  steps: [
    ['1', 'Confirm revenue gate and client fit', 'CEO', 'Confirm the client is qualified and the agreed tier is correct.'],
    ['2', 'Confirm contract and first payment', 'Team', 'Make sure the agreement is signed and payment is received.'],
    ['3', 'Collect the intake form and brand files', 'Team', 'Request brand assets, access, competitors, and audience context.'],
    ['4', 'Create the shared client workspace', 'Team', 'Create the communication channel and shared delivery folders.'],
    ['5', 'Run the kickoff call', 'CEO', 'Document goals, risks, context, and decision makers.'],
    ['6', 'Document client strategy', 'CEO', 'Capture audience insight, the core problem, and content pillars.'],
    ['7', 'Draft the strategy brief', 'Team', 'Prepare the positioning, content plan, gaps, and milestones.'],
    ['8', 'Approve the strategy brief', 'CEO', 'No production should start until the strategy is approved.'],
    ['9', 'Plan the first month of content', 'Team', 'Create the first calendar and assign content owners.'],
    ['10', 'Start the first sprint', 'Team', 'Create or generate the first set of delivery tasks.'],
  ].map(([id, label, owner, details]) => ({ id, label, owner: owner as 'CEO' | 'Team', details, completed: false })),
});

export const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return INITIAL_DATA;
  try {
    const parsed = JSON.parse(stored) as AppData;
    const isLegacyDemo = parsed.clients?.length === 2 && parsed.clients.every(client => ['Mozart House', 'YZ Corp'].includes(client.name));
    return isLegacyDemo ? INITIAL_DATA : { ...INITIAL_DATA, ...parsed, teamMembers: parsed.teamMembers || [], instructionBlocks: parsed.instructionBlocks || [], contextPacks: parsed.contextPacks || [], promptRecipes: parsed.promptRecipes || [], promptTemplates: parsed.promptTemplates || [], modelProfiles: parsed.modelProfiles || [], qualityRubrics: parsed.qualityRubrics || [], briefs: parsed.briefs || [], compiledPrompts: parsed.compiledPrompts || [], generationRuns: parsed.generationRuns || [] };
  } catch {
    return INITIAL_DATA;
  }
};

export const saveData = (data: AppData) => {
  const dataToSave = { ...data, settings: { ...data.settings, lastUpdated: new Date().toISOString() } };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  syncTasksToSupabase(dataToSave.tasks);
  syncPostsToSupabase(dataToSave.posts);
  syncPromptOsToSupabase(dataToSave);
  syncSettingsToSupabase(dataToSave.settings);
};

export const hashPassphrase = (phrase: string): string => {
  let hash = 0;
  for (let index = 0; index < phrase.length; index += 1) hash = ((hash << 5) - hash) + phrase.charCodeAt(index) | 0;
  return hash.toString();
};

export const DEFAULT_CEO_PASSPHRASES = ['NERO2024CEO', 'NEROCEO16'];
export const DEFAULT_TEAM_PASSPHRASES = ['NERO2024TEAM', 'NEROTEAM2025'];

export const validatePassphrase = (
  input: string,
  settings?: AppData['settings'] | null
): 'ceo' | 'team' | null => {
  const normalized = input.trim().toUpperCase();
  if (!normalized) return null;

  const hashed = hashPassphrase(normalized);

  // 1. Check against custom CEO hash if configured
  if (settings?.ceoPhraseHash && hashed === settings.ceoPhraseHash) {
    return 'ceo';
  }
  // 2. Check against default CEO passphrases
  if (DEFAULT_CEO_PASSPHRASES.map(p => p.toUpperCase()).includes(normalized)) {
    return 'ceo';
  }

  // 3. Check against custom Team hash if configured
  if (settings?.teamPhraseHash && hashed === settings.teamPhraseHash) {
    return 'team';
  }
  // 4. Check against default Team passphrases
  if (DEFAULT_TEAM_PASSPHRASES.map(p => p.toUpperCase()).includes(normalized)) {
    return 'team';
  }

  return null;
};

