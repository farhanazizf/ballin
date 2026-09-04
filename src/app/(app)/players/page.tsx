import Link from 'next/link';
import { UsersThree, MagnifyingGlass, CaretRight } from '@phosphor-icons/react/dist/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCoachTeamIds } from '@/lib/queries/dashboard';
import { getPlayersForOrg } from '@/lib/queries/players';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <PageShell>
        <EmptyState
          icon={<UsersThree size={28} weight="duotone" />}
          title="Sesi belum aktif"
          description="Masuk ulang dengan akun coach untuk melihat daftar pemain."
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
          title="Profil belum lengkap"
          description="Akun Anda belum terhubung ke organisasi. Hubungi admin Dynasty untuk aktivasi."
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
            {organization?.name ?? 'Akademi'}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-report-text)] font-[family-name:var(--font-display)] mt-0.5">
            Pemain
          </h1>
          <p className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] mt-1">
            {players.length} pemain aktif
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
          Tambah pemain
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
            placeholder="Cari nama, nomor punggung, atau kelas"
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
            <option value="">Semua kelas</option>
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
          Terapkan filter
        </button>
      </form>

      {players.length === 0 ? (
        <EmptyState
          icon={<UsersThree size={28} weight="duotone" />}
          title={hasFilters ? 'Pemain tidak ditemukan' : 'Belum ada pemain'}
          description={
            hasFilters
              ? 'Coba ubah kata kunci atau pilih kelas lain. Filter bisa direset dengan kosongkan pencarian.'
              : 'Tambahkan pemain lewat menu kelola roster. Daftar akan muncul di sini setelah data dimasukkan.'
          }
          theme="report"
        />
      ) : (
        <ul className={cn(cardClass, 'divide-y divide-[var(--color-report-border)] overflow-hidden')}>
          {players.map((player) => (
            <li key={player.id}>
              <Link
                href={`/players/${player.id}`}
                className={cn(
                  'flex items-center gap-3 px-4 py-4 min-h-[var(--size-touch-min)]',
                  'hover:bg-[var(--color-report-bg)] transition-colors',
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

                <CaretRight
                  size={18}
                  className="shrink-0 text-[var(--color-report-text-3)]"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
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
