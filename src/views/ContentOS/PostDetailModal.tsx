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
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex flex-col">
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">Asset Identifier</p>
        <h3 className="editorial-title text-2xl text-text-primary italic">Post Intelligence</h3>
      </div>
      <div className="h-8 w-px bg-border-dark hidden md:block" />
      {client && (
        <span className="font-sans text-[10px] font-bold text-primary/80 uppercase tracking-widest bg-white/5 border border-white/5 px-2 py-1">
          {client.name}
        </span>
      )}
      <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
        {post.platforms.map(p => (
          <span key={p} className="font-sans text-[9px] font-black uppercase tracking-widest text-[#555] bg-white/5 border border-white/5 px-2 py-0.5">
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
              className="px-4 py-2 text-[#888] hover:text-text-primary flex items-center gap-2 font-sans text-[10px] font-black uppercase tracking-widest border border-border-dark hover:border-text-muted transition-all duration-500"
            >
              <BrainCircuit size={14} />
              Vault Access
            </button>

            <Button variant="ghost" onClick={onClose} className="text-[#555] hover:text-text-primary text-[10px] uppercase font-black tracking-widest">
              Escape
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
            className={`flex-1 py-4 text-[9px] font-black tracking-[0.2em] uppercase transition-all duration-500 ${activeTab === 'content' ? 'text-primary border-b border-primary' : 'text-[#444]'}`}
            onClick={() => setActiveTab('content')}
          >
            Intelligence
          </button>
          <button
            className={`flex-1 py-4 text-[9px] font-black tracking-[0.2em] uppercase transition-all duration-500 ${activeTab === 'details' ? 'text-primary border-b border-primary' : 'text-[#444]'}`}
            onClick={() => setActiveTab('details')}
          >
            Deployment
          </button>

        </div>

        {/* LEFT: Pipeline + Content + Activity */}
        <div className={`flex-1 md:border-r border-border-dark flex-col p-6 md:p-8 space-y-10 overflow-y-auto ${activeTab === 'content' ? 'flex' : 'hidden md:flex'}`}>
          {/* Stage Pipeline */}
          <section className="space-y-6">
            <h4 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase">Evolution Pipeline</h4>
            <div className="flex items-center justify-between relative pt-2 overflow-x-auto pb-4 custom-scrollbar">
              <div className="absolute top-[18px] left-0 right-0 h-px bg-border-dark -z-10" />
              {STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stage} className="flex flex-col items-center gap-3 bg-onyx px-2 shrink-0">
                    <div className={`w-3.5 h-3.5 rounded-none rotate-45 border-2 transition-all duration-500 ${isCurrent ? 'border-primary bg-primary' : isCompleted ? 'border-primary/40 bg-primary/20' : 'border-[#222] bg-onyx'}`} />
                    <span className={`font-sans text-[8px] font-black tracking-widest max-w-[64px] text-center uppercase leading-none ${isCurrent ? 'text-primary' : isCompleted ? 'text-text-muted' : 'text-[#333]'}`}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>


          {/* Content Preview */}
          <section className="space-y-6">
            <h4 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-4">Content Intelligence</h4>
            <div className="bg-white/[0.01] rounded-none p-8 space-y-8 border border-white/[0.04] relative group transition-all duration-500 hover:border-text-muted/20">
              <div className="absolute top-0 left-0 w-1 h-8 bg-primary/60" />
              <div>
                <h5 className="font-sans text-[10px] font-bold text-[#555] uppercase tracking-[0.2em] mb-4 flex justify-between">
                  <span>Intelligence Hook</span>
                  {post.triggerUsed && <span className="text-primary/60 italic font-medium tracking-normal normal-case">Trigger: {post.triggerUsed}</span>}
                </h5>
                <p className="editorial-title text-3xl font-medium text-text-primary leading-tight italic">
                  {post.hook || <span className="text-[#333] not-italic">No hook written yet...</span>}
                </p>
              </div>
              <div>
                <h5 className="font-sans text-[10px] font-bold text-[#555] uppercase tracking-[0.2em] mb-4">Body Copy</h5>
                <p className="font-sans text-sm text-text-muted whitespace-pre-wrap leading-relaxed">
                  {post.captionBody || 'No deployment payload identified.'}
                </p>
              </div>
            </div>
          </section>


          {/* Activity Log */}
          <section className="space-y-6 pt-4">
            <h4 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-4 flex items-center gap-3">
              <Activity size={12} className="text-primary/60" />
              Temporal Logs
            </h4>
            <div className="space-y-4">
              {post.activityLog.slice().reverse().map((log, idx) => (
                <div key={idx} className="flex gap-4 items-start group">
                  <div className="w-1 h-1 rounded-none rotate-45 bg-[#333] group-hover:bg-primary mt-2 transition-all duration-500" />
                  <div className="flex-1">
                    <div className="font-sans text-[11px] text-text-secondary group-hover:text-text-primary transition-colors">{log.text}</div>
                    <div className="font-sans text-[9px] font-bold text-[#444] mt-1.5 uppercase tracking-widest">
                      {new Date(log.timestamp).toLocaleString()} · {log.author}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* RIGHT: Meta + Performance */}
        <div className={`w-full md:w-[400px] border-l border-white/[0.04] bg-white/[0.01] p-8 md:p-10 space-y-12 overflow-y-auto ${activeTab === 'details' ? 'flex' : 'hidden md:flex flex-col'}`}>
          <section className="space-y-6">
            <h4 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-4">Deployment Metadata</h4>
            <div className="space-y-5">
              {[
                { label: 'Environment', value: post.platforms.join(' + ') },
                { label: 'Intelligence Type', value: post.postType },
                { label: 'Target Window', value: <span className="text-primary font-bold">{post.scheduledDate} · {post.scheduledTime}</span> },
                { label: 'Primary Operator', value: post.assignedTo },
                { label: 'Priority Level', value: <span className={`font-bold ${post.priority === 'urgent' ? 'text-red-400' : post.priority === 'high' ? 'text-orange-400' : 'text-text-muted'}`}>{post.priority.toUpperCase()}</span> },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-3 group">
                  <span className="font-sans text-[9px] font-black text-[#444] group-hover:text-[#666] uppercase tracking-widest shrink-0 transition-colors">{label}</span>
                  <span className="font-sans text-[11px] font-bold text-text-primary text-right">{value}</span>
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

