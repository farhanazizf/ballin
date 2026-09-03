import { SyncProvider } from '@/components/providers/sync-provider';

export default function FieldLayout({ children }: { children: React.ReactNode }) {
  return (
    <SyncProvider>
      <div className="field-theme min-h-[100dvh]">{children}</div>
    </SyncProvider>
  );
}
