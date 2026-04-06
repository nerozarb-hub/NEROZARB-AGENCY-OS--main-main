import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAppData } from '../../contexts/AppDataContext';
import { Link, Copy, Plus, Send, CheckCircle2, Circle } from 'lucide-react';
import { Client, ProjectPhase } from '../../utils/storage';

export default function ClientPortalManager({ clientId }: { clientId: number }) {
    const { data, generateMagicLink, addProjectPhase, updateProjectPhase, addClientUpdate, showToast } = useAppData();
    const client = data.clients.find(c => c.id === clientId) as Client;

    const [newPhaseTitle, setNewPhaseTitle] = useState('');
    const [newUpdateMsg, setNewUpdateMsg] = useState('');

    if (!client) return null;

    const handleCopyLink = () => {
        if (!client.magicLinkToken) return;
        const url = `${window.location.origin}/portal/${client.magicLinkToken}`;
        navigator.clipboard.writeText(url);
        showToast('Magic Link copied to clipboard');
    };

    const handleAddPhase = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPhaseTitle.trim()) return;
        addProjectPhase(clientId, newPhaseTitle.trim());
        setNewPhaseTitle('');
        showToast('Phase added');
    };

    const handleAddUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUpdateMsg.trim()) return;
        addClientUpdate(clientId, newUpdateMsg.trim());
        setNewUpdateMsg('');
        showToast('Update broadcasted to client portal');
    };

    return (
        <Card className="p-6 border-border-dark space-y-6">
            <div className="flex items-center justify-between border-b border-border-dark pb-4">
                <div className="flex items-center gap-3">
                    <Link size={18} className="text-primary" />
                    <h3 className="font-heading text-sm font-black tracking-tight uppercase">Client Portal Settings</h3>
                </div>
                {!client.magicLinkToken ? (
                    <Button onClick={() => generateMagicLink(clientId)} size="sm" className="bg-primary hover:bg-accent-mid text-text-primary font-mono text-[10px] tracking-widest px-4">
                        GENERATE MAGIC LINK
                    </Button>
                ) : (
                    <Button onClick={handleCopyLink} size="sm" variant="outline" className="border-border-dark text-text-primary hover:border-primary font-mono text-[10px] tracking-widest px-4">
                        <Copy size={12} className="mr-2" /> COPY LINK
                    </Button>
                )}
            </div>

            {client.magicLinkToken && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Phases Manager */}
                    <div className="space-y-4">
                        <h4 className="font-mono text-[10px] text-text-muted tracking-widest uppercase mb-2">Project Phases (Timeline)</h4>

                        <div className="space-y-2">
                            {(client.projectPhases || []).map((phase: ProjectPhase) => (
                                <div key={phase.id} className="flex items-center justify-between p-3 bg-surface border border-border-dark rounded-sm">
                                    <span className="text-xs text-text-primary">{phase.title}</span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => updateProjectPhase(clientId, phase.id, 'pending')}
                                            className={`p-1 rounded ${phase.status === 'pending' ? 'text-text-primary bg-card-alt' : 'text-text-muted'}`}
                                            title="Pending"
                                        ><Circle size={14} /></button>
                                        <button
                                            onClick={() => updateProjectPhase(clientId, phase.id, 'in_progress')}
                                            className={`p-1 rounded ${phase.status === 'in_progress' ? 'text-accent-light bg-card-alt' : 'text-text-muted'}`}
                                            title="In Progress"
                                        ><div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /></button>
                                        <button
                                            onClick={() => updateProjectPhase(clientId, phase.id, 'completed')}
                                            className={`p-1 rounded ${phase.status === 'completed' ? 'text-primary bg-card-alt' : 'text-text-muted'}`}
                                            title="Completed"
                                        ><CheckCircle2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddPhase} className="flex gap-2">
                            <input
                                type="text"
                                value={newPhaseTitle}
                                onChange={e => setNewPhaseTitle(e.target.value)}
                                placeholder="New phase name..."
                                className="flex-1 bg-surface border border-border-dark rounded-sm px-3 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
                            />
                            <Button type="submit" size="sm" className="bg-card-alt hover:bg-surface border border-border-dark text-text-primary px-3">
                                <Plus size={14} />
                            </Button>
                        </form>
                    </div>

                    {/* Quick Updates Broadcaster */}
                    <div className="space-y-4">
                        <h4 className="font-mono text-[10px] text-text-muted tracking-widest uppercase mb-2">Broadcast Update</h4>
                        <form onSubmit={handleAddUpdate} className="space-y-3">
                            <textarea
                                value={newUpdateMsg}
                                onChange={e => setNewUpdateMsg(e.target.value)}
                                placeholder="Type a quick update to send to the client's portal..."
                                className="w-full h-24 bg-surface border border-border-dark rounded-sm px-3 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors resize-none custom-scrollbar"
                            />
                            <Button type="submit" size="sm" className="w-full bg-primary hover:bg-accent-mid text-text-primary font-mono text-[10px] tracking-widest">
                                <Send size={12} className="mr-2" /> BROADCAST TO PORTAL
                            </Button>
                        </form>

                        <div className="pt-2">
                            <p className="text-[10px] text-text-muted mb-2 font-mono uppercase tracking-widest">Recent Broadcasts</p>
                            <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                                {(client.clientUpdates || []).slice(0, 3).map(update => (
                                    <div key={update.id} className="p-2 bg-surface/50 border border-border-dark/50 rounded-sm text-xs text-text-secondary leading-snug">
                                        <span className="text-[9px] text-text-muted font-mono block mb-1">
                                            {new Date(update.createdAt || '').toLocaleDateString()}
                                        </span>
                                        {update.message}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
