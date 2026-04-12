import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Client } from '../../utils/storage';

interface ClientEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
}

export default function ClientEditModal({ isOpen, onClose, client }: ClientEditModalProps) {
    const { updateClient, data, setData } = useAppData();
    const authLevel = sessionStorage.getItem('authLevel') || 'team';

    const [formData, setFormData] = useState({
        name: client.name,
        contactName: client.contactName,
        email: client.email,
        phone: client.phone,
        niche: client.niche,
        tier: client.tier,
        shadowAvatar: client.shadowAvatar,
        bleedingNeck: client.bleedingNeck,
        relationshipHealth: client.relationshipHealth,
        newLogEvent: ''
    });

    useEffect(() => {
        setFormData({
            name: client.name,
            contactName: client.contactName,
            email: client.email,
            phone: client.phone,
            niche: client.niche,
            tier: client.tier,
            shadowAvatar: client.shadowAvatar,
            bleedingNeck: client.bleedingNeck,
            relationshipHealth: client.relationshipHealth,
            newLogEvent: ''
        });
    }, [client]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const updates: Partial<Client> = {
            name: formData.name,
            contactName: formData.contactName,
            email: formData.email,
            phone: formData.phone,
            niche: formData.niche,
            tier: formData.tier,
            shadowAvatar: formData.shadowAvatar,
            bleedingNeck: formData.bleedingNeck,
            relationshipHealth: formData.relationshipHealth as 'healthy' | 'at-risk' | 'critical',
        };

        if (formData.newLogEvent.trim()) {
            setData(prev => ({
                ...prev,
                clients: prev.clients.map(c => {
                    if (c.id === client.id) {
                        return {
                            ...c,
                            ...updates,
                            updatedAt: new Date().toISOString(),
                            timeline: [
                                ...c.timeline,
                                {
                                    id: Date.now(),
                                    date: new Date().toISOString(),
                                    event: formData.newLogEvent,
                                    type: 'manual'
                                }
                            ]
                        };
                    }
                    return c;
                })
            }));
        } else {
            updateClient(client.id, updates);
        }

        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="space-y-1">
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">Entity Configuration</p>
                    <h2 className="editorial-title text-3xl text-text-primary italic">Refine Profile</h2>
                </div>
            }
            width={700}

            footer={
                <div className="flex justify-end gap-4 w-full">
                    <Button variant="ghost" onClick={onClose} className="font-sans text-[10px] font-black uppercase tracking-widest text-[#555] hover:text-text-primary">
                        Abort
                    </Button>
                    <Button type="submit" form="edit-client-form" className="bg-primary hover:bg-accent-mid text-text-primary px-10 h-12 font-sans text-[10px] font-black uppercase tracking-[0.2em]">
                        Commit Changes
                    </Button>
                </div>

            }
        >
            <form id="edit-client-form" onSubmit={handleSubmit} className="space-y-10 py-2">
                <p className="font-sans text-[9px] font-black text-[#333] tracking-[0.4em] uppercase -mt-6 mb-6">Registry Hash: 00{client.id} · Alpha Protocol</p>


                <div className="space-y-6">
                    <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-4 italic">01 · Profile Identity</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Client Name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label="Industry / Niche"
                            required
                            value={formData.niche}
                            onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-4 italic">02 · Tactical Contact</h3>

                    <Input
                        label="Contact Name & Role"
                        required
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Email Address"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            label="Phone Number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-4 italic">03 · Intelligence Assets</h3>

                    <div className="space-y-4">
                        <div className="space-y-3">
                            <label className="font-sans text-[10px] font-black text-[#666] uppercase tracking-widest">Shadow Avatar Profile</label>
                            <textarea
                                value={formData.shadowAvatar}
                                onChange={(e) => setFormData({ ...formData, shadowAvatar: e.target.value })}
                                className="w-full bg-white/[0.02] border border-white/[0.05] p-5 text-sm font-sans text-text-muted focus:border-text-muted/20 outline-none resize-none min-h-[100px] leading-relaxed"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="font-sans text-[10px] font-black text-[#666] uppercase tracking-widest">Bleeding Neck Intelligence</label>
                            <textarea
                                value={formData.bleedingNeck}
                                onChange={(e) => setFormData({ ...formData, bleedingNeck: e.target.value })}
                                className="w-full bg-white/[0.02] border border-white/[0.05] p-5 text-sm font-sans text-text-muted focus:border-text-muted/20 outline-none resize-none min-h-[100px] leading-relaxed"
                            />
                        </div>

                    </div>
                </div>

                {authLevel === 'ceo' && (
                    <div className="space-y-8 pt-6 border-t border-white/[0.04]">
                        <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-primary/60 uppercase italic">04 · Executive Override</h3>
                        <div className="space-y-4">
                            <label className="font-sans text-[10px] font-black text-[#666] uppercase tracking-widest">Stability Override</label>
                            <div className="flex flex-wrap gap-3">
                                {['healthy', 'at-risk', 'critical'].map(health => (
                                    <button
                                        key={health}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, relationshipHealth: health })}
                                        className={`px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-300 ${formData.relationshipHealth === health ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/5 text-[#444] hover:border-[#666]'}`}
                                    >
                                      {health}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3 pt-2">
                            <label className="font-sans text-[10px] font-black text-[#666] uppercase tracking-widest">Temporal Log Persistence</label>
                            <input
                                placeholder="APPEND KEY EVENT TO TIMELINE..."
                                value={formData.newLogEvent}
                                onChange={(e) => setFormData({ ...formData, newLogEvent: e.target.value })}
                                className="w-full bg-white/[0.02] border border-white/[0.05] p-4 text-xs font-bold font-sans text-text-primary focus:border-text-muted/20 outline-none transition-all uppercase tracking-widest"
                            />
                        </div>
                    </div>
                )}

            </form>
        </Modal>
    );
}

