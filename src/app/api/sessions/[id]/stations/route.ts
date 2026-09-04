import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { saveStationsSchema } from '@/lib/validators/station';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id: sessionId } = await context.params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });
  }

  const { data: stations, error } = await supabase
    .from('session_stations')
    .select('id, label, coach_id, sort_order, station_players ( player_id )')
    .eq('session_id', sessionId)
    .order('sort_order');

  if (error) {
    return NextResponse.json({ error: 'Gagal memuat pos.' }, { status: 500 });
  }

  type StationRow = {
    id: string;
    label: string;
    coach_id: string | null;
    sort_order: number;
    station_players: Array<{ player_id: string }> | null;
  };

  return NextResponse.json({
    stations: ((stations ?? []) as StationRow[]).map((station) => ({
      id: station.id,
      label: station.label,
      coachId: station.coach_id,
      sortOrder: station.sort_order,
      playerIds: (station.station_players ?? []).map((row) => row.player_id),
    })),
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id: sessionId } = await context.params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });
  }

  const parsed = saveStationsSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data pos tidak valid.' }, { status: 400 });
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('id')
    .eq('id', sessionId)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: 'Sesi tidak ditemukan.' }, { status: 404 });
  }

  const { data: existingStations } = await supabase
    .from('session_stations')
    .select('id')
    .eq('session_id', sessionId);

  const existingIds = (existingStations ?? []).map((row) => row.id as string);

  if (existingIds.length > 0) {
    const { error: deletePlayersError } = await supabase
      .from('station_players')
      .delete()
      .in('station_id', existingIds);

    if (deletePlayersError) {
      return NextResponse.json({ error: 'Gagal memperbarui pemain pos.' }, { status: 500 });
    }

    const { error: deleteStationsError } = await supabase
      .from('session_stations')
      .delete()
      .eq('session_id', sessionId);

    if (deleteStationsError) {
      return NextResponse.json({ error: 'Gagal memperbarui pos.' }, { status: 500 });
    }
  }

  const savedStations: Array<{
    id: string;
    label: string;
    coachId: string | null;
    sortOrder: number;
    playerIds: string[];
  }> = [];

  for (const [index, station] of parsed.data.stations.entries()) {
    const { data: created, error: insertError } = await supabase
      .from('session_stations')
      .insert({
        session_id: sessionId,
        label: station.label,
        coach_id: station.coachId ?? user.id,
        sort_order: index,
      })
      .select('id, label, coach_id, sort_order')
      .single();

    if (insertError || !created) {
      return NextResponse.json({ error: 'Gagal menyimpan pos.' }, { status: 500 });
    }

    if (station.playerIds.length > 0) {
      const { error: playersError } = await supabase.from('station_players').insert(
        station.playerIds.map((playerId) => ({
          station_id: created.id,
          player_id: playerId,
        })),
      );

      if (playersError) {
        return NextResponse.json({ error: 'Gagal menetapkan pemain ke pos.' }, { status: 500 });
      }
    }

    savedStations.push({
      id: created.id,
      label: created.label,
      coachId: created.coach_id,
      sortOrder: created.sort_order,
      playerIds: station.playerIds,
    });
  }

  return NextResponse.json({ stations: savedStations });
}
