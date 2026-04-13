import { useState, useMemo } from 'react';
import { Modal } from '../../components/ui/Modal';
import { ArrowRight, BarChart, BrainCircuit, ShieldCheck, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Post, PostStage, PerformanceLog } from '../../utils/storage';

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
  const currentStageIndex = STAGES.indexOf(post.status);
  const nextStage = STAGES[currentStageIndex + 1] as PostStage | undefined;

  const [showPerformanceInput, setShowPerformanceInput] = useState(false);
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
    <div className="flex items-center gap-6 flex-wrap">
      <div className="flex flex-col">
          <p className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">ASSET_IDENTIFIER</p>
          <h2 className="font-heading text-4xl text-text-primary uppercase tracking-tighter">Post Intelligence</h2>
      </div>
      <div className="h-10 w-px bg-white/[0.06] hidden md:block" />
      {client && (
        <span className="font-sans text-[11px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 border border-primary/20 px-3 py-1">
          {client.name.toUpperCase()}
        </span>
      )}
      <div className="flex gap-2 items-center">
        {post.platforms.map(p => (
            <div key={p} className="w-6 h-6 border border-white/[0.1] bg-white/[0.05] flex items-center justify-center text-[9px] font-sans font-black rotate-45">
                <span className="-rotate-45">{p[0].toUpperCase()}</span>
            </div>
        ))}
      </div>
      <div className={`px-4 py-1.5 font-sans text-[10px] font-black uppercase tracking-[0.2em] border ${post.status === 'PUBLISHED' ? 'border-green-500/40 text-green-400 bg-green-500/5' : 'border-white/[0.1] text-text-muted/40 bg-white/[0.02]'}`}>
        {post.status}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={headerTitle}
      width={1200}
      footer={
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-6 px-2">
            <div className="flex items-center gap-6">
                <button
                    onClick={() => {
                        if (onNavigate) {
                            onNavigate('vault', post.clientId.toString());
                            onClose();
                        }
                    }}
                    className="group px-6 py-3 text-text-muted/40 hover:text-text-primary flex items-center gap-3 font-sans text-[10px] font-black uppercase tracking-[0.3em] border border-white/[0.06] hover:border-primary transition-all duration-700 hover:bg-primary/5"
                >
                    <BrainCircuit size={16} className="group-hover:text-primary transition-colors" />
                    VAULT_ACCESS
                </button>

                <Button variant="ghost" onClick={onClose} className="font-sans text-[11px] font-black uppercase tracking-[0.3em] text-text-muted/40 hover:text-text-primary transition-colors">
                    TERMINATE_SESSION
                </Button>
            </div>

          {nextStage && (
            <div className="flex items-center gap-6 w-full sm:w-auto">
                <span className="font-sans text-[10px] font-black text-text-muted/20 tracking-[0.3em] hidden sm:block">READY_FOR_STATE_TRANSITION</span>
                <Button onClick={handleAdvanceStage} className="bg-primary hover:bg-accent-mid text-onyx px-12 h-14 rounded-none font-sans text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto">
                    {isCeoGated && <span className="mr-2 opacity-60">CEO_AUTH:</span>}
                    ADVANCE_TO_{nextStage.replace(' ', '_')}
                    <ArrowRight size={16} className="ml-3" />
                </Button>
            </div>
          )}
        </div>
      }
    >
      <div className="flex flex-col md:flex-row -m-6 h-full min-h-[600px] bg-onyx">

        {/* LEFT: Pipeline + Content + Activity */}
        <div className={`flex-1 md:border-r border-white/[0.06] flex-col p-10 md:p-12 space-y-16 overflow-y-auto custom-scrollbar`}>
          {/* Stage Pipeline */}
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <span className="font-sans text-[11px] font-black tracking-[0.4em] text-primary/40">EV</span>
              <h4 className="font-sans text-[11px] font-black tracking-[0.3em] text-text-muted/60 uppercase">EVOLUTION_PIPELINE</h4>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <div className="flex items-center justify-between relative py-6 overflow-x-auto custom-scrollbar no-scrollbar">
              <div className="absolute top-[39px] left-0 right-0 h-px bg-white/[0.06] -z-10" />
              {STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stage} className="flex flex-col items-center gap-4 px-4 shrink-0 transition-opacity duration-700" style={{ opacity: idx <= currentStageIndex + 1 ? 1 : 0.2 }}>
                    <div className={`w-3.5 h-3.5 rounded-none rotate-45 border-2 transition-all duration-700 shadow-lg ${isCurrent ? 'border-primary bg-primary shadow-primary/20' : isCompleted ? 'border-primary/40 bg-primary/20' : 'border-white/[0.1] bg-onyx'}`} />
                    <span className={`font-sans text-[8px] font-black tracking-[0.3em] text-center uppercase leading-none transition-colors duration-700 ${isCurrent ? 'text-primary' : isCompleted ? 'text-text-muted/60' : 'text-text-muted/20'}`}>
                      {stage.replace(' ', '\n')}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>


          {/* Content Preview */}
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <span className="font-sans text-[11px] font-black tracking-[0.4em] text-primary/40">CI</span>
              <h4 className="font-sans text-[11px] font-black tracking-[0.3em] text-text-muted/60 uppercase">CREATIVE_INTELLIGENCE</h4>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <div className="bg-white/[0.01] border border-white/[0.06] p-10 space-y-12 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-1 p-4 bg-primary rotate-45 translate-x-3 -translate-y-3 opacity-20 group-hover:opacity-100 transition-all duration-700" />
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h5 className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">PRIMARY_HOOK_PAYLOAD</h5>
                  {post.triggerUsed && <span className="font-sans text-[9px] font-black text-primary/60 uppercase tracking-[0.2em] bg-primary/5 px-3 py-1 border border-primary/20">{post.triggerUsed.toUpperCase()}_TRIGGER</span>}
                </div>
                <p className="font-heading text-4xl text-text-primary leading-[1.1] tracking-tighter">
                  {post.hook || <span className="text-text-muted/10 italic">INTEL_UNDEFINED</span>}
                </p>
              </div>

              <div className="space-y-6 pt-10 border-t border-white/[0.06]">
                <h5 className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">INTELLIGENCE_BODY_MAPPING</h5>
                <p className="font-sans text-base text-text-muted whitespace-pre-wrap leading-relaxed max-w-[90%] font-black tracking-tight">
                  {post.captionBody || 'Deployment payload not yet synchronized.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/[0.06]">
                  <div className="space-y-3">
                      <h5 className="font-sans text-[9px] font-black text-text-muted/20 uppercase tracking-[0.3em]">ACTION_TRIGGER</h5>
                      <span className="font-sans text-[11px] font-black text-primary uppercase tracking-[0.1em]">{post.cta?.toUpperCase() || 'NONE'}</span>
                  </div>
                  <div className="space-y-3">
                      <h5 className="font-sans text-[9px] font-black text-text-muted/20 uppercase tracking-[0.3em]">VISUAL_PROTOCOL</h5>
                      <span className="font-sans text-[11px] font-black text-text-muted/60 uppercase tracking-[0.1em]">{post.templateType.toUpperCase()}</span>
                  </div>
              </div>
            </div>
          </section>


          {/* Temporal Logs */}
          <section className="space-y-10">
             <div className="flex items-center gap-4">
              <span className="font-sans text-[11px] font-black tracking-[0.4em] text-primary/40">TL</span>
              <h4 className="font-sans text-[11px] font-black tracking-[0.3em] text-text-muted/60 uppercase">TEMPORAL_ACTIVITY_LOGS</h4>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <div className="space-y-8 relative pl-6">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-white/[0.06]" />
                {post.activityLog.slice().reverse().map((log, idx) => (
                    <div key={idx} className="relative group">
                        <div className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-none rotate-45 bg-white/[0.06] group-hover:bg-primary transition-all duration-700" />
                        <div className="space-y-2">
                            <div className="font-sans text-[12px] font-black text-text-muted/60 group-hover:text-text-primary transition-colors duration-700 uppercase tracking-tight">{log.text.toUpperCase()}</div>
                            <div className="font-sans text-[9px] font-black text-text-muted/20 uppercase tracking-[0.2em] flex gap-4">
                                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <span>OPERATOR_{log.author.toUpperCase().replace(' ', '_')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </section>

        </div>

        {/* RIGHT: Meta + Performance */}
        <div className={`w-full md:w-[450px] border-l border-white/[0.06] bg-white/[0.01] p-10 md:p-12 space-y-16 overflow-y-auto custom-scrollbar`}>
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <span className="font-sans text-[11px] font-black tracking-[0.4em] text-primary/40">MT</span>
              <h4 className="font-sans text-[11px] font-black tracking-[0.3em] text-text-muted/60 uppercase">DEPLOY_METADATA</h4>
            </div>

            <div className="space-y-8">
              {[
                { label: 'ENVIRONMENT', value: post.platforms.map(p => p.toUpperCase()).join(' + ') },
                { label: 'INTEL TYPE', value: post.postType.toUpperCase() },
                { label: 'TARGET WINDOW', value: <span className="text-primary font-black uppercase tracking-widest">{post.scheduledDate} · {post.scheduledTime}</span> },
                { label: 'PRIMARY NODE', value: post.assignedTo.toUpperCase() },
                { label: 'THREAT LEVEL', value: <span className={`font-black tracking-[0.2em] ${post.priority === 'urgent' ? 'text-red-400' : post.priority === 'high' ? 'text-orange-400' : 'text-text-muted/40'}`}>{post.priority.toUpperCase()}</span> },
              ].map(({ label, value }) => (
                <div key={label} className="grid grid-cols-5 gap-4 items-start group">
                  <span className="col-span-2 font-sans text-[9px] font-black text-text-muted/20 group-hover:text-text-muted/40 uppercase tracking-[0.3em] transition-colors">{label}</span>
                  <span className="col-span-3 font-sans text-[11px] font-black text-text-primary text-right tracking-[0.05em]">{value}</span>
                </div>
              ))}
            </div>

            <div className="pt-10 border-t border-white/[0.06] space-y-6">
                 <h5 className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">VISUAL_BRIEFING_DECODED</h5>
                 <div className="bg-primary/[0.02] border border-primary/10 p-6 text-[11px] font-sans text-text-muted leading-relaxed uppercase tracking-[0.05em] font-black">
                    {post.visualBrief || 'VISUAL_PROTOCOL_PENDING_GENERATION'}
                 </div>
            </div>
          </section>

          {/* Performance Analytics */}
          <section className="space-y-10 pt-10 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="font-sans text-[11px] font-black tracking-[0.4em] text-primary/40">PR</span>
                    <h4 className="font-sans text-[11px] font-black tracking-[0.3em] text-text-muted/60 uppercase">PERFORMANCE_ANALYTICS</h4>
                </div>
                {post.status === 'PUBLISHED' && !showPerformanceInput && (
                    <button 
                        onClick={() => setShowPerformanceInput(true)}
                        className="font-sans text-[9px] font-black text-primary hover:text-white uppercase tracking-[0.2em] transition-colors"
                    >
                        {post.performance ? '[EDIT_INTEL]' : '[LOG_INTEL]'}
                    </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                  {showPerformanceInput ? (
                      <div className="space-y-8 bg-white/[0.02] border border-primary/20 p-8 relative">
                          <button onClick={() => setShowPerformanceInput(false)} className="absolute top-4 right-4 text-text-muted/20 hover:text-white transition-colors">
                              <X size={16} />
                          </button>
                          <div className="grid grid-cols-2 gap-6">
                              {(['reach', 'impressions', 'saves', 'shares', 'comments', 'likes'] as const).map(field => (
                                <div key={field} className="space-y-3">
                                  <label className="font-sans text-[9px] font-black text-text-muted/40 uppercase tracking-[0.3em]">{field}</label>
                                  <input
                                    type="number"
                                    value={metrics[field] ?? 0}
                                    onChange={e => setMetrics({ ...metrics, [field]: Number(e.target.value) })}
                                    className="w-full bg-white/[0.05] border border-white/[0.06] p-4 text-[11px] font-black font-sans text-text-primary focus:border-primary/40 outline-none transition-all uppercase tracking-[0.1em]"
                                  />
                                </div>
                              ))}
                          </div>
                          <div className="space-y-3">
                              <label className="font-sans text-[9px] font-black text-text-muted/40 uppercase tracking-[0.3em]">CEO_INTEL_RATING</label>
                              <select 
                                value={metrics.ceoRating}
                                onChange={e => setMetrics({...metrics, ceoRating: e.target.value})}
                                className="w-full bg-white/[0.05] border border-white/[0.06] p-4 text-[11px] font-black font-sans text-text-primary focus:border-primary/40 outline-none transition-all uppercase tracking-[0.1em]"
                              >
                                  <option value="🟢 Exceptional">EXCEPTIONAL</option>
                                  <option value="🟡 Performed">PERFORMED</option>
                                  <option value="🔴 Below Radar">BELOW_RADAR</option>
                              </select>
                          </div>
                          <Button onClick={handleSavePerformance} className="w-full bg-primary text-onyx font-sans text-[11px] font-black uppercase tracking-[0.2em] h-12 rounded-none">
                              SYNCHRONIZE_ANALYTICS
                          </Button>
                      </div>
                  ) : post.status !== 'PUBLISHED' ? (
                      <div className="p-10 border border-dashed border-white/[0.06] flex flex-col items-center justify-center opacity-20">
                          <ShieldCheck size={24} className="mb-4" />
                          <span className="font-sans text-[9px] font-black uppercase tracking-[0.4em]">DEPLOYMENT_INCOMPLETE</span>
                      </div>
                  ) : post.performance ? (
                      <div className="space-y-12">
                          <div className="grid grid-cols-2 gap-6">
                              {[
                                  { label: 'REACH', value: post.performance.reach.toLocaleString() },
                                  { label: 'INTEL_SAVES', value: post.performance.saves.toLocaleString(), color: 'text-primary' },
                                  { label: 'IMPRESSIONS', value: post.performance.impressions.toLocaleString() },
                                  { label: 'OPERATOR_LIKES', value: post.performance.likes.toLocaleString() }
                              ].map(({label, value, color}) => (
                                <div key={label} className="bg-white/[0.02] border border-white/[0.06] p-8 space-y-3 group hover:border-primary/20 transition-all duration-700">
                                    <span className="font-sans text-[9px] font-black text-text-muted/20 uppercase tracking-[0.3em] group-hover:text-primary/40 transition-colors">{label}</span>
                                    <div className={`font-heading text-4xl leading-none tracking-tighter ${color || 'text-text-primary'}`}>{value}</div>
                                </div>
                              ))}
                          </div>
                          
                          <div className="space-y-6">
                              <div className="flex justify-between items-center text-[10px] font-black tracking-[0.3em] text-text-muted/40 uppercase">
                                  <span>CONVERSION_DENSITY_MAPPING</span>
                                  <span className="text-primary font-black">{post.performance.saveRate}%</span>
                              </div>
                              <div className="h-[2px] bg-white/[0.04] w-full relative">
                                  <div 
                                    className="h-full bg-primary shadow-[0_0_15px_rgba(63,106,36,0.6)] transition-all duration-1000 ease-out" 
                                    style={{ width: `${Math.min(post.performance.saveRate * 10, 100)}%` }} 
                                  />
                              </div>
                          </div>

                          <div className="bg-primary/[0.02] border border-primary/20 p-6 flex items-center justify-between">
                               <div className="space-y-1">
                                   <span className="font-sans text-[9px] font-black text-primary/40 uppercase tracking-[0.3em]">CEO_VALIDATION_STATUS</span>
                                   <div className="font-sans text-[11px] font-black text-text-primary uppercase tracking-[0.1em]">{post.performance.ceoRating}</div>
                               </div>
                               <ShieldCheck size={20} className="text-primary opacity-40" />
                          </div>
                      </div>
                  ) : (
                      <div className="p-10 border border-dashed border-white/[0.06] flex flex-col items-center justify-center opacity-20 group hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setShowPerformanceInput(true)}>
                          <BarChart size={24} className="mb-4" />
                          <span className="font-sans text-[9px] font-black uppercase tracking-[0.4em]">MISSING_PERFORMANCE_PACKET</span>
                      </div>
                  )}
              </div>
          </section>

        </div>
      </div>
    </Modal>
  );
}
