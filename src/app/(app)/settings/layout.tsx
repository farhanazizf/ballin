'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n/use-translations';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t: messages } = useTranslations();
  const t = messages.shell;

  const settingsNav = [
    { href: '/settings/teams', label: t.settingsNav.teams },
    { href: '/settings/drills', label: t.settingsNav.drills },
    { href: '/settings/language', label: t.settingsNav.language },
  ] as const;

  return (
    <div>
      <nav className="border-b-2 border-[var(--color-report-border)] bg-[var(--color-report-bg)]">
        <div className="mx-auto flex max-w-2xl gap-0 overflow-x-auto px-4 md:px-8">
          {settingsNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'shrink-0 border-r-2 border-[var(--color-report-border)] px-4 py-3',
                  'font-mono text-[10px] uppercase tracking-[0.1em]',
                  isActive
                    ? 'bg-[var(--color-report-text)] text-[var(--color-phosphor)]'
                    : 'text-[var(--color-report-text-2)] hover:text-[var(--color-report-text)]',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      {children}
    </div>
  );
}
