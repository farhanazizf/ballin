'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { signOutAndRedirect } from '@/lib/auth/sign-out';

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    await signOutAndRedirect('/player-login', router);
    setSigningOut(false);
  }

  async function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    router.refresh();
    setRefreshing(false);
  }

  return (
    <div
      className={cn('auth-telemetry field-theme relative min-h-[100dvh] flex flex-col')}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div aria-hidden className="telemetry-scanlines" />
      <div aria-hidden className="telemetry-noise" />

      <header className="relative z-20 grid grid-cols-[1fr_auto] items-center gap-2 border-b border-[var(--color-field-border)] px-4 h-14 shrink-0">
        <Link href="/card" className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-phosphor)]">
          [ Kartu / Pemain ]
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className={cn(
              'inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em]',
              'border border-[var(--color-field-border)] px-3 py-2',
              'text-[var(--color-field-text-3)]',
              'hover:border-[var(--color-phosphor)] hover:text-[var(--color-phosphor)]',
              'disabled:opacity-40',
            )}
          >
            <ArrowsClockwise size={14} className={refreshing ? 'animate-spin' : undefined} />
            Perbarui
          </button>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className={cn(
              'font-mono text-[10px] uppercase tracking-[0.1em]',
              'border border-[var(--color-field-border)] px-3 py-2',
              'text-[var(--color-field-text-3)]',
              'hover:border-[var(--color-hazard)] hover:text-[var(--color-hazard)]',
              'disabled:opacity-40',
            )}
          >
            {signingOut ? 'Keluar…' : 'Keluar'}
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1">{children}</main>
    </div>
  );
}
