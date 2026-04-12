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
            <div className="h-full flex items-center justify-center text-[#333] font-sans font-black uppercase tracking-[0.3em] text-[10px]">
                Profile Error: Intelligence Sync Failed
            </div>
        );
    }


    const brandProtocols = data.protocols.filter(p => p.linkedClientId === clientId && p.category === 'brand-standard');
    const researchProtocols = data.protocols.filter(p => p.linkedClientId === clientId && p.category === 'client-knowledge-base');

    const renderContent = () => {
        switch (activeTab) {
            case 'audience':
                return (
                    <div className="space-y-10 animate-fade-in">
                        <div>
                            <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-primary uppercase border-b border-white/[0.04] pb-5 italic mb-6">Subject Shadow Avatar</h3>
                            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-none">
                                <p className="font-sans text-[13px] text-[#888] leading-relaxed tracking-wide whitespace-pre-wrap uppercase">
                                    {client.shadowAvatar || 'SYSTEM ERROR: AVATAR_NOT_FOUND.'}
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-red-500 uppercase border-b border-white/[0.04] pb-5 italic mb-6">P0: Bleeding Neck Conflict</h3>
                            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-none">
                                <p className="font-sans text-[13px] text-[#888] leading-relaxed tracking-wide whitespace-pre-wrap uppercase">
                                    {client.bleedingNeck || 'SYSTEM ERROR: CONFLICT_NOT_RESOLVED.'}
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'brand-voice':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {brandProtocols.length === 0 ? (
                            <div className="text-center py-24 border border-dashed border-white/5 rounded-none text-[#333]">
                                <Shield className="w-10 h-10 mx-auto mb-6 opacity-20" />
                                <p className="font-sans text-[9px] font-black uppercase tracking-[0.3em]">No brand protocols localized.</p>
                            </div>
                        ) : (
                            brandProtocols.map(p => (
                                <div key={p.id} className="bg-white/[0.01] border border-white/5 rounded-none overflow-hidden hover:border-white/10 transition-all duration-300">
                                    <div className="px-8 py-5 bg-white/[0.02] border-b border-white/5">
                                        <h3 className="font-sans text-[11px] font-black text-text-primary uppercase tracking-widest">{p.title}</h3>
                                    </div>
                                    <div className="p-8">
                                        <pre className="font-sans text-[12px] text-[#888] leading-relaxed tracking-wide whitespace-pre-wrap uppercase">{p.content}</pre>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );

            case 'what-works':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/[0.01] border border-white/5 p-6 rounded-none">
                                <div className="text-[8px] font-black font-sans uppercase tracking-[0.3em] text-[#444] mb-3 italic">Alpha Format</div>
                                <div className="font-sans text-xs font-bold text-primary tracking-widest uppercase italic">Carousel / Flux</div>
                            </div>
                            <div className="bg-white/[0.01] border border-white/5 p-6 rounded-none">
                                <div className="text-[8px] font-black font-sans uppercase tracking-[0.3em] text-[#444] mb-3 italic">Temporal Node</div>
                                <div className="font-sans text-xs font-bold text-primary tracking-widest uppercase italic">20:00 EST</div>
                            </div>
                            <div className="bg-white/[0.01] border border-white/5 p-6 rounded-none">
                                <div className="text-[8px] font-black font-sans uppercase tracking-[0.3em] text-[#444] mb-3 italic">Apex Hook</div>
                                <div className="font-sans text-xs font-bold text-primary tracking-widest uppercase italic">"THE SECRET STREAM..."</div>
                            </div>
                        </div>
                        <div className="text-center py-24 border border-dashed border-white/5 rounded-none text-[#333] mt-10">
                            <TrendingUp className="w-10 h-10 mx-auto mb-6 opacity-20" />
                            <p className="font-sans text-[9px] font-black uppercase tracking-[0.3em] mb-3">Neural Logs Syncing...</p>
                            <p className="font-sans text-[8px] tracking-widest uppercase opacity-40">Dynamic metrics from CONTENT OS pending deployment.</p>
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
                    <div className="space-y-10 animate-fade-in pl-6 relative">
                        {client.timeline.length === 0 ? (
                            <div className="font-sans text-[9px] font-black uppercase tracking-[0.3em] text-[#333]">No historical stream found.</div>
                        ) : (
                            <div className="space-y-12 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-white/[0.04]">
                                {client.timeline.map((event, index) => (
                                    <div key={index} className="relative pl-10 group">
                                        <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rotate-45 border border-white/20 bg-[#0C0F14] group-hover:bg-primary group-hover:border-primary transition-all duration-500" />
                                        <div className="space-y-3">
                                            <div className="font-sans text-[8px] font-black text-[#444] uppercase tracking-widest italic">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
                                            <div className="font-sans text-[11px] font-bold text-text-primary uppercase tracking-widest leading-relaxed">{event.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'assets':
                return (
                    <div className="animate-fade-in space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/[0.01] border border-white/5 p-6 rounded-none flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-white/[0.02] border border-white/5"><LinkIcon className="w-3.5 h-3.5 text-[#444] group-hover:text-primary transition-colors" /></div>
                                    <div className="space-y-1">
                                        <div className="font-sans text-[10px] font-black uppercase tracking-widest text-text-primary">Master Brand Archive</div>
                                        <div className="font-sans text-[8px] font-black text-[#333] tracking-widest uppercase italic">Internal Node / Drive</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity font-sans text-[8px] font-black uppercase tracking-widest text-primary">SCAN</Button>
                            </div>
                            <div className="bg-white/[0.01] border border-white/5 p-6 rounded-none flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-white/[0.02] border border-white/5"><LinkIcon className="w-3.5 h-3.5 text-[#444] group-hover:text-primary transition-colors" /></div>
                                    <div className="space-y-1">
                                        <div className="font-sans text-[10px] font-black uppercase tracking-widest text-text-primary">Operational Map (Figma)</div>
                                        <div className="font-sans text-[8px] font-black text-[#333] tracking-widest uppercase italic">Visual Sync / Canvas</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity font-sans text-[8px] font-black uppercase tracking-widest text-primary">SCAN</Button>
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
            <div className="flex space-x-3 mb-10 overflow-x-auto custom-scrollbar pb-3">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-none text-[9px] font-black font-sans uppercase tracking-[0.2em] transition-all border whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-primary/5 text-primary border-primary/20'
                            : 'bg-white/[0.01] border-white/5 text-[#555] hover:text-[#888] hover:border-white/10'
                            }`}
                    >
                        <div className="opacity-40">{tab.icon}</div>
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
