'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CircleNotch } from '@phosphor-icons/react';
import { createPlayerCredentialsSchema } from '@/lib/validators/auth';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PlayerCredentialsView } from '@/lib/queries/player-credentials';

export function CredentialsClient({
  playerId,
  playerName,
  initial,
}: {
  playerId: string;
  playerName: string;
  initial: PlayerCredentialsView;
}) {
  const router = useRouter();
  const { t } = useTranslations();
  const c = t.players.credentials;
  const playerCredentialsSchema = useMemo(() => createPlayerCredentialsSchema(t.validation.auth), [t.validation.auth]);
  const [username, setUsername] = useState(initial.username ?? '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsed = playerCredentialsSchema.safeParse({ username, pin });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? c.invalidData);
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/players/${playerId}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? c.saveFailed);
        return;
      }
      setPin('');
      setSuccess(c.savedSuccess);
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
        {c.backTo.replace('{name}', playerName)}
      </Link>

      <p className="brut-label text-[var(--color-hazard)]">{c.badge}</p>
      <h1 className="brut-heading mt-2 mb-2 text-2xl text-[var(--color-report-text)]">
        {c.title}
      </h1>
      <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-report-text-3)]">
        {c.subtitle}
      </p>

      {initial.hasLogin && (
        <div className="mb-6 border-2 border-[var(--color-report-border)] bg-[var(--color-report-surface)] p-4 font-mono text-[11px] text-[var(--color-report-text-2)]">
          {c.loginActive} <span className="text-[var(--color-report-text)]">{initial.username}</span>
          {initial.lockedUntil && (
            <p className="mt-2 text-[var(--color-hazard)]">{c.lockedUntil.replace('{until}', initial.lockedUntil ?? '')}</p>
          )}
        </div>
      )}

      {!initial.hasProfile && !initial.hasLogin && (
        <p className="mb-4 font-mono text-[11px] text-[var(--color-report-text-3)]">
          {c.createHint}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 border-2 border-[var(--color-report-border)] bg-[var(--color-report-surface)] p-4">
        <Input
          theme="report"
          label={c.username}
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          hint={c.usernameHint}
          required
        />
        <Input
          theme="report"
          label={c.newPin}
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          hint={c.pinHint}
          required
        />
        {error && <p className="font-mono text-[11px] text-[var(--color-hazard)]">{error}</p>}
        {success && <p className="font-mono text-[11px] text-[var(--color-made)]">{success}</p>}
        <Button type="submit" variant="report-primary" disabled={isPending}>
          {isPending ? <CircleNotch className="animate-spin" size={16} /> : c.saveCredentials}
        </Button>
      </form>
    </div>
  );
}
