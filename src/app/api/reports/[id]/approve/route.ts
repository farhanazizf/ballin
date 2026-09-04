import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { approveReport } from '@/lib/queries/reports';
import { reportApproveSchema } from '@/lib/validators/report';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('organization_id, role').eq('id', user.id).maybeSingle();
  if (!profile?.organization_id || !['admin', 'coach'].includes(profile.role)) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  const parsed = reportApproveSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Konten rapor tidak valid.' }, { status: 400 });

  const result = await approveReport(supabase, profile.organization_id, user.id, id, parsed.data);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
