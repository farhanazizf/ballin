'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CircleNotch } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { sessionSchema, type SessionInput } from '@/lib/validators/session';
import { sessionTypeLabel } from '@/lib/benchmark/battery';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TeamOption } from '@/lib/queries/sessions';

type SessionFormValues = {
  teamId: string;
  scheduledStartLocal: string;
  location?: string;
  sessionType: 'training' | 'benchmark';
};

function toIsoFromLocalDateTime(local: string): string {
  return new Date(local).toISOString();
}

function defaultLocalDateTime(): string {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function SessionFormClient({ teams }: { teams: TeamOption[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionFormValues>({
    defaultValues: {
      teamId: teams[0]?.id ?? '',
      scheduledStartLocal: defaultLocalDateTime(),
      location: '',
      sessionType: 'training',
    },
  });

  function onSubmit(values: SessionFormValues) {
    setServerError(null);

    const payload: SessionInput = {
      teamId: values.teamId,
      scheduledStart: toIsoFromLocalDateTime(values.scheduledStartLocal),
      location: values.location?.trim() || undefined,
      sessionType: values.sessionType,
    };

    const parsed = sessionSchema.safeParse(payload);
    if (!parsed.success) {
      setServerError('Data sesi tidak valid. Periksa kelas dan waktu mulai.');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = (await response.json()) as { id?: string; error?: string };

        if (!response.ok) {
          setServerError(
            data.error ?? 'Gagal menyimpan sesi. Coba lagi dalam beberapa saat.',
          );
          return;
        }

        router.push('/sessions');
        router.refresh();
      } catch {
        setServerError(
          'Gagal terhubung ke server. Periksa koneksi lalu coba lagi.',
        );
      }
    });
  }

  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8">
      <Link
        href="/sessions"
        className={cn(
          'inline-flex items-center gap-1.5 mb-6',
          'text-sm font-medium text-[var(--color-report-text-2)]',
          'font-[family-name:var(--font-ui)]',
          'hover:text-[var(--color-report-text)] transition-colors',
        )}
      >
        <ArrowLeft size={16} weight="bold" />
        Kembali
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-md"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-report-text)] font-[family-name:var(--font-display)]">
          Buat sesi latihan
        </h1>
        <p className="text-sm text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)] mt-1 mb-8">
          Isi kelas, waktu, dan lokasi. Pilih benchmark untuk sesi tes terstandar.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="sessionType"
              className="text-sm font-medium text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)]"
            >
              Tipe sesi
            </label>
            <select
              id="sessionType"
              disabled={isPending || teams.length === 0}
              {...register('sessionType', { required: true })}
              className={cn(
                'h-12 w-full px-4 rounded-[var(--radius-button)] border',
                'bg-[var(--color-report-surface)] border-[var(--color-report-border)]',
                'text-[var(--color-report-text)] font-[family-name:var(--font-ui)] text-base',
              )}
            >
              <option value="training">{sessionTypeLabel('training')}</option>
              <option value="benchmark">{sessionTypeLabel('benchmark')}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="teamId"
              className="text-sm font-medium text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)]"
            >
              Kelas
            </label>
            <select
              id="teamId"
              disabled={isPending || teams.length === 0}
              {...register('teamId', { required: 'Kelas wajib dipilih' })}
              className={cn(
                'h-12 w-full px-4 rounded-[var(--radius-button)] border',
                'bg-[var(--color-report-surface)] border-[var(--color-report-border)]',
                'text-[var(--color-report-text)] font-[family-name:var(--font-ui)] text-base',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]/30 focus:border-[var(--color-leather)]',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                errors.teamId && 'border-[var(--color-miss)]',
              )}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            {errors.teamId ? (
              <p className="text-xs text-[var(--color-miss)] font-[family-name:var(--font-ui)]">
                {errors.teamId.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="scheduledStartLocal"
              className="text-sm font-medium text-[var(--color-report-text-2)] font-[family-name:var(--font-ui)]"
            >
              Waktu mulai
            </label>
            <input
              id="scheduledStartLocal"
              type="datetime-local"
              disabled={isPending}
              {...register('scheduledStartLocal', {
                required: 'Waktu mulai wajib diisi',
              })}
              className={cn(
                'h-12 w-full px-4 rounded-[var(--radius-button)] border',
                'bg-[var(--color-report-surface)] border-[var(--color-report-border)]',
                'text-[var(--color-report-text)] font-[family-name:var(--font-ui)] text-base',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]/30 focus:border-[var(--color-leather)]',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                errors.scheduledStartLocal && 'border-[var(--color-miss)]',
              )}
            />
            {errors.scheduledStartLocal ? (
              <p className="text-xs text-[var(--color-miss)] font-[family-name:var(--font-ui)]">
                {errors.scheduledStartLocal.message}
              </p>
            ) : null}
          </div>

          <Input
            label="Lokasi"
            theme="report"
            placeholder="Contoh: GOR Dynasty"
            disabled={isPending}
            hint="Opsional — membantu coach mengingat venue latihan."
            error={errors.location?.message}
            {...register('location')}
          />

          {serverError ? (
            <div className="rounded-[var(--radius-panel)] border border-[var(--color-miss)]/20 bg-[var(--color-miss)]/8 px-4 py-3">
              <p className="text-sm text-[var(--color-miss)] font-[family-name:var(--font-ui)]">
                {serverError}
              </p>
            </div>
          ) : null}

          <Button
            type="submit"
            variant="report-primary"
            size="md"
            disabled={isPending || teams.length === 0}
            className="w-full"
          >
            {isPending ? (
              <>
                <CircleNotch size={20} weight="bold" className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan sesi'
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
