import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'default' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
};

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const variants: Record<string, string> = {
    primary: 'bg-primary text-text-primary hover:bg-accent-mid tracking-widest',
    default: 'bg-surface text-text-primary hover:bg-border-dark border border-border-dark',
    ghost: 'bg-transparent text-text-muted hover:text-text-primary hover:bg-white/5',
    outline: 'bg-transparent border border-border-dark text-text-secondary hover:border-text-primary hover:bg-white/5',
    danger: 'bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500/10',
  };


  const sizes: Record<string, string> = {
    sm: 'px-3 py-1 text-[10px] min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
  };

  return (
    <button
      className={`font-sans font-medium tracking-wide uppercase text-[10px] rounded-none transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2
        ${variants[variant]} ${sizes[size]} ${className}
        disabled:opacity-50 disabled:pointer-events-none`}
      {...props}
    >

      {children}
    </button>
  );
}
