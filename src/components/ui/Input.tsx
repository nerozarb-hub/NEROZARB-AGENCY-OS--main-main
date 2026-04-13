import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  className?: string;
};

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block font-sans text-[11px] font-bold uppercase tracking-widest text-text-muted">
          {label}
          {props.required && <span className="text-primary ml-1">*</span>}
        </label>
      )}
      <input
        className="w-full h-10 bg-white/[0.03] border border-white/[0.08] px-4 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-300 rounded-none invalid:focus:border-red-500 invalid:focus:ring-red-500/30 font-sans"
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
        <label className="block font-sans text-[11px] font-bold uppercase tracking-widest text-text-muted">
          {label}
          {props.required && <span className="text-primary ml-1">*</span>}
        </label>
      )}
      <textarea
        className="w-full bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-300 rounded-none min-h-[120px] resize-y custom-scrollbar invalid:focus:border-red-500 invalid:focus:ring-red-500/30 font-sans"
        {...props}
      />
    </div>
  );
}

