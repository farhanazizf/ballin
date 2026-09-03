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
import {
  formatSessionTime,
  groupSessionsByDate,
  sessionStatusLabel,
  type SessionListItem,
  type TeamOption,
} from '@/lib/queries/sessions';

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

export function SessionsClient({
  sessions,
  teams,
}: {
  sessions: SessionListItem[];
  teams: TeamOption[];
}) {
  const router = useRouter();
  const groups = useMemo(() => groupSessionsByDate(sessions), [sessions]);
  const [showForm, setShowForm] = useState(false);
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('16:00');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId || !date) {
      setError('Pilih kelas dan tanggal terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const scheduledStart = new Date(`${date}T${startTime}:00+07:00`).toISOString();

    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        teamId,
        scheduledStart,
        location: location.trim() || undefined,
        sessionType: 'training',
      }),
    });

    const body = (await res.json()) as { id?: string; error?: string };
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error ?? 'Gagal membuat sesi. Coba lagi dalam beberapa saat.');
      return;
    }

    setShowForm(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-report-text)]">
            Latihan
          </h1>
          <p className="mt-1 text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)]">
            {sessions.length > 0
              ? `${sessions.length} sesi tercatat`
              : 'Kelola jadwal latihan tim Anda'}
          </p>
        </div>
        <Button
          variant="report-primary"
          size="sm"
          onClick={() => setShowForm((value) => !value)}
          className="shrink-0"
        >
          <Plus size={16} weight="bold" />
          Buat sesi
        </Button>
      </header>

      {showForm ? (
        <motion.form
          {...fadeUp}
          onSubmit={handleCreate}
          className={cn(
            'rounded-[var(--radius-panel)] border border-[var(--color-report-border)]',
            'bg-[var(--color-report-surface)] p-5 space-y-4',
          )}
        >
          <h2 className="font-[family-name:var(--font-ui)] font-semibold text-[var(--color-report-text)]">
            Sesi latihan baru
          </h2>
          {error ? (
            <p className="text-sm text-[var(--color-miss)] font-[family-name:var(--font-ui)]">
              {error}
            </p>
          ) : null}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)]">
              Kelas
            </span>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="h-12 w-full px-4 rounded-[var(--radius-button)] border border-[var(--color-report-border)] bg-[var(--color-report-surface)] font-[family-name:var(--font-ui)] text-[var(--color-report-text)]"
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)]">
                Tanggal
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 w-full px-4 rounded-[var(--radius-button)] border border-[var(--color-report-border)] bg-[var(--color-report-surface)] font-[family-name:var(--font-ui)] text-[var(--color-report-text)]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)]">
                Waktu mulai
              </span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-12 w-full px-4 rounded-[var(--radius-button)] border border-[var(--color-report-border)] bg-[var(--color-report-surface)] font-[family-name:var(--font-ui)] text-[var(--color-report-text)]"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)]">
              Lokasi
            </span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: GOR Dynasty"
              className="h-12 w-full px-4 rounded-[var(--radius-button)] border border-[var(--color-report-border)] bg-[var(--color-report-surface)] font-[family-name:var(--font-ui)] text-[var(--color-report-text)] placeholder:text-[var(--color-report-text-3)]"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="report-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan sesi'}
            </Button>
            <Button type="button" variant="report-ghost" onClick={() => setShowForm(false)}>
              Batal
            </Button>
            <Link
              href="/sessions/new"
              className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)] self-center hover:text-[var(--color-report-text-2)]"
            >
              Form lengkap
            </Link>
          </div>
        </motion.form>
      ) : null}

      {sessions.length === 0 ? (
        <EmptyState
          icon={<CalendarBlank size={28} weight="duotone" />}
          title="Belum ada sesi latihan"
          description="Buat sesi pertama untuk mulai mencatat absensi dan drill di lapangan."
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
              <h2 className="text-sm font-semibold text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] mb-3">
                {group.dateLabel}
              </h2>
              <ul className="divide-y divide-[var(--color-report-border)] rounded-[var(--radius-panel)] border border-[var(--color-report-border)] bg-[var(--color-report-surface)] overflow-hidden">
                {group.sessions.map((session) => {
                  const isActive = session.status === 'active';
                  const rowContent = (
                    <>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-report-bg)]">
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
                            {session.teamName}
                          </span>
                          <span
                            className={cn(
                              'text-[11px] px-2 py-0.5 rounded-[var(--radius-chip)] font-[family-name:var(--font-ui)] font-medium',
                              statusBadgeClass(session.status),
                            )}
                          >
                            {sessionStatusLabel(session.status)}
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
                      <li key={session.id}>
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
                      </li>
                    );
                  }

                  return (
                    <li key={session.id} className="flex items-center gap-3 px-4 py-4">
                      {rowContent}
                    </li>
                  );
                })}
              </ul>
            </motion.section>
          ))}
        </div>
      )}
    </div>
  );
}
