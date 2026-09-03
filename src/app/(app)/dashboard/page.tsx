'use client';

import { useMemo } from 'react';
import {
  CalendarDots,
  MapPin,
  ArrowUp,
  CaretRight,
  WarningCircle,
  Barbell,
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

/* ───────────────────── Mock data ───────────────────── */

const SESSION = {
  date: new Date(2026, 8, 3, 16, 0),
  endTime: new Date(2026, 8, 3, 18, 0),
  location: 'Wonderland Basketball Arena',
  status: 'upcoming' as const,
  className: 'Boys',
};

const ATTENDANCE = {
  present: 24,
  total: 28,
  pct: 86,
  trend: 4,
  weekly: [
    { week: 'W1', value: 78 },
    { week: 'W2', value: 82 },
    { week: 'W3', value: 81 },
    { week: 'W4', value: 86 },
  ],
};

const ATTENTION_PLAYERS = [
  { name: 'Fadhil', reason: 'Tidak hadir 3 latihan berturut-turut' },
  { name: 'Alya', reason: 'Performa shooting turun 3 periode' },
  { name: 'Bagas', reason: 'Belum hadir sejak 20 Agustus' },
];

const DRILL_DISTRIBUTION = [
  { category: 'Shooting', count: 12 },
  { category: 'Ballhandling', count: 10 },
  { category: 'Finishing', count: 8 },
  { category: 'Defense', count: 4 },
  { category: 'Athleticism', count: 3 },
  { category: 'Conditioning', count: 2 },
];

const LOW_CATEGORIES = new Set(['Defense', 'Athleticism', 'Conditioning']);

/* ───────────────────── Helpers ───────────────────── */

function formatIndonesianDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/* ───────────────────── Shared styles ───────────────────── */

const cardClass = cn(
  'bg-[var(--color-report-surface)]',
  'border border-[var(--color-report-border)]',
  'rounded-[var(--radius-panel)]',
  'p-5 md:p-6',
);

/* ───────────────────── Subtle entrance animation ───────────────────── */

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

/* ───────────────────── Custom tooltip ───────────────────── */

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

/* ═══════════════════════════════════════════════════════
   Dashboard Page
   ═══════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const today = useMemo(() => new Date(), []);
  const todayFormatted = useMemo(() => formatIndonesianDate(today), [today]);

  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8">
      {/* ─── Header ─── */}
      <header className="mb-6 md:mb-8">
        <p className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)]">
          Dynasty Basketball Academy
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-report-text)] font-[family-name:var(--font-display)] mt-0.5">
          Boys
        </h1>
        <p className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] mt-1">
          {todayFormatted}
        </p>
      </header>

      {/* ─── Bento grid ─── */}
      <div
        className={cn(
          'grid gap-4 md:gap-5',
          'grid-cols-1',
          'md:grid-cols-[2fr_1fr]',
          'md:grid-rows-[auto_auto]',
        )}
      >
        {/* Panel 1 — Latihan hari ini */}
        <motion.div {...fadeUp} className={cn(cardClass, 'md:col-span-1')}>
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-leather-tint)]">
              <CalendarDots size={20} weight="duotone" className="text-[var(--color-leather)]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-[var(--color-report-text)] font-[family-name:var(--font-display)]">
                Latihan hari ini
              </h2>
              <p className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] mt-0.5">
                {formatIndonesianDate(SESSION.date)} · {formatTime(SESSION.date)} – {formatTime(SESSION.endTime)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <MapPin size={16} weight="regular" className="text-[var(--color-report-text-3)] shrink-0" />
            <span className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)]">
              {SESSION.location}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 mb-5">
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-[var(--radius-chip)]',
                'text-xs font-medium font-[family-name:var(--font-ui)]',
                'bg-[var(--color-report-bg)] text-[var(--color-report-text-2)]',
                'border border-[var(--color-report-border)]',
              )}
            >
              Belum dimulai
            </span>
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-[var(--radius-chip)]',
                'text-xs font-medium font-[family-name:var(--font-ui)]',
                'bg-[var(--color-leather-tint)] text-[var(--color-leather)]',
              )}
            >
              {SESSION.className}
            </span>
          </div>

          <button
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
              'cursor-pointer',
            )}
          >
            <Barbell size={18} weight="bold" />
            Mulai latihan
          </button>
        </motion.div>

        {/* Panel 2 — Absen minggu ini */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.06 }}
          className={cn(cardClass, 'md:col-span-1 flex flex-col')}
        >
          <h2 className="text-sm font-semibold text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] mb-3">
            Absen minggu ini
          </h2>

          <div className="flex items-baseline gap-1.5">
            <span className="text-[40px] leading-none font-semibold font-[family-name:var(--font-display)] tabular-nums text-[var(--color-report-text)]">
              {ATTENDANCE.present}
            </span>
            <span className="text-lg text-[var(--color-report-text-3)] font-[family-name:var(--font-display)] tabular-nums">
              / {ATTENDANCE.total}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] tabular-nums">
              {ATTENDANCE.pct}%
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-[var(--color-made)] font-[family-name:var(--font-ui)]">
              <ArrowUp size={12} weight="bold" />
              {ATTENDANCE.trend}% dari minggu lalu
            </span>
          </div>

          <div className="mt-auto pt-4">
            <ResponsiveContainer width="100%" height={60}>
              <BarChart data={ATTENDANCE.weekly} barCategoryGap="25%">
                <Bar
                  dataKey="value"
                  fill="var(--color-chart-2)"
                  radius={[3, 3, 0, 0]}
                  animationDuration={600}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Panel 3 — Perlu perhatian */}
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

          <ul className="divide-y divide-[var(--color-report-border)]">
            {ATTENTION_PLAYERS.map((player) => (
              <li key={player.name}>
                <button
                  className={cn(
                    'w-full flex items-center gap-3 py-3',
                    'text-left transition-colors duration-100',
                    'hover:bg-[var(--color-report-bg)] -mx-2 px-2 rounded-[var(--radius-panel)]',
                    'cursor-pointer',
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
                </button>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Panel 4 — Distribusi drill bulan ini */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.18 }}
          className={cn(cardClass, 'md:col-span-1 md:row-start-2')}
        >
          <h2 className="text-sm font-semibold text-[var(--color-report-text)] font-[family-name:var(--font-ui)] mb-4">
            Distribusi drill bulan ini
          </h2>

          <ResponsiveContainer width="100%" height={DRILL_DISTRIBUTION.length * 36 + 8}>
            <BarChart
              data={DRILL_DISTRIBUTION}
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
                      LOW_CATEGORIES.has(payload.value)
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
                {DRILL_DISTRIBUTION.map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={
                      LOW_CATEGORIES.has(entry.category)
                        ? 'var(--color-report-border)'
                        : 'var(--color-chart-2)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
