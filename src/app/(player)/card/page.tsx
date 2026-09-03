'use client';

import { useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  FireSimple,
  TrendUp,
  TrendDown,
  Minus,
  Trophy,
  Lock,
  Lightning,
  Crosshair,
  HandFist,
  ShieldCheck,
  Heartbeat,
  Star,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

/* ── Mock data ── */
const player = {
  nickname: 'Rizky',
  fullName: 'Rizky Ramadhan',
  jerseyNumber: 7,
  age: 14,
  className: 'Boys',
  archetype: 'Slasher',
  photoUrl: 'https://picsum.photos/seed/rizky-hoops/240/240',
  streak: 12,
  recentSessions: [true, true, true, true, true, false, true, true],
};

const attributes = {
  current: { shooting: 0.55, finishing: 0.78, ballhandling: 0.62, defense: 0.45, athleticism: 0.71, attitude: 0.80 },
  previous: { shooting: 0.48, finishing: 0.70, ballhandling: 0.55, defense: 0.42, athleticism: 0.65, attitude: 0.75 },
};

const radarData = [
  { attr: 'Shooting', current: attributes.current.shooting, previous: attributes.previous.shooting },
  { attr: 'Finishing', current: attributes.current.finishing, previous: attributes.previous.finishing },
  { attr: 'Ballhandling', current: attributes.current.ballhandling, previous: attributes.previous.ballhandling },
  { attr: 'Defense', current: attributes.current.defense, previous: attributes.previous.defense },
  { attr: 'Athleticism', current: attributes.current.athleticism, previous: attributes.previous.athleticism },
  { attr: 'Attitude', current: attributes.current.attitude, previous: attributes.previous.attitude },
];

const recentDrills = [
  { name: 'Free throw', made: 8, attempts: 10, prevMade: 6, prevAttempts: 10 },
  { name: 'Layup kanan', made: 9, attempts: 10, prevMade: 8, prevAttempts: 10 },
  { name: 'Layup kiri', made: 5, attempts: 10, prevMade: 3, prevAttempts: 10 },
  { name: 'Dribble zigzag', value: 12.3, unit: 'detik', prevValue: 13.1, lowerIsBetter: true },
  { name: 'Sprint 3/4', value: 4.8, unit: 'detik', prevValue: 5.1, lowerIsBetter: true },
  { name: 'Passing akurasi', made: 7, attempts: 10, prevMade: 7, prevAttempts: 10 },
];

const personalBests = [
  { drill: 'Free throw', score: '9/10', date: '12 Agu 2026' },
  { drill: 'Sprint 3/4', score: '4.5 dtk', date: '28 Agu 2026' },
  { drill: 'Layup kanan', score: '10/10', date: '1 Sep 2026' },
];

const badges = [
  { code: 'streak_5', name: 'Hadir 5x beruntun', earned: true, earnedAt: '15 Jul 2026' },
  { code: 'streak_15', name: 'Hadir 15x beruntun', earned: false },
  { code: 'reps_500', name: 'Kerja keras', earned: true, earnedAt: '20 Agu 2026' },
  { code: 'pb_first', name: 'Rekor pertama', earned: true, earnedAt: '10 Jul 2026' },
  { code: 'pb_10', name: 'Pemecah rekor', earned: false },
  { code: 'ft_1000', name: 'Seribu free throw', earned: false },
  { code: 'lefty', name: 'Tangan kedua', earned: false },
  { code: 'sessions_50', name: '50 latihan', earned: false },
];

const archetypeIcons: Record<string, typeof Lightning> = {
  Slasher: Lightning,
  Shooter: Crosshair,
  Playmaker: HandFist,
  'Rim Protector': ShieldCheck,
  Motor: Heartbeat,
  'Glue Guy': Star,
};

/* ── Trend helper ── */
function getTrend(current: number, previous: number, lowerIsBetter = false) {
  const diff = lowerIsBetter ? previous - current : current - previous;
  if (Math.abs(diff) < 0.01) return { direction: 'same' as const, label: 'Sama' };
  if (diff > 0) return { direction: 'up' as const, label: 'Naik' };
  return { direction: 'down' as const, label: 'Turun' };
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

/* ── Page ── */
export default function PlayerCardPage() {
  const [imgLoaded, setImgLoaded] = useState(false);
  const ArchIcon = archetypeIcons[player.archetype] || Lightning;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* ─── Hero ─── */}
      <motion.section
        className="relative overflow-hidden px-5 pt-4 pb-8"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
      >
        {/* Ghost jersey number */}
        <span
          className={cn(
            'absolute -top-4 -right-3 select-none pointer-events-none',
            'font-[family-name:var(--font-display)] text-[140px] font-bold leading-none',
            'text-[var(--color-field-text)] opacity-[0.04]',
            'tabular-nums',
          )}
          aria-hidden
        >
          {player.jerseyNumber}
        </span>

        <div className="relative z-10 flex items-center gap-5">
          {/* Photo */}
          <div
            className={cn(
              'relative w-[96px] h-[96px] md:w-[120px] md:h-[120px] shrink-0',
              'rounded-full',
              'ring-[3px] ring-[var(--color-leather)]/60 ring-offset-2 ring-offset-[var(--color-field-bg)]',
              'overflow-hidden bg-[var(--color-field-surface)]',
            )}
          >
            {!imgLoaded && (
              <div className="absolute inset-0 bg-[var(--color-field-surface)] animate-pulse" />
            )}
            <img
              src={player.photoUrl}
              alt={player.nickname}
              className={cn(
                'w-full h-full object-cover transition-opacity duration-300',
                imgLoaded ? 'opacity-100' : 'opacity-0',
              )}
              onLoad={() => setImgLoaded(true)}
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <h1
              className={cn(
                'font-[family-name:var(--font-display)] text-[28px] md:text-[32px] font-bold',
                'text-[var(--color-field-text)] tracking-tight leading-none',
              )}
            >
              {player.nickname}
            </h1>
            <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-field-text-2)]">
              #{player.jerseyNumber} · {player.className} · {player.age} tahun
            </p>

            {/* Archetype chip */}
            <span
              className={cn(
                'inline-flex items-center gap-1.5 w-fit mt-1',
                'h-7 px-3 rounded-[var(--radius-chip)]',
                'bg-[var(--color-leather)]/15 text-[var(--color-leather)]',
                'font-[family-name:var(--font-ui)] text-xs font-semibold',
              )}
            >
              <ArchIcon size={14} weight="fill" />
              {player.archetype}
            </span>
          </div>
        </div>
      </motion.section>

      {/* ─── Streak ─── */}
      <motion.section
        className="px-5"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
      >
        <div
          className={cn(
            'flex items-center gap-5 p-5 rounded-[var(--radius-card)]',
            'bg-[var(--color-field-surface)] border border-[var(--color-field-border)]',
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center',
                player.streak >= 10
                  ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]'
                  : 'bg-[var(--color-leather)]/10 text-[var(--color-leather)]',
              )}
            >
              <FireSimple size={24} weight="fill" />
            </div>
            <div>
              <span
                className={cn(
                  'font-[family-name:var(--font-display)] text-[40px] font-bold leading-none tabular-nums',
                  player.streak >= 10
                    ? 'text-[var(--color-gold)]'
                    : 'text-[var(--color-field-text)]',
                )}
              >
                {player.streak}
              </span>
              <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-field-text-3)] mt-0.5">
                latihan beruntun
              </p>
            </div>
          </div>

          {/* Session dots */}
          <div className="ml-auto flex items-center gap-1.5">
            {player.recentSessions.map((attended, i) => (
              <div
                key={i}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-colors',
                  attended
                    ? 'bg-[var(--color-made)]'
                    : 'border-2 border-[var(--color-field-border)] bg-transparent',
                )}
                title={attended ? 'Hadir' : 'Tidak hadir'}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── Radar / Shape ─── */}
      <motion.section
        className="px-5"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={2}
      >
        <h2
          className={cn(
            'font-[family-name:var(--font-ui)] text-base font-semibold mb-4',
            'text-[var(--color-field-text-2)]',
          )}
        >
          Bentuk permainan
        </h2>

        <div
          className={cn(
            'p-4 rounded-[var(--radius-card)]',
            'bg-[var(--color-field-surface)] border border-[var(--color-field-border)]',
          )}
        >
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
              <PolarGrid
                stroke="var(--color-field-border)"
                strokeDasharray="3 3"
              />
              <PolarAngleAxis
                dataKey="attr"
                tick={{
                  fill: 'var(--color-field-text-3)',
                  fontSize: 11,
                  fontFamily: 'var(--font-ui)',
                }}
                tickLine={false}
              />
              {/* Previous period — dashed outline */}
              <Radar
                name="Sebelumnya"
                dataKey="previous"
                stroke="var(--color-field-text-3)"
                fill="transparent"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
              />
              {/* Current period — filled */}
              <Radar
                name="Sekarang"
                dataKey="current"
                stroke="var(--color-leather)"
                fill="var(--color-leather)"
                fillOpacity={0.15}
                strokeWidth={2}
                dot={false}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 -mt-2">
            <span className="flex items-center gap-1.5 text-xs font-[family-name:var(--font-ui)] text-[var(--color-leather)]">
              <span className="w-4 h-0.5 bg-[var(--color-leather)] rounded-full" />
              Sekarang
            </span>
            <span className="flex items-center gap-1.5 text-xs font-[family-name:var(--font-ui)] text-[var(--color-field-text-3)]">
              <span className="w-4 h-0.5 bg-[var(--color-field-text-3)] rounded-full opacity-60"
                style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--color-field-text-3) 0 3px, transparent 3px 6px)' }}
              />
              Sebelumnya
            </span>
          </div>
        </div>
      </motion.section>

      {/* ─── Recent Stats ─── */}
      <motion.section
        className="px-5"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={3}
      >
        <h2
          className={cn(
            'font-[family-name:var(--font-ui)] text-base font-semibold mb-4',
            'text-[var(--color-field-text-2)]',
          )}
        >
          Statistik terbaru
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {recentDrills.map((drill) => {
            const isAttempt = 'made' in drill;
            const current = isAttempt ? (drill.made ?? 0) / (drill.attempts ?? 1) : drill.value!;
            const prev = isAttempt
              ? (drill.prevMade ?? 0) / (drill.prevAttempts ?? 1)
              : drill.prevValue!;
            const trend = getTrend(current, prev, !isAttempt && drill.lowerIsBetter);

            return (
              <div
                key={drill.name}
                className={cn(
                  'p-3.5 rounded-[var(--radius-card)]',
                  'bg-[var(--color-field-surface)] border border-[var(--color-field-border)]',
                )}
              >
                <p className="font-[family-name:var(--font-ui)] text-xs text-[var(--color-field-text-3)] mb-1.5 truncate">
                  {drill.name}
                </p>
                <div className="flex items-end justify-between">
                  <span
                    className={cn(
                      'font-[family-name:var(--font-display)] text-[24px] font-bold',
                      'text-[var(--color-field-text)] tabular-nums leading-none',
                    )}
                  >
                    {isAttempt ? `${drill.made}/${drill.attempts}` : `${drill.value}`}
                  </span>
                  <span
                    className={cn(
                      'flex items-center gap-0.5 text-xs font-medium font-[family-name:var(--font-ui)]',
                      trend.direction === 'up' && 'text-[var(--color-made)]',
                      trend.direction === 'down' && 'text-[var(--color-miss)]',
                      trend.direction === 'same' && 'text-[var(--color-field-text-3)]',
                    )}
                  >
                    {trend.direction === 'up' && <TrendUp size={14} weight="bold" />}
                    {trend.direction === 'down' && <TrendDown size={14} weight="bold" />}
                    {trend.direction === 'same' && <Minus size={14} weight="bold" />}
                  </span>
                </div>
                {!isAttempt && drill.unit && (
                  <p className="font-[family-name:var(--font-ui)] text-[10px] text-[var(--color-field-text-3)] mt-0.5">
                    {drill.unit}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── Personal Bests ─── */}
      <motion.section
        className="px-5"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={4}
      >
        <h2
          className={cn(
            'font-[family-name:var(--font-ui)] text-base font-semibold mb-4',
            'text-[var(--color-field-text-2)]',
          )}
        >
          Rekor pribadi
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {personalBests.map((pb) => (
            <div
              key={pb.drill}
              className={cn(
                'shrink-0 px-4 py-3 rounded-[var(--radius-card)]',
                'bg-[var(--color-field-surface)] border border-[var(--color-gold)]/20',
                'min-w-[140px]',
              )}
            >
              <Trophy
                size={16}
                weight="fill"
                className="text-[var(--color-gold)] mb-2"
              />
              <p className="font-[family-name:var(--font-ui)] text-xs text-[var(--color-field-text-3)] truncate">
                {pb.drill}
              </p>
              <p
                className={cn(
                  'font-[family-name:var(--font-display)] text-lg font-bold',
                  'text-[var(--color-gold)] tabular-nums leading-tight mt-0.5',
                )}
              >
                {pb.score}
              </p>
              <p className="font-[family-name:var(--font-ui)] text-[10px] text-[var(--color-field-text-3)] mt-1">
                {pb.date}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ─── Badges ─── */}
      <motion.section
        className="px-5"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={5}
      >
        <h2
          className={cn(
            'font-[family-name:var(--font-ui)] text-base font-semibold mb-4',
            'text-[var(--color-field-text-2)]',
          )}
        >
          Lencana
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.code}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-[var(--radius-card)]',
                'border transition-colors',
                badge.earned
                  ? 'bg-[var(--color-field-surface)] border-[var(--color-gold)]/20'
                  : 'bg-[var(--color-field-bg)] border-[var(--color-field-border)]/50 opacity-50',
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  badge.earned
                    ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]'
                    : 'bg-[var(--color-field-surface)] text-[var(--color-field-text-3)]',
                )}
              >
                {badge.earned ? (
                  <Star size={18} weight="fill" />
                ) : (
                  <Lock size={18} weight="regular" />
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    'font-[family-name:var(--font-ui)] text-sm font-medium truncate',
                    badge.earned
                      ? 'text-[var(--color-field-text)]'
                      : 'text-[var(--color-field-text-3)]',
                  )}
                >
                  {badge.name}
                </p>
                {badge.earned && badge.earnedAt && (
                  <p className="font-[family-name:var(--font-ui)] text-[10px] text-[var(--color-field-text-3)] mt-0.5">
                    {badge.earnedAt}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
