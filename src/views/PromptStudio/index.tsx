import { useMemo, useState } from 'react';
import { BookOpen, Braces, CheckCircle2, ClipboardCopy, FileText, FlaskConical, Layers3, Pencil, Plus, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input, Textarea } from '../../components/ui/Input';
import { useAppData } from '../../contexts/AppDataContext';
import { CompiledPrompt, ContextPack, GenerationRun, InstructionBlock, LibraryStatus, ModelProfile, PromptRecipe, PromptTemplate, QualityRubric, StructuredBrief } from '../../utils/storage';
import { compilePrompt, recommendRecipe } from '../../features/prompt-os/compiler';

type Tab = 'compose' | 'library' | 'quality' | 'history';
const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
const variables = ['client.name', 'client.industry', 'deliverable', 'platform', 'objective', 'product', 'brief'];

const applyVariables = (content: string, values: Record<string, string>) => content.replace(/\{\{([^}]+)\}\}/g, (match, key) => values[key.trim()] ?? match);

export default function PromptStudio({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { data, setData, showToast, addTask } = useAppData();
  const [tab, setTab] = useState<Tab>('compose');
  const [clientId, setClientId] = useState('');
  const [deliverableType, setDeliverableType] = useState('Static ad');
  const [platform, setPlatform] = useState('Instagram');
  const [objective, setObjective] = useState('Conversion');
  const [product, setProduct] = useState('');
  const [briefText, setBriefText] = useState('');
  const [recipeId, setRecipeId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [compiled, setCompiled] = useState<CompiledPrompt | null>(null);
  const [blockTitle, setBlockTitle] = useState('');
  const [blockText, setBlockText] = useState('');
  const [recipeName, setRecipeName] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateCategory, setTemplateCategory] = useState('Content');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [templateStatus, setTemplateStatus] = useState<LibraryStatus>('draft');
  const [audience, setAudience] = useState('');
  const [offer, setOffer] = useState('');
  const [cta, setCta] = useState('');
  const [mandatoryInclusions, setMandatoryInclusions] = useState('');
  const [prohibitedInclusions, setProhibitedInclusions] = useState('');
  const [modelProfileId, setModelProfileId] = useState('');
  const [packName, setPackName] = useState('');
  const [packType, setPackType] = useState<ContextPack['packType']>('brand');
  const [packDescription, setPackDescription] = useState('');
  const [packStatus, setPackStatus] = useState<LibraryStatus>('draft');
  const [rubricName, setRubricName] = useState('');
  const [rubricStatus, setRubricStatus] = useState<LibraryStatus>('draft');
  const [modelName, setModelName] = useState('');
  const [modelProvider, setModelProvider] = useState('');
  const [modelFamily, setModelFamily] = useState<ModelProfile['family']>('text');
  const [reviewScore, setReviewScore] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');

  const client = useMemo(() => data.clients.find(item => item.id === Number(clientId)), [clientId, data.clients]);
  const recommendation = useMemo(() => recommendRecipe(data.promptRecipes, { deliverableType, platform, objective }), [data.promptRecipes, deliverableType, platform, objective]);
  const selectedRecipe = useMemo(() => data.promptRecipes.find(item => item.id === recipeId) || recommendation.recipe, [data.promptRecipes, recipeId, recommendation.recipe]);
  const selectedTemplate = useMemo(() => data.promptTemplates.find(item => item.id === templateId), [data.promptTemplates, templateId]);
  const availablePacks = useMemo(() => data.contextPacks.filter(pack => !pack.clientId || pack.clientId === Number(clientId)), [clientId, data.contextPacks]);

  const compileBrief = () => {
    if (!client || !briefText.trim()) { showToast('Choose a client and add a short brief first.', 'error'); return; }
    const now = new Date().toISOString();
    const brief: StructuredBrief = { id: newId('brief'), clientId: client.id, deliverableType, platform, objective, product, audience, offer, cta, mandatoryInclusions, prohibitedInclusions, brief: briefText.trim(), recipeId: selectedRecipe?.id, contextPackIds: availablePacks.filter(pack => pack.status === 'approved').map(pack => pack.id), status: 'compiled', createdAt: now, updatedAt: now };
    const result = compilePrompt(data, { brief, client, recipe: selectedRecipe, template: selectedTemplate, modelProfileId: modelProfileId || undefined });
    const prompt: CompiledPrompt = { id: newId('prompt'), briefId: brief.id, createdAt: now, ...result };
    const run: GenerationRun = { id: newId('run'), briefId: brief.id, compiledPromptId: prompt.id, status: 'ready-for-generation', qualityScore: null, reviewerFeedback: '', createdAt: now };
    setData(previous => ({ ...previous, briefs: [brief, ...previous.briefs], compiledPrompts: [prompt, ...previous.compiledPrompts], generationRuns: [run, ...previous.generationRuns] }));
    setCompiled(prompt);
    showToast(prompt.audit?.blockingErrors.length ? 'Compilation saved with blocking issues to resolve.' : prompt.audit?.warnings.length ? 'Compiled with audit warnings.' : 'Prompt compiled and saved.');
  };

  const addBlock = () => {
    if (!blockTitle.trim() || !blockText.trim()) return;
    const now = new Date().toISOString();
    const block: InstructionBlock = { id: newId('block'), title: blockTitle.trim(), instruction: blockText.trim(), scope: 'global', status: 'draft', version: 1, tags: [], createdAt: now, updatedAt: now };
    setData(previous => ({ ...previous, instructionBlocks: [block, ...previous.instructionBlocks] }));
    setBlockTitle(''); setBlockText(''); showToast('Instruction saved as a draft.');
  };

  const addRecipe = () => {
    if (!recipeName.trim()) return;
    const now = new Date().toISOString();
    const recipe: PromptRecipe = { id: newId('recipe'), name: recipeName.trim(), description: 'Add its required context and review it before use.', taskType: 'Content', outputType: 'Structured creative brief', status: 'draft', version: 1, requiredInputs: ['Client', 'Objective', 'Brief'], defaultModel: 'Choose at generation', createdAt: now, updatedAt: now };
    setData(previous => ({ ...previous, promptRecipes: [recipe, ...previous.promptRecipes] }));
    setRecipeName(''); showToast('Recipe saved as a draft.');
  };

  const addPack = () => {
    if (!packName.trim()) { showToast('Add a Context Pack name first.', 'error'); return; }
    const now = new Date().toISOString();
    const pack: ContextPack = { id: newId('pack'), name: packName.trim(), description: packDescription.trim(), packType, status: packStatus, version: 1, priority: 100, blockIds: [], tags: [], assetUrls: [], references: [], createdAt: now, updatedAt: now };
    setData(previous => ({ ...previous, contextPacks: [pack, ...previous.contextPacks] }));
    setPackName(''); setPackDescription(''); setPackStatus('draft'); showToast('Context Pack saved. Add approved blocks when it is ready for production.');
  };

  const addRubric = () => {
    if (!rubricName.trim()) { showToast('Add a rubric name first.', 'error'); return; }
    const now = new Date().toISOString();
    const rubric: QualityRubric = { id: newId('rubric'), name: rubricName.trim(), criteria: [{ id: 'accuracy', label: 'Factual and brand accuracy', weight: 40, blocking: true }, { id: 'clarity', label: 'Clarity and commercial usefulness', weight: 35 }, { id: 'platform', label: 'Platform suitability', weight: 25 }], passThreshold: 80, status: rubricStatus, version: 1, createdAt: now, updatedAt: now };
    setData(previous => ({ ...previous, qualityRubrics: [rubric, ...previous.qualityRubrics] }));
    setRubricName(''); setRubricStatus('draft'); showToast('Quality rubric saved as a governed draft.');
  };

  const addModelProfile = () => {
    if (!modelName.trim() || !modelProvider.trim()) { showToast('Add both provider and model name.', 'error'); return; }
    const now = new Date().toISOString();
    const model: ModelProfile = { id: newId('model'), provider: modelProvider.trim(), name: modelName.trim(), family: modelFamily, contextLimit: 32000, supportsJson: modelFamily === 'text' || modelFamily === 'multimodal', supportedAssetTypes: modelFamily === 'text' ? [] : ['image'], active: true, version: 1, createdAt: now, updatedAt: now };
    setData(previous => ({ ...previous, modelProfiles: [model, ...previous.modelProfiles] }));
    setModelName(''); setModelProvider(''); showToast('Model profile saved. No provider credential is stored in the browser.');
  };

  const saveReview = (run: GenerationRun) => {
    const score = Number(reviewScore);
    if (!Number.isFinite(score) || score < 0 || score > 100) { showToast('Enter a quality score from 0 to 100.', 'error'); return; }
    setData(previous => ({ ...previous, generationRuns: previous.generationRuns.map(item => item.id === run.id ? { ...item, qualityScore: score, reviewerFeedback: reviewFeedback.trim(), status: score >= 80 ? 'approved' : 'in-review' } : item) }));
    setReviewScore(''); setReviewFeedback(''); showToast('Quality review saved to the generation history.');
  };

  const copyCompiledPrompt = async () => {
    if (!compiled) return;
    await navigator.clipboard.writeText(compiled.prompt);
    showToast('Compiled prompt copied.');
  };

  const resetTemplateEditor = () => { setEditingTemplateId(null); setTemplateTitle(''); setTemplateCategory('Content'); setTemplateDescription(''); setTemplateContent(''); setTemplateStatus('draft'); };
  const saveTemplate = () => {
    if (!templateTitle.trim() || !templateContent.trim()) { showToast('Add a name and the template prompt first.', 'error'); return; }
    const now = new Date().toISOString();
    setData(previous => {
      const existing = previous.promptTemplates.find(item => item.id === editingTemplateId);
      const template: PromptTemplate = { id: existing?.id || newId('template'), title: templateTitle.trim(), category: templateCategory.trim() || 'Other', description: templateDescription.trim(), content: templateContent.trim(), status: templateStatus, version: existing ? existing.version + 1 : 1, tags: existing?.tags || [], createdAt: existing?.createdAt || now, updatedAt: now };
      return { ...previous, promptTemplates: existing ? previous.promptTemplates.map(item => item.id === existing.id ? template : item) : [template, ...previous.promptTemplates] };
    });
    showToast(editingTemplateId ? 'Template updated. Its version increased.' : 'Template prompt saved.');
    resetTemplateEditor();
  };
  const editTemplate = (template: PromptTemplate) => { setEditingTemplateId(template.id); setTemplateTitle(template.title); setTemplateCategory(template.category); setTemplateDescription(template.description); setTemplateContent(template.content); setTemplateStatus(template.status); };

  const createTaskFromBrief = () => {
    if (!compiled || !client) return;
    const brief = data.briefs.find(item => item.id === compiled.briefId);
    if (!brief) return;
    addTask({ clientId: client.id, name: `${brief.deliverableType}: ${brief.objective}`, category: 'Content Production', phase: 'ongoing', stagePipeline: ['BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED'], currentStage: 'BRIEFED', assignedNode: 'Art Director', priority: 'normal', status: 'active', deadline: '', estimatedHours: null, brief: brief.brief, assetLinks: [], sopReference: null, notes: `Compiled prompt: ${compiled.id}`, deliveredOnTime: null, linkedPostId: null, compiledPromptId: compiled.id });
    showToast('Task created and linked to the compiled prompt.');
  };

  return <div className="page-container space-y-6">
    <header className="page-header"><div><h1 className="page-header-title">Prompt Studio</h1><p className="page-header-subtitle mt-1">Create approved templates once, then let every operator use the same quality standard.</p></div></header>
    <nav className="flex gap-2 overflow-x-auto" aria-label="Prompt Studio sections">{([['compose', 'Create from brief'], ['library', 'Library'], ['quality', 'Quality Lab'], ['history', 'History']] as [Tab, string][]).map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`min-h-11 whitespace-nowrap rounded-lg px-4 text-sm font-medium ${tab === id ? 'bg-primary text-onyx' : 'border border-border-dark text-text-secondary hover:bg-white/[0.04]'}`}>{label}</button>)}</nav>

    {tab === 'compose' && (data.clients.length === 0 ? <EmptyState icon={<FileText size={22} />} title="Add a client before you create a brief" description="Prompt Studio uses the client record as the source of truth for context and quality controls." actionLabel="Go to clients" onAction={() => onNavigate?.('client')} /> : <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Card className="p-5 sm:p-7 space-y-5"><div><h2 className="text-lg font-semibold">1. Fill in the essentials</h2><p className="mt-1 text-sm text-text-muted">Choose an approved template. The system fills in its variables and adds approved context.</p></div>
        <label className="block text-sm font-medium text-text-secondary">Client<select value={clientId} onChange={event => setClientId(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3 text-sm"><option value="">Select a client</option>{data.clients.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="block text-sm font-medium text-text-secondary">Template prompt<select value={templateId} onChange={event => setTemplateId(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3 text-sm"><option value="">Select an approved template</option>{data.promptTemplates.filter(template => template.status === 'approved').map(template => <option key={template.id} value={template.id}>{template.title} · {template.category} · v{template.version}</option>)}</select></label>
        {data.promptTemplates.length === 0 && <button className="text-left text-sm text-primary hover:underline" onClick={() => setTab('library')}>Create your first template prompt →</button>}
        <div className="grid gap-4 sm:grid-cols-2"><Input label="Deliverable" value={deliverableType} onChange={event => setDeliverableType(event.target.value)} /><Input label="Platform" value={platform} onChange={event => setPlatform(event.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-2"><Input label="Objective" value={objective} onChange={event => setObjective(event.target.value)} /><Input label="Product or service" value={product} onChange={event => setProduct(event.target.value)} placeholder="Optional but recommended" /></div>
        <div className="grid gap-4 sm:grid-cols-2"><Input label="Audience" value={audience} onChange={event => setAudience(event.target.value)} placeholder="Who this is for" /><Input label="Offer" value={offer} onChange={event => setOffer(event.target.value)} placeholder="Optional offer" /></div>
        <Input label="Call to action" value={cta} onChange={event => setCta(event.target.value)} placeholder="What should the audience do?" />
        <label className="block text-sm font-medium text-text-secondary">Recipe<select value={recipeId} onChange={event => setRecipeId(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3 text-sm"><option value="">{recommendation.recipe ? `Recommended: ${recommendation.recipe.name}` : 'No recipe selected'}</option>{data.promptRecipes.filter(recipe => recipe.status === 'approved').map(recipe => <option key={recipe.id} value={recipe.id}>{recipe.name} · v{recipe.version}</option>)}</select></label>
        {recommendation.recipe && !recipeId && <p className="-mt-3 text-xs text-primary">Recommended because: {recommendation.reasons.join(' · ')}</p>}
        <label className="block text-sm font-medium text-text-secondary">Model profile<select value={modelProfileId} onChange={event => setModelProfileId(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3 text-sm"><option value="">No model profile selected</option>{data.modelProfiles.filter(model => model.active).map(model => <option key={model.id} value={model.id}>{model.provider} · {model.name} · {model.family}</option>)}</select></label>
        <Textarea label="What should the team make?" value={briefText} onChange={event => setBriefText(event.target.value)} placeholder="Describe the message, audience, offer, references, and anything that must be true." />
        <Textarea label="Mandatory inclusions" value={mandatoryInclusions} onChange={event => setMandatoryInclusions(event.target.value)} placeholder="Facts, assets, phrasing, or requirements that must appear." />
        <Textarea label="Prohibited inclusions" value={prohibitedInclusions} onChange={event => setProhibitedInclusions(event.target.value)} placeholder="Claims, styles, messages, or facts that must never appear." />
        <Button onClick={compileBrief} className="w-full"><Sparkles size={16} />Compile production brief</Button>
      </Card>
      <Card className="p-5 sm:p-7">{!compiled ? <EmptyState icon={<Braces size={22} />} title="Nothing compiled yet" description="Compile a brief to review the final prompt, applied context, and missing information before any AI generation." /> : <div className="space-y-5"><div><h2 className="text-lg font-semibold">2. Review the final prompt</h2><p className="mt-1 text-sm text-text-muted">This immutable snapshot stays linked to the task and generation run.</p></div><div className="rounded-lg border border-border-dark bg-onyx p-4 text-sm leading-6 text-text-secondary whitespace-pre-wrap">{compiled.prompt}</div><div className="grid gap-3 sm:grid-cols-2"><StatusList title="Applied context" items={[`${selectedTemplate ? 1 : 0} template prompt`, `${compiled.appliedPackIds.length} approved context packs`, `${compiled.appliedBlockIds.length} approved instruction blocks`]} /><StatusList title={`Audit · ${compiled.audit?.readinessScore ?? 0}% ready`} items={[...(compiled.audit?.blockingErrors || []), ...(compiled.audit?.warnings || [])]} warning /></div><div className="flex flex-wrap gap-3"><Button onClick={createTaskFromBrief} disabled={Boolean(compiled.audit?.blockingErrors.length)}>Create linked task</Button><Button variant="outline" onClick={copyCompiledPrompt}><ClipboardCopy size={16} />Copy prompt</Button><Button variant="outline" onClick={() => { setTab('history'); setCompiled(null); }}>View saved run</Button></div></div>}</Card>
    </div>)}

    {tab === 'library' && <div className="space-y-6"><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <Card className="p-5 sm:p-7 space-y-4"><div><h2 className="text-lg font-semibold">{editingTemplateId ? 'Edit template prompt' : 'New template prompt'}</h2><p className="text-sm text-text-muted">Use variables to make one high-quality prompt work across clients and assignments.</p></div>
        <div className="grid gap-4 sm:grid-cols-2"><Input label="Template name" value={templateTitle} onChange={event => setTemplateTitle(event.target.value)} placeholder="e.g. Instagram conversion ad" /><Input label="Category" value={templateCategory} onChange={event => setTemplateCategory(event.target.value)} placeholder="e.g. Content, Ads, Sales" /></div>
        <Input label="When should the team use this?" value={templateDescription} onChange={event => setTemplateDescription(event.target.value)} placeholder="A short internal description" />
        <label className="block text-sm font-medium text-text-secondary">Status<select value={templateStatus} onChange={event => setTemplateStatus(event.target.value as LibraryStatus)} className="mt-2 min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3 text-sm"><option value="draft">Draft — only visible in the library</option><option value="approved">Approved — available to the team</option><option value="archived">Archived — kept for reference</option></select></label>
        <Textarea label="Template prompt" value={templateContent} onChange={event => setTemplateContent(event.target.value)} placeholder={'You are creating a {{deliverable}} for {{client.name}}.\n\nObjective: {{objective}}\nProduct: {{product}}\n\nBrief: {{brief}}'} />
        <p className="-mt-2 text-xs leading-5 text-text-muted">Available variables: {variables.map(variable => <code key={variable} className="mr-1 rounded bg-white/[0.06] px-1.5 py-0.5 text-text-secondary">{`{{${variable}}}`}</code>)}</p>
        <div className="flex flex-wrap gap-3"><Button onClick={saveTemplate}><Plus size={16} />{editingTemplateId ? 'Save new version' : 'Save template prompt'}</Button>{editingTemplateId && <Button variant="outline" onClick={resetTemplateEditor}>Cancel edit</Button>}</div>
      </Card>
      <Card className="p-5 sm:p-7"><div><h2 className="text-lg font-semibold">Your template prompts</h2><p className="mt-1 text-sm text-text-muted">Only approved templates appear for operators in “Use a template.”</p></div><TemplateList templates={data.promptTemplates} onEdit={editTemplate} /></Card>
    </div>
    <div className="grid gap-6 lg:grid-cols-2"><Card className="p-5 sm:p-7 space-y-4"><div><h2 className="text-lg font-semibold">Instruction blocks</h2><p className="text-sm text-text-muted">Small, scoped, versioned rules. Approved blocks are selected deterministically.</p></div><Input label="Block title" value={blockTitle} onChange={event => setBlockTitle(event.target.value)} placeholder="e.g. Claims must be verified" /><Textarea label="Instruction" value={blockText} onChange={event => setBlockText(event.target.value)} placeholder="Write one clear rule the compiler should apply." /><Button onClick={addBlock}><Plus size={16} />Save draft block</Button><LibraryList items={data.instructionBlocks.map(item => ({ id: item.id, title: item.title, meta: `${item.scope} · v${item.version}`, status: item.status }))} empty="No instruction blocks yet." /></Card><Card className="p-5 sm:p-7 space-y-4"><div><h2 className="text-lg font-semibold">Recipes</h2><p className="text-sm text-text-muted">Repeatable production methods. Only Approved Recipes can be selected by operators.</p></div><Input label="Recipe name" value={recipeName} onChange={event => setRecipeName(event.target.value)} placeholder="e.g. Instagram conversion ad" /><Button onClick={addRecipe}><Plus size={16} />Save draft recipe</Button><LibraryList items={data.promptRecipes.map(item => ({ id: item.id, title: item.name, meta: `${item.taskType} · v${item.version}`, status: item.status }))} empty="No recipes yet." /></Card></div>
      <div className="grid gap-6 lg:grid-cols-2"><Card className="p-5 sm:p-7 space-y-4"><div className="flex items-start gap-3"><Layers3 className="mt-1 text-primary" size={20} /><div><h2 className="text-lg font-semibold">Context packs</h2><p className="mt-1 text-sm text-text-muted">Reusable client, product, industry, platform, and campaign context.</p></div></div><Input label="Pack name" value={packName} onChange={event => setPackName(event.target.value)} placeholder="e.g. Pareero Brand Pack" /><label className="block text-sm font-medium text-text-secondary">Pack type<select value={packType} onChange={event => setPackType(event.target.value as ContextPack['packType'])} className="mt-2 min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3 text-sm">{(['organization','industry','brand','product','campaign','platform'] as const).map(type => <option key={type} value={type}>{type}</option>)}</select></label><Textarea label="Description" value={packDescription} onChange={event => setPackDescription(event.target.value)} placeholder="What facts, rules, and assets this Pack governs." /><label className="block text-sm font-medium text-text-secondary">Status<select value={packStatus} onChange={event => setPackStatus(event.target.value as LibraryStatus)} className="mt-2 min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3 text-sm"><option value="draft">Draft</option><option value="testing">Testing</option><option value="approved">Approved</option><option value="archived">Archived</option></select></label><Button onClick={addPack}><Plus size={16} />Save Context Pack</Button><LibraryList items={data.contextPacks.map(item => ({ id: item.id, title: item.name, meta: `${item.packType} · v${item.version}`, status: item.status }))} empty="No Context Packs yet." /></Card><Card className="p-5 sm:p-7 space-y-4"><div><h2 className="text-lg font-semibold">Quality rubrics</h2><p className="text-sm text-text-muted">Govern consistent human review. Rubrics are versioned and never alter old run scores.</p></div><Input label="Rubric name" value={rubricName} onChange={event => setRubricName(event.target.value)} placeholder="e.g. Conversion creative quality" /><label className="block text-sm font-medium text-text-secondary">Status<select value={rubricStatus} onChange={event => setRubricStatus(event.target.value as LibraryStatus)} className="mt-2 min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3 text-sm"><option value="draft">Draft</option><option value="testing">Testing</option><option value="approved">Approved</option></select></label><Button onClick={addRubric}><Plus size={16} />Save rubric</Button><LibraryList items={data.qualityRubrics.map(item => ({ id: item.id, title: item.name, meta: `${item.criteria.length} criteria · v${item.version}`, status: item.status }))} empty="No quality rubrics yet." /></Card></div>
      <Card className="p-5 sm:p-7 space-y-4"><div><h2 className="text-lg font-semibold">Model profiles</h2><p className="text-sm text-text-muted">Describe an AI model’s capabilities without placing credentials in the browser.</p></div><div className="grid gap-4 sm:grid-cols-3"><Input label="Provider" value={modelProvider} onChange={event => setModelProvider(event.target.value)} placeholder="e.g. OpenAI" /><Input label="Model name" value={modelName} onChange={event => setModelName(event.target.value)} placeholder="e.g. GPT-4.1" /><label className="block text-sm font-medium text-text-secondary">Family<select value={modelFamily} onChange={event => setModelFamily(event.target.value as ModelProfile['family'])} className="mt-2 min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3 text-sm">{(['text','image','video','multimodal'] as const).map(family => <option key={family} value={family}>{family}</option>)}</select></label></div><Button onClick={addModelProfile}><Plus size={16} />Save model profile</Button><LibraryList items={data.modelProfiles.map(item => ({ id: item.id, title: `${item.provider} · ${item.name}`, meta: `${item.family} · ${item.contextLimit.toLocaleString()} context`, status: item.active ? 'active' : 'inactive' }))} empty="No model profiles yet." /></Card>
    </div>}

    {tab === 'quality' && <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><Card className="p-5 sm:p-7"><div className="flex items-start gap-3"><FlaskConical className="mt-1 text-primary" size={20} /><div><h2 className="text-lg font-semibold">Quality Lab</h2><p className="mt-1 text-sm text-text-muted">Score generation runs, preserve reviewer feedback, and use outcomes to improve a Recipe—not silently rewrite it.</p></div></div><div className="mt-6"><p className="text-3xl font-semibold text-primary">{data.generationRuns.filter(run => run.status === 'approved').length}</p><p className="mt-1 text-sm text-text-muted">Approved generation runs</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><StatusList title="Average quality" items={[data.generationRuns.filter(run => run.qualityScore !== null).length ? `${Math.round(data.generationRuns.reduce((sum, run) => sum + (run.qualityScore || 0), 0) / data.generationRuns.filter(run => run.qualityScore !== null).length)}%` : 'No reviewed runs']} /><StatusList title="Needs review" items={[`${data.generationRuns.filter(run => run.status === 'in-review').length} runs`]} warning /></div></Card><Card className="p-5 sm:p-7">{data.generationRuns.length === 0 ? <EmptyState icon={<CheckCircle2 size={22} />} title="No runs to evaluate" description="Compile a prompt first. Each run keeps its exact snapshot and can be reviewed here." /> : <div className="divide-y divide-border-dark">{data.generationRuns.map(run => { const brief = data.briefs.find(item => item.id === run.briefId); return <div key={run.id} className="py-4"><p className="font-medium">{brief?.deliverableType || 'Production brief'} · {run.status.replaceAll('-', ' ')}</p><p className="mt-1 text-sm text-text-muted">{brief?.brief}</p><div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr_auto]"><Input label="Score" value={reviewScore} onChange={event => setReviewScore(event.target.value)} placeholder="0–100" /><Input label="Reviewer feedback" value={reviewFeedback} onChange={event => setReviewFeedback(event.target.value)} placeholder="What should improve?" /><Button onClick={() => saveReview(run)}>Save review</Button></div>{run.qualityScore !== null && <p className="mt-2 text-xs text-primary">Saved score: {run.qualityScore}% {run.reviewerFeedback ? `· ${run.reviewerFeedback}` : ''}</p>}</div> })}</div>}</Card></div>}

    {tab === 'history' && <Card className="p-5 sm:p-7">{data.generationRuns.length === 0 ? <EmptyState icon={<CheckCircle2 size={22} />} title="No generation runs yet" description="Each compiled brief will appear here with its exact prompt, review state, and eventual quality score." /> : <div className="divide-y divide-border-dark">{data.generationRuns.map(run => { const brief = data.briefs.find(item => item.id === run.briefId); const prompt = data.compiledPrompts.find(item => item.id === run.compiledPromptId); return <div key={run.id} className="py-4"><p className="font-medium text-text-primary">{brief?.deliverableType || 'Production brief'} · {brief?.objective || 'No objective'}</p><p className="mt-1 text-sm text-text-muted">{brief?.brief}</p><p className="mt-2 text-xs text-primary">{run.status.replaceAll('-', ' ')} · {prompt?.missingInputs.length || 0} missing inputs · {prompt?.conflicts.length || 0} safety flags</p></div> })}</div>}</Card>}
  </div>;
}

function StatusList({ title, items, warning = false }: { title: string; items: string[]; warning?: boolean }) { return <div className={`rounded-lg border p-4 ${warning ? 'border-amber-500/30 bg-amber-500/5' : 'border-border-dark bg-white/[0.02]'}`}><p className="text-sm font-medium">{title}</p>{items.length ? <ul className="mt-2 space-y-1 text-sm text-text-muted">{items.map(item => <li key={item}>• {item}</li>)}</ul> : <p className="mt-2 text-sm text-text-muted">No issues found.</p>}</div>; }
function LibraryList({ items, empty }: { items: { id: string; title: string; meta: string; status: string }[]; empty: string }) { return <div className="mt-5 divide-y divide-border-dark border-t border-border-dark">{items.length ? items.map(item => <div key={item.id} className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-text-muted">{item.meta}</p></div><span className="rounded-full bg-white/[0.06] px-2 py-1 text-xs text-text-muted">{item.status}</span></div>) : <p className="py-5 text-sm text-text-muted">{empty}</p>}</div>; }
function TemplateList({ templates, onEdit }: { templates: PromptTemplate[]; onEdit: (template: PromptTemplate) => void }) { return <div className="mt-5 divide-y divide-border-dark border-t border-border-dark">{templates.length ? templates.map(template => <div key={template.id} className="py-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-text-primary">{template.title}</p><p className="mt-1 text-xs text-text-muted">{template.category} · v{template.version} · {template.status}</p>{template.description && <p className="mt-2 text-sm text-text-muted">{template.description}</p>}</div><button onClick={() => onEdit(template)} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-border-dark px-3 text-sm text-text-secondary hover:bg-white/[0.04]"><Pencil size={14} />Edit</button></div></div>) : <p className="py-5 text-sm text-text-muted">No template prompts yet. Add the prompt your team uses most, then approve it when it is ready.</p>}</div>; }
