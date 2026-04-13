import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ChevronRight } from 'lucide-react';

export default function ListView({ tasks, onTaskClick }: { tasks: any[], onTaskClick: (task: any) => void }) {
  return (
    <Card className="flex-1 flex flex-col min-h-0 bg-transparent border-none rounded-none">

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm border-separate border-spacing-0">
          <thead className="bg-white/[0.02] sticky top-0 z-10">
            <tr>
              <th className="p-5 border-b border-white/[0.06] font-sans text-[11px] font-bold text-text-muted/40 tracking-[0.2em] uppercase">Index</th>
              <th className="p-5 border-b border-white/[0.06] font-sans text-[11px] font-bold text-text-muted/60 tracking-[0.2em] uppercase">Tactical Objective</th>
              <th className="p-5 border-b border-white/[0.06] font-sans text-[11px] font-bold text-text-muted/60 tracking-[0.2em] uppercase">Entity</th>
              <th className="p-5 border-b border-white/[0.06] font-sans text-[11px] font-bold text-text-muted/60 tracking-[0.2em] uppercase">State</th>
              <th className="p-5 border-b border-white/[0.06] font-sans text-[11px] font-bold text-text-muted/60 tracking-[0.2em] uppercase">Priority</th>
              <th className="p-5 border-b border-white/[0.06] font-sans text-[11px] font-bold text-text-muted/60 tracking-[0.2em] uppercase">Node</th>
              <th className="p-5 border-b border-white/[0.06] font-sans text-[11px] font-bold text-text-muted/60 tracking-[0.2em] uppercase">Deadline</th>
              <th className="p-5 border-b border-white/[0.06] font-sans text-[11px] font-bold text-text-muted/60 tracking-[0.2em] uppercase text-right opacity-0">Flux</th>
            </tr>
          </thead>

          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border border-white/[0.06] flex items-center justify-center mb-6 bg-white/[0.02]">
                      <ChevronRight className="text-text-muted/20" size={24} />
                    </div>
                    <h3 className="font-heading text-4xl text-text-primary uppercase tracking-tighter mb-4">Ledger Empty</h3>
                    <p className="font-sans text-[11px] font-bold text-text-muted/40 uppercase tracking-[0.3em]">No active operation streams detected in this sector.</p>
                  </div>
                </td>
              </tr>
            ) : (

              tasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-primary/[0.02] border-b border-white/[0.04] transition-all duration-300 group cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <td className="p-5 font-sans text-[11px] font-bold text-text-muted/20 tracking-widest">ARC-{task.id}</td>
                  <td className="p-5 font-sans text-[12px] font-bold text-text-muted uppercase tracking-widest group-hover:text-text-primary transition-colors">{task.title}</td>
                  <td className="p-5 font-sans text-[11px] font-bold text-primary tracking-widest uppercase">{task.client}</td>
                  <td className="p-5"><Badge status="review" className="text-[10px] font-bold tracking-widest">{task.status}</Badge></td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rotate-45 ${task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-primary'
                        }`} />
                      <span className="font-sans text-[11px] font-bold text-text-muted/60 uppercase tracking-widest">{task.priority}</span>
                    </div>
                  </td>
                  <td className="p-5 font-sans text-[11px] font-bold text-text-muted/40 tracking-widest uppercase">{task.assignee}</td>
                  <td className="p-5 font-sans text-[11px] font-bold text-primary tracking-widest uppercase">{task.deadline}</td>
                  <td className="p-5 text-right">
                    <div className="text-primary hover:text-accent-light transition-all p-2 opacity-0 group-hover:opacity-100 flex justify-end">
                      <ChevronRight size={16} />
                    </div>
                  </td>
                </tr>
              )))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
