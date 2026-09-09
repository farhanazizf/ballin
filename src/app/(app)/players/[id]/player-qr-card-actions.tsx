'use client';

import { useEffect, useState, useTransition } from 'react';
import { IdentificationCard, CircleNotch } from '@phosphor-icons/react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PlayerQrCardActions({ playerId }: { playerId: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void fetch(`/api/players/${playerId}/cards`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('load');
        const body = (await res.json()) as { activeCard: { token: string } | null };
        setToken(body.activeCard?.token ?? null);
      })
      .catch(() => setError('Gagal memuat status kartu.'));
  }, [playerId]);

  function issueCard() {
    startTransition(async () => {
      setError(null);
      const res = await fetch(`/api/players/${playerId}/cards`, {
        method: 'POST',
        credentials: 'include',
      });
      const body = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !body.token) {
        setError(body.error ?? 'Gagal menerbitkan kartu. Coba lagi.');
        return;
      }
      setToken(body.token);
    });
  }

  return (
    <section
      className={cn(
        'bg-[var(--color-report-surface)]',
        'border border-[var(--color-report-border)]',
        'rounded-[var(--radius-panel)]',
        'p-5 md:p-6 mb-4',
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <IdentificationCard size={18} className="text-[var(--color-report-text-3)]" />
        <h2 className="text-sm font-semibold text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] uppercase tracking-wide">
          Kartu QR absensi
        </h2>
      </div>
      <p className="text-sm text-[var(--color-report-text-2)] mb-4 leading-relaxed">
        Terbitkan kartu, lalu cetak PDF berisi QR yang bisa di-scan di lapangan. Kartu lama otomatis
        dicabut saat kartu baru dibuat.
      </p>
      {error ? <p className="text-sm text-[var(--color-miss)] mb-3">{error}</p> : null}
      <p className="text-sm text-[var(--color-report-text)] mb-4">
        Status: {token ? 'Kartu aktif' : 'Belum ada kartu'}
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={issueCard}
          disabled={isPending}
          className={cn(buttonVariants({ variant: 'report-secondary', size: 'sm' }))}
        >
          {isPending ? <CircleNotch size={16} className="animate-spin" /> : null}
          {token ? 'Terbitkan ulang' : 'Terbitkan kartu'}
        </button>
        {token ? (
          <a
            href={`/api/cards/print?playerId=${playerId}`}
            className={cn(buttonVariants({ variant: 'report-secondary', size: 'sm' }))}
          >
            Cetak PDF
          </a>
        ) : null}
      </div>
    </section>
  );
}
