import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { TaskCategory, NodeRole, Stage } from '../../utils/storage';
import { ClipboardList, Users, Target, Clock, AlertCircle } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewTaskModal({ isOpen, onClose }: NewTaskModalProps) {
  const { data, addTask } = useAppData();

  const [name, setName] = useState('');
  const [clientId, setClientId] = useState<number | ''>('');
  const [category, setCategory] = useState<TaskCategory>('Other');
  const [phase, setPhase] = useState<'phase1' | 'phase2' | 'phase3' | 'ongoing'>('ongoing');
  const [priority, setPriority] = useState<'normal' | 'high' | 'critical'>('normal');
  const [assignedNode, setAssignedNode] = useState<NodeRole>('CEO');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [brief, setBrief] = useState('');

  const handleSubmit = () => {
    if (!name || clientId === '') return;

    // Default standard pipeline
    const pipeline: Stage[] = ['BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED'];

    addTask({
      clientId: Number(clientId),
      name,
      category,
      phase,
      stagePipeline: pipeline,
      currentStage: 'BRIEFED',
      assignedNode,
      priority,
      status: 'active',
      deadline: deadline || new Date().toISOString().split('T')[0],
      estimatedHours: estimatedHours ? Number(estimatedHours) : null,
      brief,
      assetLinks: [],
      sopReference: null,
      notes: '',
      deliveredOnTime: null,
      linkedPostId: null
    });

    // Reset form
    setName('');
    setClientId('');
    setCategory('Other');
    setPhase('ongoing');
    setPriority('normal');
    setAssignedNode('CEO');
    setDeadline('');
    setEstimatedHours('');
    setBrief('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div>
          <h2 className="font-heading text-xl text-text-primary uppercase tracking-wider">Initialize New Task</h2>
          <p className="font-mono text-[10px] text-text-muted mt-0.5 tracking-widest uppercase">Fulfillment OS Deployment</p>
        </div>
      }
      footer={
        <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose} className="font-mono text-xs uppercase tracking-widest w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || clientId === ''}
            className="font-mono text-xs uppercase tracking-widest bg-primary hover:bg-accent-mid text-text-primary min-w-[180px] w-full sm:w-auto"
          >
            Create Task
          </Button>
        </div>
      }
    >
      <div className="space-y-8 py-2">
        {/* Section 1: Core Details */}
        <div className="space-y-6">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-2 border-b border-border-dark pb-2">
            <ClipboardList className="w-3 h-3 text-primary" />
            TASK IDENTIFICATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Task Name"
                placeholder="e.g. Q4 Strategy Deck"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="font-heading text-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase text-text-muted tracking-widest pl-1">Client *</label>
              <select
                value={clientId}
                onChange={e => setClientId(Number(e.target.value))}
                className="w-full bg-background rounded-sm px-4 py-3 text-sm font-mono text-text-primary focus:outline-none focus:border-primary transition-colors appearance-none border border-border-dark"
              >
                <option value="" disabled>SELECT CLIENT</option>
                {data.clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase text-text-muted tracking-widest pl-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-background rounded-sm px-4 py-3 text-sm font-mono text-text-primary focus:outline-none focus:border-primary transition-colors appearance-none border border-border-dark"
              >
                {['Content Production', 'Ad Creative', 'Website', 'Strategy', 'Video Production', 'Brand Design', 'Analytics', 'Automation', 'Client Communication', 'Other'].map(c => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Resource Assignment */}
        <div className="space-y-6">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-2 border-b border-border-dark pb-2">
            <Users className="w-3 h-3 text-primary" />
            RESOURCE ALLOCATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase text-text-muted tracking-widest pl-1">Assignee Node</label>
              <select
                value={assignedNode}
                onChange={e => setAssignedNode(e.target.value as NodeRole)}
                className="w-full bg-background rounded-sm px-4 py-3 text-sm font-mono text-text-primary focus:outline-none focus:border-primary transition-colors appearance-none border border-border-dark"
              >
                {['CEO', 'Art Director', 'Video Editor', 'Operations Builder', 'Social Media Manager', 'Documentation Manager'].map(n => (
                  <option key={n} value={n}>{n.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase text-text-muted tracking-widest pl-1">Priority Level</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'NORMAL', color: 'border-border-dark text-text-muted' },
                  { id: 'high', label: 'HIGH', color: 'border-yellow-500/50 text-yellow-500 bg-yellow-500/5' },
                  { id: 'critical', label: 'CRITICAL', color: 'border-red-500/50 text-red-500 bg-red-500/5' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPriority(p.id as any)}
                    className={`py-3 text-[10px] font-mono uppercase tracking-widest border rounded-sm transition-all ${priority === p.id ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' : `${p.color} hover:border-text-muted`
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Timeline & Scale */}
        <div className="space-y-6">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-2 border-b border-border-dark pb-2">
            <Target className="w-3 h-3 text-primary" />
            TIMELINE & PARAMETERS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="sm:col-span-1 lg:col-span-1">
              <Input
                label="Process Phase"
                placeholder="e.g. phase1 (Optional)"
                value={phase}
                onChange={e => setPhase(e.target.value as any)}
                className="font-mono"
              />
            </div>
            <div className="sm:col-span-1 lg:col-span-1">
              <Input
                label="Deadline"
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Input
                label="Est. Quantum (Hours)"
                placeholder="e.g. 4"
                type="number"
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Brief */}
        <div className="space-y-6">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-2 border-b border-border-dark pb-2">
            <Clock className="w-3 h-3 text-primary" />
            MISSION BRIEF
          </h3>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase text-text-muted tracking-widest pl-1 leading-relaxed">Instruction Set & Objectives</label>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              className="w-full bg-background/50 border border-border-dark text-text-primary px-4 py-4 text-sm font-mono focus:outline-none focus:border-primary transition-colors hover:border-text-muted rounded-sm min-h-[120px] resize-none custom-scrollbar"
              placeholder="DEFINE DELIVERABLES AND SUCCESS CRITERIA..."
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
