import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Clock, MessageSquare, Paperclip, User, ChevronRight, PenLine, BookOpen, Activity, Info, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Task } from '../../utils/storage';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onNavigate?: (view: string, id?: string) => void;
}

export default function TaskDetailModal({ isOpen, onClose, task: modalTask, onNavigate }: TaskDetailModalProps) {
  const { data, advanceTaskStage } = useAppData();
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'brief' | 'activity'>('brief');

  // Use live task data from context to ensure updates reflect immediately
  const task = modalTask ? data.tasks.find(t => t.id === modalTask.id) || modalTask : null;

  if (!task) return null;

  const PIPELINE_STEPS = task.stagePipeline;
  const currentStepIndex = PIPELINE_STEPS.indexOf(task.currentStage);
  const nextStage = PIPELINE_STEPS[currentStepIndex + 1];

  const authLevel = (sessionStorage.getItem('authLevel') as 'ceo' | 'team') || 'team';
  const clientName = data.clients.find(c => c.id === task.clientId)?.name || 'Unknown Client';

  const handleAdvanceStage = () => {
    if (nextStage && canAdvance) {
      advanceTaskStage(task.id, nextStage, authLevel);
    }
  };

  const canAdvance = authLevel === 'ceo' || (nextStage !== 'CEO APPROVAL' && nextStage !== 'DEPLOYED');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    advanceTaskStage(task.id, task.currentStage, authLevel, newNote);
    setNewNote('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width={1000}
      title={
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <p className="font-sans text-[11px] font-bold tracking-[0.3em] text-primary uppercase">Operational ARC</p>
            <div className="h-px w-8 bg-white/[0.06]" />
            <span className="font-sans text-[11px] font-bold text-text-muted/40 tracking-[0.2em] uppercase">ARC-{task.id}</span>
          </div>
          <div className="flex items-end gap-6">
            <h2 className="font-heading text-5xl text-text-primary uppercase tracking-tighter leading-none">
              {task.name}
            </h2>
            <div className={`mb-1 px-3 py-1 border font-sans text-[10px] font-bold tracking-widest uppercase rounded-none ${task.priority === 'critical' ? 'border-red-500/40 text-red-500 bg-red-500/5' : 'border-white/[0.06] text-text-muted/40'}`}>
              {task.priority.toUpperCase()}
            </div>
          </div>
        </div>
      }

      footer={
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {task.sopReference && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('vault', task.clientId.toString());
                    onClose();
                  }
                }}
                className="px-6"
              >
                <BookOpen className="w-3.5 h-3.5 mr-2" />
                PROTOCOL REF
              </Button>
            )}
            {authLevel === 'ceo' && task.currentStage !== 'DEPLOYED' && (
              <Button variant="ghost" className="text-red-500/60 hover:text-red-500 px-6">
                ABORT MISSION
              </Button>
            )}
          </div>


          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} className="px-8">
              DISMISS
            </Button>
            {nextStage ? (
              <Button
                onClick={handleAdvanceStage}
                disabled={!canAdvance}
                className="bg-primary hover:bg-accent-mid text-text-primary min-w-[240px] px-10"
              >
                DEPLOY PHASE: {nextStage}
              </Button>
            ) : (
              <div className="flex items-center gap-3 px-8 h-10 bg-primary/20 text-primary font-sans text-[11px] font-bold uppercase tracking-[0.2em] border border-white/[0.06]">
                <CheckCircle2 className="w-3.5 h-3.5" /> MISSION COMPLETE
              </div>
            )}
          </div>

        </div>
      }
    >
      <div className="space-y-10 py-2">
        {/* Pipeline Architecture */}
        <section className="space-y-10">
          <h3 className="font-sans text-[11px] font-bold tracking-[0.3em] text-text-muted/40 uppercase border-b border-white/[0.04] pb-5">
            Deployment Architecture
          </h3>
          <div className="relative pt-2 pb-12 px-6">
            <div className="absolute top-[calc(1.5rem-1px)] left-0 right-0 h-[1px] bg-white/[0.06] z-0 mx-10" />
            <div className="relative z-10 flex justify-between gap-4 overflow-x-auto pb-4 scrollbar-none">
              {PIPELINE_STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step} className="flex flex-col items-center gap-6 min-w-[100px] sm:min-w-0">
                    <div className={`w-3.5 h-3.5 rotate-45 border transition-all duration-700 ${isCompleted ? 'bg-primary border-primary shadow-[0_0_20px_rgba(63,106,36,0.3)]' :
                      isCurrent ? 'bg-sidebar border-primary ring-4 ring-primary/10 scale-125 shadow-[0_0_25px_rgba(63,106,36,0.2)]' :
                        'bg-white/[0.04] border-white/[0.06]'
                      }`} />
                    <span className={`font-sans text-[10px] font-bold text-center tracking-widest uppercase transition-all duration-500 ${isCurrent ? 'text-primary' :
                      isCompleted ? 'text-text-muted/60' :
                        'text-text-muted/20'
                      }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* Intelligence Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main Intelligence Cluster (Left 66%) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex border border-white/[0.06] rounded-none p-1 bg-white/[0.02]">
              <button
                onClick={() => setActiveTab('brief')}
                className={`flex-1 py-3 font-sans text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 rounded-none transition-all ${activeTab === 'brief' ? 'bg-primary/20 text-primary' : 'text-text-muted/40'}`}
              >
                <Paperclip className="w-3.5 h-3.5" /> BRIEF
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 py-3 font-sans text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 rounded-none transition-all ${activeTab === 'activity' ? 'bg-primary/20 text-primary' : 'text-text-muted/40'}`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> ACTIVITY
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* Strategic Brief Segment */}
              {(activeTab === 'brief' || window.innerWidth >= 1024) && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <h4 className="font-sans text-[11px] font-bold tracking-[0.3em] text-text-muted/60 uppercase flex items-center gap-3">
                    <Paperclip className="w-3.5 h-3.5 text-primary" />
                    Strategic Mission Brief
                  </h4>
                  <div className="bg-white/[0.02] border border-white/[0.06] p-10 rounded-none whitespace-pre-wrap font-sans text-[13px] text-text-muted/80 leading-relaxed tracking-wide shadow-inner">
                    {task.brief || 'SYSTEM ERROR: NO MISSION CONTEXT LOADED.'}
                  </div>
                </motion.div>
              )}


              {/* Activity Encryption Log */}
              {(activeTab === 'activity' || window.innerWidth >= 1024) && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6 pt-12 border-t border-white/[0.04] lg:border-none lg:pt-0"
                >
                  <h4 className="font-sans text-[11px] font-bold tracking-[0.3em] text-text-muted/60 uppercase flex items-center gap-3">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    Operational Flux Log
                  </h4>


                  <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-4 -mr-4">
                    {[...task.activityLog].reverse().map((log, idx) => (
                      <div key={idx} className="flex gap-6 group">
                        <div className={`w-10 h-10 rotate-45 shrink-0 flex items-center justify-center border transition-all duration-300 ${log.author === 'ceo' ? 'bg-primary/20 border-primary/40' : 'bg-white/[0.04] border-white/[0.06]'
                          }`}>
                          <span className="font-sans text-[10px] font-bold -rotate-45 text-text-primary uppercase tracking-tighter">
                            {log.author === 'ceo' ? 'HAM' : 'NOD'}
                          </span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className={`font-sans text-[11px] font-bold uppercase tracking-widest ${log.author === 'ceo' ? 'text-primary' : 'text-text-muted/40'}`}>
                              {log.author === 'ceo' ? 'DIRECTOR HAMSA' : 'OPERATIONAL NODE'}
                            </span>
                            <span className="font-sans text-[10px] font-bold text-text-muted/20 uppercase tracking-widest">
                              {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                            </span>
                          </div>
                          <div className="font-sans text-[13px] text-text-muted/60 leading-relaxed tracking-wide">
                            {log.type === 'stage_advance' ? (
                              <div className="flex items-center gap-3 py-2 px-4 mt-2 bg-primary/5 border border-white/[0.06] w-fit">
                                <span className="uppercase text-[10px] font-bold text-text-muted/20">{log.from}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-primary opacity-30" />
                                <span className="uppercase text-[10px] font-bold text-primary">{log.to}</span>
                              </div>
                            ) : null}
                            {log.type === 'note' && <span className="block mt-2 text-text-muted/60 border-l-2 border-primary/20 pl-4 py-1">{log.text}</span>}
                            {log.type === 'created' && <span className="text-text-muted/20 font-bold text-[10px] tracking-widest uppercase">Sector Initialized: {log.text}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>


                  {/* Operational Note Input */}
                  <div className="flex gap-4 mt-12 p-1 pl-6 bg-white/[0.02] border border-white/[0.06] focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300 rounded-none">
                    <PenLine className="w-4 h-4 text-text-muted/20 mt-3.5 shrink-0" />
                    <input
                      type="text"
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="ENTER OPERATIONAL UPDATE..."
                      className="flex-1 bg-transparent border-none text-[11px] font-bold text-text-primary py-4 outline-none placeholder:text-text-muted/20 tracking-[0.2em] uppercase"
                      onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                    />
                    <Button variant="ghost" className="px-8 shrink-0 text-primary" onClick={handleAddNote}>
                      POST_UPDATE
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Operational Metadata (Right 33%) */}
          <div className="space-y-12 bg-white/[0.02] p-10 border border-white/[0.06] self-start rounded-none">
            <h4 className="font-sans text-[11px] font-bold tracking-[0.3em] text-text-muted/40 uppercase flex items-center gap-3 border-b border-white/[0.04] pb-6">
              <Info className="w-4 h-4 text-primary" />
              Mission Parameters
            </h4>


            <div className="space-y-10">
              <div className="space-y-3">
                <span className="font-sans text-[11px] font-bold text-text-muted/20 uppercase tracking-[0.2em] flex items-center gap-3">
                  <User className="w-3.5 h-3.5 opacity-30" /> Tactical Node
                </span>
                <p className="font-sans text-[12px] font-bold text-text-primary tracking-widest pl-7 uppercase">{task.assignedNode}</p>
              </div>

              <div className="space-y-3">
                <span className="font-sans text-[11px] font-bold text-text-muted/20 uppercase tracking-[0.2em] flex items-center gap-3">
                  <Calendar className="w-3.5 h-3.5 opacity-30" /> Objective Deadline
                </span>
                <p className="font-sans text-[12px] font-bold text-text-primary tracking-widest pl-7 uppercase">{task.deadline || 'ASYNCHRONOUS'}</p>
              </div>

              <div className="space-y-3">
                <span className="font-sans text-[11px] font-bold text-text-muted/20 uppercase tracking-[0.2em] flex items-center gap-3">
                  <Clock className="w-3.5 h-3.5 opacity-30" /> Quantum Allocation
                </span>
                <p className="font-sans text-[12px] font-bold text-text-primary tracking-widest pl-7 uppercase">{task.estimatedHours ? `${task.estimatedHours} HOUR(S)` : 'STOCHASTIC'}</p>
              </div>

              <div className="space-y-4">
                <span className="font-sans text-[11px] font-bold text-text-muted/20 uppercase tracking-[0.2em] flex items-center gap-3">
                  <Activity className="w-3.5 h-3.5 opacity-30" /> Temporal State
                </span>
                <div className="pl-7 flex items-center gap-3">
                  <div className={`w-2 h-2 rotate-45 animate-pulse ${task.status === 'active' ? 'bg-primary shadow-[0_0_15px_rgba(63,106,36,0.6)]' : 'bg-white/[0.06]'}`} />
                  <span className="font-sans text-[12px] font-bold text-text-primary uppercase tracking-[0.2em]">{task.status}</span>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-white/[0.06]">
              <div className="p-6 bg-white/[0.02] border border-dashed border-white/[0.08] uppercase rounded-none">
                <p className="font-sans text-[10px] font-bold text-text-muted/20 leading-relaxed tracking-[0.2em]">
                  ENCRYPTED STREAM ACTIVE. ENSURE MISSION INTEGRITY AT ALL NODES.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </Modal>
  );
}
