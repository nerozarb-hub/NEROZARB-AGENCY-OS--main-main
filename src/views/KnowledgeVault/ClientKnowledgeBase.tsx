import React, { useState } from 'react';
import { Shield, Target, TrendingUp, Search, Clock, Link as LinkIcon, FileText } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { Button } from '../../components/ui/Button';

type TabId = 'brand-voice' | 'audience' | 'what-works' | 'research' | 'history' | 'assets';

const TABS: { id: TabId, label: string, icon: React.ReactNode }[] = [
    { id: 'audience', label: 'Audience Map', icon: <Target className="w-4 h-4" /> },
    { id: 'brand-voice', label: 'Brand Voice', icon: <Shield className="w-4 h-4" /> },
    { id: 'what-works', label: 'What Works', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'research', label: 'Research', icon: <Search className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
    { id: 'assets', label: 'Assets', icon: <LinkIcon className="w-4 h-4" /> }
];

export function ClientKnowledgeBase({ clientId }: { clientId: number }) {
    const { data } = useAppData();
    const client = data.clients.find(c => c.id === clientId);
    const [activeTab, setActiveTab] = useState<TabId>('audience');

    if (!client) {
        return (
            <div className="h-full flex items-center justify-center text-text-muted font-mono uppercase tracking-widest text-sm">
                Client profile not found.
            </div>
        );
    }

    const brandProtocols = data.protocols.filter(p => p.linkedClientId === clientId && p.category === 'brand-standard');
    const researchProtocols = data.protocols.filter(p => p.linkedClientId === clientId && p.category === 'client-knowledge-base');

    const renderContent = () => {
        switch (activeTab) {
            case 'audience':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <h3 className="font-heading text-lg text-primary uppercase tracking-wider border-b border-border-dark pb-2 mb-4">Shadow Avatar</h3>
                            <div className="bg-card p-6  rounded-sm">
                                <p className="text-sm font-mono leading-relaxed text-text-primary whitespace-pre-wrap">
                                    {client.shadowAvatar || 'No shadow avatar defined.'}
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-heading text-lg text-[#F24E1E] uppercase tracking-wider border-b border-border-dark pb-2 mb-4">Bleeding Neck Problem</h3>
                            <div className="bg-card p-6  rounded-sm">
                                <p className="text-sm font-mono leading-relaxed text-text-primary whitespace-pre-wrap">
                                    {client.bleedingNeck || 'No bleeding neck problem defined.'}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'brand-voice':
                return (
                    <div className="space-y-6 animate-fade-in">
                        {brandProtocols.length === 0 ? (
                            <div className="text-center p-12 border border-dashed border-border-dark rounded-sm text-text-muted">
                                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="font-mono text-sm uppercase tracking-widest">No brand protocols linked to this client.</p>
                            </div>
                        ) : (
                            brandProtocols.map(p => (
                                <div key={p.id} className="bg-card  rounded-sm overflow-hidden">
                                    <div className="p-4 bg-black/40 border-b border-border-dark">
                                        <h3 className="font-heading text-lg text-text-primary uppercase">{p.title}</h3>
                                    </div>
                                    <div className="p-6">
                                        <pre className="font-mono text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{p.content}</pre>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );
            case 'what-works':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card p-4  rounded-sm">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Top Format</div>
                                <div className="font-heading text-xl text-primary">Carousel / Slider</div>
                            </div>
                            <div className="bg-card p-4  rounded-sm">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Peak Engagement Time</div>
                                <div className="font-heading text-xl text-primary">8:00 PM EST</div>
                            </div>
                            <div className="bg-card p-4  rounded-sm">
                                <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Best Performing Hook</div>
                                <div className="font-heading text-xl text-primary">"The hidden reason..."</div>
                            </div>
                        </div>
                        <div className="text-center p-12 border border-dashed border-border-dark rounded-sm text-text-muted mt-6">
                            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="font-mono text-sm uppercase tracking-widest mb-2">Performance Logs Awaiting Integration</p>
                            <p className="text-xs">Aggregated Save/Share metrics from Content OS will appear here.</p>
                        </div>
                    </div>
                );
            case 'research':
                return (
                    <div className="space-y-4 animate-fade-in">
                        {researchProtocols.length === 0 ? (
                            <div className="text-center p-12 border border-dashed border-border-dark rounded-sm text-text-muted">
                                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="font-mono text-sm uppercase tracking-widest">No manual research logs found.</p>
                            </div>
                        ) : (
                            researchProtocols.map(p => (
                                <div key={p.id} className="bg-card  rounded-sm p-4 flex gap-4">
                                    <div className="mt-1"><FileText className="w-5 h-5 text-primary" /></div>
                                    <div>
                                        <h4 className="font-mono text-sm uppercase tracking-wider text-text-primary font-bold mb-2">{p.title}</h4>
                                        <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">{p.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );
            case 'history':
                return (
                    <div className="space-y-4 animate-fade-in pl-4">
                        {client.timeline.length === 0 ? (
                            <div className="text-text-muted font-mono text-xs uppercase tracking-widest">No historical items.</div>
                        ) : (
                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-dark before:to-transparent">
                                {client.timeline.map((event, index) => (
                                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full  bg-[#0A0A0A] group-[.is-active]:bg-primary/10 group-[.is-active]:border-primary/50 text-text-muted group-[.is-active]:text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card  p-4 rounded-sm shadow">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="font-mono text-xs text-text-secondary">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            </div>
                                            <div className="font-mono text-sm text-text-primary">{event.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'assets':
                return (
                    <div className="animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-card  p-4 rounded-sm flex items-center justify-between group cursor-pointer hover:border-border-dark/80 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-sm"><LinkIcon className="w-4 h-4 text-text-secondary" /></div>
                                    <div>
                                        <div className="font-mono text-xs uppercase tracking-wider text-text-primary">Master Brand Folder</div>
                                        <div className="font-mono text-[10px] text-text-muted mt-1">Google Drive</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Open</Button>
                            </div>
                            <div className="bg-card  p-4 rounded-sm flex items-center justify-between group cursor-pointer hover:border-border-dark/80 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-sm"><LinkIcon className="w-4 h-4 text-text-secondary" /></div>
                                    <div>
                                        <div className="font-mono text-xs uppercase tracking-wider text-text-primary">Figma UI Kit</div>
                                        <div className="font-mono text-[10px] text-text-muted mt-1">Figma</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Open</Button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            {/* Inner Tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto custom-scrollbar pb-2">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-primary/10 text-primary border border-primary/50'
                            : 'bg-card  text-text-secondary hover:text-text-primary hover:border-text-secondary'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                {renderContent()}
            </div>
        </div>
    );
}
