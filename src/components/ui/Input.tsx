import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  className?: string;
};

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block font-sans text-sm font-medium text-text-secondary">
          {label}
          {props.required && <span className="text-primary ml-1">*</span>}
        </label>
      )}
      <input
        className="w-full min-h-11 rounded-lg bg-white/[0.03] border border-border-dark px-3 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors invalid:focus:border-red-500 invalid:focus:ring-red-500/30 font-sans"
        {...props}
      />
    </div>
  );
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  className?: string;
};

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block font-sans text-sm font-medium text-text-secondary">
          {label}
          {props.required && <span className="text-primary ml-1">*</span>}
        </label>
      )}
      <textarea
        className="w-full rounded-lg bg-white/[0.03] border border-border-dark px-3 py-3 text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors min-h-[120px] resize-y custom-scrollbar invalid:focus:border-red-500 invalid:focus:ring-red-500/30 font-sans"
        {...props}
      />
    </div>
  );
}
