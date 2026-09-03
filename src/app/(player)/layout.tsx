'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SignOut } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function handleSignOut() {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/player-login');
  }

  return (
    <div
      className={cn('field-theme min-h-[100dvh] flex flex-col')}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <header className="relative z-20 flex items-center justify-between px-4 h-14 shrink-0">
        <Image
          src="/logo-icon.svg"
          alt="Ballin"
          width={28}
          height={28}
          priority
        />
        <button
          type="button"
          onClick={handleSignOut}
          className={cn(
            'flex items-center justify-center w-10 h-10',
            'rounded-[var(--radius-panel)]',
            'text-[var(--color-field-text-3)]',
            'hover:text-[var(--color-field-text-2)] hover:bg-[var(--color-field-raised)]',
            'active:bg-[var(--color-field-raised)]',
            'transition-colors',
          )}
          aria-label="Keluar"
        >
          <SignOut size={20} />
        </button>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
