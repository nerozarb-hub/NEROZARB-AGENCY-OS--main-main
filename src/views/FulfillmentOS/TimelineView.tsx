import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Clock, CheckSquare, Layers, AlertCircle } from 'lucide-react';

export default function TimelineView({ tasks }: { tasks: any[] }) {
  // Timeline Stages
  const stages = [
    { id: 'WAITLIST', label: 'Briefing / Waitlist', color: 'text-text-muted', bg: 'bg-card-alt' },
    { id: 'PRODUCTION', label: 'Alpha Production', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'REVIEW', label: 'Internal Review', color: 'text-primary', bg: 'bg-primary/10' },
    { id: 'CLEAR', label: 'Cleared / Deployed', color: 'text-accent-light', bg: 'bg-accent-light/10' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">

      {/* Timeline Controls / Legend */}
      <div className="flex justify-between items-center px-2">
        <div className="flex gap-8">
          {stages.map(s => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${s.bg.replace('/10', '')}`} />
              <span className="font-mono text-[9px] tracking-widest text-text-muted uppercase">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="font-mono text-[9px] text-primary tracking-[0.3em] uppercase opacity-50">
          [ AUTOMATED SPRINT VELOCITY: ACTIVE ]
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden border-border-dark bg-card/30">
        {/* Dates Header */}
        <div className="flex border-b border-border-dark bg-card-alt/80 backdrop-blur-md min-w-max sticky top-0 z-30">
          <div className="w-80 flex-shrink-0 p-6 border-r border-border-dark font-heading font-black text-[10px] text-text-muted uppercase tracking-[0.3em]">
            Deliverable Matrix
          </div>
          <div className="flex-1 flex">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="w-32 flex-shrink-0 p-6 border-r border-border-dark last:border-r-0 text-center">
                <p className="font-mono text-[10px] text-text-muted tracking-tighter uppercase whitespace-nowrap">OCT {15 + i}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="min-w-max">
            {tasks.map((task, i) => {
              const startOffset = (i * 2) % 10;
              const duration = 3 + (i % 4);

              return (
                <div key={task.id} className="flex border-b border-border-dark/50 group hover:bg-card-alt/20 transition-all duration-300">
                  {/* Task Info Cell */}
                  <div className="w-80 flex-shrink-0 p-6 border-r border-border-dark sticky left-0 bg-onyx/80 backdrop-blur-md z-20 group-hover:bg-card-alt/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-primary'}`} />
                      <div className="space-y-1">
                        <h4 className="font-heading font-black text-xs text-text-primary tracking-tight uppercase group-hover:text-primary transition-colors">{task.title}</h4>
                        <p className="font-mono text-[9px] text-text-muted uppercase tracking-widest">{task.client} // {task.assignee}</p>
                      </div>
                    </div>
                  </div>

                  {/* Activity GridArea */}
                  <div className="flex-1 relative h-20 px-1">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {[...Array(14)].map((_, j) => (
                        <div key={j} className="w-32 flex-shrink-0 border-r border-border-dark/20" />
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute top-1/2 -translate-y-1/2 h-10 rounded-sm p-4 flex items-center gap-3 cursor-pointer group/bar relative overflow-hidden border border-white/5"
                      style={{
                        left: `calc(${startOffset * 128}px + 12px)`,
                        width: `calc(${duration * 128}px - 24px)`,
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      }}
                    >
                      {/* Subtle Fill Animation */}
                      <div
                        className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-500"
                        style={{ width: task.status === 'DEPLOYED' ? '100%' : task.status === 'REVIEW' ? '80%' : '40%' }}
                      />

                      <Layers size={12} className="text-primary opacity-50" />
                      <span className="font-mono text-[9px] font-bold text-text-primary uppercase tracking-[0.2em] relative z-10">
                        {task.status}
                      </span>

                      {/* Status Indicator Dots */}
                      <div className="ml-auto flex gap-1 relative z-10">
                        <div className={`w-1 h-1 rounded-full ${task.status === 'DEPLOYED' ? 'bg-accent-light' : 'bg-border-dark'}`} />
                        <div className={`w-1 h-1 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-primary'}`} />
                      </div>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
