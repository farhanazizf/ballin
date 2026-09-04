'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, CircleNotch, PencilSimple, Plus } from '@phosphor-icons/react';
import { drillSchema, type DrillInput } from '@/lib/validators/drill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DRILL_CATEGORIES = [
  'Shooting',
  'Finishing',
  'Ballhandling',
  'Defense',
  'Athleticism',
  'Conditioning',
] as const;

const DRILL_TYPES = [
  { value: 'attempt', label: 'Attempt (made/miss)' },
  { value: 'timed', label: 'Timed' },
  { value: 'count_in_time', label: 'Count in time' },
  { value: 'measure', label: 'Measure' },
  { value: 'rating', label: 'Rating' },
] as const;

export type DrillRow = {
  id: string;
  name: string;
  category: string;
  type: string;
  defaultTarget: number | null;
  unit: string | null;
  isArchived: boolean;
};

type FormValues = {
  name: string;
  category: (typeof DRILL_CATEGORIES)[number];
  type: DrillInput['type'];
  defaultTarget: string;
  unit: string;
};

function emptyForm(): FormValues {
  return {
    name: '',
    category: 'Shooting',
    type: 'attempt',
    defaultTarget: '',
    unit: '',
  };
}

function drillToForm(drill: DrillRow): FormValues {
  return {
    name: drill.name,
    category: drill.category as FormValues['category'],
    type: drill.type as DrillInput['type'],
    defaultTarget: drill.defaultTarget != null ? String(drill.defaultTarget) : '',
    unit: drill.unit ?? '',
  };
}

function parseForm(values: FormValues): DrillInput {
  const defaultTarget = values.defaultTarget.trim()
    ? Number(values.defaultTarget)
    : undefined;
  return {
    name: values.name.trim(),
    category: values.category,
    type: values.type,
    defaultTarget: Number.isFinite(defaultTarget) ? defaultTarget : undefined,
    unit: values.unit.trim() || undefined,
    lowerIsBetter: false,
    attributeWeights: {},
  };
}

function selectClassName() {
  return cn(
    'w-full border-2 border-[var(--color-report-border)] bg-[var(--color-report-bg)]',
    'px-3 py-2.5 font-mono text-sm text-[var(--color-report-text)]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-report-text)]',
  );
}

function DrillForm({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial: FormValues;
  submitLabel: string;
  onCancel?: () => void;
  onSubmit: (payload: DrillInput) => Promise<void>;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = drillSchema.safeParse(parseForm(values));
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Data drill tidak valid.');
      return;
    }
    startTransition(async () => {
      try {
        await onSubmit(parsed.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menyimpan drill.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-2 border-[var(--color-report-border)] bg-[var(--color-report-surface)] p-4">
      <Input
        theme="report"
        label="Nama drill"
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        required
      />
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-report-text-3)]">
          Kategori
        </label>
        <select
          value={values.category}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              category: e.target.value as FormValues['category'],
            }))
          }
          className={selectClassName()}
        >
          {DRILL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-report-text-3)]">
          Tipe input
        </label>
        <select
          value={values.type}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              type: e.target.value as DrillInput['type'],
            }))
          }
          className={selectClassName()}
        >
          {DRILL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          theme="report"
          label="Target default"
          type="number"
          min={1}
          value={values.defaultTarget}
          onChange={(e) => setValues((v) => ({ ...v, defaultTarget: e.target.value }))}
        />
        <Input
          theme="report"
          label="Satuan"
          value={values.unit}
          onChange={(e) => setValues((v) => ({ ...v, unit: e.target.value }))}
          hint="Contoh: percobaan, detik"
        />
      </div>
      {error && (
        <p className="font-mono text-[11px] text-[var(--color-hazard)]">{error}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" variant="report-primary" disabled={isPending}>
          {isPending ? <CircleNotch className="animate-spin" size={16} /> : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="report-secondary" onClick={onCancel} disabled={isPending}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}

export function DrillsSettingsClient({
  drills,
  canManage,
}: {
  drills: DrillRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  async function createDrill(payload: DrillInput) {
    const response = await fetch('/api/drills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(data.error ?? 'Gagal menyimpan drill.');
    }
    setShowCreate(false);
    router.refresh();
  }

  async function updateDrill(id: string, payload: DrillInput) {
    const response = await fetch(`/api/drills/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(data.error ?? 'Gagal memperbarui drill.');
    }
    setEditingId(null);
    router.refresh();
  }

  async function archiveDrill(id: string) {
    setArchivingId(id);
    try {
      const response = await fetch(`/api/drills/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: true }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Gagal mengarsipkan drill.');
      }
      router.refresh();
    } finally {
      setArchivingId(null);
    }
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
              Tambah drill
            </Button>
          ) : (
            <DrillForm
              initial={emptyForm()}
              submitLabel="Simpan drill"
              onCancel={() => setShowCreate(false)}
              onSubmit={createDrill}
            />
          )}
        </div>
      )}

      {!canManage && (
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-report-text-3)]">
          Hanya admin yang dapat mengubah drill library.
        </p>
      )}

      <ul className="divide-y divide-[var(--color-report-border)] border-2 border-[var(--color-report-border)]">
        {drills.map((drill) => (
          <li key={drill.id} className="bg-[var(--color-report-surface)]">
            {editingId === drill.id ? (
              <div className="p-4">
                <DrillForm
                  initial={drillToForm(drill)}
                  submitLabel="Simpan perubahan"
                  onCancel={() => setEditingId(null)}
                  onSubmit={(payload) => updateDrill(drill.id, payload)}
                />
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3 px-4 py-4">
                <div>
                  <p className="font-mono text-sm font-semibold uppercase tracking-[0.04em] text-[var(--color-report-text)]">
                    {drill.name}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-report-text-3)]">
                    {drill.category} · {drill.type}
                    {drill.defaultTarget != null ? ` · target ${drill.defaultTarget}` : ''}
                    {drill.unit ? ` ${drill.unit}` : ''}
                  </p>
                </div>
                {canManage && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(drill.id);
                        setShowCreate(false);
                      }}
                      className={cn(
                        'border border-[var(--color-report-border)] p-2',
                        'text-[var(--color-report-text-2)] hover:border-[var(--color-hazard)] hover:text-[var(--color-hazard)]',
                      )}
                      aria-label={`Edit ${drill.name}`}
                    >
                      <PencilSimple size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => archiveDrill(drill.id)}
                      disabled={archivingId === drill.id}
                      className={cn(
                        'border border-[var(--color-report-border)] p-2',
                        'text-[var(--color-report-text-2)] hover:border-[var(--color-hazard)] hover:text-[var(--color-hazard)]',
                      )}
                      aria-label={`Arsipkan ${drill.name}`}
                    >
                      {archivingId === drill.id ? (
                        <CircleNotch className="animate-spin" size={16} />
                      ) : (
                        <Archive size={16} />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
