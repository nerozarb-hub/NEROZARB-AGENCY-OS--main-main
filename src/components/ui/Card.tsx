import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accentTop?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', accentTop = false, ...props }) => {
  return (
    <div
      className={`bg-card border border-border-dark rounded-sm relative overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),0_0_20px_rgba(63,106,36,0.1)] ${className}`}
      {...props}
    >
      {accentTop && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/50 via-primary to-primary/50" />}
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 ${className}`} {...props}>{children}</div>;
}

export function CardTitle({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`font-heading text-lg text-text-primary ${className}`} {...props}>{children}</h3>;
}

export function CardContent({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 pt-0 ${className}`} {...props}>{children}</div>;
}
