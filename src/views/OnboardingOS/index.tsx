import { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Search, ChevronRight, Activity, Clock, Users, Shield, Rocket, Plus, AlertCircle } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { OnboardingProtocol } from '../../utils/storage';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../../components/ui/Button';
import OnboardingDetailView from './OnboardingDetailView';

export default function OnboardingOS({ onNavigate }: { onNavigate?: (view: string, id?: string) => void }) {
    const { data } = useAppData();
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProtocol, setSelectedProtocol] = useState<OnboardingProtocol | null>(null);

    // Recompute protocols from live data
    const protocols = useMemo(() => data.onboardings.map(p => {
        // Recompute from live data in case steps changed
        const freshProtocol = data.onboardings.find(o => o.id === p.id);
        return freshProtocol || p;
    }), [data.onboardings]);

    // Filter logic
    const filteredProtocols = useMemo(() => protocols.filter(protocol => {
        const client = data.clients.find(c => c.id === protocol.clientId);
        if (!client) return false;
        if (filter !== 'ALL' && !client.tier.toUpperCase().includes(filter)) return false;
        if (searchQuery && !client.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    }), [protocols, data.clients, filter, searchQuery]);

    const stats = useMemo(() => {
        const activeCount = protocols.length;
        const blockedCount = protocols.filter(o => o.status === 'blocked').length;
        const nearComplete = protocols.filter(o => o.progress >= 8 && o.progress < 10).length;
        const completedCount = protocols.filter(o => o.progress === 10).length;

        const avgVelocity = protocols.length > 0
            ? (protocols.reduce((acc, p) => acc + p.progress, 0) / protocols.length * 0.8).toFixed(1)
            : '0.0';

        return { activeCount, blockedCount, nearComplete, completedCount, avgVelocity };
    }, [protocols]);

    // If a protocol is selected, show the detail view
    if (selectedProtocol) {
        const liveProtocol = data.onboardings.find(o => o.id === selectedProtocol.id);
        if (liveProtocol) {
            return (
                <OnboardingDetailView
                    protocol={liveProtocol}
                    onBack={() => setSelectedProtocol(null)}
                    onNavigate={onNavigate}
                />
            );
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-12 min-h-full flex flex-col"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline flex-shrink-0 gap-2">
                <h2 className="font-heading text-2xl md:text-4xl font-black tracking-[-0.05em] text-text-primary uppercase italic">
                    Onboarding OS
                </h2>
                <div className="flex gap-4 font-mono text-[9px] tracking-widest text-text-muted">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>AVG VELOCITY: {stats.avgVelocity} DAYS</span>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 flex-shrink-0">
                <StatsCard label="Active Protocols" count={stats.activeCount} />
                <StatsCard label="Blockers Detected" count={stats.blockedCount} status={stats.blockedCount > 0 ? "risk" : ""} />
                <StatsCard label="Projected Deployed" count={stats.nearComplete} />
                <StatsCard label="Completed" count={stats.completedCount} status={stats.completedCount > 0 ? "success" : ""} />
            </div>

            {/* Main Board */}
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
                {/* System Banner */}
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-sm flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <AlertCircle size={20} className="text-primary" />
                        </div>
                        <div>
                            <h5 className="text-xs font-mono font-bold text-text-primary uppercase tracking-widest">Protocol Generation Logic</h5>
                            <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">
                                protocols are exclusively generated for <span className="text-primary">active sprint</span> & <span className="text-primary">retainer</span> tiers. lead/discovery stages are excluded.
                            </p>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-2">
                        <div className="px-2 py-1 bg-background border border-border-dark font-mono text-[8px] text-text-muted rounded-sm">
                            AUTO-SYNC: ENABLED
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 flex-shrink-0">
                    <div className="flex bg-card p-1  rounded-sm overflow-x-auto scroll-touch">
                        {['ALL', 'INCUBATOR', 'GROWTH', 'ENTERPRISE'].map(t => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-4 py-1.5 font-heading font-black text-[9px] tracking-widest uppercase transition-all ${filter === t ? 'bg-primary text-text-primary rounded-[1px]' : 'text-text-muted hover:text-text-secondary'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <div className="relative flex-1 sm:flex-none">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder="SEARCH PROTOCOLS..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-card  pl-10 pr-4 py-2 font-mono text-[9px] tracking-widest text-text-primary w-full sm:w-64 focus:border-primary focus:outline-none"
                        />
                    </div>
                </div>

                <Card className="flex-1 overflow-hidden border-border-dark bg-card flex flex-col">
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        {filteredProtocols.length === 0 ? (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center h-full py-24 px-8">
                                <div className="w-16 h-16 rounded-full bg-card-alt  flex items-center justify-center mb-6">
                                    <Rocket size={28} className="text-text-muted/40" />
                                </div>
                                <p className="font-mono text-sm text-text-muted tracking-widest uppercase mb-2">
                                    [ NO ONBOARDING PROTOCOLS FOUND ]
                                </p>
                                <p className="text-sm text-text-muted/60 text-center max-w-md mb-6">
                                    {searchQuery
                                        ? `No protocols match "${searchQuery}". Try a different search.`
                                        : 'Onboarding protocols are automatically created when a client status changes to "Active Sprint" in Client OS.'
                                    }
                                </p>
                                {!searchQuery && (
                                    <Button
                                        onClick={() => onNavigate?.('client')}
                                        className="mt-2 text-xs"
                                    >
                                        <Plus size={16} className="mr-2" />
                                        GO TO CLIENT OS TO INITIALIZE
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* ===== MOBILE CARD LIST ===== */}
                                <div className="md:hidden divide-y divide-border-dark">
                                    {filteredProtocols.map(protocol => {
                                        const client = data.clients.find(c => c.id === protocol.clientId);
                                        if (!client) return null;
                                        const nextStep = protocol.steps.find(s => !s.completed);
                                        const currentPhase = nextStep ? nextStep.label : '✓ Deployed';
                                        const isComplete = protocol.progress === 10;
                                        return (
                                            <div
                                                key={protocol.id}
                                                className="p-4 active:bg-card-alt/30 transition-colors cursor-pointer"
                                                onClick={() => setSelectedProtocol(protocol)}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isComplete ? 'bg-primary' : protocol.status === 'blocked' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                                            <span className="font-heading font-bold text-[13px] text-text-primary uppercase tracking-tight truncate">{client.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-4 mb-2">
                                                            <Badge status="default" variant="outline" className="border-border-dark text-[9px]">{client.tier.split(':')[0]}</Badge>
                                                            <span className="font-mono text-[9px] text-text-muted uppercase">{currentPhase}</span>
                                                        </div>
                                                        {/* Progress bar */}
                                                        <div className="flex gap-0.5 h-1 ml-4">
                                                            {[...Array(10)].map((_, i) => (
                                                                <div key={i} className={`flex-1 rounded-[1px] ${i < protocol.progress ? 'bg-primary' : 'bg-border-dark'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={18} className="text-text-muted flex-shrink-0 mt-1" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* ===== DESKTOP TABLE ===== */}
                                <table className="hidden md:table w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-card-alt border-b border-border-dark z-10">
                                        <tr className="font-heading font-black text-[9px] text-text-muted uppercase tracking-[0.2em]">
                                            <th className="p-6">Client Identity</th>
                                            <th className="p-6">Revenue Tier</th>
                                            <th className="p-6">Protocol Progress</th>
                                            <th className="p-6">Current Milestone</th>
                                            <th className="p-6">Ownership</th>
                                            <th className="p-6">Pulse</th>
                                            <th className="p-6 text-right">Access</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-dark">
                                        {filteredProtocols.map(protocol => {
                                            const client = data.clients.find(c => c.id === protocol.clientId);
                                            if (!client) return null;

                                            const nextStep = protocol.steps.find(s => !s.completed);
                                            const currentPhase = nextStep ? nextStep.label : '✓ Deployed';
                                            const timeAgo = formatDistanceToNow(new Date(protocol.lastUpdated), { addSuffix: true });
                                            const isComplete = protocol.progress === 10;
                                            const nextOwner = nextStep?.owner || '—';

                                            return (
                                                <tr
                                                    key={protocol.id}
                                                    className="hover:bg-card-alt/30 transition-colors group cursor-pointer"
                                                    onClick={() => setSelectedProtocol(protocol)}
                                                >
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-primary' : protocol.status === 'blocked' ? 'bg-red-500' : 'bg-yellow-500'
                                                                }`} />
                                                            <div>
                                                                <span className="font-heading font-bold text-sm text-text-primary uppercase tracking-tight">{client.name}</span>
                                                                <p className="font-mono text-[9px] text-text-muted mt-0.5">{client.niche}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <Badge status="default" variant="outline" className="border-border-dark text-[9px] tracking-widest">{client.tier.split(':')[0]}</Badge>
                                                    </td>
                                                    <td className="p-6 w-[300px]">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center font-mono text-[9px] text-text-muted uppercase tracking-widest">
                                                                <span>Step {protocol.progress}/10</span>
                                                                <span className={isComplete ? 'text-primary' : ''}>{protocol.progress * 10}%</span>
                                                            </div>
                                                            <div className="flex gap-1 h-1.5">
                                                                {[...Array(10)].map((_, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`flex-1 rounded-[1px] transition-all ${i < protocol.progress
                                                                            ? 'bg-primary shadow-[0_0_5px_rgba(63,106,36,0.3)]'
                                                                            : i === protocol.progress
                                                                                ? 'bg-primary/30'
                                                                                : 'bg-border-dark'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-2 text-text-secondary">
                                                            <Activity size={12} className={isComplete ? 'text-primary' : 'text-yellow-500'} />
                                                            <span className={`font-sans text-[11px] font-bold uppercase tracking-wide truncate max-w-[180px] ${isComplete ? 'text-primary' : ''}`}>
                                                                {currentPhase}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className={`flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest ${nextOwner === 'CEO' ? 'text-yellow-500' : 'text-text-muted'
                                                            }`}>
                                                            {nextOwner === 'CEO' ? <Shield size={10} /> : nextOwner !== '—' ? <Users size={10} /> : null}
                                                            {nextOwner}
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={12} className="text-text-muted" />
                                                            <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">{timeAgo}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <button className="text-text-muted group-hover:text-primary transition-colors">
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                </Card>
            </div>

            {/* System Legend */}
            <div className="flex gap-8 pt-2 border-t border-border-dark/30 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-mono text-[8px] text-text-muted tracking-widest uppercase">Complete</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="font-mono text-[8px] text-text-muted tracking-widest uppercase">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-mono text-[8px] text-text-muted tracking-widest uppercase">Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                    <Shield size={10} className="text-yellow-500" />
                    <span className="font-mono text-[8px] text-text-muted tracking-widest uppercase">CEO Gate Step</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users size={10} className="text-text-muted" />
                    <span className="font-mono text-[8px] text-text-muted tracking-widest uppercase">Team Step</span>
                </div>
            </div>
        </motion.div>
    );
}

function StatsCardBase({ label, count, status }: { label: string, count: string | number, status?: string }) {
    return (
        <Card className="p-6 border-border-dark bg-card-alt/50 flex flex-col gap-2 relative overflow-hidden group">
            <span className="font-heading font-black text-[9px] text-text-muted tracking-widest uppercase">{label}</span>
            <span className={`font-mono text-3xl font-black ${status === 'risk' ? 'text-red-500'
                : status === 'success' ? 'text-primary'
                    : 'text-text-primary'
                }`}>
                {typeof count === 'number' ? count.toString().padStart(2, '0') : count}
            </span>
            <div className={`absolute top-0 right-0 w-1 h-full ${status === 'risk' ? 'bg-red-500'
                : status === 'success' ? 'bg-primary'
                    : 'bg-primary'
                } opacity-50 group-hover:opacity-100 transition-opacity`} />
        </Card>
    );
}

const StatsCard = memo(StatsCardBase);
