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
      <header className="flex justify-between items-center pb-12 border-b border-white/[0.04] flex-wrap gap-6">
        <div className="flex items-center gap-10">
          <button
            onClick={onBack}
            className="w-12 h-12 border border-white/5 flex items-center justify-center text-[#444] hover:text-text-primary hover:border-white/20 transition-all bg-white/[0.02]"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="space-y-3">
            <div className="font-sans text-[9px] font-black text-[#555] tracking-[0.3em] uppercase mb-1 flex items-center gap-3">
              <button onClick={onBack} className="hover:text-primary transition-colors">Client OS</button>
              <span className="opacity-20">/</span>
              <span className="text-text-primary font-bold">Account Registry</span>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <h1 className="editorial-title text-5xl text-text-primary italic tracking-tight">{client.name}</h1>
              <div className="flex gap-3">
                <Badge status={client.status === 'Active Sprint' || client.status === 'Retainer' ? 'healthy' : 'review'} className="font-sans text-[9px] font-bold tracking-[0.2em] px-3 py-1 uppercase">{client.status}</Badge>
                <Badge status="default" className="bg-white/5 border-white/10 font-sans text-[9px] font-bold tracking-[0.2em] px-3 py-1 uppercase text-[#666]">{client.tier.split(':')[0]}</Badge>
              </div>
            </div>
            <p className="font-sans text-[9px] font-black tracking-[0.4em] text-[#333] uppercase">Security Clearance: {client.name.substring(0, 4).toUpperCase()}-{client.id.toString().padStart(4, '0')}-PRX</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {authLevel === 'ceo' && (
            <div className="text-right mr-6 border-r border-white/5 pr-8">
              <p className="font-sans text-[9px] font-black text-[#444] tracking-[0.3em] uppercase mb-1">Market Value</p>
              <p className="font-sans text-xl text-primary font-black tracking-tighter">{formatCurrency(client.ltv)}</p>
            </div>
          )}
          <Button
            onClick={() => onNavigate?.('vault', client.id.toString())}
            variant="ghost"
            className="font-sans text-[9px] font-black tracking-[0.2em] uppercase text-[#666] hover:text-text-primary"
          >
            <BookOpen className="w-3 h-3 mr-2 inline-block opacity-40" />
            Vault
          </Button>
          <Button
            onClick={() => setIsEditModalOpen(true)}
            variant="ghost"
            className="font-sans text-[9px] font-black tracking-[0.2em] uppercase text-[#666] hover:text-text-primary"
          >
            Profile
          </Button>
          <Button
            className="bg-primary hover:bg-accent-mid text-text-primary font-sans text-[9px] font-black tracking-[0.2em] uppercase px-8 h-12"
            onClick={() => onNavigate?.('fulfillment', client.id.toString())}
          >
            {client.status === 'Active Sprint' ? 'Operations' : 'Initialize'}
          </Button>
          <Button
            className="bg-white/5 border border-white/5 hover:border-white/20 text-text-primary font-sans text-[9px] font-black tracking-[0.2em] uppercase px-8 h-12 transition-all"
            onClick={() => onNavigate?.('content', client.id.toString())}
          >
            Calendar
          </Button>
        </div>

      </header>

      {/* Main Grid — 60/40 Split */}
      <div className="flex-1 grid grid-cols-12 gap-10 min-h-0 overflow-hidden">

        {/* LEFT COLUMN (60%) — Strategic Intelligence */}
        <div className="col-span-12 lg:col-span-7 space-y-10 overflow-y-auto custom-scrollbar pr-4">

          {/* Shadow Avatar Profile */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 text-text-primary">
              <Users size={16} className="text-primary/60" />
              <h3 className="editorial-title text-2xl italic">Shadow Avatar</h3>
            </div>
            <Card className="p-10 border-l border-primary/40 bg-white/[0.01]">
              <p className="text-text-muted leading-relaxed font-serif text-lg italic opacity-80">
                {client.shadowAvatar || '"Establish shadow avatar intelligence for account optimization."'}
              </p>
            </Card>
          </section>


          <div className="grid grid-cols-2 gap-8">
            {/* The Bleeding Neck */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-text-primary">
                <Zap size={14} className="text-primary/60" />
                <h3 className="font-sans text-[10px] font-black tracking-[0.3em] uppercase italic text-[#555]">Primary Pain Vector</h3>
              </div>
              <Card className="p-8 bg-white/[0.02] border-white/5 h-[160px] overflow-y-auto">
                <p className="font-sans text-[11px] font-medium text-text-muted leading-relaxed uppercase tracking-widest">
                  {client.bleedingNeck || 'DRIVING PAIN VECTOR NOT YET IDENTIFIED.'}
                </p>
              </Card>
            </section>


            {/* Core Brand Identity */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-text-primary">
                <Palette size={14} className="text-primary/60" />
                <h3 className="font-sans text-[10px] font-black tracking-[0.3em] uppercase italic text-[#555]">Identity Sector</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge status="default" className="bg-white/5 border-white/10 text-[9px] font-black tracking-[0.2em] py-2 px-4 uppercase text-[#888]">{client.niche}</Badge>
                {authLevel === 'ceo' && (
                  <Badge status="default" className="bg-white/5 border-white/10 text-[9px] font-black tracking-[0.2em] py-2 px-4 uppercase text-[#888]">{client.revenueGate}</Badge>
                )}
              </div>
            </section>

          </div>

          {/* Client Portal Access & Management */}
          <section className="pt-6 border-t border-border-dark/50">
            <ClientPortalManager clientId={client.id} />
          </section>

          {/* Strategic Assets Block */}
          <section className="space-y-10 pt-10 border-t border-white/[0.04]">
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <h4 className="font-sans text-[9px] font-black text-[#444] tracking-[0.4em] uppercase">Content Foundations</h4>
                <ul className="space-y-4">
                  {client.contentPillars && client.contentPillars.length > 0 ? (
                    client.contentPillars.map((pillar, idx) => (
                      <li key={idx} className="flex items-center gap-4">
                        <div className="w-1 h-1 bg-primary/40 rotate-45 shrink-0" />
                        <span className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-widest">{pillar}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center gap-4">
                      <span className="font-sans text-[11px] text-[#333] italic uppercase">Foundation mapping required.</span>
                    </li>
                  )}
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-sans text-[9px] font-black text-[#444] tracking-[0.4em] uppercase">Intelligence Ledger</h4>
                <div className="w-full font-sans text-[11px] text-text-muted leading-relaxed bg-white/[0.01] p-6 border border-white/5">
                  {client.notes || 'No strategic observations recorded for this entity.'}
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
          <section className="space-y-6">
            <div className="flex justify-between items-baseline">
              <h3 className="font-sans text-[10px] font-black tracking-[0.3em] uppercase italic text-[#555]">Stability Index</h3>
              <span className={`font-sans text-4xl font-black tracking-tighter ${healthStatus === 'EXCELLENT' ? 'text-primary' : healthStatus === 'NEEDS ATTENTION' ? 'text-yellow-500' : 'text-red-500'}`}>
                {healthScore}<span className="text-[14px] opacity-20 ml-1">%</span>
              </span>
            </div>
            <div className="h-1 w-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${healthScore}%` }}
                className={`h-full ${healthStatus === 'EXCELLENT' ? 'bg-primary' : healthStatus === 'NEEDS ATTENTION' ? 'bg-yellow-500' : 'bg-red-500'}`}
              />
            </div>
            <p className="font-sans text-[8px] font-black text-[#444] tracking-[0.3em] text-right uppercase">
              {healthStatus === 'EXCELLENT' ? 'System Stable' : healthStatus === 'NEEDS ATTENTION' ? 'Maintenance Required' : 'Critical Failure Imminent'}
            </p>
          </section>


          {/* Onboarding protocol */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 text-text-primary">
              <Activity size={16} className="text-primary/60" />
              <h3 className="font-sans text-[10px] font-black tracking-[0.3em] uppercase italic text-[#555]">Deployment Protocol</h3>
            </div>
            <Card className="bg-white/[0.01] border-white/5">

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
              <div className="p-6 bg-white/[0.02] border-t border-white/5">
                <p className="font-sans text-[9px] font-black text-primary tracking-[0.5em] text-center uppercase">
                  {protocol ? (protocol.progress === 10 ? 'PROTOCOL FINALIZED' : 'PROTOCOL ACTIVE') : 'PROTOCOL NOT INITIALIZED'}
                </p>
              </div>
            </Card>
          </section>


          {/* Activity Timeline */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 text-text-primary">
              <Activity size={16} className="text-primary/60" />
              <h3 className="font-sans text-[10px] font-black tracking-[0.3em] uppercase italic text-[#555]">Sequential Log</h3>
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
                <p className="font-sans text-[11px] text-[#333] italic uppercase">Log empty.</p>
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
      className={`group flex items-start gap-4 p-5 border-l-2 transition-all cursor-pointer ${completed ? 'border-primary bg-primary/5' :
        active ? 'border-white/20 bg-white/[0.02] hover:bg-white/5' :
          'border-white/5 opacity-30 cursor-not-allowed'
        }`}
      onClick={active || completed ? onClick : undefined}
    >
      <div className={`mt-0.5 w-4 h-4 border transition-colors flex items-center justify-center ${completed ? 'bg-primary border-primary' :
        active ? 'border-white/30' :
          'border-white/10 bg-onyx'
        }`}>
        {completed && <CheckCircle2 size={12} className="text-black" />}
      </div>
      <div className="flex-1">
        <p className={`font-sans text-[11px] font-bold tracking-widest uppercase ${completed ? 'text-primary opacity-50' : active ? 'text-text-primary' : 'text-[#444]'}`}>
          {text}
        </p>
      </div>
    </div>
  );
}


function TimelineItem({ title, time, type }: { key?: number | string, title: string, time: string, type: 'success' | 'info' | 'default' }) {
  const colors = {
    success: 'bg-primary',
    info: 'bg-primary/40',
    default: 'bg-[#222]'
  };

  return (
    <div className="relative pl-10">
      <div className="absolute left-0 top-1.5 bottom-[-40px] w-[1px] bg-white/5 last:bottom-0" />
      <div className={`absolute left-[-2px] top-1.5 w-1 h-1 rotate-45 ${colors[type]}`} />
      <p className="font-sans font-black text-[9px] text-text-muted uppercase tracking-[0.2em]">{title}</p>
      <p className="font-sans text-[9px] font-bold text-[#333] mt-1 uppercase tracking-widest">{time}</p>
    </div>
  );
}

