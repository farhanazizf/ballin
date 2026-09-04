'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const SETTINGS_NAV = [
  { href: '/settings/teams', label: 'Kelas' },
  { href: '/settings/drills', label: 'Drill library' },
] as const;

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav className="border-b-2 border-[var(--color-report-border)] bg-[var(--color-report-bg)]">
        <div className="mx-auto flex max-w-2xl gap-0 px-4 md:px-8">
          {SETTINGS_NAV.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'border-r-2 border-[var(--color-report-border)] px-4 py-3',
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
