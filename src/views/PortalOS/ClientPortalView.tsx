import { useEffect, useState } from 'react';
import { loadData, Client, ProjectPhase, ClientUpdate } from '../../utils/storage';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Circle, Clock, MessageSquare, Layout } from 'lucide-react';

// Check if Supabase is actually configured (not placeholder)
const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return Boolean(url && key && url !== 'https://placeholder-project.supabase.co');
};

export default function ClientPortalView({ token }: { token: string }) {
    const [client, setClient] = useState<Partial<Client> | null>(null);
    const [phases, setPhases] = useState<ProjectPhase[]>([]);
    const [updates, setUpdates] = useState<ClientUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadPortalData() {
            try {
                setLoading(true);

                // --- Strategy 1: Try localStorage first (always available) ---
                const localData = loadData();
                const localClient = localData.clients.find(c => c.magicLinkToken === token);

                if (localClient) {
                    setClient(localClient);
                    setPhases(localClient.projectPhases || []);
                    setUpdates(localClient.clientUpdates || []);
                    setLoading(false);
                    return; // Found locally, done!
                }

                // --- Strategy 2: Fall back to Supabase if configured ---
                if (isSupabaseConfigured()) {
                    const { data: clientData, error: clientErr } = await supabase
                        .from('clients')
                        .select('*')
                        .eq('magic_link_token', token)
                        .single();

                    if (clientErr || !clientData) {
                        throw new Error('Invalid or expired magic link.');
                    }

                    setClient({
                        id: clientData.id,
                        name: clientData.name,
                        email: clientData.email,
                        niche: clientData.niche,
                        magicLinkToken: clientData.magic_link_token,
                    } as Partial<Client>);

                    // Fetch project phases
                    const { data: phasesData } = await supabase
                        .from('project_phases')
                        .select('*')
                        .eq('client_id', clientData.id)
                        .order('order_index', { ascending: true });

                    if (phasesData) setPhases(phasesData.map(p => ({
                        ...p,
                        clientId: p.client_id,
                        orderIndex: p.order_index,
                        createdAt: p.created_at,
                        updatedAt: p.updated_at
                    })) as ProjectPhase[]);

                    // Fetch client updates
                    const { data: updatesData } = await supabase
                        .from('client_updates')
                        .select('*')
                        .eq('client_id', clientData.id)
                        .order('created_at', { ascending: false });

                    if (updatesData) setUpdates(updatesData.map(u => ({
                        ...u,
                        clientId: u.client_id,
                        createdAt: u.created_at
                    })) as ClientUpdate[]);

                    setLoading(false);
                    return;
                }

                // Neither source found the token
                throw new Error('Invalid or expired magic link.');

            } catch (err: any) {
                setError(err.message || 'Failed to load portal');
            } finally {
                setLoading(false);
            }
        }

        if (token) {
            loadPortalData();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
                <div className="text-white/50 text-sm font-mono animate-pulse tracking-widest">LOADING PORTAL...</div>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-6 text-center">
                <Layout className="w-12 h-12 text-red-500 mb-4 opacity-50" />
                <h1 className="text-xl text-text-primary font-heading font-black tracking-tight mb-2">Access Denied</h1>
                <p className="text-text-secondary text-sm max-w-sm">{error || 'Invalid or expired magic link. Please contact your agency for a new link.'}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090B] text-text-primary font-sans">
            {/* Header */}
            <header className="border-b border-border-dark bg-surface/30 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs border border-primary/30">
                            {client.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <h1 className="font-heading font-black text-sm tracking-tight">{client.name}</h1>
                            <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Client Portal</p>
                        </div>
                    </div>
                    <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        LIVE SYNC
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Timeline (Left Column) */}
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-lg font-heading font-black tracking-tight mb-6 flex items-center gap-2">
                            <Clock className="text-primary" size={20} /> Project Timeline
                        </h2>

                        {phases.length === 0 ? (
                            <div className="p-8 border border-dashed border-border-dark rounded-sm text-center text-text-muted text-sm">
                                No project timeline has been established yet. Check back soon.
                            </div>
                        ) : (
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-dark before:to-transparent">
                                {phases.map((phase, idx) => (
                                    <div key={phase.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        {/* Icon indicator */}
                                        <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10
                      ${phase.status === 'completed' ? 'bg-primary border-primary text-[#09090B]' :
                                                phase.status === 'in_progress' ? 'bg-[#09090B] border-primary text-primary' :
                                                    'bg-[#09090B] border-border-dark text-text-muted'}`}
                                        >
                                            {phase.status === 'completed' ? <CheckCircle2 size={12} /> :
                                                phase.status === 'in_progress' ? <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> :
                                                    <Circle size={10} />}
                                        </div>
                                        {/* Content */}
                                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-sm border border-border-dark bg-surface shadow-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-xs font-mono uppercase tracking-widest ${phase.status === 'completed' ? 'text-primary' :
                                                        phase.status === 'in_progress' ? 'text-text-primary' : 'text-text-muted'
                                                    }`}>
                                                    Phase {idx + 1}
                                                </span>
                                                <span className="text-[10px] text-text-muted">
                                                    {phase.status === 'completed' ? 'Done' :
                                                        phase.status === 'in_progress' ? 'Active' : 'Upcoming'}
                                                </span>
                                            </div>
                                            <h3 className={`font-semibold text-sm ${phase.status === 'pending' ? 'text-text-secondary' : 'text-text-primary'}`}>
                                                {phase.title}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Updates Feed (Right Column) */}
                <div className="space-y-6">
                    <h2 className="text-lg font-heading font-black tracking-tight mb-6 flex items-center gap-2">
                        <MessageSquare className="text-accent-light" size={20} /> Live Updates
                    </h2>

                    {updates.length === 0 ? (
                        <div className="p-6 border border-dashed border-border-dark rounded-sm text-center text-text-muted text-sm">
                            No recent update broadcasts.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {updates.map(update => (
                                <div key={update.id} className="p-4 bg-surface border border-border-dark rounded-sm relative">
                                    <div className="absolute -left-1.5 top-5 w-3 h-3 bg-[#09090B] border border-border-dark rotate-45" />
                                    <div className="text-[10px] text-text-muted font-mono tracking-widest uppercase mb-2">
                                        {new Date(update.createdAt || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                                        {update.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
