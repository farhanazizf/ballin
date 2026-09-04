'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  theme?: 'field' | 'report';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, theme = 'field', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    const themeStyles =
      theme === 'field'
        ? 'bg-[var(--color-terminal-bg)] border-[var(--color-field-border)] text-[var(--color-phosphor)] placeholder:text-[var(--color-field-text-3)] focus:border-[var(--color-hazard)]'
        : 'bg-[var(--color-report-bg)] border-[var(--color-report-border)] text-[var(--color-report-text)] placeholder:text-[var(--color-report-text-3)] focus:border-[var(--color-hazard)]';

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'brut-label',
              theme === 'field' ? 'text-[var(--color-field-text-3)]' : 'text-[var(--color-report-text-3)]',
            )}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            'h-12 w-full rounded-none border px-4',
            'font-mono text-sm tracking-[0.04em]',
            'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-hazard)]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            themeStyles,
            error && 'border-[var(--color-hazard)] focus:ring-[var(--color-hazard)]',
            className,
          )}
          ref={ref}
          {...props}
        />
        {hint && !error && (
          <p
            className={cn(
              'font-mono text-[10px] uppercase tracking-[0.08em]',
              theme === 'field' ? 'text-[var(--color-field-text-3)]' : 'text-[var(--color-report-text-3)]',
            )}
          >
            {hint}
          </p>
        )}
        {error && (
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-hazard)]">
            /// {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
