import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/Button';
import { KanbanSquare, List, CalendarDays, Plus, Zap, User } from 'lucide-react';
import KanbanView from './KanbanView';
import ListView from './ListView';
import TimelineView from './TimelineView';
import TaskDetailModal from './TaskDetailModal';
import NewTaskModal from './NewTaskModal';
import SprintGeneratorModal from './SprintGeneratorModal';
import MyTasksView from './MyTasksView';

import { useAppData } from '../../contexts/AppDataContext';
import { Task, Stage, NodeRole } from '../../utils/storage';

type ViewMode = 'kanban' | 'list' | 'timeline' | 'my-tasks';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

export default function FulfillmentOS({ onNavigate }: { onNavigate?: (view: string, id?: string) => void }) {
  const { data, addTask } = useAppData();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isSprintGeneratorOpen, setIsSprintGeneratorOpen] = useState(false);

  // Filters
  const [clientFilter, setClientFilter] = useState<number | 'all'>('all');
  const [nodeFilter, setNodeFilter] = useState<NodeRole | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all');

  // Mapped and Filtered Tasks
  const viewTasks = useMemo(() => {
    return data.tasks
      .filter(t => clientFilter === 'all' || t.clientId === clientFilter)
      .filter(t => nodeFilter === 'all' || t.assignedNode === nodeFilter)
      .filter(t => stageFilter === 'all' || t.currentStage === stageFilter)
      .map(t => {
        const client = data.clients.find(c => c.id === t.clientId);
        return {
          ...t,
          title: t.name,
          client: client ? client.name : 'Unknown Client',
          status: t.currentStage,
          assignee: t.assignedNode,
        };
      });
  }, [data.tasks, data.clients, clientFilter, nodeFilter, stageFilter]);

  const handleAddTask = (newTaskData: any) => {
    // If the modal still sends old shape data, we could map it or ideally update the modal.
    // Assuming NewTaskModal is updated separately, we just close modal for now.
    setIsNewTaskModalOpen(false);
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="p-4 md:p-8 w-full max-w-[1800px] mx-auto space-y-4 md:space-y-8 min-h-full flex flex-col"
    >
      {/* Header & Controls */}
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 flex-shrink-0">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl tracking-tighter text-text-primary">FULFILLMENT OS</h2>
          <p className="font-mono text-[10px] md:text-xs tracking-widest text-text-muted mt-1 uppercase">Global Task Pipeline</p>
        </div>

        {/* Controls Row — scrollable on mobile */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          <div className="flex bg-card  rounded-sm p-1 gap-1 text-sm">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent text-text-muted border-none outline-none cursor-pointer py-1 px-2 hover:text-text-primary transition-colors"
            >
              <option value="all">All Clients</option>
              {data.clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="w-px bg-border-dark my-1" />
            <select
              value={nodeFilter}
              onChange={(e) => setNodeFilter(e.target.value as any)}
              className="bg-transparent text-text-muted border-none outline-none cursor-pointer py-1 px-2 hover:text-text-primary transition-colors"
            >
              <option value="all">All Nodes</option>
              <option value="CEO">CEO</option>
              <option value="Art Director">Art Director</option>
              <option value="Video Editor">Video Editor</option>
              <option value="Operations Builder">Operations Builder</option>
              <option value="Social Media Manager">Social Media Manager</option>
              <option value="Documentation Manager">Documentation Manager</option>
            </select>
            <div className="w-px bg-border-dark my-1" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as any)}
              className="bg-transparent text-text-muted border-none outline-none cursor-pointer py-1 px-2 hover:text-text-primary transition-colors"
            >
              <option value="all">All Stages</option>
              <option value="BRIEFED">BRIEFED</option>
              <option value="IN PRODUCTION">IN PRODUCTION</option>
              <option value="REVIEW">REVIEW</option>
              <option value="CEO APPROVAL">CEO APPROVAL</option>
              <option value="CLIENT APPROVAL">CLIENT APPROVAL</option>
              <option value="DEPLOYED">DEPLOYED</option>
            </select>
          </div>

          {/* View Toggles */}
          <div className="flex bg-card  rounded-sm p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-sm transition-colors ${viewMode === 'kanban' ? 'bg-card-alt text-primary' : 'text-text-muted hover:text-text-primary'}`}
            >
              <KanbanSquare size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-card-alt text-primary' : 'text-text-muted hover:text-text-primary'}`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-sm transition-colors ${viewMode === 'timeline' ? 'bg-card-alt text-primary' : 'text-text-muted hover:text-text-primary'}`}
              title="Timeline View"
            >
              <CalendarDays size={16} />
            </button>
            <button
              onClick={() => setViewMode('my-tasks')}
              className={`p-2 rounded-sm transition-colors ${viewMode === 'my-tasks' ? 'bg-card-alt text-primary' : 'text-text-muted hover:text-text-primary'}`}
              title="My Tasks"
            >
              <User size={16} />
            </button>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setIsSprintGeneratorOpen(true)} className="whitespace-nowrap">
            <Zap size={14} />
            <span className="hidden sm:inline">GENERATE SPRINT</span>
            <span className="sm:hidden">SPRINT</span>
          </Button>
          <Button size="sm" onClick={() => setIsNewTaskModalOpen(true)} className="whitespace-nowrap">
            <Plus size={14} />
            NEW TASK
          </Button>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <motion.div variants={itemVariants} className="flex-1 min-h-0 flex flex-col">
        {viewMode === 'kanban' && <KanbanView tasks={viewTasks} onTaskClick={setSelectedTask} />}
        {viewMode === 'list' && <ListView tasks={viewTasks} onTaskClick={setSelectedTask} />}
        {viewMode === 'timeline' && <TimelineView tasks={viewTasks} />}
        {viewMode === 'my-tasks' && <MyTasksView tasks={data.tasks} onTaskClick={setSelectedTask} />}
      </motion.div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onNavigate={onNavigate}
      />

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
      />

      {/* Sprint Generator Modal */}
      <SprintGeneratorModal
        isOpen={isSprintGeneratorOpen}
        onClose={() => setIsSprintGeneratorOpen(false)}
      />
    </motion.div>
  );
}
