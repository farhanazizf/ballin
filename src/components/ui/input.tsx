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
    
    const themeStyles = theme === 'field' 
      ? 'bg-[var(--color-field-surface)] border-[var(--color-field-border)] text-[var(--color-field-text)] placeholder:text-[var(--color-field-text-3)] focus:border-[var(--color-leather)]'
      : 'bg-[var(--color-report-surface)] border-[var(--color-report-border)] text-[var(--color-report-text)] placeholder:text-[var(--color-report-text-3)] focus:border-[var(--color-leather)]';

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium font-[family-name:var(--font-ui)]',
              theme === 'field' ? 'text-[var(--color-field-text-2)]' : 'text-[var(--color-report-text-2)]'
            )}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            'h-12 w-full px-4 rounded-[var(--radius-button)] border',
            'font-[family-name:var(--font-ui)] text-base',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]/30',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            themeStyles,
            error && 'border-[var(--color-miss)] focus:border-[var(--color-miss)] focus:ring-[var(--color-miss)]/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {hint && !error && (
          <p className={cn(
            'text-xs font-[family-name:var(--font-ui)]',
            theme === 'field' ? 'text-[var(--color-field-text-3)]' : 'text-[var(--color-report-text-3)]'
          )}>
            {hint}
          </p>
        )}
        {error && (
          <p className="text-xs text-[var(--color-miss)] font-[family-name:var(--font-ui)]">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
