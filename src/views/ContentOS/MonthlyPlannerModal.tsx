import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Zap, Save, ClipboardList } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Platform, PostType, NodeRole } from '../../utils/storage';

interface MonthlyPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number | null;
    onNavigate?: (view: string, id?: string) => void;
}

interface PlannerRow {
    id: string;
    date: string;
    platform: Platform;
    postType: PostType;
    pillar: string;
    hookIdea: string;
    assignedTo: NodeRole;
}

const PLATFORMS: Platform[] = ['instagram', 'facebook', 'tiktok', 'linkedin', 'twitter'];
const POST_TYPES: PostType[] = ['Reel / Short Video', 'Static Post', 'Carousel', 'Story', 'Text Post', 'Event Post'];

export default function MonthlyPlannerModal({ isOpen, onClose, clientId, onNavigate }: MonthlyPlannerModalProps) {
    const { data, generateMonthlyPosts } = useAppData();

    const client = useMemo(() => data.clients.find(c => c.id === clientId), [data.clients, clientId]);
    const pillars = client?.contentPillars || [];

    const [rows, setRows] = useState<PlannerRow[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Initialize with some blank rows when opened
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen && rows.length === 0) {
            handleAddRow(3);
        }
    }, [isOpen]);

    const handleAddRow = (count = 1) => {
        const newRows = Array.from({ length: count }).map(() => ({
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString().split('T')[0],
            platform: 'instagram' as Platform,
            postType: 'Static Post' as PostType,
            pillar: pillars[0] || 'Other',
            hookIdea: '',
            assignedTo: 'Art Director' as NodeRole,
        }));
        setRows(prev => [...prev, ...newRows]);
    };

    const updateRow = (id: string, field: keyof PlannerRow, value: any) => {
        setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const removeRow = (id: string) => {
        setRows(prev => prev.filter(r => r.id !== id));
    };

    const handleGenerate = async () => {
        if (!clientId || rows.length === 0) return;

        setIsGenerating(true);

        // Filter out empty rows (at least hook idea must be somewhat filled, or keep all if user wants blanks)
        const validRows = rows.filter(r => r.date);

        // Simulate network request
        await new Promise(res => setTimeout(res, 800));

        // Pass rows using field names that match AppDataContext.generateMonthlyPosts expectations
        generateMonthlyPosts(clientId, validRows.map(r => ({
            platform: r.platform,   // singular — matches context's row.platform
            postType: r.postType,
            pillar: r.pillar,       // matches context's row.pillar
            hookIdea: r.hookIdea,   // matches context's row.hookIdea
            date: r.date,           // matches context's row.date
            assignedTo: r.assignedTo
        })));

        setIsGenerating(false);
        onClose();
        // Reset rows for next open
        setRows([]);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            width={1200}
            title={
                <div>
                    <h2 className="font-heading text-xl text-text-primary uppercase tracking-wider flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-primary" />
                        Monthly Content Planner
                    </h2>
                    <p className="font-mono text-[10px] text-text-muted mt-0.5 tracking-widest uppercase">
                        Protocol For Client: <span className="text-primary font-bold">{client?.name.toUpperCase() || 'NONE SELECTED'}</span>
                    </p>
                </div>
            }
            footer={
                <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
                    <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest bg-background/50 px-4 py-2 border border-border-dark rounded-sm">
                        Calculated Batch Load: <span className="text-primary font-bold">{rows.length}</span> Objects
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button variant="ghost" onClick={onClose} className="font-mono text-[10px] uppercase tracking-widest flex-1 sm:flex-none h-11">
                            Abort
                        </Button>
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || rows.length === 0 || !clientId || !rows.every(r => r.date && r.hookIdea.trim() !== '')}
                            className="bg-primary hover:bg-accent-mid text-text-primary min-w-[240px] font-mono text-[10px] uppercase tracking-widest flex-1 sm:flex-none h-11"
                        >
                            {isGenerating ? (
                                <div className="w-3 h-3 rounded-full border-2 border-background border-t-transparent animate-spin mr-2" />
                            ) : (
                                <Zap className="w-4 h-4 mr-2" />
                            )}
                            Batch Generate Mission
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-6 py-2">
                <div className="overflow-x-auto custom-scrollbar border border-border-dark rounded-sm bg-[#0c0e12]">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="text-[9px] font-mono tracking-widest text-text-muted uppercase border-b border-border-dark bg-card/50">
                                <th className="p-4 w-12 text-center">ID</th>
                                <th className="p-4 w-40">Timeline <span className="text-red-500">*</span></th>
                                <th className="p-4 w-40">Environment</th>
                                <th className="p-4 w-48">Format Type</th>
                                <th className="p-4 w-48">Strategy Pillar</th>
                                <th className="p-4">Mission Hook / Hook Idea <span className="text-red-500">*</span></th>
                                <th className="p-4 w-48">Assignee Node</th>
                                <th className="p-4 w-16 text-center">Op</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark/30">
                            {rows.map((row, index) => (
                                <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4 text-center text-[10px] text-text-muted font-mono">{String(index + 1).padStart(2, '0')}</td>
                                    <td className="p-2">
                                        <input
                                            type="date"
                                            value={row.date}
                                            onChange={e => updateRow(row.id, 'date', e.target.value)}
                                            className="w-full bg-transparent border border-transparent focus:border-primary/50 focus:bg-background/50 rounded-sm p-2 text-xs text-text-primary outline-none transition-all font-mono"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select
                                            value={row.platform}
                                            onChange={e => updateRow(row.id, 'platform', e.target.value)}
                                            className="w-full bg-transparent border border-transparent focus:border-primary/50 focus:bg-background/50 rounded-sm p-2 text-xs text-text-primary outline-none transition-all font-mono uppercase"
                                        >
                                            {PLATFORMS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <select
                                            value={row.postType}
                                            onChange={e => updateRow(row.id, 'postType', e.target.value)}
                                            className="w-full bg-transparent border border-transparent focus:border-primary/50 focus:bg-background/50 rounded-sm p-2 text-xs text-text-primary outline-none transition-all font-mono uppercase"
                                        >
                                            {POST_TYPES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <select
                                            value={row.pillar}
                                            onChange={e => updateRow(row.id, 'pillar', e.target.value)}
                                            className="w-full bg-transparent border border-transparent focus:border-primary/50 focus:bg-background/50 rounded-sm p-2 text-xs text-text-primary outline-none transition-all font-mono uppercase"
                                        >
                                            {pillars.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                                            <option value="Other">OTHER</option>
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="text"
                                            value={row.hookIdea}
                                            placeholder="ENTER MISSION HOOK..."
                                            onChange={e => updateRow(row.id, 'hookIdea', e.target.value)}
                                            className="w-full bg-transparent border border-transparent focus:border-primary/50 focus:bg-background/50 rounded-sm p-2 text-xs text-text-primary outline-none transition-all font-mono uppercase placeholder:opacity-20"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select
                                            value={row.assignedTo}
                                            onChange={e => updateRow(row.id, 'assignedTo', e.target.value)}
                                            className="w-full bg-transparent border border-transparent focus:border-primary/50 focus:bg-background/50 rounded-sm p-2 text-xs text-text-primary outline-none transition-all font-mono uppercase"
                                        >
                                            <option value="Art Director">ART_DIRECTOR</option>
                                            <option value="Video Editor">VIDEO_EDITOR</option>
                                            <option value="Social Media Manager">SM_MANAGER</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => removeRow(row.id)}
                                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-all grayscale hover:grayscale-0"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-start">
                    <Button
                        variant="outline"
                        onClick={() => handleAddRow(1)}
                        className="font-mono text-[10px] uppercase border-border-dark hover:border-primary tracking-widest h-10 px-6"
                    >
                        <Plus className="w-3 h-3 mr-2" /> Inject Row
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
