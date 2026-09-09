'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CircleNotch, PencilSimple, Plus } from '@phosphor-icons/react';
import { createTeamSchema, type TeamInput } from '@/lib/validators/team';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type TeamRow = {
  id: string;
  name: string;
  ageMin: number | null;
  ageMax: number | null;
  trackDrillStats: boolean;
  isActive: boolean;
};

type FormValues = {
  name: string;
  ageMin: string;
  ageMax: string;
  trackDrillStats: boolean;
  isActive: boolean;
};

function emptyForm(): FormValues {
  return {
    name: '',
    ageMin: '',
    ageMax: '',
    trackDrillStats: true,
    isActive: true,
  };
}

function teamToForm(team: TeamRow): FormValues {
  return {
    name: team.name,
    ageMin: team.ageMin != null ? String(team.ageMin) : '',
    ageMax: team.ageMax != null ? String(team.ageMax) : '',
    trackDrillStats: team.trackDrillStats,
    isActive: team.isActive,
  };
}

function parseForm(values: FormValues): TeamInput {
  const ageMin = values.ageMin.trim() ? Number(values.ageMin) : null;
  const ageMax = values.ageMax.trim() ? Number(values.ageMax) : null;
  return {
    name: values.name.trim(),
    ageMin: Number.isFinite(ageMin) ? ageMin : null,
    ageMax: Number.isFinite(ageMax) ? ageMax : null,
    trackDrillStats: values.trackDrillStats,
    isActive: values.isActive,
  };
}

function TeamForm({
  messages,

  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial: FormValues;
  submitLabel: string;
  onCancel?: () => void;
  onSubmit: (payload: TeamInput) => Promise<void>;
  messages: ReturnType<typeof useTranslations>['t'];
}) {
  const st = messages.settings.teams;
  const teamSchema = useMemo(() => createTeamSchema(messages.validation.team), [messages.validation.team]);
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = teamSchema.safeParse(parseForm(values));
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? messages.validation.team.invalidData);
      return;
    }
    startTransition(async () => {
      try {
        await onSubmit(parsed.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : st.saveFailed);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-2 border-[var(--color-report-border)] bg-[var(--color-report-surface)] p-4">
      <Input
        theme="report"
        label={st.teamName}
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          theme="report"
          label={st.ageMin}
          type="number"
          min={0}
          max={99}
          value={values.ageMin}
          onChange={(e) => setValues((v) => ({ ...v, ageMin: e.target.value }))}
          hint={st.ageMinHint}
        />
        <Input
          theme="report"
          label={st.ageMax}
          type="number"
          min={0}
          max={99}
          value={values.ageMax}
          onChange={(e) => setValues((v) => ({ ...v, ageMax: e.target.value }))}
        />
      </div>
      <label className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-report-text-2)]">
        <input
          type="checkbox"
          checked={values.trackDrillStats}
          onChange={(e) => setValues((v) => ({ ...v, trackDrillStats: e.target.checked }))}
          className="h-4 w-4 accent-[var(--color-hazard)]"
        />
        {st.trackDrillStats}
      </label>
      <label className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-report-text-2)]">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => setValues((v) => ({ ...v, isActive: e.target.checked }))}
          className="h-4 w-4 accent-[var(--color-hazard)]"
        />
        {st.teamActive}
      </label>
      {error && (
        <p className="font-mono text-[11px] text-[var(--color-hazard)]">{error}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" variant="report-primary" disabled={isPending}>
          {isPending ? <CircleNotch className="animate-spin" size={16} /> : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="report-secondary" onClick={onCancel} disabled={isPending}>
            {messages.common.cancel}
          </Button>
        )}
      </div>
    </form>
  );
}

export function TeamsSettingsClient({
  teams,
  canManage,
}: {
  teams: TeamRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const { t } = useTranslations();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function createTeam(payload: TeamInput) {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(data.error ?? t.settings.teams.saveFailed);
    }
    setShowCreate(false);
    router.refresh();
  }

  async function updateTeam(id: string, payload: TeamInput) {
    const response = await fetch(`/api/teams/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(data.error ?? t.settings.teams.updateFailed);
    }
    setEditingId(null);
    router.refresh();
  }

  return (
    <div>
      {canManage && (
        <div className="mb-6">
          {!showCreate ? (
            <Button
              type="button"
              variant="report-secondary"
              onClick={() => {
                setShowCreate(true);
                setEditingId(null);
              }}
            >
              <Plus size={16} weight="bold" />
              {t.settings.teams.addTeam}
            </Button>
          ) : (
            <TeamForm
              initial={emptyForm()}
              submitLabel={t.settings.teams.saveTeam}
              onCancel={() => setShowCreate(false)}
              onSubmit={createTeam}
              messages={t}
            />
          )}
        </div>
      )}

      {!canManage && (
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-report-text-3)]">
          {t.settings.teams.adminOnly}
        </p>
      )}

      <ul className="divide-y divide-[var(--color-report-border)] border-2 border-[var(--color-report-border)]">
        {teams.map((team) => (
          <li key={team.id} className="bg-[var(--color-report-surface)]">
            {editingId === team.id ? (
              <div className="p-4">
                <TeamForm
                  initial={teamToForm(team)}
                  submitLabel={t.settings.teams.saveChanges}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(payload) => updateTeam(team.id, payload)}
                  messages={t}
                />
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3 px-4 py-4">
                <div>
                  <p className="font-mono text-sm font-semibold uppercase tracking-[0.04em] text-[var(--color-report-text)]">
                    {team.name}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-report-text-3)]">
                    {team.ageMin != null && team.ageMax != null
                      ? t.settings.teams.ageRange.replace('{min}', String(team.ageMin)).replace('{max}', String(team.ageMax))
                      : t.settings.teams.allAges}
                    {' · '}
                    {team.trackDrillStats ? t.settings.teams.drillStats : t.settings.teams.attendanceOnly}
                    {!team.isActive ? ` · ${t.common.inactive}` : ''}
                  </p>
                </div>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(team.id);
                      setShowCreate(false);
                    }}
                    className={cn(
                      'shrink-0 border border-[var(--color-report-border)] p-2',
                      'text-[var(--color-report-text-2)] hover:border-[var(--color-hazard)] hover:text-[var(--color-hazard)]',
                    )}
                    aria-label={t.settings.teams.editAria.replace('{name}', team.name)}
                  >
                    <PencilSimple size={16} />
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
