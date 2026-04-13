import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Clock, CheckSquare, Layers, AlertCircle } from 'lucide-react';

export default function TimelineView({ tasks }: { tasks: any[] }) {
  // Timeline Stages
  const stages = [
    { id: 'WAITLIST', label: 'Briefing / Logic', color: '#3F6A24', bg: 'bg-primary/10' },
    { id: 'PRODUCTION', label: 'Alpha Stream', color: '#5A8A3A', bg: 'bg-accent-mid/10' },
    { id: 'REVIEW', label: 'Internal Audit', color: '#A8C69F', bg: 'bg-accent-light/10' },
    { id: 'CLEAR', label: 'Deployed / Flux', color: '#3F6A24', bg: 'bg-primary/20' },
  ];


  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">

      {/* Timeline Controls / Legend */}
      <div className="flex justify-between items-center px-4">
        <div className="flex gap-12">
          {stages.map(s => (
            <div key={s.id} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: s.color }} />
              <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-text-muted/60 uppercase">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="font-sans text-[11px] font-bold text-primary tracking-[0.4em] uppercase opacity-40">
          [ NEURAL VELOCITY OVERRIDE: ACTIVE ]
        </div>
      </div>


      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden border-white/[0.06] bg-white/[0.01] rounded-none">
        {/* Dates Header */}
        <div className="flex border-b border-white/[0.06] bg-sidebar/90 backdrop-blur-xl min-w-max sticky top-0 z-30">
          <div className="w-80 flex-shrink-0 p-6 border-r border-white/[0.06] font-sans text-[11px] font-bold text-text-muted/40 tracking-[0.3em] uppercase">
            Objective Matrix
          </div>
          <div className="flex-1 flex">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="w-32 flex-shrink-0 p-6 border-r border-white/[0.06] last:border-r-0 text-center">
                <p className="font-sans text-[11px] font-bold text-text-muted/60 tracking-widest uppercase whitespace-nowrap">OCT {15 + i}</p>
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
                <div key={task.id} className="flex border-b border-white/[0.04] group hover:bg-white/[0.01] transition-all duration-300">
                  {/* Task Info Cell */}
                  <div className="w-80 flex-shrink-0 p-6 border-r border-white/[0.06] sticky left-0 bg-sidebar/90 backdrop-blur-xl z-20 group-hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1.5 w-1.5 h-1.5 rotate-45 shrink-0 ${task.priority === 'high' ? 'bg-red-500' : 'bg-primary'}`} />
                      <div className="space-y-1">
                        <h4 className="font-sans text-[12px] font-bold text-text-muted/80 uppercase tracking-widest group-hover:text-text-primary transition-colors">{task.title}</h4>
                        <p className="font-sans text-[10px] font-bold text-text-muted/20 uppercase tracking-[0.2em]">{task.client} · {task.assignee}</p>
                      </div>
                    </div>
                  </div>


                  {/* Activity GridArea */}
                  <div className="flex-1 relative h-20 px-1">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {[...Array(14)].map((_, j) => (
                        <div key={j} className="w-32 flex-shrink-0 border-r border-white/[0.02]" />
                      ))}
                    </div>


                    {/* Progress Bar */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute top-1/2 -translate-y-1/2 h-10 p-4 flex items-center gap-3 cursor-pointer group/bar relative overflow-hidden border border-white/[0.06] bg-white/[0.02] rounded-none"
                      style={{
                        left: `calc(${startOffset * 128}px + 12px)`,
                        width: `calc(${duration * 128}px - 24px)`,
                      }}
                    >
                      {/* Subtle Fill Animation */}
                      <div
                        className="absolute inset-y-0 left-0 bg-primary/20 transition-all duration-500"
                        style={{ width: task.status === 'DEPLOYED' ? '100%' : task.status === 'REVIEW' ? '75%' : '40%' }}
                      />

                      <Layers size={11} className="text-primary opacity-50 relative z-10" />
                      <span className="font-sans text-[11px] font-bold text-text-muted/60 uppercase tracking-widest relative z-10 group-hover/bar:text-text-primary transition-colors">
                        {task.status}
                      </span>

                      {/* Status Indicator Markers */}
                      <div className="ml-auto flex gap-2 relative z-10">
                        <div className={`w-1.5 h-1.5 rotate-45 ${task.status === 'DEPLOYED' ? 'bg-primary' : 'bg-white/[0.06]'}`} />
                        <div className={`w-1.5 h-1.5 rotate-45 ${task.priority === 'high' ? 'bg-red-500' : 'bg-primary/40'}`} />
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
