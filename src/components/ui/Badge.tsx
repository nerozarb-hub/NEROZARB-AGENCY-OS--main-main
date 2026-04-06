import React, { ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Activity, Clock, PlayCircle, Eye, ShieldCheck, CheckSquare, Send, CalendarClock, CircleDashed } from 'lucide-react';

export type BadgeStatus = 'healthy' | 'at-risk' | 'critical' | 'active' | 'deployed' | 'review' | 'waitlist' | string;

interface BadgeProps {
  status?: BadgeStatus;
  variant?: string;
  className?: string;
  children?: ReactNode;
  showIcon?: boolean;
}

const statusConfig: Record<string, { color: string, icon: React.FC<any> | null }> = {
  // Health
  'healthy': { color: 'bg-[#3F6A24]/10 border-[#3F6A24]/30 text-[#A8C69F]', icon: CheckCircle2 },
  'at-risk': { color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500', icon: AlertTriangle },
  'critical': { color: 'bg-red-500/10 border-red-500/30 text-red-500', icon: XCircle },
  // Sprints
  'active sprint': { color: 'bg-[#3F6A24]/10 border-[#3F6A24]/30 text-[#A8C69F]', icon: Activity },
  'active': { color: 'bg-[#3F6A24]/10 border-[#3F6A24]/30 text-[#A8C69F]', icon: Activity },
  // Content / Tasks
  'waitlist': { color: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400', icon: Clock },
  'drafting': { color: 'bg-sky-500/10 border-sky-500/30 text-sky-400', icon: CircleDashed },
  'production': { color: 'bg-blue-500/10 border-blue-500/30 text-blue-400', icon: PlayCircle },
  'review': { color: 'bg-purple-500/10 border-purple-500/30 text-purple-400', icon: Eye },
  'deployed': { color: 'bg-[#3F6A24]/10 border-[#3F6A24]/30 text-[#A8C69F]', icon: Send },
  // PostStage statuses
  'planned': { color: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400', icon: CalendarClock },
  'brief written': { color: 'bg-sky-500/10 border-sky-500/30 text-sky-400', icon: CheckSquare },
  'in production': { color: 'bg-blue-500/10 border-blue-500/30 text-blue-400', icon: PlayCircle },
  'ceo approval': { color: 'bg-orange-500/10 border-orange-500/30 text-orange-400', icon: ShieldCheck },
  'client approval': { color: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: ShieldCheck },
  'scheduled': { color: 'bg-purple-500/10 border-purple-500/30 text-purple-400', icon: CalendarClock },
  'published': { color: 'bg-green-500/10 border-green-500/30 text-green-400', icon: CheckCircle2 },
};

export function Badge({ status = 'default', variant, className = '', children, showIcon = true }: BadgeProps) {
  const normStatus = status.toLowerCase();
  const config = statusConfig[normStatus] || { color: 'bg-card-alt border-border-dark text-text-secondary', icon: null };
  const Icon = config.icon;

  return (
    <span className={`font-mono text-[11px] font-medium px-2 py-0.5 border rounded-sm inline-flex items-center gap-1.5 ${config.color} ${className}`}>
      {showIcon && Icon && <Icon size={12} />}
      <span>{children || status}</span>
    </span>
  );
}
