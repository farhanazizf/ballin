'use client';

import Link from 'next/link';
import { CaretRight } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { StaggerList, StaggerRow } from '@/components/motion/stagger-list';
import { cn } from '@/lib/utils';

export type PlayerListItem = {
  id: string;
  nickname: string;
  fullName: string;
  jerseyNumber: number | null;
  teamNames: string[];
};

const cardClass = cn(
  'bg-[var(--color-report-surface)]',
  'border border-[var(--color-report-border)]',
  'rounded-[var(--radius-panel)]',
);

export function PlayersList({ players }: { players: PlayerListItem[] }) {
  return (
    <StaggerList className={cn(cardClass, 'divide-y divide-[var(--color-report-border)] overflow-hidden')}>
      {players.map((player) => (
        <StaggerRow key={player.id}>
          <Link
            href={`/players/${player.id}`}
            className={cn(
              'flex items-center gap-3 px-4 py-4 min-h-[var(--size-touch-min)]',
              'hover:bg-[var(--color-report-bg)] transition-colors duration-200',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-focus)]',
            )}
          >
            <div
              className={cn(
                'shrink-0 w-11 h-11 rounded-[var(--radius-button)]',
                'bg-[var(--color-report-bg)] border border-[var(--color-report-border)]',
                'flex items-center justify-center',
                'font-[family-name:var(--font-display)] font-semibold text-[var(--color-report-text)] tabular-nums',
              )}
            >
              {player.jerseyNumber ?? '—'}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-[family-name:var(--font-display)] font-semibold text-[var(--color-report-text)] truncate">
                {player.nickname}
              </p>
              <p className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] truncate mt-0.5">
                {player.fullName}
              </p>
              {player.teamNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {player.teamNames.map((teamName) => (
                    <Badge key={teamName} variant="leather" size="sm">
                      {teamName}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <CaretRight size={18} className="shrink-0 text-[var(--color-report-text-3)]" aria-hidden />
          </Link>
        </StaggerRow>
      ))}
    </StaggerList>
  );
}
