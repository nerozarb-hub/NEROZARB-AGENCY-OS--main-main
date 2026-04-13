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
  const { data } = useAppData();
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

  const handleAddTask = () => {
    setIsNewTaskModalOpen(false);
  };


  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="page-container h-full flex flex-col overflow-hidden py-8"
    >

      {/* Header & Controls */}
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 flex-shrink-0 border-b border-white/[0.04] pb-10">
        <div className="space-y-4">
          <h2 className="font-heading text-6xl tracking-tighter text-text-primary uppercase leading-none">Fulfillment Engine</h2>
          <p className="font-sans text-[11px] font-bold tracking-[0.3em] text-text-muted/40 uppercase">Operational Flux · Velocity Control</p>
        </div>


        {/* Controls Row — scrollable on mobile */}
        <div className="flex flex-wrap items-center gap-4 overflow-x-auto pb-1">
          <div className="flex items-center bg-white/[0.02] border border-white/[0.06] p-1 rounded-none">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent text-[11px] font-bold text-text-muted/60 tracking-[0.2em] outline-none cursor-pointer py-2 px-3 hover:text-text-primary transition-colors uppercase appearance-none"
            >
              <option value="all">ENTITY: GLOBAL</option>
              {data.clients.map(c => (
                <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
              ))}
            </select>
            <div className="w-px h-3 bg-white/[0.06] mx-1" />
            <select
              value={nodeFilter}
              onChange={(e) => setNodeFilter(e.target.value as any)}
              className="bg-transparent text-[11px] font-bold text-text-muted/60 tracking-[0.2em] outline-none cursor-pointer py-2 px-3 hover:text-text-primary transition-colors uppercase appearance-none"
            >
              <option value="all">NODE: ALL</option>
              <option value="CEO">CEO</option>
              <option value="Art Director">ART DIRECTOR</option>
              <option value="Video Editor">VIDEO EDITOR</option>
              <option value="Operations Builder">OPERATIONS BUILDER</option>
              <option value="Social Media Manager">SMM</option>
              <option value="Documentation Manager">DOCS</option>
            </select>
            <div className="w-px h-3 bg-white/[0.06] mx-1" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as any)}
              className="bg-transparent text-[11px] font-bold text-text-muted/60 tracking-[0.2em] outline-none cursor-pointer py-2 px-3 hover:text-text-primary transition-colors uppercase appearance-none"
            >
              <option value="all">STAGE: ALL</option>
              <option value="BRIEFED">BRIEFED</option>
              <option value="IN PRODUCTION">IN PRODUCTION</option>
              <option value="REVIEW">REVIEW</option>
              <option value="CEO APPROVAL">CEO APPROVAL</option>
              <option value="CLIENT APPROVAL">CLIENT APPROVAL</option>
              <option value="DEPLOYED">DEPLOYED</option>
            </select>
          </div>


          {/* View Toggles */}
          <div className="flex bg-white/[0.02] border border-white/[0.06] p-1 rounded-none">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 transition-all rounded-none ${viewMode === 'kanban' ? 'bg-primary/20 text-primary' : 'text-text-muted/40 hover:text-text-primary'}`}
              title="Kanban View"
            >
              <KanbanSquare size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-all rounded-none ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-text-muted/40 hover:text-text-primary'}`}
              title="List View"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 transition-all rounded-none ${viewMode === 'timeline' ? 'bg-primary/20 text-primary' : 'text-text-muted/40 hover:text-text-primary'}`}
              title="Timeline View"
            >
              <CalendarDays size={14} />
            </button>
            <button
              onClick={() => setViewMode('my-tasks')}
              className={`p-2 transition-all rounded-none ${viewMode === 'my-tasks' ? 'bg-primary/20 text-primary' : 'text-text-muted/40 hover:text-text-primary'}`}
              title="My Tasks"
            >
              <User size={14} />
            </button>
          </div>


          <Button
            variant="ghost"
            onClick={() => setIsSprintGeneratorOpen(true)}
            className="px-6"
          >
            <Zap size={14} className="mr-2 opacity-50" />
            <span className="hidden sm:inline">SPRINT GEN</span>
          </Button>
          <Button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="bg-primary hover:bg-accent-mid text-text-primary px-8"
          >
            <Plus size={14} className="mr-2" />
            TASK PROXY
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
