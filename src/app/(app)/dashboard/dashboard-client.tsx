'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarDots,
  MapPin,
  ArrowUp,
  ArrowDown,
  CaretRight,
  WarningCircle,
  Barbell,
  CalendarBlank,
  ChartBar,
} from '@phosphor-icons/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import type {
  AttentionPlayer,
  DrillDistributionItem,
  UpcomingSession,
  WeeklyAttendance,
} from '@/lib/queries/dashboard';

export type DashboardClientProps = {
  orgName: string;
  teamName: string;
  upcomingSession: UpcomingSession | null;
  attendance: WeeklyAttendance;
  attentionPlayers: AttentionPlayer[];
  drillDistribution: DrillDistributionItem[];
};

function formatIndonesianDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

function sessionStatusLabel(status: UpcomingSession['status']): string {
  if (status === 'active') return 'Sedang berlangsung';
  if (status === 'scheduled') return 'Belum dimulai';
  return 'Selesai';
}

const cardClass = cn(
  'bg-[var(--color-report-surface)]',
  'border border-[var(--color-report-border)]',
  'rounded-[var(--radius-panel)]',
  'p-5 md:p-6',
);

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

function DrillTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { category: string; count: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const { category, count } = payload[0].payload;
  return (
    <div
      className={cn(
        'rounded-[var(--radius-panel)] px-3 py-2 text-xs shadow-sm',
        'bg-[var(--color-report-surface)] border border-[var(--color-report-border)]',
        'font-[family-name:var(--font-ui)]',
      )}
    >
      <span className="text-[var(--color-report-text)]">{category}</span>
      <span className="ml-2 font-medium text-[var(--color-report-text)] font-[family-name:var(--font-display)] tabular-nums">
        {count}×
      </span>
    </div>
  );
}

function getLowCategories(items: DrillDistributionItem[]): Set<string> {
  if (items.length === 0) return new Set();
  const sorted = [...items].sort((a, b) => a.count - b.count);
  const threshold = Math.max(1, Math.ceil(items.length / 2));
  return new Set(sorted.slice(0, threshold).map((item) => item.category));
}

export function DashboardClient({
  orgName,
  teamName,
  upcomingSession,
  attendance,
  attentionPlayers,
  drillDistribution,
}: DashboardClientProps) {
  const today = useMemo(() => new Date(), []);
  const todayFormatted = useMemo(() => formatIndonesianDate(today), [today]);
  const lowCategories = useMemo(
    () => getLowCategories(drillDistribution),
    [drillDistribution],
  );

  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6 md:mb-8">
        <p className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)]">
          {orgName}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-report-text)] font-[family-name:var(--font-display)] mt-0.5">
          {teamName}
        </h1>
        <p className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] mt-1">
          {todayFormatted}
        </p>
      </header>

      <div
        className={cn(
          'grid gap-4 md:gap-5',
          'grid-cols-1',
          'md:grid-cols-[2fr_1fr]',
          'md:grid-rows-[auto_auto]',
        )}
      >
        <motion.div {...fadeUp} className={cn(cardClass, 'md:col-span-1')}>
          {upcomingSession ? (
            <>
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-leather-tint)]">
                  <CalendarDots size={20} weight="duotone" className="text-[var(--color-leather)]" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-[var(--color-report-text)] font-[family-name:var(--font-display)]">
                    Latihan hari ini
                  </h2>
                  <p className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] mt-0.5">
                    {formatIndonesianDate(new Date(upcomingSession.scheduledStart))} ·{' '}
                    {formatTime(upcomingSession.scheduledStart)}
                    {upcomingSession.scheduledEnd
                      ? ` – ${formatTime(upcomingSession.scheduledEnd)}`
                      : ''}
                  </p>
                </div>
              </div>

              {upcomingSession.location ? (
                <div className="flex items-center gap-2 mb-1.5">
                  <MapPin size={16} weight="regular" className="text-[var(--color-report-text-3)] shrink-0" />
                  <span className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)]">
                    {upcomingSession.location}
                  </span>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-2 mt-3 mb-5">
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-[var(--radius-chip)]',
                    'text-xs font-medium font-[family-name:var(--font-ui)]',
                    'bg-[var(--color-report-bg)] text-[var(--color-report-text-2)]',
                    'border border-[var(--color-report-border)]',
                  )}
                >
                  {sessionStatusLabel(upcomingSession.status)}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-[var(--radius-chip)]',
                    'text-xs font-medium font-[family-name:var(--font-ui)]',
                    'bg-[var(--color-leather-tint)] text-[var(--color-leather)]',
                  )}
                >
                  {upcomingSession.teamName}
                </span>
              </div>

              <Link
                href={`/session//attendance`}
                className={cn(
                  'w-full md:w-auto',
                  'inline-flex items-center justify-center gap-2',
                  'px-6 py-3 rounded-[var(--radius-button)]',
                  'bg-[var(--color-leather)] text-white',
                  'font-semibold text-sm font-[family-name:var(--font-ui)]',
                  'transition-colors duration-150',
                  'hover:bg-[var(--color-leather-deep)]',
                  'active:scale-[0.98] active:transition-transform',
                  'focus-visible:focus-ring',
                )}
              >
                <Barbell size={18} weight="bold" />
                {upcomingSession.status === 'active' ? 'Lanjut latihan' : 'Mulai latihan'}
              </Link>
            </>
          ) : (
            <EmptyState
              icon={<CalendarBlank size={28} weight="duotone" />}
              title="Belum ada latihan terjadwal"
              description="Buat jadwal latihan baru agar tim bisa mulai mencatat absensi dan drill."
              theme="report"
              className="py-10"
            />
          )}
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.06 }}
          className={cn(cardClass, 'md:col-span-1 flex flex-col')}
        >
          <h2 className="text-sm font-semibold text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] mb-3">
            Absen minggu ini
          </h2>

          {attendance.total > 0 ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[40px] leading-none font-semibold font-[family-name:var(--font-display)] tabular-nums text-[var(--color-report-text)]">
                  {attendance.present}
                </span>
                <span className="text-lg text-[var(--color-report-text-3)] font-[family-name:var(--font-display)] tabular-nums">
                  / {attendance.total}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] tabular-nums">
                  {attendance.pct}%
                </span>
                {attendance.trend !== 0 ? (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 text-xs font-medium font-[family-name:var(--font-ui)]',
                      attendance.trend > 0 ? 'text-[var(--color-made)]' : 'text-[var(--color-miss)]',
                    )}
                  >
                    {attendance.trend > 0 ? (
                      <ArrowUp size={12} weight="bold" />
                    ) : (
                      <ArrowDown size={12} weight="bold" />
                    )}
                    {Math.abs(attendance.trend)}% dari minggu lalu
                  </span>
                ) : (
                  <span className="text-xs text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)]">
                    Sama dengan minggu lalu
                  </span>
                )}
              </div>

              <div className="mt-auto pt-4">
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart data={attendance.weekly} barCategoryGap="25%">
                    <Bar
                      dataKey="value"
                      fill="var(--color-chart-2)"
                      radius={[3, 3, 0, 0]}
                      animationDuration={600}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<ChartBar size={28} weight="duotone" />}
              title="Belum ada data absensi"
              description="Data absensi minggu ini akan muncul setelah latihan pertama dicatat."
              theme="report"
              className="py-8"
            />
          )}
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.12 }}
          className={cn(cardClass, 'md:col-span-1 md:row-start-2')}
        >
          <div className="flex items-center gap-2 mb-4">
            <WarningCircle size={18} weight="duotone" className="text-[var(--color-gold)]" />
            <h2 className="text-sm font-semibold text-[var(--color-report-text)] font-[family-name:var(--font-ui)]">
              Perlu perhatian
            </h2>
          </div>

          {attentionPlayers.length > 0 ? (
            <ul className="divide-y divide-[var(--color-report-border)]">
              {attentionPlayers.map((player) => (
                <li key={player.id}>
                  <Link
                    href={`/players/${player.id}`}
                    className={cn(
                      'w-full flex items-center gap-3 py-3',
                      'text-left transition-colors duration-100',
                      'hover:bg-[var(--color-report-bg)] -mx-2 px-2 rounded-[var(--radius-panel)]',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--color-report-text)] font-[family-name:var(--font-display)]">
                        {player.name}
                      </p>
                      <p className="text-xs text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] mt-0.5 truncate">
                        {player.reason}
                      </p>
                    </div>
                    <CaretRight size={16} className="text-[var(--color-report-text-3)] shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<WarningCircle size={28} weight="duotone" />}
              title="Semua pemain terpantau baik"
              description="Belum ada pemain dengan absen berulang atau kehadiran rendah minggu ini."
              theme="report"
              className="py-8"
            />
          )}
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.18 }}
          className={cn(cardClass, 'md:col-span-1 md:row-start-2')}
        >
          <h2 className="text-sm font-semibold text-[var(--color-report-text)] font-[family-name:var(--font-ui)] mb-4">
            Distribusi drill bulan ini
          </h2>

          {drillDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={drillDistribution.length * 36 + 8}>
              <BarChart
                data={drillDistribution}
                layout="vertical"
                margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
                barCategoryGap="20%"
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  width={100}
                  tick={({ x, y, payload }) => (
                    <text
                      x={x}
                      y={y}
                      dy={4}
                      textAnchor="end"
                      className={cn(
                        'text-xs font-[family-name:var(--font-ui)]',
                        lowCategories.has(payload.value)
                          ? 'fill-[var(--color-report-text-3)]'
                          : 'fill-[var(--color-report-text-2)]',
                      )}
                    >
                      {payload.value}
                    </text>
                  )}
                />
                <Tooltip
                  content={<DrillTooltip />}
                  cursor={{ fill: 'var(--color-report-bg)', radius: 4 }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  animationDuration={600}
                  label={({ x, y, width: w, height: h, value }) => {
                    const nx = Number(x ?? 0);
                    const ny = Number(y ?? 0);
                    const nw = Number(w ?? 0);
                    const nh = Number(h ?? 0);
                    return (
                      <text
                        x={nx + nw + 8}
                        y={ny + nh / 2}
                        dy={4}
                        className="text-xs font-medium font-[family-name:var(--font-display)] tabular-nums fill-[var(--color-report-text-2)]"
                      >
                        {value}
                      </text>
                    );
                  }}
                >
                  {drillDistribution.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={
                        lowCategories.has(entry.category)
                          ? 'var(--color-report-border)'
                          : 'var(--color-chart-2)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={<Barbell size={28} weight="duotone" />}
              title="Belum ada drill tercatat"
              description="Distribusi kategori drill akan muncul setelah sesi latihan dijalankan bulan ini."
              theme="report"
              className="py-8"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
