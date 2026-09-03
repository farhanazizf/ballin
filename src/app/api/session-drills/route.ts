import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  sessionId: z.string().uuid(),
  drillId: z.string().uuid(),
  target: z.number().int().positive().optional(),
  trackMisses: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data drill sesi tidak valid.' }, { status: 400 });
  }

  const { sessionId, drillId, target, trackMisses } = parsed.data;

  const { data: existing } = await supabase
    .from('session_drills')
    .select('id, session_id, drill_id, target, track_misses, started_at')
    .eq('session_id', sessionId)
    .eq('drill_id', drillId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      id: existing.id,
      sessionId: existing.session_id,
      drillId: existing.drill_id,
      target: existing.target,
      trackMisses: existing.track_misses,
      startedAt: existing.started_at,
    });
  }

  const { data: drill } = await supabase
    .from('drills')
    .select('default_target')
    .eq('id', drillId)
    .maybeSingle();

  const { data: created, error } = await supabase
    .from('session_drills')
    .insert({
      session_id: sessionId,
      drill_id: drillId,
      target: target ?? drill?.default_target ?? null,
      track_misses: trackMisses ?? true,
      created_by: user.id,
    })
    .select('id, session_id, drill_id, target, track_misses, started_at')
    .single();

  if (error || !created) {
    return NextResponse.json({ error: 'Gagal membuat drill sesi.' }, { status: 500 });
  }

  return NextResponse.json({
    id: created.id,
    sessionId: created.session_id,
    drillId: created.drill_id,
    target: created.target,
    trackMisses: created.track_misses,
    startedAt: created.started_at,
  });
}
