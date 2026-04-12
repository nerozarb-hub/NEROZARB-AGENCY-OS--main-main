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
        <Card className="p-10 bg-white/[0.01] border-white/5 space-y-10">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-6">
                <div className="flex items-center gap-4">
                    <Link size={16} className="text-primary/60" />
                    <h3 className="editorial-title text-2xl italic">Portal Infrastructure</h3>
                </div>

                {!client.magicLinkToken ? (
                    <Button onClick={() => generateMagicLink(clientId)} size="sm" className="bg-primary hover:bg-accent-mid text-text-primary font-sans text-[9px] font-black tracking-[0.2em] px-6 h-10">
                        GENERATE ACCESS TOKEN
                    </Button>
                ) : (
                    <Button onClick={handleCopyLink} size="sm" variant="ghost" className="text-primary font-sans text-[9px] font-black tracking-[0.2em] px-4 group hover:bg-primary/5">
                        <Copy size={12} className="mr-2 opacity-50 group-hover:opacity-100" /> COPY SECURE LINK
                    </Button>
                )}
            </div>


            {client.magicLinkToken && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Phases Manager */}
                    <div className="space-y-6">
                        <h4 className="font-sans text-[9px] font-black text-[#444] tracking-[0.3em] uppercase mb-4">Tactical Roadmap Phases</h4>


                        <div className="space-y-3">
                            {(client.projectPhases || []).map((phase: ProjectPhase) => (
                                <div key={phase.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5">
                                    <span className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-widest">{phase.title}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateProjectPhase(clientId, phase.id, 'pending')}
                                            className={`p-1.5 border ${phase.status === 'pending' ? 'text-text-primary border-primary/40 bg-primary/10' : 'text-[#333] border-transparent hover:border-white/10'}`}
                                            title="Pending"
                                        ><Square size={14} /></button>
                                        <button
                                            onClick={() => updateProjectPhase(clientId, phase.id, 'in_progress')}
                                            className={`p-1.5 border ${phase.status === 'in_progress' ? 'text-primary border-primary/40 bg-primary/10' : 'text-[#333] border-transparent hover:border-white/10'}`}
                                            title="In Progress"
                                        ><div className="w-3.5 h-3.5 border-2 border-current border-t-transparent animate-spin" /></button>
                                        <button
                                            onClick={() => updateProjectPhase(clientId, phase.id, 'completed')}
                                            className={`p-1.5 border ${phase.status === 'completed' ? 'text-primary border-primary/40 bg-primary/10' : 'text-[#333] border-transparent hover:border-white/10'}`}
                                            title="Completed"
                                        ><CheckCircle2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>


                        <form onSubmit={handleAddPhase} className="flex gap-3 pt-2">
                            <input
                                type="text"
                                value={newPhaseTitle}
                                onChange={e => setNewPhaseTitle(e.target.value)}
                                placeholder="IDENTIFY NEW PHASE..."
                                className="flex-1 bg-white/[0.02] border border-white/5 p-4 text-[10px] font-bold font-sans text-text-primary placeholder:text-[#333] outline-none focus:border-text-muted/30 transition-all uppercase tracking-widest"
                            />
                            <Button type="submit" size="sm" className="bg-white/5 hover:border-white/20 border border-white/5 text-text-primary px-5 h-[50px] transition-all">
                                <Plus size={16} />
                            </Button>
                        </form>
                    </div>


                    {/* Quick Updates Broadcaster */}
                    <div className="space-y-6">
                        <h4 className="font-sans text-[9px] font-black text-[#444] tracking-[0.3em] uppercase mb-4">Transmission Broadcast</h4>
                        <form onSubmit={handleAddUpdate} className="space-y-4">
                            <textarea
                                value={newUpdateMsg}
                                onChange={e => setNewUpdateMsg(e.target.value)}
                                placeholder="DEPLOY QUICK INTELLIGENCE UPDATE TO PORTAL..."
                                className="w-full h-24 bg-white/[0.02] border border-white/5 p-4 text-[11px] font-sans text-text-muted placeholder:text-[#333] outline-none focus:border-text-muted/30 transition-all resize-none custom-scrollbar leading-relaxed"
                            />
                            <Button type="submit" size="sm" className="w-full bg-primary hover:bg-accent-mid text-text-primary font-sans text-[9px] font-black tracking-[0.2em] h-12">
                                <Send size={12} className="mr-2 opacity-60" /> BROADCAST TO ENTITY
                            </Button>
                        </form>


                        <div className="pt-4">
                            <p className="text-[9px] text-[#444] mb-4 font-sans font-black uppercase tracking-[0.3em] border-b border-white/[0.04] pb-2">Transmission Log</p>
                            <div className="space-y-3 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
                                {(client.clientUpdates || []).slice(0, 3).map(update => (
                                    <div key={update.id} className="p-4 bg-white/[0.02] border border-white/5 text-[10px] font-sans text-text-muted leading-relaxed uppercase tracking-widest">
                                        <span className="text-[8px] text-[#444] font-black block mb-2 tracking-[0.2em]">
                                            {new Date(update.createdAt || '').toLocaleDateString().toUpperCase()}
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
