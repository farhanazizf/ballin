'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  House,
  UsersThree,
  CalendarDots,
  FileText,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Beranda', icon: House },
  { href: '/players', label: 'Pemain', icon: UsersThree },
  { href: '/sessions', label: 'Latihan', icon: CalendarDots },
  { href: '/reports', label: 'Rapor', icon: FileText },
] as const;

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="report-theme min-h-[100dvh]">
      {/* ─── Desktop sidebar ─── */}
      <aside
        className={cn(
          'hidden md:flex flex-col items-center w-16',
          'fixed inset-y-0 left-0 z-40',
          'border-r border-[var(--color-report-border)]',
          'bg-[var(--color-report-surface)]',
        )}
      >
        <Link
          href="/dashboard"
          className="h-16 flex items-center justify-center"
        >
          <img src="/logo-icon.svg" alt="Ballin" className="w-7 h-7" />
        </Link>

        <nav className="flex flex-col items-center gap-1 mt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'w-11 h-11 rounded-[var(--radius-button)]',
                  'flex items-center justify-center',
                  'transition-colors duration-150',
                  isActive
                    ? 'bg-[var(--color-leather-tint)] text-[var(--color-leather)]'
                    : 'text-[var(--color-report-text-3)] hover:text-[var(--color-report-text-2)] hover:bg-[var(--color-report-bg)]',
                )}
              >
                <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ─── Main content ─── */}
      <main className="md:ml-16 pb-20 md:pb-0">{children}</main>

      {/* ─── Mobile bottom bar ─── */}
      <nav
        className={cn(
          'md:hidden fixed bottom-0 inset-x-0 z-40',
          'bg-[var(--color-report-surface)]/95 backdrop-blur-md',
          'border-t border-[var(--color-report-border)]',
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-stretch justify-around h-14">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5',
                  'flex-1 min-h-[var(--size-touch-min)]',
                  'transition-colors duration-150',
                  isActive
                    ? 'text-[var(--color-leather)]'
                    : 'text-[var(--color-report-text-3)]',
                )}
              >
                <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                <span className="text-[11px] font-medium font-[family-name:var(--font-ui)] leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
