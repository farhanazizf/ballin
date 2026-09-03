'use client';

import Link from 'next/link';
import { MagnifyingGlass, CaretRight } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import type { PlayerListItem } from '@/lib/queries/players';

export function PlayersListClient({ players }: { players: PlayerListItem[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      (p) =>
        p.nickname.toLowerCase().includes(q) ||
        p.fullName.toLowerCase().includes(q) ||
        p.teams.some((t) => t.toLowerCase().includes(q)),
    );
  }, [players, query]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl text-[var(--color-report-text)]">
          Pemain
        </h1>
        <p className="mt-1 text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)]">
          {players.length} pemain terdaftar
        </p>
      </header>

      <div className="relative">
        <MagnifyingGlass
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-report-text-3)]"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama atau kelas..."
          className={cn(
            'w-full h-11 pl-10 pr-4 rounded-[var(--radius-panel)]',
            'bg-[var(--color-report-surface)] border border-[var(--color-report-border)]',
            'text-[var(--color-report-text)] placeholder:text-[var(--color-report-text-3)]',
            'font-[family-name:var(--font-ui)] text-sm',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]',
          )}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={query ? 'Tidak ditemukan' : 'Belum ada pemain'}
          description={
            query
              ? 'Coba kata kunci lain atau hapus filter pencarian.'
              : 'Tambahkan pemain lewat admin atau hubungi admin akademi.'
          }
          theme="report"
        />
      ) : (
        <ul className="divide-y divide-[var(--color-report-border)] rounded-[var(--radius-panel)] border border-[var(--color-report-border)] bg-[var(--color-report-surface)] overflow-hidden">
          {filtered.map((player) => (
            <li key={player.id}>
              <Link
                href={`/players/${player.id}`}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5',
                  'hover:bg-[var(--color-report-bg)] transition-colors',
                  'min-h-[var(--size-touch-min)]',
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full shrink-0',
                    'bg-[var(--color-leather-tint)] text-[var(--color-leather)]',
                    'flex items-center justify-center font-[family-name:var(--font-display)] font-bold',
                  )}
                >
                  {player.jerseyNumber ?? player.nickname.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[family-name:var(--font-ui)] font-semibold text-[var(--color-report-text)] truncate">
                    {player.nickname}
                  </p>
                  <p className="text-xs text-[var(--color-report-text-3)] truncate">
                    {player.teams.join(' · ') || 'Tanpa kelas'}
                  </p>
                </div>
                <CaretRight size={18} className="text-[var(--color-report-text-3)] shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
