'use client';

import { SyncProvider } from '@/components/providers/sync-provider';
import { PageTransition } from '@/components/motion/page-transition';

export function FieldShell({ children }: { children: React.ReactNode }) {
  return (
    <SyncProvider>
      <div className="auth-telemetry field-theme relative min-h-[100dvh]">
        <div aria-hidden className="telemetry-scanlines" />
        <div aria-hidden className="telemetry-noise" />
        <PageTransition className="relative z-10">{children}</PageTransition>
      </div>
    </SyncProvider>
  );
}
