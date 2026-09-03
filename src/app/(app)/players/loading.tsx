import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const cardClass = cn(
  'bg-[var(--color-report-surface)]',
  'border border-[var(--color-report-border)]',
  'rounded-[var(--radius-panel)]',
);

export default function PlayersLoading() {
  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto md:max-w-none">
      <header className="mb-6">
        <Skeleton className="h-3.5 w-40 mb-2" />
        <Skeleton className="h-7 w-24 mb-2" />
        <Skeleton className="h-3.5 w-28" />
      </header>

      <div className={cn(cardClass, 'p-4 mb-4 space-y-3')}>
        <Skeleton className="h-12 w-full rounded-[var(--radius-button)]" />
        <Skeleton className="h-12 w-full rounded-[var(--radius-button)]" />
      </div>

      <div className={cn(cardClass, 'divide-y divide-[var(--color-report-border)] overflow-hidden')}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-4">
            <Skeleton className="h-11 w-11 shrink-0 rounded-[var(--radius-button)]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
