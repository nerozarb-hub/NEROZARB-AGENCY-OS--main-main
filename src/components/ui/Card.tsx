import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accentTop?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', accentTop = false, ...props }) => {
  return (
    <div
      className={`bg-card border border-border-dark rounded-md relative overflow-hidden transition-all duration-500 hover:border-text-muted/30 ${className}`}
      {...props}
    >
      {accentTop && <div className="absolute top-0 left-0 right-0 h-[1px] bg-primary" />}
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-5 ${className}`} {...props}>{children}</div>;
}

export function CardTitle({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`font-sans tracking-tight text-lg font-medium text-text-primary ${className}`} {...props}>{children}</h3>;
}

export function CardContent({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-5 pt-0 ${className}`} {...props}>{children}</div>;
}

