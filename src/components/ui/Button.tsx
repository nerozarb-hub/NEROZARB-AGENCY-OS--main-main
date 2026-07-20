import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'default' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
};

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const variants: Record<string, string> = {
    primary: 'bg-primary text-onyx hover:bg-accent-mid shadow-sm tracking-normal',
    default: 'bg-surface text-text-primary hover:bg-card-alt border border-border-dark',
    ghost: 'bg-transparent text-text-muted hover:text-text-primary hover:bg-white/5',
    outline: 'bg-transparent border border-border-dark text-text-secondary hover:border-text-muted hover:bg-white/5',
    danger: 'bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500/10',
  };


  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs min-h-[36px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
  };

  return (
    <button
      className={`font-sans font-semibold tracking-normal text-sm rounded-lg transition-colors duration-200 active:scale-[0.98] flex items-center justify-center gap-2
        ${variants[variant]} ${sizes[size]} ${className}
        disabled:opacity-50 disabled:pointer-events-none`}
      {...props}
    >

      {children}
    </button>
  );
}
