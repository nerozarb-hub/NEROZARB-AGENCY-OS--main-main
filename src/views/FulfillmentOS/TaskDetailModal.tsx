import { useMemo, useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  Clock,
  ExternalLink,
  MessageSquare,
  Paperclip,
  User,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Task } from '../../utils/storage';
import { resolvePromptContent } from '../../features/prompt-os/promptVault';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onNavigate?: (view: string, id?: string) => void;
}

export default function TaskDetailModal({
  isOpen,
  onClose,
  task: modalTask,
  onNavigate,
}: TaskDetailModalProps) {
  const { data, advanceTaskStage, updateTask, showToast } = useAppData();
  const [newNote, setNewNote] = useState('');

  const task = modalTask ? data.tasks.find(t => t.id === modalTask.id) || modalTask : null;

  const client = useMemo(
    () => (task ? data.clients.find(c => c.id === task.clientId) || null : null),
    [data.clients, task]
  );

  const linkedPromptId = task?.linkedPromptId || task?.compiledPromptId || '';
  const linkedPrompt = useMemo(
    () => data.promptTemplates.find(p => p.id === linkedPromptId) || null,
    [data.promptTemplates, linkedPromptId]
  );

  const resolvedPrompt = useMemo(() => {
    if (!linkedPrompt) return '';
    return resolvePromptContent(linkedPrompt.content, {
      client,
      includeClientContext: Boolean(client),
    });
  }, [linkedPrompt, client]);

  if (!task) return null;

  const PIPELINE_STEPS = task.stagePipeline;
  const currentStepIndex = PIPELINE_STEPS.indexOf(task.currentStage);
  const nextStage = PIPELINE_STEPS[currentStepIndex + 1];

  const authLevel = (sessionStorage.getItem('authLevel') as 'ceo' | 'team') || 'team';
  const canAdvance =
    authLevel === 'ceo' || (nextStage !== 'CEO APPROVAL' && nextStage !== 'DEPLOYED');

  const handleAdvanceStage = () => {
    if (nextStage && canAdvance) {
      advanceTaskStage(task.id, nextStage, authLevel);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    advanceTaskStage(task.id, task.currentStage, authLevel, newNote.trim());
    setNewNote('');
  };

  const handleAttachPrompt = (promptId: string) => {
    updateTask(task.id, {
      linkedPromptId: promptId || null,
      compiledPromptId: promptId || null,
    });
    showToast(promptId ? 'Prompt linked to task' : 'Prompt unlinked');
  };

  const handleCopyPrompt = async () => {
    if (!resolvedPrompt) return;
    try {
      await navigator.clipboard.writeText(resolvedPrompt);
    } catch {
      // ignore
    }
    showToast('Resolved prompt copied to clipboard');
  };

  const handleOpenInPromptStudio = () => {
    if (linkedPrompt) {
      sessionStorage.setItem('nerozarb_active_prompt_id', linkedPrompt.id);
    }
    onNavigate?.('studio', String(task.clientId));
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width={920}
      title={
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
            <span className="text-primary font-medium">{client?.name || 'Client'}</span>
            <span aria-hidden="true">·</span>
            <span>{task.category}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{task.priority} priority</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">{task.name}</h2>
        </div>
      }
      footer={
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-3">
          <Button variant="outline" size="sm" onClick={handleOpenInPromptStudio}>
            <BookOpen size={15} />
            Open Prompt Studio
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            {nextStage ? (
              <Button onClick={handleAdvanceStage} disabled={!canAdvance}>
                Move to {nextStage}
              </Button>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/15 text-primary text-xs font-semibold">
                <CheckCircle2 size={15} />
                <span>Completed & Deployed</span>
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stage Progress Bar */}
        <div className="rounded-lg border border-border-dark bg-onyx p-4">
          <p className="text-xs font-medium text-text-muted mb-3">Delivery Stage</p>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            {PIPELINE_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step} className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded ${
                      isCurrent
                        ? 'bg-primary text-onyx font-semibold'
                        : isCompleted
                        ? 'text-primary bg-primary/10'
                        : 'text-text-muted'
                    }`}
                  >
                    {step}
                  </span>
                  {index < PIPELINE_STEPS.length - 1 && (
                    <ChevronRight size={14} className="text-text-muted/40" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Brief, Linked Prompt, and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Brief */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-text-secondary flex items-center gap-2">
                <Paperclip size={14} className="text-primary" />
                <span>Task Brief</span>
              </h3>
              <div className="rounded-lg border border-border-dark bg-onyx p-4 whitespace-pre-wrap text-sm text-text-secondary leading-relaxed">
                {task.brief || 'No brief added for this task yet.'}
              </div>
            </div>

            {/* Linked Prompt from Prompt OS */}
            <div className="rounded-lg border border-border-dark bg-onyx/70 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="task-detail-prompt-select"
                  className="text-xs font-semibold text-text-secondary flex items-center gap-2"
                >
                  <BookOpen size={14} className="text-primary" />
                  <span>Linked Prompt from Prompt OS</span>
                </label>

                {linkedPrompt && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border-dark bg-card px-2.5 py-1 text-xs font-medium text-text-primary hover:border-primary transition-colors"
                    >
                      <ClipboardCopy size={12} />
                      <span>Copy Prompt</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenInPromptStudio}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/15 border border-primary/30 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/25 transition-colors"
                    >
                      <span>Customize in Studio</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                )}
              </div>

              <select
                id="task-detail-prompt-select"
                value={linkedPrompt?.id || ''}
                onChange={e => handleAttachPrompt(e.target.value)}
                className="min-h-10 w-full rounded-lg border border-border-dark bg-card px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="">Select a prompt from Prompt Vault...</option>
                {data.promptTemplates
                  .filter(p => p.status !== 'archived')
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.category}] {p.title}
                    </option>
                  ))}
              </select>

              {linkedPrompt && (
                <div className="rounded-lg border border-border-dark bg-onyx p-3 text-xs font-mono text-text-secondary whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                  {resolvedPrompt}
                </div>
              )}
            </div>

            {/* Activity & Notes */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-text-secondary flex items-center gap-2">
                <MessageSquare size={14} className="text-primary" />
                <span>Activity & Team Notes</span>
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Add a progress note or link..."
                  className="flex-1 min-h-10 rounded-lg border border-border-dark bg-onyx px-3.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                />
                <Button variant="outline" size="sm" onClick={handleAddNote}>
                  Add Note
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pt-1">
                {[...task.activityLog].reverse().map((log, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border-dark bg-onyx/50 px-3.5 py-2.5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-text-muted">
                      <span className="font-semibold text-text-secondary uppercase">
                        {log.author === 'ceo' ? 'CEO' : 'Team'}
                      </span>
                      <span className="font-mono tabular-nums">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-text-primary">{log.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Metadata */}
          <div className="rounded-lg border border-border-dark bg-onyx p-5 space-y-4 self-start">
            <h3 className="text-xs font-semibold text-text-secondary border-b border-border-dark pb-3">
              Task Details
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-text-muted flex items-center gap-1.5">
                  <User size={13} /> Assigned Role
                </span>
                <p className="font-medium text-text-primary mt-0.5">{task.assignedNode}</p>
              </div>

              <div>
                <span className="text-xs text-text-muted flex items-center gap-1.5">
                  <Calendar size={13} /> Deadline
                </span>
                <p className="font-medium font-mono tabular-nums text-text-primary mt-0.5">
                  {task.deadline || 'No deadline set'}
                </p>
              </div>

              <div>
                <span className="text-xs text-text-muted flex items-center gap-1.5">
                  <Clock size={13} /> Estimated Effort
                </span>
                <p className="font-medium font-mono tabular-nums text-text-primary mt-0.5">
                  {task.estimatedHours ? `${task.estimatedHours} hrs` : 'Not estimated'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
