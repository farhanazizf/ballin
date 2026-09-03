'use client';

import { useEffect, useState } from 'react';
import { startSyncEngine, stopSyncEngine, syncNow } from '@/lib/sync/engine';
import { getOutboxStatus } from '@/lib/sync/outbox';
import { SyncStatus } from '@/components/ui/sync-status';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [state, setState] = useState<'local' | 'syncing' | 'synced'>('local');

  useEffect(() => {
    startSyncEngine();

    const refresh = async () => {
      const status = await getOutboxStatus();
      setPendingCount(status.pending + status.failed);
      if (status.pending + status.failed === 0 && navigator.onLine) {
        setState('synced');
      } else if (status.pending + status.failed > 0) {
        setState(navigator.onLine ? 'syncing' : 'local');
      } else {
        setState('local');
      }
    };

    refresh();
    const interval = setInterval(refresh, 5000);
    window.addEventListener('online', refresh);

    return () => {
      stopSyncEngine();
      clearInterval(interval);
      window.removeEventListener('online', refresh);
    };
  }, []);

  useEffect(() => {
    if (!navigator.onLine) {
      setState('local');
      return;
    }
    if (pendingCount > 0) {
      setState('syncing');
      void syncNow().then(() => getOutboxStatus().then((s) => setPendingCount(s.pending + s.failed)));
    }
  }, [pendingCount]);

  return (
    <>
      <div className="fixed top-3 right-3 z-50 safe-top">
        <SyncStatus state={state} pendingCount={pendingCount} />
      </div>
      {children}
    </>
  );
}
