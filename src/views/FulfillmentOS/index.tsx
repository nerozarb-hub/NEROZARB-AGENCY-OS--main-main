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
      className="p-8 w-full max-w-[1800px] mx-auto space-y-12 min-h-full flex flex-col"
    >

      {/* Header & Controls */}
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 flex-shrink-0 border-b border-white/[0.04] pb-10">
        <div className="space-y-3">
          <h2 className="editorial-title text-5xl md:text-6xl tracking-tight text-text-primary italic">Fulfillment Engine</h2>
          <p className="font-sans text-[9px] font-black tracking-[0.4em] text-[#333] uppercase">Operational Flux · Velocity Control</p>
        </div>


        {/* Controls Row — scrollable on mobile */}
        <div className="flex flex-wrap items-center gap-4 overflow-x-auto pb-1">
          <div className="flex items-center bg-white/[0.02] border border-white/5 p-1 gap-1">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent text-[9px] font-black text-[#555] tracking-[0.2em] outline-none cursor-pointer py-2 px-3 hover:text-text-primary transition-colors uppercase appearance-none"
            >
              <option value="all">ENTITY: GLOBAL</option>
              {data.clients.map(c => (
                <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
              ))}
            </select>
            <div className="w-px h-3 bg-white/10 mx-1" />
            <select
              value={nodeFilter}
              onChange={(e) => setNodeFilter(e.target.value as any)}
              className="bg-transparent text-[9px] font-black text-[#555] tracking-[0.2em] outline-none cursor-pointer py-2 px-3 hover:text-text-primary transition-colors uppercase appearance-none"
            >
              <option value="all">NODE: ALL</option>
              <option value="CEO">CEO</option>
              <option value="Art Director">ART DIRECTOR</option>
              <option value="Video Editor">VIDEO EDITOR</option>
              <option value="Operations Builder">OPERATIONS BUILDER</option>
              <option value="Social Media Manager">SMM</option>
              <option value="Documentation Manager">DOCS</option>
            </select>
            <div className="w-px h-3 bg-white/10 mx-1" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as any)}
              className="bg-transparent text-[9px] font-black text-[#555] tracking-[0.2em] outline-none cursor-pointer py-2 px-3 hover:text-text-primary transition-colors uppercase appearance-none"
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
          <div className="flex bg-white/[0.02] border border-white/5 p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 transition-all ${viewMode === 'kanban' ? 'bg-primary/20 text-primary border border-primary/20' : 'text-[#444] hover:text-text-primary'}`}
              title="Kanban View"
            >
              <KanbanSquare size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-all ${viewMode === 'list' ? 'bg-primary/20 text-primary border border-primary/20' : 'text-[#444] hover:text-text-primary'}`}
              title="List View"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 transition-all ${viewMode === 'timeline' ? 'bg-primary/20 text-primary border border-primary/20' : 'text-[#444] hover:text-text-primary'}`}
              title="Timeline View"
            >
              <CalendarDays size={14} />
            </button>
            <button
              onClick={() => setViewMode('my-tasks')}
              className={`p-2 transition-all ${viewMode === 'my-tasks' ? 'bg-primary/20 text-primary border border-primary/20' : 'text-[#444] hover:text-text-primary'}`}
              title="My Tasks"
            >
              <User size={14} />
            </button>
          </div>


          <Button
            variant="ghost"
            onClick={() => setIsSprintGeneratorOpen(true)}
            className="font-sans text-[9px] font-black tracking-[0.2em] h-10 px-6 text-[#666] hover:text-text-primary"
          >
            <Zap size={14} className="mr-2 opacity-50" />
            <span className="hidden sm:inline">SPRINT GEN</span>
          </Button>
          <Button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="bg-primary hover:bg-accent-mid text-text-primary font-sans text-[9px] font-black tracking-[0.2em] h-10 px-8"
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
