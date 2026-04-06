import { motion } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Users, Zap, CheckCircle2, Circle, Activity, Palette, BookOpen } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import React, { useState, useMemo, memo } from 'react';
import ClientEditModal from './ClientEditModal';
import ClientPortalManager from './ClientPortalManager';

export default function ClientDetailView({ clientId, onBack, onNavigate }: { clientId: string, onBack: () => void, onNavigate?: (view: string, clientId?: string) => void }) {
  const { data, updateOnboardingStep } = useAppData();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const client = data.clients.find(c => c.id.toString() === clientId);
  const protocol = data.onboardings.find(o => o.clientId.toString() === clientId);
  const authLevel = sessionStorage.getItem('authLevel') || 'team';

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-text-muted space-y-4">
        <p className="font-mono text-sm uppercase tracking-widest">[ CLIENT NOT FOUND ]</p>
        <Button onClick={onBack} variant="outline" className="border-border-dark text-text-muted hover:text-text-primary">Back to Roster</Button>
      </div>
    );
  }

  const clientTasks = useMemo(() => data.tasks.filter(t => t.clientId === client.id), [data.tasks, client.id]);

  const healthScore = useMemo(() => {
    let score = 100;
    const overdueTasks = clientTasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done');
    score -= overdueTasks.length * 5;

    const lastActivity = clientTasks.length > 0
      ? new Date(Math.max(...clientTasks.map(t => new Date(t.updatedAt).getTime())))
      : new Date();

    const daysSinceMvmt = Math.floor((new Date().getTime() - lastActivity.getTime()) / (1000 * 3600 * 24));
    if (daysSinceMvmt > 7) score -= 15;

    return Math.max(0, score);
  }, [clientTasks]);

  const healthStatus = healthScore > 80 ? 'EXCELLENT' : healthScore > 60 ? 'NEEDS ATTENTION' : 'CRITICAL';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-8 max-w-[1600px] mx-auto space-y-10 h-full flex flex-col overflow-hidden"
    >
      {/* Header Section */}
      <header className="flex justify-between items-center pb-8 border-b border-border-dark flex-wrap gap-4">
        <div className="flex items-center gap-8">
          <button
            onClick={onBack}
            className="w-10 h-10  rounded-sm flex items-center justify-center text-text-muted hover:text-text-primary hover:border-text-muted transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-text-muted tracking-widest uppercase mb-2 mt-1 flex items-center gap-2">
              <button onClick={onBack} className="hover:text-primary transition-colors">Client OS</button>
              <span>/</span>
              <span className="text-text-primary">{client.name}</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="font-heading text-4xl font-black text-text-primary tracking-tight uppercase">{client.name}</h1>
              <div className="flex gap-2">
                <Badge status={client.status === 'Active Sprint' || client.status === 'Retainer' ? 'healthy' : 'review'} className="font-mono text-[9px] tracking-widest px-2">{client.status.toUpperCase()}</Badge>
                <Badge status="default" className="bg-card-alt border-border-dark font-mono text-[9px] tracking-widest px-2">{client.tier.split(':')[0].toUpperCase()}</Badge>
              </div>
            </div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-text-muted uppercase">System ID: {client.name.substring(0, 4).toUpperCase()}-{client.id.toString().padStart(4, '0')}-PRX</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {authLevel === 'ceo' && (
            <div className="text-right mr-4 border-r border-border-dark pr-6">
              <p className="font-mono text-[10px] text-text-muted tracking-[0.2em] uppercase">LTV (PKR)</p>
              <p className="font-mono text-xl text-primary font-bold">{formatCurrency(client.ltv)}</p>
            </div>
          )}
          <Button
            onClick={() => onNavigate?.('vault', client.id.toString())}
            variant="ghost"
            className="font-mono text-[10px] tracking-widest uppercase "
          >
            <BookOpen className="w-3 h-3 mr-2 inline-block" />
            KNOWLEDGE BASE
          </Button>
          <Button
            onClick={() => setIsEditModalOpen(true)}
            variant="ghost"
            className="font-mono text-[10px] tracking-widest uppercase "
          >
            EDIT PROFILE
          </Button>
          <Button
            className="bg-primary hover:bg-accent-mid text-text-primary font-mono text-[10px] tracking-[0.2em] uppercase px-6"
            onClick={() => onNavigate?.('fulfillment', client.id.toString())}
          >
            {client.status === 'Active Sprint' ? 'VIEW SPRINT' : 'INITIALIZE SPRINT'}
          </Button>
          <Button
            className="bg-card-alt  hover:border-primary text-text-primary font-mono text-[10px] tracking-widest uppercase px-6"
            onClick={() => onNavigate?.('content', client.id.toString())}
          >
            VIEW CALENDAR
          </Button>
        </div>
      </header>

      {/* Main Grid — 60/40 Split */}
      <div className="flex-1 grid grid-cols-12 gap-10 min-h-0 overflow-hidden">

        {/* LEFT COLUMN (60%) — Strategic Intelligence */}
        <div className="col-span-12 lg:col-span-7 space-y-10 overflow-y-auto custom-scrollbar pr-4">

          {/* Shadow Avatar Profile */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-text-primary">
              <Users size={18} className="text-primary" />
              <h3 className="font-heading text-lg font-black tracking-tight uppercase italic">Shadow Avatar</h3>
            </div>
            <Card className="p-8 border-l-4 border-l-primary bg-card/50">
              <p className="text-text-secondary leading-relaxed font-sans text-sm italic">
                {client.shadowAvatar || '"No shadow avatar profile has been established for this client yet. Update profile intelligence."'}
              </p>
            </Card>
          </section>

          <div className="grid grid-cols-2 gap-8">
            {/* The Bleeding Neck */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-text-primary">
                <Zap size={18} className="text-red-500" />
                <h3 className="font-heading text-sm font-black tracking-tight uppercase">The Bleeding Neck</h3>
              </div>
              <Card className="p-6 bg-card-alt/50 border-border-dark h-[140px] overflow-y-auto">
                <p className="text-xs text-text-secondary leading-loose">
                  {client.bleedingNeck || 'Primary pain point not yet documented.'}
                </p>
              </Card>
            </section>

            {/* Core Brand Identity (Mocked from Niche for now) */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-text-primary">
                <Palette size={18} className="text-blue-500" />
                <h3 className="font-heading text-sm font-black tracking-tight uppercase">Core Identity / Niche</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge status="default" className="bg-card-alt border-border-dark text-[10px] py-1 px-3 uppercase text-text-muted">{client.niche}</Badge>
                {authLevel === 'ceo' && (
                  <Badge status="default" className="bg-card-alt border-border-dark text-[10px] py-1 px-3 uppercase text-text-muted">{client.revenueGate}</Badge>
                )}
              </div>
            </section>
          </div>

          {/* Client Portal Access & Management */}
          <section className="pt-6 border-t border-border-dark/50">
            <ClientPortalManager clientId={client.id} />
          </section>

          {/* Strategic Assets Block */}
          <section className="space-y-6 pt-6 border-t border-border-dark/50">
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-4">
                <h4 className="font-mono text-[10px] text-text-muted tracking-widest uppercase">Content Pillars</h4>
                <ul className="space-y-3">
                  {client.contentPillars && client.contentPillars.length > 0 ? (
                    client.contentPillars.map((pillar, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                        <span className="text-xs text-text-secondary leading-normal">{pillar}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center gap-3">
                      <span className="text-xs text-text-muted italic">No pillars established.</span>
                    </li>
                  )}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-mono text-[10px] text-text-muted tracking-widest uppercase">Internal Notes</h4>
                <div className="w-full text-xs text-text-secondary leading-loose bg-card-alt/30 p-4  rounded-sm">
                  {client.notes || 'No internal notes found for this client.'}
                </div>
              </div>
            </div>
          </section>

          {/* Active Sprint & Content Pipeline */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-border-dark/50">
            {/* Sprint Progress Summary */}
            <section className="space-y-4">
              <h4 className="font-mono text-[10px] text-text-muted tracking-widest uppercase flex justify-between items-center">
                <span>Active Sprint Progress</span>
                <span className="text-primary font-bold">14 / 60 DAYS</span>
              </h4>
              <Card className="p-5 bg-card border-border-dark flex flex-col gap-4">
                <div className="h-1.5 w-full bg-border-dark rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[25%]" />
                </div>
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-text-secondary">
                  <span>Sprint Zero</span>
                  <span>Execution</span>
                  <span>Delivery</span>
                </div>
                <p className="text-xs text-text-secondary italic">Currently mapping core content architectures and brand voice guidelines. Execution phase begins next week.</p>
              </Card>
            </section>

            {/* Content Calendar Preview */}
            <section className="space-y-4">
              <h4 className="font-mono text-[10px] text-text-muted tracking-widest uppercase">Content Pipeline Preview</h4>
              <Card className="p-4 bg-card border-border-dark space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate text-text-primary">01. The Death of Cold Outbound</span>
                  <Badge status="review" className="bg-blue-500/20 text-blue-500 border-none font-mono text-[8px] tracking-widest px-1 py-0 h-4">DRAFTING</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate text-text-primary">02. Engineering Led Growth</span>
                  <Badge status="review" className="bg-yellow-500/20 text-yellow-500 border-none font-mono text-[8px] tracking-widest px-1 py-0 h-4">REVIEW</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate text-text-primary">03. Contrarian Scaling Logic</span>
                  <Badge status="deployed" className="bg-primary/20 text-primary border-none font-mono text-[8px] tracking-widest px-1 py-0 h-4">READY</Badge>
                </div>
              </Card>
            </section>
          </div>
        </div>

        {/* RIGHT COLUMN (40%) — Operational Status */}
        <div className="col-span-12 lg:col-span-5 space-y-10 overflow-y-auto custom-scrollbar lg:pl-10 lg:border-l border-border-dark/50">

          {/* Health Index Card */}
          <section className="space-y-4">
            <div className="flex justify-between items-baseline">
              <h3 className="font-heading text-sm font-black tracking-tight uppercase">Health Index</h3>
              <span className={`font-mono text-3xl font-black tracking-tighter ${healthStatus === 'EXCELLENT' ? 'text-primary' : healthStatus === 'NEEDS ATTENTION' ? 'text-yellow-500' : 'text-red-500'}`}>
                {healthScore}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-border-dark rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${healthScore}%` }}
                className={`h-full ${healthStatus === 'EXCELLENT' ? 'bg-primary shadow-[0_0_10px_rgba(63,106,36,0.5)]' : healthStatus === 'NEEDS ATTENTION' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}
              />
            </div>
            <p className="font-mono text-[10px] text-text-muted tracking-wide text-right uppercase">
              {healthStatus === 'EXCELLENT' ? 'Optimal Performance' : healthStatus === 'NEEDS ATTENTION' ? 'Attention Required' : 'Critical Intervention Needed'}
            </p>
          </section>

          {/* Onboarding protocol */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-text-primary">
              <Activity size={18} className="text-accent-light" />
              <h3 className="font-heading text-sm font-black tracking-tight uppercase">Onboarding Protocol</h3>
            </div>
            <Card className="bg-card-alt border-border-dark p-2">
              <div className="p-2 space-y-1">
                {protocol ? (
                  protocol.steps.map((step, index) => {
                    const isActive = !step.completed && (index === 0 || protocol.steps[index - 1].completed);
                    return (
                      <ChecklistItem
                        key={step.id}
                        text={step.label}
                        completed={step.completed}
                        active={isActive}
                        onClick={() => updateOnboardingStep(protocol.id, step.id, !step.completed)}
                      />
                    );
                  })
                ) : (
                  <p className="font-mono text-[9px] text-text-muted tracking-widest uppercase p-4 text-center">No Active Protocol</p>
                )}
              </div>
              <div className="p-4 bg-black/40 border-t border-border-dark mt-2">
                <p className="font-mono text-[9px] text-primary tracking-widest text-center uppercase">
                  {protocol ? (protocol.progress === 10 ? 'PROTOCOL COMPLETE' : 'PROTOCOL IN PROGRESS') : 'PROTOCOL NOT GENERATED'}
                </p>
              </div>
            </Card>
          </section>

          {/* Activity Timeline */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-text-primary">
              <Activity size={18} className="text-text-muted" />
              <h3 className="font-heading text-sm font-black tracking-tight uppercase">Historical Timeline</h3>
            </div>
            <div className="space-y-8 pl-4 pb-8">
              {client.timeline && client.timeline.length > 0 ? (
                client.timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(event => (
                  <TimelineItem
                    key={event.id}
                    title={event.event}
                    time={new Date(event.date).toLocaleDateString()}
                    type={event.type === 'system' ? 'default' : 'info'}
                  />
                ))
              ) : (
                <p className="text-xs text-text-muted italic">No timeline events recorded.</p>
              )}
            </div>
          </section>

        </div>
      </div>

      <ClientEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={client}
      />
    </motion.div>
  );
}

function ChecklistItem({ key, text, completed = false, active = false, onClick }: { key?: React.Key, text: string, completed?: boolean, active?: boolean, onClick?: () => void }) {
  return (
    <div
      className={`group flex items-start gap-3 p-3 border-l-2 transition-all cursor-pointer ${completed ? 'border-primary bg-primary/5' :
        active ? 'border-accent-light bg-card-alt hover:bg-surface' :
          'border-border-dark opacity-50'
        }`}
      onClick={active || completed ? onClick : undefined}
    >
      <div className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${completed ? 'bg-primary border-primary' :
        active ? 'border-accent-light' :
          'border-border-dark bg-surface shadow-inner'
        }`}>
        {completed && <CheckCircle2 size={12} className="text-black" />}
      </div>
      <div className="flex-1 space-y-1">
        <p className={`text-sm ${completed ? 'text-primary line-through opacity-70' : active ? 'text-text-primary' : 'text-text-muted'}`}>
          {text}
        </p>
      </div>
    </div>
  );
}

function TimelineItem({ title, time, type }: { key?: number | string, title: string, time: string, type: 'success' | 'info' | 'default' }) {
  const colors = {
    success: 'bg-primary',
    info: 'bg-accent-light',
    default: 'bg-border-dark'
  };

  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-1.5 bottom-[-32px] w-[1px] bg-border-dark last:bottom-0" />
      <div className={`absolute left-[-4.5px] top-1.5 w-2.5 h-2.5 rounded-full ${colors[type]} ring-4 ring-bg-surface shadow-[0_0_0_4px_#121212]`} />
      <p className="font-heading font-bold text-[10px] text-text-secondary uppercase tracking-widest">{title}</p>
      <p className="font-mono text-[9px] text-text-muted mt-1 uppercase tracking-tighter">{time}</p>
    </div>
  );
}
