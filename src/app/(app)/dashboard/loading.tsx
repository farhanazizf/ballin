import { cn } from '@/lib/utils';

function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        'bg-[var(--color-report-border)]/50 animate-pulse rounded-[var(--radius-panel)]',
        className,
      )}
      style={style}
    />
  );
}

export default function DashboardLoading() {
  const cardClass = cn(
    'bg-[var(--color-report-surface)]',
    'border border-[var(--color-report-border)]',
    'rounded-[var(--radius-panel)]',
    'p-5 md:p-6',
  );

  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8">
      {/* Header skeleton */}
      <header className="mb-6 md:mb-8">
        <Skeleton className="h-3.5 w-48 mb-2" />
        <Skeleton className="h-7 w-20 mb-2" />
        <Skeleton className="h-3.5 w-56" />
      </header>

      {/* Bento grid skeleton */}
      <div
        className={cn(
          'grid gap-4 md:gap-5',
          'grid-cols-1',
          'md:grid-cols-[2fr_1fr]',
          'md:grid-rows-[auto_auto]',
        )}
      >
        {/* Panel 1 — Latihan hari ini */}
        <div className={cn(cardClass, 'md:col-span-1')}>
          <div className="flex items-start gap-3 mb-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-[var(--radius-button)]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3.5 w-64" />
            </div>
          </div>
          <Skeleton className="h-3.5 w-52 mb-3" />
          <div className="flex gap-2 mb-5">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <Skeleton className="h-11 w-full md:w-36 rounded-[var(--radius-button)]" />
        </div>

        {/* Panel 2 — Absen minggu ini */}
        <div className={cn(cardClass, 'md:col-span-1 flex flex-col')}>
          <Skeleton className="h-3.5 w-28 mb-3" />
          <Skeleton className="h-10 w-28 mb-2" />
          <Skeleton className="h-3.5 w-40 mb-4" />
          <div className="mt-auto flex items-end gap-2 pt-4">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>

        {/* Panel 3 — Perlu perhatian */}
        <div className={cn(cardClass, 'md:col-span-1 md:row-start-2')}>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <div className="space-y-0 divide-y divide-[var(--color-report-border)]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-3 space-y-2">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3 w-52" />
              </div>
            ))}
          </div>
        </div>

        {/* Panel 4 — Distribusi drill */}
        <div className={cn(cardClass, 'md:col-span-1 md:row-start-2')}>
          <Skeleton className="h-3.5 w-40 mb-5" />
          <div className="space-y-3">
            {[75, 60, 50, 30, 22, 15].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-20 shrink-0" />
                <Skeleton className="h-5 flex-1" style={{ maxWidth: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
