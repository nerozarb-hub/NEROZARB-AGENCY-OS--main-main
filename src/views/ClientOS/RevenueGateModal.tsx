import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Client } from '../../utils/storage';

interface RevenueGateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClientCreated?: (clientId: number) => void;
}

export default function RevenueGateModal({ isOpen, onClose, onClientCreated }: RevenueGateModalProps) {
    const { addClient } = useAppData();

    const [formData, setFormData] = useState({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        niche: '',
        revenueGate: '',
        tier: '',
        contractValue: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Auto-calculate LTV based on initial contract value
        const cValue = parseFloat(formData.contractValue) || 0;

        const newClientObj: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> = {
            name: formData.name,
            contactName: formData.contactName,
            email: formData.email,
            phone: formData.phone,
            niche: formData.niche,
            revenueGate: formData.revenueGate,
            tier: formData.tier,
            contractValue: cValue,
            ltv: cValue,
            status: 'Lead',
            startDate: new Date().toISOString().split('T')[0],
            shadowAvatar: '',
            bleedingNeck: '',
            contentPillars: [],
            relationshipHealth: 'healthy',
            onboardingStatus: 'not-started',
            notes: '',
            timeline: [{
                id: Date.now(),
                date: new Date().toISOString(),
                event: 'Client Installed via Revenue Gate',
                type: 'system'
            }]
        };

        const newId = addClient(newClientObj);
        if (onClientCreated) {
            onClientCreated(newId);
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="space-y-1">
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">Asset Acquisition</p>
                    <h2 className="editorial-title text-3xl text-text-primary italic">Install Entity</h2>
                </div>
            }
            width={700}

            footer={
                <div className="flex justify-end gap-4 w-full">
                    <Button variant="ghost" onClick={onClose} className="font-sans text-[10px] font-black uppercase tracking-widest text-[#555] hover:text-text-primary">
                        Abort
                    </Button>
                    <Button
                        type="submit"
                        form="revenue-gate-form"
                        className="bg-primary hover:bg-accent-mid text-text-primary px-10 h-12 font-sans text-[10px] font-black uppercase tracking-[0.2em]"
                        disabled={!formData.name || !formData.revenueGate || !formData.tier}
                    >
                        Deploy Account
                    </Button>
                </div>

            }
        >
            <form id="revenue-gate-form" onSubmit={handleSubmit} className="space-y-10 py-2">

                {/* Basic Info */}
                <div className="space-y-6">
                    <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-4 italic">
                      01 · Entity Identity
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Client/Company Name"
                            placeholder="e.g. Mozart House"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label="Industry / Niche"
                            placeholder="e.g. Cultural Hub"
                            required
                            value={formData.niche}
                            onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                        />
                    </div>
                </div>

                {/* Point of Contact */}
                <div className="space-y-6">
                    <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-4 italic">
                      02 · Strategic Liaison
                    </h3>

                    <Input
                        label="Contact Name & Role"
                        placeholder="e.g. Ahmed (Creative Director)"
                        required
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="hello@company.com"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            label="Phone Number"
                            placeholder="+92 300 1234567"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                </div>

                {/* Revenue & Tier */}
                <div className="space-y-6">
                    <h3 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#555] uppercase border-b border-white/[0.04] pb-4 italic">
                      03 · Revenue Engineering
                    </h3>


                    <div className="space-y-4">
                        <label className="font-sans text-[10px] font-black text-[#666] uppercase tracking-widest">
                            Revenue Gate Qualification
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {['<1M PKR', '1M–5M PKR', '>5M PKR'].map(gate => (
                                <button
                                    key={gate}
                                    type="button"
                                    onClick={() => {
                                        let autoTier = formData.tier;
                                        let autoVal = formData.contractValue;
                                        if (gate === '<1M PKR') { autoTier = 'Tier 1: Active Presence'; autoVal = '100000'; }
                                        else if (gate === '1M–5M PKR') { autoTier = 'Tier 2: 60-Day Sprint'; autoVal = '250000'; }
                                        else if (gate === '>5M PKR') { autoTier = 'Tier 3: Market Dominance'; autoVal = '500000'; }
                                        setFormData({ ...formData, revenueGate: gate, tier: autoTier, contractValue: autoVal });
                                    }}
                                    className={`px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-300 ${formData.revenueGate === gate
                                        ? 'bg-primary/20 border-primary/40 text-primary'
                                        : 'bg-white/5 border-white/5 text-[#444] hover:border-[#666]'
                                        }`}
                                >
                                    {gate}
                                </button>
                            ))}
                        </div>

                    </div>

                    <div className="space-y-4 pt-4">
                        <label className="font-sans text-[10px] font-black text-[#666] uppercase tracking-widest">
                            Strategic Deployment Tier
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            {['Tier 1: Active Presence', 'Tier 2: 60-Day Sprint', 'Tier 3: Market Dominance'].map(tier => (
                                <button
                                    key={tier}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, tier: tier })}
                                    className={`p-6 text-left border transition-all flex justify-between items-center ${formData.tier === tier
                                        ? 'border-primary/40 bg-primary/10'
                                        : 'border-white/5 bg-white/[0.01] hover:border-white/20'
                                        }`}
                                >
                                    <span className={`font-sans text-[11px] font-black uppercase tracking-[0.2em] ${formData.tier === tier ? 'text-primary' : 'text-[#666]'}`}>
                                        {tier}
                                    </span>
                                    {formData.tier === tier && (
                                        <div className="w-1.5 h-1.5 bg-primary rotate-45" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>


                    <div className="pt-2">
                        <Input
                            label="Initial Contract Value (PKR)"
                            type="number"
                            placeholder="150000"
                            required
                            value={formData.contractValue}
                            onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
}

