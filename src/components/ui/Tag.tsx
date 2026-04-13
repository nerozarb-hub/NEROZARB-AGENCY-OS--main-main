import { ReactNode } from 'react';

interface TagProps {
    children: ReactNode;
    color?: string;
    className?: string;
}

export function Tag({ children, color = 'rgba(255,255,255,0.4)', className = '' }: TagProps) {
    return (
        <span
            className={`font-sans text-[10px] uppercase font-bold tracking-widest border px-2 py-0.5 transition-colors inline-block ${className}`}
            style={{ color, borderColor: color }}
        >
            {children}
        </span>
    );
}
