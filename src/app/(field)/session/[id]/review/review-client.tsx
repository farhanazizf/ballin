'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, CircleNotch, WarningCircle } from '@phosphor-icons/react';
import { cacheFieldBootstrap } from '@/lib/field/bootstrap';
import {
  loadSessionReview,
  saveReviewOverrides,
  type ReviewDrillSection,
} from '@/lib/field/review';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EditableRow = {
  made: string;
  attempts: string;
  isDnp: boolean;
};

function toEditable(section: ReviewDrillSection): Record<string, EditableRow> {
  const rows: Record<string, EditableRow> = {};
  for (const player of section.players) {
    rows[player.playerId] = {
      made: String(player.made),
      attempts: String(player.attempts),
      isDnp: player.isDnp,
    };
  }
  return rows;
}

export function ReviewClient({
  sessionId,
  coachId,
}: {
  sessionId: string;
  coachId: string;
}) {
  const [sections, setSections] = useState<ReviewDrillSection[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Record<string, EditableRow>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bootstrapRes = await fetch(`/api/field/bootstrap?sessionId=${sessionId}`, {
        credentials: 'include',
      });
      if (bootstrapRes.ok) {
        await cacheFieldBootstrap(await bootstrapRes.json());
      }

      const data = await loadSessionReview(sessionId);
      setSections(data);
      const nextDrafts: Record<string, Record<string, EditableRow>> = {};
      for (const section of data) {
        nextDrafts[section.sessionDrillId] = toEditable(section);
      }
      setDrafts(nextDrafts);
    } catch {
      setError('Gagal memuat data review. Buka ulang halaman ini.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const summary = useMemo(() => {
    let needsConfirm = 0;
    let conflicts = 0;
    for (const section of sections) {
      for (const player of section.players) {
        if (player.needsConfirm) needsConfirm += 1;
        if (player.hasConflict) conflicts += 1;
      }
    }
    return { needsConfirm, conflicts };
  }, [sections]);

  function updateDraft(
    sessionDrillId: string,
    playerId: string,
    patch: Partial<EditableRow>,
  ) {
    setDrafts((current) => ({
      ...current,
      [sessionDrillId]: {
        ...current[sessionDrillId],
        [playerId]: {
          ...current[sessionDrillId][playerId],
          ...patch,
        },
      },
    }));
  }

  function handleSaveAll() {
    setError(null);
    setSavedMessage(null);

    const overrides = sections.flatMap((section) =>
      section.players.map((player) => {
        const draft = drafts[section.sessionDrillId]?.[player.playerId];
        return {
          sessionDrillId: section.sessionDrillId,
          playerId: player.playerId,
          made: draft?.isDnp ? 0 : Number(draft?.made ?? 0),
          attempts: draft?.isDnp ? 0 : Number(draft?.attempts ?? 0),
          isDnp: draft?.isDnp ?? false,
        };
      }),
    );

    startTransition(async () => {
      const result = await saveReviewOverrides(overrides, coachId);
      if (result.errors.length > 0) {
        setError(result.errors[0] ?? 'Gagal menyimpan review.');
        return;
      }
      setSavedMessage('Tersimpan di HP. Akan dikirim saat online.');
      await refresh();
    });
  }

  if (loading) {
    return (
      <div className="p-4 font-mono text-sm text-[var(--color-field-text-3)] animate-pulse">
        Memuat review...
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col pb-24">
      <header className="p-4 border-b border-[var(--color-field-border)]">
        <Link
          href={`/session/${sessionId}/stations`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-field-text-3)] mb-3"
        >
          <ArrowLeft size={16} />
          Kembali ke pos
        </Link>
        <p className="brut-label text-[var(--color-hazard)]">[ Field / Review ]</p>
        <h1 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-field-text)] mt-2">
          Review hasil drill
        </h1>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-field-text-3)]">
          Koreksi angka sebelum selesai — tidak perlu internet
        </p>
        {(summary.needsConfirm > 0 || summary.conflicts > 0) && (
          <div className="mt-3 space-y-1">
            {summary.needsConfirm > 0 && (
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-gold)]">
                <WarningCircle size={14} />
                {summary.needsConfirm} pemain perlu dikonfirmasi (0 rep)
              </p>
            )}
            {summary.conflicts > 0 && (
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-hazard)]">
                <WarningCircle size={14} />
                {summary.conflicts} pemain dicatat lebih dari satu coach
              </p>
            )}
          </div>
        )}
      </header>

      <div className="flex-1 p-4 space-y-6">
        {sections.length === 0 ? (
          <p className="font-mono text-sm text-[var(--color-field-text-3)]">
            Belum ada drill dicatat di sesi ini. Mulai dari pos drill dulu.
          </p>
        ) : (
          sections.map((section) => (
            <section
              key={section.sessionDrillId}
              className="border-2 border-[var(--color-field-border)] bg-[var(--color-field-surface)]"
            >
              <div className="border-b border-[var(--color-field-border)] px-4 py-3">
                <h2 className="font-[family-name:var(--font-display)] text-base text-[var(--color-field-text)]">
                  {section.drillName}
                </h2>
                {section.target != null && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-field-text-3)] mt-1">
                    Target {section.target}
                  </p>
                )}
              </div>
              <ul className="divide-y divide-[var(--color-field-border)]">
                {section.players.map((player) => {
                  const draft = drafts[section.sessionDrillId]?.[player.playerId];
                  const showFlags = player.needsConfirm || player.hasConflict || player.overridden;

                  return (
                    <li key={player.playerId} className="px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-[family-name:var(--font-ui)] font-semibold text-[var(--color-field-text)]">
                            {player.nickname}
                            {player.jerseyNumber != null ? ` #${player.jerseyNumber}` : ''}
                          </p>
                          {showFlags && (
                            <div className="mt-1 flex flex-wrap gap-2">
                              {player.needsConfirm && (
                                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--color-gold)]">
                                  perlu konfirmasi
                                </span>
                              )}
                              {player.hasConflict && (
                                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--color-hazard)]">
                                  multi-coach
                                </span>
                              )}
                              {player.overridden && (
                                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--color-phosphor)]">
                                  diedit manual
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-field-text-3)]">
                          <input
                            type="checkbox"
                            checked={draft?.isDnp ?? false}
                            onChange={(e) =>
                              updateDraft(section.sessionDrillId, player.playerId, {
                                isDnp: e.target.checked,
                                made: e.target.checked ? '0' : draft?.made ?? '0',
                                attempts: e.target.checked ? '0' : draft?.attempts ?? '0',
                              })
                            }
                            className="h-4 w-4 accent-[var(--color-hazard)]"
                          />
                          DNP
                        </label>
                      </div>
                      {!draft?.isDnp && (
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex flex-col gap-1">
                            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--color-field-text-3)]">
                              Made
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={draft?.made ?? '0'}
                              onChange={(e) =>
                                updateDraft(section.sessionDrillId, player.playerId, {
                                  made: e.target.value,
                                })
                              }
                              className={cn(
                                'h-11 border-2 border-[var(--color-field-border)] bg-[var(--color-field-bg)]',
                                'px-3 font-mono text-lg text-[var(--color-field-text)] tabular-nums',
                              )}
                            />
                          </label>
                          <label className="flex flex-col gap-1">
                            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--color-field-text-3)]">
                              Attempts
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={draft?.attempts ?? '0'}
                              onChange={(e) =>
                                updateDraft(section.sessionDrillId, player.playerId, {
                                  attempts: e.target.value,
                                })
                              }
                              className={cn(
                                'h-11 border-2 border-[var(--color-field-border)] bg-[var(--color-field-bg)]',
                                'px-3 font-mono text-lg text-[var(--color-field-text)] tabular-nums',
                              )}
                            />
                          </label>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>

      <footer className="fixed bottom-0 inset-x-0 border-t border-[var(--color-field-border)] bg-[var(--color-field-bg)] p-4">
        {error && (
          <p className="mb-2 font-mono text-[11px] text-[var(--color-hazard)]">{error}</p>
        )}
        {savedMessage && (
          <p className="mb-2 font-mono text-[11px] text-[var(--color-field-text-2)]">
            {savedMessage}
          </p>
        )}
        <Button
          variant="primary"
          size="field"
          className="w-full"
          disabled={isPending || sections.length === 0}
          onClick={handleSaveAll}
        >
          {isPending ? (
            <>
              <CircleNotch className="animate-spin" size={18} />
              Menyimpan...
            </>
          ) : (
            'Simpan review'
          )}
        </Button>
      </footer>
    </div>
  );
}
