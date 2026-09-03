import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const cardClass = cn(
  'bg-[var(--color-report-surface)]',
  'border border-[var(--color-report-border)]',
  'rounded-[var(--radius-panel)]',
  'p-5 md:p-6',
);

export default function PlayerDetailLoading() {
  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto md:max-w-3xl">
      <Skeleton className="h-4 w-28 mb-6" />

      <div className="flex items-start gap-4 mb-6">
        <Skeleton className="h-16 w-16 shrink-0 rounded-[var(--radius-panel)]" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-5 w-24 rounded-full mt-2" />
        </div>
      </div>

      <Skeleton className={cn(cardClass, 'h-48 mb-4')} />
      <Skeleton className={cn(cardClass, 'h-40 mb-4')} />
      <Skeleton className={cn(cardClass, 'h-32')} />
    </div>
  );
}
