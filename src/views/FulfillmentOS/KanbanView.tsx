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
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 border border-dashed border-border-dark/50 rounded-sm bg-card-alt/20">
        <div className="w-16 h-16 rounded-full bg-card-alt border border-border-dark flex items-center justify-center mb-4">
          <Calendar className="text-text-muted" size={24} />
        </div>
        <h3 className="font-heading font-black text-lg text-text-primary tracking-tight uppercase mb-2">No Active Tasks</h3>
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest max-w-sm text-center">
          Your sprint pipeline is clear. Generate a sprint or initialize tasks to populate this view.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-x-auto gap-3 md:gap-3 min-h-0 pb-2 snap-scroll-x scroll-touch"
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
            className={`flex flex-col min-h-0 bg-card-alt/20 border border-border-dark rounded-sm p-3 border-t-2
                          flex-shrink-0 w-[80vw] md:w-auto md:flex-1 snap-child transition-all duration-200
                          ${COLUMN_COLORS[col]}
                          ${isOver ? 'border-primary/60 bg-primary/5 shadow-[0_0_20px_rgba(63,106,36,0.1)]' : ''}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-[10px] font-medium text-text-muted truncate pr-2 tracking-wider">{col}</h3>
              <Badge variant="outline" className="bg-card-alt shrink-0 text-[10px]">{colTasks.length}</Badge>
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
                  className={`cursor-grab active:cursor-grabbing group transition-all duration-200
                    ${draggingId === task.id ? 'opacity-40 scale-95' : 'opacity-100'}`}
                >
                  <Card className="p-3 hover:border-primary/40 transition-all duration-200 bg-[#141820]" accentTop={task.priority === 'high' || task.priority === 'critical'}>
                    {/* Drag handle */}
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-card-alt truncate max-w-[100px] text-[10px]">{task.client}</Badge>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'critical' ? 'bg-red-500' :
                          task.priority === 'high' ? 'bg-orange-500' : 'bg-primary'
                          }`} />
                        <GripVertical size={12} className="text-text-muted/40 group-hover:text-text-muted transition-colors" />
                      </div>
                    </div>

                    <h4 className="text-sm text-text-primary font-medium mb-3 group-hover:text-primary transition-colors leading-tight">
                      {task.title}
                    </h4>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-dark/50">
                      <div className="flex items-center gap-2 text-text-muted">
                        <div className="flex items-center gap-1 text-[10px]">
                          <Paperclip size={10} />
                          <span className="font-mono">{task.assetLinks?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px]">
                          <MessageSquare size={10} />
                          <span className="font-mono">{task.activityLog?.length || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar size={10} className="text-text-muted" />
                        <span className="font-mono text-[9px] text-text-secondary uppercase">{task.deadline}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {/* Drop zone indicator when empty */}
              {colTasks.length === 0 && (
                <div className={`h-20 border border-dashed rounded-sm flex items-center justify-center transition-all duration-200
                  ${isOver ? 'border-primary/60 bg-primary/5' : 'border-border-dark/50'}`}>
                  <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">
                    {isOver ? 'Drop here' : 'Empty'}
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
