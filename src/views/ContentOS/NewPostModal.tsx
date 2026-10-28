import { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../components/ui/Modal';
import { BookOpen, Save, Wand2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { useAppData } from '../../contexts/AppDataContext';
import { Platform, PostType, TemplateType, CTAType, PostStage, NodeRole } from '../../utils/storage';
import { resolvePromptContent } from '../../features/prompt-os/promptVault';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: any;
  prefilledDate?: string | null;
}

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'twitter', label: 'Twitter/X' },
];

const POST_TYPES: PostType[] = [
  'Reel / Short Video',
  'Static Post',
  'Carousel',
  'Story',
  'Text Post',
  'Event Post',
];
const TEMPLATES: TemplateType[] = ['Template A', 'Template B', 'Template C', 'Custom'];
const CTA_TYPES: CTAType[] = ['Comment', 'Link in bio', 'DM for', 'Save this', 'Share this', 'Custom'];

export default function NewPostModal({ isOpen, onClose, prefilledDate }: NewPostModalProps) {
  const { data, addPost, showToast } = useAppData();

  const clients = data.clients;

  const [clientId, setClientId] = useState<number | ''>('');
  const [platforms, setPlatforms] = useState<Platform[]>(['instagram']);
  const [postType, setPostType] = useState<PostType>('Static Post');
  const [contentPillar, setContentPillar] = useState('');
  const [templateType, setTemplateType] = useState<TemplateType>('Template A');

  const [hook, setHook] = useState('');
  const [triggerUsed, setTriggerUsed] = useState<string | null>(null);
  const [captionBody, setCaptionBody] = useState('');
  const [ctaType, setCtaType] = useState<CTAType>('Link in bio');
  const [customCta, setCustomCta] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [visualBrief, setVisualBrief] = useState('');

  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [status, setStatus] = useState<PostStage>('PLANNED');

  const [assignedTo, setAssignedTo] = useState<NodeRole>('Art Director');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [linkedTaskId, setLinkedTaskId] = useState<number | ''>('');
  const [linkedPromptId, setLinkedPromptId] = useState<string>('');
  const [assetLinks, setAssetLinks] = useState('');

  useEffect(() => {
    if (isOpen) {
      setScheduledDate(prefilledDate || new Date().toISOString().split('T')[0]);
      if (clientId === '' && clients[0]?.id) {
        setClientId(clients[0].id);
      }
      if (postType === 'Reel / Short Video') setAssignedTo('Video Editor');
      else if (postType === 'Story' || postType === 'Text Post') setAssignedTo('Social Media Manager');
      else setAssignedTo('Art Director');
    }
  }, [isOpen, prefilledDate, postType, clients, clientId]);

  const selectedClient = useMemo(
    () => (clientId !== '' ? clients.find(c => c.id === Number(clientId)) || null : null),
    [clientId, clients]
  );

  const selectedClientPillars = useMemo(
    () => (selectedClient ? selectedClient.contentPillars || [] : []),
    [selectedClient]
  );

  const selectedPrompt = useMemo(
    () => data.promptTemplates.find(p => p.id === linkedPromptId) || null,
    [data.promptTemplates, linkedPromptId]
  );

  const handleApplyPromptToPost = () => {
    if (!selectedPrompt) return;
    const resolved = resolvePromptContent(selectedPrompt.content, {
      client: selectedClient,
      includeClientContext: Boolean(selectedClient),
    });
    if (!hook.trim()) {
      setHook(selectedPrompt.title);
    }
    setVisualBrief(resolved);
    showToast('Resolved prompt inserted into Visual & Production Brief');
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
      contentPillar: contentPillar || 'General',
      templateType,
      hook: hook.trim() || 'Untitled Post',
      triggerUsed,
      captionBody: captionBody.trim(),
      cta: ctaType === 'Custom' ? customCta : ctaType,
      ctaType,
      hashtags,
      visualBrief: visualBrief.trim(),
      scheduledDate,
      scheduledTime,
      publishedDate: null,
      status,
      priority,
      assignedTo,
      assigneeId: assigneeId || null,
      linkedTaskId: linkedTaskId !== '' ? Number(linkedTaskId) : null,
      linkedPromptId: linkedPromptId || null,
      assetLinks: assetLinks
        ? assetLinks
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : [],
      referencePost: null,
      performance: null,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width={880}
      title={
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Schedule Content Post</h2>
          <p className="text-xs text-text-muted mt-1">
            Plan social content, attach a saved prompt from Prompt OS, and assign production.
          </p>
        </div>
      }
      footer={
        <div className="flex justify-end items-center gap-3 w-full">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={clientId === '' || !scheduledDate}>
            <Save size={15} />
            Save Post
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Client & Platforms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="new-post-client" className="mb-2 block text-sm font-medium text-text-secondary">
              Client *
            </label>
            <select
              id="new-post-client"
              value={clientId}
              onChange={e => setClientId(e.target.value === '' ? '' : Number(e.target.value))}
              className="min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="">Select client</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary">Platforms</label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={`min-h-10 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    platforms.includes(p.id)
                      ? 'bg-primary text-onyx border-primary font-semibold'
                      : 'bg-onyx border-border-dark text-text-secondary hover:bg-white/[0.04]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Format, Pillar, Template */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="new-post-format" className="mb-2 block text-sm font-medium text-text-secondary">
              Format
            </label>
            <select
              id="new-post-format"
              value={postType}
              onChange={e => setPostType(e.target.value as PostType)}
              className="min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              {POST_TYPES.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="new-post-pillar" className="mb-2 block text-sm font-medium text-text-secondary">
              Content Pillar
            </label>
            <select
              id="new-post-pillar"
              value={contentPillar}
              onChange={e => setContentPillar(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="">General</option>
              {selectedClientPillars.map(pillar => (
                <option key={pillar} value={pillar}>
                  {pillar}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="new-post-template" className="mb-2 block text-sm font-medium text-text-secondary">
              Layout Template
            </label>
            <select
              id="new-post-template"
              value={templateType}
              onChange={e => setTemplateType(e.target.value as TemplateType)}
              className="min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              {TEMPLATES.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prompt OS Linker */}
        <div className="rounded-lg border border-border-dark bg-onyx/70 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="new-post-prompt"
              className="text-xs font-semibold text-text-secondary flex items-center gap-1.5"
            >
              <BookOpen size={14} className="text-primary" />
              <span>Link Prompt from Prompt OS Vault</span>
            </label>
            {selectedPrompt && (
              <button
                type="button"
                onClick={handleApplyPromptToPost}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 border border-primary/30 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/25 transition-colors"
              >
                <Wand2 size={13} />
                <span>Fill Brief with Prompt</span>
              </button>
            )}
          </div>

          <select
            id="new-post-prompt"
            value={linkedPromptId}
            onChange={e => setLinkedPromptId(e.target.value)}
            className="min-h-10 w-full rounded-lg border border-border-dark bg-card px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="">No prompt linked</option>
            {data.promptTemplates
              .filter(p => p.status !== 'archived')
              .map(p => (
                <option key={p.id} value={p.id}>
                  [{p.category}] {p.title}
                </option>
              ))}
          </select>
        </div>

        {/* Hook, Caption & Visual Brief */}
        <Input
          label="Primary Hook / Headline"
          value={hook}
          onChange={e => setHook(e.target.value)}
          placeholder="Scroll-stopping opening line or video hook..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            label="Caption / Script Body"
            value={captionBody}
            onChange={e => setCaptionBody(e.target.value)}
            rows={4}
            placeholder="Write the post caption or spoken video script..."
          />
          <Textarea
            label="Visual & Art Direction Brief"
            value={visualBrief}
            onChange={e => setVisualBrief(e.target.value)}
            rows={4}
            placeholder="Describe the visual style, B-roll cues, or insert a prompt from Prompt OS above..."
          />
        </div>

        {/* CTA & Hashtags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="new-post-cta" className="mb-2 block text-sm font-medium text-text-secondary">
              Call to Action (CTA)
            </label>
            <select
              id="new-post-cta"
              value={ctaType}
              onChange={e => setCtaType(e.target.value as CTAType)}
              className="min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              {CTA_TYPES.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {ctaType === 'Custom' && (
              <input
                value={customCta}
                onChange={e => setCustomCta(e.target.value)}
                placeholder="Enter custom CTA..."
                className="mt-2 min-h-10 w-full rounded-lg border border-border-dark bg-onyx px-3.5 text-sm text-text-primary"
              />
            )}
          </div>

          <Input
            label="Hashtags"
            value={hashtags}
            onChange={e => setHashtags(e.target.value)}
            placeholder="#brand #growth"
          />
        </div>

        {/* Schedule & Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-border-dark">
          <Input
            label="Scheduled Date"
            type="date"
            value={scheduledDate}
            onChange={e => setScheduledDate(e.target.value)}
          />
          <Input
            label="Time"
            type="time"
            value={scheduledTime}
            onChange={e => setScheduledTime(e.target.value)}
          />
          <div>
            <label htmlFor="new-post-role" className="mb-2 block text-sm font-medium text-text-secondary">
              Assigned Role
            </label>
            <select
              id="new-post-role"
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value as NodeRole)}
              className="min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="Art Director">Art Director</option>
              <option value="Video Editor">Video Editor</option>
              <option value="Social Media Manager">Social Media Manager</option>
            </select>
          </div>
          <div>
            <label htmlFor="new-post-priority" className="mb-2 block text-sm font-medium text-text-secondary">
              Priority
            </label>
            <select
              id="new-post-priority"
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
