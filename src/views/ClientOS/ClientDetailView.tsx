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
      className="page-container h-full flex flex-col overflow-hidden py-8"
    >
      {/* Header Section */}
      <header className="flex justify-between items-start pb-10 border-b border-white/[0.04] flex-wrap gap-8">
        <div className="flex items-start gap-8">
          <button
            onClick={onBack}
            className="w-10 h-10 border border-white/[0.06] flex items-center justify-center text-text-muted hover:text-text-primary hover:border-white/[0.1] transition-all bg-white/[0.02] rounded-none mt-1"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-text-muted/40 font-sans text-[11px] font-bold uppercase tracking-[0.2em]">
              <button onClick={onBack} className="hover:text-primary transition-colors">Client OS</button>
              <span>/</span>
              <span className="text-text-muted/60">Account Registry</span>
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-6xl text-text-primary tracking-tighter uppercase leading-none">{client.name}</h1>
              <div className="flex items-center gap-3">
                <Badge status={client.status === 'Active Sprint' || client.status === 'Retainer' ? 'healthy' : 'review'}>{client.status}</Badge>
                <Badge status="default">{client.tier.split(':')[0]}</Badge>
                <span className="text-text-muted/20 font-sans text-[11px] font-bold tracking-[0.3em] uppercase ml-2">Registry: {client.name.substring(0, 4).toUpperCase()}-{client.id.toString().padStart(4, '0')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {authLevel === 'ceo' && (
            <div className="text-right mr-6 border-r border-white/[0.06] pr-8 py-1">
              <p className="font-sans text-[11px] font-bold text-text-muted/40 tracking-[0.2em] uppercase mb-1">Market Value</p>
              <p className="font-sans text-2xl text-primary font-bold tracking-tighter">{formatCurrency(client.ltv)}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onNavigate?.('vault', client.id.toString())}
              variant="ghost"
              className="px-4"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Vault
            </Button>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="ghost"
              className="px-4"
            >
              Profile
            </Button>
            <Button
              className="bg-primary hover:bg-accent-mid text-text-primary px-8"
              onClick={() => onNavigate?.('fulfillment', client.id.toString())}
            >
              {client.status === 'Active Sprint' ? 'Operations' : 'Initialize'}
            </Button>
            <Button
              className="bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] text-text-primary px-8"
              onClick={() => onNavigate?.('content', client.id.toString())}
            >
              Calendar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Grid — 60/40 Split */}
      <div className="flex-1 grid grid-cols-12 gap-12 min-h-0 overflow-hidden pt-10">

        {/* LEFT COLUMN (60%) — Strategic Intelligence */}
        <div className="col-span-12 lg:col-span-7 space-y-12 overflow-y-auto custom-scrollbar pr-6">

          {/* Shadow Avatar Profile */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 text-text-primary">
              <Users size={16} className="text-primary" />
              <h3 className="font-heading text-2xl uppercase tracking-tighter">Shadow Avatar</h3>
            </div>
            <Card className="p-10 border-l-2 border-primary/40 bg-white/[0.01]">
              <p className="text-text-muted leading-relaxed font-serif text-[18px] italic opacity-80">
                {client.shadowAvatar || '"Establish shadow avatar intelligence for account optimization."'}
              </p>
            </Card>
          </section>


          <div className="grid grid-cols-2 gap-10">
            {/* The Bleeding Neck */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-text-primary">
                <Zap size={14} className="text-primary" />
                <h3 className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-text-muted/60">Primary Pain Vector</h3>
              </div>
              <Card className="p-8 bg-white/[0.02] border-white/[0.06] h-[160px] overflow-y-auto">
                <p className="font-sans text-[12px] font-bold text-text-muted/80 leading-relaxed uppercase tracking-widest">
                  {client.bleedingNeck || 'DRIVING PAIN VECTOR NOT YET IDENTIFIED.'}
                </p>
              </Card>
            </section>


            {/* Core Brand Identity */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-text-primary">
                <Palette size={14} className="text-primary" />
                <h3 className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-text-muted/60">Identity Sector</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge status="default" className="py-2 px-5">{client.niche}</Badge>
                {authLevel === 'ceo' && (
                  <Badge status="default" className="py-2 px-5">{client.revenueGate}</Badge>
                )}
              </div>
            </section>

          </div>

          {/* Client Portal Access & Management */}
          <section className="pt-10 border-t border-white/[0.04]">
            <ClientPortalManager clientId={client.id} />
          </section>

          {/* Strategic Assets Block */}
          <section className="space-y-10 pt-10 border-t border-white/[0.04]">
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <h4 className="font-sans text-[11px] font-bold text-text-muted/40 tracking-[0.2em] uppercase">Content Foundations</h4>
                <ul className="space-y-5">
                  {client.contentPillars && client.contentPillars.length > 0 ? (
                    client.contentPillars.map((pillar, idx) => (
                      <li key={idx} className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 bg-primary/40 shrink-0" />
                        <span className="font-sans text-[12px] font-bold text-text-muted uppercase tracking-widest leading-none">{pillar}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center gap-4 opacity-30">
                      <span className="font-sans text-[11px] italic uppercase tracking-widest">Foundation mapping required.</span>
                    </li>
                  )}
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-sans text-[11px] font-bold text-text-muted/40 tracking-[0.2em] uppercase">Intelligence Ledger</h4>
                <div className="w-full font-sans text-[12px] text-text-muted/80 leading-relaxed bg-white/[0.01] p-6 border border-white/[0.06] uppercase tracking-wider">
                  {client.notes || 'No strategic observations recorded for this entity.'}
                </div>
              </div>
            </div>
          </section>


          {/* Active Sprint & Content Pipeline */}
          <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/[0.04]">
            {/* Sprint Progress Summary */}
            <section className="space-y-4">
              <h4 className="font-sans text-[11px] font-bold text-text-muted/60 tracking-[0.2em] uppercase flex justify-between items-center">
                <span>Active Sprint Progress</span>
                <span className="text-primary">14 / 60 DAYS</span>
              </h4>
              <Card className="p-6 bg-white/[0.01] border-white/[0.06] flex flex-col gap-5">
                <div className="h-1 w-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full bg-primary w-[25%]" />
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted/40 font-sans">
                  <span>Sprint Zero</span>
                  <span>Execution</span>
                  <span>Delivery</span>
                </div>
                <p className="text-[12px] text-text-muted/60 leading-relaxed font-serif italic">Currently mapping core content architectures and brand voice guidelines. Execution phase begins next week.</p>
              </Card>
            </section>

            {/* Content Calendar Preview */}
            <section className="space-y-4">
              <h4 className="font-sans text-[11px] font-bold text-text-muted/60 tracking-[0.2em] uppercase">Content Pipeline Preview</h4>
              <Card className="p-6 bg-white/[0.01] border-white/[0.06] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="truncate text-text-primary font-sans text-[12px] font-bold uppercase tracking-widest">01. The Death of Cold Outbound</span>
                  <Badge status="review" className="text-[10px] font-bold py-0.5 px-2">DRAFT</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="truncate text-text-primary font-sans text-[12px] font-bold uppercase tracking-widest">02. Engineering Led Growth</span>
                  <Badge status="review" className="text-[10px] font-bold py-0.5 px-2">REVIEW</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="truncate text-text-primary font-sans text-[12px] font-bold uppercase tracking-widest">03. Contrarian Scaling Logic</span>
                  <Badge status="deployed" className="text-[10px] font-bold py-0.5 px-2">READY</Badge>
                </div>
              </Card>
            </section>
          </div>
        </div>

        {/* RIGHT COLUMN (40%) — Operational Status */}
        <div className="col-span-12 lg:col-span-5 space-y-12 overflow-y-auto custom-scrollbar lg:pl-12 lg:border-l border-white/[0.04]">

          {/* Health Index Card */}
          <section className="space-y-8">
            <div className="flex justify-between items-baseline">
              <h3 className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-text-muted/60">Stability Index</h3>
              <span className={`font-sans text-5xl font-bold tracking-tighter ${healthStatus === 'EXCELLENT' ? 'text-primary' : healthStatus === 'NEEDS ATTENTION' ? 'text-yellow-500' : 'text-red-500'}`}>
                {healthScore}<span className="text-[18px] text-text-muted/20 ml-1">%</span>
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.04] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${healthScore}%` }}
                className={`h-full ${healthStatus === 'EXCELLENT' ? 'bg-primary' : healthStatus === 'NEEDS ATTENTION' ? 'bg-yellow-500' : 'bg-red-500'}`}
              />
            </div>
            <p className="font-sans text-[11px] font-bold text-text-muted/40 tracking-[0.2em] text-right uppercase">
              {healthStatus === 'EXCELLENT' ? 'System Stable' : healthStatus === 'NEEDS ATTENTION' ? 'Maintenance Required' : 'Critical Failure Imminent'}
            </p>
          </section>


          {/* Onboarding protocol */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 text-text-primary">
              <Activity size={16} className="text-primary" />
              <h3 className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-text-muted/60">Deployment Protocol</h3>
            </div>
            <Card className="bg-white/[0.01] border-white/[0.06]">

              <div className="space-y-px">
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
                  <p className="font-sans text-[11px] text-text-muted/30 tracking-widest uppercase p-10 text-center">No Active Protocol</p>
                )}
              </div>
              <div className="p-6 bg-white/[0.02] border-t border-white/[0.06]">
                <p className="font-sans text-[11px] font-bold text-primary tracking-[0.3em] text-center uppercase">
                  {protocol ? (protocol.progress === 10 ? 'PROTOCOL FINALIZED' : 'PROTOCOL ACTIVE') : 'PROTOCOL NOT INITIALIZED'}
                </p>
              </div>
            </Card>
          </section>


          {/* Activity Timeline */}
          <section className="space-y-10">
            <div className="flex items-center gap-4 text-text-primary">
              <Activity size={16} className="text-primary" />
              <h3 className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-text-muted/60">Sequential Log</h3>
            </div>
            <div className="space-y-10 pl-5 pb-8">
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
                <p className="font-sans text-[11px] text-text-muted/20 italic uppercase tracking-widest">Log empty.</p>
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

function ChecklistItem({ text, completed = false, active = false, onClick }: { key?: React.Key, text: string, completed?: boolean, active?: boolean, onClick?: () => void }) {
  return (
    <div
      className={`group flex items-start gap-5 p-6 border-b border-white/[0.04] transition-all cursor-pointer ${completed ? 'bg-primary/[0.02]' :
        active ? 'bg-white/[0.02] hover:bg-white/[0.04]' :
          'opacity-20 cursor-not-allowed'
        }`}
      onClick={active || completed ? onClick : undefined}
    >
      <div className={`mt-0.5 w-4 h-4 border transition-colors flex items-center justify-center rounded-none ${completed ? 'bg-primary border-primary' :
        active ? 'border-primary/50' :
          'border-white/10 bg-onyx'
        }`}>
        {completed && <CheckCircle2 size={12} className="text-black" />}
      </div>
      <div className="flex-1">
        <p className={`font-sans text-[12px] font-bold tracking-widest uppercase ${completed ? 'text-primary' : active ? 'text-text-primary' : 'text-text-muted'}`}>
          {text}
        </p>
      </div>
    </div>
  );
}


function TimelineItem({ title, time, type }: { key?: number | string, title: string, time: string, type: 'success' | 'info' | 'default' }) {
  const colors = {
    success: 'bg-primary',
    info: 'bg-primary',
    default: 'bg-text-muted/20'
  };

  return (
    <div className="relative pl-10">
      <div className="absolute left-0 top-1.5 bottom-[-40px] w-px bg-white/[0.04] last:bottom-0" />
      <div className={`absolute left-[-2px] top-1.5 w-1.5 h-1.5 ${colors[type]}`} />
      <p className="font-sans font-bold text-[11px] text-text-muted/80 uppercase tracking-widest leading-none">{title}</p>
      <p className="font-sans text-[11px] font-bold text-text-muted/40 mt-2 uppercase tracking-widest">{time}</p>
    </div>
  );
}

