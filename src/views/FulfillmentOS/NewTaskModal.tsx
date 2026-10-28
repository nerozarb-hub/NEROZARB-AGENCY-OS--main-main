import { useMemo, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { TaskCategory, NodeRole, Stage } from '../../utils/storage';
import { resolvePromptContent } from '../../features/prompt-os/promptVault';
import { BookOpen, Wand2 } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TASK_CATEGORIES: TaskCategory[] = [
  'Content Production',
  'Ad Creative',
  'Website',
  'Strategy',
  'Video Production',
  'Brand Design',
  'Analytics',
  'Automation',
  'Client Communication',
  'Other',
];

const NODE_ROLES: NodeRole[] = [
  'CEO',
  'Art Director',
  'Video Editor',
  'Operations Builder',
  'Social Media Manager',
  'Documentation Manager',
];

export default function NewTaskModal({ isOpen, onClose }: NewTaskModalProps) {
  const { data, addTask, showToast } = useAppData();

  const [name, setName] = useState('');
  const [clientId, setClientId] = useState<number | ''>('');
  const [category, setCategory] = useState<TaskCategory>('Content Production');
  const [phase, setPhase] = useState<'phase1' | 'phase2' | 'phase3' | 'ongoing'>('ongoing');
  const [priority, setPriority] = useState<'normal' | 'high' | 'critical'>('normal');
  const [assignedNode, setAssignedNode] = useState<NodeRole>('Art Director');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [linkedPromptId, setLinkedPromptId] = useState<string>('');
  const [brief, setBrief] = useState('');

  const selectedClient = useMemo(
    () => (clientId !== '' ? data.clients.find(c => c.id === Number(clientId)) || null : null),
    [clientId, data.clients]
  );

  const availablePrompts = useMemo(
    () =>
      data.promptTemplates.filter(
        p => p.status !== 'archived' && (!p.clientId || (clientId !== '' && p.clientId === Number(clientId)))
      ),
    [data.promptTemplates, clientId]
  );

  const selectedPrompt = useMemo(
    () => data.promptTemplates.find(p => p.id === linkedPromptId) || null,
    [data.promptTemplates, linkedPromptId]
  );

  const handleInsertPromptIntoBrief = () => {
    if (!selectedPrompt) return;
    const resolved = resolvePromptContent(selectedPrompt.content, {
      client: selectedClient,
      includeClientContext: Boolean(selectedClient),
    });
    setBrief(prev => (prev.trim() ? `${prev.trim()}\n\n---\n\n${resolved}` : resolved));
    if (!name.trim()) {
      setName(
        selectedClient ? `${selectedPrompt.title} — ${selectedClient.name}` : selectedPrompt.title
      );
    }
    showToast('Prompt inserted into task brief');
  };

  const handleSubmit = () => {
    if (!name.trim() || clientId === '') return;

    const pipeline: Stage[] = [
      'BRIEFED',
      'IN PRODUCTION',
      'REVIEW',
      'CEO APPROVAL',
      'CLIENT APPROVAL',
      'DEPLOYED',
    ];

    addTask({
      clientId: Number(clientId),
      name: name.trim(),
      category,
      phase,
      stagePipeline: pipeline,
      currentStage: 'BRIEFED',
      assignedNode,
      assigneeId: assigneeId || null,
      priority,
      status: 'active',
      deadline: deadline || new Date().toISOString().split('T')[0],
      estimatedHours: estimatedHours ? Number(estimatedHours) : null,
      brief: brief.trim(),
      assetLinks: [],
      sopReference: null,
      notes: '',
      deliveredOnTime: null,
      linkedPostId: null,
      linkedPromptId: linkedPromptId || null,
      compiledPromptId: linkedPromptId || null,
    });

    setName('');
    setClientId('');
    setCategory('Content Production');
    setPhase('ongoing');
    setPriority('normal');
    setAssignedNode('Art Director');
    setAssigneeId('');
    setDeadline('');
    setEstimatedHours('');
    setLinkedPromptId('');
    setBrief('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div>
          <h2 className="text-xl font-semibold text-text-primary">New Task</h2>
          <p className="text-xs text-text-muted mt-1">
            Assign a deliverable, attach a saved prompt from the Prompt Vault, and set a deadline.
          </p>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || clientId === ''}>
            Create Task
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Input
          label="Task Title"
          placeholder="e.g. Write 60-Day Content Strategy or Edit Product Launch Reel"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="new-task-client" className="mb-2 block text-sm font-medium text-text-secondary">
              Client *
            </label>
            <select
              id="new-task-client"
              value={clientId}
              onChange={e => setClientId(e.target.value ? Number(e.target.value) : '')}
              className="min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="">Select client</option>
              {data.clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="new-task-category" className="mb-2 block text-sm font-medium text-text-secondary">
              Category
            </label>
            <select
              id="new-task-category"
              value={category}
              onChange={e => setCategory(e.target.value as TaskCategory)}
              className="min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              {TASK_CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prompt OS Linker */}
        <div className="rounded-lg border border-border-dark bg-onyx/70 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="new-task-prompt"
              className="text-xs font-semibold text-text-secondary flex items-center gap-1.5"
            >
              <BookOpen size={14} className="text-primary" />
              <span>Attach Prompt from Prompt OS (Optional)</span>
            </label>
            {selectedPrompt && (
              <button
                type="button"
                onClick={handleInsertPromptIntoBrief}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 border border-primary/30 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/25 transition-colors"
              >
                <Wand2 size={13} />
                <span>Insert into Brief</span>
              </button>
            )}
          </div>

          <select
            id="new-task-prompt"
            value={linkedPromptId}
            onChange={e => setLinkedPromptId(e.target.value)}
            className="min-h-10 w-full rounded-lg border border-border-dark bg-card px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="">No prompt attached</option>
            {availablePrompts.map(prompt => (
              <option key={prompt.id} value={prompt.id}>
                [{prompt.category}] {prompt.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="new-task-role" className="mb-2 block text-sm font-medium text-text-secondary">
              Role
            </label>
            <select
              id="new-task-role"
              value={assignedNode}
              onChange={e => setAssignedNode(e.target.value as NodeRole)}
              className="min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              {NODE_ROLES.map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="new-task-assignee" className="mb-2 block text-sm font-medium text-text-secondary">
              Team Member
            </label>
            <select
              id="new-task-assignee"
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="">Unassigned</option>
              {data.teamMembers
                .filter(m => m.active)
                .map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary">Priority</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['normal', 'high', 'critical'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`min-h-11 rounded-lg border text-xs font-medium capitalize transition-colors ${
                    priority === p
                      ? 'border-primary bg-primary text-onyx font-semibold'
                      : 'border-border-dark bg-onyx text-text-secondary hover:bg-white/[0.04]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Deadline"
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
          <Input
            label="Estimated Hours"
            type="number"
            placeholder="e.g. 4"
            value={estimatedHours}
            onChange={e => setEstimatedHours(e.target.value)}
          />
        </div>

        <Textarea
          label="Task Brief & Instructions"
          value={brief}
          onChange={e => setBrief(e.target.value)}
          rows={5}
          placeholder="Describe what needs to be created, key requirements, or insert a prompt from Prompt OS above..."
        />
      </div>
    </Modal>
  );
}
