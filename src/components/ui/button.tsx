'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-mono text-xs font-semibold uppercase tracking-[0.1em]',
    'rounded-none border-2',
    'transition-colors duration-200',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-phosphor)]',
    'disabled:pointer-events-none disabled:opacity-40',
    'active:translate-y-px',
    'select-none cursor-pointer',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'border-[var(--color-hazard)] bg-[var(--color-hazard)] text-[var(--color-phosphor)]',
          'hover:bg-transparent hover:text-[var(--color-hazard)]',
        ].join(' '),
        secondary: [
          'bg-transparent text-[var(--color-phosphor)]',
          'border-[var(--color-field-border)]',
          'hover:border-[var(--color-phosphor)]',
        ].join(' '),
        ghost: [
          'border-transparent bg-transparent text-[var(--color-field-text-2)]',
          'hover:text-[var(--color-phosphor)]',
        ].join(' '),
        danger: [
          'border-[var(--color-hazard)] bg-transparent text-[var(--color-hazard)]',
          'hover:bg-[var(--color-hazard)] hover:text-[var(--color-phosphor)]',
        ].join(' '),
        'report-primary': [
          'border-[var(--color-hazard)] bg-[var(--color-hazard)] text-[var(--color-phosphor)]',
          'hover:bg-transparent hover:text-[var(--color-hazard)]',
        ].join(' '),
        'report-secondary': [
          'border-[var(--color-report-border)] bg-transparent text-[var(--color-report-text)]',
          'hover:bg-[var(--color-report-text)] hover:text-[var(--color-phosphor)]',
        ].join(' '),
        'report-ghost': [
          'border-transparent bg-transparent text-[var(--color-report-text-2)]',
          'hover:text-[var(--color-report-text)]',
        ].join(' '),
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-12 px-5 text-sm',
        lg: 'h-14 px-6 text-sm',
        field: 'h-[var(--size-touch-primary)] px-8 text-sm',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
