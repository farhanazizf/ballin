'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CircleNotch, Basketball } from '@phosphor-icons/react';
import { DrillGrid, type DrillGridPlayer } from '@/components/field/drill-grid';
import { EmptyState } from '@/components/ui/empty-state';
import { db, type LocalPlayer, type LocalSessionDrill } from '@/lib/db';
import { loadPlayerCounts } from '@/lib/field/drill-counts';
import { createClient } from '@/lib/supabase/client';

interface DrillPageData {
  sessionDrill: LocalSessionDrill;
  drillName: string;
  players: DrillGridPlayer[];
  recordedBy: string;
}

async function loadStationPlayerIds(stationId: string): Promise<string[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('station_players')
    .select('player_id')
    .eq('station_id', stationId);

  if (error || !data) return null;
  return data.map((row) => row.player_id);
}

async function loadTeamPlayers(teamId: string): Promise<LocalPlayer[]> {
  const local = await db.players.filter((p) => p.teamIds.includes(teamId)).toArray();
  if (local.length > 0) return local.slice(0, 15);

  const supabase = createClient();
  const { data } = await supabase
    .from('team_players')
    .select('player_id, players(id, nickname, full_name, birth_date, status)')
    .eq('team_id', teamId)
    .limit(15);

  if (!data) return [];

  return data
    .map((row) => {
      const player = row.players as {
        id: string;
        nickname: string;
        full_name: string;
        birth_date: string;
        status: string;
      } | null;
      if (!player) return null;
      return {
        id: player.id,
        teamIds: [teamId],
        fullName: player.full_name,
        nickname: player.nickname,
        birthDate: player.birth_date,
        status: player.status,
      } satisfies LocalPlayer;
    })
    .filter((p): p is LocalPlayer => p !== null);
}

async function loadDrillPageData(
  sessionId: string,
  sessionDrillId: string
): Promise<DrillPageData | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let sessionDrill = await db.sessionDrills.get(sessionDrillId);

  if (!sessionDrill) {
    const { data } = await supabase
      .from('session_drills')
      .select('id, session_id, station_id, drill_id, target, track_misses, started_at, finished_at')
      .eq('id', sessionDrillId)
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!data) return null;

    sessionDrill = {
      id: data.id,
      sessionId: data.session_id,
      stationId: data.station_id ?? undefined,
      drillId: data.drill_id,
      target: data.target ?? undefined,
      trackMisses: data.track_misses,
      startedAt: data.started_at,
      finishedAt: data.finished_at ?? undefined,
    };

    await db.sessionDrills.put(sessionDrill);
  }

  if (sessionDrill.sessionId !== sessionId) return null;

  let drillName = (await db.drills.get(sessionDrill.drillId))?.name;
  if (!drillName) {
    const { data } = await supabase
      .from('drills')
      .select('name')
      .eq('id', sessionDrill.drillId)
      .maybeSingle();
    drillName = data?.name ?? 'Drill';
  }

  let roster: LocalPlayer[] = [];

  if (sessionDrill.stationId) {
    const stationPlayerIds = await loadStationPlayerIds(sessionDrill.stationId);
    if (stationPlayerIds?.length) {
      const local = await db.players.bulkGet(stationPlayerIds);
      roster = local.filter((p): p is LocalPlayer => p !== undefined).slice(0, 15);

      if (roster.length === 0) {
        const { data } = await supabase
          .from('players')
          .select('id, nickname, full_name, birth_date, status')
          .in('id', stationPlayerIds)
          .limit(15);

        roster = (data ?? []).map((p) => ({
          id: p.id,
          teamIds: [],
          fullName: p.full_name,
          nickname: p.nickname,
          birthDate: p.birth_date,
          status: p.status,
        }));
      }
    }
  }

  if (roster.length === 0) {
    let session = await db.sessions.get(sessionId);
    if (!session) {
      const { data } = await supabase
        .from('sessions')
        .select('id, team_id, status, scheduled_start, session_type')
        .eq('id', sessionId)
        .maybeSingle();

      if (!data) return null;

      session = {
        id: data.id,
        teamId: data.team_id,
        status: data.status as 'scheduled' | 'active' | 'completed' | 'cancelled',
        scheduledStart: data.scheduled_start,
        sessionType: data.session_type,
      };
    }

    roster = await loadTeamPlayers(session.teamId);
  }

  const players: DrillGridPlayer[] = await Promise.all(
    roster.map(async (player) => ({
      id: player.id,
      nickname: player.nickname,
      counts: await loadPlayerCounts(sessionDrill.id, player.id),
    }))
  );

  return {
    sessionDrill,
    drillName,
    players,
    recordedBy: user.id,
  };
}

export default function DrillPage() {
  const params = useParams<{ id: string; drillId: string }>();
  const [data, setData] = useState<DrillPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void loadDrillPageData(params.id, params.drillId)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setError('Drill tidak ditemukan. Kembali ke sesi dan pilih drill lagi.');
          return;
        }
        setData(result);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Gagal memuat drill. Periksa koneksi lalu muat ulang halaman.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id, params.drillId]);

  if (loading) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <CircleNotch
          size={32}
          weight="bold"
          className="animate-spin text-[var(--color-field-text-3)]"
          aria-label="Memuat drill"
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Basketball size={28} weight="duotone" />}
          theme="field"
          title="Drill tidak tersedia"
          description={error ?? 'Drill tidak ditemukan.'}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--color-field-border)] bg-[var(--color-field-bg)]/95 px-4 py-3 backdrop-blur-sm">
        <h1 className="truncate font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-field-text)]">
          {data.drillName}
        </h1>
        <p className="mt-0.5 font-[family-name:var(--font-ui)] text-sm text-[var(--color-field-text-3)]">
          {data.players.length} pemain
        </p>
      </header>

      {data.players.length === 0 ? (
        <EmptyState
          icon={<Basketball size={28} weight="duotone" />}
          theme="field"
          title="Belum ada pemain"
          description="Assign pemain ke pos atau pastikan roster kelas sudah diunduh sebelum mulai drill."
        />
      ) : (
        <DrillGrid
          sessionDrillId={data.sessionDrill.id}
          recordedBy={data.recordedBy}
          trackMisses={data.sessionDrill.trackMisses}
          players={data.players}
        />
      )}
    </div>
  );
}
