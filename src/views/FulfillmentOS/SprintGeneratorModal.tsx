import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { Zap, List, Target, ShieldCheck } from 'lucide-react';

interface SprintGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SprintGeneratorModal({ isOpen, onClose }: SprintGeneratorModalProps) {
    const { data, generateSprintTasks } = useAppData();
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');

    const handleGenerate = () => {
        if (selectedClientId === '') return;

        generateSprintTasks(Number(selectedClientId));
        setSelectedClientId('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="space-y-3">
                    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-primary/80">Automated Vector</p>
                    <h2 className="font-heading text-4xl text-text-primary uppercase tracking-tighter leading-none">Execute Lifecycle Loop</h2>
                </div>
            }

            footer={
                <div className="flex flex-col sm:flex-row justify-end gap-4 w-full">
                    <Button variant="ghost" onClick={onClose} className="px-8">
                        Abort
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={selectedClientId === ''}
                        className="bg-primary hover:bg-accent-mid text-text-primary px-10"
                    >
                        Execute Protocol
                    </Button>
                </div>
            }

        >
            <div className="space-y-10 py-2">
                <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-none flex gap-6">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5 opacity-60" />
                    <p className="text-[11px] text-text-muted/60 font-medium uppercase leading-relaxed tracking-widest">
                        This sequence automates the creation of the standard 7-task Phase 1 pipeline for a new client.
                        Temporal distribution is relative to the client initialization date.
                    </p>
                </div>


                <div className="space-y-3">
                    <label className="font-sans text-[11px] font-bold text-text-muted/60 uppercase tracking-widest pl-1">
                        Target Entity
                    </label>
                    <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(Number(e.target.value))}
                        className="w-full bg-white/[0.02] border border-white/[0.06] rounded-none px-6 py-4 h-12 text-[11px] font-bold font-sans text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all appearance-none uppercase tracking-widest"
                    >
                        <option value="" disabled className="bg-sidebar">SELECT ENTITY...</option>
                        {data.clients.map((client) => (
                            <option key={client.id} value={client.id} className="bg-sidebar">{client.name.toUpperCase()}</option>
                        ))}
                    </select>
                </div>


                <div className="space-y-6">
                    <h4 className="font-sans text-[11px] font-bold tracking-[0.3em] text-text-muted/40 uppercase border-b border-white/[0.04] pb-5">
                        Injected Objective Pulse
                    </h4>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-none overflow-hidden">
                        <ul className="divide-y divide-white/[0.04] font-sans text-[11px] font-bold text-text-muted/40 uppercase tracking-widest">
                            {[
                                { id: 1, title: 'Brand & Positioning Audit', day: 3 },
                                { id: 2, title: 'Competitor Analysis', day: 4 },
                                { id: 3, title: 'Website Critique', day: 5 },
                                { id: 4, title: 'Shadow Avatar Refinement', day: 6 },
                                { id: 5, title: 'Content Pillars & Month 1 Plan', day: 10 },
                                { id: 6, title: 'Brand Visual Direction', day: 12 },
                                { id: 7, title: 'Phase 1 Delivery + CEO Review', day: 14 },
                            ].map((task) => (
                                <li key={task.id} className="flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-all group">
                                    <div className="flex items-center gap-6">
                                        <span className="text-primary/60 font-bold">0{task.id}</span>
                                        <span className="group-hover:text-text-primary transition-colors">{task.title}</span>
                                    </div>
                                    <span className="text-text-muted/20 text-[10px] font-bold tracking-widest">DAY_{task.day}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </Modal>
    );
}
