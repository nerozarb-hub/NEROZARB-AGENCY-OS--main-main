import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  CheckSquare,
  CalendarDays,
  ClipboardCopy,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
  Wand2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAppData } from '../../contexts/AppDataContext';
import { PromptTemplate } from '../../utils/storage';
import {
  CLIENT_AUTO_VARIABLES,
  PROMPT_CATEGORIES,
  QUICK_CUSTOM_VARIABLES,
  STARTER_AGENCY_PROMPTS,
  extractCustomVariables,
  filterPrompts,
  formatVariableLabel,
  resolvePromptContent,
} from '../../features/prompt-os/promptVault';

interface PromptStudioProps {
  onNavigate?: (view: string, id?: string) => void;
  initialClientId?: string | null;
}

const createPromptId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function PromptStudio({ onNavigate, initialClientId }: PromptStudioProps) {
  const { data, setData, showToast, addTask, addPost } = useAppData();

  // Vault Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [clientScope, setClientScope] = useState<string>(initialClientId || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);

  // Active Prompt in Workbench
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(() => {
    const storedId = sessionStorage.getItem('nerozarb_active_prompt_id');
    if (storedId) {
      sessionStorage.removeItem('nerozarb_active_prompt_id');
      return storedId;
    }
    return null;
  });

  // Workbench Runner State
  const [runnerClientId, setRunnerClientId] = useState<string>(
    initialClientId || (data.clients[0]?.id ? String(data.clients[0].id) : '')
  );
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [includeClientContext, setIncludeClientContext] = useState<boolean>(false);
  const [justCopiedId, setJustCopiedId] = useState<string | null>(null);

  // Create / Edit Modal State
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>(PROMPT_CATEGORIES[0]);
  const [formClientId, setFormClientId] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formTags, setFormTags] = useState<string>('');

  // Keep clientScope synced if global client filter changes
  useEffect(() => {
    if (initialClientId) {
      setRunnerClientId(initialClientId);
    }
  }, [initialClientId]);

  // Filtered Prompts
  const filteredPrompts = useMemo(
    () =>
      filterPrompts(data.promptTemplates, {
        category: selectedCategory,
        clientScope,
        search: searchQuery,
        favoritesOnly,
      }),
    [data.promptTemplates, selectedCategory, clientScope, searchQuery, favoritesOnly]
  );

  // Category Counts (respecting current clientScope & search)
  const categoryCounts = useMemo(() => {
    const baseList = filterPrompts(data.promptTemplates, {
      category: 'all',
      clientScope,
      search: searchQuery,
      favoritesOnly,
    });
    const counts: Record<string, number> = { all: baseList.length };
    for (const cat of PROMPT_CATEGORIES) {
      counts[cat] = baseList.filter(p => p.category === cat).length;
    }
    return counts;
  }, [data.promptTemplates, clientScope, searchQuery, favoritesOnly]);

  // Ensure an active prompt is selected whenever filtered list changes
  const activePrompt = useMemo(() => {
    if (!filteredPrompts.length) return null;
    return (
      filteredPrompts.find(p => p.id === selectedPromptId) ||
      data.promptTemplates.find(p => p.id === selectedPromptId) ||
      filteredPrompts[0]
    );
  }, [filteredPrompts, data.promptTemplates, selectedPromptId]);

  const activeClient = useMemo(
    () => data.clients.find(c => c.id === Number(runnerClientId)) || null,
    [data.clients, runnerClientId]
  );

  const detectedVariables = useMemo(
    () => (activePrompt ? extractCustomVariables(activePrompt.content) : []),
    [activePrompt]
  );

  const resolvedPromptText = useMemo(() => {
    if (!activePrompt) return '';
    return resolvePromptContent(activePrompt.content, {
      client: activeClient,
      variables: variableValues,
      includeClientContext,
    });
  }, [activePrompt, activeClient, variableValues, includeClientContext]);

  const recordUsage = (promptId: string) => {
    setData(prev => ({
      ...prev,
      promptTemplates: prev.promptTemplates.map(item =>
        item.id === promptId
          ? { ...item, usageCount: (item.usageCount || 0) + 1 }
          : item
      ),
    }));
  };

  const handleCopyPrompt = async (promptToCopy: PromptTemplate, customResolvedText?: string) => {
    const text =
      customResolvedText ??
      resolvePromptContent(promptToCopy.content, {
        client: activeClient,
        variables: variableValues,
        includeClientContext,
      });

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback copy for restricted environments
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    recordUsage(promptToCopy.id);
    setJustCopiedId(promptToCopy.id);
    setTimeout(() => setJustCopiedId(null), 1800);
    showToast(`Copied "${promptToCopy.title}" to clipboard`);
  };

  const handleToggleFavorite = (promptId: string) => {
    setData(prev => ({
      ...prev,
      promptTemplates: prev.promptTemplates.map(item =>
        item.id === promptId ? { ...item, isFavorite: !item.isFavorite } : item
      ),
    }));
  };

  const handleDeletePrompt = (prompt: PromptTemplate) => {
    setData(prev => ({
      ...prev,
      promptTemplates: prev.promptTemplates.filter(item => item.id !== prompt.id),
    }));
    showToast(`Deleted "${prompt.title}"`);
  };

  const handleRestoreStarterPrompts = () => {
    setData(prev => {
      const existingIds = new Set(prev.promptTemplates.map(p => p.id));
      const missingStarters = STARTER_AGENCY_PROMPTS.filter(p => !existingIds.has(p.id));
      if (missingStarters.length === 0) {
        return prev;
      }
      return {
        ...prev,
        promptTemplates: [...prev.promptTemplates, ...missingStarters],
      };
    });
    showToast('Starter agency prompts restored across all categories');
  };

  const openNewPromptModal = () => {
    setEditingPromptId(null);
    setFormTitle('');
    setFormCategory(selectedCategory !== 'all' ? selectedCategory : PROMPT_CATEGORIES[0]);
    setFormClientId(
      clientScope !== 'all' && clientScope !== 'global' ? clientScope : ''
    );
    setFormDescription('');
    setFormContent('');
    setFormTags('');
    setIsEditorOpen(true);
  };

  const openEditPromptModal = (prompt: PromptTemplate) => {
    setEditingPromptId(prompt.id);
    setFormTitle(prompt.title);
    setFormCategory(prompt.category);
    setFormClientId(prompt.clientId ? String(prompt.clientId) : '');
    setFormDescription(prompt.description || '');
    setFormContent(prompt.content);
    setFormTags((prompt.tags || []).join(', '));
    setIsEditorOpen(true);
  };

  const handleSavePrompt = () => {
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('Please enter both a prompt title and prompt text.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const parsedTags = formTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    const parsedClientId = formClientId ? Number(formClientId) : null;

    if (editingPromptId) {
      setData(prev => ({
        ...prev,
        promptTemplates: prev.promptTemplates.map(item =>
          item.id === editingPromptId
            ? {
                ...item,
                title: formTitle.trim(),
                category: formCategory,
                clientId: parsedClientId,
                description: formDescription.trim(),
                content: formContent.trim(),
                tags: parsedTags,
                version: (item.version || 1) + 1,
                updatedAt: now,
              }
            : item
        ),
      }));
      setSelectedPromptId(editingPromptId);
      showToast('Prompt updated');
    } else {
      const newPrompt: PromptTemplate = {
        id: createPromptId(),
        title: formTitle.trim(),
        category: formCategory,
        clientId: parsedClientId,
        description: formDescription.trim(),
        content: formContent.trim(),
        status: 'approved',
        version: 1,
        tags: parsedTags,
        isFavorite: false,
        usageCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      setData(prev => ({
        ...prev,
        promptTemplates: [newPrompt, ...prev.promptTemplates],
      }));
      setSelectedPromptId(newPrompt.id);
      showToast('Prompt saved to Vault');
    }

    setIsEditorOpen(false);
  };

  const insertTokenIntoEditor = (token: string) => {
    setFormContent(prev => {
      const separator = prev && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
      return `${prev}${separator}${token}`;
    });
  };

  const handleSendToTask = () => {
    if (!activePrompt) return;
    const targetClient = activeClient || data.clients[0];
    if (!targetClient) {
      showToast('Add a client first so we can assign the task to them.', 'error');
      onNavigate?.('client');
      return;
    }

    const categoryMap: Record<string, any> = {
      'Brand Story': 'Brand Design',
      Strategy: 'Strategy',
      Brainstorming: 'Strategy',
      'Art Direction': 'Brand Design',
      'Image Prompts': 'Ad Creative',
      Videos: 'Video Production',
      Storytelling: 'Content Production',
      'Copywriting & Scripting': 'Content Production',
    };

    addTask({
      clientId: targetClient.id,
      name: `${activePrompt.title} (${targetClient.name})`,
      category: categoryMap[activePrompt.category] || 'Content Production',
      phase: 'ongoing',
      stagePipeline: ['BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED'],
      currentStage: 'BRIEFED',
      assignedNode: activePrompt.category === 'Videos' ? 'Video Editor' : 'Art Director',
      priority: 'normal',
      status: 'active',
      deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      estimatedHours: 2,
      brief: resolvedPromptText,
      assetLinks: [],
      sopReference: null,
      notes: `Generated from Prompt OS: ${activePrompt.title}`,
      deliveredOnTime: null,
      linkedPostId: null,
      linkedPromptId: activePrompt.id,
      compiledPromptId: activePrompt.id,
    });

    recordUsage(activePrompt.id);
    showToast(`Task created for ${targetClient.name} with prompt attached`);
  };

  const handleSendToPost = () => {
    if (!activePrompt) return;
    const targetClient = activeClient || data.clients[0];
    if (!targetClient) {
      showToast('Add a client first so we can schedule a post for them.', 'error');
      onNavigate?.('client');
      return;
    }

    addPost({
      clientId: targetClient.id,
      platforms: ['instagram'],
      postType: activePrompt.category === 'Videos' ? 'Reel / Short Video' : 'Carousel',
      contentPillar: targetClient.contentPillars?.[0] || activePrompt.category,
      templateType: 'Template A',
      hook: variableValues.topic || variableValues.hook_angle || activePrompt.title,
      triggerUsed: null,
      captionBody: resolvedPromptText,
      cta: variableValues.cta || 'Link in bio',
      ctaType: 'Link in bio',
      hashtags: '',
      visualBrief: `Prompt Reference: ${activePrompt.title}\n\n${resolvedPromptText}`,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '10:00',
      publishedDate: null,
      status: 'BRIEF WRITTEN',
      priority: 'normal',
      assignedTo: activePrompt.category === 'Videos' ? 'Video Editor' : 'Art Director',
      linkedTaskId: null,
      linkedPromptId: activePrompt.id,
      assetLinks: [],
      referencePost: null,
      performance: null,
    });

    recordUsage(activePrompt.id);
    showToast(`Content post created for ${targetClient.name} with prompt attached`);
  };

  const getClientName = (clientId?: number | null) => {
    if (!clientId) return 'Global Agency';
    return data.clients.find(c => c.id === clientId)?.name || 'Client Specific';
  };

  return (
    <div className="page-container space-y-6">
      {/* Page Header */}
      <header className="page-header">
        <div>
          <h1 className="page-header-title">Prompt OS Vault</h1>
          <p className="page-header-subtitle mt-1">
            Save, categorize, and reuse agency prompts across clients with automatic brand context and one-click copy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {data.promptTemplates.length < STARTER_AGENCY_PROMPTS.length && (
            <Button variant="outline" onClick={handleRestoreStarterPrompts}>
              <RotateCcw size={15} />
              Restore Starter Prompts
            </Button>
          )}
          <Button onClick={openNewPromptModal}>
            <Plus size={16} />
            New Prompt
          </Button>
        </div>
      </header>

      {/* Top Filter & Search Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-card border border-border-dark rounded-lg p-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search prompts by title, category, variable, or keyword..."
            aria-label="Search prompts"
            className="w-full min-h-10 rounded-lg border border-border-dark bg-onyx pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
        </div>

        {/* Client Scope Filter & Starred Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="vault-client-filter" className="text-xs font-medium text-text-muted whitespace-nowrap">
              Saved for:
            </label>
            <select
              id="vault-client-filter"
              value={clientScope}
              onChange={e => {
                const val = e.target.value;
                setClientScope(val);
                if (val !== 'all' && val !== 'global') {
                  setRunnerClientId(val);
                }
              }}
              className="min-h-10 rounded-lg border border-border-dark bg-onyx px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="all">All Prompts (Global + Clients)</option>
              <option value="global">Global Agency Prompts Only</option>
              {data.clients.map(client => (
                <option key={client.id} value={String(client.id)}>
                  {client.name} (+ Global)
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setFavoritesOnly(prev => !prev)}
            className={`min-h-10 inline-flex items-center gap-2 rounded-lg border px-3.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              favoritesOnly
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border-dark bg-onyx text-text-secondary hover:bg-white/[0.04]'
            }`}
          >
            <Star size={14} className={favoritesOnly ? 'fill-primary text-primary' : ''} />
            <span>Starred Only</span>
          </button>
        </div>
      </div>

      {/* Category Segmented Filter Bar */}
      <nav
        aria-label="Prompt categories"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"
      >
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`min-h-10 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
            selectedCategory === 'all'
              ? 'bg-primary text-onyx font-semibold'
              : 'bg-card border border-border-dark text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
          }`}
        >
          <span>All Categories</span>
          <span className="font-mono tabular-nums text-[11px] opacity-80">
            {categoryCounts.all || 0}
          </span>
        </button>

        {PROMPT_CATEGORIES.map(category => {
          const isActive = selectedCategory === category;
          const count = categoryCounts[category] || 0;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`min-h-10 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
                isActive
                  ? 'bg-primary text-onyx font-semibold'
                  : 'bg-card border border-border-dark text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
              }`}
            >
              <span>{category}</span>
              <span className="font-mono tabular-nums text-[11px] opacity-80">
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Main Master-Detail Split: Left Prompt List | Right Live Prompt Workbench */}
      {filteredPrompts.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={22} />}
          title="No prompts match your current filter"
          description="Try clearing the search filter, switching categories, or creating a new prompt for this category."
          actionLabel="Create New Prompt"
          onAction={openNewPromptModal}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-start">
          {/* LEFT: Categorized Prompt Cards */}
          <div className="space-y-3">
            {filteredPrompts.map(prompt => {
              const isSelected = activePrompt?.id === prompt.id;
              const customVars = extractCustomVariables(prompt.content);
              const isCopied = justCopiedId === prompt.id;

              return (
                <Card
                  key={prompt.id}
                  onClick={() => {
                    setSelectedPromptId(prompt.id);
                    if (prompt.clientId) {
                      setRunnerClientId(String(prompt.clientId));
                    }
                  }}
                  className={`p-5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-card-alt'
                      : 'border-border-dark bg-card hover:border-white/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <h2 className="text-base font-semibold text-text-primary leading-snug">
                        {prompt.title}
                      </h2>
                      {/* Unboxed Metadata Discipline: Category · Client Scope · Usage Count */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                        <span className="text-primary font-medium">{prompt.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{getClientName(prompt.clientId)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Used {prompt.usageCount || 0} {prompt.usageCount === 1 ? 'time' : 'times'}
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(prompt.id)}
                        aria-label={
                          prompt.isFavorite
                            ? `Remove ${prompt.title} from starred`
                            : `Star ${prompt.title}`
                        }
                        className="p-2 rounded-md text-text-muted hover:text-primary hover:bg-white/[0.04] transition-colors"
                      >
                        <Star
                          size={15}
                          className={prompt.isFavorite ? 'fill-primary text-primary' : ''}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditPromptModal(prompt)}
                        aria-label={`Edit ${prompt.title}`}
                        className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePrompt(prompt)}
                        aria-label={`Delete ${prompt.title}`}
                        className="p-2 rounded-md text-text-muted hover:text-red-400 hover:bg-white/[0.04] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {prompt.description && (
                    <p className="mt-2.5 text-sm text-text-secondary line-clamp-2">
                      {prompt.description}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-border-dark flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-text-muted font-mono truncate max-w-[65%]">
                      {customVars.length > 0 ? (
                        <span>
                          Variables: {customVars.map(v => `{{${v}}}`).join(' · ')}
                        </span>
                      ) : (
                        <span>Ready to copy with client context</span>
                      )}
                    </div>

                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(prompt)}
                        className="min-h-9 inline-flex items-center gap-1.5 rounded-lg border border-border-dark bg-onyx px-3 py-1.5 text-xs font-medium text-text-primary hover:border-primary transition-colors whitespace-nowrap"
                      >
                        {isCopied ? (
                          <>
                            <Check size={13} className="text-primary" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <ClipboardCopy size={13} />
                            <span>Quick Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* RIGHT: Interactive Prompt Workbench */}
          {activePrompt && (
            <Card className="p-6 space-y-5 xl:sticky xl:top-6 border-border-dark bg-card">
              <div className="flex items-start justify-between gap-4 border-b border-border-dark pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="text-primary font-medium">{activePrompt.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{getClientName(activePrompt.clientId)}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-text-primary">
                    {activePrompt.title}
                  </h2>
                  {activePrompt.description && (
                    <p className="text-sm text-text-muted">{activePrompt.description}</p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditPromptModal(activePrompt)}
                >
                  <Pencil size={14} />
                  Edit
                </Button>
              </div>

              {/* 1. Client Context Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="workbench-client-select"
                    className="text-xs font-semibold text-text-secondary"
                  >
                    1. Client Context (Auto-Fills Brand Details)
                  </label>
                  {activeClient && (
                    <span className="text-xs text-primary font-mono">
                      {activeClient.niche || 'Active Client'}
                    </span>
                  )}
                </div>

                <select
                  id="workbench-client-select"
                  value={runnerClientId}
                  onChange={e => setRunnerClientId(e.target.value)}
                  className="min-h-10 w-full rounded-lg border border-border-dark bg-onyx px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="">No specific client (keep placeholders)</option>
                  {data.clients.map(client => (
                    <option key={client.id} value={String(client.id)}>
                      {client.name} {client.niche ? `— ${client.niche}` : ''}
                    </option>
                  ))}
                </select>

                {activeClient && (
                  <label className="flex items-center gap-2.5 text-xs text-text-secondary cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={includeClientContext}
                      onChange={e => setIncludeClientContext(e.target.checked)}
                      className="h-4 w-4 rounded border-border-dark bg-onyx accent-primary"
                    />
                    <span>
                      Also prepend full Client Strategy block (Niche, Audience, Problem & Pillars)
                    </span>
                  </label>
                )}
              </div>

              {/* 2. Quick Variable Inputs */}
              {detectedVariables.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border-dark">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-secondary">
                      2. Fill Quick Variables
                    </span>
                    {Object.keys(variableValues).length > 0 && (
                      <button
                        type="button"
                        onClick={() => setVariableValues({})}
                        className="text-xs text-text-muted hover:text-text-primary"
                      >
                        Clear values
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {detectedVariables.map(varKey => (
                      <Input
                        key={varKey}
                        label={formatVariableLabel(varKey)}
                        value={variableValues[varKey] || ''}
                        onChange={e =>
                          setVariableValues(prev => ({
                            ...prev,
                            [varKey]: e.target.value,
                          }))
                        }
                        placeholder={`Enter ${formatVariableLabel(varKey).toLowerCase()}...`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Live Resolved Prompt Preview */}
              <div className="space-y-2 pt-2 border-t border-border-dark">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-secondary">
                    {detectedVariables.length > 0 ? '3. Ready-to-Use Prompt' : '2. Ready-to-Use Prompt'}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-text-muted">
                    {resolvedPromptText.length} chars
                  </span>
                </div>

                <div className="rounded-lg border border-border-dark bg-onyx p-4 text-sm leading-relaxed text-text-primary whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto custom-scrollbar">
                  {resolvedPromptText}
                </div>
              </div>

              {/* Primary Copy Action + Send to Task / Content */}
              <div className="space-y-3 pt-1">
                <Button
                  onClick={() => handleCopyPrompt(activePrompt, resolvedPromptText)}
                  className="w-full py-3"
                >
                  <ClipboardCopy size={16} />
                  Copy Ready Prompt
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Button variant="outline" size="sm" onClick={handleSendToTask} className="w-full">
                    <CheckSquare size={14} />
                    Create Task with Prompt
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSendToPost} className="w-full">
                    <CalendarDays size={14} />
                    Create Post with Prompt
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* New / Edit Prompt Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        width={760}
        title={
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              {editingPromptId ? 'Edit Prompt' : 'Save New Prompt'}
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Organize by category and client so the whole agency can find and reuse it anytime.
            </p>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePrompt}>
              <Wand2 size={15} />
              {editingPromptId ? 'Save Changes' : 'Save to Prompt Vault'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <Input
            label="Prompt Title"
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            placeholder="e.g. Founder Origin Story Script or High-Converting Carousel Copy"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="prompt-editor-category"
                className="mb-2 block text-sm font-medium text-text-secondary"
              >
                Category
              </label>
              <select
                id="prompt-editor-category"
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
              >
                {PROMPT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="prompt-editor-client"
                className="mb-2 block text-sm font-medium text-text-secondary"
              >
                Save For (Client Scope)
              </label>
              <select
                id="prompt-editor-client"
                value={formClientId}
                onChange={e => setFormClientId(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="">Global Agency (Reusable for All Clients)</option>
                {data.clients.map(client => (
                  <option key={client.id} value={String(client.id)}>
                    Client: {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="When to use this prompt (optional short note)"
            value={formDescription}
            onChange={e => setFormDescription(e.target.value)}
            placeholder="e.g. Use when scripting 45-second direct-response Reels for a new offer"
          />

          <div className="space-y-2">
            <Textarea
              label="Prompt Text"
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              rows={8}
              placeholder="Write or paste your prompt here. Click any variable button below to insert dynamic fields like {{client.name}} or {{topic}}."
              className="font-mono text-sm"
            />

            {/* One-Click Variable Inserters */}
            <div className="rounded-lg border border-border-dark bg-onyx p-3 space-y-2.5">
              <div>
                <p className="text-xs font-medium text-text-secondary mb-1.5">
                  Insert Auto-Filled Client Variables:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CLIENT_AUTO_VARIABLES.map(item => (
                    <button
                      key={item.token}
                      type="button"
                      onClick={() => insertTokenIntoEditor(item.token)}
                      className="rounded border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-mono text-primary hover:bg-primary/20 transition-colors"
                      title={item.description}
                    >
                      + {item.label} ({item.token})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-text-secondary mb-1.5">
                  Insert Quick Fillable Variables:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CUSTOM_VARIABLES.map(varName => (
                    <button
                      key={varName}
                      type="button"
                      onClick={() => insertTokenIntoEditor(`{{${varName}}}`)}
                      className="rounded border border-border-dark bg-card px-2.5 py-1 text-xs font-mono text-text-secondary hover:border-white/30 hover:text-text-primary transition-colors"
                    >
                      + {`{{${varName}}}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Input
            label="Tags (optional, comma-separated)"
            value={formTags}
            onChange={e => setFormTags(e.target.value)}
            placeholder="e.g. hooks, reels, conversion, ad-copy"
          />
        </div>
      </Modal>
    </div>
  );
}
