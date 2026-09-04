import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  UserCircle,
  Ruler,
  Key,
} from '@phosphor-icons/react/dist/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getPlayerDetail } from '@/lib/queries/players';
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

export default async function PlayerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const player = await getPlayerDetail(supabase, id);

  if (!player) {
    notFound();
  }

  const displayName = player.nickname || player.fullName;

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

function ProfileField({ label, value }: { label: string; value: string }) {
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
