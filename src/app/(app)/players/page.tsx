import Link from 'next/link';
import { UsersThree, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCoachTeamIds } from '@/lib/queries/dashboard';
import { getPlayersForOrg } from '@/lib/queries/players';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { getServerMessages } from '@/lib/i18n/server';
import { PlayersList } from './players-list';

type PageProps = {
  searchParams: Promise<{ q?: string; team?: string }>;
};

const cardClass = cn(
  'bg-[var(--color-report-surface)]',
  'border border-[var(--color-report-border)]',
  'rounded-[var(--radius-panel)]',
);

export default async function PlayersPage({ searchParams }: PageProps) {
  const { q, team } = await searchParams;
  const t = await getServerMessages();
  const p = t.players;
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <PageShell>
        <EmptyState
          icon={<UsersThree size={28} weight="duotone" />}
          title={t.common.sessionInactive}
          description={p.sessionInactiveDesc}
          theme="report"
        />
      </PageShell>
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.organization_id) {
    return (
      <PageShell>
        <EmptyState
          icon={<UsersThree size={28} weight="duotone" />}
          title={t.common.profileIncomplete}
          description={p.profileIncompleteDesc}
          theme="report"
        />
      </PageShell>
    );
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', profile.organization_id)
    .maybeSingle();

  const coachTeamIds = await getCoachTeamIds(supabase, user.id);

  let teamsQuery = supabase
    .from('teams')
    .select('id, name')
    .eq('organization_id', profile.organization_id)
    .eq('is_active', true)
    .order('name');

  if (coachTeamIds.length > 0) {
    teamsQuery = teamsQuery.in('id', coachTeamIds);
  }

  const [{ data: teams }, players] = await Promise.all([
    teamsQuery,
    getPlayersForOrg(supabase, profile.organization_id, coachTeamIds, {
      search: q,
      teamId: team,
    }),
  ]);

  const hasFilters = Boolean(q?.trim() || team);

  return (
    <PageShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)]">
            {organization?.name ?? t.common.academy}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-report-text)] font-[family-name:var(--font-display)] mt-0.5">
            {p.title}
          </h1>
          <p className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] mt-1">
            {p.activeCount.replace('{count}', String(players.length))}
          </p>
        </div>
        <Link
          href="/players/new"
          className={cn(
            'inline-flex items-center justify-center h-12 px-5',
            'border-2 border-[var(--color-hazard)] bg-[var(--color-hazard)] text-[var(--color-phosphor)]',
            'font-mono text-xs font-semibold uppercase tracking-[0.1em]',
            'hover:bg-transparent hover:text-[var(--color-hazard)] transition-colors',
          )}
        >
          {p.addPlayer}
        </Link>
      </header>

      <form method="GET" className={cn(cardClass, 'p-4 mb-4 space-y-3')}>
        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-report-text-3)] pointer-events-none"
          />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder={p.searchPlaceholder}
            className={cn(
              'w-full h-12 pl-10 pr-4 rounded-[var(--radius-button)]',
              'bg-[var(--color-report-bg)] border border-[var(--color-report-border)]',
              'text-[var(--color-report-text)] placeholder:text-[var(--color-report-text-3)]',
              'font-[family-name:var(--font-ui)] text-base',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-leather)]/30',
            )}
          />
        </div>

        {(teams?.length ?? 0) > 1 && (
          <select
            name="team"
            defaultValue={team ?? ''}
            className={cn(
              'w-full h-12 px-4 rounded-[var(--radius-button)]',
              'bg-[var(--color-report-bg)] border border-[var(--color-report-border)]',
              'text-[var(--color-report-text)] font-[family-name:var(--font-ui)] text-base',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-leather)]/30',
            )}
          >
            <option value="">{p.allTeams}</option>
            {(teams ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        <button
          type="submit"
          className={cn(
            'w-full h-12 rounded-[var(--radius-button)]',
            'bg-[var(--color-leather)] text-[var(--color-on-leather)]',
            'font-[family-name:var(--font-ui)] font-semibold text-base',
            'hover:bg-[var(--color-leather-deep)] transition-colors',
          )}
        >
          {t.common.applyFilter}
        </button>
      </form>

      {players.length === 0 ? (
        <EmptyState
          icon={<UsersThree size={28} weight="duotone" />}
          title={hasFilters ? p.notFoundTitle : p.emptyTitle}
          description={hasFilters ? p.notFoundDesc : p.emptyDesc}
          theme="report"
        />
      ) : (
        <PlayersList
          players={players.map((player) => ({
            id: player.id,
            nickname: player.nickname,
            fullName: player.fullName,
            jerseyNumber: player.jerseyNumber,
            teamNames: player.teamNames,
          }))}
        />
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto md:max-w-none">
      {children}
    </div>
  );
}
