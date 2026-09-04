import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  UserCircle,
  Ruler,
  Key,
  Phone,
  ChartLineUp,
  CalendarCheck,
} from '@phosphor-icons/react/dist/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getPlayerDetail,
  getPlayerAttendanceHistory,
  getPlayerDrillTrends,
} from '@/lib/queries/players';
import { formatDate, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';

type PageProps = {
  params: Promise<{ id: string }>;
};

const cardClass = cn(
  'bg-[var(--color-report-surface)]',
  'border border-[var(--color-report-border)]',
  'rounded-[var(--radius-panel)]',
  'p-5 md:p-6',
);

function dominantHandLabel(hand: string | null): string {
  if (hand === 'left') return 'Kiri';
  if (hand === 'right') return 'Kanan';
  if (hand === 'both') return 'Kedua tangan';
  return '—';
}

function formatMeasurement(value: number | null, unit: string): string {
  if (value == null) return '—';
  return `${value} ${unit}`;
}

function attendanceStatusLabel(status: string): string {
  if (status === 'present') return 'Hadir';
  if (status === 'late') return 'Terlambat';
  if (status === 'excused') return 'Izin';
  if (status === 'sick') return 'Sakit';
  if (status === 'absent') return 'Absen';
  return status;
}

function attendanceDotClass(status: string): string {
  if (status === 'present') return 'bg-[var(--color-made)]';
  if (status === 'late') return 'bg-[var(--color-gold)]';
  if (status === 'absent') return 'bg-[var(--color-miss)]';
  return 'bg-[var(--color-report-border)]';
}

const ATTRIBUTE_LABELS = [
  { key: 'shooting', label: 'Shooting' },
  { key: 'finishing', label: 'Finishing' },
  { key: 'ballhandling', label: 'Ball handling' },
  { key: 'defense', label: 'Defense' },
  { key: 'athleticism', label: 'Athleticism' },
  { key: 'attitude', label: 'Attitude' },
] as const;

export default async function PlayerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const player = await getPlayerDetail(supabase, id);

  if (!player) {
    notFound();
  }

  const [attendanceHistory, drillTrends] = await Promise.all([
    getPlayerAttendanceHistory(supabase, id),
    getPlayerDrillTrends(supabase, id),
  ]);

  const displayName = player.nickname || player.fullName;
  const attributes = player.attributes;

  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto md:max-w-3xl">
      <Link
        href="/players"
        className={cn(
          'inline-flex items-center gap-2 mb-6',
          'text-sm text-[var(--color-report-text-2)] hover:text-[var(--color-report-text)]',
          'font-[family-name:var(--font-ui)] transition-colors',
          'min-h-[var(--size-touch-min)]',
        )}
      >
        <ArrowLeft size={18} />
        Daftar pemain
      </Link>

      <header className="mb-6 flex items-start gap-4">
        {player.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.photoUrl}
            alt=""
            className="w-16 h-16 rounded-[var(--radius-panel)] object-cover border border-[var(--color-report-border)] shrink-0"
          />
        ) : (
          <div
            className={cn(
              'w-16 h-16 rounded-[var(--radius-panel)] shrink-0',
              'bg-[var(--color-report-bg)] border border-[var(--color-report-border)]',
              'flex items-center justify-center text-[var(--color-report-text-3)]',
            )}
          >
            <UserCircle size={36} weight="duotone" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-report-text)] font-[family-name:var(--font-display)]">
              {displayName}
            </h1>
            <Link
              href={`/players/${player.id}/edit`}
              className={cn(
                buttonVariants({ variant: 'report-secondary', size: 'sm' }),
                'ml-auto sm:ml-0',
              )}
            >
              Edit
            </Link>
            {player.jerseyNumber != null && (
              <Badge variant="report-default" size="md">
                #{player.jerseyNumber}
              </Badge>
            )}
          </div>
          <p className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] mt-1">
            {player.fullName}
          </p>
          {player.teamNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {player.teamNames.map((teamName) => (
                <Badge key={teamName} variant="leather" size="sm">
                  {teamName}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </header>

      <section className={cn(cardClass, 'mb-4')}>
        <h2 className="text-sm font-semibold text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] uppercase tracking-wide mb-4">
          Profil
        </h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          <ProfileField label="Usia" value={player.age != null ? `${player.age} tahun` : '—'} />
          <ProfileField label="Posisi" value={player.position ?? '—'} />
          <ProfileField label="Tangan dominan" value={dominantHandLabel(player.dominantHand)} />
          <ProfileField label="Sekolah" value={player.school ?? '—'} />
          <ProfileField label="Bergabung" value={formatDate(player.joinedAt)} />
          <ProfileField
            label="Kehadiran (12 sesi)"
            value={`${player.attendanceRate}%`}
          />
        </dl>
      </section>

      <section className={cn(cardClass, 'mb-4')}>
        <div className="flex items-center gap-2 mb-4">
          <Ruler size={18} className="text-[var(--color-report-text-3)]" />
          <h2 className="text-sm font-semibold text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] uppercase tracking-wide">
            Ukuran tubuh terbaru
          </h2>
        </div>

        <Link
          href={`/players/${player.id}/measurements`}
          className={cn(
            buttonVariants({ variant: 'report-secondary', size: 'sm' }),
            'mb-4',
          )}
        >
          Catat / lihat riwayat
        </Link>
        {player.measurements ? (
          <>
            <p className="text-xs text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] mb-4">
              Diukur {formatDate(player.measurements.measuredOn)}
            </p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
              <ProfileField
                label="Tinggi"
                value={formatMeasurement(player.measurements.heightCm, 'cm')}
              />
              <ProfileField
                label="Berat"
                value={formatMeasurement(player.measurements.weightKg, 'kg')}
              />
              <ProfileField
                label="Rentang sayap"
                value={formatMeasurement(player.measurements.wingspanCm, 'cm')}
              />
              <ProfileField
                label="Jangkauan berdiri"
                value={formatMeasurement(player.measurements.standingReachCm, 'cm')}
              />
            </dl>
          </>
        ) : (
          <p className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] leading-relaxed">
            Belum ada data ukuran tubuh. Catat pengukuran di menu ukuran pemain setelah latihan
            pertama.
          </p>
        )}
      </section>

      {attributes ? (
        <section className={cn(cardClass, 'mb-4')}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <ChartLineUp size={18} className="text-[var(--color-report-text-3)]" />
            <h2 className="text-sm font-semibold text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] uppercase tracking-wide">
              Atribut terbaru
            </h2>
            {attributes.archetype ? (
              <Badge variant="leather" size="sm">
                {attributes.archetype}
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] mb-4">
            Periode {formatDate(attributes.periodStart)}
            {attributes.periodEnd ? ` – ${formatDate(attributes.periodEnd)}` : ''}
          </p>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
            {ATTRIBUTE_LABELS.map(({ key, label }) => (
              <ProfileField key={key} label={label} value={String(attributes[key])} />
            ))}
          </dl>
        </section>
      ) : null}

      {(player.guardianName || player.guardianPhone) ? (
        <section className={cn(cardClass, 'mb-4')}>
          <div className="flex items-center gap-2 mb-4">
            <Phone size={18} className="text-[var(--color-report-text-3)]" />
            <h2 className="text-sm font-semibold text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] uppercase tracking-wide">
              Kontak wali
            </h2>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            <ProfileField label="Nama wali" value={player.guardianName ?? '—'} />
            <ProfileField
              label="Telepon"
              value={
                player.guardianPhone ? (
                  <a
                    href={`tel:${player.guardianPhone}`}
                    className="text-[var(--color-leather)] hover:underline"
                  >
                    {player.guardianPhone}
                  </a>
                ) : (
                  '—'
                )
              }
            />
          </dl>
        </section>
      ) : null}

      <section className={cn(cardClass, 'mb-4')}>
        <div className="flex items-center gap-2 mb-4">
          <CalendarCheck size={18} className="text-[var(--color-report-text-3)]" />
          <h2 className="text-sm font-semibold text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] uppercase tracking-wide">
            Riwayat absensi
          </h2>
        </div>

        {attendanceHistory.length > 0 ? (
          <>
            <ul className="space-y-2">
              {[...attendanceHistory].reverse().map((item) => (
                <li
                  key={`${item.sessionDate}-${item.status}`}
                  className="flex items-center gap-3 py-1.5"
                >
                  <span
                    aria-hidden
                    className={cn('h-2.5 w-2.5 rounded-full shrink-0', attendanceDotClass(item.status))}
                  />
                  <span className="text-sm text-[var(--color-report-text)] font-[family-name:var(--font-ui)] flex-1">
                    {formatDate(item.sessionDate)}
                  </span>
                  <span className="text-xs text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)]">
                    {attendanceStatusLabel(item.status)}
                  </span>
                </li>
              ))}
            </ul>
            {player.recentAbsences >= 3 ? (
              <p className="mt-4 text-xs text-[var(--color-miss)] font-[family-name:var(--font-ui)]">
                {player.recentAbsences} absen dalam 12 sesi terakhir — perlu follow-up.
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] leading-relaxed">
            Belum ada riwayat absensi tercatat.
          </p>
        )}
      </section>

      <section className={cn(cardClass, 'mb-4')}>
        <div className="flex items-center gap-2 mb-4">
          <ChartLineUp size={18} className="text-[var(--color-report-text-3)]" />
          <h2 className="text-sm font-semibold text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] uppercase tracking-wide">
            Tren drill
          </h2>
        </div>

        {drillTrends.length > 0 ? (
          <div className="space-y-4">
            {drillTrends.map((series) => (
              <div key={series.drillName}>
                <p className="text-sm font-medium text-[var(--color-report-text)] font-[family-name:var(--font-display)] mb-2">
                  {series.drillName}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[...series.points].reverse().map((point) => (
                    <span
                      key={`${series.drillName}-${point.sessionDate}`}
                      className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-[var(--radius-chip)]',
                        'text-xs font-medium font-[family-name:var(--font-display)] tabular-nums',
                        'bg-[var(--color-report-bg)] text-[var(--color-report-text-2)]',
                        'border border-[var(--color-report-border)]',
                      )}
                    >
                      {point.display}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] leading-relaxed">
            Belum ada hasil drill tercatat untuk pemain ini.
          </p>
        )}
      </section>

      <section className={cardClass}>
        <div className="flex items-center gap-2 mb-2">
          <Key size={18} className="text-[var(--color-report-text-3)]" />
          <h2 className="text-sm font-semibold text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] uppercase tracking-wide">
            Akun pemain
          </h2>
        </div>
        <p className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] mb-4 leading-relaxed">
          Atur username dan PIN agar pemain bisa masuk ke kartu digital mereka.
        </p>
        <Link
          href={`/players/${player.id}/credentials`}
          className={cn(
            'inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[var(--radius-button)]',
            'bg-[var(--color-report-surface)] text-[var(--color-report-text)]',
            'border border-[var(--color-report-border)] hover:bg-[var(--color-report-bg)]',
            'font-[family-name:var(--font-ui)] font-semibold text-base transition-all duration-150',
            'w-full sm:w-auto',
          )}
        >
          Kelola kredensial
        </Link>
      </section>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] mb-1">
        {label}
      </dt>
      <dd className="text-sm font-medium text-[var(--color-report-text)] font-[family-name:var(--font-display)]">
        {value}
      </dd>
    </div>
  );
}
