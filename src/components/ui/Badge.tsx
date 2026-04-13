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
  'healthy': { color: 'bg-primary/10 border-primary/20 text-accent-light', icon: CheckCircle2 },
  'at-risk': { color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500', icon: AlertTriangle },
  'critical': { color: 'bg-red-500/10 border-red-500/20 text-red-500', icon: XCircle },
  // Sprints
  'active sprint': { color: 'bg-primary/10 border-primary/20 text-accent-light', icon: Activity },
  'active': { color: 'bg-primary/10 border-primary/20 text-accent-light', icon: Activity },
  // Content / Tasks
  'waitlist': { color: 'bg-white/5 border-white/10 text-text-muted', icon: Clock },
  'drafting': { color: 'bg-sky-500/10 border-sky-500/20 text-sky-400', icon: CircleDashed },
  'production': { color: 'bg-blue-500/10 border-blue-500/20 text-blue-400', icon: PlayCircle },
  'review': { color: 'bg-purple-500/10 border-purple-500/20 text-purple-400', icon: Eye },
  'deployed': { color: 'bg-primary/10 border-primary/20 text-accent-light', icon: Send },
  // PostStage statuses
  'planned': { color: 'bg-white/5 border-white/10 text-text-muted', icon: CalendarClock },
  'brief written': { color: 'bg-sky-500/10 border-sky-500/20 text-sky-400', icon: CheckSquare },
  'in production': { color: 'bg-blue-500/10 border-blue-500/20 text-blue-400', icon: PlayCircle },
  'ceo approval': { color: 'bg-orange-500/10 border-orange-500/20 text-orange-400', icon: ShieldCheck },
  'client approval': { color: 'bg-amber-500/10 border-amber-500/20 text-amber-400', icon: ShieldCheck },
  'scheduled': { color: 'bg-purple-500/10 border-purple-500/20 text-purple-400', icon: CalendarClock },
  'published': { color: 'bg-primary/10 border-primary/20 text-accent-light', icon: CheckCircle2 },
};

export function Badge({ status = 'default', variant, className = '', children, showIcon = true }: BadgeProps) {
  const normStatus = status.toLowerCase();
  const config = statusConfig[normStatus] || { color: 'bg-white/5 border-white/10 text-text-muted', icon: null };
  const Icon = config.icon;

  return (
    <span className={`font-sans text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 border rounded-none inline-flex items-center gap-1.5 transition-colors ${config.color} ${className}`}>
      {showIcon && Icon && <Icon size={10} strokeWidth={2.5} />}
      <span>{children || status}</span>
    </span>
  );
}

