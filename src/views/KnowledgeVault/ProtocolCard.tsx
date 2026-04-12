import React from 'react';
import { Protocol } from '../../utils/storage';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MoreVertical, CopyPlus } from 'lucide-react';

interface ProtocolCardProps {
    protocol: Protocol;
    onClick: () => void;
    onEdit?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
}

const pillarColors: Record<string, string> = {
    'Market Truth': 'bg-blue-500',
    'Psychological Warfare': 'bg-purple-500',
    'Conversion Mechanic': 'bg-orange-500',
    'Viral Engine': 'bg-red-500',
    'Growth Math': 'bg-green-500',
    'Operations': 'bg-zinc-500',
    'Client Management': 'bg-sky-500'
};

const categoryBorderColors: Record<string, string> = {
    'sop': 'border-l-blue-500/40',
    'brand-standard': 'border-l-amber-500/40',
    'client-knowledge-base': 'border-l-primary/40',
    'ai-prompt': 'border-l-primary/60',
};


export const ProtocolCard: React.FC<ProtocolCardProps> = ({ protocol, onClick, onEdit, onDuplicate, onDelete }) => {
    const accentColor = pillarColors[protocol.pillar] || 'bg-primary';
    const borderColor = categoryBorderColors[protocol.category] || 'border-l-zinc-600';

    return (
        <Card
            onClick={onClick}
            className={`group relative transition-all cursor-pointer flex flex-col h-full overflow-hidden border-l border-white/5 bg-white/[0.01] hover:bg-white/[0.02] rounded-none ${borderColor}`}
        >
            {/* Top Accent Bar */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] opacity-40 ${accentColor}`} />


            <div className="p-6 pt-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center flex-wrap">
                        <span className="font-sans text-[8px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 border border-primary/20 px-2 py-1">
                            {protocol.category.replace(/-/g, ' ')}
                        </span>
                        <div className="font-sans text-[8px] font-black text-[#555] uppercase tracking-widest border border-white/5 px-2 py-1">{protocol.pillar}</div>
                    </div>
                </div>


                <h3 className="font-sans text-[13px] font-bold text-text-primary uppercase tracking-tight mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {protocol.title}
                </h3>

                <p className="font-sans text-[11px] text-[#777] leading-relaxed line-clamp-3 mb-6 flex-1 tracking-wide">
                    {protocol.content.replace(/[#*`\n]/g, ' ').substring(0, 100).toUpperCase()}
                </p>


                <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/[0.04]">
                    <span className="font-sans text-[8px] font-black text-[#333] uppercase tracking-widest italic">
                        SYNC: {new Date(protocol.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                    </span>
                    {(protocol.linkedClientId || protocol.linkedTaskTypes.length > 0) && (
                        <div className="flex gap-2">
                            {protocol.linkedClientId && (
                                <div className="w-1 h-1 rotate-45 bg-primary/40" title="Client Linked" />
                            )}
                            {protocol.linkedTaskTypes.length > 0 && (
                                <div className="w-1 h-1 rotate-45 bg-[#444]" title="Task Linked" />
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* Actions Menu */}
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    className="p-1.5 hover:bg-white/5 transition-all"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate?.();
                    }}
                    title="Duplicate Protocol"
                >
                    <CopyPlus className="w-3.5 h-3.5 text-[#333] hover:text-primary transition-colors" />
                </button>
                <div
                    className="p-1.5 hover:bg-white/5 transition-all"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <MoreVertical className="w-3.5 h-3.5 text-[#333]" />
                </div>
            </div>

        </Card>
    );
}
