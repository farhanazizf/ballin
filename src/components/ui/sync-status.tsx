'use client';

import { useState, useEffect } from 'react';
import { CloudArrowUp, CheckCircle, WifiSlash } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n/use-translations';

type SyncState = 'local' | 'syncing' | 'synced';

interface SyncStatusProps {
  state?: SyncState;
  pendingCount?: number;
  className?: string;
}

export function SyncStatus({ state = 'local', pendingCount = 0, className }: SyncStatusProps) {
  const { t } = useTranslations();
  const [showSynced, setShowSynced] = useState(false);

  useEffect(() => {
    if (state === 'synced') {
      setShowSynced(true);
      const timer = setTimeout(() => setShowSynced(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[var(--radius-chip)]',
        'text-xs font-medium font-[family-name:var(--font-ui)] select-none',
        'transition-all duration-300',
        state === 'local' && 'bg-[var(--color-field-surface)] text-[var(--color-field-text-3)]',
        state === 'syncing' && 'bg-[var(--color-leather)]/10 text-[var(--color-leather)]',
        (state === 'synced' && showSynced) && 'bg-[var(--color-made)]/10 text-[var(--color-made)]',
        (state === 'synced' && !showSynced) && 'opacity-0',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {state === 'local' && (
        <>
          <WifiSlash size={14} weight="bold" />
          <span>{t.common.sync.local}{pendingCount > 0 ? ` (${pendingCount})` : ''}</span>
        </>
      )}
      {state === 'syncing' && (
        <>
          <CloudArrowUp size={14} weight="bold" className="animate-pulse" />
          <span>{t.common.sync.syncing}</span>
        </>
      )}
      {state === 'synced' && showSynced && (
        <>
          <CheckCircle size={14} weight="bold" />
          <span>{t.common.sync.synced}</span>
        </>
      )}
    </div>
  );
}
