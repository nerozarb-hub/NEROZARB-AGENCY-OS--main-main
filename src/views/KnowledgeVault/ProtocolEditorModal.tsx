import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Save, Type, Tag, Link as LinkIcon, Bot, Heading1, Heading2, Bold, Italic, Code, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Protocol, ProtocolCategory, PillarType, ProtocolStatus } from '../../utils/storage';
import { useAppData } from '../../contexts/AppDataContext';
import { motion } from 'framer-motion';

interface ProtocolEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    editProtocol?: Protocol; // If provided, we are in edit mode
}

const CATEGORIES: ProtocolCategory[] = ['sop', 'ai-prompt', 'client-knowledge-base', 'brand-standard'];
const PILLARS: PillarType[] = ['Market Truth', 'Psychological Warfare', 'Conversion Mechanic', 'Viral Engine', 'Growth Math', 'Operations', 'Client Management'];
const STATUSES: ProtocolStatus[] = ['active', 'draft', 'archived'];

export function ProtocolEditorModal({ isOpen, onClose, editProtocol }: ProtocolEditorModalProps) {
    const { addProtocol, updateProtocol, showToast } = useAppData();

    const [formData, setFormData] = useState<{
        title: string;
        category: ProtocolCategory;
        pillar: PillarType;
        status: ProtocolStatus;
        content: string;
        tags: string[];
        tagInput: string;
        externalRefsStr: string;
        promptTool: 'gemini' | 'claude' | 'both' | undefined;
    }>({
        title: '',
        category: 'sop',
        pillar: 'Market Truth',
        status: 'draft',
        content: '',
        tags: [],
        tagInput: '',
        externalRefsStr: '',
        promptTool: undefined
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (editProtocol) {
                setFormData({
                    title: editProtocol.title,
                    category: editProtocol.category,
                    pillar: editProtocol.pillar,
                    status: editProtocol.status,
                    content: editProtocol.content,
                    tags: editProtocol.tags,
                    tagInput: '',
                    externalRefsStr: editProtocol.externalReferences.join(', '),
                    promptTool: editProtocol.promptTool
                });
            } else {
                setFormData({
                    title: '',
                    category: 'sop',
                    pillar: 'Market Truth',
                    status: 'draft',
                    content: '',
                    tags: [],
                    tagInput: '',
                    externalRefsStr: '',
                    promptTool: undefined
                });
            }
        }
    }, [isOpen, editProtocol]);

    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = formData.content;
        const selectedText = currentContent.substring(start, end);
        const newText = currentContent.substring(0, start) + before + selectedText + after + currentContent.substring(end);

        setFormData(prev => ({ ...prev, content: newText }));

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            const newCursorStart = start + before.length;
            const newCursorEnd = end + before.length;
            textarea.setSelectionRange(newCursorStart, newCursorEnd);
        }, 0);
    };

    const handleSave = () => {
        if (!formData.title.trim()) {
            showToast('Title is required', 'error');
            return;
        }

        if (!formData.content.trim()) {
            showToast('Content cannot be empty — add your protocol body before saving', 'error');
            return;
        }

        setIsSaving(true);
        const externalReferences = formData.externalRefsStr.split(',').map(s => s.trim()).filter(Boolean);

        setTimeout(() => {
            if (editProtocol) {
                updateProtocol(editProtocol.id, {
                    title: formData.title,
                    category: formData.category,
                    pillar: formData.pillar,
                    status: formData.status,
                    content: formData.content,
                    tags: formData.tags,
                    externalReferences,
                    promptTool: formData.category === 'ai-prompt' ? (formData.promptTool || 'both') : undefined
                });
            } else {
                addProtocol({
                    title: formData.title,
                    category: formData.category,
                    pillar: formData.pillar,
                    status: formData.status,
                    content: formData.content,
                    tags: formData.tags,
                    externalReferences,
                    promptTool: formData.category === 'ai-prompt' ? (formData.promptTool || 'both') : undefined,
                    promptVariables: [],
                    usageNotes: '',
                    exampleOutput: '',
                    linkedTaskTypes: [],
                    linkedClientId: null,
                    relatedProtocolIds: []
                });
            }

            setIsSaving(false);
            setSaved(true);

            setTimeout(() => {
                setSaved(false);
                onClose();
            }, 800);
        }, 600);
    };

    const addTag = () => {
        const tag = formData.tagInput.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag],
                tagInput: ''
            }));
        } else {
            setFormData(prev => ({ ...prev, tagInput: '' }));
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tagToRemove)
        }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="space-y-1">
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">Contextual Ingestion</p>
                    <h2 className="editorial-title text-3xl text-text-primary italic">
                        {editProtocol ? 'Modify Protocol Logic' : 'Inject New Intelligence'}
                    </h2>
                </div>
            }

            width={950}
            footer={
                <div className="p-4 border-t border-white/[0.04] flex flex-col sm:flex-row justify-end gap-6 items-center w-full">
                    {saved && (
                        <motion.span
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-primary font-sans text-[9px] font-black uppercase tracking-[0.3em] mr-auto italic"
                        >
                            [ PROTOCOL_LOCALIZED ]
                        </motion.span>
                    )}
                    <Button variant="ghost" onClick={onClose} disabled={isSaving || saved} className="font-sans text-[9px] font-black uppercase tracking-widest text-[#444] hover:text-text-primary">
                        Abort
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || saved} className="bg-primary hover:bg-accent-mid text-text-primary px-12 h-12 font-sans text-[9px] font-black uppercase tracking-[0.2em]">
                        {isSaving ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                <Bot className="w-4 h-4" />
                            </motion.div>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-3" />
                                {editProtocol ? 'UPDATE LOGIC' : 'EXECUTE INJECTION'}
                            </>
                        )}
                    </Button>
                </div>
            }

        >
            <div className="space-y-12 py-2">
                {/* Section 1: Classification */}
                <div className="space-y-8">
                    <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#444] uppercase border-b border-white/[0.04] pb-6 italic">
                        Node Classification
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 md:col-span-2">
                            <label className="font-sans text-[8px] font-black text-[#333] uppercase tracking-[0.2em] pl-1">Protocol Identifier *</label>
                            <Input
                                className="bg-white/[0.01] border-white/5 rounded-none font-sans text-lg font-bold tracking-tight px-6 py-8"
                                placeholder="E.g. CONTEXTUAL_CORE_V1"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="font-sans text-[8px] font-black text-[#333] uppercase tracking-[0.2em] pl-1">Category Vector</label>
                            <select
                                className="w-full bg-white/[0.01] rounded-none px-5 h-12 text-[10px] font-bold font-sans text-text-primary focus:outline-none focus:border-white/20 transition-all appearance-none border border-white/5 uppercase tracking-widest"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as ProtocolCategory })}
                            >
                                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0C0F14]">{c.replace(/-/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="font-sans text-[8px] font-black text-[#333] uppercase tracking-[0.2em] pl-1">Operational Pillar</label>
                            <select
                                className="w-full bg-white/[0.01] rounded-none px-5 h-12 text-[10px] font-bold font-sans text-text-primary focus:outline-none focus:border-white/20 transition-all appearance-none border border-white/5 uppercase tracking-widest"
                                value={formData.pillar}
                                onChange={e => setFormData({ ...formData, pillar: e.target.value as PillarType })}
                            >
                                {PILLARS.map(p => <option key={p} value={p} className="bg-[#0C0F14]">{p}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="font-sans text-[8px] font-black text-[#333] uppercase tracking-[0.2em] pl-1">System State</label>
                            <select
                                className="w-full bg-white/[0.01] rounded-none px-5 h-12 text-[10px] font-bold font-sans text-text-primary focus:outline-none focus:border-white/20 transition-all appearance-none border border-white/5 uppercase tracking-widest"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as ProtocolStatus })}
                            >
                                {STATUSES.map(s => <option key={s} value={s} className="bg-[#0C0F14]">{s}</option>)}
                            </select>
                        </div>
                        {formData.category === 'ai-prompt' && (
                            <div className="space-y-3">
                                <label className="font-sans text-[8px] font-black text-[#333] uppercase tracking-[0.2em] pl-1">Target Engine</label>
                                <select
                                    className="w-full bg-white/[0.01] rounded-none px-5 h-12 text-[10px] font-bold font-sans text-text-primary focus:outline-none focus:border-white/20 transition-all appearance-none border border-white/5 uppercase tracking-widest"
                                    value={formData.promptTool || 'both'}
                                    onChange={e => setFormData({ ...formData, promptTool: e.target.value as any })}
                                >
                                    <option value="both" className="bg-[#0C0F14]">AGNOSTIC (BOTH)</option>
                                    <option value="claude" className="bg-[#0C0F14]">CLAUDE_ONLY</option>
                                    <option value="gemini" className="bg-[#0C0F14]">GEMINI_ONLY</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>


                {/* Section 2: Content */}
                <div className="space-y-8">
                    <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#444] uppercase border-b border-white/[0.04] pb-6 italic">
                        Contextual Core Definition
                    </h3>

                    <div className="rounded-none overflow-hidden flex flex-col bg-[#0C0F14] border border-white/5">
                        {/* Toolbar */}
                        <div className="h-12 bg-white/[0.02] border-b border-white/5 flex items-center px-4 gap-2">
                            <button
                                type="button"
                                onClick={() => insertMarkdown('# ', '')}
                                className="p-2 px-3 text-[8px] font-sans font-black text-[#555] hover:text-primary transition-all border border-white/5 hover:border-primary/20 uppercase tracking-widest"
                            >
                                H1
                            </button>
                            <button
                                type="button"
                                onClick={() => insertMarkdown('## ', '')}
                                className="p-2 px-3 text-[8px] font-sans font-black text-[#555] hover:text-primary transition-all border border-white/5 hover:border-primary/20 uppercase tracking-widest"
                            >
                                H2
                            </button>
                            <div className="w-px h-5 bg-white/5 mx-2" />
                            <button
                                type="button"
                                onClick={() => insertMarkdown('**', '**')}
                                className="p-2 px-3 text-[#555] hover:text-primary transition-all"
                            >
                                <Bold size={12} />
                            </button>
                            <button
                                type="button"
                                onClick={() => insertMarkdown('*', '*')}
                                className="p-2 px-3 text-[#555] hover:text-primary transition-all"
                            >
                                <Italic size={12} />
                            </button>
                            <div className="w-px h-5 bg-white/5 mx-2" />
                            <button
                                type="button"
                                onClick={() => insertMarkdown('`', '`')}
                                className="p-2 px-3 text-[#555] hover:text-primary transition-all"
                            >
                                <Code size={12} />
                            </button>
                            <button
                                type="button"
                                onClick={() => insertMarkdown('[', '](url)')}
                                className="p-2 px-3 text-[#555] hover:text-primary transition-all"
                            >
                                <LinkIcon size={12} />
                            </button>
                        </div>
                        <textarea
                            ref={textareaRef}
                            className="w-full bg-transparent p-8 text-sm font-sans font-medium text-text-primary focus:outline-none leading-relaxed resize-none custom-scrollbar min-h-[400px] uppercase tracking-wide placeholder:text-[#222]"
                            placeholder={formData.category === 'ai-prompt' ? "INJECT PROMPT LOGIC. USE [[VAR_NAME]] FOR DYNAMIC PARAMETERS." : "CONSTRUCT PROTOCOL ARCHITECTURE USING TACTICAL MARKDOWN..."}
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>
                </div>


                {/* Section 3: Metadata */}
                <div className="space-y-8">
                    <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#444] uppercase border-b border-white/[0.04] pb-6 italic">
                        Tactical Meta & References
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="font-sans text-[8px] font-black text-[#333] uppercase tracking-[0.2em] pl-1">Tactical Identifiers (Space/Enter)</label>
                            <div className="min-h-[56px] p-3 flex flex-wrap gap-2 bg-white/[0.01] rounded-none border border-white/5 focus-within:border-white/20 transition-all">
                                {formData.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="flex items-center gap-2 bg-primary/5 text-primary font-sans text-[8px] font-black uppercase px-3 py-1.5 rounded-none border border-primary/20 group"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="text-[#333] hover:text-text-primary transition-colors"
                                        >
                                            <X size={10} />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    className="bg-transparent border-none outline-none text-[10px] font-sans font-bold text-text-primary flex-1 min-w-[150px] uppercase tracking-widest placeholder:text-[#222]"
                                    placeholder={formData.tags.length === 0 ? "E.G. SCALING, STRATEGY" : ""}
                                    value={formData.tagInput}
                                    onChange={e => setFormData({ ...formData, tagInput: e.target.value })}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            addTag();
                                        } else if (e.key === 'Backspace' && !formData.tagInput && formData.tags.length > 0) {
                                            removeTag(formData.tags[formData.tags.length - 1]);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="font-sans text-[8px] font-black text-[#333] uppercase tracking-[0.2em] pl-1">External Signal Anchors (URLs)</label>
                            <Input
                                className="bg-white/[0.01] border-white/5 rounded-none h-14 px-5 font-sans text-[10px] font-bold tracking-widest uppercase placeholder:text-[#222]"
                                placeholder="HTTPS://KNOWLEDGE.CLOUD, HTTPS://SIGNAL.HUB.."
                                value={formData.externalRefsStr}
                                onChange={e => setFormData({ ...formData, externalRefsStr: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </Modal>
    );
}

