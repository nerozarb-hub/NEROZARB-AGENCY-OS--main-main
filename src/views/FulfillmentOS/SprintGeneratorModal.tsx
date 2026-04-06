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
                <div>
                    <h2 className="font-heading text-xl text-text-primary uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        Initialize Sprint 01
                    </h2>
                    <p className="font-mono text-[10px] text-text-muted mt-0.5 tracking-widest uppercase">Automation Protocol: Phase 1 Onboarding</p>
                </div>
            }
            footer={
                <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
                    <Button variant="ghost" onClick={onClose} className="font-mono text-[10px] uppercase tracking-widest w-full sm:w-auto h-11">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={selectedClientId === ''}
                        className="font-mono text-[10px] uppercase tracking-widest bg-primary hover:bg-accent-mid text-text-primary min-w-[200px] w-full sm:w-auto h-11"
                    >
                        Execute Protocol
                    </Button>
                </div>
            }
        >
            <div className="space-y-8 py-2">
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-sm flex gap-4">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-[11px] text-text-secondary leading-relaxed font-mono uppercase">
                        This sequence automates the creation of the standard 7-task Phase 1 pipeline for a new client.
                        deadline distribution is relative to client start date (+3 to +14 days).
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase text-text-muted tracking-widest pl-1">
                        Select Target Client
                    </label>
                    <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(Number(e.target.value))}
                        className="w-full bg-background rounded-sm px-4 py-4 text-sm font-mono text-text-primary focus:outline-none focus:border-primary transition-colors appearance-none border border-border-dark"
                    >
                        <option value="" disabled>SELECT CLIENT...</option>
                        {data.clients.map((client) => (
                            <option key={client.id} value={client.id}>{client.name.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-2 border-b border-border-dark pb-2">
                        <List className="w-3 h-3 text-primary" />
                        INJECTED TASK SEQUENCE
                    </h4>
                    <div className="bg-[#0c0e12] border border-border-dark rounded-sm overflow-hidden">
                        <ul className="divide-y divide-border-dark/30 font-mono text-[10px] text-text-secondary uppercase">
                            {[
                                { id: 1, title: 'Brand & Positioning Audit', day: 3 },
                                { id: 2, title: 'Competitor Analysis', day: 4 },
                                { id: 3, title: 'Website Critique', day: 5 },
                                { id: 4, title: 'Shadow Avatar Refinement', day: 6 },
                                { id: 5, title: 'Content Pillars & Month 1 Plan', day: 10 },
                                { id: 6, title: 'Brand Visual Direction', day: 12 },
                                { id: 7, title: 'Phase 1 Delivery + CEO Review', day: 14 },
                            ].map((task) => (
                                <li key={task.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-primary font-bold">[{task.id}]</span>
                                        <span className="group-hover:text-text-primary transition-colors">{task.title}</span>
                                    </div>
                                    <span className="text-text-muted text-[9px] tracking-tighter opacity-60">DAY_{task.day}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
