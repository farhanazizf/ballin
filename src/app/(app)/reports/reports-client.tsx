'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { FileText, CircleNotch } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/utils';
import type { ReportListItem } from '@/lib/queries/reports';

export function ReportsClient({
  reports,
  players,
}: {
  reports: ReportListItem[];
  players: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [playerId, setPlayerId] = useState(players[0]?.id ?? '');
  const [periodStart, setPeriodStart] = useState('2026-08-01');
  const [periodEnd, setPeriodEnd] = useState('2026-08-31');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function generate() {
    if (!playerId) {
      setError('Pilih pemain terlebih dahulu.');
      return;
    }
    startTransition(async () => {
      setError(null);
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ playerId, periodStart, periodEnd }),
      });
      const body = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) {
        setError(body.error ?? 'Gagal membuat draf rapor.');
        return;
      }
      router.refresh();
    });
  }

  async function approve(reportId: string, content: ReportListItem & { content?: unknown }) {
    const existing = reports.find((r) => r.id === reportId);
    if (!existing) return;
    startTransition(async () => {
      const detailRes = await fetch(`/api/reports/${reportId}`);
      if (!detailRes.ok) return;
      const detail = (await detailRes.json()) as { content: { summary: string; highlights: string[]; improvements: string[] } };
      await fetch(`/api/reports/${reportId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: detail.content }),
      });
      router.refresh();
    });
  }

  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-report-text)] font-[family-name:var(--font-display)]">Rapor pemain</h1>
        <p className="text-sm text-[var(--color-report-text-2)] mt-1">Generate draf AI, review, lalu setujui untuk pemain</p>
      </header>

      <section className="border-2 border-[var(--color-report-border)] bg-[var(--color-report-surface)] p-5 mb-8 space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-report-text-3)]">Buat draf rapor</h2>
        {error ? <p className="text-sm text-[var(--color-miss)]">{error}</p> : null}
        <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} className="h-12 w-full px-4 border border-[var(--color-report-border)]">
          {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="h-12 px-4 border border-[var(--color-report-border)]" />
          <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="h-12 px-4 border border-[var(--color-report-border)]" />
        </div>
        <Button variant="report-primary" disabled={isPending} onClick={generate} className="w-full">
          {isPending ? <><CircleNotch className="animate-spin" size={18} /> Membuat draf...</> : 'Generate draf rapor'}
        </Button>
      </section>

      {reports.length === 0 ? (
        <EmptyState icon={<FileText size={28} weight="duotone" />} title="Belum ada rapor" description="Generate draf rapor untuk pemain di tim Anda." theme="report" />
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li key={report.id} className={cn('border border-[var(--color-report-border)] p-4 flex flex-wrap items-center gap-3 justify-between')}>
              <div>
                <p className="font-medium text-[var(--color-report-text)]">{report.playerName}</p>
                <p className="text-xs text-[var(--color-report-text-2)] mt-1">{formatDate(report.periodStart)} – {formatDate(report.periodEnd)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={report.status === 'approved' ? 'leather' : 'report-default'} size="sm">{report.status}</Badge>
                {report.status === 'draft' ? (
                  <Button variant="report-secondary" size="sm" disabled={isPending} onClick={() => void approve(report.id, report)}>Setujui</Button>
                ) : null}
                <a href={`/api/reports/${report.id}/pdf`} className="text-xs text-[var(--color-leather)] underline">PDF</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
