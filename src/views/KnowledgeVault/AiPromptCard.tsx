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
            <div className="flex items-center gap-1.5 text-[8px] font-black font-sans text-[#444] border border-white/5 px-2 py-0.5">
                <Bot className="w-3 h-3 opacity-40" />
                <span>{letter}</span>
            </div>
        );
    }


    return (
        <Card
            onClick={onClick}
            className="group relative bg-[#0C0F14] transition-all cursor-pointer flex flex-col h-full overflow-hidden border border-white/5 rounded-none"
        >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary/40 opacity-40" />


            <div className="p-6 pt-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center flex-wrap">
                        <span className="font-sans text-[8px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 border border-primary/20 px-2 py-1">
                            AI PROMPT
                        </span>
                        <div className="font-sans text-[8px] font-black text-[#555] uppercase tracking-widest border border-white/5 px-2 py-1">{protocol.pillar}</div>
                    </div>
                    {renderToolIcon()}
                </div>


                <h3 className="font-sans text-[13px] font-bold text-text-primary uppercase tracking-tight mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                    {protocol.title}
                </h3>


                <div className="bg-white/[0.01] border border-white/5 p-4 mb-6 flex-1 font-sans text-[10px] font-medium text-[#666] line-clamp-3 relative overflow-hidden uppercase tracking-widest leading-relaxed">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0C0F14]/80 pointer-events-none" />
                    {protocol.content.substring(0, 100).toUpperCase()}...
                </div>


                <div className="mt-auto pt-5 border-t border-white/[0.04] flex gap-3">
                    <button
                        onClick={onCopy}
                        disabled={copiedState}
                        className={`flex-1 flex items-center justify-center gap-3 h-10 text-[9px] font-black font-sans uppercase tracking-[0.2em] transition-all ${copiedState
                            ? 'bg-primary/20 text-primary border border-primary/20'
                            : 'bg-primary text-text-primary border border-primary hover:bg-accent-mid'
                            }`}
                    >
                        {copiedState ? (
                            <><span>COPIED</span></>
                        ) : (
                            <><Copy className="w-3.5 h-3.5" /> <span>DEPLOY PROMPT</span></>
                        )}
                    </button>

                    <button
                        onClick={onDuplicate}
                        title="Duplicate Prompt"
                        className="w-10 h-10 flex items-center justify-center text-[#333] hover:text-primary hover:bg-primary/5 border border-white/5 transition-all"
                    >
                        <CopyPlus className="w-3.5 h-3.5" />
                    </button>
                </div>

            </div>
        </Card>
    );
}
