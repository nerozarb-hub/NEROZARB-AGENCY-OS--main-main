import { ReactNode } from 'react';
import { Tag } from './Tag';

interface SectionHeaderProps {
    module: string;
    title: string;
}

export function SectionHeader({ module, title }: SectionHeaderProps) {
    return (
        <div className="section-header page-container">
            <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 bg-primary rounded-none" />
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{module}</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl tracking-tighter text-text-primary">
                {title}
            </h1>
        </div>
    );
}
