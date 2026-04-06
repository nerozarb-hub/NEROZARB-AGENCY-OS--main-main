import { useState, useMemo } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Activity, ArrowRight, ExternalLink, BarChart, BrainCircuit } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Post, PostStage, PerformanceLog } from '../../utils/storage';
import { Badge } from '../../components/ui/Badge';

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
  'PUBLISHED'
];

const CEO_GATED_STAGES: PostStage[] = ['CEO APPROVAL', 'CLIENT APPROVAL', 'SCHEDULED', 'PUBLISHED'];

export default function PostDetailModal({ isOpen, onClose, post, onNavigate }: PostDetailModalProps) {
  const { data, updatePost, advancePostStage } = useAppData();

  const client = useMemo(() => data.clients.find(c => c.id === post.clientId), [data.clients, post.clientId]);
  const linkedTask = useMemo(() => data.tasks.find(t => t.id === post.linkedTaskId), [data.tasks, post.linkedTaskId]);

  const currentStageIndex = STAGES.indexOf(post.status);
  const nextStage = STAGES[currentStageIndex + 1] as PostStage | undefined;

  // Performance log state
  const [showPerformanceInput, setShowPerformanceInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'details'>('content');
  const [metrics, setMetrics] = useState<Partial<PerformanceLog>>(post.performance || {
    reach: 0,
    impressions: 0,
    saves: 0,
    shares: 0,
    comments: 0,
    likes: 0,
    ceoRating: '🟡 Performed',
    notes: ''
  });

  const handleAdvanceStage = () => {
    if (!nextStage) return;
    advancePostStage(post.id, nextStage, 'ceo');
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
      notes: metrics.notes || ''
    };

    updatePost(post.id, { performance: perf });
    setShowPerformanceInput(false);
  };

  const isCeoGated = nextStage ? CEO_GATED_STAGES.includes(nextStage) : false;

  const headerTitle = (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="font-heading text-xl text-text-primary tracking-tight uppercase">[ POST DETAIL ]</span>
      {client && (
        <span className="px-2 py-1 text-[10px] font-mono text-primary bg-primary/10 border border-primary/30 rounded-sm uppercase tracking-wider">
          {client.name}
        </span>
      )}
      <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
        {post.platforms.map(p => (
          <span key={p} className="text-[9px] uppercase font-mono tracking-widest text-text-muted bg-background px-2 py-0.5 rounded-sm capitalize shrink-0 border border-border-dark">
            {p}
          </span>
        ))}
      </div>
      <Badge status={post.status}>{post.status}</Badge>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={headerTitle}
      width={1100}
      footer={
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('vault', post.clientId.toString());
                  onClose();
                }
              }}
              className="px-3 py-1.5 text-primary hover:text-accent-light hover:bg-primary/10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest border border-primary/30 hover:border-primary/50 rounded-sm transition-all"
            >
              <BrainCircuit size={14} />
              OPEN VAULT
            </button>
            <Button variant="ghost" onClick={onClose} className="text-text-muted hover:text-text-primary text-[10px] uppercase font-mono">
              CLOSE
            </Button>
          </div>
          {nextStage && (
            <Button onClick={handleAdvanceStage} className="bg-primary hover:bg-accent-mid text-text-primary w-full sm:w-auto">
              {isCeoGated && <span className="mr-1 text-[10px]">CEO:</span>}
              ADVANCE TO {nextStage}
              <ArrowRight size={14} className="ml-2" />
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col md:flex-row -m-6 h-full min-h-[500px]">
        {/* Mobile Tabs */}
        <div className="md:hidden flex border-b border-border-dark bg-card shrink-0">
          <button
            className={`flex-1 py-3 text-[10px] font-mono tracking-widest uppercase transition-colors ${activeTab === 'content' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-muted'}`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
          <button
            className={`flex-1 py-3 text-[10px] font-mono tracking-widest uppercase transition-colors ${activeTab === 'details' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-muted'}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
        </div>

        {/* LEFT: Pipeline + Content + Activity */}
        <div className={`flex-1 md:border-r border-border-dark flex-col p-6 md:p-8 space-y-10 overflow-y-auto ${activeTab === 'content' ? 'flex' : 'hidden md:flex'}`}>
          {/* Stage Pipeline */}
          <section className="space-y-4">
            <h4 className="font-mono text-[10px] tracking-widest text-text-muted uppercase">STAGE PIPELINE</h4>
            <div className="flex items-center justify-between relative pt-2 overflow-x-auto pb-4 scrollbar-none">
              <div className="absolute top-[18px] left-0 right-0 h-px bg-border-dark -z-10" />
              {STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stage} className="flex flex-col items-center gap-2 bg-[#141820] px-1 shrink-0">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 ${isCurrent ? 'border-primary bg-background ring-2 ring-primary/30' : isCompleted ? 'border-primary bg-primary' : 'border-border-dark bg-background'}`} />
                    <span className={`text-[9px] font-mono tracking-wider max-w-[56px] text-center uppercase leading-tight ${isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-text-primary' : 'text-text-muted'}`}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Content Preview */}
          <section className="space-y-6">
            <h4 className="font-mono text-[10px] tracking-widest text-text-muted uppercase border-b border-border-dark pb-2">CONTENT PREVIEW</h4>
            <div className="bg-background/30 rounded-sm p-6 space-y-6 relative overflow-hidden border border-border-dark">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
              <div>
                <h5 className="text-[10px] font-mono text-text-muted uppercase mb-2 flex justify-between">
                  <span>[ HOOK ]</span>
                  {post.triggerUsed && <span className="text-secondary/80">Trigger: {post.triggerUsed}</span>}
                </h5>
                <p className="text-xl font-heading text-text-primary leading-tight">
                  {post.hook || <span className="text-text-muted italic text-base">No hook written yet...</span>}
                </p>
              </div>
              <div>
                <h5 className="text-[10px] font-mono text-text-muted uppercase mb-2">[ BODY ]</h5>
                <p className="text-sm text-text-muted whitespace-pre-wrap leading-relaxed">
                  {post.captionBody || 'No caption body written yet.'}
                </p>
              </div>
            </div>
          </section>

          {/* Activity Log */}
          <section className="space-y-4">
            <h4 className="font-mono text-[10px] tracking-widest text-text-muted uppercase border-b border-border-dark pb-2 flex items-center gap-2">
              <Activity size={14} />
              ACTIVITY LOG
            </h4>
            <div className="space-y-3">
              {post.activityLog.slice().reverse().map((log, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-text-primary">{log.text}</div>
                    <div className="text-[9px] text-text-muted font-mono mt-0.5 uppercase tracking-tighter">
                      {new Date(log.timestamp).toLocaleString()} · {log.author}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT: Meta + Performance */}
        <div className={`w-full md:w-96 bg-card-alt p-6 md:p-8 space-y-8 overflow-y-auto ${activeTab === 'details' ? 'flex' : 'hidden md:flex'}`}>
          <section className="space-y-4">
            <h4 className="font-mono text-[10px] tracking-widest text-text-muted uppercase border-b border-border-dark pb-2">POST INFO</h4>
            <div className="space-y-3 text-xs">
              {[
                { label: 'Platforms', value: post.platforms.join(', ') },
                { label: 'Post Type', value: post.postType },
                { label: 'Scheduled', value: <span className="text-primary font-mono">{post.scheduledDate} @ {post.scheduledTime}</span> },
                { label: 'Assigned', value: post.assignedTo },
                { label: 'Priority', value: <span className={post.priority === 'urgent' ? 'text-red-400 font-bold' : post.priority === 'high' ? 'text-orange-400' : 'text-text-muted'}>{post.priority.toUpperCase()}</span> },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-2">
                  <span className="text-text-muted font-mono uppercase text-[9px] flex items-center gap-1 shrink-0">{label}</span>
                  <span className="text-text-primary text-right">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center border-b border-border-dark pb-2">
              <h4 className="font-mono text-[10px] tracking-widest text-primary flex items-center gap-2 uppercase">
                <BarChart size={14} />
                PERFORMANCE
              </h4>
              {post.status === 'PUBLISHED' && !showPerformanceInput && (
                <button
                  className="text-[9px] uppercase text-text-muted hover:text-primary font-mono transition-colors"
                  onClick={() => setShowPerformanceInput(true)}
                >
                  {post.performance ? 'UPDATE' : 'ADD +'}
                </button>
              )}
            </div>

            {post.status !== 'PUBLISHED' ? (
              <div className="p-4 border border-dashed border-border-dark/50 text-center rounded-sm">
                <p className="text-[10px] text-text-muted uppercase font-mono">Metrics pending publish.</p>
              </div>
            ) : showPerformanceInput ? (
              <div className="bg-background border border-primary/30 p-4 rounded-sm space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {(['reach', 'impressions', 'saves', 'shares', 'comments', 'likes'] as const).map(field => (
                    <div key={field} className="space-y-1">
                      <label className="text-[9px] text-text-muted uppercase font-mono">{field}</label>
                      <input
                        type="number"
                        value={metrics[field] ?? 0}
                        onChange={e => setMetrics({ ...metrics, [field]: Number(e.target.value) })}
                        className="w-full bg-card p-1.5 text-xs text-text-primary rounded-sm outline-none border border-border-dark focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowPerformanceInput(false)} className="text-[10px] font-mono">CANCEL</Button>
                  <Button size="sm" onClick={handleSavePerformance} className="text-[10px] font-mono">SAVE</Button>
                </div>
              </div>
            ) : post.performance ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background/50 p-3 rounded-sm border border-border-dark">
                    <div className="text-[9px] uppercase text-text-muted font-mono mb-1">Save Rate</div>
                    <div className="text-xl font-heading text-primary">{post.performance.saveRate}%</div>
                  </div>
                  <div className="bg-background/50 p-3 rounded-sm border border-border-dark">
                    <div className="text-[9px] uppercase text-text-muted font-mono mb-1">Share Rate</div>
                    <div className="text-xl font-heading text-secondary">{post.performance.shareRate}%</div>
                  </div>
                </div>
                <div className="p-3 bg-background/50 border border-border-dark rounded-sm">
                  <div className="text-[9px] text-text-muted font-mono uppercase mb-1">CEO Rating</div>
                  <div className="text-xs uppercase font-bold text-text-primary">{post.performance.ceoRating}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-border-dark/50 text-center rounded-sm">
                <p className="text-[10px] text-text-muted font-mono uppercase mb-3">No metrics logged.</p>
                <Button size="sm" onClick={() => setShowPerformanceInput(true)} className="text-[10px] font-mono">ADD PERFORMANCE</Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </Modal>
  );
}

