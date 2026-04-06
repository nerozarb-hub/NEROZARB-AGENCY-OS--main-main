import { ReactNode } from 'react';

interface TagProps {
    children: ReactNode;
    color?: string;
    className?: string;
}

export function Tag({ children, color = '#C0C0C0', className = '' }: TagProps) {
    return (
        <span
            className={`font-mono text-[9px] tracking-[1.2px] border px-[7px] py-[2px] transition-colors ${className}`}
            style={{ color, borderColor: color }}
        >
            {children}
        </span>
    );
}
