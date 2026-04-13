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
                    <p className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">SYSTEM_DEPLOYMENT</p>
                    <h2 className="font-heading text-4xl text-text-primary uppercase tracking-tighter">Register New Asset</h2>
                </div>
            }
            width={1100}

            footer={
                <div className="flex justify-between items-center w-full px-2">
                    <Button variant="ghost" onClick={onClose} className="font-sans text-[11px] font-black uppercase tracking-[0.3em] text-text-muted/40 hover:text-text-primary transition-colors">
                        ABORT_SYSTEM
                    </Button>
                    <div className="flex items-center gap-6">
                      <span className="font-sans text-[10px] font-black text-text-muted/20 tracking-widest hidden sm:block">PENDING_DEPLOYMENT_READY</span>
                      <Button onClick={handleSubmit} disabled={clientId === '' || !scheduledDate} className="bg-primary hover:bg-accent-mid text-onyx px-12 h-14 rounded-none font-sans text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-[0.98]">
                          <Save size={16} className="mr-3" />
                          INITIATE_DEPLOYMENT
                      </Button>
                    </div>
                </div>

            }
        >
            <div className="space-y-16 py-8 custom-scrollbar max-h-[70vh] overflow-y-auto px-2">
                {/* SECTION 1: IDENTIFICATION */}
                <section className="space-y-10">
                    <div className="flex items-center gap-4">
                      <span className="font-sans text-[11px] font-black tracking-[0.4em] text-primary/40">01</span>
                      <h4 className="font-sans text-[11px] font-black tracking-[0.3em] text-text-muted/60 uppercase">CORE_IDENTIFICATION</h4>
                      <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">TARGET_ENTITY</label>
                            <select
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-white/[0.02] border border-white/[0.06] p-5 text-[11px] font-black font-sans text-text-primary focus:border-primary/40 outline-none transition-all uppercase tracking-[0.2em] appearance-none cursor-pointer"
                                required
                            >
                                <option value="">SELECT_TARGET...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">DEPLOYMENT_ENVIRONMENTS</label>
                            <div className="flex flex-wrap gap-2">
                                {PLATFORMS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => togglePlatform(p.id)}
                                        className={`px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-500 rounded-none ${platforms.includes(p.id) ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(63,106,36,0.1)]' : 'bg-white/[0.02] border-white/[0.06] text-text-muted/40 hover:border-white/[0.2]'}`}
                                    >
                                        {p.label.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                        <div className="space-y-4">
                            <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">ASSET_FORMAT</label>
                            <select
                                value={postType}
                                onChange={(e) => setPostType(e.target.value as PostType)}
                                className="w-full bg-white/[0.02] border border-white/[0.06] p-5 text-[11px] font-black font-sans text-text-primary focus:border-primary/40 outline-none transition-all uppercase tracking-[0.2em] appearance-none cursor-pointer"
                            >
                                {POST_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">STRATEGIC_PILLAR</label>
                            <select
                                value={contentPillar}
                                onChange={(e) => setContentPillar(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/[0.06] p-5 text-[11px] font-black font-sans text-text-primary focus:border-primary/40 outline-none transition-all uppercase tracking-[0.2em] appearance-none cursor-pointer"
                            >
                                {clientId === '' && <option value="">AWAITING_TARGET...</option>}
                                {selectedClientPillars.map(pillar => <option key={pillar} value={pillar}>{pillar.toUpperCase()}</option>)}
                                <option value="Other">OTHER_PROTOCOL</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">STRUCTURAL_TEMPLATE</label>
                            <select
                                value={templateType}
                                onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                                className="w-full bg-white/[0.02] border border-white/[0.06] p-5 text-[11px] font-black font-sans text-text-primary focus:border-primary/40 outline-none transition-all uppercase tracking-[0.2em] appearance-none cursor-pointer"
                            >
                                {TEMPLATES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>

                </section>

                {/* SECTION 2: CONTENT */}
                <section className="space-y-10">
                    <div className="flex items-center gap-4">
                      <span className="font-sans text-[11px] font-black tracking-[0.4em] text-primary/40">02</span>
                      <h4 className="font-sans text-[11px] font-black tracking-[0.3em] text-text-muted/60 uppercase">CREATIVE_INTELLIGENCE</h4>
                      <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>


                    <div className="space-y-4">
                        <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em] flex justify-between">
                          <span>PRIMARY_HOOK</span>
                          <span className="text-primary/40 italic font-medium normal-case tracking-normal">PSYCH_LAYER_ACTIVE</span>
                        </label>
                        <textarea
                            value={hook}
                            onChange={(e) => setHook(e.target.value)}
                            placeholder="INPUT_SCROLL_STOPPING_COMMAND..."
                            className="w-full bg-white/[0.02] border border-white/[0.06] p-6 text-3xl font-heading text-text-primary focus:border-primary/40 outline-none resize-none min-h-[100px] transition-all"
                            rows={2}
                        />
                        <div className="flex gap-2 pt-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                            {PSYCH_TRIGGERS.map(t => (
                                <button
                                    key={t}
                                    onClick={() => handlePsychTrigger(t)}
                                    className="shrink-0 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/5 text-text-muted/40 hover:text-primary hover:border-primary transition-all duration-300"
                                >
                                    {t.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>


                    <div className="space-y-4">
                        <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">INTELLIGENCE_BODY</label>
                        <textarea
                            value={captionBody}
                            onChange={(e) => setCaptionBody(e.target.value)}
                            placeholder="WHAT ARE THEY REALIZING? WHAT IS THE COMMAND?"
                            className="w-full bg-white/[0.02] border border-white/[0.06] p-6 text-sm font-sans text-text-muted focus:border-primary/40 outline-none resize-none min-h-[160px] leading-relaxed transition-all"
                            rows={4}
                        />
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">ACTION_TRIGGER (CTA)</label>
                            <select
                                value={ctaType}
                                onChange={(e) => setCtaType(e.target.value as CTAType)}
                                className="w-full bg-white/[0.02] border border-white/[0.06] p-5 text-[11px] font-black font-sans text-text-primary focus:border-primary/40 outline-none transition-all uppercase tracking-[0.2em] appearance-none cursor-pointer"
                            >
                                {CTA_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                            </select>
                            {ctaType === 'Custom' && (
                                <input
                                    value={customCta}
                                    onChange={e => setCustomCta(e.target.value)}
                                    placeholder="INPUT_CUSTOM_PHRASING..."
                                    className="w-full bg-white/[0.02] border border-primary/20 p-5 mt-2 text-[11px] font-black text-text-primary focus:border-primary/40 outline-none uppercase tracking-[0.2em]"
                                />
                            )}
                        </div>
                        <div className="space-y-4">
                            <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">METADATA_LABELS (HASHTAGS)</label>
                            <textarea
                                value={hashtags}
                                onChange={(e) => setHashtags(e.target.value)}
                                placeholder="#NEROZARB #DIGITAL_GROWTH..."
                                className="w-full bg-white/[0.02] border border-white/[0.06] p-5 text-sm font-sans text-text-primary focus:border-primary/40 outline-none resize-none min-h-[100px] transition-all"
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em] flex justify-between">
                            <span>VISUAL_BRIEFING</span>
                            <span className="text-primary/40 italic font-medium normal-case tracking-normal">{templateType.toUpperCase()} SYSTEM ACTIVE</span>
                        </label>
                        <textarea
                            value={visualBrief}
                            onChange={(e) => setVisualBrief(e.target.value)}
                            placeholder="DESCRIBE VISUAL EXECUTION. MOOD. COLORS. COMMAND."
                            className="w-full bg-white/[0.02] border border-primary/20 p-6 text-sm font-sans text-text-primary focus:border-primary/40 outline-none resize-none min-h-[120px] leading-relaxed transition-all"
                            rows={3}
                        />
                    </div>

                </section>

                {/* SECTION 3, 4, 5 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <section className="space-y-10">
                        <div className="flex items-center gap-4">
                          <span className="font-sans text-[11px] font-black tracking-[0.4em] text-primary/40">03</span>
                          <h4 className="font-sans text-[11px] font-black tracking-[0.3em] text-text-muted/60 uppercase">TEMPORAL_LOGISTICS</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">DEPLOY_DATE</label>
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/[0.06] p-5 text-[11px] font-black text-text-primary focus:border-primary/40 outline-none uppercase tracking-[0.2em] transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">DEPLOY_TIME</label>
                                <input
                                    type="time"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/[0.06] p-5 text-[11px] font-black text-text-primary focus:border-primary/40 outline-none uppercase tracking-[0.2em] transition-all"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">THREAT_LEVEL (PRIORITY)</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                    className="w-full bg-white/[0.02] border border-white/[0.06] p-5 text-[11px] font-black font-sans text-text-primary focus:border-primary/40 outline-none transition-all uppercase tracking-[0.2em] appearance-none cursor-pointer"
                                >
                                    <option value="normal">NORMAL_OPS</option>
                                    <option value="high">HIGH_PRIORITY</option>
                                    <option value="urgent">CRITICAL_URGENT</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">DEPLOY_STATE</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as PostStage)}
                                    className="w-full bg-white/[0.02] border border-white/[0.06] p-5 text-[11px] font-black font-sans text-text-primary focus:border-primary/40 outline-none transition-all uppercase tracking-[0.2em] appearance-none cursor-pointer"
                                >
                                    <option value="PLANNED">PLANNED</option>
                                    <option value="BRIEF WRITTEN">BRIEF_REGISTERED</option>
                                    <option value="IN PRODUCTION">IN_PRODUCTION</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-10">
                        <div className="flex items-center gap-4">
                          <span className="font-sans text-[11px] font-black tracking-[0.4em] text-primary/40">04</span>
                          <h4 className="font-sans text-[11px] font-black tracking-[0.3em] text-text-muted/60 uppercase">NODE_ASSIGNMENT</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">OPERATIONAL_NODE</label>
                                <select
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value as NodeRole)}
                                    className="w-full bg-white/[0.02] border border-white/[0.06] p-5 text-[11px] font-black font-sans text-text-primary focus:border-primary/40 outline-none transition-all uppercase tracking-[0.2em] appearance-none cursor-pointer"
                                >
                                    <option value="Art Director">ART_DIRECTOR</option>
                                    <option value="Video Editor">VIDEO_OPERATOR</option>
                                    <option value="Social Media Manager">SYSTEM_MANAGER</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">TASK_BRIDGE</label>
                                <select
                                    value={linkedTaskId}
                                    onChange={(e) => setLinkedTaskId(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full bg-white/[0.02] border border-white/[0.06] p-5 text-[11px] font-black font-sans text-text-primary focus:border-primary/40 outline-none transition-all uppercase tracking-[0.2em] appearance-none cursor-pointer"
                                >
                                    <option value="">NO_BRIDGE</option>
                                    {data.tasks.filter(t => t.status === 'active').map(t => (
                                        <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-4 sm:col-span-2">
                                <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">CORE_PROMPT_LINK</label>
                                <select
                                    value={linkedPromptId}
                                    onChange={(e) => setLinkedPromptId(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full bg-white/[0.02] border border-white/[0.06] p-5 text-[11px] font-black font-sans text-text-primary focus:border-primary/40 outline-none transition-all uppercase tracking-[0.2em] appearance-none cursor-pointer"
                                >
                                    <option value="">NO_PROMPT</option>
                                    {data.protocols.filter(p => p.category === 'ai-prompt').map(p => (
                                        <option key={p.id} value={p.id}>{p.title.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="font-sans text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">EXTERNAL_ASSET_LOG</label>
                            <input
                                value={assetLinks}
                                onChange={(e) => setAssetLinks(e.target.value)}
                                placeholder="LINK_CANVA_DRIVE_ETC..."
                                className="w-full bg-white/[0.02] border border-white/[0.06] p-5 text-[11px] font-black text-text-primary focus:border-primary/40 outline-none transition-all uppercase tracking-[0.2em]"
                            />
                        </div>
                    </section>
                </div>
            </div>
        </Modal>
    );
}

