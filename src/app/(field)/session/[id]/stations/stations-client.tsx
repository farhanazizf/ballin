'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowsClockwise, Barbell, GearSix, UsersThree } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { cacheFieldBootstrap, loadCachedFieldBootstrap } from '@/lib/field/bootstrap';
import {
  defaultStationLabels,
  rotateStationAssignments,
  splitPlayersEvenly,
  type StationDraft,
} from '@/lib/field/stations';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/i18n/use-translations';

type DrillRow = { id: string; name: string; category: string };
type PlayerRow = { id: string; nickname: string; jerseyNumber?: number | null };
type StationRow = { id: string; label: string; coachId?: string | null; sortOrder: number; playerIds: string[] };

const ACTIVE_STATION_KEY = (sessionId: string) => `ballin_active_station_${sessionId}`;

export function StationsClient({ sessionId, teamName }: { sessionId: string; teamName: string }) {
  const { t } = useTranslations();
  const s = t.field.stations;
  const [drills, setDrills] = useState<DrillRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [stations, setStations] = useState<StationRow[]>([]);
  const [activeStationId, setActiveStationId] = useState<string | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [draft, setDraft] = useState<StationDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/field/bootstrap?sessionId=${sessionId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        await cacheFieldBootstrap(data);
        setDrills(data.drills.map((d: DrillRow) => ({ id: d.id, name: d.name, category: d.category })));
        setPlayers(data.players);
        setStations(data.stations ?? []);
        const stored = localStorage.getItem(ACTIVE_STATION_KEY(sessionId));
        if (stored && (data.stations ?? []).some((s: StationRow) => s.id === stored)) {
          setActiveStationId(stored);
        } else if ((data.stations ?? []).length === 1) {
          setActiveStationId(data.stations[0].id);
        }
        setError(null);
        return;
      }
    } catch {
      // Fall back to Dexie when the GOR has no signal.
    }

    const cached = await loadCachedFieldBootstrap(sessionId);
    if (cached) {
      setDrills(cached.drills.map((d) => ({ id: d.id, name: d.name, category: d.category })));
      setPlayers(cached.players);
      setStations(cached.stations ?? []);
      const stored = localStorage.getItem(ACTIVE_STATION_KEY(sessionId));
      if (stored && (cached.stations ?? []).some((s) => s.id === stored)) {
        setActiveStationId(stored);
      } else if ((cached.stations ?? []).length === 1) {
        setActiveStationId(cached.stations[0].id);
      }
      setError(null);
      return;
    }

    setError('Data pos belum tersimpan di HP. Sambungkan internet lalu buka halaman ini sekali.');
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const singleCoachMode = stations.length === 0;

  const visibleDrills = useMemo(() => drills, [drills]);

  function openSetup() {
    if (stations.length > 0) {
      setDraft(stations.map((s) => ({ label: s.label, playerIds: [...s.playerIds] })));
    } else {
      const count = Math.min(2, Math.max(1, players.length));
      const groups = splitPlayersEvenly(
        players.map((p) => p.id),
        count,
      );
      setDraft(
        defaultStationLabels(count).map((label, index) => ({
          label,
          playerIds: groups[index] ?? [],
        })),
      );
    }
    setSetupOpen(true);
  }

  function assignPlayer(stationIndex: number, playerId: string, checked: boolean) {
    setDraft((prev) =>
      prev.map((station, index) => {
        const without = station.playerIds.filter((id) => id !== playerId);
        if (index === stationIndex && checked) {
          return { ...station, playerIds: [...without, playerId] };
        }
        if (index !== stationIndex) {
          return { ...station, playerIds: without };
        }
        return { ...station, playerIds: without };
      }),
    );
  }

  async function saveStations(nextDraft: StationDraft[]) {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/sessions/${sessionId}/stations`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ stations: nextDraft }),
    });
    setSaving(false);
    if (!res.ok) {
      setError(s.saveFailed);
      return;
    }
    setSetupOpen(false);
    await load();
  }

  async function handleSave() {
    await saveStations(draft);
  }

  async function handleRotate() {
    if (stations.length < 2) return;
    const confirmed = window.confirm(s.rotateConfirm);
    if (!confirmed) return;
    const next = rotateStationAssignments(
      stations.map((s) => ({ label: s.label, playerIds: [...s.playerIds] })),
    );
    await saveStations(next);
  }

  function pickStation(stationId: string) {
    setActiveStationId(stationId);
    localStorage.setItem(ACTIVE_STATION_KEY(sessionId), stationId);
  }

  function drillHref(drillId: string) {
    if (singleCoachMode || !activeStationId) {
      return `/session/${sessionId}/drill/${drillId}`;
    }
    return `/session/${sessionId}/drill/${drillId}?stationId=${activeStationId}`;
  }

  return (
    <div className="min-h-[100dvh] p-4">
      <header className="mb-6 flex items-center gap-3">
        <Link href={`/session/${sessionId}/attendance`} className="text-[var(--color-field-text-3)]">
          <ArrowLeft size={22} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-field-text)]">
            {setupOpen ? s.setupTitle : s.pickDrill} · {teamName}
          </h1>
          {!setupOpen && !singleCoachMode && activeStationId && (
            <p className="text-xs text-[var(--color-field-text-3)]">
              {stations.find((s) => s.id === activeStationId)?.label}
            </p>
          )}
        </div>
        {!setupOpen && (
          <button
            type="button"
            onClick={openSetup}
            className="inline-flex min-h-[var(--size-touch-min)] items-center gap-1.5 border border-[var(--color-field-border)] px-3 text-xs font-mono uppercase tracking-[0.08em] text-[var(--color-field-text-2)]"
          >
            <GearSix size={16} />
            {s.stationsButton}
          </button>
        )}
      </header>

      {error && <p className="mb-4 text-sm text-[var(--color-miss)]">{error}</p>}

      {setupOpen ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={draft.length >= 8}
              onClick={() =>
                setDraft((prev) => [...prev, { label: `{s.stationsButton} ${prev.length + 1}`, playerIds: [] }])
              }
            >
              {s.addStation}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={draft.length <= 1}
              onClick={() => setDraft((prev) => prev.slice(0, -1))}
            >
              {s.removeStation}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const groups = splitPlayersEvenly(
                  players.map((p) => p.id),
                  draft.length,
                );
                setDraft((prev) =>
                  prev.map((station, index) => ({ ...station, playerIds: groups[index] ?? [] })),
                );
              }}
            >
              {s.splitEvenly}
            </Button>
          </div>

          {draft.map((station, stationIndex) => (
            <section
              key={stationIndex}
              className="rounded-[var(--radius-panel)] border border-[var(--color-field-border)] bg-[var(--color-field-surface)] p-4"
            >
              <input
                value={station.label}
                onChange={(event) =>
                  setDraft((prev) =>
                    prev.map((row, index) =>
                      index === stationIndex ? { ...row, label: event.target.value } : row,
                    ),
                  )
                }
                className="mb-3 w-full border border-[var(--color-field-border)] bg-[var(--color-terminal-bg)] px-3 py-2 font-[family-name:var(--font-ui)] text-sm text-[var(--color-field-text)]"
              />
              <ul className="space-y-1">
                {players.map((player) => {
                  const checked = station.playerIds.includes(player.id);
                  return (
                    <li key={player.id}>
                      <label className="flex min-h-[var(--size-touch-min)] items-center gap-3 px-1">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => assignPlayer(stationIndex, player.id, event.target.checked)}
                        />
                        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-field-text)]">
                          {player.nickname}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <div className="flex gap-2 pb-8">
            <Button variant="secondary" className="flex-1" onClick={() => setSetupOpen(false)}>
              Batal
            </Button>
            <Button className="flex-1" disabled={saving || draft.length === 0} onClick={() => void handleSave()}>
              {saving ? t.common.saving : s.saveStations}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {!singleCoachMode && (
            <div className="mb-6 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-field-text-3)]">
                {s.stationsButton} saya
              </p>
              <div className="grid grid-cols-2 gap-2">
                {stations.map((station) => (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => pickStation(station.id)}
                    className={cn(
                      'min-h-[var(--size-touch-min)] rounded-[var(--radius-panel)] border px-3 py-2 text-left',
                      activeStationId === station.id
                        ? 'border-[var(--color-phosphor)] bg-[var(--color-phosphor)]/10'
                        : 'border-[var(--color-field-border)] bg-[var(--color-field-surface)]',
                    )}
                  >
                    <p className="font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--color-field-text)]">
                      {station.label}
                    </p>
                    <p className="text-xs text-[var(--color-field-text-3)]">
                      {station.playerIds.length} pemain
                    </p>
                  </button>
                ))}
              </div>
              {stations.length > 1 && (
                <Button variant="secondary" size="sm" className="w-full" onClick={() => void handleRotate()}>
                  <ArrowsClockwise size={16} className="mr-2" />
                  {s.rotateGroups}
                </Button>
              )}
            </div>
          )}

          {singleCoachMode && (
            <p className="mb-4 flex items-center gap-2 text-sm text-[var(--color-field-text-3)]">
              <UsersThree size={18} />
              {s.singleCoachMode}
            </p>
          )}

          {!singleCoachMode && !activeStationId && (
            <p className="mb-4 text-sm text-[var(--color-field-text-3)]">
              {s.pickStationFirst}
            </p>
          )}

          <ul className="space-y-2">
            {visibleDrills.map((drill) => (
              <li key={drill.id}>
                <Link
                  href={drillHref(drill.id)}
                  className={cn(
                    'flex min-h-[var(--size-touch-min)] items-center gap-3 rounded-[var(--radius-panel)] px-4 py-4',
                    'border border-[var(--color-field-border)] bg-[var(--color-field-surface)] active:scale-[0.99]',
                    !singleCoachMode && !activeStationId && 'pointer-events-none opacity-40',
                  )}
                >
                  <Barbell size={22} className="shrink-0 text-[var(--color-leather)]" />
                  <div>
                    <p className="font-[family-name:var(--font-ui)] font-semibold text-[var(--color-field-text)]">
                      {drill.name}
                    </p>
                    <p className="text-xs text-[var(--color-field-text-3)]">{drill.category}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 pb-8">
            <Link
              href={`/session/${sessionId}/review`}
              className="inline-flex min-h-[var(--size-touch-min)] w-full items-center justify-center border-2 border-[var(--color-field-border)] px-4 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-field-text-2)] hover:border-[var(--color-phosphor)] hover:text-[var(--color-phosphor)]"
            >
              {s.reviewSession}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
