'use client';

import { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
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
  Basketball,
} from '@phosphor-icons/react';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n/use-translations';
import type { PlayerMessages } from '@/lib/i18n/messages';
import type {
  PersonalBest,
  PlayerBadge,
  PlayerCardData,
  RecentDrillStat,
} from '@/lib/queries/player-card';

export type PlayerCardClientProps = {
  card: PlayerCardData;
  streak: number;
  recentSessions: boolean[];
  radarData: Array<{ attr: string; current: number; previous: number }>;
  recentDrills: RecentDrillStat[];
  personalBests: PersonalBest[];
  badges: PlayerBadge[];
};

const archetypeIcons: Record<string, typeof Lightning> = {
  Slasher: Lightning,
  Shooter: Crosshair,
  Playmaker: HandFist,
  'Rim Protector': ShieldCheck,
  Motor: Heartbeat,
  'Glue Guy': Star,
};

function getTrend(
  current: number,
  previous: number,
  trendLabels: PlayerMessages['card']['trend'],
  lowerIsBetter = false,
) {
  const diff = lowerIsBetter ? previous - current : current - previous;
  if (Math.abs(diff) < 0.01) return { direction: 'same' as const, label: trendLabels.same };
  if (diff > 0) return { direction: 'up' as const, label: trendLabels.up };
  return { direction: 'down' as const, label: trendLabels.down };
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

function HeroSection({
  card,
  index,
  ageYearsLabel,
}: {
  card: PlayerCardData;
  index: number;
  ageYearsLabel: (age: number) => string;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const ArchIcon = card.archetype ? archetypeIcons[card.archetype] ?? Lightning : null;
  const jerseyLabel = card.jerseyNumber != null ? `#${card.jerseyNumber}` : '';
  const metaParts = [jerseyLabel, card.className, card.age != null ? ageYearsLabel(card.age) : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <motion.section
      className="relative overflow-hidden px-5 pt-4 pb-8"
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      custom={index}
    >
      {card.jerseyNumber != null && (
        <span
          className={cn(
            'absolute -top-4 -right-3 select-none pointer-events-none',
            'font-[family-name:var(--font-display)] text-[140px] font-bold leading-none',
            'text-[var(--color-field-text)] opacity-[0.04]',
            'tabular-nums',
          )}
          aria-hidden
        >
          {card.jerseyNumber}
        </span>
      )}

      <div className="relative z-10 flex items-center gap-5">
        <div
          className={cn(
            'relative w-[96px] h-[96px] md:w-[120px] md:h-[120px] shrink-0',
            'border-2 border-[var(--color-hazard)]',
            'overflow-hidden bg-[var(--color-field-surface)]',
          )}
        >
          {card.photoUrl ? (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 bg-[var(--color-field-surface)] animate-pulse" />
              )}
              <img
                src={card.photoUrl}
                alt={card.nickname}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-300',
                  imgLoaded ? 'opacity-100' : 'opacity-0',
                )}
                onLoad={() => setImgLoaded(true)}
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-leather)]/10">
              <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-leather)]">
                {card.nickname.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <h1
            className={cn(
              'font-[family-name:var(--font-display)] text-[28px] md:text-[32px] font-bold',
              'text-[var(--color-field-text)] tracking-tight leading-none',
            )}
          >
            {card.nickname}
          </h1>
          {metaParts && (
            <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-field-text-2)]">
              {metaParts}
            </p>
          )}

          {card.archetype && ArchIcon && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 w-fit mt-1',
                'h-7 px-3 rounded-[var(--radius-chip)]',
                'bg-[var(--color-leather)]/15 text-[var(--color-leather)]',
                'font-[family-name:var(--font-ui)] text-xs font-semibold',
              )}
            >
              <ArchIcon size={14} weight="fill" />
              {card.archetype}
            </span>
          )}
        </div>
      </div>
    </motion.section>
  );
}

export function PlayerCardClient({
  card,
  streak,
  recentSessions,
  radarData,
  recentDrills,
  personalBests,
  badges,
}: PlayerCardClientProps) {
  const { t } = useTranslations();
  const cardCopy = t.player.card;

  if (!card.hasAttributes) {
    return (
      <div className="flex flex-col gap-8 pb-12">
        <HeroSection card={card} index={0} ageYearsLabel={(age) => cardCopy.ageYears.replace('{age}', String(age))} />
        <EmptyState
          theme="field"
          icon={<Basketball size={28} weight="duotone" />}
          title={cardCopy.waitingFirstSession.title}
          description={cardCopy.waitingFirstSession.description}
          className="px-5"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <HeroSection card={card} index={0} ageYearsLabel={(age) => cardCopy.ageYears.replace('{age}', String(age))} />

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
                'w-11 h-11 rounded-none border flex items-center justify-center',
                  streak >= 10
                    ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/15 text-[var(--color-gold)]'
                    : 'border-[var(--color-field-border)] bg-[var(--color-field-raised)] text-[var(--color-hazard)]',
              )}
            >
              <FireSimple size={24} weight="fill" />
            </div>
            <div>
              <span
                className={cn(
                  'font-[family-name:var(--font-display)] text-[40px] font-bold leading-none tabular-nums',
                  streak >= 10
                    ? 'text-[var(--color-gold)]'
                    : 'text-[var(--color-field-text)]',
                )}
              >
                {streak}
              </span>
              <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-field-text-3)] mt-0.5">
                {cardCopy.streakLabel}
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {recentSessions.map((attended, i) => (
              <div
                key={i}
                className={cn(
                  'w-2.5 h-2.5 transition-colors',
                  attended
                    ? 'bg-[var(--color-made)]'
                    : 'border border-[var(--color-field-border)] bg-transparent',
                )}
                title={attended ? cardCopy.attended : cardCopy.absent}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {radarData.length > 0 && (
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
            {cardCopy.gameShape}
          </h2>

          <div
            className={cn(
              'p-4 rounded-[var(--radius-card)]',
              'bg-[var(--color-field-surface)] border border-[var(--color-field-border)]',
            )}
          >
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke="var(--color-field-border)" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="attr"
                  tick={{
                    fill: 'var(--color-field-text-3)',
                    fontSize: 11,
                    fontFamily: 'var(--font-ui)',
                  }}
                  tickLine={false}
                />
                <Radar
                  name={cardCopy.before}
                  dataKey="previous"
                  stroke="var(--color-field-text-3)"
                  fill="transparent"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                />
                <Radar
                  name={cardCopy.now}
                  dataKey="current"
                  stroke="var(--color-leather)"
                  fill="var(--color-leather)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={false}
                />
              </RadarChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-center gap-5 -mt-2">
              <span className="flex items-center gap-1.5 text-xs font-[family-name:var(--font-ui)] text-[var(--color-leather)]">
                <span className="w-4 h-0.5 bg-[var(--color-hazard)]" />
                {cardCopy.now}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-[family-name:var(--font-ui)] text-[var(--color-field-text-3)]">
                <span
                  className="w-4 h-0.5 bg-[var(--color-field-text-3)] opacity-60"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, var(--color-field-text-3) 0 3px, transparent 3px 6px)',
                  }}
                />
                {cardCopy.before}
              </span>
            </div>
          </div>
        </motion.section>
      )}

      {recentDrills.length > 0 && (
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
            {cardCopy.recentStats}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {recentDrills.map((drill) => {
              const isAttempt = drill.made != null && drill.attempts != null;
              const current = isAttempt
                ? (drill.made ?? 0) / (drill.attempts || 1)
                : drill.value!;
              const prev = isAttempt
                ? (drill.prevMade ?? drill.made ?? 0) / (drill.prevAttempts || drill.attempts || 1)
                : (drill.prevValue ?? drill.value)!;
              const trend = getTrend(current, prev, cardCopy.trend, !isAttempt && Boolean(drill.lowerIsBetter));

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
      )}

      {personalBests.length > 0 && (
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
            {cardCopy.personalBests}
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
                <Trophy size={16} weight="fill" className="text-[var(--color-gold)] mb-2" />
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
      )}

      {badges.length > 0 && (
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
            {cardCopy.badges}
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
                    'w-9 h-9 rounded-none border flex items-center justify-center shrink-0',
                    badge.earned
                      ? 'border-[var(--color-gold)]/40 bg-[var(--color-gold)]/15 text-[var(--color-gold)]'
                      : 'border-[var(--color-field-border)] bg-[var(--color-field-surface)] text-[var(--color-field-text-3)]',
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
      )}
    </div>
  );
}
