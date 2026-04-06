import React from 'react';
import { Protocol } from '../../utils/storage';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Copy, Bot, CopyPlus } from 'lucide-react';

interface AiPromptCardProps {
    protocol: Protocol;
    onClick: () => void;
    onCopy: (e: React.MouseEvent) => void;
    onDuplicate: (e: React.MouseEvent) => void;
    copiedState: boolean;
}

export const AiPromptCard: React.FC<AiPromptCardProps> = ({ protocol, onClick, onCopy, onDuplicate, copiedState }) => {

    // Tools indicator
    const renderToolIcon = () => {
        if (!protocol.promptTool) return null;
        const letter = protocol.promptTool === 'both' ? 'G/C' : protocol.promptTool === 'gemini' ? 'G' : 'C';
        return (
            <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 border border-zinc-700 rounded-sm px-1 py-0.5">
                <Bot className="w-3 h-3" />
                <span>{letter}</span>
            </div>
        );
    }

    return (
        <Card
            onClick={onClick}
            className="group relative bg-[#0A0A0A] transition-all cursor-pointer flex flex-col h-full overflow-hidden"
        >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20" />

            <div className="p-4 pt-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2 items-center flex-wrap">
                        <span className="font-mono text-[10px] text-primary uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded-sm">
                            [ AI PROMPT ]
                        </span>
                        <Badge variant="outline" className="opacity-70">{protocol.pillar}</Badge>
                    </div>
                    {renderToolIcon()}
                </div>

                <h3 className="font-heading text-sm text-white uppercase mb-2 line-clamp-2">
                    {protocol.title}
                </h3>

                <div className="bg-[#111] border border-[#222] rounded-sm p-3 mb-4 flex-1 font-mono text-xs text-zinc-400 line-clamp-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111] pointer-events-none" />
                    {protocol.content.substring(0, 100)}...
                </div>

                <div className="mt-auto border-t border-border-dark/50 pt-4 flex gap-2">
                    <button
                        onClick={onCopy}
                        disabled={copiedState}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-mono uppercase tracking-widest transition-colors rounded-sm ${copiedState
                            ? 'bg-primary/20 text-primary border border-primary/50'
                            : 'bg-primary text-black hover:bg-primary-hover border border-primary'
                            }`}
                    >
                        {copiedState ? (
                            <><span>[ COPIED ]</span></>
                        ) : (
                            <><Copy className="w-3.5 h-3.5" /> <span>COPY PROMPT</span></>
                        )}
                    </button>

                    <button
                        onClick={onDuplicate}
                        title="Duplicate Prompt"
                        className="p-2 text-text-secondary hover:text-primary hover:bg-white/5 transition-colors rounded-sm"
                    >
                        <CopyPlus className="w-4 h-4" />
                    </button>

                    <button className="px-3 py-2 text-xs font-mono text-text-secondary  hover:bg-white/5 transition-colors rounded-sm uppercase tracking-widest">
                        View
                    </button>
                </div>
            </div>
        </Card>
    );
}
