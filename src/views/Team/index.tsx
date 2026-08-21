import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAppData } from '../../contexts/AppDataContext';
import { TeamMember, TeamMemberRole } from '../../utils/storage';
import { isTaskOpen } from '../../utils/statusHelpers';
import { getCurrentTeamMemberId, setCurrentTeamMemberId } from '../../utils/currentTeamMember';
import { UsersRound, Plus, CheckCircle2 } from 'lucide-react';

const ROLE_LABELS: Record<TeamMemberRole, string> = {
  admin: 'Admin', manager: 'Manager', employee: 'Employee', sales: 'Sales', client: 'Client',
};

function MemberFormModal({ isOpen, onClose, member }: { isOpen: boolean; onClose: () => void; member: TeamMember | null }) {
  const { addTeamMember, updateTeamMember } = useAppData();
  const [name, setName] = useState(member?.name || '');
  const [email, setEmail] = useState(member?.email || '');
  const [role, setRole] = useState<TeamMemberRole>(member?.role || 'employee');
  const [department, setDepartment] = useState(member?.department || '');
  const [weeklyCapacityHours, setWeeklyCapacityHours] = useState(String(member?.weeklyCapacityHours ?? 40));

  const handleSubmit = () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      email: email.trim() || null,
      avatarUrl: member?.avatarUrl || null,
      role,
      department: department.trim() || null,
      weeklyCapacityHours: Number(weeklyCapacityHours) || 40,
      active: member?.active ?? true,
    };
    if (member) updateTeamMember(member.id, payload);
    else addTeamMember(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={member ? 'Edit team member' : 'Add team member'}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>{member ? 'Save changes' : 'Add member'}</Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Input label="Name" required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@nerozarb.com" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as TeamMemberRole)}
              className="w-full min-h-11 rounded-lg bg-white/[0.03] border border-border-dark px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <Input label="Weekly capacity (hrs)" type="number" value={weeklyCapacityHours} onChange={e => setWeeklyCapacityHours(e.target.value)} />
        </div>
        <Input label="Department" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Content, Design, Ops" />
      </div>
    </Modal>
  );
}

export default function TeamView() {
  const { data, updateTeamMember } = useAppData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [currentId, setCurrentId] = useState(getCurrentTeamMemberId());

  const workload = useMemo(() => {
    const map = new Map<string, { openTasks: number; overdueTasks: number }>();
    data.teamMembers.forEach(m => map.set(m.id, { openTasks: 0, overdueTasks: 0 }));
    const now = new Date();
    data.tasks.forEach(t => {
      if (!t.assigneeId || !map.has(t.assigneeId) || !isTaskOpen(t)) return;
      const entry = map.get(t.assigneeId)!;
      entry.openTasks += 1;
      if (t.deadline && new Date(t.deadline) < now) entry.overdueTasks += 1;
    });
    return map;
  }, [data.teamMembers, data.tasks]);

  const handleSetCurrent = (id: string) => {
    setCurrentTeamMemberId(id);
    setCurrentId(id);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-header-title">Team</h1>
          <p className="page-header-subtitle mt-1">Who's on the team, what they own, and how loaded they are.</p>
        </div>
        <Button onClick={() => { setEditingMember(null); setIsFormOpen(true); }}>
          <Plus size={16} /> Add team member
        </Button>
      </header>

      {data.teamMembers.length === 0 ? (
        <EmptyState
          icon={<UsersRound size={22} />}
          title="Add your first team member"
          description="Real people, not job titles. Once someone is added here, tasks and content can be assigned directly to them, and My Work can show them exactly what's theirs."
          actionLabel="Add team member"
          onAction={() => { setEditingMember(null); setIsFormOpen(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.teamMembers.map(member => {
            const load = workload.get(member.id) || { openTasks: 0, overdueTasks: 0 };
            const capacityPct = member.weeklyCapacityHours > 0 ? Math.min(100, Math.round((load.openTasks / (member.weeklyCapacityHours / 4)) * 100)) : 0;
            const isMe = currentId === member.id;
            return (
              <Card key={member.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{member.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{member.department || ROLE_LABELS[member.role]}</p>
                  </div>
                  <Badge status={member.active ? 'healthy' : 'critical'}>{member.active ? ROLE_LABELS[member.role] : 'Inactive'}</Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span>{load.openTasks} open task{load.openTasks === 1 ? '' : 's'}</span>
                  {load.overdueTasks > 0 && <span className="text-red-500">{load.overdueTasks} overdue</span>}
                </div>

                <div className="h-1 w-full bg-card-alt rounded-full overflow-hidden">
                  <div className={`h-full ${capacityPct > 90 ? 'bg-red-500' : capacityPct > 70 ? 'bg-yellow-500' : 'bg-primary'}`} style={{ width: `${capacityPct}%` }} />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                  <button
                    onClick={() => handleSetCurrent(member.id)}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isMe ? 'text-primary' : 'text-text-muted hover:text-text-primary'}`}
                  >
                    <CheckCircle2 size={14} />
                    {isMe ? "This is me" : "I'm this person"}
                  </button>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setEditingMember(member); setIsFormOpen(true); }} className="text-xs text-text-muted hover:text-text-primary transition-colors">Edit</button>
                    <button onClick={() => updateTeamMember(member.id, { active: !member.active })} className="text-xs text-text-muted hover:text-text-primary transition-colors">
                      {member.active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <MemberFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} member={editingMember} />
    </div>
  );
}
