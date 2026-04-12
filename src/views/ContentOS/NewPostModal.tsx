import { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Platform, PostType, TemplateType, CTAType, PostStage, NodeRole } from '../../utils/storage';

interface NewPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post?: any; // If editing
    prefilledDate?: string | null;
}

const PLATFORMS: { id: Platform, label: string }[] = [
    { id: 'instagram', label: 'Instagram' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'twitter', label: 'Twitter/X' }
];

const POST_TYPES: PostType[] = ['Reel / Short Video', 'Static Post', 'Carousel', 'Story', 'Text Post', 'Event Post'];
const TEMPLATES: TemplateType[] = ['Template A', 'Template B', 'Template C', 'Custom'];
const CTA_TYPES: CTAType[] = ['Comment', 'Link in bio', 'DM for', 'Save this', 'Share this', 'Custom'];
const PSYCH_TRIGGERS = ['Loss Aversion', 'Social Proof', 'Identity', 'Pattern Interrupt'];

export default function NewPostModal({ isOpen, onClose, post, prefilledDate }: NewPostModalProps) {
    const { data, addPost } = useAppData();

    // Active sprint and retainer clients
    const clients = useMemo(() => data.clients.filter(c => c.status === 'Active Sprint' || c.status === 'Retainer'), [data.clients]);

    // Section 1: Identification
    const [clientId, setClientId] = useState<number | ''>('');
    const [platforms, setPlatforms] = useState<Platform[]>(['instagram']);
    const [postType, setPostType] = useState<PostType>('Static Post');
    const [contentPillar, setContentPillar] = useState('');
    const [templateType, setTemplateType] = useState<TemplateType>('Template A');

    // Section 2: Content
    const [hook, setHook] = useState('');
    const [triggerUsed, setTriggerUsed] = useState<string | null>(null);
    const [captionBody, setCaptionBody] = useState('');
    const [ctaType, setCtaType] = useState<CTAType>('Link in bio');
    const [customCta, setCustomCta] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [visualBrief, setVisualBrief] = useState('');

    // Section 3: Scheduling
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('10:00');
    const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
    const [status, setStatus] = useState<PostStage>('PLANNED');

    // Section 4 & 5: Assignment & Assets
    const [assignedTo, setAssignedTo] = useState<NodeRole>('Art Director');
    const [linkedTaskId, setLinkedTaskId] = useState<number | ''>('');
    const [linkedPromptId, setLinkedPromptId] = useState<number | ''>('');
    const [assetLinks, setAssetLinks] = useState('');
    const [referencePost, setReferencePost] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (prefilledDate) {
                setScheduledDate(prefilledDate);
            } else {
                setScheduledDate(new Date().toISOString().split('T')[0]);
            }

            // Auto-suggest role based on type
            if (postType === 'Reel / Short Video') setAssignedTo('Video Editor');
            else if (postType === 'Story' || postType === 'Text Post') setAssignedTo('Social Media Manager');
            else setAssignedTo('Art Director');
        }
    }, [isOpen, prefilledDate, postType]);

    const selectedClientPillars = useMemo(() => {
        if (clientId === '') return [];
        const c = clients.find(c => c.id === Number(clientId));
        return c ? c.contentPillars : [];
    }, [clientId, clients]);

    const handlePsychTrigger = (trigger: string) => {
        setTriggerUsed(trigger);
        setHook(prev => `${prev} (Trigger: ${trigger})`);
    };

    const togglePlatform = (p: Platform) => {
        if (platforms.includes(p)) {
            if (platforms.length > 1) setPlatforms(platforms.filter(x => x !== p));
        } else {
            setPlatforms([...platforms, p]);
        }
    };

    const handleSubmit = () => {
        if (clientId === '' || !scheduledDate) return;

        addPost({
            clientId: Number(clientId),
            platforms,
            postType,
            contentPillar,
            templateType,
            hook,
            triggerUsed,
            captionBody,
            cta: ctaType === 'Custom' ? customCta : ctaType,
            ctaType,
            hashtags,
            visualBrief,
            scheduledDate,
            scheduledTime,
            publishedDate: null,
            status,
            priority,
            assignedTo,
            linkedTaskId: linkedTaskId !== '' ? Number(linkedTaskId) : null,
            linkedPromptId: linkedPromptId !== '' ? Number(linkedPromptId) : null,
            assetLinks: assetLinks ? assetLinks.split(',').map(s => s.trim()) : [],
            referencePost: referencePost || null,
            performance: null,
            activityLog: [{
                id: Date.now(),
                userId: 1, // System/Current User
                action: 'created',
                timestamp: new Date().toISOString(),
                details: 'Post created via Content Engine'
            }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="space-y-1">
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">Content Pipeline</p>
                    <h2 className="editorial-title text-3xl text-text-primary italic">Identify Asset</h2>
                </div>
            }
            width={1000}

            footer={
                <div className="flex justify-between items-center w-full">
                    <Button variant="ghost" onClick={onClose} className="font-sans text-[10px] font-black uppercase tracking-widest text-[#555] hover:text-text-primary">
                        Abort
                    </Button>
                    <Button onClick={handleSubmit} disabled={clientId === '' || !scheduledDate} className="bg-primary hover:bg-accent-mid text-text-primary px-10 h-12 font-sans text-[10px] font-black uppercase tracking-[0.2em]">
                        <Save size={14} className="mr-2" />
                        Deploy Asset
                    </Button>
                </div>

            }
        >
            <div className="space-y-10 py-2">
                {/* SECTION 1: IDENTIFICATION */}
                <section className="space-y-8">
                    <h4 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-4">01 · Identification</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="font-sans text-[10px] font-black text-[#666] uppercase tracking-widest">Target Client</label>
                            <select
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-white/[0.02] border border-white/[0.05] p-4 text-xs font-bold font-sans text-text-primary focus:border-text-muted/20 outline-none transition-all uppercase tracking-widest"
                                required
                            >
                                <option value="">SELECT CLIENT...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="font-sans text-[10px] font-black text-[#666] uppercase tracking-widest">Environment(s)</label>
                            <div className="flex flex-wrap gap-2">
                                {PLATFORMS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => togglePlatform(p.id)}
                                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${platforms.includes(p.id) ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/5 text-[#444] hover:border-[#666]'}`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <label className="font-sans text-[10px] font-black text-[#666] uppercase tracking-widest">Format Type</label>
                            <select
                                value={postType}
                                onChange={(e) => setPostType(e.target.value as PostType)}
                                className="w-full bg-white/[0.02] border border-white/[0.05] p-4 text-xs font-bold font-sans text-text-primary focus:border-text-muted/20 outline-none transition-all uppercase tracking-widest"
                            >
                                {POST_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="font-sans text-[10px] font-black text-[#666] uppercase tracking-widest">Strategy Pillar</label>
                            <select
                                value={contentPillar}
                                onChange={(e) => setContentPillar(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/[0.05] p-4 text-xs font-bold font-sans text-text-primary focus:border-text-muted/20 outline-none transition-all uppercase tracking-widest"
                            >
                                {clientId === '' && <option value="">SELECT ACCOUNT FIRST</option>}
                                {selectedClientPillars.map(pillar => <option key={pillar} value={pillar}>{pillar.toUpperCase()}</option>)}
                                <option value="Other">OTHER</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="font-sans text-[10px] font-black text-[#666] uppercase tracking-widest">Asset Template</label>
                            <select
                                value={templateType}
                                onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                                className="w-full bg-white/[0.02] border border-white/[0.05] p-4 text-xs font-bold font-sans text-text-primary focus:border-text-muted/20 outline-none transition-all uppercase tracking-widest"
                            >
                                {TEMPLATES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>

                </section>

                {/* SECTION 2: CONTENT */}
                <section className="space-y-8">
                    <h4 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-4">02 · Creative Intelligence</h4>


                    <div className="space-y-3">
                        <label className="font-sans text-[10px] font-black text-[#666] uppercase tracking-widest flex justify-between">
                          <span>Identify Hook</span>
                        </label>
                        <textarea
                            value={hook}
                            onChange={(e) => setHook(e.target.value)}
                            placeholder="THE SCROLL-STOPPING COMMAND..."
                            className="w-full bg-white/[0.02] border border-white/[0.05] p-5 text-xl font-medium font-serif italic text-text-primary focus:border-text-muted/20 outline-none resize-none min-h-[80px]"
                            rows={2}
                        />
                        <div className="flex gap-2 pt-2 overflow-x-auto pb-2 custom-scrollbar">
                            {PSYCH_TRIGGERS.map(t => (
                                <button
                                    key={t}
                                    onClick={() => handlePsychTrigger(t)}
                                    className="shrink-0 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/5 text-[#555] hover:text-primary hover:border-primary transition-all duration-300"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>


                    <div className="space-y-3">
                        <label className="font-sans text-[10px] font-black text-[#666] uppercase tracking-widest">Intelligence Body</label>
                        <textarea
                            value={captionBody}
                            onChange={(e) => setCaptionBody(e.target.value)}
                            placeholder="WHAT ARE THEY REALIZING? WHAT IS THE COMMAND?"
                            className="w-full bg-white/[0.02] border border-white/[0.05] p-5 text-sm font-sans text-text-muted focus:border-text-muted/20 outline-none resize-none min-h-[120px] leading-relaxed"
                            rows={4}
                        />
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-text-muted uppercase">Call To Action</label>
                            <select
                                value={ctaType}
                                onChange={(e) => setCtaType(e.target.value as CTAType)}
                                className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                            >
                                {CTA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            {ctaType === 'Custom' && (
                                <input
                                    value={customCta}
                                    onChange={e => setCustomCta(e.target.value)}
                                    placeholder="Enter custom CTA phrasing..."
                                    className="w-full bg-background border border-border-dark rounded-sm p-3 mt-2 text-sm text-text-primary focus:border-primary outline-none"
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-text-muted uppercase">Hashtags</label>
                            <textarea
                                value={hashtags}
                                onChange={(e) => setHashtags(e.target.value)}
                                placeholder="#nerozarb #digitalgrowth ... (8–12 max)"
                                className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none resize-none min-h-[80px]"
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="font-sans text-[10px] font-black text-[#666] uppercase tracking-widest flex justify-between">
                            <span>Visual Briefing</span>
                            <span className="text-primary/60 italic font-medium normal-case tracking-normal">{templateType} System Active</span>
                        </label>
                        <textarea
                            value={visualBrief}
                            onChange={(e) => setVisualBrief(e.target.value)}
                            placeholder="DESCRIBE THE VISUAL EXECUTION. MOOD. COLORS. COMMAND."
                            className="w-full bg-white/[0.02] border border-primary/10 p-5 text-sm font-sans text-text-primary focus:border-primary/30 outline-none resize-none min-h-[120px] leading-relaxed"
                            rows={3}
                        />
                    </div>

                </section>

                {/* SECTION 3, 4, 5 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <section className="space-y-6">
                        <h4 className="font-mono text-sm tracking-widest text-text-primary border-b border-border-dark pb-2">SECTION 3: SCHEDULING</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-text-muted uppercase">Date *</label>
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-text-muted uppercase">Time</label>
                                <input
                                    type="time"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-text-muted uppercase">Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                    className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="high">High Priority</option>
                                    <option value="urgent">URGENT</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-text-muted uppercase">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as PostStage)}
                                    className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                >
                                    <option value="PLANNED">PLANNED</option>
                                    <option value="BRIEF WRITTEN">BRIEF WRITTEN</option>
                                    <option value="IN PRODUCTION">IN PRODUCTION</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h4 className="font-mono text-sm tracking-widest text-text-primary border-b border-border-dark pb-2">ASSIGNMENT & ASSETS</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-text-muted uppercase">Assigned To</label>
                                <select
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value as NodeRole)}
                                    className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                >
                                    <option value="Art Director">Art Director</option>
                                    <option value="Video Editor">Video Editor</option>
                                    <option value="Social Media Manager">Social Media Manager</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-text-muted uppercase">Link to Task</label>
                                <select
                                    value={linkedTaskId}
                                    onChange={(e) => setLinkedTaskId(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                >
                                    <option value="">None</option>
                                    {data.tasks.filter(t => t.status === 'active').map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-mono text-text-muted uppercase">Linked Prompt</label>
                                <select
                                    value={linkedPromptId}
                                    onChange={(e) => setLinkedPromptId(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                                >
                                    <option value="">None</option>
                                    {data.protocols.filter(p => p.category === 'ai-prompt').map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-text-muted uppercase">Asset Links</label>
                            <input
                                value={assetLinks}
                                onChange={(e) => setAssetLinks(e.target.value)}
                                placeholder="Link to Canva file, Drive folder..."
                                className="w-full bg-background border border-border-dark rounded-sm p-3 text-sm text-text-primary focus:border-primary outline-none"
                            />
                        </div>
                    </section>
                </div>
            </div>
        </Modal>
    );
}

