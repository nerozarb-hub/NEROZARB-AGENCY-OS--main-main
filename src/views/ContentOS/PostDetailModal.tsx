import { useState, useMemo } from 'react';
import { Modal } from '../../components/ui/Modal';
import {
  ArrowRight,
  BarChart,
  BookOpen,
  ChevronRight,
  ClipboardCopy,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Post, PostStage, PerformanceLog } from '../../utils/storage';
import { resolvePromptContent } from '../../features/prompt-os/promptVault';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onNavigate?: (view: string, id?: string) => void;
}

const STAGES: PostStage[] = [
  'PLANNED',
  'BRIEF WRITTEN',
  'IN PRODUCTION',
  'REVIEW',
  'CEO APPROVAL',
  'CLIENT APPROVAL',
  'SCHEDULED',
  'PUBLISHED',
];

export default function PostDetailModal({
  isOpen,
  onClose,
  post,
  onNavigate,
}: PostDetailModalProps) {
  const { data, updatePost, advancePostStage, showToast } = useAppData();

  const client = useMemo(
    () => data.clients.find(c => c.id === post.clientId) || null,
    [data.clients, post.clientId]
  );
  const currentStageIndex = STAGES.indexOf(post.status);
  const nextStage = STAGES[currentStageIndex + 1] as PostStage | undefined;

  const linkedPrompt = useMemo(
    () =>
      post.linkedPromptId
        ? data.promptTemplates.find(p => p.id === String(post.linkedPromptId)) || null
        : null,
    [data.promptTemplates, post.linkedPromptId]
  );

  const resolvedPrompt = useMemo(() => {
    if (!linkedPrompt) return '';
    return resolvePromptContent(linkedPrompt.content, {
      client,
      includeClientContext: Boolean(client),
    });
  }, [linkedPrompt, client]);

  const [showPerformanceInput, setShowPerformanceInput] = useState(false);
  const [metrics, setMetrics] = useState<Partial<PerformanceLog>>(
    post.performance || {
      reach: 0,
      impressions: 0,
      saves: 0,
      shares: 0,
      comments: 0,
      likes: 0,
      ceoRating: '🟡 Performed',
      notes: '',
    }
  );

  const handleAdvanceStage = () => {
    if (!nextStage) return;
    advancePostStage(post.id, nextStage, 'ceo');
  };

  const handleAttachPrompt = (promptId: string) => {
    updatePost(post.id, { linkedPromptId: promptId || null });
    showToast(promptId ? 'Prompt linked to post' : 'Prompt unlinked');
  };

  const handleCopyPrompt = async () => {
    if (!resolvedPrompt) return;
    try {
      await navigator.clipboard.writeText(resolvedPrompt);
    } catch {
      // ignore
    }
    showToast('Resolved prompt copied to clipboard');
  };

  const handleOpenInPromptStudio = () => {
    if (linkedPrompt) {
      sessionStorage.setItem('nerozarb_active_prompt_id', linkedPrompt.id);
    }
    onNavigate?.('studio', String(post.clientId));
    onClose();
  };

  const handleSavePerformance = () => {
    const reach = Number(metrics.reach) || 0;
    const saves = Number(metrics.saves) || 0;
    const shares = Number(metrics.shares) || 0;

    const perf: PerformanceLog = {
      reach,
      impressions: Number(metrics.impressions) || 0,
      saves,
      shares,
      comments: Number(metrics.comments) || 0,
      likes: Number(metrics.likes) || 0,
      saveRate: reach > 0 ? Number(((saves / reach) * 100).toFixed(2)) : 0,
      shareRate: reach > 0 ? Number(((shares / reach) * 100).toFixed(2)) : 0,
      ceoRating: metrics.ceoRating || '🟡 Performed',
      notes: metrics.notes || '',
    };

    updatePost(post.id, { performance: perf });
    setShowPerformanceInput(false);
    showToast('Post performance metrics saved');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width={920}
      title={
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
            <span className="text-primary font-medium">{client?.name || 'Client'}</span>
            <span aria-hidden="true">·</span>
            <span>{post.postType}</span>
            <span aria-hidden="true">·</span>
            <span>{post.platforms.join(', ')}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{post.scheduledDate}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
            {post.hook || 'Scheduled Post'}
          </h2>
        </div>
      }
      footer={
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-3">
          <Button variant="outline" size="sm" onClick={handleOpenInPromptStudio}>
            <BookOpen size={15} />
            Open Prompt Studio
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            {nextStage && (
              <Button onClick={handleAdvanceStage}>
                <span>Move to {nextStage}</span>
                <ArrowRight size={15} />
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stage Pipeline */}
        <div className="rounded-lg border border-border-dark bg-onyx p-4">
          <p className="text-xs font-medium text-text-muted mb-3">Production Pipeline</p>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stage} className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded ${
                      isCurrent
                        ? 'bg-primary text-onyx font-semibold'
                        : isCompleted
                        ? 'text-primary bg-primary/10'
                        : 'text-text-muted'
                    }`}
                  >
                    {stage}
                  </span>
                  {idx < STAGES.length - 1 && (
                    <ChevronRight size={13} className="text-text-muted/40" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Content & Linked Prompt */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-lg border border-border-dark bg-onyx p-5 space-y-4">
              <div>
                <p className="text-xs font-medium text-text-muted">Primary Hook</p>
                <p className="text-lg font-semibold text-text-primary mt-1">
                  {post.hook || 'No hook specified'}
                </p>
              </div>

              <div className="pt-3 border-t border-border-dark">
                <p className="text-xs font-medium text-text-muted">Caption / Script Body</p>
                <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed mt-1">
                  {post.captionBody || 'No caption written yet.'}
                </p>
              </div>

              <div className="pt-3 border-t border-border-dark">
                <p className="text-xs font-medium text-text-muted">Visual & Art Direction Brief</p>
                <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed mt-1">
                  {post.visualBrief || 'No visual brief added yet.'}
                </p>
              </div>
            </div>

            {/* Linked Prompt from Prompt OS */}
            <div className="rounded-lg border border-border-dark bg-onyx/70 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="post-detail-prompt-select"
                  className="text-xs font-semibold text-text-secondary flex items-center gap-2"
                >
                  <BookOpen size={14} className="text-primary" />
                  <span>Linked Prompt from Prompt OS</span>
                </label>

                {linkedPrompt && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border-dark bg-card px-2.5 py-1 text-xs font-medium text-text-primary hover:border-primary transition-colors"
                    >
                      <ClipboardCopy size={12} />
                      <span>Copy Prompt</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenInPromptStudio}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/15 border border-primary/30 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/25 transition-colors"
                    >
                      <span>Customize in Studio</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                )}
              </div>

              <select
                id="post-detail-prompt-select"
                value={linkedPrompt?.id || ''}
                onChange={e => handleAttachPrompt(e.target.value)}
                className="min-h-10 w-full rounded-lg border border-border-dark bg-card px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="">Select a prompt from Prompt Vault...</option>
                {data.promptTemplates
                  .filter(p => p.status !== 'archived')
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.category}] {p.title}
                    </option>
                  ))}
              </select>

              {linkedPrompt && (
                <div className="rounded-lg border border-border-dark bg-onyx p-3 text-xs font-mono text-text-secondary whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                  {resolvedPrompt}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Schedule Metadata & Performance */}
          <div className="space-y-5">
            <div className="rounded-lg border border-border-dark bg-onyx p-5 space-y-3 text-sm">
              <h3 className="text-xs font-semibold text-text-secondary border-b border-border-dark pb-2.5">
                Post Metadata
              </h3>
              <div className="flex justify-between">
                <span className="text-text-muted">Pillar</span>
                <span className="text-text-primary font-medium">{post.contentPillar || 'General'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Assigned To</span>
                <span className="text-text-primary font-medium">{post.assignedTo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">CTA</span>
                <span className="text-text-primary font-medium">{post.cta || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Scheduled</span>
                <span className="text-text-primary font-mono tabular-nums">
                  {post.scheduledDate} · {post.scheduledTime}
                </span>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="rounded-lg border border-border-dark bg-onyx p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  <BarChart size={14} className="text-primary" />
                  <span>Performance Metrics</span>
                </h3>
                {!showPerformanceInput && (
                  <button
                    type="button"
                    onClick={() => setShowPerformanceInput(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    {post.performance ? 'Edit metrics' : 'Log metrics'}
                  </button>
                )}
              </div>

              {showPerformanceInput ? (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowPerformanceInput(false)}
                      className="text-text-muted hover:text-text-primary"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['reach', 'impressions', 'saves', 'shares', 'comments', 'likes'] as const).map(
                      field => (
                        <div key={field}>
                          <label className="block text-xs text-text-muted capitalize mb-1">
                            {field}
                          </label>
                          <input
                            type="number"
                            value={metrics[field] ?? 0}
                            onChange={e =>
                              setMetrics({ ...metrics, [field]: Number(e.target.value) })
                            }
                            className="w-full rounded border border-border-dark bg-card px-2.5 py-1.5 text-xs font-mono tabular-nums text-text-primary"
                          />
                        </div>
                      )
                    )}
                  </div>
                  <Button size="sm" onClick={handleSavePerformance} className="w-full">
                    Save Metrics
                  </Button>
                </div>
              ) : post.performance ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted">Reach</span>
                    <p className="text-base font-semibold font-mono tabular-nums text-text-primary">
                      {post.performance.reach.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted">Saves</span>
                    <p className="text-base font-semibold font-mono tabular-nums text-primary">
                      {post.performance.saves.toLocaleString()} ({post.performance.saveRate}%)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-text-muted flex items-center gap-2">
                  <ShieldCheck size={15} className="text-text-muted" />
                  <span>No performance data logged yet.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
