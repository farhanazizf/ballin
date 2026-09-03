import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 font-[family-name:var(--font-ui)] font-medium',
    'rounded-[var(--radius-chip)]',
    'select-none whitespace-nowrap',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-field-raised)] text-[var(--color-field-text-2)] border border-[var(--color-field-border)]',
        success: 'bg-[var(--color-made)]/10 text-[var(--color-made)]',
        danger: 'bg-[var(--color-miss)]/10 text-[var(--color-miss)]',
        warning: 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]',
        leather: 'bg-[var(--color-leather)]/10 text-[var(--color-leather)]',
        gold: 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]',
        'report-default': 'bg-[var(--color-report-bg)] text-[var(--color-report-text-2)] border border-[var(--color-report-border)]',
        'report-success': 'bg-[var(--color-made)]/8 text-[var(--color-made)]',
      },
      size: {
        sm: 'h-6 px-2 text-xs',
        md: 'h-7 px-2.5 text-sm',
        lg: 'h-8 px-3 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
