import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-mono text-[9px] text-text-muted tracking-widest uppercase">TSK-{task.id}</span>
            <span className="text-border-dark font-mono text-[9px]">//</span>
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('client', task.clientId.toString());
                  onClose();
                }
              }}
              className="font-mono text-[9px] text-primary hover:text-accent-light tracking-widest uppercase truncate border-b border-primary/20"
            >
              {clientName}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-xl text-text-primary uppercase tracking-wider truncate">
              {task.name}
            </h2>
            <Badge status={task.priority === 'critical' ? 'critical' : task.priority === 'high' ? 'at-risk' : 'healthy'}>
              {task.priority.toUpperCase()}
            </Badge>
          </div>
        </div>
      }
      footer={
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {task.sopReference && (
              <Button
                variant="outline"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('vault', task.clientId.toString());
                    onClose();
                  }
                }}
                className="font-mono text-[10px] uppercase h-11 px-6 border-primary/30 text-primary hover:bg-primary/10"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                OPEN PROTOCOL
              </Button>
            )}
            {authLevel === 'ceo' && task.currentStage !== 'DEPLOYED' && (
              <Button variant="ghost" className="font-mono text-[10px] uppercase text-red-500 hover:text-red-400 hover:bg-red-500/10 h-11">
                BLOCK MISSION
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} className="text-text-muted hover:text-text-primary text-[10px] uppercase font-mono">
              CLOSE
            </Button>
            {nextStage ? (
              <Button
                onClick={handleAdvanceStage}
                disabled={!canAdvance}
                className="flex-1 sm:flex-initial min-w-[220px] h-11 font-mono text-[10px] uppercase tracking-widest bg-primary hover:bg-accent-mid text-text-primary"
              >
                DEPLOY PHASE: {nextStage} <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="flex items-center gap-2 px-6 h-11 bg-primary/20 text-primary font-mono text-[10px] uppercase tracking-widest border border-primary/30 rounded-sm">
                <CheckCircle2 className="w-4 h-4" /> MISSION_COMPLETE
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-10 py-2">
        {/* Pipeline Architecture */}
        <section className="space-y-6">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-2 border-b border-border-dark pb-2">
            <Activity className="w-3 h-3 text-primary" />
            DEPLOYMENT PIPELINE Architecture
          </h3>
          <div className="relative pt-2 pb-8 px-4">
            <div className="absolute top-[calc(1.5rem-2px)] left-0 right-0 h-[1px] bg-border-dark z-0 mx-8" />
            <div className="relative z-10 flex justify-between gap-2 overflow-x-auto pb-4 scrollbar-none">
              {PIPELINE_STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step} className="flex flex-col items-center gap-3 min-w-[80px] sm:min-w-0">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-500 ${isCompleted ? 'bg-primary border-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' :
                      isCurrent ? 'bg-background border-primary ring-4 ring-primary/20 scale-125 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' :
                        'bg-background border-border-dark grayscale'
                      }`} />
                    <span className={`font-mono text-[8px] sm:text-[9px] text-center tracking-widest uppercase ${isCurrent ? 'text-primary' :
                      isCompleted ? 'text-text-secondary' :
                        'text-text-muted'
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
            <div className="lg:hidden flex border border-border-dark rounded-sm p-1 bg-background/50">
              <button
                onClick={() => setActiveTab('brief')}
                className={`flex-1 py-2 font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 rounded-sm transition-all ${activeTab === 'brief' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-text-muted'}`}
              >
                <Paperclip className="w-3 h-3" /> Brief
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 py-2 font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 rounded-sm transition-all ${activeTab === 'activity' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-text-muted'}`}
              >
                <MessageSquare className="w-3 h-3" /> Activity
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* Strategic Brief Segment */}
              {(activeTab === 'brief' || window.innerWidth >= 1024) && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-2">
                    <Paperclip className="w-3 h-3 text-primary" />
                    STRATEGIC MISSION BRIEF
                  </h4>
                  <div className="bg-[#0c0e12] border border-border-dark p-6 rounded-sm whitespace-pre-wrap font-sans text-sm text-text-secondary leading-relaxed shadow-inner">
                    {task.brief || 'SYSTEM ERROR: BRIEF_NOT_FOUND. Please initialize mission context.'}
                  </div>
                </motion.div>
              )}

              {/* Activity Encryption Log */}
              {(activeTab === 'activity' || window.innerWidth >= 1024) && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4 pt-4 border-t border-border-dark lg:border-none lg:pt-0"
                >
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-2">
                    <MessageSquare className="w-3 h-3 text-primary" />
                    OPERATIONAL ENCRYPTION LOG
                  </h4>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-4 -mr-4">
                    {[...task.activityLog].reverse().map((log, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className={`w-9 h-9 rounded-sm shrink-0 flex items-center justify-center font-mono text-[10px] border border-border-dark ${log.author === 'ceo' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-background text-text-muted'
                          }`}>
                          {log.author === 'ceo' ? 'H' : 'TM'}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className={`text-[11px] font-heading uppercase tracking-wider ${log.author === 'ceo' ? 'text-primary' : 'text-text-primary'}`}>
                              {log.author === 'ceo' ? 'Director Hamsa' : 'Operational Node'}
                            </span>
                            <span className="font-mono text-[8px] text-text-muted uppercase tracking-tighter">
                              {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-xs text-text-muted leading-relaxed font-mono">
                            {log.type === 'stage_advance' ? (
                              <div className="flex items-center gap-2 py-1 px-2 mt-1 bg-primary/5 border border-primary/10 rounded-sm w-fit">
                                <span className="uppercase text-[9px] opacity-60">{log.from}</span>
                                <ChevronRight className="w-3 h-3 text-primary opacity-40" />
                                <span className="uppercase text-[9px] text-primary">{log.to}</span>
                              </div>
                            ) : null}
                            {log.type === 'note' && <span className="block mt-1 text-text-secondary border-l-2 border-primary/20 pl-3 py-0.5">{log.text}</span>}
                            {log.type === 'created' && <span className="opacity-40 italic">Initialization complete: {log.text}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Operational Note Input */}
                  <div className="flex gap-2 mt-6 p-1 pl-3 bg-background border border-border-dark rounded-sm focus-within:border-primary transition-all">
                    <PenLine className="w-3.5 h-3.5 text-text-muted mt-2.5 shrink-0" />
                    <input
                      type="text"
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Input operational update or note..."
                      className="flex-1 bg-transparent border-none text-[11px] text-text-primary py-2.5 outline-none placeholder:text-text-muted/40 font-mono tracking-wide"
                      onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                    />
                    <Button variant="ghost" className="px-5 h-9 shrink-0 font-mono text-[10px] text-primary hover:bg-primary/10" onClick={handleAddNote}>
                      POST_UPDATE
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Operational Metadata (Right 33%) */}
          <div className="space-y-8 bg-card/30 p-6 rounded-sm border border-border-dark self-start">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-2 border-b border-border-dark pb-2">
              <Info className="w-3 h-3 text-primary" />
              MISSION PARAMETERS
            </h4>

            <div className="space-y-6">
              <div className="group space-y-1.5">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3 h-3" /> DEPLOYED_NODE
                </span>
                <p className="font-heading text-sm text-text-primary pl-5">{task.assignedNode.toUpperCase()}</p>
              </div>

              <div className="group space-y-1.5">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> HARD_DEADLINE
                </span>
                <p className="font-heading text-sm text-text-primary pl-5">{task.deadline || 'TBD - ASYNCHRONOUS'}</p>
              </div>

              <div className="group space-y-1.5">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3 h-3" /> QUANTUM_ALLOCATION
                </span>
                <p className="font-mono text-sm text-text-primary pl-5">{task.estimatedHours ? `${task.estimatedHours} HOUR(S)` : 'STOCHASTIC_ESTIMATE'}</p>
              </div>

              <div className="group space-y-1.5">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-3 h-3" /> CURRENT_STATUS
                </span>
                <div className="pl-5 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${task.status === 'active' ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]' : 'bg-text-muted'}`} />
                  <span className="font-heading text-sm text-text-primary uppercase tracking-wider">{task.status}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border-dark">
              <div className="p-4 bg-background border border-dashed border-border-dark rounded-sm">
                <p className="font-mono text-[9px] text-text-muted leading-relaxed uppercase">
                  Operational security active. Ensure all deliverables match client-standard protocols.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Modal>
  );
}
