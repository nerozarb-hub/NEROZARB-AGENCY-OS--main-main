import { AppData, Client, CompiledPrompt, ContextPack, InstructionBlock, PromptAudit, PromptCondition, PromptRecipe, PromptSourceSnapshot, StructuredBrief } from '../../utils/storage';

export interface CompilationInput { brief: StructuredBrief; client: Client; recipe?: PromptRecipe; template?: { id: string; title: string; content: string; version: number }; modelProfileId?: string; }

const claimPattern = /\b(guaranteed?|clinically proven|dermatologist approved|cures?|best|number\s*one|#1|\d+%\s*(better|results?|effective))\b/gi;
const variablePattern = /\{\{([^}]+)\}\}/g;

function matchesCondition(condition: PromptCondition, brief: StructuredBrief, client: Client): boolean {
  const values: Record<PromptCondition['field'], string> = {
    deliverable: brief.deliverableType,
    platform: brief.platform,
    objective: brief.objective,
    industry: client.niche,
    clientId: String(client.id),
    product: brief.product || '',
    modelFamily: '',
  };
  const actual = values[condition.field].toLowerCase();
  const expected = condition.value.toLowerCase();
  return condition.operator === 'equals' ? actual === expected : actual.includes(expected);
}

export function resolveVariables(content: string, values: Record<string, string>): { output: string; unresolved: string[] } {
  const unresolved = new Set<string>();
  const output = content.replace(variablePattern, (match, key) => {
    const normalizedKey = key.trim();
    const value = values[normalizedKey];
    if (!value?.trim()) { unresolved.add(normalizedKey); return match; }
    return value;
  });
  return { output, unresolved: [...unresolved] };
}

export function recommendRecipe(recipes: PromptRecipe[], brief: Pick<StructuredBrief, 'deliverableType' | 'platform' | 'objective'>): { recipe?: PromptRecipe; reasons: string[] } {
  const scored = recipes.filter(recipe => recipe.status === 'approved').map(recipe => {
    const haystack = `${recipe.name} ${recipe.taskType} ${recipe.outputType} ${recipe.description}`.toLowerCase();
    const terms = [brief.deliverableType, brief.platform, brief.objective].filter(Boolean).map(value => value.toLowerCase());
    const matches = terms.filter(term => haystack.includes(term));
    return { recipe, score: matches.length, reasons: matches.map(term => `Matches ${term}`) };
  }).sort((a, b) => b.score - a.score || b.recipe.updatedAt.localeCompare(a.recipe.updatedAt));
  return scored[0]?.score ? { recipe: scored[0].recipe, reasons: scored[0].reasons } : { reasons: ['No approved Recipe matches this brief yet.'] };
}

export function selectContext(data: AppData, brief: StructuredBrief, client: Client): { blocks: InstructionBlock[]; packs: ContextPack[] } {
  const packs = data.contextPacks.filter(pack => pack.status === 'approved' && (!pack.clientId || pack.clientId === client.id) && (!pack.productName || pack.productName.toLowerCase() === (brief.product || '').toLowerCase())).sort((a, b) => (a.priority || 0) - (b.priority || 0));
  const packBlockIds = new Set(packs.flatMap(pack => pack.blockIds));
  const blocks = data.instructionBlocks.filter(block => {
    const inScope = !block.clientId || block.clientId === client.id;
    const conditionsMatch = !block.conditions?.length || block.conditions.every(condition => matchesCondition(condition, brief, client));
    return block.status === 'approved' && inScope && conditionsMatch && (block.scope === 'global' || block.scope === 'client' || block.scope === 'industry' || packBlockIds.has(block.id));
  }).sort((a, b) => (a.priority || 100) - (b.priority || 100));
  return { blocks, packs };
}

export function auditPrompt(input: { brief: StructuredBrief; prompt: string; blocks: InstructionBlock[]; values: Record<string, string>; recipe?: PromptRecipe }): PromptAudit {
  const missingInputs = [!input.brief.deliverableType && 'Deliverable', !input.brief.platform && 'Platform', !input.brief.objective && 'Objective', !input.brief.product && 'Product or service', !input.brief.brief && 'Task description'].filter(Boolean) as string[];
  const unresolvedVariables = [...input.prompt.matchAll(variablePattern)].map(match => match[1].trim());
  const normalizedBlocks = input.blocks.map(block => block.instruction.trim().toLowerCase()).filter(Boolean);
  const duplicateInstructions = [...new Set(normalizedBlocks.filter((item, index) => normalizedBlocks.indexOf(item) !== index))];
  const conflicts: string[] = [];
  const instructionText = normalizedBlocks.join(' ');
  if (instructionText.includes('light background') && instructionText.includes('dark background')) conflicts.push('Applied instructions require both a light and a dark background.');
  const claims = [...new Set(input.prompt.match(claimPattern) || [])];
  const blockingErrors = [...missingInputs, ...unresolvedVariables.map(variable => `Unresolved variable: {{${variable}}}`)];
  if (input.recipe?.requiredInputs?.includes('Asset') && !(input.brief.assetUrls || []).length) blockingErrors.push('This Recipe requires at least one reference asset.');
  const warnings = [
    ...claims.map(claim => `Claim requires approval: “${claim}”`),
    ...duplicateInstructions.map(instruction => `Duplicate instruction: “${instruction.slice(0, 90)}”`),
    ...conflicts,
    input.prompt.length > 12000 ? 'Prompt is approaching a large model context budget.' : '',
  ].filter(Boolean);
  const deductions = blockingErrors.length * 18 + warnings.length * 6;
  return { readinessScore: Math.max(0, 100 - deductions), blockingErrors, warnings, missingInputs, unresolvedVariables, duplicateInstructions, conflicts };
}

export function compilePrompt(data: AppData, input: CompilationInput): Omit<CompiledPrompt, 'id' | 'briefId' | 'createdAt'> {
  const { brief, client, recipe, template } = input;
  const { blocks, packs } = selectContext(data, brief, client);
  const values: Record<string, string> = {
    'client.name': client.name,
    'client.industry': client.niche || '',
    deliverable: brief.deliverableType,
    platform: brief.platform,
    objective: brief.objective,
    product: brief.product || '',
    brief: brief.brief,
    audience: brief.audience || '',
    offer: brief.offer || '',
    cta: brief.cta || '',
  };
  const templateResult = template ? resolveVariables(template.content, values) : { output: '', unresolved: [] as string[] };
  const sourceSnapshots: PromptSourceSnapshot[] = [
    ...(template ? [{ type: 'template' as const, id: template.id, title: template.title, version: template.version, snapshot: template.content }] : []),
    ...(recipe ? [{ type: 'recipe' as const, id: recipe.id, title: recipe.name, version: recipe.version, snapshot: JSON.stringify(recipe) }] : []),
    ...packs.map(pack => ({ type: 'context-pack' as const, id: pack.id, title: pack.name, version: pack.version, snapshot: JSON.stringify(pack) })),
    ...blocks.map(block => ({ type: 'block' as const, id: block.id, title: block.title, version: block.version, snapshot: block.instruction })),
  ];
  const sections = [
    'NEROZARB PRODUCTION INSTRUCTION',
    templateResult.output,
    `Client: ${client.name}`,
    `Industry: ${client.niche || 'Not specified'}`,
    `Deliverable: ${brief.deliverableType}`,
    `Platform: ${brief.platform}`,
    `Objective: ${brief.objective}`,
    brief.product && `Product: ${brief.product}`,
    brief.audience && `Audience: ${brief.audience}`,
    brief.offer && `Offer: ${brief.offer}`,
    brief.cta && `CTA: ${brief.cta}`,
    `Operator request: ${brief.brief}`,
    blocks.length && `Applied rules:\n${blocks.map(block => `- ${block.instruction}`).join('\n')}`,
    brief.mandatoryInclusions && `Must include: ${brief.mandatoryInclusions}`,
    brief.prohibitedInclusions && `Do not include: ${brief.prohibitedInclusions}`,
    recipe?.outputSchema && `Output format:\n${recipe.outputSchema}`,
    'Do not invent product claims, facts, certifications, results, or assets. Flag missing information clearly.',
  ].filter(Boolean).join('\n\n');
  const audit = auditPrompt({ brief, prompt: sections, blocks, values, recipe });
  return { prompt: sections, appliedBlockIds: blocks.map(block => block.id), appliedPackIds: packs.map(pack => pack.id), sourceSnapshots, resolvedVariables: values, audit, missingInputs: audit.missingInputs, conflicts: audit.conflicts };
}
