import { flush, getBackoffMs, getOutboxStatus } from './outbox';

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let isRunning = false;
const DEFAULT_INTERVAL_MS = 15000;

/**
 * Start the sync engine
 * Triggers: online event, visibility change, periodic timer
 */
export function startSyncEngine() {
  if (typeof window === 'undefined') return;

  // Listen for connectivity changes
  window.addEventListener('online', onOnline);
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Start periodic sync
  scheduleNext(DEFAULT_INTERVAL_MS);
}

/**
 * Stop the sync engine
 */
export function stopSyncEngine() {
  if (typeof window === 'undefined') return;

  window.removeEventListener('online', onOnline);
  document.removeEventListener('visibilitychange', onVisibilityChange);

  if (syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = null;
  }
}

/**
 * Manually trigger a sync attempt
 */
export async function syncNow(): Promise<{ sent: number; failed: number }> {
  if (isRunning) return { sent: 0, failed: 0 };
  
  isRunning = true;
  try {
    const result = await flush();
    scheduleNext(DEFAULT_INTERVAL_MS);
    return result;
  } finally {
    isRunning = false;
  }
}

function onOnline() {
  syncNow();
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    syncNow();
  }
}

function scheduleNext(ms: number) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    if (!navigator.onLine) {
      scheduleNext(DEFAULT_INTERVAL_MS);
      return;
    }
    
    const result = await syncNow();
    const status = await getOutboxStatus();
    
    if (status.total > 0 && result.failed > 0) {
      // Back off if we had failures
      scheduleNext(getBackoffMs(Math.min(result.failed, 10)));
    } else {
      scheduleNext(DEFAULT_INTERVAL_MS);
    }
  }, ms);
}
