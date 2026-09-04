'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CircleNotch } from '@phosphor-icons/react';
import { playerSchema, type PlayerInput } from '@/lib/validators/player';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type TeamOption = { id: string; name: string };

type FormValues = {
  fullName: string;
  nickname: string;
  birthDate: string;
  jerseyNumber: string;
  position: string;
  dominantHand: '' | 'left' | 'right' | 'both';
  school: string;
  guardianName: string;
  guardianPhone: string;
  teamIds: string[];
  status: 'active' | 'inactive';
};

function emptyForm(defaultTeamId?: string): FormValues {
  return {
    fullName: '',
    nickname: '',
    birthDate: '',
    jerseyNumber: '',
    position: '',
    dominantHand: '',
    school: '',
    guardianName: '',
    guardianPhone: '',
    teamIds: defaultTeamId ? [defaultTeamId] : [],
    status: 'active',
  };
}

function toFormValues(
  player: {
    fullName: string;
    nickname: string;
    birthDate: string;
    jerseyNumber: number | null;
    position: string | null;
    dominantHand: string | null;
    school: string | null;
    guardianName: string | null;
    guardianPhone: string | null;
    teamIds: string[];
    status: string;
  },
): FormValues {
  return {
    fullName: player.fullName,
    nickname: player.nickname,
    birthDate: player.birthDate,
    jerseyNumber: player.jerseyNumber != null ? String(player.jerseyNumber) : '',
    position: player.position ?? '',
    dominantHand: (player.dominantHand as FormValues['dominantHand']) ?? '',
    school: player.school ?? '',
    guardianName: player.guardianName ?? '',
    guardianPhone: player.guardianPhone ?? '',
    teamIds: player.teamIds,
    status: player.status === 'inactive' ? 'inactive' : 'active',
  };
}

function toPayload(values: FormValues): PlayerInput {
  const jersey = values.jerseyNumber.trim() ? Number(values.jerseyNumber) : undefined;
  return {
    fullName: values.fullName.trim(),
    nickname: values.nickname.trim(),
    birthDate: values.birthDate,
    jerseyNumber: Number.isFinite(jersey) ? jersey : undefined,
    position: values.position.trim() || undefined,
    dominantHand: values.dominantHand || undefined,
    school: values.school.trim() || undefined,
    guardianName: values.guardianName.trim() || undefined,
    guardianPhone: values.guardianPhone.trim() || undefined,
    teamIds: values.teamIds,
  };
}

function selectClassName() {
  return cn(
    'w-full border-2 border-[var(--color-report-border)] bg-[var(--color-report-bg)]',
    'px-3 py-2.5 font-mono text-sm text-[var(--color-report-text)]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-report-text)]',
  );
}

export function PlayerFormClient({
  mode,
  teams,
  initial,
  playerId,
}: {
  mode: 'create' | 'edit';
  teams: TeamOption[];
  initial?: FormValues;
  playerId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial ?? emptyForm(teams[0]?.id));
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleTeam(teamId: string) {
    setValues((current) => {
      const has = current.teamIds.includes(teamId);
      return {
        ...current,
        teamIds: has
          ? current.teamIds.filter((id) => id !== teamId)
          : [...current.teamIds, teamId],
      };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const payload = toPayload(values);
    const parsed = playerSchema.safeParse(payload);
    if (!parsed.success) {
      setServerError(parsed.error.issues[0]?.message ?? 'Data pemain tidak valid.');
      return;
    }

    startTransition(async () => {
      try {
        if (mode === 'create') {
          const response = await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed.data),
          });
          const data = (await response.json()) as { id?: string; error?: string };
          if (!response.ok) {
            setServerError(data.error ?? 'Gagal menyimpan pemain.');
            return;
          }
          router.push(`/players/${data.id}`);
          router.refresh();
          return;
        }

        const response = await fetch(`/api/players/${playerId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...parsed.data, status: values.status }),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          setServerError(data.error ?? 'Gagal memperbarui pemain.');
          return;
        }
        router.push(`/players/${playerId}`);
        router.refresh();
      } catch {
        setServerError('Gagal menyimpan. Periksa koneksi lalu coba lagi.');
      }
    });
  }

  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      <Link
        href={mode === 'edit' && playerId ? `/players/${playerId}` : '/players'}
        className="inline-flex items-center gap-2 mb-6 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-report-text-2)] hover:text-[var(--color-report-text)]"
      >
        <ArrowLeft size={16} />
        Kembali
      </Link>

      <p className="brut-label text-[var(--color-hazard)]">
        [ Roster / {mode === 'create' ? 'Baru' : 'Edit'} ]
      </p>
      <h1 className="brut-heading mt-2 mb-6 text-2xl text-[var(--color-report-text)]">
        {mode === 'create' ? 'Tambah pemain' : 'Edit pemain'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          theme="report"
          label="Nama lengkap"
          value={values.fullName}
          onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
          required
        />
        <Input
          theme="report"
          label="Nama panggilan"
          value={values.nickname}
          onChange={(e) => setValues((v) => ({ ...v, nickname: e.target.value }))}
          hint="Muncul di layar lapangan — unik per kelas"
          required
        />
        <Input
          theme="report"
          label="Tanggal lahir"
          type="date"
          value={values.birthDate}
          onChange={(e) => setValues((v) => ({ ...v, birthDate: e.target.value }))}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            theme="report"
            label="Nomor punggung"
            type="number"
            min={0}
            max={99}
            value={values.jerseyNumber}
            onChange={(e) => setValues((v) => ({ ...v, jerseyNumber: e.target.value }))}
          />
          <Input
            theme="report"
            label="Posisi"
            value={values.position}
            onChange={(e) => setValues((v) => ({ ...v, position: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-report-text-3)]">
            Tangan dominan
          </label>
          <select
            value={values.dominantHand}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                dominantHand: e.target.value as FormValues['dominantHand'],
              }))
            }
            className={selectClassName()}
          >
            <option value="">—</option>
            <option value="right">Kanan</option>
            <option value="left">Kiri</option>
            <option value="both">Kedua tangan</option>
          </select>
        </div>
        <Input
          theme="report"
          label="Sekolah"
          value={values.school}
          onChange={(e) => setValues((v) => ({ ...v, school: e.target.value }))}
        />
        <Input
          theme="report"
          label="Nama wali"
          value={values.guardianName}
          onChange={(e) => setValues((v) => ({ ...v, guardianName: e.target.value }))}
        />
        <Input
          theme="report"
          label="Telepon wali"
          type="tel"
          value={values.guardianPhone}
          onChange={(e) => setValues((v) => ({ ...v, guardianPhone: e.target.value }))}
        />

        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-report-text-3)]">
            Kelas
          </p>
          <div className="space-y-2 border-2 border-[var(--color-report-border)] p-3">
            {teams.map((team) => (
              <label
                key={team.id}
                className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-report-text-2)]"
              >
                <input
                  type="checkbox"
                  checked={values.teamIds.includes(team.id)}
                  onChange={() => toggleTeam(team.id)}
                  className="h-4 w-4 accent-[var(--color-hazard)]"
                />
                {team.name}
              </label>
            ))}
          </div>
        </div>

        {mode === 'edit' && (
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-report-text-3)]">
              Status
            </label>
            <select
              value={values.status}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  status: e.target.value as FormValues['status'],
                }))
              }
              className={selectClassName()}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        )}

        {serverError && (
          <p className="font-mono text-[11px] text-[var(--color-hazard)]">{serverError}</p>
        )}

        <Button type="submit" variant="report-primary" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? (
            <CircleNotch className="animate-spin" size={16} />
          ) : mode === 'create' ? (
            'Simpan pemain'
          ) : (
            'Simpan perubahan'
          )}
        </Button>
      </form>
    </div>
  );
}

export { toFormValues };
