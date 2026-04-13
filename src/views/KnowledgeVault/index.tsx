import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, Plus, BookOpen, TerminalSquare, Users, FileText, LayoutGrid, List as ListIcon, Cpu, ScrollText, Building2 } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { ProtocolCategory, PillarType, Protocol } from '../../utils/storage';
import { ProtocolCard } from './ProtocolCard';
import { AiPromptCard } from './AiPromptCard';
import { ProtocolEditorModal } from './ProtocolEditorModal';
import { PromptDetailModal } from './PromptDetailModal';
import { ClientKnowledgeBase } from './ClientKnowledgeBase';

type ViewMode = 'grid' | 'list';

const CATEGORIES: { id: ProtocolCategory | 'all', label: string, icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Knowledge', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'sop', label: 'SOPs', icon: <FileText className="w-4 h-4" /> },
    { id: 'ai-prompt', label: 'AI Prompts', icon: <TerminalSquare className="w-4 h-4" /> },
    { id: 'client-knowledge-base', label: 'Client Knowledge', icon: <Users className="w-4 h-4" /> },
    { id: 'brand-standard', label: 'Brand Standards', icon: <BookOpen className="w-4 h-4" /> },
];

const PILLARS: PillarType[] = [
    'Market Truth', 'Psychological Warfare', 'Conversion Mechanic', 'Viral Engine', 'Growth Math', 'Operations', 'Client Management'
];

export default function KnowledgeVault({ selectedClient }: { selectedClient?: string | null }) {
    const { data, recordPromptUsage, addProtocol, showToast } = useAppData();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<ProtocolCategory | 'all'>(selectedClient ? 'client-knowledge-base' : 'all');
    const [activePillar, setActivePillar] = useState<PillarType | 'all'>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editProtocol, setEditProtocol] = useState<Protocol | undefined>(undefined);

    // Status filter
    const [activeStatus, setActiveStatus] = useState<'all' | 'active' | 'draft' | 'archived'>('all');

    // View Prompt State
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [viewPrompt, setViewPrompt] = useState<Protocol | null>(null);

    // Copy states for Prompts
    const [copiedId, setCopiedId] = useState<number | null>(null);

    // Pagination
    const [visibleCount, setVisibleCount] = useState(12);
    useEffect(() => {
        setVisibleCount(12);
    }, [searchQuery, activeCategory, activePillar, activeStatus, selectedClient]);

    // Tab scroll fade
    const tabScrollRef = useRef<HTMLDivElement>(null);
    const [showTabFade, setShowTabFade] = useState(false);
    useEffect(() => {
        const el = tabScrollRef.current;
        if (!el) return;
        const check = () => setShowTabFade(el.scrollWidth > el.clientWidth && el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
        check();
        el.addEventListener('scroll', check);
        window.addEventListener('resize', check);
        return () => { el.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
    }, []);

    const handleCopyPrompt = (e: React.MouseEvent, id: number, content: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(content);
        recordPromptUsage(id);
        setCopiedId(id);
        showToast('Prompt copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDuplicate = (protocol: Protocol) => {
        const newProtocol = {
            title: `${protocol.title} (Copy)`,
            category: protocol.category,
            pillar: protocol.pillar,
            tags: [...protocol.tags],
            status: protocol.status as any,
            content: protocol.content,
            promptTool: protocol.promptTool,
            promptVariables: [...protocol.promptVariables],
            usageNotes: protocol.usageNotes,
            exampleOutput: protocol.exampleOutput,
            linkedTaskTypes: [...protocol.linkedTaskTypes],
            linkedClientId: protocol.linkedClientId,
            relatedProtocolIds: [...protocol.relatedProtocolIds],
            externalReferences: [...protocol.externalReferences]
        };
        addProtocol(newProtocol);
        showToast('Protocol duplicated successfully');
    };

    // Filter protocols
    const filteredProtocols = data.protocols.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchesPillar = activePillar === 'all' || p.pillar === activePillar;
        const matchesStatus = activeStatus === 'all' || p.status === activeStatus;

        let matchesClient = true;
        if (activeCategory === 'client-knowledge-base' && selectedClient) {
            matchesClient = p.linkedClientId?.toString() === selectedClient;
        }

        return matchesSearch && matchesCategory && matchesPillar && matchesClient && matchesStatus;
    });

    return (
        <div className="page-container h-full flex flex-col animate-fade-in">
            {/* Header */}
            <header className="page-header">
                <div>
                    <h1 className="page-header-title">
                        {selectedClient ? "STRATEGIC INTELLIGENCE" : "KNOWLEDGE VAULT"}
                    </h1>
                    <p className="page-header-subtitle mt-2">
                        {selectedClient ? "CLIENT-SPECIFIC OPERATIONAL PROTOCOLS" : "CENTRAL DEPLOYMENT LOGIC & TACTICAL SOPS"}
                    </p>
                </div>
                <Button 
                    onClick={() => { setEditProtocol(undefined); setIsEditorOpen(true); }} 
                    className="bg-primary hover:bg-accent-mid text-text-primary px-8"
                >
                    <Plus size={16} />
                    <span>+ NEW PROTOCOL</span>
                </Button>
            </header>


            <div className="flex-1 flex flex-col min-h-0">
                {/* Search & Tabs / Controls Area */}
                <div className="page-controls mb-8 flex-col space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-6 w-full">
                        <div className="relative">
                            <div ref={tabScrollRef} className="flex gap-2 p-1.5 bg-white/[0.01] border border-white/[0.08] rounded-none overflow-x-auto scroll-touch no-scrollbar">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-none text-[9px] font-black font-sans uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeCategory === cat.id
                                            ? 'bg-white/5 text-primary'
                                            : 'text-muted-accessible hover:text-[#888] hover:bg-white/[0.02]'
                                            }`}
                                    >
                                        <div className="opacity-40">{cat.icon}</div>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                            {/* Mobile scroll fade indicator */}
                            {showTabFade && (
                                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0C0F14] to-transparent pointer-events-none" />
                            )}
                        </div>


                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 sm:w-80 sm:flex-none">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <Input
                                    className="pl-12 bg-white/[0.01] border-white/[0.08] rounded-none w-full h-12 font-sans text-xs tracking-wide"
                                    placeholder="SCAN REPOSITORY..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex border border-white/[0.08] overflow-hidden bg-white/[0.01] flex-shrink-0">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-3.5 transition-all ${viewMode === 'grid' ? 'bg-white/5 text-primary' : 'text-white/20 hover:text-[#666]'}`}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-3.5 transition-all ${viewMode === 'list' ? 'bg-white/5 text-primary' : 'text-white/20 hover:text-[#666]'}`}
                                >
                                    <ListIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-4 pt-2">
                        <span className="font-sans text-[8px] font-black text-muted-accessible uppercase tracking-widest">Temporal State:</span>
                        <div className="flex gap-2">
                            {(['all', 'active', 'draft', 'archived'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setActiveStatus(s)}
                                    className={`px-4 py-1.5 text-[8px] font-black font-sans uppercase tracking-[0.2em] transition-all border ${activeStatus === s
                                        ? 'bg-primary/10 border-primary/20 text-primary'
                                        : 'bg-transparent border-white/[0.08] text-white/20 hover:text-[#666] hover:border-white/10'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pillar Filters */}
                    <div className="flex items-center gap-4">
                        <span className="font-sans text-[8px] font-black text-muted-accessible uppercase tracking-widest shrink-0">Tactical Pillar:</span>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setActivePillar('all')}
                                className={`px-4 py-1.5 text-[8px] font-black font-sans uppercase tracking-[0.2em] transition-all border ${activePillar === 'all'
                                    ? 'bg-primary/10 border-primary/20 text-primary'
                                    : 'bg-transparent border-white/[0.08] text-white/20 hover:text-[#666] hover:border-white/10'
                                    }`}
                            >
                                ALL_PILLARS
                            </button>
                            {PILLARS.map(pillar => (
                                <button
                                    key={pillar}
                                    onClick={() => setActivePillar(pillar)}
                                    className={`px-4 py-1.5 text-[8px] font-black font-sans uppercase tracking-[0.2em] transition-all border ${activePillar === pillar
                                        ? 'bg-primary/10 border-primary/20 text-primary'
                                        : 'bg-transparent border-white/[0.08] text-white/20 hover:text-[#666] hover:border-white/10'
                                        }`}
                                >
                                    {pillar}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>


                {/* Content Area */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {activeCategory === 'client-knowledge-base' && selectedClient ? (
                        <ClientKnowledgeBase clientId={parseInt(selectedClient, 10)} />
                    ) : filteredProtocols.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-white/20 py-32 border border-white/[0.04] bg-white/[0.01]">
                            <BookOpen className="w-10 h-10 mb-6 opacity-20" />
                            <p className="font-sans font-black uppercase tracking-[0.3em] text-[10px]">
                                {activeCategory === 'ai-prompt' ? 'No AI prompts found'
                                    : activeCategory === 'sop' ? 'No SOPs found'
                                        : activeCategory === 'client-knowledge-base' ? 'No client intelligence found'
                                            : activeCategory === 'brand-standard' ? 'No brand standards found'
                                                : 'No protocols found'}
                            </p>
                            <p className="font-sans text-[8px] font-bold text-white/20 mt-2 tracking-widest uppercase italic">Initialize context or adjust filters.</p>
                            <Button variant="ghost" className="mt-8 font-sans text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-8" onClick={() => { setSearchQuery(''); setActiveCategory('all'); setActivePillar('all'); }}>
                                System Reset
                            </Button>
                        </div>

                    ) : (
                        <div className="flex flex-col h-full">
                            {activeCategory !== 'client-knowledge-base' && (
                                <div className="text-[9px] font-sans font-black text-[#555] mb-6 tracking-[0.2em] uppercase italic">
                                    {filteredProtocols.length} ARCHIVE{filteredProtocols.length !== 1 ? 'S' : ''} DISCOVERED
                                </div>
                            )}

                             <div className={
                                viewMode === 'grid'
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                    : "flex flex-col gap-4"
                            }>
                                {filteredProtocols.slice(0, visibleCount).map(protocol => (
                                    protocol.category === 'ai-prompt' ? (
                                        <AiPromptCard
                                            key={protocol.id}
                                            protocol={protocol}
                                            onClick={() => { setViewPrompt(protocol); setIsPromptModalOpen(true); }}
                                            onCopy={(e) => handleCopyPrompt(e, protocol.id, protocol.content)}
                                            onDuplicate={(e) => { e.stopPropagation(); handleDuplicate(protocol); }}
                                            copiedState={copiedId === protocol.id}
                                        />
                                    ) : (
                                        <ProtocolCard
                                            key={protocol.id}
                                            protocol={protocol}
                                            onClick={() => { setEditProtocol(protocol); setIsEditorOpen(true); }}
                                            onDuplicate={() => handleDuplicate(protocol)}
                                        />
                                    )
                                ))}
                            </div>
                            {visibleCount < filteredProtocols.length && (
                                <div className="py-12 flex justify-center mt-10">
                                    <Button variant="ghost" onClick={() => setVisibleCount(v => v + 12)} className="font-sans text-[9px] font-black uppercase tracking-[0.3em] text-primary hover:bg-primary/5 px-12 h-12 border border-primary/20">
                                        EXPAND REPOSITORY
                                    </Button>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>

            <ProtocolEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                editProtocol={editProtocol}
            />

            <PromptDetailModal
                isOpen={isPromptModalOpen}
                onClose={() => setIsPromptModalOpen(false)}
                protocol={viewPrompt}
                onEdit={(p) => {
                    setIsPromptModalOpen(false);
                    setEditProtocol(p);
                    setIsEditorOpen(true);
                }}
            />
        </div>
    );
}
