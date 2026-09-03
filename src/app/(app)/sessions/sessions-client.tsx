'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CalendarDots, Plus, MapPin, CaretRight, UsersThree } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { SessionListItem, TeamOption } from '@/lib/queries/sessions';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

function statusLabel(status: SessionListItem['status']): string {
  if (status === 'active') return 'Berlangsung';
  if (status === 'scheduled') return 'Terjadwal';
  if (status === 'completed') return 'Selesai';
  return 'Dibatalkan';
}

export function SessionsClient({
  sessions,
  teams,
}: {
  sessions: SessionListItem[];
  teams: TeamOption[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('18:00');
  const [location, setLocation] = useState('GOR Dynasty');
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
    const scheduledEnd = new Date(`${date}T${endTime}:00+07:00`).toISOString();

    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        teamId,
        scheduledStart,
        scheduledEnd,
        location,
        sessionType: 'training',
      }),
    });

    const body = (await res.json()) as { id?: string; error?: string };
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error ?? 'Gagal membuat sesi.');
      return;
    }

    setShowForm(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl text-[var(--color-report-text)]">
            Latihan
          </h1>
          <p className="mt-1 text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)]">
            {sessions.length} sesi terakhir
          </p>
        </div>
        <Button
          variant="report-primary"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          className="shrink-0"
        >
          <Plus size={18} weight="bold" />
          Baru
        </Button>
      </header>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className={cn(
            'rounded-[var(--radius-panel)] border border-[var(--color-report-border)]',
            'bg-[var(--color-report-surface)] p-5 space-y-4',
          )}
        >
          <h2 className="font-[family-name:var(--font-ui)] font-semibold text-[var(--color-report-text)]">
            Sesi latihan baru
          </h2>
          {error && (
            <p className="text-sm text-[var(--color-miss)] font-[family-name:var(--font-ui)]">{error}</p>
          )}
          <label className="block space-y-1">
            <span className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)]">Kelas</span>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full h-11 px-3 rounded-[var(--radius-panel)] border border-[var(--color-report-border)] bg-[var(--color-report-bg)] font-[family-name:var(--font-ui)]"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)]">Tanggal</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 px-3 rounded-[var(--radius-panel)] border border-[var(--color-report-border)] bg-[var(--color-report-bg)] font-[family-name:var(--font-ui)]"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)]">Mulai</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-11 px-3 rounded-[var(--radius-panel)] border border-[var(--color-report-border)] bg-[var(--color-report-bg)] font-[family-name:var(--font-ui)]"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)]">Selesai</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-11 px-3 rounded-[var(--radius-panel)] border border-[var(--color-report-border)] bg-[var(--color-report-bg)] font-[family-name:var(--font-ui)]"
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-sm text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)]">Lokasi</span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-11 px-3 rounded-[var(--radius-panel)] border border-[var(--color-report-border)] bg-[var(--color-report-bg)] font-[family-name:var(--font-ui)]"
            />
          </label>
          <div className="flex gap-2">
            <Button type="submit" variant="report-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Buat sesi'}
            </Button>
            <Button type="button" variant="report-ghost" onClick={() => setShowForm(false)}>
              Batal
            </Button>
          </div>
        </form>
      )}

      {sessions.length === 0 ? (
        <EmptyState
          icon={<CalendarDots size={28} weight="duotone" />}
          title="Belum ada sesi"
          description="Buat sesi latihan pertama untuk mulai absensi dan pencatatan drill."
          theme="report"
        />
      ) : (
        <ul className="divide-y divide-[var(--color-report-border)] rounded-[var(--radius-panel)] border border-[var(--color-report-border)] bg-[var(--color-report-surface)] overflow-hidden">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link
                href={`/session/${session.id}/attendance`}
                className={cn(
                  'flex items-center gap-3 px-4 py-4',
                  'hover:bg-[var(--color-report-bg)] transition-colors',
                )}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-[family-name:var(--font-ui)] font-semibold text-[var(--color-report-text)]">
                      {session.teamName}
                    </span>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-[family-name:var(--font-ui)]',
                        session.status === 'active'
                          ? 'bg-[var(--color-made)]/15 text-[var(--color-made)]'
                          : 'bg-[var(--color-report-bg)] text-[var(--color-report-text-3)]',
                      )}
                    >
                      {statusLabel(session.status)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)]">
                    {formatDate(session.scheduledStart)} · {formatTime(session.scheduledStart)}
                    {session.scheduledEnd ? `–${formatTime(session.scheduledEnd)}` : ''}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[var(--color-report-text-3)] font-[family-name:var(--font-ui)]">
                    {session.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={14} />
                        {session.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <UsersThree size={14} />
                      {session.attendanceCount}/{session.rosterCount} hadir
                    </span>
                  </div>
                </div>
                <CaretRight size={18} className="text-[var(--color-report-text-3)] shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
