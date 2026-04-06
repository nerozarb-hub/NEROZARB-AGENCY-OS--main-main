export const STORAGE_KEY = 'nerozarb-os-v2';

export interface TimelineEvent {
    id: number;
    date: string;
    event: string;
    type: 'system' | 'manual';
}

export interface OnboardingStep {
    id: string;
    label: string;
    completed: boolean;
    owner: 'CEO' | 'Team';
    details?: string;
    completedAt?: string;
}

export interface OnboardingProtocol {
    id: string;
    clientId: number;
    steps: OnboardingStep[];
    progress: number;
    status: 'on-track' | 'blocked' | 'completed';
    lastUpdated: string;
}

export const generateOnboardingProtocol = (clientId: number): OnboardingProtocol => {
    return {
        id: `obs-${clientId}-${Date.now()}`,
        clientId,
        progress: 0,
        status: 'on-track',
        lastUpdated: new Date().toISOString(),
        steps: [
            { id: '1', label: 'Revenue Gate Qualified', completed: false, owner: 'CEO', details: 'Client has passed the Revenue Gate. Annual revenue verified (T1: <1M, T2: 1M–5M, T3: >5M PKR). Tier assignment confirmed.' },
            { id: '2', label: 'Contract Signed & Invoice Paid', completed: false, owner: 'Team', details: 'Digital contract executed. First invoice generated and payment received via bank transfer or JazzCash/Easypaisa.' },
            { id: '3', label: 'Intake Form Received', completed: false, owner: 'Team', details: 'Standard NEROZARB intake form sent via Typeform/Tally. Client fills: brand assets, competitor URLs, target audience, content examples they admire, access credentials.' },
            { id: '4', label: 'Client Workspace Created', completed: false, owner: 'Team', details: 'WhatsApp group created with client + team. Shared Google Drive folder initialized with subfolders: /Brand Assets, /Deliverables, /Approvals, /Reports.' },
            { id: '5', label: 'Kickoff Call Completed', completed: false, owner: 'CEO', details: 'CEO runs the kickoff call to extract the Shadow Avatar and Bleeding Neck. Record call for transcript. Duration: 45–60 min.' },
            { id: '6', label: 'Shadow Avatar & Bleeding Neck Extracted', completed: false, owner: 'CEO', details: 'From kickoff transcript: identify the Surface Want vs. Shadow Fear. Document the Bleeding Neck (acute pain point). Update Client Profile → Strategic Intelligence section.' },
            { id: '7', label: 'Strategy Brief Drafted', completed: false, owner: 'Team', details: 'Team drafts the Strategy Brief within 48h of kickoff. Includes: market positioning, content pillars (Mozart Framework), competitor gaps, 60-day milestone roadmap.' },
            { id: '8', label: 'Strategy Brief Approved (CEO Gate)', completed: false, owner: 'CEO', details: 'CEO reviews and approves the Strategy Brief. This is a hard gate — no production starts until this is signed off.' },
            { id: '9', label: 'Content Calendar Generated', completed: false, owner: 'Team', details: 'Generate 30-day content calendar in Content OS. Assign post types across pillars. Schedule dates and assign to Art Director / Video Editor.' },
            { id: '10', label: 'Sprint Board Initialized & First Batch in Production', completed: false, owner: 'Team', details: 'Create Phase 1 Sprint Tasks in Fulfillment OS (7 standard tasks). Art Director begins Template generation. First batch of 4–6 posts enters production.' },
        ]
    };
};

export interface ProjectPhase {
    id: number;
    clientId: number;
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    orderIndex: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ClientUpdate {
    id: number;
    clientId: number;
    message: string;
    createdAt?: string;
}

export interface Client {
    id: number;
    name: string;
    status: 'Lead' | 'Discovery' | 'Active Sprint' | 'Retainer' | 'Closed';
    revenueGate: '<1M PKR' | '1M–5M PKR' | '>5M PKR' | string;
    tier: 'Tier 1: Active Presence' | 'Tier 2: 60-Day Sprint' | 'Tier 3: Market Dominance' | string;
    ltv: number;
    contractValue: number;
    phone: string;
    email: string;
    contactName: string;
    niche: string;
    startDate: string;
    shadowAvatar: string;
    bleedingNeck: string;
    contentPillars: string[];
    relationshipHealth: 'healthy' | 'at-risk' | 'critical';
    onboardingStatus: 'not-started' | 'in-progress' | 'complete';
    notes: string;
    timeline: TimelineEvent[];
    magicLinkToken?: string | null;
    projectPhases?: ProjectPhase[];
    clientUpdates?: ClientUpdate[];
    createdAt: string;
    updatedAt: string;
}

export type TaskCategory = 'Content Production' | 'Ad Creative' | 'Website' | 'Strategy' | 'Video Production' | 'Brand Design' | 'Analytics' | 'Automation' | 'Client Communication' | 'Other';
export type NodeRole = 'CEO' | 'Art Director' | 'Video Editor' | 'Operations Builder' | 'Social Media Manager' | 'Documentation Manager';
export type Stage = 'BRIEFED' | 'IN PRODUCTION' | 'REVIEW' | 'CEO APPROVAL' | 'CLIENT APPROVAL' | 'DEPLOYED';

export interface ActivityEntry {
    timestamp: string;
    type: 'stage_advance' | 'stage_regress' | 'note' | 'created' | 'edited';
    from: string | null;
    to: string | null;
    text: string;
    author: 'ceo' | 'team';
}

export interface Task {
    id: number;
    clientId: number;
    name: string;
    category: TaskCategory;
    phase: 'phase1' | 'phase2' | 'phase3' | 'ongoing';
    stagePipeline: Stage[];
    currentStage: Stage;
    assignedNode: NodeRole;
    priority: 'critical' | 'high' | 'normal';
    status: 'active' | 'deployed' | 'cancelled';
    deadline: string;
    estimatedHours: number | null;
    brief: string;
    assetLinks: string[];
    sopReference: string | null;
    activityLog: ActivityEntry[];
    notes: string;
    deliveredOnTime: boolean | null;
    linkedPostId: number | null;
    createdAt: string;
    updatedAt: string;
}

export type PostStage = 'PLANNED' | 'BRIEF WRITTEN' | 'IN PRODUCTION' | 'REVIEW' | 'CEO APPROVAL' | 'CLIENT APPROVAL' | 'SCHEDULED' | 'PUBLISHED';
export type Platform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'twitter';
export type PostType = 'Reel / Short Video' | 'Static Post' | 'Carousel' | 'Story' | 'Text Post' | 'Event Post';
export type CTAType = 'Comment' | 'Link in bio' | 'DM for' | 'Save this' | 'Share this' | 'Custom';
export type TemplateType = 'Template A' | 'Template B' | 'Template C' | 'Custom';

// --- Phase 5: Knowledge Vault OS ---
export type PillarType = 'Market Truth' | 'Psychological Warfare' | 'Conversion Mechanic' | 'Viral Engine' | 'Growth Math' | 'Operations' | 'Client Management';
export type ProtocolCategory = 'sop' | 'ai-prompt' | 'client-knowledge-base' | 'brand-standard';
export type ProtocolStatus = 'active' | 'draft' | 'archived';

export interface Protocol {
    id: number;
    title: string;
    category: ProtocolCategory;
    pillar: PillarType;
    tags: string[];
    status: ProtocolStatus;
    content: string;

    // AI Prompt specific
    promptTool: 'gemini' | 'claude' | 'both' | null;
    promptVariables: string[];
    usageNotes: string | null;
    exampleOutput: string | null;

    // Linking
    linkedTaskTypes: TaskCategory[];
    linkedClientId: number | null;
    relatedProtocolIds: number[];

    externalReferences: string[];

    createdAt: string;
    updatedAt: string;
    copyCount: number;
}

export interface PerformanceLog {
    reach: number;
    impressions: number;
    saves: number;
    shares: number;
    comments: number;
    likes: number;
    saveRate: number;
    shareRate: number;
    ceoRating: '🔴 Underperformed' | '🟡 Performed' | '🟢 Overperformed';
    notes: string;
}

export interface Post {
    id: number;
    clientId: number;
    platforms: Platform[];
    postType: PostType;
    contentPillar: string;
    templateType: TemplateType | null;

    hook: string;
    triggerUsed: string | null;
    captionBody: string;
    cta: string;
    ctaType: CTAType;
    hashtags: string;
    visualBrief: string;

    scheduledDate: string;
    scheduledTime: string;
    publishedDate: string | null;

    status: PostStage;
    priority: 'normal' | 'high' | 'urgent';
    assignedTo: NodeRole;
    linkedTaskId: number | null;
    linkedPromptId?: number | null;

    assetLinks: string[];
    referencePost: string | null;

    performance: PerformanceLog | null;
    activityLog: ActivityEntry[];

    createdAt: string;
    updatedAt: string;
}

export interface AppData {
    clients: Client[];
    tasks: Task[];
    posts: Post[];
    onboardings: OnboardingProtocol[];
    protocols: Protocol[];
    settings: {
        ceoPhraseHash: string | null;
        teamPhraseHash: string | null;
        initialized: boolean;
        lastUpdated: string | null;
    };
}

export const INITIAL_DATA: AppData = {
    clients: [
        {
            id: 1,
            name: 'Mozart House',
            status: 'Active Sprint',
            revenueGate: '1M–5M PKR',
            tier: 'Tier 2: 60-Day Sprint',
            ltv: 150000,
            contractValue: 150000,
            phone: '0300-1234567',
            email: 'hello@mozarthouse.pk',
            contactName: 'Creative Director — Ahmed',
            niche: 'Cultural Center / Creative Hub',
            startDate: '2026-02-01',
            shadowAvatar: 'Surface: grow internationally. Shadow: terrified of losing cultural relevance to mainstream noise.',
            bleedingNeck: 'Strong offline reputation, zero consistent digital presence.',
            contentPillars: ['Exhibition Announcements', 'Artist Spotlights', 'Cultural Education', 'Behind-the-Scenes'],
            relationshipHealth: 'healthy',
            onboardingStatus: 'complete',
            notes: 'Primary active client. Austrian Cultural Centre collaboration ongoing.',
            timeline: [
                { id: 1, date: '2026-02-01T10:00:00Z', event: 'Client Installed via Revenue Gate', type: 'system' },
                { id: 2, date: '2026-02-01T11:00:00Z', event: 'Contract Signed & Invoice Paid', type: 'manual' },
                { id: 3, date: '2026-02-02T14:00:00Z', event: 'Sprint 1 Initiated', type: 'system' }
            ],
            createdAt: '2026-02-01T10:00:00Z',
            updatedAt: new Date().toISOString()
        },
        {
            id: 2,
            name: 'YZ Corp',
            status: 'Discovery',
            revenueGate: '>5M PKR',
            tier: 'Tier 3: Market Dominance',
            ltv: 0,
            contractValue: 300000,
            phone: '0333-9876543',
            email: 'contact@yzcorp.pk',
            contactName: 'CEO — Fatima',
            niche: 'Educational Services / B2B',
            startDate: new Date().toISOString().split('T')[0],
            shadowAvatar: 'Surface: wants to modernize. Shadow: afraid of alienating legacy clients with a trendy look.',
            bleedingNeck: 'Outdated web presence causing loss of trust in enterprise deals.',
            contentPillars: ['Corporate Authority', 'Case Studies', 'Legacy Meets Innovation'],
            relationshipHealth: 'healthy',
            onboardingStatus: 'not-started',
            notes: 'Discovery call completed. Proposal sent.',
            timeline: [
                { id: 1, date: new Date().toISOString(), event: 'Client discovery call scheduled.', type: 'manual' }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ],
    tasks: [
        {
            id: 1,
            clientId: 1,
            name: 'Brand & Positioning Audit',
            category: 'Strategy',
            phase: 'phase1',
            stagePipeline: ['BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED'],
            currentStage: 'IN PRODUCTION',
            assignedNode: 'Art Director',
            priority: 'high',
            status: 'active',
            deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            estimatedHours: 4,
            brief: 'Audit current brand: logo, colors, voice, content pillars. Document what exists vs. what\'s needed.',
            assetLinks: ['https://drive.google.com/drive/folders/audit123'],
            sopReference: null,
            activityLog: [
                {
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    type: 'created',
                    from: null,
                    to: null,
                    text: 'Task created and assigned to Art Director',
                    author: 'ceo'
                },
                {
                    timestamp: new Date().toISOString(),
                    type: 'stage_advance',
                    from: 'BRIEFED',
                    to: 'IN PRODUCTION',
                    text: 'Advanced from BRIEFED to IN PRODUCTION',
                    author: 'team'
                }
            ],
            notes: '',
            deliveredOnTime: null,
            linkedPostId: null,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString()
        }
    ],
    posts: [
        {
            id: 1,
            clientId: 1,
            platforms: ['instagram'],
            postType: 'Static Post',
            contentPillar: 'Exhibition Announcements',
            templateType: 'Template B',
            hook: 'DO NOT MISS THE OPENING NIGHT...',
            triggerUsed: null,
            captionBody: 'Join us this Friday for the opening of our new neo-classical exhibition. Experience art like never before.',
            cta: 'Link in bio to RSVP',
            ctaType: 'Link in bio',
            hashtags: '#mozarthouse #artexhibition #lahore',
            visualBrief: 'Create a high-contrast elegant graphic using the Template B layout. Feature the main artwork prominently.',
            scheduledDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
            scheduledTime: '10:00',
            publishedDate: null,
            status: 'PLANNED',
            priority: 'normal',
            assignedTo: 'Art Director',
            linkedTaskId: null,
            assetLinks: [],
            referencePost: null,
            performance: null,
            activityLog: [
                {
                    timestamp: new Date().toISOString(),
                    type: 'created',
                    from: null,
                    to: null,
                    text: 'Post planned',
                    author: 'ceo'
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ],
    onboardings: [],
    protocols: [
        // --- SOPs ---
        {
            id: 101,
            title: 'CLIENT ONBOARDING PROTOCOL',
            category: 'sop',
            pillar: 'Operations',
            tags: ['onboarding', 'client', 'setup'],
            status: 'active',
            content: '## Step 1: Revenue Gate Acceptance\\nEnsure client has passed the revenue gate and contract is signed.\\n\\n## Step 2: Intake Form\\nSend the standard NEROZARB intake form via Typeform.\\n\\n## Step 3: Slack Channel\\nCreate `#prj-[client-name]` and invite stakeholders.\\n\\n## Step 4: Kickoff Call\\nCEO runs the kickoff to extract the Shadow Avatar.\\n\\n## Step 5: Strategy Brief\\nTeam drafts the Strategy Brief within 48h of kickoff.\\n\\n## Step 6: Approval\\nCEO approves the brief.\\n\\n## Step 7: Content Calendar\\nGenerate 30-day content calendar in Content OS.\\n\\n## Step 8: Sprint Initialization\\nCreate Active Sprint board.\\n\\n## Step 9: Production\\nArt Director starts Template generation.\\n\\n## Step 10: First Batch\\nReview first batch of content internally.',
            promptTool: null,
            promptVariables: [],
            usageNotes: null,
            exampleOutput: null,
            linkedTaskTypes: ['Client Communication'],
            linkedClientId: null,
            relatedProtocolIds: [],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 102,
            title: 'CONTENT PRODUCTION PROTOCOL',
            category: 'sop',
            pillar: 'Viral Engine',
            tags: ['content', 'caption', 'instagram'],
            status: 'active',
            content: '## The HOOK → TENSION → VALUE → PROOF → CTA Framework\\n\\nEvery caption must follow this structure.\\n\\n**1. Hook (The scroll stopper)**\\nNever start with "Hi guys" or "We are excited". Start with the problem.\\n\\n**2. Tension (The bleeding neck)**\\nAgitate the problem. Make them feel it.\\n\\n**3. Value (The medicine)**\\nProvide the actual solution. Be specific.\\n\\n**4. Proof (The authority)**\\nWhy should they listen to us? Mention a result.\\n\\n**5. CTA (The next step)**\\nOne single clear action. "Comment X", "Link in bio", or "Save this".',
            promptTool: null,
            promptVariables: [],
            usageNotes: null,
            exampleOutput: null,
            linkedTaskTypes: ['Content Production'],
            linkedClientId: null,
            relatedProtocolIds: [],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 103,
            title: 'AD CREATIVE PROTOCOL',
            category: 'sop',
            pillar: 'Conversion Mechanic',
            tags: ['ads', 'meta', 'creative'],
            status: 'active',
            content: '## Meta Ad Funnel Structure\\n\\n### Cold Audience (Top of Funnel)\\n**Framework:** PAS (Problem, Agitation, Solution)\\n**Visuals:** High contrast, fast cuts (if video), face prominent.\\n\\n### Warm Audience (Middle of Funnel)\\n**Framework:** AIDA (Attention, Interest, Desire, Action)\\n**Visuals:** Authority building, process breakdowns, behind-the-scenes.\\n\\n### Retargeting (Bottom of Funnel)\\n**Framework:** Testimonial / Offer-driven\\n**Visuals:** Social proof, text-heavy reviews, clear offer stack.',
            promptTool: null,
            promptVariables: [],
            usageNotes: null,
            exampleOutput: null,
            linkedTaskTypes: ['Ad Creative'],
            linkedClientId: null,
            relatedProtocolIds: [],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 104,
            title: 'VISUAL BRIEF WRITING PROTOCOL',
            category: 'sop',
            pillar: 'Viral Engine',
            tags: ['design', 'briefs', 'art director'],
            status: 'active',
            content: '## How to brief the Art Director\\n\\nIf they have to ask a question, your brief failed.\\n\\n**Template:**\\n- **Goal:** (What is this post trying to achieve?)\\n- **Template:** (A, B, or C)\\n- **Text on Image:** (Exactly what words go on the graphic)\\n- **Visual Vibe:** (Dark, light, high-contrast, minimal)\\n- **Assets to Use:** (Link to exact Drive folder)\\n- **Avoid:** (What NOT to do)',
            promptTool: null,
            promptVariables: [],
            usageNotes: null,
            exampleOutput: null,
            linkedTaskTypes: ['Brand Design', 'Content Production'],
            linkedClientId: null,
            relatedProtocolIds: [],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 105,
            title: 'SHADOW AVATAR EXTRACTION PROTOCOL',
            category: 'sop',
            pillar: 'Psychological Warfare',
            tags: ['strategy', 'kickoff', 'avatar'],
            status: 'active',
            content: '## Extracting the Shadow\\n\\nClients will tell you the surface desire: "I want more sales."\\nYou need to find the shadow desire: "I want to prove my father wrong." (extreme example) or "I want to stop worrying about payroll."\\n\\n**The 7 Questions:**\\n1. If this fails, what is the absolute worst consequence for you personally?\\n2. What do your competitors do that secretly annoys you?\\n3. What is the one thing you are afraid your customers currently think about you?\\n4. (And so on...)\\n\\nListen for hesitation. That is where the truth is.',
            promptTool: null,
            promptVariables: [],
            usageNotes: null,
            exampleOutput: null,
            linkedTaskTypes: ['Strategy'],
            linkedClientId: null,
            relatedProtocolIds: [],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 106,
            title: 'SPRINT DEBRIEF PROTOCOL',
            category: 'sop',
            pillar: 'Growth Math',
            tags: ['analytics', 'sprints', 'review'],
            status: 'active',
            content: '## 60-Day Sprint Retrospective\\n\\nRun this on Day 55 of any sprint.\\n\\n**Data to Collect:**\\n1. Follower delta\\n2. Average engagement rate increase\\n3. Leads generated vs. Leads expected\\n4. Viral hits (>2x average reach)\\n\\n**Questions to ask:**\\n- Did we hit the primary objective?\\n- Is the client acting like a true partner or a dictator?\\n- Should we pitch Tier 3 Market Dominance?\\n\\n**Outputs:**\\nA formal PDF report sent to the client summarizing the wins and the next 60-day plan.',
            promptTool: null,
            promptVariables: [],
            usageNotes: null,
            exampleOutput: null,
            linkedTaskTypes: ['Analytics', 'Strategy'],
            linkedClientId: null,
            relatedProtocolIds: [],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 107,
            title: 'REVENUE GATE PROTOCOL',
            category: 'sop',
            pillar: 'Growth Math',
            tags: ['sales', 'qualification', 'leads'],
            status: 'active',
            content: '## The Revenue Gate System\\n\\nWe do not take everyone.\\n\\n**<1M PKR ARR:**\\nRoute strictly to digital products or group coaching. Do not sell agency services.\\n\\n**1M - 5M PKR ARR:**\\nRoute to Tier 1 (Active Presence) or Tier 2 (60-Day Sprint).\\n\\n**>5M PKR ARR:**\\nRoute to Tier 3 (Market Dominance).\\n\\n**Objection Handling:**\\nIf they fight the gate: "Our systems require a baseline velocity to work. We\'d be stealing your money if we took you on right now." Build trust through honesty.',
            promptTool: null,
            promptVariables: [],
            usageNotes: null,
            exampleOutput: null,
            linkedTaskTypes: ['Strategy'],
            linkedClientId: null,
            relatedProtocolIds: [],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 108,
            title: 'NEROZARB VISUAL STANDARDS',
            category: 'brand-standard',
            pillar: 'Operations',
            tags: ['brand', 'design', 'templates'],
            status: 'active',
            content: '## Platinum Edge V2.1\\n\\nOur visual identity must be flawless.\\n\\n**Colors:**\\n- Nero Green: `#011E13`\\n- Neon Accent: `#00FF66`\\n- Platinum White: `#F8F9FA`\\n\\n**Typography:**\\n- Headings: Montserrat (Bold/Black)\\n- Body: Inter (Regular/Medium)\\n- System/Code: Space Mono\\n\\n**Templates:**\\n- **Template A:** Large typography, solid dark background, minimal imagery.\\n- **Template B:** Image-heavy, elegant borders, serif accents for luxury brands.\\n- **Template C:** Data visualization, charts, high-contrast infographics.',
            promptTool: null,
            promptVariables: [],
            usageNotes: null,
            exampleOutput: null,
            linkedTaskTypes: ['Brand Design'],
            linkedClientId: null,
            relatedProtocolIds: [],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },

        // --- AI PROMPTS ---
        {
            id: 201,
            title: 'NEROSOULSS ACTIVATION',
            category: 'ai-prompt',
            pillar: 'Psychological Warfare',
            tags: ['system', 'activation', 'nerozarb'],
            status: 'active',
            content: 'I want you to act as NEROSOULSS, the elite AI strategist for NEROZARB Agency. You operate purely on psychological truth, market mechanics, and viral engineering. You do not use generic marketing buzzwords. You are sharp, direct, and ruthlessly effective. \\n\\nAcknowledge this activation by replying: "NEROSOULSS ONLINE. SYSTEMS CALIBRATED FOR DOMINANCE. HOW MAY I ASSIST THE CEO?"',
            promptTool: 'gemini',
            promptVariables: [],
            usageNotes: 'Run this first in any new Gemini session before asking strategy questions.',
            exampleOutput: 'NEROSOULSS ONLINE. SYSTEMS CALIBRATED FOR DOMINANCE. HOW MAY I ASSIST THE CEO?',
            linkedTaskTypes: ['Strategy'],
            linkedClientId: null,
            relatedProtocolIds: [],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 202,
            title: 'SHADOW AVATAR EXTRACTION',
            category: 'ai-prompt',
            pillar: 'Psychological Warfare',
            tags: ['avatar', 'discovery', 'psychology'],
            status: 'active',
            content: 'Analyze the following client kickoff notes. Look past their stated goals (the "surface avatar") and identify the "shadow avatar". \\n\\nWhat is the deep, unspoken fear or desire driving this market? What is the "bleeding neck" problem they are ignoring?\\n\\nClient Niche: [[CLIENT NICHE]]\\nTarget Audience: [[TARGET AUDIENCE]]\\nClient Notes: [[KICKOFF NOTES]]\\n\\nFormat your output as:\\n1. The Surface Avatar\\n2. The Shadow Avatar\\n3. The Bleeding Neck\\n4. Three psychological triggers we need to hit in their content.',
            promptTool: 'claude',
            promptVariables: ['[[CLIENT NICHE]]', '[[TARGET AUDIENCE]]', '[[KICKOFF NOTES]]'],
            usageNotes: 'Paste raw transcripts from the kickoff call into the notes variable.',
            exampleOutput: null,
            linkedTaskTypes: ['Strategy'],
            linkedClientId: null,
            relatedProtocolIds: [105],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 203,
            title: 'COMPETITOR TEARDOWN',
            category: 'ai-prompt',
            pillar: 'Market Truth',
            tags: ['research', 'competitors', 'analysis'],
            status: 'active',
            content: 'Act as a ruthless market analyst. I am going to give you three competitors of my client.\\n\\nClient Niche: [[CLIENT NICHE]]\\nCompetitor 1: [[COMP 1 URL]]\\nCompetitor 2: [[COMP 2 URL]]\\nCompetitor 3: [[COMP 3 URL]]\\n\\nBreak down their strategies:\\n1. What is their core promise?\\n2. Where is their offer weak?\\n3. What is the "Blue Ocean" gap they are leaving wide open that my client can dominate?\\n4. Give me a 1-sentence positioning statement that instantly makes these competitors look outdated.',
            promptTool: 'gemini',
            promptVariables: ['[[CLIENT NICHE]]', '[[COMP 1 URL]]', '[[COMP 2 URL]]', '[[COMP 3 URL]]'],
            usageNotes: 'Best used with Gemini\'s web browsing capabilities.',
            exampleOutput: null,
            linkedTaskTypes: ['Strategy', 'Analytics'],
            linkedClientId: null,
            relatedProtocolIds: [],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 204,
            title: 'CAPTION WRITING — HOOK FIRST',
            category: 'ai-prompt',
            pillar: 'Viral Engine',
            tags: ['caption', 'instagram', 'copywriting'],
            status: 'active',
            content: 'Write an Instagram caption using the HOOK → TENSION → VALUE → PROOF → CTA framework. \\n\\nTopic: [[CONTENT TOPIC]]\\nTone: [[BRAND TONE]]\\nAction: [[DESIRED ACTION]]\\n\\nThe hook MUST be under 10 words and address a painful problem. Do not use emojis in the first 3 lines. Keep paragraphs to 1-2 sentences maximum. Ensure it sounds like a human wrote it, not an AI.',
            promptTool: 'claude',
            promptVariables: ['[[CONTENT TOPIC]]', '[[BRAND TONE]]', '[[DESIRED ACTION]]'],
            usageNotes: 'Claude is much better at natural-sounding copy than Gemini.',
            exampleOutput: null,
            linkedTaskTypes: ['Content Production'],
            linkedClientId: null,
            relatedProtocolIds: [102],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 205,
            title: 'AD HOOK GENERATOR',
            category: 'ai-prompt',
            pillar: 'Conversion Mechanic',
            tags: ['ads', 'hooks', 'performance'],
            status: 'active',
            content: 'Generate 5 completely different, pattern-interrupting hooks for a Meta Video Ad.\\n\\nProduct/Service: [[PRODUCT DESC]]\\nAudience Pain Point: [[PAIN POINT]]\\n\\nThe hooks must be visual (describe what happens on screen) and verbal (what the person says). \\n\\nAim for:\\n1. The Negative Hook (Why you shouldn\'t...)\\n2. The Contrarian Hook (Everything you know is wrong)\\n3. The Direct Callout (If you are X, watch this)\\n4. The Secret Angle (The real reason why...)\\n5. The Agitation Hook (Does your X do this...?)',
            promptTool: 'claude',
            promptVariables: ['[[PRODUCT DESC]]', '[[PAIN POINT]]'],
            usageNotes: 'Use these to brief the video editor.',
            exampleOutput: null,
            linkedTaskTypes: ['Ad Creative', 'Video Production'],
            linkedClientId: null,
            relatedProtocolIds: [103],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 206,
            title: 'BLEEDING NECK IDENTIFICATION',
            category: 'ai-prompt',
            pillar: 'Psychological Warfare',
            tags: ['strategy', 'avatar', 'pain-point'],
            status: 'active',
            content: 'Act as a behavioral psychologist specializing in consumer purchasing patterns.\\n\\nMy client sells: [[SERVICE/PRODUCT]]\\nTo: [[TARGET AUDIENCE]]\\n\\nIdentify the "Bleeding Neck" problem. This is the acute, urgent, painful problem that forces them to buy right now. Not a "nice to have," but an absolute necessity.\\n\\nList 3 potential bleeding neck angles, and rank them by urgency.',
            promptTool: 'gemini',
            promptVariables: ['[[SERVICE/PRODUCT]]', '[[TARGET AUDIENCE]]'],
            usageNotes: 'Crucial for offer creation.',
            exampleOutput: null,
            linkedTaskTypes: ['Strategy'],
            linkedClientId: null,
            relatedProtocolIds: [],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 207,
            title: 'CONTENT PILLAR GENERATOR',
            category: 'ai-prompt',
            pillar: 'Viral Engine',
            tags: ['content', 'strategy', 'pillars'],
            status: 'active',
            content: 'Based on this brand summary, generate 4 exact content pillars for their organic social strategy.\\n\\nBrand Summary: [[BRAND SUMMARY]]\\n\\nFor each pillar, provide:\\n1. Name (snappy)\\n2. Goal (Authority, Trust, Viral, Conversion)\\n3. 3 sample video topics\\n4. Expected emotion to elicit from the viewer',
            promptTool: 'claude',
            promptVariables: ['[[BRAND SUMMARY]]'],
            usageNotes: 'Run this right after the strategy brief is approved.',
            exampleOutput: null,
            linkedTaskTypes: ['Strategy', 'Content Production'],
            linkedClientId: null,
            relatedProtocolIds: [],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 208,
            title: 'NEROLEAD — OUTREACH SCRIPTS',
            category: 'ai-prompt',
            pillar: 'Growth Math',
            tags: ['sales', 'outreach', 'whatsapp'],
            status: 'active',
            content: 'Write a cold WhatsApp outreach script for my agency.\\n\\nMy Agency NEROZARB offers: Elite brand positioning and content systems.\\nTarget Lead: [[LEAD NAME/ROLE]] at [[LEAD COMPANY]]\\nLead Context: [[LEAD CONTEXT / WHY REACHING OUT]]\\n\\nRules:\\n1. Max 4 short lines.\\n2. No generic greetings (e.g., "Hope you are well").\\n3. Must contain a personalized observation.\\n4. Soft CTA asking for a quick reply, not a 30-min call.',
            promptTool: 'gemini',
            promptVariables: ['[[LEAD NAME/ROLE]]', '[[LEAD COMPANY]]', '[[LEAD CONTEXT / WHY REACHING OUT]]'],
            usageNotes: 'Keep the context specific to improve conversion.',
            exampleOutput: null,
            linkedTaskTypes: ['Other', 'Strategy'],
            linkedClientId: null,
            relatedProtocolIds: [],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        },
        {
            id: 209,
            title: 'SPRINT DEBRIEF',
            category: 'ai-prompt',
            pillar: 'Growth Math',
            tags: ['analytics', 'sprints', 'review'],
            status: 'active',
            content: 'Act as a ruthless performance analyst.\\n\\nReview this 60-day sprint data:\\n[[SPRINT METRICS]]\\n\\nWrite a brutal internal memo to the agency team pointing out:\\n1. What actually worked.\\n2. Where we are lying to ourselves about performance.\\n3. What exactly needs to change for the next 60 days to scale this client to the next Revenue Gate.',
            promptTool: 'claude',
            promptVariables: ['[[SPRINT METRICS]]'],
            usageNotes: 'Used for internal team alignment before presenting the debrief to the client.',
            exampleOutput: null,
            linkedTaskTypes: ['Analytics'],
            linkedClientId: null,
            relatedProtocolIds: [106],
            externalReferences: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            copyCount: 0
        }
    ],
    settings: {
        ceoPhraseHash: null,
        teamPhraseHash: null,
        initialized: false,
        lastUpdated: null,
    },
};

export const loadData = (): AppData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_DATA;
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse storage data', e);
        return INITIAL_DATA;
    }
};

import { syncTasksToSupabase, syncPostsToSupabase, syncSettingsToSupabase } from './supabaseSync';

export const saveData = (data: AppData) => {
    const dataToSave = {
        ...data,
        settings: {
            ...data.settings,
            lastUpdated: new Date().toISOString(),
        },
    };

    // 1. Save locally for instant optimistic UI
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

    // 2. Sync to Supabase in the background
    // Note: Clients, Protocols, and Onboardings are usually synced individually when edited to save bandwidth.
    // We bulk-sync Tasks and Posts here since they change frequently via drag-and-drop.
    syncTasksToSupabase(dataToSave.tasks);
    syncPostsToSupabase(dataToSave.posts);
    syncSettingsToSupabase(dataToSave.settings);
};

// Simple hash function for demo purposes (usually you'd use something more secure)
export const hashPassphrase = (phrase: string): string => {
    let hash = 0;
    for (let i = 0; i < phrase.length; i++) {
        const char = phrase.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
};
