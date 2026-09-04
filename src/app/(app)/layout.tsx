'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { signOutAndRedirect } from '@/lib/auth/sign-out';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Beranda', code: '01' },
  { href: '/players', label: 'Pemain', code: '02' },
  { href: '/sessions', label: 'Latihan', code: '03' },
  { href: '/reports', label: 'Rapor', code: '04' },
  { href: '/settings', label: 'Pengaturan', code: '05' },
] as const;

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    await signOutAndRedirect('/login', router);
    setSigningOut(false);
  }

  return (
    <div className="report-theme min-h-[100dvh]">
      <header
        className={cn(
          'md:hidden fixed top-0 inset-x-0 z-40',
          'grid grid-cols-[1fr_auto] items-center',
          'border-b-2 border-[var(--color-report-border)] bg-[var(--color-report-bg)]',
          'px-4 h-12',
        )}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-report-text)]">
          [ Ballin / Coach ]
        </p>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          className={cn(
            'font-mono text-[10px] uppercase tracking-[0.1em]',
            'border border-[var(--color-report-border)] px-3 py-1.5',
            'text-[var(--color-report-text-2)]',
            'disabled:opacity-40',
            'hover:border-[var(--color-hazard)] hover:text-[var(--color-hazard)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-report-text)]',
          )}
        >
          Keluar
        </button>
      </header>

      <aside
        className={cn(
          'hidden md:flex flex-col w-52',
          'fixed inset-y-0 left-0 z-40',
          'border-r-2 border-[var(--color-report-border)]',
          'bg-[var(--color-report-bg)]',
        )}
      >
        <div className="border-b-2 border-[var(--color-report-border)] px-5 py-5">
          <Link href="/dashboard" className="block">
            <p className="brut-label text-[var(--color-hazard)]">[ Ballin / Coach ]</p>
            <p className="brut-heading mt-2 text-2xl text-[var(--color-report-text)]">Ops</p>
          </Link>
        </div>

        <nav className="flex flex-col">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'grid grid-cols-[2.5rem_1fr] items-center border-b border-[var(--color-report-border)] px-5 py-4',
                  'font-mono text-[11px] uppercase tracking-[0.1em] transition-colors',
                  isActive
                    ? 'bg-[var(--color-report-text)] text-[var(--color-phosphor)]'
                    : 'text-[var(--color-report-text-2)] hover:bg-[var(--color-report-border)]/10 hover:text-[var(--color-report-text)]',
                )}
              >
                <span className={isActive ? 'text-[var(--color-hazard)]' : 'text-[var(--color-report-text-3)]'}>
                  {item.code}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t-2 border-[var(--color-report-border)] px-5 py-4 space-y-3">
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className={cn(
              'w-full font-mono text-[10px] uppercase tracking-[0.1em]',
              'border-2 border-[var(--color-report-border)] px-3 py-2.5',
              'text-[var(--color-report-text-2)]',
              'disabled:opacity-40',
              'hover:border-[var(--color-hazard)] hover:text-[var(--color-hazard)]',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-report-text)]',
            )}
          >
            {signingOut ? 'Keluar…' : '>>> Keluar'}
          </button>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--color-report-text-3)]">
            Dynasty BBA · REV 1.0
          </p>
        </div>
      </aside>

      <main className="md:ml-52 pb-20 md:pb-0 pt-12 md:pt-0">{children}</main>

      <nav
        className={cn(
          'md:hidden fixed bottom-0 inset-x-0 z-40',
          'bg-[var(--color-report-bg)]',
          'border-t-2 border-[var(--color-report-border)]',
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-3',
                  'min-h-[var(--size-touch-min)] font-mono text-[9px] uppercase tracking-[0.08em]',
                  isActive
                    ? 'bg-[var(--color-report-text)] text-[var(--color-phosphor)]'
                    : 'text-[var(--color-report-text-3)]',
                )}
              >
                <span className={isActive ? 'text-[var(--color-hazard)]' : undefined}>{item.code}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
