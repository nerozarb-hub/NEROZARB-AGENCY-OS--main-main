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
  'BRIEFED': 'border-t-text-muted/20',
  'IN PRODUCTION': 'border-t-primary/60',
  'REVIEW': 'border-t-primary/80',
  'CEO APPROVAL': 'border-t-primary',
  'CLIENT APPROVAL': 'border-t-primary',
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
        <div className="w-16 h-16 border border-white/[0.06] flex items-center justify-center mb-6 bg-white/[0.02]">
          <Calendar className="text-text-muted/20" size={24} />
        </div>
        <h3 className="font-heading text-4xl text-text-primary uppercase tracking-tighter mb-4">Void Pipeline</h3>
        <p className="font-sans text-[11px] font-bold text-text-muted/40 uppercase tracking-[0.3em] max-w-sm text-center">
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
            className={`flex flex-col min-h-0 bg-white/[0.01] border border-white/[0.04] p-5 border-t-2
                          flex-shrink-0 w-[85vw] md:w-auto md:flex-1 snap-child transition-all duration-300 rounded-none
                          ${COLUMN_COLORS[col]}
                          ${isOver ? 'border-primary/40 bg-primary/5' : ''}`}
          >

            {/* Column Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-sans text-[11px] font-bold text-text-muted/60 tracking-[0.2em] uppercase truncate pr-2">{col}</h3>
              <div className="bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 font-sans text-[11px] font-bold text-text-muted/40">{colTasks.length}</div>
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
                  <Card className="p-6 hover:border-primary/40 transition-all duration-300 bg-white/[0.02] border border-white/[0.06] rounded-none">
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-sans text-[10px] font-bold text-primary tracking-[0.2em] uppercase">{task.client}</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 shrink-0 ${task.priority === 'critical' ? 'bg-red-500' :
                          task.priority === 'high' ? 'bg-yellow-500' : 'bg-primary'
                          } rotate-45`} />
                        <GripVertical size={12} className="text-text-muted/20 group-hover:text-primary transition-colors" />
                      </div>
                    </div>


                    <h4 className="font-sans text-[12px] font-bold text-text-muted/80 mb-5 uppercase leading-relaxed tracking-wider group-hover:text-text-primary transition-colors">
                      {task.title}
                    </h4>


                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.04]">
                      <div className="flex items-center gap-4 text-text-muted/40">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold font-sans tracking-widest uppercase">
                          <Paperclip size={11} className="opacity-40" />
                          <span>{task.assetLinks?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold font-sans tracking-widest uppercase">
                          <MessageSquare size={11} className="opacity-40" />
                          <span>{task.activityLog?.length || 0}</span>
                        </div>
                      </div>


                      <div className="flex items-center gap-2 text-primary">
                        <Calendar size={11} className="opacity-60" />
                        <span className="font-sans text-[10px] font-bold tracking-widest uppercase">{task.deadline}</span>
                      </div>
                    </div>

                  </Card>
                </motion.div>
              ))}

              {/* Drop zone indicator when empty */}
              {colTasks.length === 0 && (
                <div className={`h-24 border border-dashed flex items-center justify-center transition-all duration-300 border-white/[0.06] rounded-none
                  ${isOver ? 'border-primary/40 bg-primary/5' : 'bg-white/[0.01] opacity-40'}`}>
                  <span className="font-sans text-[11px] font-bold text-text-muted/20 uppercase tracking-[0.3em]">
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
