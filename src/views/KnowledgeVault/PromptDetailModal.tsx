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
                    `<span class="bg-primary/20 text-primary border-b border-primary/40 px-0.5 rounded-t-sm">${val}</span>`
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
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-sm shrink-0">
                        <TerminalSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-heading text-xl text-text-primary uppercase tracking-wider truncate">
                            {protocol.title}
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[9px] text-primary tracking-widest uppercase border border-primary/30 px-1.5 py-0.5 rounded-sm bg-primary/10">
                                {protocol.pillar}
                            </span>
                            {protocol.promptTool && (
                                <span className="font-mono text-[9px] text-text-muted tracking-widest uppercase bg-border-dark/30 px-1.5 py-0.5 rounded-sm">
                                    {protocol.promptTool === 'both' ? 'AGNOSTIC' : protocol.promptTool.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            }
            width={1000}
            footer={
                <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
                    <Button variant="outline" onClick={() => onEdit(protocol)} className="font-mono text-[10px] uppercase w-full sm:w-auto h-11">
                        <Edit2 className="w-3.5 h-3.5 mr-2" />
                        EDIT TEMPLATE
                    </Button>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="ghost" onClick={onClose} className="text-text-muted hover:text-text-primary text-[10px] uppercase font-mono">
                            CLOSE
                        </Button>
                        <Button
                            onClick={handleCopy}
                            disabled={copied}
                            className={`flex-1 sm:flex-initial min-w-[200px] h-11 font-mono text-[10px] uppercase tracking-widest transition-all ${copied
                                    ? 'bg-primary/20 text-primary border border-primary/50'
                                    : 'bg-primary hover:bg-accent-mid text-text-primary'
                                }`}
                        >
                            {copied ? (
                                <><CheckCircle2 className="w-4 h-4 mr-2" /> [ COPIED ]</>
                            ) : (
                                <><Copy className="w-4 h-4 mr-2" /> COPY PROMPT</>
                            )}
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col md:flex-row -m-6 h-full min-h-[500px]">
                {/* Left: Prompt Area */}
                <div className="flex-1 p-6 md:p-8 bg-background/50 overflow-y-auto border-r border-border-dark custom-scrollbar">
                    <div className="space-y-4">
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-muted border-b border-border-dark pb-2">
                            RAW PROMPT TEMPLATE
                        </h4>
                        <div className="bg-[#0c0e12] border border-border-dark p-6 rounded-sm">
                            <pre className="font-mono text-sm text-text-primary whitespace-pre-wrap leading-relaxed select-all">
                                {renderedContent.split('\n').map((line, i) => (
                                    <div key={i} dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
                                ))}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Right: Variables sidebar */}
                <div className="w-full md:w-80 bg-card p-6 md:p-8 overflow-y-auto space-y-8 custom-scrollbar shrink-0">
                    <section className="space-y-6">
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-primary flex items-center gap-2 border-b border-border-dark pb-2">
                            <AlertCircle className="w-3 h-3" />
                            VARIABLES
                        </h4>

                        {variables.length > 0 ? (
                            <div className="space-y-4">
                                <p className="text-[10px] text-text-muted leading-relaxed uppercase font-mono">
                                    Fill the fields below to populate the prompt.
                                </p>
                                {variables.map((v, i) => (
                                    <div key={i} className="space-y-2">
                                        <label className="font-mono text-[10px] text-text-muted uppercase tracking-tight block">
                                            [[{v}]]
                                        </label>
                                        <input
                                            placeholder={`Enter value...`}
                                            value={variableValues[v] || ''}
                                            onChange={(e) => setVariableValues({ ...variableValues, [v]: e.target.value })}
                                            className="w-full bg-background border border-border-dark outline-none text-xs p-3 rounded-sm text-text-primary placeholder:text-text-muted/30 font-mono focus:border-primary transition-all"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 px-4 border border-dashed border-border-dark rounded-sm">
                                <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest leading-relaxed">
                                    No dynamic variables found in this prompt.
                                </p>
                            </div>
                        )}
                    </section>

                    {protocol.usageNotes && (
                        <section className="space-y-4">
                            <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-muted border-b border-border-dark pb-2">
                                USAGE NOTES
                            </h4>
                            <p className="text-xs text-text-muted leading-relaxed font-mono italic">
                                "{protocol.usageNotes}"
                            </p>
                        </section>
                    )}
                </div>
            </div>
        </Modal>
    );
}

