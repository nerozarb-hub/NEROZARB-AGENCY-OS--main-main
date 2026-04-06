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
        <div className="h-full flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 md:p-6 border-b border-border-dark flex-shrink-0 gap-3">
                <div>
                    <h1 className="font-heading text-2xl md:text-4xl tracking-tighter uppercase text-text-primary">
                        {selectedClient ? "CLIENT KNOWLEDGE BASE" : "KNOWLEDGE VAULT"}
                    </h1>
                    <p className="font-mono text-[10px] text-text-muted mt-1 uppercase tracking-widest">
                        {selectedClient ? "Client-specific intelligence and protocols" : "Central Nervous System for Agency Intelligence"}
                    </p>
                </div>
                <Button size="sm" onClick={() => { setEditProtocol(undefined); setIsEditorOpen(true); }} className="whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">NEW PROTOCOL</span>
                    <span className="sm:hidden">+ NEW</span>
                </Button>
            </div>

            <div className="flex-1 p-4 md:p-6 flex flex-col min-h-0">
                {/* Search & Tabs */}
                <div className="mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                        <div className="relative">
                            <div ref={tabScrollRef} className="flex gap-1.5 p-1 bg-white/5 rounded-sm overflow-x-auto scroll-touch no-scrollbar">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${activeCategory === cat.id
                                            ? 'bg-white/10 text-primary'
                                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                            }`}
                                    >
                                        {cat.icon}
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                            {/* Mobile scroll fade indicator */}
                            {showTabFade && (
                                <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent pointer-events-none rounded-r-sm" />
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative flex-1 sm:w-64 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <Input
                                    className="pl-9 bg-white/5 border-border-dark w-full"
                                    placeholder="Search knowledge..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex  rounded-sm overflow-hidden bg-white/5 flex-shrink-0">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-primary' : 'text-text-muted hover:text-text-primary'}`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-white/10 text-primary' : 'text-text-muted hover:text-text-primary'}`}
                                >
                                    <ListIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="flex gap-1.5 pt-1">
                        {(['all', 'active', 'draft', 'archived'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setActiveStatus(s)}
                                className={`px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-sm border transition-colors ${activeStatus === s
                                    ? 'bg-primary/10 border-primary/50 text-primary'
                                    : 'bg-transparent border-border-dark text-text-muted hover:text-text-primary hover:border-text-muted'
                                    }`}
                            >
                                {s === 'all' ? 'All Status' : s}
                            </button>
                        ))}
                    </div>

                    {/* Pillar Filters */}
                    <div className="flex gap-1.5 flex-wrap">
                        <button
                            onClick={() => setActivePillar('all')}
                            className={`px-4 py-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-widest rounded-sm border transition-colors ${activePillar === 'all'
                                ? 'bg-primary/10 border-primary/50 text-primary'
                                : 'bg-transparent border-border-dark text-text-muted hover:text-text-primary hover:border-text-muted'
                                }`}
                        >
                            ALL PILLARS
                        </button>
                        {PILLARS.map(pillar => (
                            <button
                                key={pillar}
                                onClick={() => setActivePillar(pillar)}
                                className={`px-4 py-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-widest rounded-sm border transition-colors ${activePillar === pillar
                                    ? 'bg-primary/10 border-primary/50 text-primary'
                                    : 'bg-transparent border-border-dark text-text-muted hover:text-text-primary hover:border-text-muted'
                                    }`}
                            >
                                {pillar}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {activeCategory === 'client-knowledge-base' && selectedClient ? (
                        <ClientKnowledgeBase clientId={parseInt(selectedClient, 10)} />
                    ) : filteredProtocols.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-text-muted py-20">
                            {activeCategory === 'ai-prompt' ? (
                                <Cpu className="w-12 h-12 mb-4 opacity-30" />
                            ) : activeCategory === 'sop' ? (
                                <ScrollText className="w-12 h-12 mb-4 opacity-30" />
                            ) : activeCategory === 'client-knowledge-base' ? (
                                <Building2 className="w-12 h-12 mb-4 opacity-30" />
                            ) : activeCategory === 'brand-standard' ? (
                                <FileText className="w-12 h-12 mb-4 opacity-30" />
                            ) : (
                                <BookOpen className="w-12 h-12 mb-4 opacity-30" />
                            )}
                            <p className="font-mono uppercase tracking-widest text-sm">
                                {activeCategory === 'ai-prompt' ? 'No AI prompts found'
                                    : activeCategory === 'sop' ? 'No SOPs found'
                                        : activeCategory === 'client-knowledge-base' ? 'No client intelligence found'
                                            : activeCategory === 'brand-standard' ? 'No brand standards found'
                                                : 'No protocols found'}
                            </p>
                            <p className="font-mono text-xs text-text-muted mt-2 opacity-60">Try clearing your filters or create a new entry.</p>
                            <Button variant="outline" className="mt-6" onClick={() => { setSearchQuery(''); setActiveCategory('all'); setActivePillar('all'); }}>
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            {activeCategory !== 'client-knowledge-base' && (
                                <div className="text-[10px] font-mono text-text-muted mb-4 tracking-widest uppercase">
                                    {filteredProtocols.length} Result{filteredProtocols.length !== 1 ? 's' : ''} Found
                                </div>
                            )}
                            <div className={
                                viewMode === 'grid'
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                                    : "flex flex-col gap-2"
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
                                <div className="py-8 flex justify-center mt-4">
                                    <Button variant="outline" onClick={() => setVisibleCount(v => v + 12)}>
                                        LOAD MORE PROTOCOLS
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
