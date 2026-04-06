import { ReactNode } from 'react';
import { Tag } from './Tag';

interface SectionHeaderProps {
    module: string;
    title: string;
}

export function SectionHeader({ module, title }: SectionHeaderProps) {
    return (
        <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
                <Tag color="#A8C69F">{module}</Tag>
            </div>
            <h1 className="font-heading text-4xl tracking-tighter capitalize text-text-primary">
                {title}
            </h1>
        </div>
    );
}
