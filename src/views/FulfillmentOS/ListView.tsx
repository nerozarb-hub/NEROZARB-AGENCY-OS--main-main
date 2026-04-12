import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ChevronRight } from 'lucide-react';

export default function ListView({ tasks, onTaskClick }: { tasks: any[], onTaskClick: (task: any) => void }) {
  return (
    <Card className="flex-1 flex flex-col min-h-0 bg-transparent border-none rounded-none">

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.02] border-b border-white/[0.04] sticky top-0 z-10">
            <tr>
              <th className="p-5 font-sans text-[9px] font-black text-[#555] tracking-[0.3em] uppercase italic">Index</th>
              <th className="p-5 font-sans text-[9px] font-black text-[#666] tracking-[0.3em] uppercase">Tactical Objective</th>
              <th className="p-5 font-sans text-[9px] font-black text-[#666] tracking-[0.3em] uppercase">Entity</th>
              <th className="p-5 font-sans text-[9px] font-black text-[#666] tracking-[0.3em] uppercase">State</th>
              <th className="p-5 font-sans text-[9px] font-black text-[#666] tracking-[0.3em] uppercase">Priority</th>
              <th className="p-5 font-sans text-[9px] font-black text-[#666] tracking-[0.3em] uppercase">Node</th>
              <th className="p-5 font-sans text-[9px] font-black text-[#666] tracking-[0.3em] uppercase">Deadline</th>
              <th className="p-5 font-sans text-[9px] font-black text-[#666] tracking-[0.3em] uppercase text-right">Flux</th>
            </tr>
          </thead>

            {tasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border border-white/10 flex items-center justify-center mb-6 bg-white/[0.02] rotate-45 opacity-50">
                      <ChevronRight className="text-text-primary -rotate-45" size={24} />
                    </div>
                    <h3 className="editorial-title text-3xl text-text-primary italic mb-3">Ledger Empty</h3>
                    <p className="font-sans text-[9px] font-black text-[#444] uppercase tracking-[0.4em]">No active operation streams detected in this sector.</p>
                  </div>
                </td>
              </tr>
            ) : (

              tasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-white/[0.02] border-b border-white/[0.04] transition-all duration-300 group cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <td className="p-5 font-sans text-[9px] font-black text-[#333] tracking-widest">ARC-{task.id}</td>
                  <td className="p-5 font-sans text-[11px] font-bold text-text-muted uppercase tracking-widest group-hover:text-text-primary transition-colors">{task.title}</td>
                  <td className="p-5 font-sans text-[9px] font-black text-[#666] tracking-[0.2em] uppercase">{task.client}</td>
                  <td className="p-5"><Badge className="rounded-none border-white/5 font-sans text-[9px] font-bold tracking-widest px-3 py-1 uppercase">{task.status}</Badge></td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rotate-45 ${task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-primary'
                        }`} />
                      <span className="font-sans text-[11px] font-bold text-[#666] uppercase tracking-widest">{task.priority}</span>
                    </div>
                  </td>
                  <td className="p-5 font-sans text-[9px] font-black text-primary/60 tracking-[0.2em] uppercase">{task.assignee}</td>
                  <td className="p-5 font-sans text-[9px] font-black text-[#333] tracking-[0.2em] uppercase">{task.deadline}</td>
                  <td className="p-5 text-right">
                    <button className="text-primary/40 hover:text-primary transition-all p-2 opacity-0 group-hover:opacity-100">
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              )))}

          </tbody>
        </table>
      </div>
    </Card>
  );
}
