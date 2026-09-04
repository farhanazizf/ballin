import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getReportById } from '@/lib/queries/reports';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });

  const report = await getReportById(supabase, id);
  if (!report) return NextResponse.json({ error: 'Rapor tidak ditemukan.' }, { status: 404 });
  return NextResponse.json(report);
}
