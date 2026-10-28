import type { Client, PromptTemplate } from '../../utils/storage';

export const PROMPT_CATEGORIES = [
  'Brand Story',
  'Strategy',
  'Brainstorming',
  'Art Direction',
  'Image Prompts',
  'Videos',
  'Storytelling',
  'Copywriting & Scripting',
] as const;

export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];

export const CLIENT_AUTO_VARIABLES = [
  { token: '{{client.name}}', label: 'Client Name', description: 'Pulls client name from record' },
  { token: '{{client.niche}}', label: 'Client Niche', description: 'Pulls client industry/niche' },
  { token: '{{client.audience}}', label: 'Target Audience', description: 'Pulls shadow avatar / audience' },
  { token: '{{client.problem}}', label: 'Core Problem', description: 'Pulls bleeding-neck problem' },
  { token: '{{client.pillars}}', label: 'Content Pillars', description: 'Pulls client content pillars' },
] as const;

export const QUICK_CUSTOM_VARIABLES = [
  'topic',
  'offer',
  'platform',
  'hook_angle',
  'visual_style',
  'cta',
  'tone',
  'format',
] as const;

const CLIENT_TOKEN_KEYS = new Set([
  'client.name',
  'client.industry',
  'client.niche',
  'client.audience',
  'client.problem',
  'client.pillars',
]);

/**
 * Extracts all unique non-client custom variable keys from a prompt template string.
 */
export function extractCustomVariables(content: string): string[] {
  const matches = content.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g);
  const seen = new Set<string>();
  for (const match of matches) {
    const key = match[1].trim();
    if (key && !CLIENT_TOKEN_KEYS.has(key)) {
      seen.add(key);
    }
  }
  return Array.from(seen);
}

/**
 * Formats a variable key like "hook_angle" into "Hook Angle"
 */
export function formatVariableLabel(key: string): string {
  return key
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Builds a structured client strategy context header for any prompt.
 */
export function buildClientContextBlock(client: Client): string {
  const lines = [
    `CLIENT CONTEXT — ${client.name}`,
    client.niche ? `• Industry / Niche: ${client.niche}` : null,
    client.shadowAvatar ? `• Target Audience (Shadow Avatar): ${client.shadowAvatar}` : null,
    client.bleedingNeck ? `• Core Problem (Bleeding Neck): ${client.bleedingNeck}` : null,
    client.contentPillars?.length ? `• Content Pillars: ${client.contentPillars.join(', ')}` : null,
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Resolves a prompt template with client fields, custom variable values,
 * and an optional prepended client strategy block.
 */
export function resolvePromptContent(
  content: string,
  options: {
    client?: Client | null;
    variables?: Record<string, string>;
    includeClientContext?: boolean;
  } = {}
): string {
  const { client, variables = {}, includeClientContext = false } = options;

  const clientMap: Record<string, string> = {
    'client.name': client?.name || '[Client Name]',
    'client.industry': client?.niche || '[Client Niche]',
    'client.niche': client?.niche || '[Client Niche]',
    'client.audience': client?.shadowAvatar || '[Target Audience]',
    'client.problem': client?.bleedingNeck || '[Core Problem]',
    'client.pillars': client?.contentPillars?.length
      ? client.contentPillars.join(', ')
      : '[Content Pillars]',
  };

  const resolvedBody = content.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (fullMatch, rawKey) => {
    const key = rawKey.trim();
    if (key in clientMap) {
      return clientMap[key];
    }
    const userVal = variables[key]?.trim();
    return userVal ? userVal : fullMatch;
  });

  if (includeClientContext && client) {
    return `${buildClientContextBlock(client)}\n\n---\n\n${resolvedBody}`;
  }

  return resolvedBody;
}

export interface PromptFilterOptions {
  category?: string;
  clientScope?: string; // 'all' | 'global' | stringified clientId
  search?: string;
  favoritesOnly?: boolean;
}

export function filterPrompts(
  prompts: PromptTemplate[],
  filters: PromptFilterOptions
): PromptTemplate[] {
  const {
    category = 'all',
    clientScope = 'all',
    search = '',
    favoritesOnly = false,
  } = filters;

  const query = search.trim().toLowerCase();

  return prompts
    .filter(prompt => {
      if (prompt.status === 'archived') return false;
      if (favoritesOnly && !prompt.isFavorite) return false;
      if (category !== 'all' && prompt.category !== category) return false;

      if (clientScope === 'global') {
        if (prompt.clientId) return false;
      } else if (clientScope !== 'all') {
        const targetClientId = Number(clientScope);
        if (prompt.clientId !== targetClientId && prompt.clientId != null) {
          return false;
        }
      }

      if (query) {
        const haystack = `${prompt.title} ${prompt.category} ${prompt.description} ${prompt.content} ${(prompt.tags || []).join(' ')}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (Boolean(a.isFavorite) !== Boolean(b.isFavorite)) {
        return a.isFavorite ? -1 : 1;
      }
      const usageDiff = (b.usageCount || 0) - (a.usageCount || 0);
      if (usageDiff !== 0) return usageDiff;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

export const STARTER_AGENCY_PROMPTS: PromptTemplate[] = [
  {
    id: 'starter-brand-story-origin',
    title: 'Founder Origin & Brand Manifesto',
    category: 'Brand Story',
    description: 'Turns raw founder background and market frustration into a high-conviction brand story.',
    content: `Act as a senior brand strategist for {{client.name}} in the {{client.niche}} space.

Target Audience: {{client.audience}}
Core Frustration They Face: {{client.problem}}
Founder / Brand Catalyst: {{founder_insight}}

Write a high-conviction Brand Story in 3 versions:
1. A 150-word Website Manifesto that positions {{client.name}} against status-quo competitors.
2. A 60-second Founder Origin Video Script showing why this brand had to exist.
3. Three one-line positioning statements we can use across social bios and ad headers.`,
    status: 'approved',
    version: 1,
    tags: ['manifesto', 'positioning', 'founder'],
    clientId: null,
    isFavorite: true,
    usageCount: 14,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'starter-strategy-60day',
    title: '60-Day Growth & Content Pillars Blueprint',
    category: 'Strategy',
    description: 'Builds a complete 60-day positioning, funnel, and content pillar roadmap for a client sprint.',
    content: `You are the Lead Growth Strategist creating a 60-Day Sprint Roadmap for {{client.name}} ({{client.niche}}).

Audience Profile: {{client.audience}}
Bleeding-Neck Problem: {{client.problem}}
Primary Offer: {{offer}}
Monthly Goal: {{goal}}

Deliver a clear, actionable 60-Day Strategy:
1. Core Positioning Angle: What contrarian truth does {{client.name}} own?
2. 4 Content Pillars: Define each pillar's goal (Authority, Objection Killer, Proof, Conversion) and 3 post concepts per pillar.
3. Funnel Mechanics: How we move viewers from cold reel/post to {{offer}}.`,
    status: 'approved',
    version: 1,
    tags: ['roadmap', 'sprint', 'pillars'],
    clientId: null,
    isFavorite: true,
    usageCount: 19,
    createdAt: '2026-01-16T10:00:00.000Z',
    updatedAt: '2026-01-16T10:00:00.000Z',
  },
  {
    id: 'starter-strategy-objection-matrix',
    title: 'Buyer Objection Crusher Matrix',
    category: 'Strategy',
    description: 'Uncovers hidden psychological objections stopping prospects from buying and writes rebuttals.',
    content: `Analyze the buying psychology for {{client.name}} selling {{offer}} to {{client.audience}}.

Their main pain point is: {{client.problem}}

List the top 5 unspoken objections prospects have before buying (time, trust, price, past failures, status). For each objection, provide:
- The exact internal monologue the prospect is thinking
- A sharp reframing statement
- A concrete content hook and proof asset we should publish to neutralize it before the sales call.`,
    status: 'approved',
    version: 1,
    tags: ['objections', 'sales-psychology', 'conversion'],
    clientId: null,
    isFavorite: false,
    usageCount: 8,
    createdAt: '2026-01-17T10:00:00.000Z',
    updatedAt: '2026-01-17T10:00:00.000Z',
  },
  {
    id: 'starter-brainstorming-hooks',
    title: '20 Scroll-Stopping Viral Hooks Generator',
    category: 'Brainstorming',
    description: 'Generates 20 pattern-interrupt hooks across 4 psychological triggers for any topic.',
    content: `Brainstorm 20 scroll-stopping hooks for {{client.name}} on the topic of: {{topic}}

Target Audience: {{client.audience}}
Platform: {{platform}}

Group the 20 hooks into 4 psychological categories (5 hooks each):
1. Loss Aversion & Costly Mistakes ("Stop doing X if you want Y...")
2. Contrarian Industry Truths ("Everyone in {{client.niche}} tells you X. Here's why that's backwards...")
3. Specific Proof & Case Breakdown ("How we went from X to Y in Z days...")
4. Direct Identity Callout ("If you are a {{client.audience}} struggling with {{client.problem}}...")

Keep every hook under 14 words, punchy, and free of generic AI clichés.`,
    status: 'approved',
    version: 1,
    tags: ['hooks', 'ideation', 'viral'],
    clientId: null,
    isFavorite: true,
    usageCount: 27,
    createdAt: '2026-01-18T10:00:00.000Z',
    updatedAt: '2026-01-18T10:00:00.000Z',
  },
  {
    id: 'starter-brainstorming-campaign',
    title: '3-Angle Campaign Concept Ideator',
    category: 'Brainstorming',
    description: 'Rapidly ideates 3 distinct creative angles for a product launch or seasonal offer.',
    content: `We are launching a campaign for {{client.name}} around {{offer}}.

Target Audience: {{client.audience}}
Key Problem Solved: {{client.problem}}

Pitch 3 distinct creative campaign concepts:
- Concept 1: High-Status Editorial / Aspirational Angle
- Concept 2: Visceral Problem-Agitation-Solution Angle
- Concept 3: Disruptive Pattern-Interrupt / Proof Angle

For each concept, include the Campaign Headline, Visual Metaphor, Hero Ad Hook, and Call to Action.`,
    status: 'approved',
    version: 1,
    tags: ['campaigns', 'angles', 'launch'],
    clientId: null,
    isFavorite: false,
    usageCount: 11,
    createdAt: '2026-01-19T10:00:00.000Z',
    updatedAt: '2026-01-19T10:00:00.000Z',
  },
  {
    id: 'starter-art-direction-brief',
    title: 'Campaign Visual & Art Direction Brief',
    category: 'Art Direction',
    description: 'Creates a complete visual system, lighting, color palette, and typography brief for designers.',
    content: `Act as an Executive Creative Director creating an Art Direction Brief for {{client.name}} ({{client.niche}}).

Campaign / Asset Focus: {{topic}}
Desired Mood & Aesthetic: {{visual_style}}
Target Audience: {{client.audience}}

Provide a production-ready Art Direction Brief covering:
1. Visual Concept & Atmosphere: What should the viewer feel in the first 0.5 seconds?
2. Color & Contrast Palette: Primary canvas, accent highlights, and shadow treatment.
3. Lighting, Texture & Composition: Camera lens feel, subject framing, and negative space rules for text overlays.
4. Typography & Layout Hierarchy: Headline placement, contrast treatment, and elements to strictly avoid.`,
    status: 'approved',
    version: 1,
    tags: ['visual-direction', 'design-brief', 'aesthetics'],
    clientId: null,
    isFavorite: false,
    usageCount: 9,
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-01-20T10:00:00.000Z',
  },
  {
    id: 'starter-image-prompts-product',
    title: 'Editorial Product & Lifestyle Image Prompt',
    category: 'Image Prompts',
    description: 'Generates photorealistic commercial studio and lifestyle image prompts for AI image generators.',
    content: `Create 4 detailed, photorealistic image generation prompts for {{client.name}} featuring {{topic}}.

Visual Aesthetic: {{visual_style}}
Aspect Ratio: {{aspect_ratio}}

For each prompt, specify exact camera lens (e.g. 50mm f/1.8 editorial or 85mm macro studio), surface materials, natural or rim lighting direction, color grading, and composition with clean negative space for ad copy:
1. Hero Studio Shot on architectural surface
2. Human Lifestyle Interaction Shot in natural light
3. Macro Texture & Craftsmanship Detail Shot
4. High-Contrast Social Ad Backdrop`,
    status: 'approved',
    version: 1,
    tags: ['midjourney', 'product-photo', 'visual-assets'],
    clientId: null,
    isFavorite: true,
    usageCount: 22,
    createdAt: '2026-01-21T10:00:00.000Z',
    updatedAt: '2026-01-21T10:00:00.000Z',
  },
  {
    id: 'starter-videos-reel-script',
    title: 'High-Retention 45s Reel / TikTok Script',
    category: 'Videos',
    description: 'Writes a scene-by-scene short-form video script with visual B-roll cues and retention beats.',
    content: `Write a high-retention 45-second short-form video script (Reel / TikTok) for {{client.name}}.

Topic / Hook Angle: {{topic}}
Target Audience: {{client.audience}}
Call to Action: {{cta}}

Format the script in a 2-column production table (Visual / B-Roll Cue | Spoken Audio):
- 0–3s: Scroll-Stopping Visual + Verbal Hook (no slow intros)
- 3–15s: Agitate the hidden mistake or problem ({{client.problem}})
- 15–35s: The 3-Step Framework or Transformation (with pattern interrupts every 5 seconds)
- 35–45s: High-value payoff + seamless Call to Action ({{cta}})`,
    status: 'approved',
    version: 1,
    tags: ['reels', 'tiktok', 'video-script'],
    clientId: null,
    isFavorite: true,
    usageCount: 31,
    createdAt: '2026-01-22T10:00:00.000Z',
    updatedAt: '2026-01-22T10:00:00.000Z',
  },
  {
    id: 'starter-videos-vsl-ad',
    title: 'Direct-Response Video Ad Script (UGC / Founder)',
    category: 'Videos',
    description: 'Creates a conversion-focused paid video ad script with 3 interchangeable opening hooks.',
    content: `Write a direct-response paid video ad script for {{client.name}} promoting {{offer}}.

Target Audience: {{client.audience}}
Core Pain Point: {{client.problem}}

Include:
1. Three interchangeable 3-second opening hooks (Visual + Audio) so we can A/B test creatives.
2. Body Script (30–45 seconds): Problem callout -> Why normal solutions fail -> How {{offer}} works -> Social proof beat.
3. Direct CTA overlay + spoken close driving to: {{cta}}.`,
    status: 'approved',
    version: 1,
    tags: ['video-ads', 'ugc', 'paid-social'],
    clientId: null,
    isFavorite: false,
    usageCount: 15,
    createdAt: '2026-01-23T10:00:00.000Z',
    updatedAt: '2026-01-23T10:00:00.000Z',
  },
  {
    id: 'starter-storytelling-case-study',
    title: 'Client Transformation & Case Study Narrative',
    category: 'Storytelling',
    description: 'Turns a client win or customer result into an emotional Before-During-After story post.',
    content: `Write a compelling transformation story for {{client.name}} about: {{topic}}

Audience: {{client.audience}}
Core Problem Overcome: {{client.problem}}
Call to Action: {{cta}}

Structure the narrative using:
1. The Specific Moment of Friction ("Before"): Paint a vivid scene the reader immediately recognizes.
2. The Turning Point: The counter-intuitive shift or realization that changed everything.
3. The Measurable Outcome ("After"): Concrete results and emotional relief.
4. Soft-sell transition to {{cta}}.`,
    status: 'approved',
    version: 1,
    tags: ['case-study', 'narrative', 'social-proof'],
    clientId: null,
    isFavorite: false,
    usageCount: 12,
    createdAt: '2026-01-24T10:00:00.000Z',
    updatedAt: '2026-01-24T10:00:00.000Z',
  },
  {
    id: 'starter-copywriting-carousel',
    title: 'Slide-by-Slide Educational Carousel Copy',
    category: 'Copywriting & Scripting',
    description: 'Writes an 8-slide save-worthy Instagram/LinkedIn carousel plus caption and CTA.',
    content: `Create an 8-slide authority carousel for {{client.name}} on {{platform}}.

Topic: {{topic}}
Target Audience: {{client.audience}}
Call to Action: {{cta}}

Provide:
- Slide 1 (Cover): Bold 6-word hook + sub-kicker that forces a swipe
- Slides 2–7: One clear insight per slide (Headline + max 25 words body + visual diagram suggestion)
- Slide 8 (CTA Slide): Summary takeaway + clear reason to {{cta}}
- Companion Caption: 120-word punchy caption + 5 relevant hashtags.`,
    status: 'approved',
    version: 1,
    tags: ['carousel', 'copywriting', 'instagram', 'linkedin'],
    clientId: null,
    isFavorite: true,
    usageCount: 24,
    createdAt: '2026-01-25T10:00:00.000Z',
    updatedAt: '2026-01-25T10:00:00.000Z',
  },
  {
    id: 'starter-copywriting-direct-ad',
    title: 'High-Converting Meta / LinkedIn Ad Copy Pack',
    category: 'Copywriting & Scripting',
    description: 'Writes 3 ad copy variations (Short Punchy, Story-Led, and Bullet Proof) for paid or organic posts.',
    content: `Write 3 high-converting copy variations for {{client.name}} promoting {{offer}} on {{platform}}.

Target Audience: {{client.audience}}
Core Problem: {{client.problem}}
Call to Action: {{cta}}

Deliver:
1. Variation A (Short & Direct): Under 75 words, immediate value proposition + CTA.
2. Variation B (Problem-Agitation-Solution): Calls out {{client.problem}}, dismantles false fixes, introduces {{offer}}.
3. Variation C (Authority & Proof Breakdown): Scannable bullet points + risk-reversal + 3 headline options.`,
    status: 'approved',
    version: 1,
    tags: ['ad-copy', 'conversion', 'meta-ads'],
    clientId: null,
    isFavorite: false,
    usageCount: 18,
    createdAt: '2026-01-26T10:00:00.000Z',
    updatedAt: '2026-01-26T10:00:00.000Z',
  },
];
