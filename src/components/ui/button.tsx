'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-[family-name:var(--font-ui)] font-semibold',
    'transition-all duration-150 ease-out',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
    'disabled:pointer-events-none disabled:opacity-40',
    'active:scale-[0.97] active:transition-none',
    'select-none cursor-pointer',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--color-leather)] text-[var(--color-on-leather)]',
          'hover:bg-[var(--color-leather-deep)]',
          'active:bg-[var(--color-leather-deep)]',
        ].join(' '),
        secondary: [
          'bg-[var(--color-field-raised)] text-[var(--color-field-text)]',
          'border border-[var(--color-field-border)]',
          'hover:bg-[var(--color-field-border)]',
        ].join(' '),
        ghost: [
          'text-[var(--color-field-text-2)]',
          'hover:text-[var(--color-field-text)] hover:bg-[var(--color-field-surface)]',
        ].join(' '),
        danger: [
          'bg-[var(--color-miss)]/10 text-[var(--color-miss)]',
          'border border-[var(--color-miss)]/20',
          'hover:bg-[var(--color-miss)]/20',
        ].join(' '),
        'report-primary': [
          'bg-[var(--color-leather)] text-[var(--color-on-leather)]',
          'hover:bg-[var(--color-leather-deep)]',
        ].join(' '),
        'report-secondary': [
          'bg-[var(--color-report-surface)] text-[var(--color-report-text)]',
          'border border-[var(--color-report-border)]',
          'hover:bg-[var(--color-report-bg)]',
        ].join(' '),
        'report-ghost': [
          'text-[var(--color-report-text-2)]',
          'hover:text-[var(--color-report-text)] hover:bg-[var(--color-report-surface)]',
        ].join(' '),
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-[8px]',
        md: 'h-12 px-5 text-base rounded-[var(--radius-button)]',
        lg: 'h-14 px-6 text-base rounded-[var(--radius-button)]',
        field: 'h-[var(--size-touch-primary)] px-8 text-lg rounded-[var(--radius-button)]',
        icon: 'h-12 w-12 rounded-[var(--radius-button)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
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
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
