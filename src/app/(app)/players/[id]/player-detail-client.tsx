'use client';

import { cn } from '@/lib/utils';
import { StatNumber } from '@/components/ui/stat-number';
import type { PlayerDetail } from '@/lib/queries/players';

const cardClass = cn(
  'bg-[var(--color-report-surface)]',
  'border border-[var(--color-report-border)]',
  'rounded-[var(--radius-panel)]',
  'p-5',
);

export function PlayerDetailClient({ player }: { player: PlayerDetail }) {
  const attrs = player.attributes;

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-4">
        <div
          className={cn(
            'w-16 h-16 rounded-full shrink-0',
            'bg-[var(--color-leather-tint)] text-[var(--color-leather)]',
            'flex items-center justify-center font-[family-name:var(--font-display)] text-2xl font-bold',
          )}
        >
          {player.jerseyNumber ?? player.nickname.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-report-text)]">
            {player.nickname}
          </h1>
          <p className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)]">
            {player.fullName}
            {player.age != null ? ` · ${player.age} tahun` : ''}
          </p>
          <p className="text-sm text-[var(--color-report-text-2)] mt-1 font-[family-name:var(--font-ui)]">
            {player.teams.join(' · ')}
            {player.position ? ` · ${player.position}` : ''}
          </p>
          {attrs?.archetype && (
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-leather-tint)] text-[var(--color-leather)] font-[family-name:var(--font-ui)]">
              {attrs.archetype}
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className={cardClass}>
          <StatNumber value={player.attendanceRate} suffix="%" theme="report" size="large" />
          <p className="text-xs text-[var(--color-report-text-3)] mt-1 font-[family-name:var(--font-ui)]">
            Kehadiran (12 sesi)
          </p>
        </div>
        <div className={cardClass}>
          <StatNumber value={player.recentAbsences} theme="report" size="large" />
          <p className="text-xs text-[var(--color-report-text-3)] mt-1 font-[family-name:var(--font-ui)]">
            Absen terakhir
          </p>
        </div>
      </div>

      {attrs && (
        <section className={cardClass}>
          <h2 className="font-[family-name:var(--font-ui)] font-semibold text-[var(--color-report-text)] mb-4">
            Atribut ({attrs.periodStart} – {attrs.periodEnd})
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm font-[family-name:var(--font-ui)]">
            {(
              [
                ['Shooting', attrs.shooting],
                ['Finishing', attrs.finishing],
                ['Ballhandling', attrs.ballhandling],
                ['Defense', attrs.defense],
                ['Athleticism', attrs.athleticism],
                ['Attitude', attrs.attitude],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-2">
                <span className="text-[var(--color-report-text-3)]">{label}</span>
                <span className="font-[family-name:var(--font-display)] tabular-nums text-[var(--color-report-text)]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {(player.guardianName || player.school) && (
        <section className={cardClass}>
          <h2 className="font-[family-name:var(--font-ui)] font-semibold text-[var(--color-report-text)] mb-3">
            Info tambahan
          </h2>
          <dl className="space-y-2 text-sm font-[family-name:var(--font-ui)]">
            {player.school && (
              <div>
                <dt className="text-[var(--color-report-text-3)]">Sekolah</dt>
                <dd className="text-[var(--color-report-text)]">{player.school}</dd>
              </div>
            )}
            {player.guardianName && (
              <div>
                <dt className="text-[var(--color-report-text-3)]">Wali</dt>
                <dd className="text-[var(--color-report-text)]">
                  {player.guardianName}
                  {player.guardianPhone ? ` · ${player.guardianPhone}` : ''}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}
    </div>
  );
}
