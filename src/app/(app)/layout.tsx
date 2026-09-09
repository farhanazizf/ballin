'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDots,
  FileText,
  GearSix,
  House,
  Trophy,
  UsersThree,
  type Icon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { signOutAndRedirect } from '@/lib/auth/sign-out';
import { useTranslations } from '@/lib/i18n/use-translations';
import { LanguageToggle } from '@/components/i18n/language-toggle';
import { PageTransition } from '@/components/motion/page-transition';

type NavItem = {
  href: string;
  labelKey: 'home' | 'players' | 'sessions' | 'matches' | 'reports';
  icon: Icon;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', labelKey: 'home', icon: House },
  { href: '/players', labelKey: 'players', icon: UsersThree },
  { href: '/sessions', labelKey: 'sessions', icon: CalendarDots },
  { href: '/matches', labelKey: 'matches', icon: Trophy },
  { href: '/reports', labelKey: 'reports', icon: FileText },
];

function CoachAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t: messages } = useTranslations();
  const t = messages.shell;
  const [signingOut, setSigningOut] = useState(false);

  const settingsActive = pathname.startsWith('/settings');

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    await signOutAndRedirect('/login', router);
    setSigningOut(false);
  }

  const headerActionClass = cn(
    'inline-flex min-h-[var(--size-touch-min)] min-w-[var(--size-touch-min)] items-center justify-center',
    'border border-[var(--color-report-border)]',
    'font-mono text-[10px] uppercase tracking-[0.1em]',
    'text-[var(--color-report-text-2)]',
    'disabled:opacity-40',
    'hover:border-[var(--color-hazard)] hover:text-[var(--color-hazard)]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-report-text)]',
  );

  return (
    <div className="report-theme min-h-[100dvh]">
      <header
        className={cn(
          'md:hidden fixed top-0 inset-x-0 z-40',
          'grid grid-cols-[1fr_auto] items-center gap-3',
          'border-b-2 border-[var(--color-report-border)] bg-[var(--color-report-bg)]',
          'px-4 h-12',
        )}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-report-text)] truncate">
          {t.brand}
        </p>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link
            href="/settings"
            aria-current={settingsActive ? 'page' : undefined}
            aria-label={t.settings}
            className={cn(
              headerActionClass,
              settingsActive && 'border-[var(--color-hazard)] text-[var(--color-hazard)]',
            )}
          >
            <GearSix size={18} weight={settingsActive ? 'fill' : 'regular'} aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className={cn(headerActionClass, 'px-3')}
          >
            {signingOut ? t.signOutPending : t.signOut}
          </button>
        </div>
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
            <p className="brut-label text-[var(--color-hazard)]">{t.brand}</p>
            <p className="brut-heading mt-2 text-2xl text-[var(--color-report-text)]">{t.sidebarTitle}</p>
          </Link>
        </div>

        <nav className="flex flex-col">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'grid grid-cols-[2.5rem_1fr] items-center gap-2 border-b border-[var(--color-report-border)] px-5 py-4',
                  'font-mono text-[11px] uppercase tracking-[0.1em] transition-all duration-200',
                  isActive
                    ? 'bg-[var(--color-report-text)] text-[var(--color-phosphor)]'
                    : 'text-[var(--color-report-text-2)] hover:bg-[var(--color-report-border)]/10 hover:text-[var(--color-report-text)]',
                )}
              >
                <IconComponent
                  size={20}
                  weight={isActive ? 'fill' : 'regular'}
                  className={isActive ? 'text-[var(--color-hazard)]' : 'text-[var(--color-report-text-3)]'}
                  aria-hidden
                />
                <span>{t.nav[item.labelKey]}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t-2 border-[var(--color-report-border)] px-5 py-4 space-y-3">
          <LanguageToggle className="mb-3" />
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/settings"
              aria-current={settingsActive ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-[var(--size-touch-min)] items-center justify-center gap-2',
                'border-2 border-[var(--color-report-border)] px-2',
                'font-mono text-[10px] uppercase tracking-[0.1em]',
                settingsActive
                  ? 'border-[var(--color-hazard)] text-[var(--color-hazard)]'
                  : 'text-[var(--color-report-text-2)] hover:border-[var(--color-hazard)] hover:text-[var(--color-hazard)]',
              )}
            >
              <GearSix size={16} weight={settingsActive ? 'fill' : 'regular'} aria-hidden />
              <span className="truncate">{t.settings}</span>
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
              className={cn(
                'inline-flex min-h-[var(--size-touch-min)] items-center justify-center',
                'border-2 border-[var(--color-report-border)] px-2',
                'font-mono text-[10px] uppercase tracking-[0.1em]',
                'text-[var(--color-report-text-2)]',
                'disabled:opacity-40',
                'hover:border-[var(--color-hazard)] hover:text-[var(--color-hazard)]',
              )}
            >
              {signingOut ? t.signOutPending : t.signOut}
            </button>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--color-report-text-3)]">
            Dynasty BBA · REV 1.0
          </p>
        </div>
      </aside>

      <main className="md:ml-52 pb-[calc(var(--size-touch-min)+1rem)] md:pb-0 pt-12 md:pt-0">
        <PageTransition>{children}</PageTransition>
      </main>

      <nav
        className={cn(
          'md:hidden fixed bottom-0 inset-x-0 z-40',
          'bg-[var(--color-report-bg)]',
          'border-t-2 border-[var(--color-report-border)]',
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label={t.brand}
      >
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2.5',
                  'min-h-[var(--size-touch-min)] font-mono text-[9px] uppercase tracking-[0.08em] transition-all duration-200',
                  isActive
                    ? 'bg-[var(--color-report-text)] text-[var(--color-phosphor)]'
                    : 'text-[var(--color-report-text-3)]',
                )}
              >
                <IconComponent
                  size={22}
                  weight={isActive ? 'fill' : 'regular'}
                  className={isActive ? 'text-[var(--color-hazard)]' : undefined}
                  aria-hidden
                />
                <span>{t.nav[item.labelKey]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <CoachAppShell>{children}</CoachAppShell>;
}
