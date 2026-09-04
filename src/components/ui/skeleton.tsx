import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: 'field' | 'report';
}

export function Skeleton({ className, theme = 'report', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-none',
        theme === 'field'
          ? 'bg-[var(--color-field-surface)] animate-pulse'
          : 'bg-[var(--color-report-border)]/50 animate-pulse',
        className
      )}
      {...props}
    />
  );
}
