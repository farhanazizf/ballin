'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  CalendarBlank,
  CalendarDots,
  CaretRight,
  MapPin,
  Plus,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { sessionTypeLabel } from '@/lib/benchmark/battery';
import {
  formatSessionTime,
  groupSessionsByDate,
  type SessionListItem,
  type TeamOption,
} from '@/lib/queries/sessions';
import { useTranslations } from '@/lib/i18n/use-translations';
import { StaggerList, StaggerRow } from '@/components/motion/stagger-list';
import type { Locale } from '@/lib/i18n/types';

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

function statusBadgeClass(status: SessionListItem['status']) {
  if (status === 'active') {
    return 'bg-[var(--color-made)]/10 text-[var(--color-made)]';
  }
  if (status === 'scheduled') {
    return 'bg-[var(--color-leather-tint)] text-[var(--color-leather)]';
  }
  if (status === 'cancelled') {
    return 'bg-[var(--color-miss)]/10 text-[var(--color-miss)]';
  }
  return 'bg-[var(--color-report-bg)] text-[var(--color-report-text-2)] border border-[var(--color-report-border)]';
}

function sessionStatusLabel(status: SessionListItem['status'], labels: ReturnType<typeof useTranslations>['t']['sessions']['status']) {
  return labels[status];
}

function formatDateGroupLabel(dateKey: string, locale: Locale): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
}

export function SessionsClient({
  sessions,
  teams,
}: {
  sessions: SessionListItem[];
  teams: TeamOption[];
}) {
  const router = useRouter();
  const { locale, t } = useTranslations();
  const s = t.sessions;
  const groups = useMemo(() => groupSessionsByDate(sessions), [sessions]);
  const [showForm, setShowForm] = useState(false);
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('16:00');
  const [location, setLocation] = useState('');
  const [sessionType, setSessionType] = useState<'training' | 'benchmark'>('training');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recurring, setRecurring] = useState(false);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([2, 4]);
  const [horizonWeeks, setHorizonWeeks] = useState(8);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const DAY_OPTIONS = [
    { value: 1, label: s.days.mon },
    { value: 2, label: s.days.tue },
    { value: 3, label: s.days.wed },
    { value: 4, label: s.days.thu },
    { value: 5, label: s.days.fri },
    { value: 6, label: s.days.sat },
    { value: 7, label: s.days.sun },
  ] as const;

  function toggleDay(day: number) {
    setDaysOfWeek((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort((a, b) => a - b),
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId || !date) {
      setError(s.selectTeamAndDate);
      return;
    }

    setSubmitting(true);
    setError(null);

    if (recurring) {
      if (daysOfWeek.length === 0) {
        setError(s.selectRecurringDays);
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/session-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          teamId,
          daysOfWeek,
          startTime,
          horizonWeeks,
          location: location.trim() || undefined,
          sessionType,
        }),
      });

      const body = (await res.json()) as { sessionCount?: number; error?: string };
      setSubmitting(false);

      if (!res.ok) {
        setError(body.error ?? s.recurringFailed);
        return;
      }

      setShowForm(false);
      router.refresh();
      return;
    }

    const scheduledStart = new Date(`${date}T${startTime}:00+07:00`).toISOString();

    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        teamId,
        scheduledStart,
        location: location.trim() || undefined,
        sessionType,
      }),
    });

    const body = (await res.json()) as { id?: string; error?: string };
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error ?? s.createFailed);
      return;
    }

    setShowForm(false);
    router.refresh();
  }

  async function handleCancel(sessionId: string) {
    if (!cancelReason.trim()) {
      setError(s.cancelReasonRequired);
      return;
    }
    setCancelling(true);
    setError(null);
    const res = await fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'cancel', cancelReason: cancelReason.trim() }),
    });
    const body = (await res.json()) as { error?: string };
    setCancelling(false);
    if (!res.ok) {
      setError(body.error ?? s.cancelFailed);
      return;
    }
    setCancelTarget(null);
    setCancelReason('');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 border-b-2 border-[var(--color-report-border)] pb-5">
        <div>
          <p className="brut-label text-[var(--color-hazard)]">{s.badge}</p>
          <h1 className="brut-heading mt-2 text-2xl md:text-3xl text-[var(--color-report-text)]">
            {s.title}
          </h1>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-report-text-3)]">
            {sessions.length > 0
              ? s.subtitleCount.replace('{count}', String(sessions.length))
              : s.subtitleEmpty}
          </p>
        </div>
        <Button
          variant="report-primary"
          size="sm"
          onClick={() => setShowForm((value) => !value)}
          className="shrink-0"
        >
          <Plus size={16} weight="bold" />
          {s.createSession}
        </Button>
      </header>

      {showForm ? (
        <motion.form
          {...fadeUp}
          onSubmit={handleCreate}
          className={cn(
            'border-2 border-[var(--color-report-border)]',
            'bg-[var(--color-report-surface)] p-5 space-y-4',
          )}
        >
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-report-text)]">
            &gt;&gt;&gt; Sesi latihan baru
          </h2>
          {error ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-hazard)]">
              /// {error}
            </p>
          ) : null}
          <label className="flex flex-col gap-2">
            <span className="brut-label text-[var(--color-report-text-3)]">{s.sessionType}</span>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as 'training' | 'benchmark')}
              className="h-12 w-full border-2 border-[var(--color-report-border)] bg-[var(--color-report-bg)] px-4 font-mono text-sm"
            >
              <option value="training">{sessionTypeLabel('training')}</option>
              <option value="benchmark">{sessionTypeLabel('benchmark')}</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="brut-label text-[var(--color-report-text-3)]">
              {s.team}
            </span>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="h-12 w-full border-2 border-[var(--color-report-border)] bg-[var(--color-report-bg)] px-4 font-mono text-sm text-[var(--color-report-text)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-hazard)]"
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-2">
              <span className="brut-label text-[var(--color-report-text-3)]">
                {s.date}
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 w-full border-2 border-[var(--color-report-border)] bg-[var(--color-report-bg)] px-4 font-mono text-sm text-[var(--color-report-text)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-hazard)]"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="brut-label text-[var(--color-report-text-3)]">
                {s.startTime}
              </span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-12 w-full border-2 border-[var(--color-report-border)] bg-[var(--color-report-bg)] px-4 font-mono text-sm text-[var(--color-report-text)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-hazard)]"
              />
            </label>
          </div>
          <label className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-report-text-2)]">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-hazard)]"
            />
            {s.recurringWeekly}
          </label>
          {recurring ? (
            <div className="space-y-3 border border-[var(--color-report-border)] p-3">
              <p className="brut-label text-[var(--color-report-text-3)]">{s.practiceDays}</p>
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      'px-3 py-2 font-mono text-[10px] uppercase border-2',
                      daysOfWeek.includes(day.value)
                        ? 'border-[var(--color-hazard)] bg-[var(--color-hazard)] text-[var(--color-phosphor)]'
                        : 'border-[var(--color-report-border)] text-[var(--color-report-text-2)]',
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <label className="flex flex-col gap-2">
                <span className="brut-label text-[var(--color-report-text-3)]">
                  {s.weeksAhead}
                </span>
                <input
                  type="number"
                  min={1}
                  max={26}
                  value={horizonWeeks}
                  onChange={(e) => setHorizonWeeks(Number(e.target.value) || 8)}
                  className="h-12 w-full border-2 border-[var(--color-report-border)] bg-[var(--color-report-bg)] px-4 font-mono text-sm"
                />
              </label>
            </div>
          ) : null}
          <label className="flex flex-col gap-2">
            <span className="brut-label text-[var(--color-report-text-3)]">
              {s.location}
            </span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={s.locationPlaceholder}
              className="h-12 w-full border-2 border-[var(--color-report-border)] bg-[var(--color-report-bg)] px-4 font-mono text-sm text-[var(--color-report-text)] placeholder:text-[var(--color-report-text-3)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-hazard)]"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="report-primary" disabled={submitting}>
              {submitting ? t.common.saving : recurring ? s.createRecurring : s.saveSession}
            </Button>
            <Button type="button" variant="report-ghost" onClick={() => setShowForm(false)}>
              {t.common.cancel}
            </Button>
            <Link
              href="/sessions/new"
              className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] self-center hover:text-[var(--color-report-text-2)]"
            >
              {s.fullForm}
            </Link>
          </div>
        </motion.form>
      ) : null}

      {sessions.length === 0 ? (
        <EmptyState
          icon={<CalendarBlank size={28} weight="duotone" />}
          title={s.emptyTitle}
          description="{s.createSession} pertama untuk mulai mencatat absensi dan drill di lapangan."
          theme="report"
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group, groupIndex) => (
            <motion.section
              key={group.dateKey}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: groupIndex * 0.05 }}
            >
              <h2 className="brut-label text-[var(--color-report-text-3)] mb-3">
                {formatDateGroupLabel(group.dateKey, locale)}
              </h2>
              <StaggerList className="divide-y divide-[var(--color-report-border)] border-2 border-[var(--color-report-border)] bg-[var(--color-report-surface)] overflow-hidden">
                {group.sessions.map((session) => {
                  const isActive = session.status === 'active';
                  const rowContent = (
                    <>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--color-report-border)] bg-[var(--color-report-bg)]">
                        <CalendarDots
                          size={20}
                          weight="duotone"
                          className={
                            isActive
                              ? 'text-[var(--color-made)]'
                              : 'text-[var(--color-report-text-3)]'
                          }
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-[family-name:var(--font-display)] font-semibold text-sm text-[var(--color-report-text)]">
                            {session.teamName}{session.sessionType === 'benchmark' ? ' · Benchmark' : ''}
                          </span>
                          <span
                            className={cn(
                              'text-[11px] px-2 py-0.5 rounded-[var(--radius-chip)] font-[family-name:var(--font-ui)] font-medium',
                              statusBadgeClass(session.status),
                            )}
                          >
                            {sessionStatusLabel(session.status, s.status)}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] mt-0.5 tabular-nums">
                          {formatSessionTime(session.scheduledStart)}
                          {session.scheduledEnd
                            ? ` – ${formatSessionTime(session.scheduledEnd)}`
                            : ''}
                        </p>
                        {session.location ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <MapPin
                              size={14}
                              className="text-[var(--color-report-text-3)] shrink-0"
                            />
                            <span className="text-xs text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] truncate">
                              {session.location}
                            </span>
                          </div>
                        ) : null}
                      </div>
                      {isActive ? (
                        <CaretRight
                          size={16}
                          className="text-[var(--color-leather)] shrink-0"
                        />
                      ) : null}
                    </>
                  );

                  if (isActive) {
                    return (
                      <StaggerRow key={session.id}>
                        <Link
                          href={`/session/${session.id}/attendance`}
                          className={cn(
                            'flex items-center gap-3 px-4 py-4',
                            'hover:bg-[var(--color-report-bg)] transition-colors',
                            'active:scale-[0.995] active:transition-transform',
                          )}
                        >
                          {rowContent}
                        </Link>
                      </StaggerRow>
                    );
                  }

                  const canCancel = session.status === 'scheduled';

                  return (
                    <StaggerRow key={session.id} className="px-4 py-4">
                      <div className="flex items-center gap-3">{rowContent}</div>
                      {canCancel && (
                        <div className="mt-3 pl-[3.25rem]">
                          {cancelTarget === session.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder={s.cancelReasonPlaceholder}
                                className="h-10 w-full border border-[var(--color-report-border)] bg-[var(--color-report-bg)] px-3 font-mono text-xs"
                              />
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="report-secondary"
                                  size="sm"
                                  disabled={cancelling}
                                  onClick={() => void handleCancel(session.id)}
                                >
                                  {t.common.cancel}kan sesi
                                </Button>
                                <Button
                                  type="button"
                                  variant="report-ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCancelTarget(null);
                                    setCancelReason('');
                                  }}
                                >
                                  {t.common.cancel}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCancelTarget(session.id)}
                              className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-report-text-3)] hover:text-[var(--color-hazard)]"
                            >
                              {t.common.cancel}kan sesi ini
                            </button>
                          )}
                        </div>
                      )}
                    </StaggerRow>
                  );
                })}
              </StaggerList>
            </motion.section>
          ))}
        </div>
      )}
    </div>
  );
}
