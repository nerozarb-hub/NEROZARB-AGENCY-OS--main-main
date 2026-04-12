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
        <div className="space-y-1">
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">Operational Proxy</p>
          <h2 className="editorial-title text-3xl text-text-primary italic">Initialize Objective</h2>
        </div>
      }

      footer={
        <div className="flex flex-col sm:flex-row justify-end gap-4 w-full">
          <Button variant="ghost" onClick={onClose} className="font-sans text-[10px] font-black uppercase tracking-widest text-[#555] hover:text-text-primary">
            Abort
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || clientId === ''}
            className="bg-primary hover:bg-accent-mid text-text-primary px-10 h-12 font-sans text-[10px] font-black uppercase tracking-[0.2em]"
          >
            Deploy Objective
          </Button>
        </div>
      }

    >
      <div className="space-y-8 py-2">
        {/* Section 1: Core Details */}
        <div className="space-y-6">
          <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-5 italic">
            Objective Identification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Objective Designation"
                placeholder="e.g. Q4 STRAT"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="font-sans text-xl border-white/5 bg-white/[0.01]"
              />
            </div>


            <div className="space-y-1.5">
              <label className="font-sans text-[9px] font-black text-[#444] uppercase tracking-widest pl-1">Entity Allocation *</label>
              <select
                value={clientId}
                onChange={e => setClientId(Number(e.target.value))}
                className="w-full bg-white/[0.01] border border-white/5 rounded-none px-5 py-4 text-[11px] font-bold font-sans text-text-primary focus:outline-none focus:border-white/20 transition-all appearance-none uppercase tracking-widest"
              >
                <option value="" disabled className="bg-[#0C0F14]">SELECT ENTITY</option>
                {data.clients.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#0C0F14]">{c.name.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-[9px] font-black text-[#444] uppercase tracking-widest pl-1">Vector Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-white/[0.01] border border-white/5 rounded-none px-5 py-4 text-[11px] font-bold font-sans text-text-primary focus:outline-none focus:border-white/20 transition-all appearance-none uppercase tracking-widest"
              >
                {['Content Production', 'Ad Creative', 'Website', 'Strategy', 'Video Production', 'Brand Design', 'Analytics', 'Automation', 'Client Communication', 'Other'].map(c => (
                  <option key={c} value={c} className="bg-[#0C0F14]">{c.toUpperCase()}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Section 2: Resource Assignment */}
        <div className="space-y-6">
          <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-5 italic">
            Resource Stream
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="font-sans text-[9px] font-black text-[#444] uppercase tracking-widest pl-1">Deployment Node</label>
              <select
                value={assignedNode}
                onChange={e => setAssignedNode(e.target.value as NodeRole)}
                className="w-full bg-white/[0.01] border border-white/5 rounded-none px-5 py-4 text-[11px] font-bold font-sans text-text-primary focus:outline-none focus:border-white/20 transition-all appearance-none uppercase tracking-widest"
              >
                {['CEO', 'Art Director', 'Video Editor', 'Operations Builder', 'Social Media Manager', 'Documentation Manager'].map(n => (
                  <option key={n} value={n} className="bg-[#0C0F14]">{n.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-[9px] font-black text-[#444] uppercase tracking-widest pl-1">Threat Level</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'normal', label: 'NORMAL' },
                  { id: 'high', label: 'HIGH' },
                  { id: 'critical', label: 'CRITICAL' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as any)}
                    className={`h-12 text-[10px] font-black font-sans tracking-widest border transition-all duration-300 ${priority === p.id 
                      ? 'bg-primary/20 border-primary/40 text-primary' 
                      : 'bg-white/5 border-white/5 text-[#444] hover:border-white/10'
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
          <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-5 italic">
            Temporal Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="sm:col-span-1 lg:col-span-1">
              <Input
                label="Process Phase"
                placeholder="e.g. ALPHA"
                value={phase}
                onChange={e => setPhase(e.target.value as any)}
                className="font-sans text-[11px] font-bold border-white/5 bg-white/[0.01]"
              />
            </div>
            <div className="sm:col-span-1 lg:col-span-1">
              <Input
                label="Objective Lock"
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="font-sans text-[11px] font-bold border-white/5 bg-white/[0.01]"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Input
                label="Quantum (Hours)"
                placeholder="e.g. 12"
                type="number"
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value)}
                className="font-sans text-[11px] font-bold border-white/5 bg-white/[0.01]"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Brief */}
        <div className="space-y-6">
          <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-5 italic">
            Objective Scope
          </h3>
          <div className="space-y-3">
            <label className="font-sans text-[9px] font-black text-[#444] uppercase tracking-widest pl-1 leading-relaxed">Intelligence Briefing</label>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              className="w-full bg-white/[0.01] border border-white/5 text-text-primary px-5 py-5 text-[12px] font-sans font-medium focus:outline-none focus:border-white/20 transition-all hover:border-white/10 rounded-none min-h-[140px] resize-none custom-scrollbar uppercase tracking-widest leading-relaxed"
              placeholder="ENTER SUCCESS CRITERIA AND OPERATIONAL INTENT..."
            />
          </div>
        </div>

      </div>
    </Modal>
  );
}
