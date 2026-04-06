import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  className?: string;
};

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block font-mono text-xs font-medium text-text-muted">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className="w-full bg-card-alt  px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(63,106,36,0.15)] transition-all duration-300 rounded-sm invalid:focus:border-red-500 invalid:focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]"
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
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block font-mono text-xs font-medium text-text-muted">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className="w-full bg-card-alt  px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(63,106,36,0.15)] transition-all duration-300 rounded-sm min-h-[100px] resize-y custom-scrollbar invalid:focus:border-red-500 invalid:focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]"
        {...props}
      />
    </div>
  );
}

