import { useState, useMemo, DragEvent } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Calendar, MessageSquare, Paperclip, GripVertical } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { Stage } from '../../utils/storage';

const COLUMNS: Stage[] = [
  'BRIEFED',
  'IN PRODUCTION',
  'REVIEW',
  'CEO APPROVAL',
  'CLIENT APPROVAL',
  'DEPLOYED'
];

const COLUMN_COLORS: Record<Stage, string> = {
  'BRIEFED': 'border-t-zinc-500',
  'IN PRODUCTION': 'border-t-blue-500',
  'REVIEW': 'border-t-purple-500',
  'CEO APPROVAL': 'border-t-orange-500',
  'CLIENT APPROVAL': 'border-t-amber-500',
  'DEPLOYED': 'border-t-primary',
};

export default function KanbanView({ tasks, onTaskClick }: { tasks: any[], onTaskClick: (task: any) => void }) {
  const { advanceTaskStage } = useAppData();
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: number) => {
    e.dataTransfer.setData('text/plain', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, col: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(col);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetStage: Stage) => {
    e.preventDefault();
    setDragOverCol(null);
    setDraggingId(null);

    const taskId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(taskId)) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === targetStage) return;

    advanceTaskStage(taskId, targetStage, 'ceo');
  };

  // Pre-compute column → tasks mapping (avoids re-filtering on every drag state change)
  const columnTasks = useMemo(() => {
    const map = new Map<Stage, typeof tasks>();
    COLUMNS.forEach(col => map.set(col, tasks.filter(t => t.status === col)));
    return map;
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-white/[0.04] bg-white/[0.01]">
        <div className="w-16 h-16 border border-white/10 flex items-center justify-center mb-6 bg-white/[0.02] rotate-45">
          <Calendar className="text-[#333] -rotate-45" size={24} />
        </div>
        <h3 className="editorial-title text-3xl text-text-primary italic mb-3">Void Pipeline</h3>
        <p className="font-sans text-[9px] font-black text-[#444] uppercase tracking-[0.4em] max-w-sm text-center">
          SPRINT CACHE EMPTY. INITIALIZE NEW OPERATIONS TO POPULATE THE LEDGER.
        </p>
      </div>
    );
  }


  return (
    <div className="flex-1 flex overflow-x-auto gap-5 min-h-0 pb-4 snap-scroll-x scroll-touch"
      style={{ WebkitOverflowScrolling: 'touch' }}>
      {COLUMNS.map((col) => {
        const colTasks = columnTasks.get(col) || [];
        const isOver = dragOverCol === col;

        return (
          <div
            key={col}
            onDragOver={(e) => handleDragOver(e, col)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col)}
            className={`flex flex-col min-h-0 bg-white/[0.01] border border-white/5 p-4 border-t-2
                          flex-shrink-0 w-[80vw] md:w-auto md:flex-1 snap-child transition-all duration-300
                          ${COLUMN_COLORS[col]}
                          ${isOver ? 'border-primary/40 bg-primary/5' : ''}`}
          >

            {/* Column Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-sans text-[9px] font-black text-[#555] tracking-[0.3em] uppercase italic truncate pr-2">{col}</h3>
              <div className="bg-white/5 border border-white/10 px-2 py-0.5 font-sans text-[9px] font-bold text-[#888]">{colTasks.length}</div>
            </div>


            {/* Column Body */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {colTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layoutId={`task-${task.id}`}
                  draggable
                  onDragStart={(e: any) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onTaskClick(task)}
                  className={`cursor-grab active:cursor-grabbing group transition-all duration-300
                    ${draggingId === task.id ? 'opacity-40 scale-95' : 'opacity-100'}`}
                >
                  <Card className="p-5 hover:border-white/20 transition-all duration-300 bg-white/[0.02] border border-white/5 rounded-none">
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-sans text-[8px] font-bold text-primary/60 tracking-[0.3em] uppercase">{task.client}</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 shrink-0 ${task.priority === 'critical' ? 'bg-red-500' :
                          task.priority === 'high' ? 'bg-yellow-500' : 'bg-primary'
                          } rotate-45`} />
                        <GripVertical size={11} className="text-[#333] group-hover:text-[#666] transition-colors" />
                      </div>
                    </div>


                    <h4 className="font-sans text-[11px] font-bold text-text-muted mb-4 uppercase leading-relaxed tracking-wider group-hover:text-text-primary transition-colors">
                      {task.title}
                    </h4>


                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.04]">
                      <div className="flex items-center gap-3 text-[#444]">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold font-sans tracking-widest uppercase">
                          <Paperclip size={10} className="opacity-40" />
                          <span>{task.assetLinks?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold font-sans tracking-widest uppercase">
                          <MessageSquare size={10} className="opacity-40" />
                          <span>{task.activityLog?.length || 0}</span>
                        </div>
                      </div>


                      <div className="flex items-center gap-1.5">
                        <Calendar size={10} className="text-primary/40" />
                        <span className="font-sans text-[9px] font-black text-primary tracking-widest uppercase">{task.deadline}</span>
                      </div>
                    </div>

                  </Card>
                </motion.div>
              ))}

              {/* Drop zone indicator when empty */}
              {colTasks.length === 0 && (
                <div className={`h-24 border border-dashed flex items-center justify-center transition-all duration-300
                  ${isOver ? 'border-primary/40 bg-primary/5' : 'border-white/5 opacity-40'}`}>
                  <span className="font-sans text-[9px] font-black text-[#333] uppercase tracking-[0.4em]">
                    {isOver ? 'RELEASE TO COMMIT' : 'EMPTY CACHE'}
                  </span>
                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
}
