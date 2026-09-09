'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, CircleNotch } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n/use-translations';
import type { RubricPlayerRow } from '@/lib/queries/rubric';

type RubricData = {
  rotation: Array<{ id: string; nickname: string }>;
  scores: RubricPlayerRow[];
};

const SCORES = [1, 2, 3, 4, 5] as const;

export function RubricClient({ sessionId }: { sessionId: string }) {
  const { t } = useTranslations();
  const r = t.field.rubric;
  const [data, setData] = useState<RubricData | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { effort?: number; coachability?: number; discipline?: number }>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void fetch(`/api/sessions/${sessionId}/rubric`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(r.loadFailed);
        const json = (await res.json()) as RubricData & { rotation: RubricData['rotation'] };
        setData({ rotation: json.rotation, scores: json.scores });
        const initial: typeof drafts = {};
        for (const player of json.rotation) {
          const existing = json.scores.find((s) => s.playerId === player.id);
          initial[player.id] = {
            effort: existing?.effort ?? undefined,
            coachability: existing?.coachability ?? undefined,
            discipline: existing?.discipline ?? undefined,
          };
        }
        setDrafts(initial);
      })
      .catch(() => setError(r.loadFailed));
  }, [sessionId]);

  function setScore(playerId: string, field: 'effort' | 'coachability' | 'discipline', value: number) {
    setDrafts((prev) => ({ ...prev, [playerId]: { ...prev[playerId], [field]: value } }));
  }

  function handleSave() {
    if (!data) return;
    startTransition(async () => {
      setError(null);
      const scores = data.rotation.map((player) => ({
        playerId: player.id,
        effort: drafts[player.id]?.effort ?? null,
        coachability: drafts[player.id]?.coachability ?? null,
        discipline: drafts[player.id]?.discipline ?? null,
      }));

      const res = await fetch(`/api/sessions/${sessionId}/rubric`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ scores }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? r.saveFailed);
        return;
      }
    });
  }

  return (
    <div className="min-h-[100dvh] pb-28 px-4 py-6">
      <Link href={`/session/${sessionId}/review`} className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-field-text-3)] mb-6">
        <ArrowLeft size={16} /> {r.backToReview}
      </Link>

      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-field-text)] mb-2">{r.title}</h1>
      <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-field-text-2)] mb-6">
        {r.subtitle}
      </p>

      {error ? <p className="mb-4 font-mono text-xs text-[var(--color-hazard)]">{error}</p> : null}

      {!data ? (
        <p className="font-mono text-xs text-[var(--color-field-text-3)]">Memuat...</p>
      ) : (
        <ul className="space-y-4">
          {data.rotation.map((player) => (
            <li key={player.id} className="border border-[var(--color-field-border)] p-4">
              <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-field-text)] mb-3">{player.nickname}</p>
              {(['effort', 'coachability', 'discipline'] as const).map((field) => (
                <div key={field} className="mb-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-field-text-3)] mb-2">
                    {field === 'effort' ? r.effort : field === 'coachability' ? r.coachability : r.discipline}
                  </p>
                  <div className="flex gap-2">
                    {SCORES.map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setScore(player.id, field, score)}
                        className={cn(
                          'h-11 w-11 font-mono text-sm font-semibold border',
                          drafts[player.id]?.[field] === score
                            ? 'border-[var(--color-hazard)] bg-[var(--color-hazard)] text-[var(--color-phosphor)]'
                            : 'border-[var(--color-field-border)] text-[var(--color-field-text-2)]',
                        )}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}

      <footer className="fixed bottom-0 inset-x-0 border-t border-[var(--color-field-border)] bg-[var(--color-field-bg)] p-4 flex flex-col gap-2">
        <Button variant="primary" size="field" className="w-full" disabled={isPending || !data} onClick={handleSave}>
          {isPending ? <><CircleNotch className="animate-spin" size={18} /> Menyimpan...</> : r.saveRubric}
        </Button>
        <Link href={`/session/${sessionId}/close`} className="text-center font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-phosphor)] py-2">
          {r.continueToNotes}
        </Link>
      </footer>
    </div>
  );
}
