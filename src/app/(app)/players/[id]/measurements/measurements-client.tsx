'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CircleNotch } from '@phosphor-icons/react';
import { playerMeasurementSchema } from '@/lib/validators/player';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import type { PlayerMeasurementRow } from '@/lib/queries/players';

export function MeasurementsClient({
  playerId,
  playerName,
  measurements,
}: {
  playerId: string;
  playerName: string;
  measurements: PlayerMeasurementRow[];
}) {
  const router = useRouter();
  const [measuredOn, setMeasuredOn] = useState(new Date().toISOString().slice(0, 10));
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [wingspanCm, setWingspanCm] = useState('');
  const [standingReachCm, setStandingReachCm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      playerId,
      measuredOn,
      heightCm: heightCm.trim() ? Number(heightCm) : undefined,
      weightKg: weightKg.trim() ? Number(weightKg) : undefined,
      wingspanCm: wingspanCm.trim() ? Number(wingspanCm) : undefined,
      standingReachCm: standingReachCm.trim() ? Number(standingReachCm) : undefined,
    };

    const parsed = playerMeasurementSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Data ukuran tidak valid.');
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/players/${playerId}/measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? 'Gagal menyimpan ukuran tubuh.');
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      <Link
        href={`/players/${playerId}`}
        className="inline-flex items-center gap-2 mb-6 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-report-text-2)] hover:text-[var(--color-report-text)]"
      >
        <ArrowLeft size={16} />
        Kembali ke {playerName}
      </Link>

      <p className="brut-label text-[var(--color-hazard)]">[ Roster / Measurements ]</p>
      <h1 className="brut-heading mt-2 mb-6 text-2xl text-[var(--color-report-text)]">
        Ukuran tubuh
      </h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4 border-2 border-[var(--color-report-border)] bg-[var(--color-report-surface)] p-4">
        <Input theme="report" label="Tanggal ukur" type="date" value={measuredOn} onChange={(e) => setMeasuredOn(e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <Input theme="report" label="Tinggi (cm)" type="number" step="0.1" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          <Input theme="report" label="Berat (kg)" type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
          <Input theme="report" label="Rentang sayap (cm)" type="number" step="0.1" value={wingspanCm} onChange={(e) => setWingspanCm(e.target.value)} />
          <Input theme="report" label="Jangkauan berdiri (cm)" type="number" step="0.1" value={standingReachCm} onChange={(e) => setStandingReachCm(e.target.value)} />
        </div>
        {error && <p className="font-mono text-[11px] text-[var(--color-hazard)]">{error}</p>}
        <Button type="submit" variant="report-primary" disabled={isPending}>
          {isPending ? <CircleNotch className="animate-spin" size={16} /> : 'Simpan ukuran'}
        </Button>
      </form>

      <ul className="divide-y divide-[var(--color-report-border)] border-2 border-[var(--color-report-border)]">
        {measurements.map((m) => (
          <li key={m.id} className="bg-[var(--color-report-surface)] px-4 py-4">
            <p className="font-mono text-sm font-semibold text-[var(--color-report-text)]">
              {formatDate(m.measuredOn)}
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-report-text-3)]">
              {m.heightCm != null ? `Tinggi ${m.heightCm} cm` : '—'}
              {' · '}
              {m.weightKg != null ? `Berat ${m.weightKg} kg` : '—'}
              {m.wingspanCm != null ? ` · Sayap ${m.wingspanCm} cm` : ''}
              {m.standingReachCm != null ? ` · Jangkau ${m.standingReachCm} cm` : ''}
            </p>
          </li>
        ))}
        {measurements.length === 0 && (
          <li className="px-4 py-6 font-mono text-[11px] text-[var(--color-report-text-3)]">
            Belum ada riwayat ukuran.
          </li>
        )}
      </ul>
    </div>
  );
}
