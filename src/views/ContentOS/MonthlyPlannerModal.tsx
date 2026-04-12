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
                <div className="space-y-1">
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">Strategy Execution</p>
                    <h2 className="editorial-title text-3xl text-text-primary italic">Content Planner</h2>
                    <p className="font-sans text-[10px] text-[#555] font-bold uppercase tracking-widest mt-2">
                        Target Account: <span className="text-primary">{client?.name.toUpperCase() || 'NONE SELECTED'}</span>
                    </p>
                </div>

            }
            footer={
                <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
                    <div className="font-sans text-[9px] font-black text-[#888] uppercase tracking-[0.2em] bg-white/5 px-4 py-2 border border-white/5">
                        Batch Size: <span className="text-primary">{rows.length}</span> Identified
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
                        <thead>
                            <tr className="font-sans text-[9px] font-black tracking-[0.2em] text-[#555] uppercase border-b border-border-dark bg-onyx">
                                <th className="py-6 px-4 w-12 text-center font-black">Ref</th>
                                <th className="py-6 px-4 w-40 font-black">Timeline</th>
                                <th className="py-6 px-4 w-40 font-black">Environment</th>
                                <th className="py-6 px-4 w-48 font-black">Format</th>
                                <th className="py-6 px-4 w-48 font-black">Strategy</th>
                                <th className="py-6 px-4 font-black">Hook Intelligence</th>
                                <th className="py-6 px-4 w-48 font-black">Operator</th>
                                <th className="py-6 px-4 w-16 text-center font-black">Status</th>
                            </tr>
                        </thead>

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
                                            className="w-full bg-transparent border border-transparent focus:border-text-muted/20 focus:bg-white/[0.02] p-3 text-[11px] text-text-primary outline-none transition-all font-sans font-bold uppercase tracking-widest"
                                        />
                                    </td>

                                    <td className="p-2">
                                        <select
                                            value={row.platform}
                                            onChange={e => updateRow(row.id, 'platform', e.target.value)}
                                            className="w-full bg-transparent border border-transparent focus:border-text-muted/20 focus:bg-white/[0.02] p-3 text-[10px] text-text-primary outline-none transition-all font-sans font-black uppercase tracking-[0.15em] cursor-pointer"
                                        >
                                            {PLATFORMS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                                        </select>
                                    </td>

                                    <td className="p-2">
                                        <select
                                            value={row.postType}
                                            onChange={e => updateRow(row.id, 'postType', e.target.value)}
                                            className="w-full bg-transparent border border-transparent focus:border-text-muted/20 focus:bg-white/[0.02] p-3 text-[10px] text-text-primary outline-none transition-all font-sans font-black uppercase tracking-[0.15em] cursor-pointer"
                                        >
                                            {POST_TYPES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                                        </select>
                                    </td>

                                    <td className="p-2">
                                        <select
                                            value={row.pillar}
                                            onChange={e => updateRow(row.id, 'pillar', e.target.value)}
                                            className="w-full bg-transparent border border-transparent focus:border-text-muted/20 focus:bg-white/[0.02] p-3 text-[10px] text-text-primary outline-none transition-all font-sans font-black uppercase tracking-[0.15em] cursor-pointer"
                                        >
                                            {pillars.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                                            <option value="Other">OTHER</option>
                                        </select>
                                    </td>

                                    <td className="p-2">
                                        <input
                                            type="text"
                                            value={row.hookIdea}
                                            placeholder="MISSION HOOK..."
                                            onChange={e => updateRow(row.id, 'hookIdea', e.target.value)}
                                            className="w-full bg-transparent border border-transparent focus:border-text-muted/20 focus:bg-white/[0.02] p-3 text-[11px] text-text-primary outline-none transition-all font-sans font-black uppercase tracking-widest placeholder:text-[#333]"
                                        />
                                    </td>

                                    <td className="p-2">
                                        <select
                                            value={row.assignedTo}
                                            onChange={e => updateRow(row.id, 'assignedTo', e.target.value)}
                                            className="w-full bg-transparent border border-transparent focus:border-text-muted/20 focus:bg-white/[0.02] p-3 text-[10px] text-text-primary outline-none transition-all font-sans font-black uppercase tracking-[0.15em] cursor-pointer"
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
