import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Copy, TerminalSquare, AlertCircle, Edit2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Protocol } from '../../utils/storage';
import { useAppData } from '../../contexts/AppDataContext';

interface PromptDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    protocol: Protocol | null;
    onEdit: (protocol: Protocol) => void;
}

export function PromptDetailModal({ isOpen, onClose, protocol, onEdit }: PromptDetailModalProps) {
    const { recordPromptUsage } = useAppData();

    const [copied, setCopied] = useState(false);
    const [variables, setVariables] = useState<string[]>([]);
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});

    useEffect(() => {
        if (protocol && protocol.category === 'ai-prompt') {
            const regex = /\[\[(.*?)\]\]/g;
            const matches = Array.from(protocol.content.matchAll(regex));
            const uniqueVars = Array.from(new Set(matches.map(m => m[1])));
            setVariables(uniqueVars);
            setVariableValues(uniqueVars.reduce((acc, v) => ({ ...acc, [v]: '' }), {}));
        } else {
            setVariables([]);
            setVariableValues({});
        }
        setCopied(false);
    }, [protocol]);

    const handleCopy = () => {
        if (!protocol) return;
        let finalContent = protocol.content;

        Object.entries(variableValues).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
                const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                finalContent = finalContent.replace(new RegExp(`\\[\\[${escapedKey}\\]\\]`, 'g'), val.toString());
            }
        });

        navigator.clipboard.writeText(finalContent);
        recordPromptUsage(protocol.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderedContent = useMemo(() => {
        if (!protocol) return '';
        return Object.entries(variableValues).reduce((content, [key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return content.replace(
                    new RegExp(`\\[\\[${escapedKey}\\]\\]`, 'g'),
                    `<span class="bg-primary/5 text-primary border-b border-primary/20 px-1 font-black underline decoration-primary/40 underline-offset-4">${val.toUpperCase()}</span>`

                );
            }
            return content;
        }, protocol.content);
    }, [protocol, variableValues]);

    if (!protocol) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none shrink-0">
                        <TerminalSquare className="w-5 h-5 text-primary opacity-40" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="editorial-title text-3xl text-text-primary italic truncate">
                            Deployed Objective: {protocol.title}
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="font-sans text-[8px] font-black text-primary tracking-[0.2em] uppercase border border-primary/20 px-2 py-0.5 bg-primary/5">
                                {protocol.pillar}
                            </span>
                            {protocol.promptTool && (
                                <span className="font-sans text-[8px] font-black text-[#444] tracking-[0.2em] uppercase bg-white/[0.02] border border-white/5 px-2 py-0.5">
                                    VECTOR: {protocol.promptTool === 'both' ? 'AGNOSTIC' : protocol.promptTool.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            }

            width={1000}
            footer={
                <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-6">
                    <Button variant="ghost" onClick={() => onEdit(protocol)} className="font-sans text-[9px] font-black uppercase tracking-[0.2em] w-full sm:w-auto text-[#444] hover:text-text-primary">
                        <Edit2 className="w-3.5 h-3.5 mr-3" />
                        MODIFY TEMPLATE
                    </Button>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Button variant="ghost" onClick={onClose} className="text-[#333] hover:text-text-primary text-[9px] uppercase font-sans font-black tracking-widest">
                            ABORT
                        </Button>
                        <Button
                            onClick={handleCopy}
                            disabled={copied}
                            className={`flex-1 sm:flex-initial px-10 h-12 font-sans text-[9px] font-black uppercase tracking-[0.2em] transition-all ${copied
                                    ? 'bg-primary/20 text-primary border border-primary/20'
                                    : 'bg-primary hover:bg-accent-mid text-text-primary'
                                }`}
                        >
                            {copied ? (
                                <><CheckCircle2 className="w-4 h-4 mr-3" /> SIGNAL_COPIED</>
                            ) : (
                                <><Copy className="w-4 h-4 mr-3" /> DEPLOY SIGNAL</>
                            )}
                        </Button>
                    </div>
                </div>
            }

        >
            <div className="flex flex-col md:flex-row -m-8 h-full min-h-[600px]">
                {/* Left: Prompt Area */}
                <div className="flex-1 p-10 md:p-12 bg-white/[0.01] overflow-y-auto border-r border-white/5 custom-scrollbar">
                    <div className="space-y-8">
                        <h4 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#444] uppercase border-b border-white/[0.04] pb-6 italic">
                            Tactical Pulse Framework
                        </h4>
                        <div className="bg-[#0C0F14] border border-white/5 p-10 rounded-none shadow-2xl">
                            <pre className="font-sans text-[13px] text-text-primary whitespace-pre-wrap leading-relaxed select-all tracking-wide uppercase">
                                {renderedContent.split('\n').map((line, i) => (
                                    <div key={i} dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
                                ))}
                            </pre>
                        </div>
                    </div>
                </div>


                {/* Right: Variables sidebar */}
                <div className="w-full md:w-96 bg-transparent p-10 md:p-12 overflow-y-auto space-y-12 custom-scrollbar shrink-0">
                    <section className="space-y-10">
                        <h4 className="font-sans text-[9px] font-black tracking-[0.3em] text-primary uppercase border-b border-white/[0.04] pb-6 italic">
                            Variable Context
                        </h4>

                        {variables.length > 0 ? (
                            <div className="space-y-8">
                                <p className="text-[9px] text-[#444] leading-relaxed uppercase font-sans font-black tracking-widest">
                                    Populate the parameters below for template injection.
                                </p>
                                {variables.map((v, i) => (
                                    <div key={i} className="space-y-3">
                                        <label className="font-sans text-[8px] font-black text-[#333] uppercase tracking-[0.2em] block">
                                            [[{v.toUpperCase()}]]
                                        </label>
                                        <input
                                            placeholder={`Injected value...`}
                                            value={variableValues[v] || ''}
                                            onChange={(e) => setVariableValues({ ...variableValues, [v]: e.target.value })}
                                            className="w-full bg-white/[0.01] border border-white/5 outline-none text-[10px] p-4 rounded-none text-text-primary placeholder:text-[#222] font-sans font-bold tracking-widest focus:border-white/20 transition-all uppercase"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 px-6 border border-dashed border-white/5 rounded-none">
                                <p className="text-[9px] text-[#222] font-sans font-black uppercase tracking-widest leading-relaxed">
                                    No dynamic variables found in this sequence.
                                </p>
                            </div>
                        )}
                    </section>

                    {protocol.usageNotes && (
                        <section className="space-y-6">
                            <h4 className="font-sans text-[9px] font-black tracking-[0.3em] text-[#444] uppercase border-b border-white/[0.04] pb-6 italic">
                                Strategic Notes
                            </h4>
                            <p className="text-[10px] text-[#555] leading-relaxed font-sans font-black uppercase tracking-widest italic opacity-60">
                                "{protocol.usageNotes}"
                            </p>
                        </section>
                    )}
                </div>

            </div>
        </Modal>
    );
}

