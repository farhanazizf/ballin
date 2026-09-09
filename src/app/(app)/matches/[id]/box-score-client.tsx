'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { ArrowLeft, CircleNotch } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import type { BoxScoreRow, MatchDetail } from '@/lib/queries/matches';
import { useTranslations } from '@/lib/i18n/use-translations';

type DraftRow = BoxScoreRow;

export function BoxScoreClient({
  match,
  initialRows,
}: {
  match: MatchDetail;
  initialRows: BoxScoreRow[];
}) {
  const { t } = useTranslations();
  const m = t.matches;
  const [rows, setRows] = useState<DraftRow[]>(initialRows);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function update(playerId: string, field: keyof DraftRow, value: string) {
    const num = value === '' ? null : Number(value);
    setRows((prev) => prev.map((row) => (row.playerId === playerId ? { ...row, [field]: num } : row)));
  }

  function handleSave() {
    startTransition(async () => {
      setError(null);
      setSaved(false);
      const res = await fetch(`/api/matches/${match.id}/box-scores`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rows: rows.map((row) => ({
            playerId: row.playerId,
            minutes: row.minutes,
            points: row.points,
            fgm: row.fgm,
            fga: row.fga,
            assists: row.assists,
          })),
        }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? m.boxScoreSaveFailed);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8">
      <Link href="/matches" className="inline-flex items-center gap-2 text-sm text-[var(--color-report-text-2)] mb-6">
        <ArrowLeft size={16} /> {m.backToList}
      </Link>
      <h1 className="text-2xl font-semibold text-[var(--color-report-text)] mb-1">{match.teamName} {m.vs} {match.opponent}</h1>
      <p className="text-sm text-[var(--color-report-text-2)] mb-6">{m.boxScore}</p>
      {error ? <p className="text-sm text-[var(--color-miss)] mb-4">{error}</p> : null}
      {saved ? <p className="text-sm text-[var(--color-made)] mb-4">{m.boxScore} tersimpan.</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-[var(--color-report-border)]">
          <thead>
            <tr className="bg-[var(--color-report-bg)]">
              <th className="p-2 text-left">{m.playerColumn}</th>
              <th className="p-2">Min</th>
              <th className="p-2">PTS</th>
              <th className="p-2">FGM</th>
              <th className="p-2">FGA</th>
              <th className="p-2">AST</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.playerId} className="border-t border-[var(--color-report-border)]">
                <td className="p-2 font-medium">{row.nickname}</td>
                {(['minutes', 'points', 'fgm', 'fga', 'assists'] as const).map((field) => (
                  <td key={field} className="p-1">
                    <input
                      type="number"
                      min={0}
                      value={row[field] ?? ''}
                      onChange={(e) => update(row.playerId, field, e.target.value)}
                      className="w-14 h-9 text-center border border-[var(--color-report-border)] tabular-nums"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="report-primary" className="mt-6 w-full md:w-auto" disabled={isPending} onClick={handleSave}>
        {isPending ? <><CircleNotch className="animate-spin" size={18} /> Menyimpan...</> : m.saveBoxScore}
      </Button>
    </div>
  );
}
