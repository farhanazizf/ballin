import { SyncProvider } from '@/components/providers/sync-provider';

export default function FieldLayout({ children }: { children: React.ReactNode }) {
  return (
    <SyncProvider>
      <div className="auth-telemetry field-theme relative min-h-[100dvh]">
        <div aria-hidden className="telemetry-scanlines" />
        <div aria-hidden className="telemetry-noise" />
        <div className="relative z-10">{children}</div>
      </div>
    </SyncProvider>
  );
}
