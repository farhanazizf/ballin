'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Plus, Trophy } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn, formatDate } from '@/lib/utils';
import type { MatchListItem } from '@/lib/queries/matches';
import type { TeamOption } from '@/lib/queries/sessions';
import { useTranslations } from '@/lib/i18n/use-translations';

export function MatchesClient({
  matches,
  teams,
}: {
  matches: MatchListItem[];
  teams: TeamOption[];
}) {
  const router = useRouter();
  const { t } = useTranslations();
  const m = t.matches;
  const [showForm, setShowForm] = useState(false);
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');
  const [opponent, setOpponent] = useState('');
  const [playedAt, setPlayedAt] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId || !opponent.trim() || !playedAt) {
      setError(m.fillRequired);
      return;
    }
    startTransition(async () => {
      setError(null);
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          teamId,
          opponent: opponent.trim(),
          matchType: 'friendly',
          playedAt: new Date(playedAt).toISOString(),
          location: location.trim() || undefined,
        }),
      });
      const body = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) {
        setError(body.error ?? m.saveFailed);
        return;
      }
      setShowForm(false);
      router.push(`/matches/${body.id}`);
      router.refresh();
    });
  }

  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8">
      <header className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-report-text)] font-[family-name:var(--font-display)]">{m.title}</h1>
          <p className="text-sm text-[var(--color-report-text-2)] mt-1">{m.subtitle}</p>
        </div>
        <Button variant="report-primary" size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} weight="bold" /> {m.newMatch}
        </Button>
      </header>

      {showForm ? (
        <form onSubmit={handleCreate} className="border-2 border-[var(--color-report-border)] bg-[var(--color-report-surface)] p-5 mb-6 space-y-4">
          {error ? <p className="text-sm text-[var(--color-miss)]">{error}</p> : null}
          <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="h-12 w-full px-4 border border-[var(--color-report-border)] bg-[var(--color-report-surface)]">
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input value={opponent} onChange={(e) => setOpponent(e.target.value)} placeholder={m.opponentPlaceholder} className="h-12 w-full px-4 border border-[var(--color-report-border)]" />
          <input type="datetime-local" value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} className="h-12 w-full px-4 border border-[var(--color-report-border)]" />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={m.locationOptional} className="h-12 w-full px-4 border border-[var(--color-report-border)]" />
          <Button type="submit" variant="report-primary" disabled={isPending} className="w-full">Simpan</Button>
        </form>
      ) : null}

      {matches.length === 0 ? (
        <EmptyState icon={<Trophy size={28} weight="duotone" />} title={m.emptyTitle} description={m.emptyDesc} theme="report" />
      ) : (
        <ul className="divide-y divide-[var(--color-report-border)] border border-[var(--color-report-border)]">
          {matches.map((match) => (
            <li key={match.id}>
              <Link href={`/matches/${match.id}`} className={cn('flex items-center justify-between gap-4 p-4 hover:bg-[var(--color-report-bg)]')}>
                <div>
                  <p className="font-medium text-[var(--color-report-text)]">{match.teamName} {m.vs} {match.opponent}</p>
                  <p className="text-xs text-[var(--color-report-text-2)] mt-1">{formatDate(match.playedAt)} · {match.matchType}</p>
                </div>
                {(match.scoreFor != null && match.scoreAgainst != null) ? (
                  <span className="font-mono text-sm tabular-nums">{match.scoreFor}–{match.scoreAgainst}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
